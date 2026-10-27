import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { RevealText } from "../../../components/fx/RevealText";
import { NumberTicker } from "../../../components/fx";
import { ConfettiCanvas, type ConfettiCanvasRef } from "../../../components/ConfettiCanvas";
import { useLocale } from "../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../lib/audio";
import { DURATION, EASE, SPRING } from "../../../lib/motion";
import { nightStandings } from "../../../lib/nightLeague";
import type { Player } from "../../../types/database";

interface NightFinaleProps {
  players: Player[];
  onClose: () => void;
  onEndNight: () => void;
}

/** Sahne zamanlaması (sn): önce 3. ve 2., şampiyon en son — gerilim tırmanır. */
const T = { third: 0.6, second: 1.4, champion: 2.4, rest: 3.6 } as const;
const REST_MAX = 7;

/**
 * Gecenin finali: gecelik ligin (F1 sıra puanı) ilk üçü ve devamı.
 *
 * Yalnızca TV'de, yerel bir sahne — oda durumu değişmiyor, misafirler
 * lobide kendi sıralarını görmeye devam ediyor. "Geceyi bitir" odayı
 * kapatıyor (dashboard'daki endNight ile aynı yol).
 */
export function NightFinale({ players, onClose, onEndNight }: NightFinaleProps) {
  const { t } = useLocale();
  const confettiRef = useRef<ConfettiCanvasRef>(null);
  const standings = nightStandings(players).filter((p) => (p.night_score ?? 0) > 0);
  const [champion, second, third] = standings;
  const rest = standings.slice(3, 3 + REST_MAX);

  useEffect(() => {
    const sfx = SoundManager.getInstance();
    const timers = [
      setTimeout(() => sfx.playSFX(sounds.CINEMATIC_BOOM, 0.5), T.third * 1000),
      setTimeout(() => sfx.playSFX(sounds.FANFARE, 0.8), T.champion * 1000),
      setTimeout(() => confettiRef.current?.celebrationCannon(), (T.champion + 0.3) * 1000),
      setTimeout(() => confettiRef.current?.celebrationCannon(), (T.champion + 1.4) * 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-[#040308] text-white overflow-hidden flex flex-col items-center justify-center p-4 md:p-6" role="dialog" aria-modal="true" aria-label={t("finale.title")}>
      <ConfettiCanvas ref={confettiRef} />

      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.2em" }}
        animate={{ opacity: 1, letterSpacing: "0.55em" }}
        transition={{ duration: DURATION.cinematic, ease: EASE.out }}
        className="relative flex items-center gap-4 md:gap-6 text-xl md:text-2xl font-black uppercase text-accent flex-shrink-0"
      >
        <span className="h-px w-12 md:w-16 bg-current opacity-50" aria-hidden="true" />
        {t("finale.title")}
        <span className="h-px w-12 md:w-16 bg-current opacity-50" aria-hidden="true" />
      </motion.p>

      {champion ? (
        <div className="relative mt-5 md:mt-7 flex items-end justify-center gap-6 md:gap-8 flex-shrink-0">
          {second && <RunnerUp place={2} name={second.nickname} points={second.night_score ?? 0} delay={T.second} />}

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING.gentle, delay: T.champion }}
          >
            <div className="surface w-[460px] md:w-[540px] rounded-[2.5rem] border-accent flex flex-col items-center px-8 py-7 text-center">
              <span className="text-6xl leading-none" aria-hidden="true">👑</span>
              <RevealText
                text={champion.nickname}
                delay={T.champion + 0.3}
                className="mt-4 text-5xl md:text-6xl leading-tight font-black uppercase tracking-tight text-white [overflow-wrap:anywhere]"
              />
              <p className="mt-3 text-2xl font-black text-accent tabular-nums">{t("finale.points", champion.night_score ?? 0)}</p>
            </div>
          </motion.div>

          {third && <RunnerUp place={3} name={third.nickname} points={third.night_score ?? 0} delay={T.third} />}
        </div>
      ) : (
        <p className="relative mt-8 text-2xl font-bold text-white/60">{t("finale.empty")}</p>
      )}

      {rest.length > 0 && (
        <motion.ol
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: T.rest, duration: DURATION.slow, ease: EASE.out }}
          className="relative mt-5 md:mt-6 flex flex-wrap justify-center gap-2 max-w-[1200px] flex-shrink-0"
        >
          {rest.map((p, i) => (
            <li key={p.id} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-base font-bold text-white/80">
              <span className="text-white/40 tabular-nums mr-1.5">{i + 4}.</span>
              {p.nickname}
              <span className="ml-2.5 text-accent tabular-nums">{p.night_score}</span>
            </li>
          ))}
        </motion.ol>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.rest + 0.6 }}
        className="relative mt-6 md:mt-7 flex items-center gap-4 flex-shrink-0"
      >
        <button
          onClick={onClose}
          className="rounded-full border border-white/15 bg-white/[0.05] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-white/70 transition-colors hover:bg-white/10"
        >
          {t("finale.back")}
        </button>
        <button
          type="button"
          onClick={onEndNight}
          className="btn-primary rounded-full px-8 py-3.5 text-sm font-black uppercase tracking-[0.2em]"
        >
          {t("finale.endNight")}
        </button>
      </motion.div>
    </div>
  );
}

function RunnerUp({ place, name, points, delay }: { place: 2 | 3; name: string; points: number; delay: number }) {
  const { t } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING.gentle, delay }}
      className="w-[240px] md:w-[270px]"
    >
      <div className="surface w-full rounded-[2rem] px-6 py-6 text-center">
        <span className="text-5xl leading-none" aria-hidden="true">{place === 2 ? "🥈" : "🥉"}</span>
        <p className="mt-3 truncate text-2xl md:text-3xl font-black uppercase text-white">{name}</p>
        <p className="mt-2 text-base font-bold text-white/60 tabular-nums">
          <NumberTicker value={points} suffix={` ${t("finale.points", "").trim()}`} className="text-white/60 font-bold" />
        </p>
      </div>
    </motion.div>
  );
}
