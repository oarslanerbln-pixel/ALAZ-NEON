import { useEffect, useState, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { playGermanVoiceover } from "../../../lib/germanVoiceover";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";
import { pickBombHolder } from "../../../lib/bomb";
import { CardSpotlight, ShimmerButton } from "../../../components/fx";
import { SPRING } from "../../../lib/motion";
import { Cyber3DBomb } from "./Cyber3DBomb";

/** Sol listede kaydırmasız gösterilen en fazla oyuncu (1080'lik tuvale göre). */
const BOMB_ROSTER_MAX = 12;

function CyberHeart({ active, size = "md" }: { active: boolean; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  return (
    <div className={`relative ${dim} flex items-center justify-center shrink-0`}>
      {active ? (
        <svg viewBox="0 0 24 24" fill="#ff0055" className="w-full h-full filter drop-shadow-[0_0_8px_#ff0055]">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" className="w-full h-full opacity-35">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          <line x1="4" y1="4" x2="20" y2="20" stroke="#ff003c" strokeWidth="2.5" />
        </svg>
      )}
    </div>
  );
}

interface Props {
  room: Room;
  players: Player[];
  onExplode: (playerId: string) => void;
}

export function HostBombActive({ room, players, onExplode }: Props) {
  const { t } = useLocale();
  const targetPlayer = players.find((p) => p.id === room.bomb_target_player);
  const [timeLeft, setTimeLeft] = useState(15);
  const onExplodeRef = useRef(onExplode);
  const bombControls = useAnimation();
  const containerControls = useAnimation();

  function remainingInterval(time: number) {
    if (time <= 3) return 400;
    if (time <= 6) return 600;
    return 1000;
  }
  
  useEffect(() => {
    onExplodeRef.current = onExplode;
  }, [onExplode]);

  const lastAppliedTargetIdRef = useRef<string | undefined>(targetPlayer?.id);
  const introPlayedRef = useRef(false);
  const announced10Ref = useRef(false);
  const announced5Ref = useRef(false);
  // Hangi fitilin (round_end_time) patlaması bildirildi. Efekt `timeLeft`'e
  // bağlı olduğu için 1→0 geçişinde yeniden kuruluyor ve yeni aralık da 0'ı
  // görüp onExplode'u ikinci kez çağırıyordu: tek patlamada 2 can gidiyordu.
  const explodedFuseRef = useRef<number | null>(null);

  useEffect(() => {
    if (!introPlayedRef.current) {
      introPlayedRef.current = true;
      playGermanVoiceover("bomb_intro", 0.9);
    }
  }, []);

  useEffect(() => {
    if (!room.round_end_time || !targetPlayer) return;

    let targetJustHandedOff = lastAppliedTargetIdRef.current !== targetPlayer.id;
    lastAppliedTargetIdRef.current = targetPlayer.id;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((room.round_end_time! - now) / 1000));
      setTimeLeft(remaining);

      // Voiceovers at critical time thresholds
      if (remaining === 10 && !announced10Ref.current) {
        announced10Ref.current = true;
        playGermanVoiceover("countdown_10s", 0.95);
      } else if (remaining === 5 && !announced5Ref.current) {
        announced5Ref.current = true;
        playGermanVoiceover("hurry_up", 0.95);
      }

      // Sound and intensity based on time left
      if (remaining <= 5 && remaining > 0) {
        SoundManager.getInstance().playSFX(sounds.TICK_URGENT);
        bombControls.start({
          scale: [1, 1.15, 1],
          rotate: [0, -5, 5, -5, 0],
          transition: { duration: 0.25, repeat: Infinity }
        });
        containerControls.start({
          x: [0, -12, 12, -12, 12, 0],
          y: [0, 12, -12, 12, -12, 0],
          transition: { duration: 0.2, repeat: Infinity }
        });
      } else {
        SoundManager.getInstance().playSFX(sounds.VOTE_TICK);
      }

      if (remaining === 0) {
        if (targetJustHandedOff) {
          targetJustHandedOff = false;
          return;
        }
        clearInterval(interval);
        if (explodedFuseRef.current === room.round_end_time) return;
        explodedFuseRef.current = room.round_end_time ?? null;
        onExplodeRef.current(targetPlayer.id);
      }
    }, remainingInterval(timeLeft));

    return () => clearInterval(interval);
  }, [room.round_end_time, targetPlayer, bombControls, containerControls, timeLeft]);

  // Handle bomb passing animation (when bomb_target_player changes)
  const prevTargetPlayer = useRef(room.bomb_target_player);
  useEffect(() => {
    if (prevTargetPlayer.current !== room.bomb_target_player) {
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
      bombControls.start({
        x: [0, 500, -500, 0],
        opacity: [1, 0, 0, 1],
        transition: { duration: 0.35 }
      });
      prevTargetPlayer.current = room.bomb_target_player;

      // Update timer and multiplier on the HOST side
      const speedMultiplier = Math.max(0.35, (room.bomb_speed_multiplier || 1.0) * 0.95);
      const newTime = 14000 * speedMultiplier;
      updateDoc(doc(db, "rooms", room.id), {
        bomb_speed_multiplier: speedMultiplier,
        round_end_time: Date.now() + newTime
      }).catch(console.error);
    }
  }, [room.bomb_target_player, bombControls, room.id, room.bomb_speed_multiplier]);

  // Bombayı tutan oyuncu oyundan ayrıldıysa (sekmesini kapattı, odadan
  // çıkarıldı) sayaç onun üzerinden işlediği için TV kararıyor ve oyun
  // kilitleniyordu. Host tek yazar: bombayı kalan oyunculardan birine devret;
  // yeni süreyi yukarıdaki "sahip değişti" efekti kuruyor.
  const reassignedFor = useRef<string | null>(null);
  useEffect(() => {
    const missing = room.bomb_target_player;
    if (targetPlayer || !missing || players.length === 0 || reassignedFor.current === missing) return;
    const next = pickBombHolder(players, missing);
    if (!next) return;
    reassignedFor.current = missing;
    updateDoc(doc(db, "rooms", room.id), { bomb_target_player: next, previous_bomb_target_player: null }).catch((err) => {
      reassignedFor.current = null;
      console.error("[Bomb] Bomba devredilemedi:", err);
    });
  }, [targetPlayer, room.bomb_target_player, room.id, players]);

  // Handle Reject Action
  const handleReject = async () => {
    if (!room.previous_bomb_target_player) return;
    
    SoundManager.getInstance().playSFX(sounds.FAILURE);
    try {
      await updateDoc(doc(db, "rooms", room.id), {
        bomb_target_player: room.previous_bomb_target_player,
        round_end_time: Date.now() + 3500,
        previous_bomb_target_player: null
      });
    } catch (err) {
      console.error("Failed to reject word:", err);
    }
  };

  if (!targetPlayer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#050002] gap-6">
        <span className="text-8xl motion-safe:animate-pulse" aria-hidden="true">💣</span>
        <p className="text-3xl font-black uppercase tracking-[0.2em] text-white/70">{t("bomb.changingHands")}</p>
      </div>
    );
  }

  const currentLives = targetPlayer.lives !== undefined ? targetPlayer.lives : 3;
  const usedWords = room.used_words || [];

  return (
    <motion.div 
      animate={containerControls}
      className={`flex-1 flex flex-col items-center justify-between h-full p-8 relative overflow-hidden transition-colors duration-300 ${
        timeLeft <= 4 ? 'bg-[#200008]' : 'bg-[#050002]'
      }`}
    >
      {/* Background Pulse Effect */}
      <motion.div 
        animate={{ 
          scale: timeLeft <= 5 ? [1, 1.25, 1] : [1, 1.05, 1],
          opacity: timeLeft <= 5 ? [0.5, 0.9, 0.5] : [0.2, 0.4, 0.2]
        }}
        transition={{ duration: Math.max(0.2, timeLeft / 10), repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,60,0.2),transparent_70%)] pointer-events-none mix-blend-screen" 
      />
      
      {/* Scanlines & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

      {/* TOP: Category Header */}
      <div className="w-full flex flex-col items-center justify-center z-20 pt-4">
        <span className="px-6 py-1.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 font-mono tracking-widest text-sm uppercase font-bold mb-2 shadow-[0_0_15px_rgba(255,0,60,0.3)]">
          💣 HENGAME BOMB 💣
        </span>
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-wider drop-shadow-[0_0_25px_rgba(255,0,60,0.9)]">
          {room.active_letter || t("bomb.generalCategory")}
        </h1>
      </div>

      {/* MIDDLE: Left (Players Status) + Center (Bomb) + Right (Stats) */}
      <div className="w-full max-w-7xl flex items-center justify-between z-10 px-6 gap-8">
        
        {/* Left Side: Players Roster & Lives */}
        <CardSpotlight 
          tone="pink" 
          ambient={true} 
          className="w-72 bg-black/70 border border-white/10 p-5 rounded-2xl backdrop-blur-md hidden lg:flex flex-col gap-3 shadow-[0_0_30px_rgba(0,0,0,0.6)]"
        >
          <h3 className="text-base font-mono uppercase tracking-widest text-gray-300 font-bold mb-1">
            {t("bomb.rosterTitle", players.length)}
          </h3>
          {/* Eskiden max-h-[40vh] + kaydırma çubuğu: TV'de kimse kaydıramıyor,
              40vh de tuvalin değil pencerenin yüksekliği. Kalabalıkta satırlar
              sıkışıyor, sığmayanlar alttaki sayaçla özetleniyor. */}
          <div className={`flex flex-col ${players.length > 8 ? "gap-1" : "gap-2"}`}>
            {players.slice(0, BOMB_ROSTER_MAX).map((p) => {
              const pLives = p.lives !== undefined ? p.lives : 3;
              const isTurn = p.id === targetPlayer.id;
              const isEliminated = pLives <= 0;

              return (
                <motion.div
                  key={p.id}
                  // Bomba kimdeyse onun satırı yaylanarak öne çıkar.
                  animate={{ scale: isTurn ? 1.05 : 1, opacity: isEliminated ? 0.3 : 1 }}
                  transition={SPRING.snappy}
                  className={`flex items-center justify-between gap-2 rounded-xl border transition-colors ${players.length > 8 ? "px-3 py-1.5" : "p-3"} ${
                    isTurn
                      ? "bg-red-600/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                      : isEliminated
                      ? "bg-black/30 border-white/5 grayscale"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <span className={`font-bold text-lg truncate min-w-0 ${isTurn ? "text-white font-black" : "text-gray-300"}`}>
                    {p.nickname}
                  </span>
                  <div className="flex gap-1.5 shrink-0 items-center">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <CyberHeart key={i} active={i < pLives} size="sm" />
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {players.length > BOMB_ROSTER_MAX && (
              <p className="text-center text-base font-bold text-white/50 pt-1">
                {t("common.morePlayers", players.length - BOMB_ROSTER_MAX)}
              </p>
            )}
          </div>
        </CardSpotlight>

        {/* Center: 3D Cyber Bomb with Dynamic Burning Fuse */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            animate={bombControls}
            className="relative flex items-center justify-center"
          >
            <Cyber3DBomb timeLeft={timeLeft} maxTime={15} />
          </motion.div>

          {/* Current Target Player Card */}
          <CardSpotlight 
            tone="pink" 
            ambient={true} 
            className="mt-6 text-center bg-black/75 px-10 py-5 rounded-3xl backdrop-blur-xl border-2 border-red-500/50 shadow-[0_0_50px_rgba(255,0,60,0.3)] relative w-full max-w-md overflow-hidden"
          >
            {/* Lazer Tarama Çizgisi */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

            <span className="text-xs font-mono font-bold text-[#ff4d00] uppercase tracking-[0.4em] block mb-1.5 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              {t("bomb.whoseTurn")}
            </span>
            <motion.h2 
              key={targetPlayer.id}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
            >
              {targetPlayer.nickname}
            </motion.h2>
            
            <div className="flex gap-3 justify-center mt-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CyberHeart key={i} active={i < currentLives} size="lg" />
              ))}
            </div>
          </CardSpotlight>
        </div>

        {/* Right Side: Host Actions & Reject Tool */}
        <div className="w-72 hidden lg:flex flex-col items-center justify-center">
          <AnimatePresence>
            {room.previous_bomb_target_player && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full"
              >
                <ShimmerButton
                  tone="orange"
                  onClick={handleReject}
                  className="w-full py-5 px-6 !bg-red-950/90 hover:!bg-red-900 border-2 border-red-500 rounded-2xl backdrop-blur-md flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105 active:scale-95 group"
                >
                  <span className="text-3xl animate-bounce">❌</span>
                  <span className="text-red-300 font-black tracking-widest text-sm uppercase text-center">
                    {t("bomb.rejectWord")}
                  </span>
                  <span className="text-sm text-gray-300 font-mono">
                    {t("bomb.rejectHint")}
                  </span>
                </ShimmerButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM: Live Horizontal Word Chain */}
      <div className="w-full max-w-6xl z-20 mt-4">
        <CardSpotlight 
          tone="orange" 
          ambient={true} 
          className="bg-black/80 border border-white/15 p-4 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(255,100,0,0.15)]"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-base font-mono font-bold text-amber-400 uppercase tracking-widest">
              {t("bomb.wordChain", usedWords.length)}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-hidden py-1">
            {usedWords.length === 0 ? (
              <span className="text-lg text-gray-400 font-mono">{t("bomb.waitingFirstWord")}</span>
            ) : (
              // Anahtar kelimenin zincirdeki mutlak sırası: yeni kelime sağdan
              // yaylanarak girer, eskiler `layout` ile sola kayar.
              <AnimatePresence initial={false} mode="popLayout">
                {usedWords.slice(-8).map((w, idx, shown) => {
                  const position = usedWords.length - shown.length + idx;
                  return (
                    <motion.div
                      key={`${position}-${w}`}
                      layout="position"
                      initial={{ opacity: 0, scale: 0.6, x: 24 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={SPRING.snappy}
                      className="flex items-center gap-2 shrink-0"
                    >
                      <span className={`px-3.5 py-1.5 rounded-lg border font-bold text-lg ${idx === shown.length - 1 ? "bg-amber-500/25 border-amber-400 text-amber-100" : "bg-red-600/20 border-red-500/40 text-white"}`}>
                        {w}
                      </span>
                      {idx < shown.length - 1 && (
                        <span className="text-gray-500 text-sm">➔</span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </CardSpotlight>
      </div>
    </motion.div>
  );
}
