import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { useLocale } from "../../../hooks/useLocale";
import { CardSpotlight, KineticText } from "../../../components/fx";
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
      {/* Intense Blinding Flash */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 bg-white z-[100] pointer-events-none mix-blend-overlay"
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
        {/* Massive Mushroom Cloud / Fire Background */}
        <motion.div
          initial={{ scale: 0.1, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1),rgba(255,0,60,1),transparent_70%)] pointer-events-none mix-blend-screen"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.5 }}
          transition={{ duration: 5, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,50,0,1),transparent_70%)] pointer-events-none mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.2] mix-blend-overlay" />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring", bounce: 0.4 }}
          className="text-center z-20 flex flex-col items-center relative w-full max-w-4xl px-4"
        >
          <div className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#ff003c] uppercase tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(255,0,60,1)]">
            <KineticText text={t("bomb.exploded")} by="character" stagger={0.03} />
          </div>
          
          <CardSpotlight 
            tone="pink" 
            ambient={true} 
            className="w-full bg-black/70 border-2 border-[#ff003c]/40 backdrop-blur-2xl p-10 md:p-14 mt-6 rounded-[3rem] shadow-[0_0_100px_rgba(255,0,60,0.3)] relative"
          >
            {/* Cyberpunk corner cuts */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#ff003c]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#ff003c]" />

            <p className="text-xl font-bold text-[#ff4d00] uppercase tracking-[0.4em] mb-4">{t("bomb.livesLost")}</p>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,0,60,0.8)]">
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
                      <svg viewBox="0 0 24 24" fill="#ff0055" className="w-14 h-14 filter drop-shadow-[0_0_20px_#ff0055]">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : wasLostThisRound ? (
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#ff003c" strokeWidth="2.5" className="w-full h-full animate-pulse filter drop-shadow-[0_0_15px_#ff003c]">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          <line x1="3" y1="3" x2="21" y2="21" stroke="#ff003c" strokeWidth="3" />
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
                transition={{ delay: 2.5, type: "spring", bounce: 0.7 }}
                className="mt-12 bg-[#ff003c] py-4 px-12 rounded-full shadow-[0_0_40px_rgba(255,0,60,0.6)] inline-block"
              >
                <p className="text-3xl font-black text-white uppercase tracking-[0.3em]">
                  {t("bomb.eliminated")}
                </p>
              </motion.div>
            )}
          </CardSpotlight>
        </motion.div>
      </motion.div>
    </div>
  );
}
