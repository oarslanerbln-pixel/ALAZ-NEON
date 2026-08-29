import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import type { SensorImage } from "../../../data/sensorImages";

interface Props {
  currentImage: SensorImage;
  buzzerPlayerName: string | null;
  onNextRound: () => void;
}

export function HostSensorReveal({ currentImage, buzzerPlayerName, onNextRound }: Props) {
  const { t } = useLocale();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black w-full h-full">
      {/* Premium Glassmorphism Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15)_0%,rgba(0,0,0,1)_70%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {/* Floating Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2], opacity: [0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
        className="absolute w-[60vh] h-[60vh] rounded-full bg-green-600/10 blur-[100px]"
      />

      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 w-full max-w-5xl flex flex-col items-center"
      >
        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-green-500/50 shadow-[0_0_100px_rgba(34,197,94,0.3)] mb-10 relative">
          <img 
            src={currentImage.url}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
        
        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80 mb-4 uppercase tracking-widest drop-shadow-md text-center">
          {currentImage.answer}
        </h2>
        
        <div className="bg-green-500/10 border border-green-500/30 px-8 py-3 rounded-full mb-12 backdrop-blur-md">
          <p className="text-2xl text-green-400 font-bold tracking-widest uppercase">
            {t("sensor.wonPoints", buzzerPlayerName || "")}
          </p>
        </div>

        <button
          onClick={onNextRound}
          className="relative group overflow-hidden rounded-xl bg-white text-black px-12 py-5 transition-all hover:bg-green-400 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat group-hover:animate-shine" />
          <span className="relative text-2xl font-black uppercase tracking-widest">
            {t("sensor.nextRound")}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
