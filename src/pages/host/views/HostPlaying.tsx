import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IntelligenceWidget } from "../../../components/IntelligenceWidget";
import { TimerRing, type TimerTone } from "../../../components/TimerRing";
import { useLocale } from "../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../lib/audio";
import { DURATION, EASE, SPRING, STAGGER, TWEEN, screen } from "../../../lib/motion";

interface HostPlayingProps {
  currentLetter: string;
  timeLeft: number;
  /** Turun toplam süresi (sn) — halka bunun oranıyla boşalır */
  maxTime?: number;
  categories: string[];
  submittedPlayerIds: string[];
  playersCount: number;
  currentRound?: number;
}

function toneFor(timeLeft: number): TimerTone {
  if (timeLeft <= 0) return "over";
  if (timeLeft <= 5) return "critical";
  if (timeLeft <= 10) return "warning";
  return "calm";
}

/**
 * Oyun ekranı (TV). Gerilim tasarımı üç kademeli:
 *   calm     → nötr beyaz
 *   warning  ≤10sn → amber halka + hafif vinyet
 *   critical ≤5sn  → kırmızı halka, kalp atışı (transform-only), giriş darbesi
 *   over     0sn   → tek seferlik ekran sarsıntısı + "SÜRE BİTTİ" splash
 *
 * Eskiden ≤10sn boyunca tüm TV 10 saniye sürekli titriyordu; oyun "juice"
 * kuralı: sarsıntı noktalama işaretidir, durum değil. Blur/box-shadow
 * animasyonu yok — her şey transform + opacity.
 */
