import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, collection, getDocs, query, where, arrayUnion } from "firebase/firestore";
import { SoundManager, sounds } from "../../../lib/audio";
import { useToast } from "../../../contexts/ToastContextCore";
import { containsProfanity } from "../../../lib/profanity";
import { looksLikeGibberish } from "../../../lib/wordValidation";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";
import { activePlayers, mergePresence } from "../../../lib/liveness";
import { bombLives } from "../../../lib/bomb";
import { gameTitle } from "../../../lib/gameCatalog";
import { PlayerStageScreen } from "../components/PlayerStageScreen";
import { ShimmerButton } from "../../../components/fx";
import { DURATION, EASE, SPRING } from "../../../lib/motion";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerBombController({ room, player }: Props) {
  const [word, setWord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { t } = useLocale();

  const isMyTurn = room.bomb_target_player === player.id;
  const currentLives = player.lives !== undefined ? player.lives : 3;
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isMyTurn && room.status === "bomb_active") {
      setWord("");
      haptics.warning();
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 300]);
      }
    } else if (!isMyTurn) {
      setWord("");
    }
  }, [isMyTurn, room.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || isSubmittingRef.current) return;

    const normalizedWord = word.trim().toLowerCase();

    // Check if word is already used
    if ((room.used_words || []).some(w => w.toLowerCase() === normalizedWord)) {
      showToast(t("bomb.toastWordUsed"), "error");
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      haptics.impact();
      return;
    }

    if (containsProfanity(word)) {
      showToast(t("bomb.toastProfane"), "error");
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      haptics.impact();
      return;
    }

    if (looksLikeGibberish(word)) {
      showToast(t("bomb.toastGibberish"), "error");
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      haptics.impact();
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    haptics.tap();

    try {
      const [querySnapshot, presenceSnapshot] = await Promise.all([
        getDocs(query(collection(db, "players"), where("room_id", "==", room.id))),
        // Nabızlar presence/{uid}'de (bkz. usePlayerPresence): cebe konmuş
        // telefona bomba geçmesin.
        getDocs(query(collection(db, "presence"), where("room_id", "==", room.id))),
      ]);
      const allPlayers: Player[] = [];
      querySnapshot.forEach((doc) => {
        allPlayers.push({ id: doc.id, ...doc.data() } as Player);
      });
      const lastActiveByUid = new Map<string, number>();
      presenceSnapshot.forEach((doc) => {
        const beat = doc.data().last_active;
        if (typeof beat === "number") lastActiveByUid.set(doc.id, beat);
      });

      const candidates = activePlayers(
        mergePresence(allPlayers, lastActiveByUid).filter((p) => p.id !== player.id && bombLives(p) > 0),
      );

      let nextPlayerId = player.id;
      if (candidates.length > 0) {
        nextPlayerId = candidates[Math.floor(Math.random() * candidates.length)].id;
      }

      SoundManager.getInstance().playSFX(sounds.SUCCESS);

      await updateDoc(doc(db, "rooms", room.id), {
        previous_bomb_target_player: player.id,
        bomb_target_player: nextPlayerId,
        used_words: arrayUnion(word.trim()),
      });

      setWord("");
    } catch (error) {
      console.error("Error passing bomb:", error);
      showToast(t("bomb.toastError"), "error");
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }, 400);
    }
  };

  if (currentLives <= 0) {
    return (
      <PlayerStageScreen icon={<span className="grayscale">💀</span>} tone="red" title={t("bomb.eliminatedYou")} body={t("bomb.watchOthers")} />
    );
  }

  if (room.status === "bomb_intro") {
    return (
      <PlayerStageScreen icon="💣" tone="red" eyebrow={gameTitle("bomb")} title={t("bomb.preparing")} waiting />
    );
  }

  if (room.status === "bomb_explosion") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-rose-950 text-white p-6 text-center relative overflow-hidden">
        {/* Tek seferlik patlama flaşı: sürekli yanıp sönen kırmızı yerine
            (WCAG 2.3.1) bir kez parlayıp sönüyor. */}
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: DURATION.slow, ease: EASE.out }}
          className="absolute inset-0 bg-red-600/40 pointer-events-none"
          aria-hidden="true"
        />
        <motion.span
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, -8, 8, -4, 0] }}
          transition={{ ...SPRING.bouncy, rotate: { duration: 0.5, delay: 0.15 } }}
          className="text-7xl mb-4 inline-block"
          aria-hidden="true"
        >
          💥
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: DURATION.base, ease: EASE.out }}
          className="text-4xl font-black text-white tracking-widest uppercase drop-shadow-md"
        >
          {t("bomb.explodedShort")}
        </motion.h1>
        <p className="mt-3 font-semibold text-sm tracking-wider uppercase text-white/70">
          {t("bomb.watchMainScreen")}
        </p>
      </div>
    );
  }

  if (room.status === "finished") {
    return (
      <PlayerStageScreen icon="🏆" tone="amber" eyebrow={gameTitle("bomb")} title={t("bomb.gameOver")} hint={t("bomb.resultsOnScreen")} />
    );
  }

  const latestWord = (room.used_words || []).slice(-1)[0];

  return (
    <div className={`flex-1 flex flex-col min-h-[100dvh] px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] transition-colors duration-500 ${
      isMyTurn ? 'bg-[#180408]' : 'bg-[#07070d]'
    } text-white justify-between relative overflow-hidden select-none`}>
      
      {/* Edge Glow Pulse when it is player's turn */}
      {isMyTurn && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(244,63,94,0.4)] z-30"
        />
      )}

      {/* Top Header: Lives & Category */}
      <header className="flex justify-between items-center px-4 py-3 rounded-2xl bg-[#0d0d18]/90 border border-white/[0.08] backdrop-blur-xl z-20 max-w-md mx-auto w-full">
        {/* Sleek Ruby Life Crystals */}
        <div className="flex gap-2 items-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                i < currentLives
                  ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.85)] scale-100"
                  : "bg-white/10 border border-white/10 scale-90"
              }`}
            />
          ))}
          <span className="text-xs font-mono font-bold text-white/60 ml-1.5 uppercase">
            {t("bomb.livesShort", currentLives)}
          </span>
        </div>

        {/* Category Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 min-w-0">
          <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider shrink-0">{t("bomb.category")}</span>
          <span className="text-xs font-black text-rose-300 uppercase tracking-wide truncate">
            {room.active_letter || t("bomb.generalCategory")}
          </span>
        </div>
      </header>

      {/* Main Action Center */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full my-4 z-20">
        <AnimatePresence mode="wait" initial={false}>
        {isMyTurn ? (
          <motion.div
            key="my-turn"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0, transition: { duration: DURATION.fast, ease: EASE.in } }}
            transition={SPRING.bouncy}
            className="w-full"
          >
            <div className="w-full bg-[#1b070b]/95 border-2 border-rose-500/70 rounded-3xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.25)] backdrop-blur-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-2 relative z-10">
                <span className="text-3xl">💣</span>
                <h2 className="text-2xl font-black text-rose-300 uppercase tracking-tight">
                  {t("bomb.yourTurn")}
                </h2>
              </div>
              
              <p className="text-xs text-white/60 mb-5 font-medium relative z-10">
                {t("bomb.typeAndThrow")}
              </p>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 relative z-10">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  autoFocus
                  disabled={isSubmitting}
                  className="w-full bg-black/90 border-2 border-rose-500/60 text-white rounded-2xl p-4 text-2xl placeholder:text-base placeholder:font-bold font-black text-center uppercase tracking-wider focus:outline-none focus:border-rose-400 focus:shadow-[0_0_30px_rgba(244,63,94,0.35)] shadow-inner"
                  placeholder={t("bomb.wordPlaceholder")}
                />
                <ShimmerButton
                  type="submit"
                  color="orange"
                  disabled={!word.trim() || isSubmitting}
                  innerClassName="!bg-gradient-to-r !from-rose-600 !to-amber-500 text-white font-black text-base uppercase tracking-wider py-4 shadow-[0_0_25px_rgba(244,63,94,0.4)]"
                  className="w-full"
                >
                  {isSubmitting ? t("bomb.throwing") : `🔥 ${t("bomb.throwBomb")}`}
                </ShimmerButton>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE.in } }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-center p-8 bg-[#0c0c16]/90 border border-white/[0.08] rounded-3xl backdrop-blur-xl w-full shadow-2xl"
          >
            <div className="text-5xl mb-3 opacity-80">💣</div>
            <h2 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              {t("bomb.elsewhereLabel")}
            </h2>
            <p className="text-xl font-bold text-white tracking-tight mb-4">
              {t("bomb.atAnotherTable")}
            </p>
            {latestWord && (
              <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 inline-flex items-center gap-2 max-w-full">
                <span className="text-[11px] text-white/50 font-mono uppercase shrink-0">{t("bomb.lastWord")}:</span>
                {/* Her yeni kelime kısa bir yaylanmayla giriyor: bomba el değiştirdi. */}
                <motion.span
                  key={latestWord}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={SPRING.bouncy}
                  className="text-sm font-black text-amber-300 uppercase tracking-wider truncate"
                >
                  {latestWord}
                </motion.span>
              </div>
            )}
            <p className="mt-4 text-xs text-white/50 font-medium">{t("bomb.waitYourTurn")}</p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Bottom Status */}
      <footer className="text-center py-2 text-[10px] font-mono text-white/20 z-20">
        HENGAME BOMB
      </footer>
    </div>
  );
}
