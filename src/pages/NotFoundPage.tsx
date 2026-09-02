import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,rgba(0,0,0,1)_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />

      {/* Floating Particles (Simulated simply) */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-[800px] h-[800px] rounded-full border border-purple-500/10 border-dashed absolute opacity-30"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.5, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-[600px] h-[600px] rounded-full border border-fuchsia-500/10 border-dashed absolute opacity-20"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-xl w-full"
      >
        <motion.div
          animate={{ 
            boxShadow: ["0px 0px 0px rgba(168,85,247,0)", "0px 0px 100px rgba(168,85,247,0.4)", "0px 0px 0px rgba(168,85,247,0)"]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-8 relative"
        >
          {/* Glitch Effect Text */}
          <h1 className="text-[120px] md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-fuchsia-600 leading-none drop-shadow-[0_0_40px_rgba(168,85,247,0.8)] relative z-10 mix-blend-screen">
            404
          </h1>
          
          <motion.h1 
            animate={{ x: [-2, 2, -1, 3, -2], opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror" }}
            className="text-[120px] md:text-[180px] font-black text-cyan-400 leading-none absolute top-0 left-[2px] z-0 opacity-50 mix-blend-screen"
          >
            404
          </motion.h1>
          <motion.h1 
            animate={{ x: [2, -2, 1, -3, 2], opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
            className="text-[120px] md:text-[180px] font-black text-pink-500 leading-none absolute top-0 -left-[2px] z-0 opacity-50 mix-blend-screen"
          >
            404
          </motion.h1>
        </motion.div>

        <div className="flex items-center gap-3 mb-4 text-purple-300">
          <AlertTriangle className="w-8 h-8 animate-pulse text-fuchsia-500" />
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.2em]">
            Sinyal Kaybedildi
          </h2>
        </div>

        <p className="text-gray-400 mb-10 text-sm md:text-base font-mono uppercase max-w-md opacity-80 leading-relaxed">
          Aradığınız dijital frekansa ulaşılamıyor. Sektör değiştirilmiş veya sistemden silinmiş olabilir.
        </p>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168,85,247,0.6)" }}
            whileTap={{ scale: 0.95 }}
            className="relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-4 bg-purple-600/20 border border-purple-500/50 rounded-2xl text-purple-200 font-bold uppercase tracking-widest backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/40 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <Home className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Ana Merkeze Dön</span>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
