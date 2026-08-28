import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import { ShareableRecapCard } from "../components/ShareableRecapCard";
import { SoundManager, sounds } from "../../../lib/audio";
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

      // html2canvas + jsPDF sadece bu butona basılınca lazım oluyor ama
      // eskiden dosyanın en tepesinde statik import edilmişlerdi. HostPodium
      // üç farklı oyun modu (Klasik/Bomba/Sensör) tarafından paylaşıldığı
      // için bu, üçünün de tek bir ~600KB'lık paylaşılan pakete (yalnızca bu
      // iki kütüphane yüzünden) bağımlı kalmasına yol açıyordu — podyum
      // ekranını sadece GÖRMEK için bile o paket indiriliyordu. Dinamik
      // import ile bu ağırlık yalnızca "PDF İndir"e gerçekten basıldığında
      // indiriliyor.
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Temporarily hide buttons to exclude from PDF
      const actionButtons = document.getElementById("podium-action-buttons");
      if (actionButtons) actionButtons.style.display = "none";

      const canvas = await html2canvas(element, {
        backgroundColor: "#000000",
        scale: 2, // higher resolution
        useCORS: true,
        logging: false,
      });

      // Restore buttons
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
      className="flex flex-col items-center justify-center min-h-full w-full py-20 overflow-y-auto bg-black"
    >
      <motion.h2
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
        className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-20 uppercase tracking-[0.3em]"
      >
        {t("podium.title")}
      </motion.h2>

      <div className="flex items-end justify-center w-full max-w-4xl gap-4 h-[450px] border-b-2 border-white/10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-alaz-orange/5 to-transparent pointer-events-none" />

        {/* 2nd Place */}
        {second && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "50%" }}
            transition={{ delay: 1, duration: 1.2, type: "spring" }}
            className="w-64 bg-white/[0.03] backdrop-blur-3xl border-t border-x border-white/10 rounded-t-3xl flex flex-col items-center justify-start pt-8 relative group"
          >
            <div className="absolute -top-20 text-center w-full">
              <div className="text-3xl font-light text-white truncate max-w-[240px] px-2 mx-auto tracking-widest">
                {second.name}
              </div>
              <div className="text-xl font-light text-white/50 mt-1 tracking-widest">
                {second.score}
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-thin text-white/20 mt-4">2</div>
          </motion.div>
        )}

        {/* 1st Place */}
        {first && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "70%" }}
            transition={{ delay: 1.5, duration: 1.5, type: "spring", stiffness: 80 }}
            className="w-72 bg-white/[0.08] backdrop-blur-3xl border-t border-x border-white/20 rounded-t-3xl flex flex-col items-center justify-start pt-8 relative z-10 shadow-[0_-20px_60px_rgba(255,255,255,0.05)]"
          >
            <div className="absolute -top-32 text-center w-full">
              <div className="text-3xl md:text-4xl font-medium text-white truncate max-w-[280px] px-2 mx-auto tracking-[0.1em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {first.name}
              </div>
              <div className="text-2xl font-light text-white mt-2 tracking-widest">
                {first.score}
              </div>
            </div>
            <div className="text-5xl md:text-6xl lg:text-7xl font-thin text-white/40 mt-6">
              1
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {third && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "35%" }}
            transition={{ delay: 0.5, duration: 1, type: "spring" }}
            className="w-64 bg-white/[0.02] backdrop-blur-3xl border-t border-x border-white/5 rounded-t-3xl flex flex-col items-center justify-start pt-8 relative"
          >
            <div className="absolute -top-20 text-center w-full">
              <div className="text-2xl font-light text-white/80 truncate max-w-[240px] px-2 mx-auto tracking-widest">
                {third.name}
              </div>
              <div className="text-lg font-light text-white/40 mt-1 tracking-widest">
                {third.score}
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-thin text-white/10 mt-4">3</div>
          </motion.div>
        )}

      </div>

      {/* RECAP CARD MOVED OUT OF PODIUM TO PREVENT OVERLAP */}
      {awards && (awards.creative || awards.funny) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-12 w-full max-w-md flex justify-center"
        >
          <ShareableRecapCard awards={awards} roomCode={room?.code} />
        </motion.div>
      )}

      {/* OYUNUN ENLERI (AWARDS) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="mt-16 w-full max-w-4xl"
      >
        <h3 className="text-center text-xs font-light text-white/40 uppercase tracking-[0.4em] mb-8">
          {t("podium.awardsTitle")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mitik Yaratıcı */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-white/[0.04]">
            <h4 className="text-white font-medium text-sm uppercase tracking-widest mb-1">
              {t("podium.creativeTitle")}
            </h4>
            <p className="text-white/40 text-[10px] font-light uppercase tracking-widest mb-6">
              {t("podium.creativeDesc")}
            </p>
            {uniqueW ? (
              <>
                <div className="text-2xl font-light text-white truncate w-full px-2 mx-auto tracking-wider">
                  {uniqueW.name}
                </div>
                <div className="text-white/60 font-light text-xs mt-2 uppercase tracking-widest">
                  {uniqueW.count} {t("podium.creativeCount")}
                </div>
              </>
            ) : (
              <div className="text-white/30 font-light italic text-sm">
                {t("podium.creativeNone")}
              </div>
            )}
          </div>

          {/* Ateşin Oğlu */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-white/[0.04]">
            <h4 className="text-white font-medium text-sm uppercase tracking-widest mb-1">
              {t("podium.speedTitle")}
            </h4>
            <p className="text-white/40 text-[10px] font-light uppercase tracking-widest mb-6">
              {t("podium.speedDesc")}
            </p>
            {earlyW ? (
              <>
                <div className="text-2xl font-light text-white truncate w-full px-2 mx-auto tracking-wider">
                  {earlyW.name}
                </div>
                <div className="text-white/60 font-light text-xs mt-2 uppercase tracking-widest">
                  {earlyW.count} {t("podium.speedCount")}
                </div>
              </>
            ) : (
              <div className="text-white/30 font-light italic text-sm">
                {t("podium.speedNone")}
              </div>
            )}
          </div>

          {/* Hayalet */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-white/[0.04]">
            <h4 className="text-white font-medium text-sm uppercase tracking-widest mb-1">
              {t("podium.ghostTitle")}
            </h4>
            <p className="text-white/40 text-[10px] font-light uppercase tracking-widest mb-6">
              {t("podium.ghostDesc")}
            </p>
            {blankW ? (
              <>
                <div className="text-2xl font-light text-white truncate w-full px-2 mx-auto tracking-wider">
                  {blankW.name}
                </div>
                <div className="text-white/60 font-light text-xs mt-2 uppercase tracking-widest">
                  {blankW.count} {t("podium.ghostCount")}
                </div>
              </>
            ) : (
              <div className="text-white/30 font-light italic text-sm">
                {t("podium.ghostNone")}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        id="podium-action-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        className="mt-16 flex items-center justify-center gap-6 mb-20 relative z-20"
      >
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="px-8 py-4 border border-white/20 hover:bg-white/5 text-white/80 font-medium rounded-full transition-all uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
        >
          {isGeneratingPDF ? "PDF HAZIRLANIYOR..." : "PDF İNDİR"}
        </button>
        <button
          onClick={onResetGame}
          className="px-12 py-4 bg-white hover:bg-gray-200 text-black font-medium rounded-full transition-all uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          {t("podium.newGame")}
        </button>
      </motion.div>
    </motion.div>
  );
}
