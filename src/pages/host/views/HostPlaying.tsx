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
      className="w-full h-full flex flex-col items-center justify-between py-4 px-6 relative overflow-hidden"
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

      {/* Ana Çekirdek — Harf + Reaktör Zamanlayıcı */}
      <div className={`flex-1 flex flex-col items-center justify-center w-full relative z-10 my-2 ${isOver ? "animate-screen-shake" : ""}`}>
        <div className="flex items-center justify-center gap-16 lg:gap-24 relative">
          {/* Aktif Harf Çekirdeği (3D Gyro Glass Core) */}
          <motion.div
            initial={{ x: -60, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ ...SPRING.gentle, delay: 0.15 }}
            className="relative perspective-[1000px]"
          >
            {/* Holografik Işıma Aurası */}
            <div className="absolute inset-0 bg-gradient-to-tr from-alaz-orange/25 via-white/10 to-neon-blue/25 blur-[100px] rounded-full -z-10 animate-pulse-slow" />

            {/* Ters dönen jiroskopik neon halkalar */}
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-14px] rounded-[2.8rem] border border-cyan-400/40 shadow-[0_0_25px_rgba(0,243,255,0.2)] border-l-transparent border-r-transparent opacity-60 pointer-events-none"
            />
            <motion.div
              aria-hidden="true"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-24px] rounded-[3.2rem] border border-alaz-orange/40 shadow-[0_0_20px_rgba(255,77,0,0.25)] border-t-transparent border-b-transparent opacity-50 pointer-events-none"
            />

            {/* Kristal Harf Kutusu */}
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-[2.5rem] border border-white/20 flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.05)] bg-white/[0.03] backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-white/[0.03] pointer-events-none" />
              <motion.div
                key={currentLetter}
                initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={SPRING.bouncy}
                className="text-[8rem] md:text-[11rem] font-black tracking-tight text-white leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]"
              >
                {currentLetter}
              </motion.div>
            </div>
          </motion.div>

          {/* Enerji ayracı */}
          <div className="h-64 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent relative">
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, 220, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: EASE.inOut }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-10 bg-cyan-400 rounded-full shadow-[0_0_15px_#00f3ff] will-change-transform"
            />
          </div>

          {/* Reaktör Zamanlayıcı */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...SPRING.gentle, delay: 0.25 }}
            className="text-left relative w-[320px]"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm font-black text-white/50 uppercase tracking-[0.35em] mb-2 ml-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {t("playing.seconds")}
              </span>
              <TimerRing timeLeft={timeLeft} maxTime={maxTime} tone={tone} size={270}>
                <div className={isCritical ? "animate-heartbeat" : ""}>
                  <div
                    className={`relative h-[1.1em] overflow-hidden text-[7rem] md:text-[9rem] font-light leading-none tracking-tight tabular-nums transition-colors duration-500 ${
                      isCritical
                        ? "text-red-400 drop-shadow-[0_0_30px_rgba(255,0,51,0.6)]"
                        : tone === "warning"
                          ? "text-amber-300 drop-shadow-[0_0_25px_rgba(255,170,0,0.5)]"
                          : "text-white/95 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
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

      {/* Kategoriler ve Canlı Gönderim Durumu */}
      <div className="w-full max-w-[96rem] px-8 flex flex-col items-center gap-4">
        <div className={`grid gap-5 w-full ${categories.length <= 3 ? "grid-cols-3" : categories.length <= 5 ? "grid-cols-5" : "grid-cols-4"}`}>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ ...SPRING.snappy, delay: 0.3 + idx * STAGGER.base }}
              className="relative p-[1px] rounded-2xl overflow-hidden group shadow-[0_8px_25px_rgba(0,0,0,0.4)]"
            >
              {/* Dönen konik kenarlık parlaması */}
              <div aria-hidden="true" className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,255,255,0.25)_360deg)] animate-[spin_8s_linear_infinite]" />

              <div className="relative h-full w-full bg-white/[0.03] backdrop-blur-3xl p-4 text-center rounded-[15px] z-10 flex flex-col items-center justify-center border border-white/10 group-hover:bg-white/[0.06] transition-colors">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-[0.25em] mb-1.5 flex items-center justify-center gap-2">
                  <span className="w-2 h-[1px] bg-cyan-400/40" />
                  {String(idx + 1).padStart(2, "0")}
                  <span className="w-2 h-[1px] bg-cyan-400/40" />
                </span>
                <p className="text-lg lg:text-xl font-medium text-white tracking-wide truncate max-w-full">
                  {cat}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Canlı Gönderim Telemetrisi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TWEEN.enter, delay: 0.8 }}
          className="flex flex-col items-center gap-2 w-full max-w-4xl"
        >
          <div className="flex items-center justify-between w-full px-4 border-b border-white/10 pb-2">
            <span className="text-white/50 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              LIVE TELEMETRY
            </span>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={submittedPlayerIds.length}
                initial={{ scale: 1.3, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING.snappy}
                className="text-white font-black text-3xl leading-none tabular-nums"
              >
                {submittedPlayerIds.length}
              </motion.span>
              <span className="text-white/40 font-bold uppercase tracking-widest text-sm">
                / {playersCount} {t("playing.answered")}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-2.5 w-full">
            {Array.from({ length: Math.max(playersCount, 1) }).map((_, i) => {
              const isSubmitted = i < submittedPlayerIds.length;
              return (
                <div
                  key={i}
                  className={`relative h-2 flex-1 rounded-full overflow-hidden transition-all duration-300 ${
                    isSubmitted
                      ? "bg-white/10 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                      : "bg-white/[0.04]"
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: isSubmitted ? "0%" : "-100%" }}
                    transition={SPRING.snappy}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400"
                  />
                </div>
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
