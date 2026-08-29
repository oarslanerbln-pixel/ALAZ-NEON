import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import type { SensorImage } from "../../../data/sensorImages";

interface Props {
  currentImageIndex: number;
  currentImage: SensorImage;
  onStartRound: () => void;
}

export function HostSensorIntro({ currentImageIndex, currentImage, onStartRound }: Props) {
  const { t } = useLocale();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black w-full h-full">
      {/* Premium Glassmorphism Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,rgba(0,0,0,1)_70%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {/* Floating Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2], opacity: [0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
        className="absolute w-[60vh] h-[60vh] rounded-full bg-purple-600/10 blur-[100px]"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-center relative z-10 flex flex-col items-center"
      >
        <span className="text-purple-500/60 uppercase tracking-[1em] text-sm font-bold mb-6 block">
          SENSOR
        </span>
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] leading-tight mb-4">
          {t("sensor.roundLabel", currentImageIndex + 1)}
        </h1>
        
        <div className="mb-12 px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <p className="text-2xl text-gray-400 uppercase tracking-widest">
            {t("sensor.categoryLabel")} <span className="text-white font-black">{currentImage.category}</span>
          </p>
        </div>

        <button
          onClick={onStartRound}
          className="relative group overflow-hidden rounded-xl bg-purple-600 px-12 py-5 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95 border border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat group-hover:animate-shine" />
          <span className="relative text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">
            {t("sensor.openImage")}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
