import { motion } from "framer-motion";
import { KineticSpark } from "../../../components/KineticSpark";
import { useLocale } from "../../../hooks/useLocale";

export function PlayerStandings() {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
    >
      <KineticSpark />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <div className="w-16 h-16 rounded-full border-2 border-alaz-orange border-t-transparent animate-spin mx-auto mb-6" />
        
        <h2 className="text-3xl font-black font-mono text-glow-alaz text-alaz-orange uppercase mb-4 tracking-[0.2em]">
          {t("standings.playerTitle")}
        </h2>
        
        <p className="text-gray-400 font-mono text-sm max-w-xs mx-auto">
          {t("standings.playerDesc")}
        </p>
      </motion.div>
    </motion.div>
  );
}
