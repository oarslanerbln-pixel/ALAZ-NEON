import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import type { Room } from "../../../types/database";
import type { SensorImage } from "../../../data/sensorImages";
import { safeForDisplay } from "../../../lib/profanity";
import { SoundManager, sounds } from "../../../lib/audio";

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
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,rgba(0,0,0,1)_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

      {/* TOP HEADER: Category & Clue */}
      <div className="absolute top-8 z-20 flex flex-col items-center">
        <span className="px-5 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-400 font-mono tracking-widest text-xs uppercase font-bold mb-1">
          👁️ SENSÖR • GÖRSEL TAHMİN 👁️
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
          {currentImage.category || "BU GÖRSELİ İLK KİM BİLECEK?"}
        </h2>
      </div>

      {/* Active unblurring image screen */}
      {gameState === "sensor_active" && (
        <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-[0_0_90px_rgba(168,85,247,0.3)] bg-black/60 backdrop-blur-xl mt-12 flex flex-col items-center justify-center">
          
          {/* Animated Image with Progressive Unblur */}
          <motion.img 
            key={currentImage.url}
            src={currentImage.url}
            initial={{ filter: "blur(40px) contrast(150%)", scale: 1.15, opacity: 0 }}
            animate={{ filter: "blur(0px) contrast(100%)", scale: 1, opacity: 1 }}
            transition={{ 
              opacity: { duration: 0.6 },
              filter: { duration: 25, ease: "linear" },
              scale: { duration: 25, ease: "linear" }
            }}
            className="w-full h-full object-cover"
          />
          
          {/* Active Buzzer Ready Badge */}
          <div className="absolute top-6 right-6 bg-black/85 px-6 py-3 text-purple-400 font-mono font-bold uppercase tracking-[0.3em] text-xs rounded-xl border border-purple-500/50 shadow-lg animate-pulse backdrop-blur-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
            {t("sensor.buzzerActive")}
          </div>

          {/* Progress / Reveal Bar at the bottom */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-black/60">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 25, ease: "linear" }}
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
            />
          </div>
        </div>
      )}

      {/* Buzzed State */}
      {gameState === "sensor_buzzed" && (
        <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(239,68,68,0.4)] border-2 border-red-500/60 mt-12">
          <img 
            src={currentImage.url}
            className="w-full h-full object-cover grayscale opacity-30"
            style={{ filter: "blur(25px)" }} 
          />
          
          <div className="absolute inset-0 bg-red-950/60 backdrop-blur-md flex flex-col items-center justify-center p-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-black/90 border-2 border-red-500 p-10 rounded-3xl shadow-2xl text-center max-w-2xl w-full backdrop-blur-2xl flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl animate-bounce">🚨</span>
                <h2 className="text-3xl text-red-500 font-black tracking-widest uppercase">
                  {t("sensor.stop")}
                </h2>
              </div>
              
              <p className="text-2xl text-white font-black mb-6 tracking-wide">
                ⚡ <span className="text-red-400 uppercase">{buzzerPlayerName || "BİRİ"}</span> BASTI!
              </p>
              
              {room.sensor_player_answer ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 bg-white/5 border border-white/15 rounded-2xl p-6 w-full"
                >
                  <p className="text-red-400 text-xs mb-2 uppercase tracking-widest font-mono">
                    OYUNCUNUN TAHMİNİ:
                  </p>
                  <p className="text-4xl md:text-5xl font-black text-white tracking-wide uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">
                    "{safeForDisplay(room.sensor_player_answer)}"
                  </p>
                </motion.div>
              ) : (
                <div className="mb-8 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-red-500 animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    <span className="w-4 h-4 rounded-full bg-red-500 animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.8)]" style={{ animationDelay: "0.2s" }} />
                    <span className="w-4 h-4 rounded-full bg-red-500 animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.8)]" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <span className="text-red-300 font-mono font-bold uppercase tracking-widest text-sm">
                    {t("sensor.waitingAnswer")}
                  </span>
                  
                  <button
                    onClick={() => onEvaluate(false)}
                    className="mt-2 text-xs text-white/50 hover:text-white uppercase tracking-widest border border-white/20 hover:border-white/50 px-5 py-2 transition-all rounded-full"
                  >
                    {t("sensor.releaseBuzzer")}
                  </button>
                </div>
              )}

              {/* Host Evaluation Buttons */}
              {room.sensor_player_answer && (
                <div className="flex justify-center gap-4 w-full">
                  <button 
                    onClick={() => onEvaluate(true)}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white rounded-2xl font-black uppercase tracking-wider text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>✅</span> {t("sensor.correct")} (+1000)
                  </button>
                  <button 
                    onClick={() => onEvaluate(false)}
                    className="flex-1 py-4 bg-red-950 hover:bg-red-900 border border-red-500 text-red-400 rounded-2xl font-black uppercase tracking-wider text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>❌</span> {t("sensor.wrong")}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
