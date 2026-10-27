import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-xl w-full"
      >
        <h1 className="mb-8 text-[120px] md:text-[180px] font-black text-accent leading-none">
          404
        </h1>

        <div className="flex items-center gap-3 mb-4 text-white">
          <AlertTriangle className="w-8 h-8 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.2em]">
            Sinyal Kaybedildi
          </h2>
        </div>

        <p className="text-gray-400 mb-10 text-sm md:text-base tabular-nums uppercase max-w-md opacity-80 leading-relaxed">
          Aradığınız dijital frekansa ulaşılamıyor. Sektör değiştirilmiş veya sistemden silinmiş olabilir.
        </p>

        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest"
          >
            <Home className="w-5 h-5" />
            <span>Ana Merkeze Dön</span>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
