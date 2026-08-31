import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import type { Room } from "../../../types/database";
import type { SensorImage } from "../../../data/sensorImages";
import { safeForDisplay } from "../../../lib/profanity";

interface Props {
  room: Room;
  currentImage: SensorImage;
  buzzerPlayerName: string | null;
  onEvaluate: (isCorrect: boolean) => void;
}

export function HostSensorActive({ room, currentImage, buzzerPlayerName, onEvaluate }: Props) {
  const { t } = useLocale();
  const gameState = room.status;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black w-full h-full">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,rgba(0,0,0,1)_80%)]" />

      {/* Sensor Active State */}
      {gameState === "sensor_active" && (
        <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_80px_rgba(168,85,247,0.2)] bg-black/50 backdrop-blur-xl">
          {/* Animated Image */}
          <motion.img 
            key={currentImage.url} // Critical: Force re-mount for animation to trigger
            src={currentImage.url}
            initial={{ filter: "blur(30px)", scale: 1.1, opacity: 0 }}
            animate={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
            transition={{ 
              opacity: { duration: 0.5 },
              filter: { duration: 30, ease: "linear" },
              scale: { duration: 30, ease: "linear" }
            }}
            className="w-full h-full object-cover"
          />
          
          {/* Badge */}
          <div className="absolute top-6 right-6 bg-black/80 px-6 py-3 text-purple-400 font-bold uppercase tracking-[0.3em] text-sm rounded-lg border border-purple-500/30 shadow-lg animate-pulse backdrop-blur-md">
            {t("sensor.buzzerActive")}
          </div>

          {/* Frame glow */}
          <div className="absolute inset-0 border-[3px] border-purple-500/10 mix-blend-overlay pointer-events-none rounded-2xl" />
        </div>
      )}

      {/* Sensor Buzzed State */}
      {gameState === "sensor_buzzed" && (
        <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_120px_rgba(239,68,68,0.3)] border border-red-500/50">
          <img 
            src={currentImage.url}
            className="w-full h-full object-cover grayscale opacity-50"
            style={{ filter: "blur(20px)" }} 
          />
          
          <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm flex flex-col items-center justify-center p-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-black/80 border border-red-500/50 p-12 rounded-3xl shadow-2xl text-center max-w-2xl w-full backdrop-blur-xl"
            >
              <h2 className="text-4xl text-red-500 font-black mb-4 tracking-[0.2em] uppercase">
                {t("sensor.stop")}
              </h2>
              <p className="text-2xl text-white font-medium mb-10 tracking-wider">
                {t("sensor.pressedBuzzer", buzzerPlayerName || "")}
              </p>
              
              {room.sensor_player_answer ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                  <p className="text-red-400/60 text-sm mb-3 uppercase tracking-widest">{t("sensor.answerLabel")}</p>
                  <p className="text-5xl font-black text-white tracking-wide">
                    "{safeForDisplay(room.sensor_player_answer)}"
                  </p>
                </motion.div>
              ) : (
                <div className="mb-12 flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center gap-4">
                    <span className="w-5 h-5 rounded-full bg-red-500 animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    <span className="w-5 h-5 rounded-full bg-red-500 animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.8)]" style={{ animationDelay: "0.2s" }} />
                    <span className="w-5 h-5 rounded-full bg-red-500 animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.8)]" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <span className="text-red-400 font-bold uppercase tracking-widest text-lg">
                    {t("sensor.waitingAnswer")}
                  </span>
                  
                  <button
                    onClick={() => onEvaluate(false)}
                    className="mt-4 text-xs text-white/30 hover:text-white/80 uppercase tracking-widest border border-white/10 hover:border-white/30 px-6 py-2 transition-colors rounded-full"
                  >
                    {t("sensor.releaseBuzzer")}
                  </button>
                </div>
              )}

              {room.sensor_player_answer && (
                <div className="flex justify-center gap-6">
                  <button 
                    onClick={() => onEvaluate(true)}
                    className="flex-1 py-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all active:scale-95"
                  >
                    {t("sensor.correct")}
                  </button>
                  <button 
                    onClick={() => onEvaluate(false)}
                    className="flex-1 py-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                  >
                    {t("sensor.wrong")}
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
