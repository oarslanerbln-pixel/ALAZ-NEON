import { motion, LayoutGroup } from "framer-motion";
import { NeonIcon } from "../../../components/NeonIcon";
import { Badge } from "../../../components/Badge";
import { useLocale } from "../../../hooks/useLocale";
import type { Player, RoundResultInfo } from "../../../types/database";

function CognitiveAnalytics({ results }: { results: RoundResultInfo[] }) {
  const { t } = useLocale();
  const avgAccuracy =
    results.length > 0
      ? Math.round(
          (results.reduce(
            (acc, r) =>
              acc + Object.values(r.answers).filter((a) => a.isValid).length,
            0,
          ) /
            (results.length * (Object.keys(results[0].answers).length || 1))) *
            100,
        )
      : 0;

  const uniqueDensity =
    results.length > 0
      ? Math.round(
          (results.reduce(
            (acc, r) =>
              acc +
              Object.values(r.answers).filter((a) => a.isUnique && a.isValid)
                .length,
            0,
          ) /
            results.length) *
            10,
        ) / 10
      : 0;

  return (
    <div className="grid grid-cols-3 gap-6 mb-10">
      <div className="bg-black/80 p-6 border-t-2 border-alaz-orange relative overflow-hidden group rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-b from-alaz-orange/20 to-transparent -z-10" />
        <span className="text-[11px] text-alaz-orange font-black uppercase tracking-[0.3em] block mb-2 opacity-80">
          {t("review.cognitiveAccuracy")}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">%{avgAccuracy}</span>
          <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
            {t("review.groupAverage")}
          </span>
        </div>
      </div>
      <div className="bg-black/80 p-6 border-t-2 border-neon-blue relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-none">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/20 to-transparent -z-10" />
        <span className="text-[11px] text-neon-blue font-black uppercase tracking-[0.3em] block mb-2 opacity-80">
          {t("review.originalityDensity")}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {uniqueDensity}
          </span>
          <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
            {t("review.uniquePerPlayer")}
          </span>
        </div>
      </div>
      <div className="bg-black/80 p-6 border-t-2 border-white/40 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-none">
        <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] block mb-2 opacity-80">
          {t("review.mentalPerformance")}
        </span>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            %{Math.round((avgAccuracy + uniqueDensity * 20) / 1.5)}
          </span>
          <div className="flex-1 h-1 bg-white/10 rounded-none overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (avgAccuracy + uniqueDensity * 20) / 1.5)}%`,
              }}
              className="h-full bg-white shadow-[0_0_15px_#fff]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface HostReviewProps {
  room: {
    current_round: number;
    categories: string[];
    game_mode: "individual" | "team";
    active_letter?: string;
    total_rounds: number;
  } | null;
  isAnalyzing: boolean;
  roundResults: RoundResultInfo[];
  players: Player[];
  currentLetter: string;
  onToggleAnswer: (playerId: string, category: string) => void;
  onNextStep: () => void;
}

