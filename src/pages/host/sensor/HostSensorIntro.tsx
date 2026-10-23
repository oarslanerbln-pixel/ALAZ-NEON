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
      {/* Volumetric Studio Cones */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 left-[15%] w-[480px] h-[800px] opacity-30 blur-3xl"
          style={{
            background: "conic-gradient(from 180deg at 50% 0%, rgba(168,85,247,0.55) 0deg, rgba(147,51,234,0.18) 35deg, transparent 70deg)",
            transform: "rotate(-12deg)",
          }}
        />
        <div
          className="absolute -top-32 right-[15%] w-[480px] h-[800px] opacity-30 blur-3xl"
          style={{
            background: "conic-gradient(from 180deg at 50% 0%, rgba(192,132,252,0.55) 0deg, rgba(168,85,247,0.18) 35deg, transparent 70deg)",
            transform: "rotate(12deg)",
          }}
        />
      </div>

      {/* Ambient Radial Gradient & Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />

      {/* 3D Optical Aperture / Iris Chamber */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Mechanical Concentric Radar Rings */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-8">
          {/* Outer Ring - Clockwise */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/40"
          />
          
          {/* Outer Tick Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 rounded-full border border-purple-400/20 flex items-center justify-center"
          >
            <span className="absolute top-1 text-[9px] font-mono text-purple-400/60 font-bold">000°</span>
            <span className="absolute right-1 text-[9px] font-mono text-purple-400/60 font-bold">090°</span>
            <span className="absolute bottom-1 text-[9px] font-mono text-purple-400/60 font-bold">180°</span>
            <span className="absolute left-1 text-[9px] font-mono text-purple-400/60 font-bold">270°</span>
          </motion.div>

          {/* Middle Ring - Counter Clockwise */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full border-2 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            style={{ borderStyle: "double" }}
          />

          {/* Glowing Aperture Core with Iris Icon */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-40 h-40 rounded-full bg-gradient-to-b from-purple-600/30 via-purple-950/60 to-black border-2 border-purple-400/70 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex flex-col items-center justify-center backdrop-blur-md"
          >
            <span className="text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">👁️</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400 font-bold mt-1">
              OPTIC RECON
            </span>
          </motion.div>
        </div>

        {/* Round Header & Stencil Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center flex flex-col items-center"
        >
          <span className="px-4 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 font-mono tracking-[0.3em] text-xs uppercase font-bold mb-3 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            HENGAME SENSÖR
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-purple-200 uppercase tracking-widest drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] leading-tight mb-4">
            {t("sensor.roundLabel", currentImageIndex + 1)}
          </h1>
          
          {/* Target Category Card */}
          <div className="mb-10 px-8 py-3.5 rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              {t("sensor.categoryLabel")}
            </span>
            <span className="text-2xl md:text-3xl text-white font-black uppercase tracking-wider">
              {currentImage.category}
            </span>
          </div>

          {/* High-Impact Launch Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartRound}
            className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-14 py-5 transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)] border border-purple-300/60"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat group-hover:animate-shine" />
            <div className="relative flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">
              <span>⚡</span>
              <span>{t("sensor.openImage")}</span>
              <span>⚡</span>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
