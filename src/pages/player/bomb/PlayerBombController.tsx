import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, collection, getDocs, query, where, arrayUnion } from "firebase/firestore";
import { SoundManager, sounds } from "../../../lib/audio";
import { useToast } from "../../../contexts/ToastContextCore";
import { containsProfanity } from "../../../lib/profanity";
import { looksLikeGibberish } from "../../../lib/wordValidation";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";

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
      const playersRef = collection(db, "players");
      const q = query(playersRef, where("room_id", "==", room.id));
      const querySnapshot = await getDocs(q);
      const allPlayers: Player[] = [];
      querySnapshot.forEach((doc) => {
        allPlayers.push({ id: doc.id, ...doc.data() } as Player);
      });

      const now = Date.now();
      const activePlayers = allPlayers.filter(p => 
        p.id !== player.id && 
        (p.lives === undefined || p.lives > 0) &&
        (p.last_active ? (now - p.last_active < 30000) : true)
      );
      
      let nextPlayerId = player.id;
      if (activePlayers.length > 0) {
        const randomTarget = activePlayers[Math.floor(Math.random() * activePlayers.length)];
        nextPlayerId = randomTarget.id;
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-6 text-center">
        <span className="text-7xl mb-4 grayscale">💀</span>
        <h1 className="text-3xl font-black text-red-500 tracking-widest uppercase mb-2">
          {t("bomb.eliminatedYou")}
        </h1>
        <p className="text-gray-400 text-sm max-w-xs">{t("bomb.watchOthers")}</p>
      </div>
    );
  }

  if (room.status === "bomb_intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-6">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h1 className="text-2xl font-black text-red-500 tracking-widest uppercase animate-pulse">
          {t("bomb.preparing")}
        </h1>
      </div>
    );
  }

  if (room.status === "bomb_explosion") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-red-600 text-white p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
        <span className="text-8xl mb-4 animate-bounce">💥</span>
        <h1 className="text-5xl font-black text-black tracking-widest uppercase drop-shadow-md">
          {t("bomb.explodedShort")}
        </h1>
        <p className="mt-4 font-bold text-lg tracking-widest uppercase text-black/80">
          {t("bomb.watchMainScreen")}
        </p>
      </div>
    );
  }

  if (room.status === "finished") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-6 text-center">
        <span className="text-7xl mb-4">🏆</span>
        <h1 className="text-3xl font-black text-amber-400 tracking-widest uppercase mb-2">
          {t("bomb.gameOver")}
        </h1>
        <p className="text-gray-400">{t("bomb.resultsOnScreen")}</p>
      </div>
    );
  }

  // Active game screen
  const latestWord = (room.used_words || []).slice(-1)[0];

  return (
    <div className={`flex-1 flex flex-col min-h-[100dvh] p-4 transition-colors duration-300 ${
      isMyTurn ? 'bg-[#2a0008]' : 'bg-[#0a0003]'
    } text-white justify-between`}>
      
      {/* Top Header: Lives & Category */}
      <div className="flex justify-between items-center px-3 py-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="text-xl">
              {i < currentLives ? "❤️" : "🖤"}
            </span>
          ))}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
            KATEGORİ
          </span>
          <span className="text-sm font-black text-red-400 uppercase tracking-wider">
            {room.active_letter || "GENEL"}
          </span>
        </div>
      </div>

      {/* Main Action Center */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full my-4">
        {isMyTurn ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-red-950/80 border-2 border-red-500 rounded-3xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.5)] backdrop-blur-xl flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl animate-bounce">💣</span>
              <h2 className="text-2xl font-black text-red-400 uppercase tracking-tight">
                {t("bomb.yourTurn")}
              </h2>
            </div>
            
            <p className="text-xs text-gray-300 mb-5 font-medium">
              Geçerli bir kelime yaz ve bombayı fırlat!
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                autoFocus
                disabled={isSubmitting}
                className="w-full bg-black/90 border-2 border-red-400 text-white rounded-2xl p-4 text-2xl font-black text-center uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-inner"
                placeholder={t("bomb.wordPlaceholder")}
              />
              <button
                type="submit"
                disabled={!word.trim() || isSubmitting}
                className={`w-full py-5 rounded-2xl text-xl font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-[0_0_25px_rgba(239,68,68,0.6)] ${
                  !word.trim() || isSubmitting
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    : 'bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110'
                }`}
              >
                {isSubmitting ? t("bomb.throwing") : "🔥 BOMBAYI AT! (PASLA)"}
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="text-center p-6 bg-black/50 border border-white/10 rounded-3xl backdrop-blur-md w-full">
            <div className="text-6xl mb-4 animate-pulse">💣</div>
            <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">
              {t("bomb.elsewhereLabel")}
            </h2>
            <p className="text-2xl font-black text-white uppercase tracking-tight mb-4">
              Bomba Başka Masada!
            </p>
            {latestWord && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 inline-block max-w-full">
                <span className="text-[10px] text-gray-400 font-mono block">SON SÖYLENEN KELİME:</span>
                <span className="text-lg font-black text-amber-400 uppercase">{latestWord}</span>
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">{t("bomb.waitYourTurn")}</p>
          </div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="text-center py-2 text-[11px] font-mono text-gray-500">
        ALAZ NEON PARTY • BOMB PARTY
      </div>
    </div>
  );
}
