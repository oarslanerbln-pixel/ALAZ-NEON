import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { AuroraBackdrop } from "../../../components/fx/AuroraBackdrop";
import { BeamBorder } from "../../../components/fx/BeamBorder";
import { GridPattern } from "../../../components/fx/GridPattern";
import { RevealText } from "../../../components/fx/RevealText";
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
    <div className="fixed inset-0 z-[200] bg-[#040308] text-white overflow-hidden flex flex-col items-center justify-center" role="dialog" aria-modal="true" aria-label={t("finale.title")}>
      <AuroraBackdrop colors={["251,191,36", "255,85,0", "168,85,247"]} intensity={0.2} />
      <GridPattern />
      <ConfettiCanvas ref={confettiRef} />

      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.2em" }}
        animate={{ opacity: 1, letterSpacing: "0.55em" }}
        transition={{ duration: DURATION.cinematic, ease: EASE.out }}
        className="relative flex items-center gap-6 text-2xl font-black uppercase text-amber-300"
      >
        <span className="h-px w-16 bg-current opacity-50" aria-hidden="true" />
        {t("finale.title")}
        <span className="h-px w-16 bg-current opacity-50" aria-hidden="true" />
      </motion.p>

      {champion ? (
        <div className="relative mt-10 flex items-end justify-center gap-10">
          {second && <RunnerUp place={2} name={second.nickname} points={second.night_score ?? 0} delay={T.second} />}

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING.gentle, delay: T.champion }}
          >
            <BeamBorder rgb="251,191,36" duration={4} thickness={2} radius="2.5rem" className="w-[620px]" innerClassName="bg-[#0a0806]/95">
              <div className="flex flex-col items-center px-12 py-12 text-center">
                <span className="text-8xl leading-none" aria-hidden="true">👑</span>
                <RevealText
                  text={champion.nickname}
                  delay={T.champion + 0.3}
                  className="mt-6 text-[96px] leading-none font-black uppercase tracking-tight bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text text-transparent [overflow-wrap:anywhere]"
                />
                <p className="mt-6 text-3xl font-black text-amber-300 tabular-nums">{t("finale.points", champion.night_score ?? 0)}</p>
              </div>
            </BeamBorder>
          </motion.div>

          {third && <RunnerUp place={3} name={third.nickname} points={third.night_score ?? 0} delay={T.third} />}
        </div>
      ) : (
        <p className="relative mt-12 text-3xl font-bold text-white/60">{t("finale.empty")}</p>
      )}

      {rest.length > 0 && (
        <motion.ol
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: T.rest, duration: DURATION.slow, ease: EASE.out }}
          className="relative mt-12 flex flex-wrap justify-center gap-3 max-w-[1500px]"
        >
          {rest.map((p, i) => (
            <li key={p.id} className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-xl font-bold text-white/80">
              <span className="text-white/40 tabular-nums mr-2">{i + 4}.</span>
              {p.nickname}
              <span className="ml-3 text-amber-200/80 tabular-nums">{p.night_score}</span>
            </li>
          ))}
        </motion.ol>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.rest + 0.6 }}
        className="relative mt-14 flex items-center gap-4"
      >
        <button
          onClick={onClose}
          className="rounded-full border border-white/15 bg-white/[0.05] px-8 py-4 text-lg font-black uppercase tracking-[0.2em] text-white/70 transition-colors hover:bg-white/10"
        >
          {t("finale.back")}
        </button>
        <button
          onClick={onEndNight}
          className="rounded-full bg-gradient-to-r from-amber-400 to-alaz-orange px-10 py-4 text-lg font-black uppercase tracking-[0.2em] text-black shadow-[0_0_40px_rgba(251,191,36,0.4)] transition-transform hover:scale-105 active:scale-95"
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
      className="w-[300px] rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-10 text-center backdrop-blur-md"
    >
      <span className="text-6xl leading-none" aria-hidden="true">{place === 2 ? "🥈" : "🥉"}</span>
      <p className="mt-5 truncate text-4xl font-black uppercase text-white">{name}</p>
      <p className="mt-3 text-xl font-bold text-white/60 tabular-nums">{t("finale.points", points)}</p>
    </motion.div>
  );
}
