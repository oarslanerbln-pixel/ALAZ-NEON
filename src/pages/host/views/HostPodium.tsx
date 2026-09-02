import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import { ShareableRecapCard } from "../components/ShareableRecapCard";
import { SoundManager, sounds } from "../../../lib/audio";
import { ConfettiCanvas, type ConfettiCanvasRef } from "../../../components/ConfettiCanvas";
import { AnimatedNumber } from "../../../components/AnimatedNumber";
import { DURATION, EASE, SPRING, STAGGER, TWEEN, listItem } from "../../../lib/motion";
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

/** Açılış sırası (sn): 3. → 2. → 1. — gerilim tırmanır, şampiyon en son. */
const REVEAL_DELAY = { 3: 0.4, 2: 1.2, 1: 2.2 } as const;
const T_FANFARE = REVEAL_DELAY[1];
const T_CONFETTI = REVEAL_DELAY[1] + 0.25;

type Place = 1 | 2 | 3;

interface PillarProps {
  place: Place;
  name: string;
  score: number;
}

const PLACE_STYLE: Record<Place, { width: string; height: string; pillar: string; name: string; score: string; number: string; edge: string }> = {
  1: {
    width: "w-72",
    height: "70%",
    pillar: "bg-white/[0.08] backdrop-blur-3xl border-t border-x border-white/20 shadow-[0_-20px_60px_rgba(255,230,0,0.08)]",
    name: "text-3xl md:text-4xl font-medium text-white tracking-[0.1em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    score: "text-2xl font-light text-white mt-2",
    number: "text-5xl md:text-6xl lg:text-7xl font-thin text-white/40 mt-6",
    edge: "from-yellow-200/70 via-yellow-400/40 to-transparent",
  },
  2: {
    width: "w-64",
    height: "50%",
    pillar: "bg-white/[0.03] backdrop-blur-3xl border-t border-x border-white/10",
    name: "text-3xl font-light text-white tracking-widest",
    score: "text-xl font-light text-white/50 mt-1",
    number: "text-4xl md:text-5xl font-thin text-white/20 mt-4",
    edge: "from-slate-200/60 via-slate-300/30 to-transparent",
  },
  3: {
    width: "w-64",
    height: "35%",
    pillar: "bg-white/[0.02] backdrop-blur-3xl border-t border-x border-white/5",
    name: "text-2xl font-light text-white/80 tracking-widest",
    score: "text-lg font-light text-white/40 mt-1",
    number: "text-3xl md:text-4xl font-thin text-white/10 mt-4",
    edge: "from-orange-300/50 via-orange-400/25 to-transparent",
  },
};

/**
 * Podyum sütunu. `height` animasyonu (her karede layout) yerine sütun sabit
 * yükseklikte durur ve `translateY` ile aşağıdan yükselir; kapsayıcı sahne
 * çizgisinin altını kırpar. Şampiyon sütunu oturunca kısa bir ölçek nabzı atar.
 */
function Pillar({ place, name, score }: PillarProps) {
  const s = PLACE_STYLE[place];
  const delay = REVEAL_DELAY[place];
  const isWinner = place === 1;

  return (
    <div className={`relative h-full flex flex-col justify-end overflow-hidden px-6 -mx-6 z-10 ${s.width}`}>
      <motion.div
        initial={{ y: "115%", opacity: 0 }}
        animate={{ y: 0, opacity: 1, scale: isWinner ? [1, 1, 1.03, 1] : 1 }}
        transition={{
          y: { ...SPRING.gentle, delay },
          opacity: { duration: DURATION.base, delay },
          scale: { duration: 0.7, delay: delay + 0.55, ease: EASE.inOut, times: [0, 0.2, 0.6, 1] },
        }}
        style={{ height: s.height, originY: 1 }}
        className={`relative w-full rounded-t-3xl flex flex-col items-center justify-start pt-8 will-change-transform ${s.pillar}`}
      >
        {/* Madalya rengi üst kenar ışığı */}
        <div aria-hidden="true" className={`absolute top-0 inset-x-0 h-24 rounded-t-3xl bg-gradient-to-b ${s.edge} pointer-events-none`} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TWEEN.enter, delay: delay + 0.35 }}
          className={`absolute ${isWinner ? "-top-32" : "-top-20"} text-center w-full`}
        >
          <div className={`truncate max-w-[280px] px-2 mx-auto ${s.name}`}>{name}</div>
          <div className={`tracking-widest ${s.score}`}>
            <AnimatedNumber from={0} value={score} delay={delay + 0.4} duration={1} />
          </div>
        </motion.div>

        <div className={s.number}>{place}</div>
      </motion.div>
    </div>
  );
}

