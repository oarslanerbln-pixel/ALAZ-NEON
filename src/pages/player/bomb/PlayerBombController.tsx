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
import { PlayerIntroVideo } from "../components/PlayerIntroVideo";
import { DURATION, EASE } from "../../../lib/motion";

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

  // Kalp atışı haptik nabzı: bomba oyuncudayken düzenli titreşim verir
  useEffect(() => {
    if (!isMyTurn || room.status !== "bomb_active") return;
    const interval = setInterval(() => {
      haptics.impact();
    }, 950);
    return () => clearInterval(interval);
  }, [isMyTurn, room.status]);

  // Patlama anında güçlü dokunsal sarsıntı ve sinematik patlama sesi
  useEffect(() => {
    if (room.status === "bomb_explosion") {
      haptics.impact();
      SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM, 0.7);
    }
  }, [room.status]);

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

  // Tur rozeti yok: bomba son kişi kalana kadar sürüyor, "TUR n / 3"
  // hiçbir zaman doğru değildi.
  if (room.status === "bomb_intro") {
    return <PlayerIntroVideo gameTitle="HENGAME BOMB" />;
  }

  if (room.status === "bomb_explosion") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-bg text-ink p-6 text-center relative overflow-hidden">
        {/* Tek seferlik patlama flaşı (WCAG 2.3.1: sürekli yanıp sönme yok). */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: DURATION.slow, ease: EASE.out }}
          className="absolute inset-0 bg-bad pointer-events-none"
          aria-hidden="true"
        />
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: DURATION.slow, ease: EASE.out }}
          className="relative text-7xl mb-4 inline-block"
          aria-hidden="true"
        >
          💥
        </motion.span>
        <h1 className="relative text-4xl font-extrabold text-ink">{t("bomb.explodedShort")}</h1>
        <p className="relative mt-3 text-base text-ink-2">{t("bomb.watchMainScreen")}</p>
      </div>
    );
  }

  if (room.status === "finished") {
    return (
      <PlayerStageScreen icon="🏆" tone="amber" eyebrow={gameTitle("bomb")} title={t("bomb.gameOver")} hint={t("bomb.resultsOnScreen")} />
    );
  }

  const latestWord = (room.used_words || []).slice(-1)[0];
  const category = room.active_letter || t("bomb.generalCategory");

  return (
    <div className="flex-1 flex flex-col min-h-[100dvh] px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] bg-bg text-ink relative overflow-hidden select-none">
      {/* Canlar ve kategori */}
      <header className="flex justify-between items-center gap-4 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2" aria-label={t("bomb.livesShort", currentLives)}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`w-3.5 h-3.5 rounded-full ${i < currentLives ? "bg-bad" : "bg-surface-2"}`} />
          ))}
          <span className="ml-1 text-base text-ink-2 whitespace-nowrap">{t("bomb.livesShort", currentLives)}</span>
        </div>
        <span className="text-base text-ink-2 truncate min-w-0">
          {t("bomb.category")} <span className="font-semibold text-ink">{category}</span>
        </span>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full my-4">
        <AnimatePresence mode="wait" initial={false}>
        {isMyTurn ? (
          <motion.div
            key="my-turn"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="w-full surface rounded-3xl p-6 flex flex-col items-center text-center border-accent/60"
          >
            <span className="text-5xl" aria-hidden="true">💣</span>
            <h2 className="mt-3 text-3xl font-extrabold text-accent">{t("bomb.yourTurn")}</h2>
            <p className="mt-1 text-base text-ink-2">
              {t("bomb.category")}: <span className="font-semibold text-ink">{category}</span>
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mt-6">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                autoFocus
                disabled={isSubmitting}
                className="w-full h-16 bg-surface-2 border border-line text-ink rounded-2xl px-4 text-2xl font-extrabold text-center uppercase placeholder:text-base placeholder:font-semibold placeholder:text-ink-3 focus:outline-none focus:border-accent transition-colors"
                placeholder={t("bomb.wordPlaceholder")}
              />
              <button
                type="submit"
                disabled={!word.trim() || isSubmitting}
                className="btn-primary w-full h-16 text-lg uppercase tracking-wide"
              >
                {isSubmitting ? t("bomb.throwing") : t("bomb.throwBomb")}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-center p-8 surface rounded-3xl w-full"
          >
            <div className="text-5xl mb-3" aria-hidden="true">💣</div>
            <p className="text-base text-ink-2">{t("bomb.elsewhereLabel")}</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{t("bomb.atAnotherTable")}</p>
            {latestWord && (
              <p className="mt-5 text-base text-ink-2 truncate">
                {t("bomb.lastWord")}:{" "}
                {/* Her yeni kelime kısa bir girişle beliriyor: bomba el değiştirdi. */}
                <motion.span
                  key={latestWord}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: DURATION.base }}
                  className="font-extrabold text-accent uppercase"
                >
                  {latestWord}
                </motion.span>
              </p>
            )}
            <p className="mt-4 text-sm text-ink-3">{t("bomb.waitYourTurn")}</p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
