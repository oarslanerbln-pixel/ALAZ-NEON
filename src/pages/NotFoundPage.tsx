import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

import { useLocale } from "../hooks/useLocale";
import { DURATION, EASE } from "../lib/motion";

export function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-bg overflow-hidden px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.out }}
        className="relative z-10 flex flex-col items-center text-center max-w-xl w-full"
      >
        <p aria-hidden="true" className="mb-6 text-[120px] md:text-[180px] font-extrabold text-accent leading-none tabular-nums">
          404
        </p>

        <h1 className="mb-3 text-2xl md:text-3xl font-extrabold text-ink">{t("notFound.title")}</h1>

        <p className="mb-10 max-w-md text-base text-ink-2 leading-relaxed">{t("notFound.body")}</p>

        <Link to="/" className="btn-primary gap-3 px-8 py-4 uppercase tracking-widest">
          <Home className="w-5 h-5" aria-hidden="true" />
          <span>{t("game.backHome")}</span>
        </Link>
      </motion.div>
    </div>
  );
}
