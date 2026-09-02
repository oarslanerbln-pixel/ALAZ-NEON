import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import { upperTL } from "../../../lib/stringUtils";
import type { Player, RoundResultInfo, Room } from "../../../types/database";
import { ConfettiCanvas, type ConfettiCanvasRef } from "../../../components/ConfettiCanvas";
import { AnimatedNumber } from "../../../components/AnimatedNumber";
import { SPRING, STAGGER, TWEEN, popBouncy } from "../../../lib/motion";
import type { Variants } from "framer-motion";

interface HostStandingsProps {
  room: Room | null;
  players: Player[];
  roundResults: RoundResultInfo[];
  onNextStep: () => void;
}

// `id` kararlı React anahtarı: takma adlar benzersiz olmak zorunda değil.
type RankingItem = { id: string; name: string; score: number; roundScore: number };

/** Koreografi zamanları (sn) — tek yerde, okunabilir. */
const T_COUNT_START = 0.9; // puan sayacı başlar
const T_REORDER = 1.6; // satırlar yeni sıraya kayar
const T_CONFETTI = 2.3; // konfeti (yeni sıra oturduktan sonra)

/**
 * Variant nesneleri MODÜL SEVİYESİNDE sabit.
 *
 * Neden kritik: bunlar render içinde üretilip `transition.delay` satırın
 * `index`ine bağlandığında, satırlar yeniden sıralanırken index değişiyor,
 * framer bunu "animasyon tanımı değişti" olarak okuyup GİRİŞ animasyonunu
 * baştan çalıştırıyordu — yer değiştiren satırlar tam da kaydıkları anda
 * opacity 0'a düşüp görünmez oluyordu (tarayıcıda ölçüldü: yeniden sıralama
 * karesinde iki satır op=0, x=-24px). Kademeli gecikme artık kapsayıcıdaki
 * `staggerChildren` ile veriliyor; çocukların kendi geçişi index'ten bağımsız.
 */
const LIST_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.2 } },
};

const ROW_VARIANTS: Variants = {
  hidden: { x: -24, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: SPRING.snappy },
};

/** Tur puanı rozeti: sayaç başlarken belirir, gecikme sabit. */
const ROUND_CHIP_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { ...SPRING.bouncy, delay: T_COUNT_START - 0.2 } },
};

/**
 * Tur sonu puan durumu.
 *
 * Kahoot/Jackbox standardı "sıralama anı": satırlar ÖNCEKİ sıralamayla
 * belirir, tur puanları sayılır, ardından satırlar yeni sıraya fiziksel
 * olarak kayar (framer `layout` + yay). Eskiden liste doğrudan son hâliyle
 * geliyordu — "kim kimi geçti" hiç görünmüyordu.
 */
