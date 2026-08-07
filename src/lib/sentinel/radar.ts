/**
 * Sentinel Behavioral Radar
 * Detects anomalies like superhuman typing speed (botting).
 */

const MIN_HUMAN_TYPING_SPEED_MS_PER_CHAR = 70; // e.g. 10 chars take at least 700ms
const ABSOLUTE_MIN_REACTION_TIME_MS = 300; // Human reaction time floor

export class SentinelRadar {
  // In-memory Shadowban list. Maps playerId to ban reason.
  private shadowbanList: Map<string, string> = new Map();

  // Tracks when the round actually started for speed calculations.
  private roundStartTime: number = 0;

  /**
   * Marks the exact time the round began.
   */
  startRoundTime() {
    this.roundStartTime = Date.now();
  }

  /**
   * Analyzes an incoming answer for superhuman speed.
   * Returns true if the answer is considered legitimate (human).
   * Returns false if it's considered a bot (and automatically shadowbans).
   */
  analyzeAnswerSpeed(playerId: string, answerText: string): boolean {
    // If already banned, reject silently.
    if (this.shadowbanList.has(playerId)) return false;

    // If answer is empty or very short, speed is hard to measure accurately, pass it.
    if (!answerText || answerText.length < 3) return true;

    const timeTakenMs = Date.now() - this.roundStartTime;
    const minimumPossibleTimeMs =
      ABSOLUTE_MIN_REACTION_TIME_MS +
      answerText.length * MIN_HUMAN_TYPING_SPEED_MS_PER_CHAR;

    if (timeTakenMs < minimumPossibleTimeMs) {
      console.warn(`[SENTINEL] Anomaly detected for Player ${playerId}. Time taken: ${timeTakenMs}ms for ${answerText.length} chars. (Min expected: ${minimumPossibleTimeMs}ms)`);
      this.banPlayer(playerId, "Superhuman typing speed (Bot detected)");
      return false; // Fake answer, drop it
    }

    return true; // Human
  }

  /**
   * Adds a player to the shadowban list.
   * They will remain banned for the duration of this Host session.
   */
  banPlayer(playerId: string, reason: string) {
    if (!this.shadowbanList.has(playerId)) {
      console.error(`[SENTINEL] SHADOWBAN ISSUED: Player ${playerId} - Reason: ${reason}`);
      this.shadowbanList.set(playerId, reason);
    }
  }

  /**
   * Checks if a player is currently shadowbanned.
   */
  isShadowbanned(playerId: string): boolean {
    return this.shadowbanList.has(playerId);
  }

  /**
   * Clears the shadowban list (e.g., when resetting the game).
   */
  clearRadar() {
    this.shadowbanList.clear();
    this.roundStartTime = 0;
  }
}
