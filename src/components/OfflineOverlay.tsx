import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "../hooks/useLocale";
import { WifiOff } from "lucide-react";

export function OfflineOverlay() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { t } = useLocale();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none p-4"
        >
          <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-[0_0_30px_rgba(255,0,0,0.5)] flex items-center gap-3 font-bold uppercase tracking-widest text-sm">
            <WifiOff className="w-5 h-5 animate-pulse" />
            <span>{t("common.offline", "BAĞLANTI KOPTU, YENİDEN BAĞLANILIYOR...")}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
