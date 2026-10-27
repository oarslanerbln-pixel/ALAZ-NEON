import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Room } from "../../../types/database";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  onComplete: () => void;
}

export function HostBombIntro({ room, onComplete }: Props) {
  const { t } = useLocale();
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // 5 seconds cinematic intro
    const t = setTimeout(() => {
      onCompleteRef.current();
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#050002] relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="z-10 w-full max-w-3xl px-4"
      >
        <div className="surface text-center p-12 md:p-16 rounded-[3rem] relative">
          <div className="text-xl md:text-2xl font-black text-gray-400 uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-4">
            <span className="w-12 h-[2px] bg-accent/40" />
            <span>{t("bomb.category")}</span>
            <span className="w-12 h-[2px] bg-accent/40" />
          </div>

          <motion.h1
            className="text-7xl md:text-9xl font-black text-accent uppercase tracking-tighter"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.25, ease: "easeOut" }}
          >
            {room.active_letter}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.25 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 3.5, ease: "linear" }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            <p className="text-sm text-accent font-bold uppercase tracking-[0.3em]">
              {t("bomb.activating")}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
