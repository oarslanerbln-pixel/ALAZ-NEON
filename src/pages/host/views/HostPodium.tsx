import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import { ShareableRecapCard } from "../components/ShareableRecapCard";
import { SoundManager, sounds } from "../../../lib/audio";
import { playGermanVoiceover } from "../../../lib/germanVoiceover";
import { ConfettiCanvas, type ConfettiCanvasRef } from "../../../components/ConfettiCanvas";
import { DURATION, EASE, TWEEN } from "../../../lib/motion";
import { NumberTicker } from "../../../components/fx";
import type { Player } from "../../../types/database";
import type { JulesAward } from "../../../lib/intelligence";
import { PARTICIPATION_POINTS, TEAM_WIN_POINTS, placementPointsByScore } from "../../../lib/nightLeague";

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
  /** Bu oyundan kazanılan gecelik lig puanı (lib/nightLeague ile aynı hesap). */
  night?: number;
}

const PILLAR_HEIGHT: Record<Place, string> = { 1: "h-[300px]", 2: "h-[230px]", 3: "h-[180px]" };

/**
 * Podyum sütunu: sabit yükseklikte durur, `translateY` ile aşağıdan yükselir
 * (her karede layout yok); kapsayıcı sahne çizgisinin altını kırpar.
 */
function Pillar({ place, name, score, night }: PillarProps) {
  const { t } = useLocale();
  const delay = REVEAL_DELAY[place];
  const isWinner = place === 1;

  return (
    <div className="flex flex-col items-center justify-end w-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TWEEN.enter, delay: delay + 0.2 }}
        className="text-center w-full mb-4"
      >
        <div className={`truncate px-2 font-extrabold text-ink ${isWinner ? "text-6xl" : "text-4xl"}`}>{name}</div>
        <div className={`mt-1 font-semibold tabular-nums ${isWinner ? "text-4xl text-accent" : "text-3xl text-ink-2"}`}>
          <NumberTicker value={score} delay={delay + 0.3} duration={1} />
        </div>
        {night !== undefined && night > 0 && (
          <div className="mt-2 text-2xl text-ink-3 tabular-nums">{t("podium.nightPoints", night)}</div>
        )}
      </motion.div>
      <div className="w-full overflow-hidden">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE.out, delay }}
          className={`w-full rounded-t-3xl flex items-start justify-center pt-6 ${PILLAR_HEIGHT[place]} ${
            isWinner ? "bg-accent/15 border-t-2 border-x-2 border-accent" : "bg-surface border-t border-x border-line"
          }`}
        >
          <span className={`text-6xl font-extrabold tabular-nums ${isWinner ? "text-accent" : "text-ink-3"}`}>{place}</span>
        </motion.div>
      </div>
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
    // Açılış Almanca anonsu
    playGermanVoiceover("podium_reveal", 0.9);

    // Fanfar 1. sıranın yükselişiyle, konfeti oturduğu anda; ikinci dalga kutlamayı sürdürür
    const sfx = setTimeout(() => SoundManager.getInstance().playSFX(sounds.FANFARE, 0.7), T_FANFARE * 1000);
    const champVo = setTimeout(() => playGermanVoiceover("champion_announce", 0.95), (T_FANFARE + 0.6) * 1000);
    const c1 = setTimeout(() => confettiRef.current?.celebrationCannon(), T_CONFETTI * 1000);
    const c2 = setTimeout(() => confettiRef.current?.celebrationCannon(), (T_CONFETTI + 0.9) * 1000);
    return () => {
      clearTimeout(sfx);
      clearTimeout(champVo);
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

  // `night`: oyun bitince gecelik lige yazılan puan — misafir sıranın
  // gecenin geneline ne kattığını podyumda görsün.
  type RankingItem = { name: string; score: number; night?: number };
  let ranking: RankingItem[] = [];

  if (room?.game_mode === "team") {
    const teams: Record<string, number> = {};
    players.forEach((p) => {
      const t2 = p.team_name || t("podium.individual");
      teams[t2] = (teams[t2] || 0) + p.total_score;
    });
    ranking = Object.entries(teams)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .map((item, i) => ({ ...item, night: i === 0 && item.score > 0 ? TEAM_WIN_POINTS : PARTICIPATION_POINTS }));
  } else {
    const night = placementPointsByScore(players.map((p) => ({ id: p.id, score: p.total_score || 0 })));
    ranking = [...players]
      .sort((a, b) => b.total_score - a.total_score)
      .map((p) => ({ name: p.nickname, score: p.total_score, night: night[p.id] }));
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
      // birden fazla oyun modu (Klasik/Quiz/Bomba) tarafından paylaşıldığı
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
      pdf.save(`HENGAME-Sonuclar-${date}.pdf`);
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
      className="flex flex-col items-center justify-between h-full w-full relative select-none bg-bg"
    >
      <ConfettiCanvas ref={confettiRef} autoCannon={false} />

      <h2 className="text-6xl font-extrabold text-ink tracking-tight">{t("podium.title")}</h2>

      {/* Podyum sahnesi: 2 · 1 · 3 */}
      <div className="flex items-end justify-center gap-6 w-full border-b border-line">
        {second ? <Pillar place={2} name={second.name} score={second.score} night={second.night} /> : <div className="w-[400px]" />}
        {first && <Pillar place={1} name={first.name} score={first.score} night={first.night} />}
        {third ? <Pillar place={3} name={third.name} score={third.score} night={third.night} /> : <div className="w-[400px]" />}
      </div>

      {/* Oyunun enleri (+ varsa paylaşılabilir özet kartı) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TWEEN.enter, delay: 3 }}
        className="w-full max-w-6xl flex flex-col items-center gap-4"
      >
        {awards && (awards.creative || awards.funny) && <ShareableRecapCard awards={awards} roomCode={room?.code} />}
        <h3 className="text-2xl text-ink-2">{t("podium.awardsTitle")}</h3>
        <div className="grid grid-cols-3 gap-6 w-full">
          {awardCards.map((card) => (
            <div key={card.title} className="surface rounded-3xl px-6 py-5 text-center">
              <h4 className="text-2xl font-semibold text-ink">{card.title}</h4>
              <p className="text-2xl text-ink-3">{card.desc}</p>
              {card.winner ? (
                <p className="mt-2 text-3xl font-extrabold text-accent truncate">
                  {card.winner.name} <span className="text-2xl font-semibold text-ink-2 tabular-nums">· {card.winner.count} {card.countLabel}</span>
                </p>
              ) : (
                <p className="mt-2 text-2xl text-ink-3">{card.none}</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Personel düğmeleri */}
      <motion.div
        id="podium-action-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.slow, delay: 4 }}
        className="flex items-center justify-center gap-4 relative z-20"
      >
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="btn-secondary px-8 h-16 text-2xl disabled:opacity-50"
        >
          {isGeneratingPDF ? "PDF HAZIRLANIYOR..." : "PDF İNDİR"}
        </button>
        <button onClick={onResetGame} className="btn-primary px-12 h-16 text-2xl uppercase tracking-wide">
          {t("podium.newGame")}
        </button>
      </motion.div>
    </motion.div>
  );
}
