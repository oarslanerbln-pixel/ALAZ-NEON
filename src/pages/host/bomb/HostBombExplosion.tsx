import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { useLocale } from "../../../hooks/useLocale";
import { playGermanVoiceover } from "../../../lib/germanVoiceover";

interface Props {
  room: Room;
  players: Player[];
  onComplete: () => void;
}

export function HostBombExplosion({ room, players, onComplete }: Props) {
  const { t } = useLocale();
  const targetPlayer = players.find((p) => p.id === room.bomb_target_player);
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Patlama Almanca seslendirmesi
    playGermanVoiceover("bomb_exploded", 1.0);

    // 6 seconds explosion and result screen
    const t = setTimeout(() => {
      onCompleteRef.current();
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  // Patlayan oyuncu bu arada odadan ayrıldıysa siyah ekran yerine isimsiz
  // patlama gösterilir; 6 sn sonra oyun her durumda ilerler.
  const currentLives = targetPlayer?.lives !== undefined ? targetPlayer.lives : 3;

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-black relative overflow-hidden">
      {/* Kısa patlama flaşı */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute inset-0 bg-white z-[100] pointer-events-none"
      />

      {/* Screen Shake Container */}
      <motion.div 
        animate={{ 
          x: [0, -20, 20, -20, 20, -10, 10, -5, 5, 0],
          y: [0, 20, -20, 20, -20, 10, -10, 5, -5, 0]
        }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.25, ease: "easeOut" }}
          className="text-center z-20 flex flex-col items-center relative w-full max-w-4xl px-4"
        >
          <div className="text-5xl md:text-8xl font-black text-bad uppercase tracking-tighter mb-4">
            {t("bomb.exploded")}
          </div>

          <div className="surface w-full p-10 md:p-14 mt-6 rounded-[3rem] relative">
            <p className="text-xl font-bold text-accent uppercase tracking-[0.4em] mb-4">{t("bomb.livesLost")}</p>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter">
              {targetPlayer?.nickname ?? "—"}
            </h1>

            <div className="flex gap-8 justify-center mt-12">
              {Array.from({ length: 3 }).map((_, i) => {
                const wasLostThisRound = i === currentLives;
                const isAlive = i < currentLives;
                return (
                  <motion.div
                    key={i}
                    initial={wasLostThisRound ? { scale: 1, opacity: 1 } : false}
                    animate={wasLostThisRound ? { scale: [1, 1.4, 0.85], opacity: [1, 1, 0.4] } : false}
                    transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
                    className="relative flex items-center justify-center w-16 h-16"
                  >
                    {isAlive ? (
                      <svg viewBox="0 0 24 24" fill="var(--color-bad)" className="w-14 h-14">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : wasLostThisRound ? (
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-bad)" strokeWidth="2.5" className="w-full h-full">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          <line x1="3" y1="3" x2="21" y2="21" stroke="var(--color-bad)" strokeWidth="3" />
                        </svg>
                      </div>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" className="w-14 h-14 opacity-30">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        <line x1="3" y1="3" x2="21" y2="21" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                      </svg>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {currentLives === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.25, ease: "easeOut" }}
                className="mt-12 bg-bad py-4 px-12 rounded-full inline-block"
              >
                <p className="text-3xl font-black text-white uppercase tracking-[0.3em]">
                  {t("bomb.eliminated")}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