export function HostPodium({
  room,
  players,
  playerStats,
  awards,
  onResetGame,
}: HostPodiumProps) {
  const { t } = useLocale();
  const confettiRef = useRef<ConfettiCanvasRef>(null);

  useEffect(() => {
    // Fanfar 1. sıranın yükselişiyle, konfeti oturduğu anda; ikinci dalga kutlamayı sürdürür
    const sfx = setTimeout(() => SoundManager.getInstance().playSFX(sounds.FANFARE, 0.7), T_FANFARE * 1000);
    const c1 = setTimeout(() => confettiRef.current?.celebrationCannon(), T_CONFETTI * 1000);
    const c2 = setTimeout(() => confettiRef.current?.celebrationCannon(), (T_CONFETTI + 0.9) * 1000);
    return () => {
      clearTimeout(sfx);
      clearTimeout(c1);
      clearTimeout(c2);
    };
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

  const awardCards = [
    { title: t("podium.creativeTitle"), desc: t("podium.creativeDesc"), winner: uniqueW, countLabel: t("podium.creativeCount"), none: t("podium.creativeNone") },
    { title: t("podium.speedTitle"), desc: t("podium.speedDesc"), winner: earlyW, countLabel: t("podium.speedCount"), none: t("podium.speedNone") },
    { title: t("podium.ghostTitle"), desc: t("podium.ghostDesc"), winner: blankW, countLabel: t("podium.ghostCount"), none: t("podium.ghostNone") },
  ];

  return (
    <motion.div
      id="podium-container"
      key="finished"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={TWEEN.screen}
      className="flex flex-col items-center justify-center min-h-full w-full py-20 overflow-y-auto bg-black"
    >
      <ConfettiCanvas ref={confettiRef} autoCannon={false} />

      <motion.h2
        initial={{ y: -40, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ ...SPRING.gentle, delay: 0.2 }}
        className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-20 uppercase tracking-[0.3em]"
      >
        {t("podium.title")}
      </motion.h2>

      <div className="flex items-end justify-center w-full max-w-4xl gap-4 h-[450px] border-b-2 border-white/10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-alaz-orange/5 to-transparent pointer-events-none" />

        {/* Şampiyon spot ışığı: dönen konik gradyan, 1. sıra yükselince belirir */}
        {first && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.cinematic, delay: REVEAL_DELAY[1] + 0.3 }}
            className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[1100px] h-[1100px] rounded-full podium-spotlight pointer-events-none z-0"
          />
        )}

        {second && <Pillar place={2} name={second.name} score={second.score} />}
        {first && <Pillar place={1} name={first.name} score={first.score} />}
        {third && <Pillar place={3} name={third.name} score={third.score} />}
      </div>

      {/* RECAP CARD MOVED OUT OF PODIUM TO PREVENT OVERLAP */}
      {awards && (awards.creative || awards.funny) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TWEEN.enter, delay: 3 }}
          className="mt-12 w-full max-w-md flex justify-center"
        >
          <ShareableRecapCard awards={awards} roomCode={room?.code} />
        </motion.div>
      )}

      {/* OYUNUN ENLERI (AWARDS) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TWEEN.enter, delay: 3.4 }}
        className="mt-16 w-full max-w-4xl"
      >
        <h3 className="text-center text-xs font-light text-white/40 uppercase tracking-[0.4em] mb-8">
          {t("podium.awardsTitle")}
        </h3>
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: STAGGER.base, delayChildren: 3.6 } } }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {awardCards.map((card) => (
            <motion.div
              key={card.title}
              variants={listItem}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-colors hover:bg-white/[0.04]"
            >
              <h4 className="text-white font-medium text-sm uppercase tracking-widest mb-1">{card.title}</h4>
              <p className="text-white/40 text-[10px] font-light uppercase tracking-widest mb-6">{card.desc}</p>
              {card.winner ? (
                <>
                  <div className="text-2xl font-light text-white truncate w-full px-2 mx-auto tracking-wider">
                    {card.winner.name}
                  </div>
                  <div className="text-white/60 font-light text-xs mt-2 uppercase tracking-widest tabular-nums">
                    {card.winner.count} {card.countLabel}
                  </div>
                </>
              ) : (
                <div className="text-white/30 font-light italic text-sm">{card.none}</div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        id="podium-action-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.slow, delay: 4.6 }}
        className="mt-16 flex items-center justify-center gap-6 mb-20 relative z-20"
      >
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="px-8 py-4 border border-white/20 hover:bg-white/5 text-white/80 font-medium rounded-full transition-colors uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
        >
          {isGeneratingPDF ? "PDF HAZIRLANIYOR..." : "PDF İNDİR"}
        </button>
        <motion.button
          onClick={onResetGame}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING.stiff}
          className="px-12 py-4 bg-white hover:bg-gray-200 text-black font-medium rounded-full transition-colors uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          {t("podium.newGame")}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
