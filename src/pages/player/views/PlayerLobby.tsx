import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";

export function PlayerLobby() {
  const { t } = useLocale();
  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      className="h-full flex flex-col items-center justify-center text-center p-8 bg-black relative overflow-hidden"
    >
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-0" />
      
      {/* Cinematic Letterbox Lines */}
      <div className="absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Sleek rotating outer rings */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[0.5px] border-white/5 border-t-white/30 border-b-white/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-[0.5px] border-white/10 border-l-white/40"
          />
          {/* Pulsing Core */}
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
          />
        </div>

        <motion.h2 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-lg md:text-xl font-light text-white tracking-[0.4em] mb-4 uppercase"
        >
          {t("lobby.networkConnected")}
        </motion.h2>
        
        <p className="text-zinc-600 font-light text-[10px] uppercase tracking-[0.3em] max-w-xs mx-auto leading-loose">
          {t("lobby.waitingSystems")}
        </p>
      </div>
    </motion.div>
  );
}