export function HostReview({
  room,
  isAnalyzing,
  roundResults,
  players,
  currentLetter,
  onToggleAnswer,
  onNextStep,
}: HostReviewProps) {
  const { t } = useLocale();
  if (isAnalyzing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-32 h-32 rounded-full border-8 border-alaz-orange border-t-transparent animate-spin" />
        <div className="text-center">
          <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-2">
            {t("review.analyzing")}
          </h2>
          <p className="text-alaz-orange font-bold tracking-[0.3em] uppercase">
            {t("review.measuring")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em] text-glow-ultra-alaz mb-2">
          {t("review.roundSummary", room?.current_round || 1)}
        </h2>
        <p className="text-gray-400 text-lg uppercase font-black tracking-widest">
          {t("review.systemAnalyzed")}
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6">
        <CognitiveAnalytics results={roundResults} />
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden w-full max-w-7xl mx-auto pb-10">
        {/* Leaderboard */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2 sticky top-0 bg-dark-bg/80 backdrop-blur-md py-2 z-10 w-full">
            {room?.game_mode === "team"
              ? t("review.teamRanking")
              : t("review.overallRanking")}
          </h3>
          <LayoutGroup>
            {(() => {
              if (room?.game_mode === "team") {
                const teamScores: Record<
                  string,
                  { team: string; total: number; round: number }
                > = {};
                players.forEach((p) => {
                  const team = p.team_name || t("podium.individual");
                  if (!teamScores[team])
                    teamScores[team] = { team, total: 0, round: 0 };
                  teamScores[team].total += p.total_score;

                  const rRes = roundResults.find((r) => r.playerId === p.id);
                  if (rRes) teamScores[team].round += rRes.roundScore;
                });

                return Object.values(teamScores)
                  .sort((a, b) => b.total - a.total)
                  .map((team, i) => (
                    <motion.div
                      key={team.team}
                      layout
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`p-5 rounded-sm border transition-colors ${
                        i === 0
                          ? "bg-alaz-orange/10 border-alaz-orange shadow-lg"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-black text-white">
                          #{i + 1} {team.team}
                        </span>
                        <span
                          className={`text-4xl font-black ${i === 0 ? "text-alaz-orange" : "text-gray-300"}`}
                        >
                          {team.total}
                        </span>
                      </div>
                      <div className="text-[11px] font-black tracking-widest text-green-400 text-right uppercase">
                        {t("review.thisRound", team.round)}
                      </div>
                    </motion.div>
                  ));
              }

              return [...players]
                .sort((a, b) => b.total_score - a.total_score)
                .map((p, i) => {
                  const rRes = roundResults.find((r) => r.playerId === p.id);

                  // Determine Badges & Persona
                  const hasEarlyBonus = rRes?.earlyBonus;
                  const isTop = i === 0;
                  const persona = rRes?.persona;

                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`p-5 rounded-none border-[0.5px] transition-all ${
                        isTop
                          ? "bg-alaz-orange/5 border-alaz-orange/50 border-l-4 border-l-alaz-orange"
                          : "bg-black/60 border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isTop ? "text-alaz-orange" : "text-gray-500"}`}
                          >
                            {t("review.rank", i + 1)}
                          </span>
                          <span className="text-2xl font-black text-white">
                            {p.nickname}
                          </span>
                        </div>
                        <span
                          className={`text-4xl font-black ${isTop ? "text-glow-alaz text-white" : "text-gray-400"}`}
                        >
                          {p.total_score}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {persona === "Sprinter" && (
                          <Badge
                            type="speed"
                            label={t("review.persona.sprinter")}
                            size="sm"
                          />
                        )}
                        {persona === "Innovator" && (
                          <Badge
                            type="unique"
                            label={t("review.persona.innovator")}
                            size="sm"
                          />
                        )}
                        {persona === "Sniper" && (
                          <Badge
                            type="clean"
                            label={t("review.persona.sniper")}
                            size="sm"
                          />
                        )}
                        {persona === "Strategist" && (
                          <Badge
                            type="clean"
                            label={t("review.persona.strategist")}
                            size="sm"
                          />
                        )}
                        {persona === "Ghost" && (
                          <Badge
                            type="clean"
                            label={t("review.persona.ghost")}
                            size="sm"
                          />
                        )}
                        {hasEarlyBonus && (
                          <Badge
                            type="speed"
                            label={t("review.silverBullet")}
                            size="sm"
                          />
                        )}
                      </div>

                      {rRes && (
                        <div className="text-[11px] font-black tracking-widest text-green-400 text-right uppercase mt-4">
                          TUR: {t("review.points", rRes.roundScore)}
                        </div>
                      )}
                    </motion.div>
                  );
                });
            })()}
          </LayoutGroup>
        </div>

        {/* Answers Breakdown */}
        <div className="w-2/3 bg-black/40 p-8 border border-white/5 flex flex-col relative overflow-hidden rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-alaz-orange/10 blur-[150px] pointer-events-none" />
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 relative z-10">
            {t("review.categoryAnalysis")}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar relative z-10">
            {(room?.categories || []).map((cat, catIdx) => (
              <div key={cat} className="space-y-3">
                <h4 className="text-alaz-orange font-black text-lg uppercase tracking-tight pb-2 border-b border-white/10 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-alaz-orange/20 flex items-center justify-center text-[10px]">
                    {catIdx + 1}
                  </span>
                  {cat}
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {roundResults.map((res) => {
                    const ans = res.answers[cat];
                    const isRejected = !ans?.isValid;
                    return (
                      <motion.div
                        key={res.playerId}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onToggleAnswer(res.playerId, cat)}
                        className={`p-5 rounded-none border cursor-pointer transition-all duration-300 relative overflow-hidden group/ans
                                                                            ${
                                                                              !isRejected
                                                                                ? ans.isUnique
                                                                                  ? "border-green-500 bg-green-500/10 shadow-[inset_4px_0_0_rgba(34,197,94,1)]"
                                                                                  : "border-white/10 bg-black/80 shadow-[inset_4px_0_0_rgba(255,255,255,0.2)] hover:border-white/30"
                                                                                : "border-red-500/40 bg-red-950/40 grayscale-[0.5] shadow-[inset_4px_0_0_rgba(239,68,68,0.5)]"
                                                                            }`}
                      >
                        {/* Reject Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/ans:opacity-100 flex items-center justify-center transition-opacity z-10">
                          <span className="text-xs font-black tracking-widest text-white uppercase bg-red-600 px-4 py-2 rounded-sm shadow-lg border border-red-400">
                            {isRejected
                              ? t("review.approve")
                              : t("review.reject")}
                          </span>
                        </div>

                        <div className="text-[11px] text-alaz-orange font-black uppercase tracking-widest mb-1 truncate">
                          {res.name}
                        </div>
                        <div
                          className={`text-2xl font-black mb-2 truncate tracking-tight ${
                            isRejected
                              ? "text-gray-500 line-through decoration-red-500/80 decoration-4"
                              : "text-white"
                          }`}
                        >
                          {ans?.value || (
                            <span className="text-red-500/50 text-sm italic">
                              {t("review.empty")}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs font-black uppercase flex items-center gap-1.5 mt-2 ${
                            ans?.isJoker 
                              ? ans.isValid ? "text-alaz-orange" : "text-red-500"
                              : !isRejected
                                ? ans.isUnique
                                  ? "text-green-400"
                                  : "text-white"
                                : "text-red-400"
                          }`}
                        >
                          {ans?.isJoker && (
                            <span className="bg-alaz-orange/20 text-alaz-orange px-1 rounded-sm border border-alaz-orange/30 mr-1 animate-pulse">
                              JOKER
                            </span>
                          )}
                          {!isRejected ? (
                            <>
                              <div className={`w-1.5 h-1.5 rounded-full ${ans?.isJoker ? 'bg-alaz-orange' : 'bg-current'} animate-pulse`} />
                              {ans.points > 0 ? '+' : ''}{ans.points} {t("review.points", ans.points)}{" "}
                              {ans.isUnique ? t("review.uniqueBonus") : ""}
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              {ans?.isJoker ? (
                                <span className="text-red-500">
                                  -10 PUAN CEZASI
                                </span>
                              ) : (
                                ans?.value &&
                                ans.value
                                  .toLowerCase()
                                  .startsWith(
                                    (
                                      room?.active_letter || currentLetter
                                    ).toLowerCase(),
                                  )
                                  ? t("review.hostRejected")
                                  : t("review.invalidLetter")
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Early bonus section */}
            {roundResults.some((r) => r.earlyBonus) && (
              <div className="mt-6 p-4 rounded-sm border border-neon-blue bg-neon-blue/10 flex items-center gap-4">
                <NeonIcon
                  type="rocket"
                  color="blue"
                  className="w-8 h-8 animate-beat"
                />
                <div>
                  <h4 className="text-neon-blue font-black tracking-widest uppercase">
                    {t("review.speedBonusTitle")}
                  </h4>
                  <p className="text-white text-sm font-bold">
                    {t(
                      "review.speedBonusDesc",
                      roundResults.find((r) => r.earlyBonus)?.name || "",
                    )}{" "}
                    <span className="text-neon-blue">
                      {t("review.points", 15)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 relative z-10 flex justify-end">
            <motion.button
              onClick={onNextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-6 bg-alaz-orange text-black font-black text-2xl rounded-none uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,77,0,0.4)] transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
            >
              {room!.current_round >= room!.total_rounds
                ? t("review.seeResults")
                : t("review.nextRound")}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
