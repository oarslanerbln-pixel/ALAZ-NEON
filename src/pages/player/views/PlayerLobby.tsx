import { motion } from "framer-motion";
import { KineticSpark } from "../../../components/KineticSpark";

export function PlayerLobby() {
  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col items-center justify-center text-center py-12"
    >
      <KineticSpark />
      <h2 className="text-3xl font-black font-mono text-hacker-green animate-glitch mt-8 mb-4">
        &gt; AĞA_BAĞLANILDI
      </h2>
      <p className="text-cyber-yellow/80 font-mono max-w-xs mx-auto mb-10 leading-relaxed">
        Diğer sistemler bekleniyor. Veri akışı başlamak üzere...
      </p>
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="w-3 h-3 rounded-none bg-hacker-green shadow-[0_0_15px_#00ff41]"
          />
        ))}
      </div>
    </motion.div>
  );
}
