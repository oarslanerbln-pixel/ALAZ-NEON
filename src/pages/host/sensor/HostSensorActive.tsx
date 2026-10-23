import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import type { Room } from "../../../types/database";
import type { SensorImage } from "../../../data/sensorImages";
import { safeForDisplay } from "../../../lib/profanity";
import { SoundManager, sounds } from "../../../lib/audio";
import { DURATION } from "../../../lib/motion";

/** Görselin tamamen netleştiği süre (saniye). */
const SENSOR_REVEAL_SEC = 25;
/**
 * Sabit bulanıklık katmanları, en bulanığı en üstte ve ilk sönen. Aralıklar
 * örtüşüyor ki geçiş basamaklı değil sürekli görünsün.
 */
const SENSOR_BLUR_LAYERS = [
  { blur: 6, from: 15, to: SENSOR_REVEAL_SEC },
  { blur: 16, from: 7, to: 17 },
  { blur: 40, from: 0, to: 9 },
] as const;

interface Props {
  room: Room;
  currentImage: SensorImage;
  buzzerPlayerName: string | null;
  onEvaluate: (isCorrect: boolean) => void;
}

export function HostSensorActive({ room, currentImage, buzzerPlayerName, onEvaluate }: Props) {
  const { t } = useLocale();
  const gameState = room.status;

  useEffect(() => {
    if (gameState === "sensor_active") {
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        if (elapsed % 2 < 0.2) {
          SoundManager.getInstance().playSFX(sounds.VOTE_TICK);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameState, currentImage.url]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black w-full h-full">
      {/* Background Volumetric Lighting */}
      {gameState === "sensor_active" ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute -top-32 left-[10%] w-[500px] h-[850px] opacity-30 blur-3xl"
            style={{
              background: "conic-gradient(from 180deg at 50% 0%, rgba(168,85,247,0.55) 0deg, rgba(147,51,234,0.18) 35deg, transparent 70deg)",
              transform: "rotate(-12deg)",
            }}
          />
          <div
            className="absolute -top-32 right-[10%] w-[500px] h-[850px] opacity-30 blur-3xl"
            style={{
              background: "conic-gradient(from 180deg at 50% 0%, rgba(192,132,252,0.55) 0deg, rgba(168,85,247,0.18) 35deg, transparent 70deg)",
              transform: "rotate(12deg)",
            }}
          />
        </div>
      ) : (
        /* Emergency Rotating Siren Light for sensor_buzzed */
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[950px] h-[950px] opacity-35 blur-3xl"
            style={{
              background: "conic-gradient(from 0deg, rgba(239,68,68,0.7) 0deg, rgba(239,68,68,0.15) 35deg, transparent 80deg, rgba(239,68,68,0.7) 180deg, rgba(239,68,68,0.15) 215deg, transparent 260deg)",
            }}
          />
        </div>
      )}

      {/* Subtle Scanlines & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,rgba(0,0,0,0.95)_80%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 z-0" />

      {/* TOP HEADER: Category & Recon Target */}
      <div className="absolute top-6 z-20 flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-5 py-1.5 rounded-full border border-purple-500/50 bg-purple-950/40 text-purple-300 font-mono tracking-[0.25em] text-xs uppercase font-bold mb-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          {t("sensor.tvBadge")}
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          {currentImage.category || t("sensor.tvPrompt")}
        </h2>
      </div>

      {/* Active unblurring image screen */}
      {gameState === "sensor_active" && (
        <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_100px_rgba(168,85,247,0.35)] bg-black/80 backdrop-blur-2xl mt-12 flex flex-col items-center justify-center">
          
          {/* Compositor-only blur layers (hardware-accelerated, 60 FPS APU friendly) */}
          <motion.div
            key={currentImage.url}
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ opacity: { duration: DURATION.slow }, scale: { duration: SENSOR_REVEAL_SEC, ease: "linear" } }}
            className="absolute inset-0"
          >
            <img src={currentImage.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {SENSOR_BLUR_LAYERS.map(({ blur, from, to }) => (
              <motion.img
                key={blur}
                src={currentImage.url}
                alt=""
                aria-hidden="true"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: from, duration: to - from, ease: "linear" }}
                style={{ filter: `blur(${blur}px) contrast(${100 + blur}%)` }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ))}
          </motion.div>

          {/* 4 Precision Corner Reticles */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-20 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-20 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-20 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-20 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />

          {/* Center Optical Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-35">
            <div className="w-16 h-16 rounded-full border border-purple-400/60 flex items-center justify-center">
              <div className="w-5 h-0.5 bg-cyan-300" />
              <div className="w-0.5 h-5 bg-cyan-300 absolute" />
            </div>
          </div>

          {/* Vertical Laser Scanline */}
          <motion.div
            animate={{ y: ["0%", "530%", "0%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_rgba(34,211,238,0.95)] pointer-events-none z-20"
          />

          {/* Top-Left Telemetry Badge */}
          <div className="absolute top-5 left-5 bg-black/85 px-4 py-2 text-cyan-400 font-mono font-bold tracking-[0.2em] text-[11px] rounded-xl border border-cyan-500/40 shadow-lg backdrop-blur-md flex items-center gap-2 z-20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{t("sensor.scanActive")}</span>
          </div>

          {/* Top-Right Active Buzzer Badge with Equalizer */}
          <div className="absolute top-5 right-5 bg-black/85 px-4 py-2 text-purple-300 font-mono font-bold tracking-[0.25em] text-[11px] rounded-xl border border-purple-500/50 shadow-lg backdrop-blur-md flex items-center gap-2.5 z-20">
            <div className="flex items-center gap-0.5 h-3">
              {[0.4, 0.9, 0.6, 1].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.5 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-full bg-purple-400 rounded-full origin-bottom"
                />
              ))}
            </div>
            <span>{t("sensor.buzzerActive")}</span>
          </div>

          {/* Bottom Telemetry Metadata */}
          <div className="absolute bottom-5 left-5 text-purple-300/80 font-mono text-[10px] tracking-widest uppercase bg-black/75 px-3 py-1.5 rounded-lg border border-purple-500/30 z-20">
            OPTICAL SENSOR // 8K • ISO-3200
          </div>
          <div className="absolute bottom-5 right-5 text-cyan-300/80 font-mono text-[10px] tracking-widest uppercase bg-black/75 px-3 py-1.5 rounded-lg border border-cyan-500/30 z-20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{t("sensor.analyzing")}</span>
          </div>

          {/* High-Tech Segmented Reveal Energy Rail */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-black/80 z-20">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: SENSOR_REVEAL_SEC, ease: "linear" }}
              className="h-full origin-left bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-300 shadow-[0_0_20px_rgba(34,211,238,0.9)]"
            />
          </div>
        </div>
      )}

      {/* Buzzed State: Tactical Intercept Mode */}
      {gameState === "sensor_buzzed" && (
        <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_140px_rgba(239,68,68,0.5)] border-2 border-red-500/70 mt-12">
          {/* Blurred background image */}
          <img 
            src={currentImage.url}
            className="w-full h-full object-cover grayscale opacity-25"
            style={{ filter: "blur(25px)" }} 
            alt=""
          />
          
          {/* Diagonal Hazard Warning Stripes on Edges */}
          <div
            className="absolute top-0 inset-x-0 h-3 z-30 opacity-80"
            style={{
              background: "repeating-linear-gradient(45deg, #ef4444, #ef4444 12px, #000 12px, #000 24px)",
            }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-3 z-30 opacity-80"
            style={{
              background: "repeating-linear-gradient(45deg, #ef4444, #ef4444 12px, #000 12px, #000 24px)",
            }}
          />

          <div className="absolute inset-0 bg-red-950/60 backdrop-blur-md flex flex-col items-center justify-center p-8 z-20">
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
              className="bg-black/90 border-2 border-red-500 p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center max-w-2xl w-full backdrop-blur-2xl flex flex-col items-center relative overflow-hidden"
            >
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-500" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-red-500" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-red-500" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-500" />

              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl animate-bounce">🚨</span>
                <h2 className="text-3xl text-red-500 font-black tracking-widest uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                  {t("sensor.stop")}
                </h2>
                <span className="text-3xl animate-bounce">🚨</span>
              </div>
              
              <div className="flex items-center gap-2 mb-6 px-6 py-2 rounded-2xl bg-red-500/10 border border-red-500/30">
                <span className="text-amber-400 text-xl">⚡</span>
                <p className="text-2xl text-white font-black tracking-wide">
                  <span className="text-red-400 uppercase font-mono">{buzzerPlayerName || t("sensor.someone")}</span> {t("sensor.buzzedSuffix")}
                </p>
              </div>
              
              {room.sensor_player_answer ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="mb-8 bg-red-950/40 border-2 border-red-500/40 rounded-2xl p-6 w-full shadow-inner"
                >
                  <p className="text-red-400 text-xs mb-2 uppercase tracking-widest font-mono font-bold">
                    {t("sensor.playerGuess")}
                  </p>
                  <p className="text-4xl md:text-5xl font-black text-white tracking-wide uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]">
                    "{safeForDisplay(room.sensor_player_answer)}"
                  </p>
                </motion.div>
              ) : (
                <div className="mb-8 flex flex-col items-center gap-4">
                  {/* Digital Equalizer Audio Waveform */}
                  <div className="flex items-center justify-center gap-2 h-10 px-6 py-2 rounded-xl bg-red-950/30 border border-red-500/30">
                    {[0.3, 0.7, 1, 0.5, 0.9, 0.4, 0.8, 0.6, 0.2].map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{ scaleY: [0.2, 1, 0.2] }}
                        transition={{ duration: 0.5 + (i % 3) * 0.15, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1.5 h-full bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] origin-center"
                      />
                    ))}
                  </div>
                  <span className="text-red-300 font-mono font-bold uppercase tracking-widest text-sm">
                    {t("sensor.waitingAnswer")}
                  </span>
                  
                  <button
                    onClick={() => onEvaluate(false)}
                    className="mt-2 text-xs text-white/50 hover:text-white uppercase tracking-widest border border-white/20 hover:border-white/50 px-5 py-2 transition-all rounded-full hover:bg-white/5"
                  >
                    {t("sensor.releaseBuzzer")}
                  </button>
                </div>
              )}

              {/* Host Evaluation Buttons: 3D Arcade Pushers */}
              {room.sensor_player_answer && (
                <div className="flex justify-center gap-4 w-full">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onEvaluate(true)}
                    className="flex-1 py-4 bg-gradient-to-t from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 border border-emerald-300 text-white rounded-2xl font-black uppercase tracking-wider text-lg transition-all shadow-[0_0_35px_rgba(16,185,129,0.55)] flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">✅</span> {t("sensor.correct")} (+100)
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onEvaluate(false)}
                    className="flex-1 py-4 bg-gradient-to-t from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 border border-red-500 text-red-300 rounded-2xl font-black uppercase tracking-wider text-lg transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">❌</span> {t("sensor.wrong")}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
