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
 * Hengame Arena — Klas TV Şovu Oyun Ekranı (HostPlaying)
 *
 * Blender & Oyun Motoru İlkeleri:
 * 1. Volumetrik Stüdyo Işıkları (Tepe spotları ve derinlik aurası)
 * 2. 3D Havada Süzülen Jiroskopik Harf Monoliti (Floating Gyro-Prism)
 * 3. Aşırı Isınan Kuantum Reaktör Zamanlayıcısı (Overheating Tokamak Fusion Reactor)
 * 4. Fasetli Neon Cam Kategori Panelleri
 * 5. Canlı Telemetri / Oyuncu Katılım Hücreleri
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
  const isWarning = tone === "warning";
  const isOver = tone === "over";

  // Son 5 saniyede acil tik sesi
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      SoundManager.getInstance().playSFX(sounds.TICK_URGENT, 0.45);
    }
  }, [timeLeft]);

  return (
    <motion.div
      key="playing"
      variants={screen}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full h-full flex flex-col items-center justify-between py-3 px-6 relative overflow-hidden select-none"
      data-tension={isWarning || isCritical ? "high" : undefined}
    >
      {/* ═══════════════════════════════════════════════════════════════
          VOLUMETRİK STÜDYO IŞIKLARI & ATMOSFER (BLENDER LIGHTING)
          ═══════════════════════════════════════════════════════════════ */}
      {/* Sol Tepe Spot Işığı (Alaz Turuncu Konisi) */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/4 w-96 h-[600px] bg-gradient-to-b from-alaz-orange/15 via-alaz-orange/5 to-transparent blur-3xl pointer-events-none -rotate-12 -z-10"
      />
      {/* Sağ Tepe Spot Işığı (Plazma Cyan Konisi) */}
      <div
        aria-hidden="true"
        className="absolute -top-32 right-1/4 w-96 h-[600px] bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent blur-3xl pointer-events-none rotate-12 -z-10"
      />
      {/* Zemin İnce Izgara Yansıması */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none -z-10"
      />

      {/* Gerilim Vinyeti: Kritik anlarda nabız gibi kora döner */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: isCritical ? 1 : isWarning ? 0.45 : 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.inOut }}
        className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(255,0,40,0.5)_100%)]"
      />
      {isCritical && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-30 tension-heartbeat-glow" />
      )}

      {/* Kritik eşiğe giriş darbesi */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            key="impact"
            aria-hidden="true"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE.out }}
            className="absolute inset-0 pointer-events-none z-40 bg-white mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      {/* Üst Yapay Zeka & Durum Çubuğu */}
      <IntelligenceWidget
        currentLetter={currentLetter}
        categories={categories}
        playerCount={playersCount}
        timeLeft={timeLeft}
        currentRound={currentRound}
      />

      {/* ═══════════════════════════════════════════════════════════════
          ANA ÇEKİRDEK: 3D HOLOGRAFİK MONOLİT + FÜZYON REAKTÖRÜ
          ═══════════════════════════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col items-center justify-center w-full relative z-10 my-1 ${isOver ? "animate-screen-shake" : ""}`}>
        <div className="flex items-center justify-center gap-14 lg:gap-24 relative">

          {/* 3D HOLOGRAFİK HARF ÇEKİRDEĞİ */}
          <motion.div
            initial={{ x: -60, opacity: 0, scale: 0.9 }}
            animate={{
              x: 0,
              opacity: 1,
              scale: 1,
              y: [-4, 4, -4],
            }}
            transition={{
              x: SPRING.gentle,
              scale: SPRING.gentle,
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative perspective-[1200px]"
          >
            {/* Holografik Aurası */}
            <div className="absolute inset-0 bg-gradient-to-tr from-alaz-orange/30 via-white/10 to-neon-blue/25 blur-[90px] rounded-full -z-10 animate-pulse-slow" />

            {/* Dönen 3D Jiroskopik Halka (Dış — Cyan) */}
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360, rotateX: [0, 20, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-14px] rounded-[2.8rem] border border-cyan-400/40 shadow-[0_0_25px_rgba(0,243,255,0.25)] border-l-transparent border-r-transparent opacity-75 pointer-events-none"
            />
            {/* Dönen 3D Jiroskopik Halka (İç — Alaz Turuncu) */}
            <motion.div
              aria-hidden="true"
              animate={{ rotate: -360, rotateY: [0, 25, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-22px] rounded-[3.2rem] border border-alaz-orange/45 shadow-[0_0_25px_rgba(255,85,0,0.3)] border-t-transparent border-b-transparent opacity-65 pointer-events-none"
            />

            {/* Kristal Cam Harf Monoliti */}
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-[2.5rem] border border-white/25 flex items-center justify-center shadow-[0_25px_70px_rgba(0,0,0,0.7),inset_0_0_40px_rgba(255,255,255,0.08)] bg-black/40 backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.1] via-transparent to-white/[0.04] pointer-events-none" />
              
              {/* Köşe Prizma Çentikleri */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400/70" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-alaz-orange/70" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-alaz-orange/70" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400/70" />

              <motion.div
                key={currentLetter}
                initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={SPRING.bouncy}
                className="text-[7rem] md:text-[9.5rem] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-alaz-orange leading-none drop-shadow-[0_0_45px_rgba(255,85,0,0.85)]"
              >
                {currentLetter}
              </motion.div>
            </div>
          </motion.div>

          {/* DİKEY ENERJİ DEŞARJ ÇUBUĞU */}
          <div className="h-56 w-[1px] bg-gradient-to-b from-transparent via-white/35 to-transparent relative">
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, 195, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: EASE.inOut }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-12 bg-cyan-400 rounded-full shadow-[0_0_20px_#00f3ff] will-change-transform"
            />
          </div>

          {/* KUANTUM REAKTÖR ZAMANLAYICISI (OVERHEATING FUSION REACTOR) */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...SPRING.gentle, delay: 0.25 }}
            className="text-left relative w-[310px]"
          >
            <div className="flex flex-col items-start relative">
              {/* Reaktör Başlık Çubuğu */}
              <div className="flex items-center justify-between w-full mb-2 px-3">
                <span className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCritical
                        ? "bg-red-500 animate-ping"
                        : isWarning
                        ? "bg-amber-400 animate-pulse"
                        : "bg-cyan-400 animate-pulse"
                    }`}
                  />
                  {t("playing.seconds")}
                </span>
                <span className="text-[10px] font-mono text-white/30 tracking-widest">
                  TOKAMAK // V4
                </span>
              </div>

              {/* Dış Dönüş Kalibrasyon Halkası */}
              <div className="relative">
                <motion.div
                  aria-hidden="true"
                  animate={{
                    rotate: isCritical ? 720 : isWarning ? 360 : 180,
                  }}
                  transition={{
                    duration: isCritical ? 4 : isWarning ? 8 : 14,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className={`absolute inset-[-18px] rounded-full border border-dashed pointer-events-none transition-colors duration-500 ${
                    isCritical
                      ? "border-red-500/50 shadow-[0_0_35px_rgba(255,0,40,0.35)]"
                      : isWarning
                      ? "border-amber-400/40 shadow-[0_0_25px_rgba(251,191,36,0.25)]"
                      : "border-cyan-400/25 shadow-[0_0_20px_rgba(0,243,255,0.15)]"
                  }`}
                />

                <TimerRing timeLeft={timeLeft} maxTime={maxTime} tone={tone} size={260} strokeWidth={3.5}>
                  <div className={isCritical ? "animate-heartbeat" : ""}>
                    <div
                      className={`relative h-[1.1em] overflow-hidden text-[6.5rem] md:text-[8.5rem] font-light leading-none tracking-tight tabular-nums transition-colors duration-500 ${
                        isCritical
                          ? "text-red-400 drop-shadow-[0_0_35px_rgba(255,0,51,0.8)]"
                          : isWarning
                          ? "text-amber-300 drop-shadow-[0_0_30px_rgba(255,170,0,0.6)]"
                          : "text-white/95 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]"
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
            </div>
          </motion.div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FASETLİ KATEGORİ PANELLERİ (HOLOGRAPHIC CATEGORY ARRAY)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-[96rem] px-6 flex flex-col items-center gap-3">
        <div className={`grid gap-4 w-full ${categories.length <= 3 ? "grid-cols-3" : categories.length <= 5 ? "grid-cols-5" : "grid-cols-4"}`}>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ ...SPRING.snappy, delay: 0.25 + idx * STAGGER.base }}
              className="relative p-[1px] rounded-2xl overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Dönen Konik Kenar Işığı */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,255,255,0.3)_360deg)] animate-[spin_8s_linear_infinite]"
              />

              <div className="relative h-full w-full bg-black/50 backdrop-blur-3xl p-3.5 text-center rounded-[15px] z-10 flex flex-col items-center justify-center border border-white/10 group-hover:bg-white/[0.07] transition-all duration-300">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-[0.25em] mb-1 flex items-center justify-center gap-2">
                  <span className="w-2.5 h-[1px] bg-cyan-400/50" />
                  {String(idx + 1).padStart(2, "0")}
                  <span className="w-2.5 h-[1px] bg-cyan-400/50" />
                </span>
                <p className="text-base lg:text-lg font-semibold text-white tracking-wide truncate max-w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {cat}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CANLI TELEMETRİ / OYUNCU KATILIM HÜCRELERİ
            ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...TWEEN.enter, delay: 0.6 }}
          className="flex flex-col items-center gap-2 w-full max-w-4xl"
        >
          <div className="flex items-center justify-between w-full px-4 border-b border-white/10 pb-2">
            <span className="text-white/60 font-mono font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
              NEURAL TELEMETRY // UPLINK
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

          <div className="flex justify-center gap-2 w-full">
            {Array.from({ length: Math.max(playersCount, 1) }).map((_, i) => {
              const isSubmitted = i < submittedPlayerIds.length;
              return (
                <div
                  key={i}
                  className={`relative h-2.5 flex-1 rounded-full overflow-hidden transition-all duration-300 ${
                    isSubmitted
                      ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                      : "bg-white/[0.04]"
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: isSubmitted ? "0%" : "-100%" }}
                    transition={SPRING.snappy}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-alaz-orange"
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SÜRE BİTTİ DARBESİ (CLIMAX EMP PULSE)
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOver && (
          <motion.div
            key="timeup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              {/* Genişleyen EMP Şok Dalgası 1 */}
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 14, opacity: 0 }}
                transition={{ duration: DURATION.cinematic, ease: EASE.out }}
                className="absolute w-24 h-24 bg-red-600 rounded-full will-change-transform"
              />
              {/* Genişleyen EMP Şok Dalgası 2 */}
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0.1, opacity: 1 }}
                animate={{ scale: 6, opacity: 0 }}
                transition={{ duration: DURATION.cinematic * 0.85, ease: EASE.out, delay: 0.05 }}
                className="absolute w-64 h-64 rounded-full border-4 border-white/80 will-change-transform"
              />
              <motion.h1
                initial={{ scale: 1.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ ...SPRING.bouncy, delay: 0.05 }}
                className="text-[130px] md:text-[160px] font-black text-red-500 uppercase tracking-tighter drop-shadow-[0_0_60px_rgba(255,0,0,1)]"
                style={{ textShadow: "4px 4px 0px rgba(0,243,255,0.6), -4px -4px 0px rgba(255,0,255,0.6)" }}
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