export function HostStandings({ room, players, roundResults, onNextStep }: HostStandingsProps) {
  const { t } = useLocale();
  const confettiRef = useRef<ConfettiCanvasRef>(null);
  const [revealed, setRevealed] = useState(false);

  let finalRanking: RankingItem[] = [];

  if (room?.game_mode === "team") {
    const teams: Record<string, { score: number; roundScore: number }> = {};
    players.forEach((p) => {
      const tName = p.team_name || t("podium.individual");
      if (!teams[tName]) teams[tName] = { score: 0, roundScore: 0 };
      teams[tName].score += p.total_score;
      const res = roundResults.find((r) => r.playerId === p.id);
      if (res) teams[tName].roundScore += res.roundScore;
    });
    finalRanking = Object.entries(teams)
      .map(([name, data]) => ({ id: name, name, ...data }))
      .sort((a, b) => b.score - a.score);
  } else {
    finalRanking = [...players]
      .sort((a, b) => b.total_score - a.total_score)
      .map((p) => {
        const res = roundResults.find((r) => r.playerId === p.id);
        return { id: p.id, name: p.nickname, score: p.total_score, roundScore: res ? res.roundScore : 0 };
      });
  }

  // Önceki sıralama: tur puanı düşülmüş skora göre (eşitlikte son sıra korunur)
  const previousRanking = [...finalRanking].sort(
    (a, b) => b.score - b.roundScore - (a.score - a.roundScore),
  );
  const previousIndex = new Map(previousRanking.map((item, i) => [item.id, i]));
  const rows = revealed ? finalRanking : previousRanking;
  const hasRoundData = roundResults.length > 0;

  useEffect(() => {
    if (!hasRoundData) {
      // Puan değişimi yoksa koreografi gereksiz: doğrudan son sırayı göster
      const t0 = setTimeout(() => setRevealed(true), 0);
      return () => clearTimeout(t0);
    }
    const t1 = setTimeout(() => setRevealed(true), T_REORDER * 1000);
    const t2 = setTimeout(() => confettiRef.current?.celebrationCannon(), T_CONFETTI * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hasRoundData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={TWEEN.screen}
      className="h-full flex-1 flex flex-col items-center justify-between py-2 max-w-5xl mx-auto w-full relative z-10 overflow-hidden"
    >
      <ConfettiCanvas ref={confettiRef} autoCannon={false} />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING.gentle, delay: 0.1 }}
        className="w-full flex items-center justify-between px-8 py-3.5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-2xl mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f3ff] animate-pulse" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-[0.25em]">
            {t("standings.title")}
          </h2>
        </div>
        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <span className="text-white/40 text-xs tracking-widest uppercase font-bold">Round</span>
          <span className="text-white font-black text-2xl tabular-nums">
            {room?.current_round}
            <span className="text-white/20 mx-1.5">/</span>
            <span className="text-white/60">{room?.total_rounds}</span>
          </span>
        </div>
      </motion.div>

      {/* Leaderboard Rows */}
      <motion.div
        variants={LIST_VARIANTS}
        initial="hidden"
        animate="visible"
        className="flex-1 w-full flex flex-col overflow-y-auto pr-2 pb-2 space-y-2.5 min-h-0 custom-scrollbar"
      >
        <LayoutGroup>
          {rows.map((item, index) => {
            const isFirst = revealed && index === 0;
            const isSecond = revealed && index === 1;
            const isThird = revealed && index === 2;
            const prevIdx = previousIndex.get(item.id) ?? index;
            const delta = revealed ? prevIdx - index : 0; // + : yükseldi

            let rowBg = "bg-white/[0.02] backdrop-blur-2xl border border-white/5 shadow-md";
            let textStyle = "text-white/90";
            let scoreStyle = "text-white/80 font-light";
            let badgeBg = "bg-white/5 text-white/70";
            let rankText = "text-white/30";

            if (isFirst) {
              rowBg = "bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-white/[0.02] backdrop-blur-3xl border border-amber-400/50 shadow-[0_0_35px_rgba(251,191,36,0.25)]";
              textStyle = "text-white font-bold text-glow-gold";
              scoreStyle = "text-amber-300 font-black text-glow-gold";
              badgeBg = "bg-gradient-to-br from-amber-400 to-yellow-600 text-black font-black shadow-[0_0_15px_rgba(251,191,36,0.5)]";
              rankText = "text-amber-400 font-black";
            } else if (isSecond) {
              rowBg = "bg-gradient-to-r from-slate-300/15 via-white/5 to-white/[0.02] backdrop-blur-3xl border border-slate-300/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]";
              textStyle = "text-white font-semibold";
              scoreStyle = "text-slate-200 font-black";
              badgeBg = "bg-gradient-to-br from-slate-200 to-slate-400 text-black font-black shadow-[0_0_10px_rgba(255,255,255,0.3)]";
              rankText = "text-slate-300 font-black";
            } else if (isThird) {
              rowBg = "bg-gradient-to-r from-amber-700/15 via-orange-600/5 to-white/[0.02] backdrop-blur-3xl border border-amber-600/30 shadow-[0_0_15px_rgba(217,119,6,0.15)]";
              textStyle = "text-white/95 font-medium";
              scoreStyle = "text-amber-400/90 font-bold";
              badgeBg = "bg-gradient-to-br from-amber-600 to-orange-700 text-white font-bold";
              rankText = "text-amber-600 font-black";
            }

            return (
              <motion.div
                key={item.id}
                layout
                variants={ROW_VARIANTS}
                transition={SPRING.layout}
                className={`relative w-full flex items-center h-16 md:h-18 shrink-0 overflow-hidden rounded-2xl transition-[background-color,border-color,box-shadow] duration-500 ${rowBg}`}
              >
                {/* Lider parıltısı: transform-only shimmer */}
                {isFirst && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent animate-shimmer pointer-events-none"
                  />
                )}

                {/* Sıra */}
                <div className="w-16 h-full flex items-center justify-center border-r border-white/5 relative overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={index}
                      initial={{ y: 18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -18, opacity: 0 }}
                      transition={SPRING.snappy}
                      className={`text-2xl font-black tracking-tighter tabular-nums block ${rankText}`}
                    >
                      {index === 0 && revealed ? "👑" : index + 1}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Rozet */}
                <div className="w-16 h-full flex items-center justify-center border-r border-white/5">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-mono tracking-wider ${badgeBg}`}>
                    {upperTL(item.name.substring(0, 3))}
                  </div>
                </div>

                {/* İsim + tur puanı + sıra değişimi */}
                <div className="flex-1 flex flex-col justify-center px-6 h-full">
                  <div className="flex items-center gap-4">
                    <h3 className={`text-xl tracking-wider uppercase truncate ${textStyle}`}>{item.name}</h3>
                    {item.roundScore > 0 && (
                      <motion.span
                        variants={ROUND_CHIP_VARIANTS}
                        className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 tabular-nums shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                      >
                        +{item.roundScore}
                      </motion.span>
                    )}
                    <AnimatePresence>
                      {delta !== 0 && (
                        <motion.span
                          key={delta > 0 ? "up" : "down"}
                          variants={popBouncy}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`text-xs font-bold tracking-widest px-2 py-0.5 rounded-full tabular-nums ${
                            delta > 0 ? "text-emerald-300 bg-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-rose-300/80 bg-rose-500/15"
                          }`}
                        >
                          {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Skor */}
                <div className="w-36 h-full flex items-center justify-center border-l border-white/5">
                  <div className={`text-3xl tracking-tighter tabular-nums ${scoreStyle}`}>
                    <AnimatedNumber
                      from={item.score - item.roundScore}
                      value={item.score}
                      delay={T_COUNT_START}
                      duration={1.3}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </LayoutGroup>
      </motion.div>

      {/* Docked Next Button */}
      <motion.button
        onClick={onNextStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TWEEN.enter, delay: 1.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-3 w-full max-w-md py-4 bg-gradient-to-r from-white via-gray-100 to-gray-200 text-black hover:brightness-105 rounded-full font-black uppercase tracking-[0.25em] text-lg shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all flex-shrink-0 flex items-center justify-center gap-3"
      >
        <span>{room?.current_round === room?.total_rounds ? t("standings.finishGame") : t("standings.nextRound")}</span>
        <span className="text-xl">➔</span>
      </motion.button>
    </motion.div>
  );
}
