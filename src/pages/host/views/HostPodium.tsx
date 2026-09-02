import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import { ShareableRecapCard } from "../components/ShareableRecapCard";
import { SoundManager, sounds } from "../../../lib/audio";
import { Crown, Sparkles, Zap, Ghost, Download, RotateCcw } from "lucide-react";
import type { Player } from "../../../types/database";
import type { JulesAward } from "../../../lib/intelligence";

interface HostPodiumProps {
  room: {
    game_mode: "individual" | "team";
    code?: string;
  } | null;
  players: Player[];
  playerStats: Record<
    string,
    { uniqueCount: number; earlyCount: number; blankCount: number }
  >;
  awards?: { creative: JulesAward | null; funny: JulesAward | null };
  onResetGame: () => void;
}

export function HostPodium({
  room,
  players,
  playerStats,
  awards,
  onResetGame,
}: HostPodiumProps) {
  const { t } = useLocale();

  useEffect(() => {
    // Play celebratory fanfare timed with 1st place rising
    const timer = setTimeout(() => {
      SoundManager.getInstance().playSFX(sounds.FANFARE, 0.7);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getWinner = (key: "uniqueCount" | "earlyCount" | "blankCount") => {
    let max = 0;
    let pid = "";
    Object.entries(playerStats).forEach(([id, stats]) => {
      const val = Reflect.get(stats, key) as number;
      if (val > max) {
        max = val;
        pid = id;
      }
    });
    const p = players.find((x) => x.id === pid);
    return max > 0 && p ? { name: p.nickname, count: max } : null;
  };

  const uniqueW = getWinner("uniqueCount");
  const earlyW = getWinner("earlyCount");
  const blankW = getWinner("blankCount");

  type RankingItem = { name: string; score: number };
  let ranking: RankingItem[] = [];

  if (room?.game_mode === "team") {
    const teams: Record<string, number> = {};
    players.forEach((p) => {
      const t2 = p.team_name || t("podium.individual");
      teams[t2] = (teams[t2] || 0) + p.total_score;
    });
    ranking = Object.entries(teams)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);
  } else {
    ranking = [...players]
      .sort((a, b) => b.total_score - a.total_score)
      .map((p) => ({ name: p.nickname, score: p.total_score }));
  }

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("podium-container");
    if (!element) return;

    try {
      setIsGeneratingPDF(true);

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const actionButtons = document.getElementById("podium-action-buttons");
      if (actionButtons) actionButtons.style.display = "none";

      const canvas = await html2canvas(element, {
        backgroundColor: "#000000",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      if (actionButtons) actionButtons.style.display = "flex";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const date = new Date().toISOString().split("T")[0];
      pdf.save(`ALAZ-NEON-Sonuclar-${date}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <motion.div
      id="podium-container"
      key="finished"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-full w-full py-16 overflow-y-auto bg-black select-none relative"
    >
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-amber-500/15 via-alaz-orange/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Header Title */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-yellow-400">
            ŞAMPİYONLUK KÜRSÜSÜ
          </span>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight font-sans drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">
          {t("podium.title")}
        </h2>
      </motion.div>

      {/* 3D Cyber Podium Towers */}
      <div className="flex items-end justify-center w-full max-w-5xl gap-4 md:gap-6 h-[460px] border-b-2 border-white/10 relative z-10 px-4">
        
        {/* 2nd Place (Silver) */}
        {second && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "55%" }}
            transition={{ delay: 0.8, duration: 1.2, type: "spring" }}
            className="flex-1 max-w-[260px] bg-[#0d0d18]/90 backdrop-blur-3xl border-t-2 border-x-2 border-cyan-400/40 rounded-t-[2.5rem] flex flex-col items-center justify-start pt-6 relative group shadow-[0_0_30px_rgba(0,229,255,0.15)]"
          >
            <div className="absolute -top-24 text-center w-full px-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center mx-auto mb-2 text-cyan-300 font-mono font-black text-sm shadow-md">
                2
              </div>
              <div className="text-xl md:text-2xl font-black text-white truncate max-w-[220px] mx-auto tracking-wide">
                {second.name}
              </div>
              <div className="text-base font-mono font-bold text-cyan-400 mt-0.5">
                {second.score} PUAN
              </div>
            </div>
            <div className="text-5xl font-black font-mono text-cyan-400/20 mt-4">2</div>
          </motion.div>
        )}

        {/* 1st Place (Gold / Champion) */}
        {first && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "80%" }}
            transition={{ delay: 1.4, duration: 1.5, type: "spring", stiffness: 75 }}
            className="flex-1 max-w-[300px] bg-gradient-to-b from-[#1c1808]/95 to-[#0e0e18]/95 backdrop-blur-3xl border-t-2 border-x-2 border-yellow-400 rounded-t-[2.5rem] flex flex-col items-center justify-start pt-8 relative z-20 shadow-[0_-20px_60px_rgba(234,179,8,0.3)]"
          >
            <div className="absolute -top-32 text-center w-full px-2">
              <div className="w-14 h-14 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-bounce" />
              </div>
              <div className="text-2xl md:text-4xl font-black text-white truncate max-w-[260px] mx-auto tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                {first.name}
              </div>
              <div className="text-xl font-mono font-black text-yellow-400 mt-1 drop-shadow-md">
                {first.score} PUAN
              </div>
            </div>
            <div className="text-7xl font-black font-mono text-yellow-400/30 mt-6">1</div>
          </motion.div>
        )}

        {/* 3rd Place (Bronze) */}
        {third && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "40%" }}
            transition={{ delay: 0.4, duration: 1, type: "spring" }}
            className="flex-1 max-w-[260px] bg-[#0d0d18]/90 backdrop-blur-3xl border-t-2 border-x-2 border-amber-600/40 rounded-t-[2.5rem] flex flex-col items-center justify-start pt-6 relative shadow-[0_0_25px_rgba(217,119,6,0.15)]"
          >
            <div className="absolute -top-24 text-center w-full px-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-600/50 flex items-center justify-center mx-auto mb-2 text-amber-400 font-mono font-black text-sm shadow-md">
                3
              </div>
              <div className="text-lg md:text-xl font-black text-white/90 truncate max-w-[220px] mx-auto tracking-wide">
                {third.name}
              </div>
              <div className="text-sm font-mono font-bold text-amber-500 mt-0.5">
                {third.score} PUAN
              </div>
            </div>
            <div className="text-4xl font-black font-mono text-amber-600/20 mt-4">3</div>
          </motion.div>
        )}

      </div>

      {/* Recap Card */}
      {awards && (awards.creative || awards.funny) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-12 w-full max-w-md flex justify-center relative z-10"
        >
          <ShareableRecapCard awards={awards} roomCode={room?.code} />
        </motion.div>
      )}

      {/* Nightlife Awards (Gecenin Enleri) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="mt-16 w-full max-w-5xl px-4 relative z-10"
      >
        <h3 className="text-center text-xs font-mono font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">
          {t("podium.awardsTitle")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Creative Award */}
          <div className="bg-[#0d0d18]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:border-cyan-400/40">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-3 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
              {t("podium.creativeTitle")}
            </h4>
            <p className="text-gray-400 text-xs font-medium mb-4">
              {t("podium.creativeDesc")}
            </p>
            {uniqueW ? (
              <>
                <div className="text-xl font-black text-cyan-300 truncate w-full px-2 tracking-wide font-mono">
                  {uniqueW.name}
                </div>
                <div className="text-gray-400 font-mono text-[11px] mt-1 uppercase">
                  {uniqueW.count} {t("podium.creativeCount")}
                </div>
              </>
            ) : (
              <div className="text-gray-500 italic text-xs">
                {t("podium.creativeNone")}
              </div>
            )}
          </div>

          {/* Speed Award */}
          <div className="bg-[#0d0d18]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:border-alaz-orange/40">
            <div className="w-12 h-12 rounded-2xl bg-alaz-orange/10 border border-alaz-orange/30 flex items-center justify-center mb-3 text-alaz-orange">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
              {t("podium.speedTitle")}
            </h4>
            <p className="text-gray-400 text-xs font-medium mb-4">
              {t("podium.speedDesc")}
            </p>
            {earlyW ? (
              <>
                <div className="text-xl font-black text-alaz-orange truncate w-full px-2 tracking-wide font-mono">
                  {earlyW.name}
                </div>
                <div className="text-gray-400 font-mono text-[11px] mt-1 uppercase">
                  {earlyW.count} {t("podium.speedCount")}
                </div>
              </>
            ) : (
              <div className="text-gray-500 italic text-xs">
                {t("podium.speedNone")}
              </div>
            )}
          </div>

          {/* Ghost Award */}
          <div className="bg-[#0d0d18]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:border-purple-400/40">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center mb-3 text-purple-400">
              <Ghost className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
              {t("podium.ghostTitle")}
            </h4>
            <p className="text-gray-400 text-xs font-medium mb-4">
              {t("podium.ghostDesc")}
            </p>
            {blankW ? (
              <>
                <div className="text-xl font-black text-purple-300 truncate w-full px-2 tracking-wide font-mono">
                  {blankW.name}
                </div>
                <div className="text-gray-400 font-mono text-[11px] mt-1 uppercase">
                  {blankW.count} {t("podium.ghostCount")}
                </div>
              </>
            ) : (
              <div className="text-gray-500 italic text-xs">
                {t("podium.ghostNone")}
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        id="podium-action-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-4 mb-16 relative z-20 px-4"
      >
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="px-8 py-4 bg-white/5 hover:bg-white/15 border border-white/15 text-white font-black text-xs rounded-2xl transition-all uppercase tracking-widest disabled:opacity-50 flex items-center gap-2.5 active:scale-95"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>{isGeneratingPDF ? "PDF HAZIRLANIYOR..." : "PDF İNDİR"}</span>
        </button>

        <button
          onClick={onResetGame}
          className="px-10 py-4 bg-white text-black hover:bg-gray-200 font-black text-xs rounded-2xl transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-2.5 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-black" />
          <span>{t("podium.newGame")}</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