export function HostPlaying({
  currentLetter,
  timeLeft,
  maxTime = 60,
  categories,
  submittedPlayerIds,
  playersCount,
  currentRound = 1,
}: HostPlayingProps) {
  const { t } = useLocale();
  const tone = toneFor(timeLeft);
  const isCritical = tone === "critical";
  const isOver = tone === "over";

  // Son 5 saniyede acil tik sesi
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      SoundManager.getInstance().playSFX(sounds.TICK_URGENT, 0.4);
    }
  }, [timeLeft]);

  return (
    <motion.div
      key="playing"
      variants={screen}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full h-full flex flex-col items-center justify-between py-12 relative"
      data-tension={tone === "warning" || tone === "critical" ? "high" : undefined}
    >
      {/* Gerilim vinyeti: her zaman DOM'da, yalnızca opaklığı değişir (tek paint) */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: isCritical ? 1 : tone === "warning" ? 0.45 : 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.inOut }}
        className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(255,0,40,0.45)_100%)]"
      />
      {isCritical && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-30 tension-heartbeat-glow" />
      )}
      {/* Kritik eşiğe giriş darbesi: tek kare beyaz flaş */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            key="impact"
            aria-hidden="true"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE.out }}
            className="absolute inset-0 pointer-events-none z-40 bg-white mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      <div className="animate-scanline" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />

      <IntelligenceWidget
        currentLetter={currentLetter}
        categories={categories}
        playerCount={playersCount}
        timeLeft={timeLeft}
        currentRound={currentRound}
      />

      {/* Ana çekirdek — süre bitince tek seferlik sarsıntı */}
      <div className={`flex-1 flex flex-col items-center justify-center w-full relative z-10 my-8 ${isOver ? "animate-screen-shake" : ""}`}>
        <div className="flex items-center gap-32 relative">
          {/* Aktif Harf */}
          <motion.div
            initial={{ x: -80, opacity: 0, rotateY: 60 }}
            animate={{ x: 0, opacity: 1, rotateY: 0 }}
            transition={{ ...SPRING.gentle, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full" />

            <motion.div
              aria-hidden="true"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-15px] rounded-[2.5rem] border-[1px] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] border-l-transparent border-r-transparent opacity-50 z-0"
            />
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-25px] rounded-[3rem] border-[1px] border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)] border-t-transparent border-b-transparent opacity-40 z-0"
            />

            <div className="w-72 h-72 rounded-[2rem] border border-white/10 flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(255,255,255,0.02)] bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
              <motion.div
                key={currentLetter}
                initial={{ scale: 0.6, opacity: 0, rotateX: 40 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                transition={SPRING.bouncy}
                className="text-[7rem] md:text-[10rem] lg:text-[14rem] font-light tracking-tight text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {currentLetter}
              </motion.div>
            </div>
          </motion.div>

          {/* Enerji ayracı — `top` yerine translateY (compositor) */}
          <div className="h-72 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent relative">
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, 240, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: EASE.inOut }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-12 bg-white/60 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] will-change-transform"
            />
          </div>

          {/* Zamanlayıcı */}
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...SPRING.gentle, delay: 0.25 }}
            className="text-left relative w-[350px]"
          >
            <div className="flex flex-col items-start">
              <span className="text-xl font-light text-white/50 uppercase tracking-[0.4em] mb-2 ml-4 z-10">
                {t("playing.seconds")}
              </span>
              <TimerRing timeLeft={timeLeft} maxTime={maxTime} tone={tone} size={300}>
                <div className={isCritical ? "animate-heartbeat" : ""}>
                  <div
                    className={`relative h-[1.1em] overflow-hidden text-[8rem] md:text-[11rem] font-light leading-none tracking-tight tabular-nums transition-colors duration-500 ${
                      isCritical
                        ? "text-red-400 drop-shadow-[0_0_24px_rgba(255,0,51,0.5)]"
                        : tone === "warning"
                          ? "text-amber-300 drop-shadow-[0_0_20px_rgba(255,170,0,0.35)]"
                          : "text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={timeLeft}
                        initial={{ y: "0.6em", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-0.6em", opacity: 0 }}
                        transition={SPRING.snappy}
                        className="block will-change-transform"
                      >
                        {timeLeft.toString().padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </TimerRing>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-[100rem] px-16 flex flex-col items-center gap-12">
        <div className={`grid gap-8 w-full ${categories.length <= 3 ? "grid-cols-3" : categories.length <= 5 ? "grid-cols-5" : "grid-cols-4"}`}>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ ...SPRING.snappy, delay: 0.4 + idx * STAGGER.base }}
              className="relative p-[1px] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              {/* Dönen konik kenarlık (transform-only) */}
              <div aria-hidden="true" className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,255,255,0.2)_360deg)] animate-[spin_6s_linear_infinite]" />

              <div className="relative h-full w-full bg-white/[0.02] backdrop-blur-3xl p-6 text-center rounded-[15px] z-10 flex flex-col items-center justify-center border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-3">
                  <span className="w-3 h-[1px] bg-white/20" />
                  {String(idx + 1).padStart(2, "0")}
                  <span className="w-3 h-[1px] bg-white/20" />
                </span>
                <p className="text-xl lg:text-2xl font-light text-white/80 group-hover:text-white transition-colors">
                  {cat}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Canlı gönderim durumu */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TWEEN.enter, delay: 1 }}
          className="flex flex-col items-center gap-6 w-full max-w-4xl"
        >
          <div className="flex items-end justify-between w-full px-4 border-b border-white/5 pb-4">
            <span className="text-white/40 font-medium uppercase tracking-[0.2em] text-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              Live Link Status
            </span>
            <div className="flex items-baseline gap-3">
              <motion.span
                key={submittedPlayerIds.length}
                initial={{ scale: 1.35, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING.snappy}
                className="text-white/90 font-light text-5xl leading-none tabular-nums inline-block"
              >
                {submittedPlayerIds.length}
              </motion.span>
              <span className="text-white/30 font-medium uppercase tracking-[0.2em] text-lg">
                / {playersCount} {t("playing.answered")}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 w-full">
            {Array.from({ length: playersCount }).map((_, i) => {
              const isSubmitted = i < submittedPlayerIds.length;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ scale: isSubmitted ? [1, 1.25, 1] : 1, opacity: isSubmitted ? 1 : 0.2 }}
                  transition={{ duration: DURATION.slow, ease: EASE.out }}
                  className={`relative h-2 flex-1 rounded-full overflow-hidden ${isSubmitted ? "bg-white/[0.05]" : "bg-white/[0.02]"}`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: isSubmitted ? "0%" : "-100%" }}
                    transition={SPRING.snappy}
                    className="absolute inset-0 bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* SÜRE BİTTİ */}
      <AnimatePresence>
        {isOver && (
          <motion.div
            key="timeup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              {/* Şok dalgası: küçük bir daireyi büyüt (compositor) */}
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0, opacity: 0.9 }}
                animate={{ scale: 12, opacity: 0 }}
                transition={{ duration: DURATION.cinematic, ease: EASE.out }}
                className="absolute w-20 h-20 bg-red-600 rounded-full will-change-transform"
              />
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0.2, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: DURATION.cinematic * 0.8, ease: EASE.out, delay: 0.05 }}
                className="absolute w-64 h-64 rounded-full border-4 border-white/70 will-change-transform"
              />
              <motion.h1
                initial={{ scale: 1.6, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ ...SPRING.bouncy, delay: 0.05 }}
                className="text-[150px] font-black text-red-500 uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(255,0,0,1)]"
                style={{ textShadow: "4px 4px 0px rgba(0,243,255,0.5), -4px -4px 0px rgba(255,0,255,0.5)" }}
              >
                {t("playing.timeUp")}
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
