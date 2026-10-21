import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { NumberTicker } from "../../../components/fx";
import { useLocale } from "../../../hooks/useLocale";
import { SPRING, STAGGER } from "../../../lib/motion";
import { rankDeltas, rankOrder, startingOrder } from "../../../lib/rankShift";
import type { Player } from "../../../types/database";

/** Bir önceki sıralama ekranının bıraktığı sıra ve puanlar. */
export interface PreviousRanking {
  order: string[];
  scores: Record<string, number>;
}

/** Yeni sıraya kayış, satırlar ekrana girdikten bu kadar sonra başlar (ms). */
const RESHUFFLE_DELAY_MS = 1100;
/** 1080 satırlık TV tuvaline kaydırma olmadan sığan en fazla satır. */
const MAX_ROWS_PER_COLUMN = 9;

interface QuizLeaderboardProps {
  players: Player[];
  streaks: Record<string, number>;
  previous: PreviousRanking;
  /** Ekran açılır açılmaz yeni sıralamayı bildirir; bir sonraki tur buradan başlar. */
  onSettled: (ranking: PreviousRanking) => void;
}

/**
 * Quiz ara sıralaması. Eskiden `max-h-[50vh] overflow-y-auto` bir listeydi:
 * TV'de kimsenin kaydıramadığı bir kaydırma çubuğu çıkıyordu ve 50vh tuvalin
 * değil gerçek pencerenin yarısı olduğu için 720p'de liste daha da kısalıyordu.
 * Artık satırlar oyuncu sayısına göre sıkışıyor, 9'dan fazlası iki sütuna
 * bölünüyor; 18'i aşan kalabalıkta kalanlar tek satırda özetleniyor.
 */
export function QuizLeaderboard({ players, streaks, previous, onSettled }: QuizLeaderboardProps) {
  const { t } = useLocale();
  const nextOrder = useMemo(() => rankOrder(players), [players]);
  const [order, setOrder] = useState(() => startingOrder(previous.order, nextOrder));
  const [deltas, setDeltas] = useState<Record<string, number>>({});

  useEffect(() => {
    onSettled({
      order: nextOrder,
      scores: Object.fromEntries(players.map((p) => [p.id, p.total_score])),
    });
    // Yalnızca ekran açıldığında: oyun sırasında gelen skor güncellemeleri
    // bir sonraki turun "önceki sıralaması" sayılmamalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (order.join() === nextOrder.join()) return;
    const timer = setTimeout(() => {
      setDeltas(rankDeltas(order, nextOrder));
      setOrder(nextOrder);
    }, RESHUFFLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [order, nextOrder]);

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const twoColumns = players.length > MAX_ROWS_PER_COLUMN;
  const compact = players.length > 6;
  const visible = order.slice(0, MAX_ROWS_PER_COLUMN * 2);
  const hidden = order.length - visible.length;
  const rank = new Map(nextOrder.map((id, i) => [id, i]));

  return (
    <div className={`w-full mb-8 ${twoColumns ? "max-w-6xl" : "max-w-4xl"}`}>
      <LayoutGroup>
        <div className={twoColumns ? "grid grid-cols-2 grid-flow-row gap-x-6 gap-y-2.5" : `flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
          {visible.map((id, idx) => {
            const p = byId.get(id);
            if (!p) return null;
            // Rozet ve renk, kayıştan sonraki gerçek sıraya göre.
            const place = order === nextOrder ? idx : rank.get(id) ?? idx;
            const streak = streaks[id] || 0;
            const delta = deltas[id];
            return (
              <motion.div
                key={id}
                layout="position"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING.layout, opacity: { delay: idx * STAGGER.tight }, x: { delay: idx * STAGGER.tight } }}
                className={`flex items-center rounded-xl border-2 ${compact ? "px-4 py-2.5" : "p-5"} ${
                  place === 0
                    ? "bg-amber-500/20 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                    : place === 1
                    ? "bg-slate-300/15 border-slate-300"
                    : place === 2
                    ? "bg-amber-700/15 border-amber-700"
                    : "bg-black/60 border-white/10"
                }`}
              >
                <div className={`${compact ? "w-10 h-10 text-xl mr-4" : "w-12 h-12 text-2xl mr-5"} shrink-0 rounded-lg flex items-center justify-center font-black ${
                  place === 0 ? "bg-amber-400 text-black" : place === 1 ? "bg-slate-300 text-black" : place === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-gray-300"
                }`}>
                  #{place + 1}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <span className={`${compact ? "text-2xl" : "text-3xl"} font-black text-white truncate`}>{p.nickname}</span>
                  {streak >= 2 && (
                    <span className="shrink-0 px-3 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-sm font-black uppercase tracking-wider">
                      🔥 x{streak} {streak >= 3 ? t("quiz.streakFire") : ""}
                    </span>
                  )}
                  <AnimatePresence>
                    {delta !== undefined && (
                      <motion.span
                        key="delta"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={SPRING.bouncy}
                        className={`shrink-0 text-lg font-black tabular-nums ${delta > 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {delta > 0 ? `▲ ${delta}` : `▼ ${-delta}`}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className={`${compact ? "text-3xl" : "text-4xl"} shrink-0 font-black text-alaz-orange tabular-nums`}>
                  <NumberTicker value={p.total_score} initial={previous.scores[id] ?? 0} delay={0.3} />{" "}
                  <span className="text-base font-normal text-gray-400">{t("quiz.pts")}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
      {hidden > 0 && (
        <p className="mt-3 text-center text-xl font-bold text-white/50">{t("quiz.morePlayers", hidden)}</p>
      )}
    </div>
  );
}
