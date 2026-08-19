import { normalizeTL } from "./stringUtils";
import { getSimilarity } from "./fuzzyMatch";
import { toMillis } from "./timestamps";
import type {
  Room,
  RoundResultInfo,
  Player,
  Answer,
  PlayerPersona,
  AnswerBreakdown,
} from "../types/database";

/**
 * Calculates scores for a round of answers with Fuzzy Logic and Cognitive Profiling.
 */
export function calculateRoundScores(
  room: Room,
  players: Player[],
  allAnswers: Answer[],
  activeLetter: string,
): RoundResultInfo[] {
  const locale = room.locale || "tr";
  const normalizedLetter = normalizeTL(activeLetter, locale);

  // Defensive de-dup: this function produces one result PER ANSWER DOCUMENT,
  // so if a player somehow ended up with two answer docs for the same round
  // (a double-submit race, a retry after a flaky write, etc.) they'd be
  // scored twice and would also pollute categoryCounts, wrongly costing
  // OTHER players their uniqueness bonus. Keep only each player's earliest
  // submission, mirroring the same guard already used for quiz scoring.
  const seenPlayers = new Set<string>();
  const rawAnswers = [...allAnswers]
    .sort((a, b) => toMillis(a.created_at) - toMillis(b.created_at))
    .filter((answer) => {
      if (seenPlayers.has(answer.player_id)) return false;
      seenPlayers.add(answer.player_id);
      return true;
    });

  // Count occurrences of each answer per category with FUZZY LOGIC (0.85 threshold)
  const categoryCounts: Record<string, Record<string, number>> = {};
  room.categories.forEach((cat) => {
    categoryCounts[cat] = {};
  });

  rawAnswers.forEach((answer) => {
    const ansData = answer.data as Record<string, string>;
    room.categories.forEach((cat) => {
      const val = normalizeTL(ansData[cat] || "", locale);
      if (val && val.startsWith(normalizedLetter)) {
        // Fuzzy grouping: Check if a similar word already exists in counts
        let foundKey = val;
        for (const existingVal of Object.keys(categoryCounts[cat])) {
          if (getSimilarity(val, existingVal) > 0.85) {
            foundKey = existingVal;
            break;
          }
        }
        categoryCounts[cat][foundKey] =
          (categoryCounts[cat][foundKey] || 0) + 1;
      }
    });
  });

  // Identify the player who submitted early.
  // rawAnswers is already sorted oldest-first from the de-dup step above.
  let earliestPlayerId: string | null = null;
  for (const answer of rawAnswers) {
    if (answer.data["_earlySubmit"] === "true") {
      earliestPlayerId = answer.player_id;
      break;
    }
  }

  return rawAnswers
    .map((answer) => {
      const playerInfo = players.find((p) => p.id === answer.player_id);
      if (!playerInfo) return null;

      const ansData = answer.data as Record<string, string>;
      let roundScore = 0;
      let uniqueCount = 0;
      let validCount = 0;
      const answersBreakdown: Record<string, AnswerBreakdown> = {};
      const jokerCategory = ansData["_jokerCategory"] || "";

      room.categories.forEach((cat) => {
        const valRaw = ansData[cat] || "";
        const val = normalizeTL(valRaw, locale);
        let isUnique = false;
        let pts = 0;
        let isValid = false;

        if (val && val.startsWith(normalizedLetter)) {
          isValid = true;
          validCount++;

          // Use Fuzzy logic to check uniqueness
          let fuzzyMatchKey = val;
          for (const existingVal of Object.keys(categoryCounts[cat])) {
            if (getSimilarity(val, existingVal) > 0.85) {
              fuzzyMatchKey = existingVal;
              break;
            }
          }

          if (categoryCounts[cat][fuzzyMatchKey] === 1) {
            isUnique = true;
            uniqueCount++;
            pts = 20;
          } else {
            pts = 10;
          }
        }

        // Apply Joker Logic
        let isJoker = false;
        if (cat === jokerCategory) {
          isJoker = true;
          if (isValid) {
            pts *= 2; // Double points for correct joker
          } else {
            pts = -10; // -10 penalty for wrong/empty joker
          }
        }

        roundScore += pts;
        answersBreakdown[cat] = {
          value: valRaw,
          isUnique,
          points: pts,
          isValid,
          isJoker,
        };
      });

      const gotEarlyBonus = answer.player_id === earliestPlayerId;
      if (gotEarlyBonus) roundScore += 15;

      // --- COGNITIVE PROFILING LOGIC ---
      let persona: PlayerPersona = "Strategist";
      const accuracy = validCount / room.categories.length;

      if (gotEarlyBonus && accuracy < 0.6) persona = "Sprinter";
      else if (uniqueCount >= 2) persona = "Innovator";
      else if (accuracy === 1.0) persona = "Sniper";
      else if (validCount === 0) persona = "Ghost";

      return {
        playerId: playerInfo.id,
        name: playerInfo.nickname,
        teamName: playerInfo.team_name,
        roundScore,
        totalScore: playerInfo.total_score + roundScore,
        answers: answersBreakdown,
        earlyBonus: gotEarlyBonus,
        persona,
      };
    })
    .filter((res) => res !== null) as RoundResultInfo[];
}
