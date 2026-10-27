import { useEffect, useState, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { playGermanVoiceover } from "../../../lib/germanVoiceover";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";
import { pickBombHolder } from "../../../lib/bomb";
import { DURATION, EASE } from "../../../lib/motion";
import { Cyber3DBomb } from "./Cyber3DBomb";

/** Sol listede kaydırmasız gösterilen en fazla oyuncu (1080'lik tuvale göre). */
const BOMB_ROSTER_MAX = 10;

function Heart({ active, size = "md" }: { active: boolean; size?: "md" | "lg" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${size === "lg" ? "w-9 h-9" : "w-6 h-6"} shrink-0 ${active ? "text-bad" : "text-ink-3/40"}`}>
      <path
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 2}
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
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

      // Son saniyeler: her tikte tek bir kısa vuruş (sonsuz sarsıntı yok).
      if (remaining <= 5 && remaining > 0) {
        SoundManager.getInstance().playSFX(sounds.TICK_URGENT);
        bombControls.start({ scale: [1, 1.08, 1], transition: { duration: 0.2 } });
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
  }, [room.round_end_time, targetPlayer, bombControls, timeLeft]);

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
      <div className="flex-1 flex flex-col items-center justify-center h-full gap-6">
        <span className="text-8xl" aria-hidden="true">💣</span>
        <p className="text-4xl font-semibold text-ink-2">{t("bomb.changingHands")}</p>
      </div>
    );
  }

  const currentLives = targetPlayer.lives !== undefined ? targetPlayer.lives : 3;
  const usedWords = room.used_words || [];

  return (
    <div className="flex-1 w-full h-full grid grid-cols-[400px_1fr_400px] grid-rows-[auto_1fr_auto] gap-x-12 gap-y-6">
      {/* Üst: kategori */}
      <div className="col-span-3 text-center">
        <p className="text-3xl text-ink-2">HENGAME Bomb</p>
        <h1 className="text-7xl font-extrabold text-ink tracking-tight mt-1">
          {room.active_letter || t("bomb.generalCategory")}
        </h1>
      </div>

      {/* Sol: oyuncular ve canları. Eskiden kaydırma çubuğu vardı; TV'de
          kimse kaydıramıyor, sığmayanlar alttaki sayaçla özetleniyor. */}
      <div className="surface rounded-3xl p-6 flex flex-col gap-1 min-h-0 overflow-hidden">
        <h3 className="text-2xl font-semibold text-ink-2 mb-2">{t("bomb.rosterTitle", players.length)}</h3>
        {players.slice(0, BOMB_ROSTER_MAX).map((p) => {
          const pLives = p.lives !== undefined ? p.lives : 3;
          const isTurn = p.id === targetPlayer.id;
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-3 h-12 px-3 rounded-xl transition-colors ${
                isTurn ? "bg-accent/15" : ""
              } ${pLives <= 0 ? "opacity-40" : ""}`}
            >
              <span className={`text-2xl truncate min-w-0 ${isTurn ? "text-accent font-extrabold" : "text-ink font-semibold"}`}>
                {p.nickname}
              </span>
              <span className="flex gap-1 shrink-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart key={i} active={i < pLives} />
                ))}
              </span>
            </div>
          );
        })}
        {players.length > BOMB_ROSTER_MAX && (
          <p className="text-2xl text-ink-3 pt-1">{t("common.morePlayers", players.length - BOMB_ROSTER_MAX)}</p>
        )}
      </div>

      {/* Orta: bomba (ekranın odağı) ve sıradaki oyuncu */}
      <div className="flex flex-col items-center justify-center min-h-0">
        <motion.div animate={bombControls} className="relative flex items-center justify-center">
          <Cyber3DBomb timeLeft={timeLeft} maxTime={15} />
        </motion.div>
        <p className="mt-6 text-3xl text-ink-2">{t("bomb.whoseTurn")}</p>
        <motion.h2
          key={targetPlayer.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: DURATION.base, ease: EASE.out }}
          className="text-7xl font-extrabold text-ink tracking-tight mt-1"
        >
          {targetPlayer.nickname}
        </motion.h2>
        <div className="flex gap-3 justify-center mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} active={i < currentLives} size="lg" />
          ))}
        </div>
      </div>

      {/* Sağ: personelin kelimeyi reddetmesi */}
      <div className="flex flex-col items-center justify-center">
        <AnimatePresence>
          {room.previous_bomb_target_player && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.base }}
              onClick={handleReject}
              className="w-full surface rounded-3xl p-6 flex flex-col items-center gap-2 border-bad/50 hover:bg-bad/10 transition-colors"
            >
              <span className="text-3xl font-extrabold text-bad uppercase">{t("bomb.rejectWord")}</span>
              <span className="text-2xl text-ink-2 text-center">{t("bomb.rejectHint")}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Alt: kelime zinciri */}
      <div className="col-span-3 surface rounded-3xl px-8 py-5 flex items-center gap-6 overflow-hidden">
        <span className="text-2xl font-semibold text-ink-2 shrink-0">{t("bomb.wordChain", usedWords.length)}</span>
        <div className="flex items-center gap-3 overflow-hidden">
          {usedWords.length === 0 ? (
            <span className="text-2xl text-ink-3">{t("bomb.waitingFirstWord")}</span>
          ) : (
            // Anahtar kelimenin zincirdeki mutlak sırası: yeni kelime sağdan
            // girer, eskiler `layout` ile sola kayar.
            <AnimatePresence initial={false} mode="popLayout">
              {usedWords.slice(-6).map((w, idx, shown) => {
                const position = usedWords.length - shown.length + idx;
                const latest = idx === shown.length - 1;
                return (
                  <motion.span
                    key={`${position}-${w}`}
                    layout="position"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DURATION.base, ease: EASE.out }}
                    className={`shrink-0 px-4 py-2 rounded-xl text-2xl font-semibold ${
                      latest ? "bg-accent text-bg" : "bg-surface-2 text-ink-2"
                    }`}
                  >
                    {w}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
