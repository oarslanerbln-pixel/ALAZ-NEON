import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, collection, getDocs, query, where, arrayUnion } from "firebase/firestore";
import { SoundManager, sounds } from "../../../lib/audio";
import { useToast } from "../../../contexts/ToastContextCore";
import { containsProfanity } from "../../../lib/profanity";
import { looksLikeGibberish } from "../../../lib/wordValidation";
import { useLocale } from "../../../hooks/useLocale";

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

  useEffect(() => {
    if (isMyTurn && room.status === "bomb_active") {
      // Vibrate mobile device if supported when turn starts
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [isMyTurn, room.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || isSubmitting) return;

    const normalizedWord = word.trim().toLowerCase();

    // Check if word is already used
    if (room.used_words?.some(w => w.toLowerCase() === normalizedWord)) {
      showToast(t("bomb.toastWordUsed"), "error");
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }

    // Bombada geri bildirim anında olmalı — host'un elle reddetmesini beklersek
    // sıradaki oyuncuya çoktan paslanmış oluyor. Kelime dev ekrana da düşüyor.
    if (containsProfanity(word)) {
      showToast(t("bomb.toastProfane"), "error");
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }

    if (looksLikeGibberish(word)) {
      showToast(t("bomb.toastGibberish"), "error");
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }

    setIsSubmitting(true);
    try {
      // Fetch all players to find the next target
      const playersRef = collection(db, "players");
      const q = query(playersRef, where("room_id", "==", room.id));
      const querySnapshot = await getDocs(q);
      const allPlayers: Player[] = [];
      querySnapshot.forEach((doc) => {
        allPlayers.push({ id: doc.id, ...doc.data() } as Player);
      });

      const activePlayers = allPlayers.filter(p => p.id !== player.id && (p.lives === undefined || p.lives > 0));
      
      let nextPlayerId = player.id; // fallback to self if somehow alone
      if (activePlayers.length > 0) {
        const randomTarget = activePlayers[Math.floor(Math.random() * activePlayers.length)];
        nextPlayerId = randomTarget.id;
      }

      SoundManager.getInstance().playSFX(sounds.SUCCESS);

      await updateDoc(doc(db, "rooms", room.id), {
        previous_bomb_target_player: player.id, // Track who threw it for reject mechanic
        bomb_target_player: nextPlayerId,
        used_words: arrayUnion(word.trim()),
      });

      setWord("");
    } catch (error) {
      console.error("Error passing bomb:", error);
      showToast(t("bomb.toastError"), "error");
    } finally {
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  if (currentLives <= 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-6">
        <h1 className="text-4xl font-black text-gray-600 tracking-widest uppercase">{t("bomb.eliminatedYou")}</h1>
        <p className="text-gray-500 mt-4 text-center">{t("bomb.watchOthers")}</p>
      </div>
    );
  }

  if (room.status === "bomb_intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-6">
        <div className="w-16 h-16 border-4 border-[#ff003c] border-t-transparent rounded-full animate-spin mb-6" />
        <h1 className="text-2xl font-black text-[#ff003c] tracking-widest uppercase animate-pulse">{t("bomb.preparing")}</h1>
      </div>
    );
  }

  if (room.status === "bomb_explosion") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-[#ff003c] text-white p-6 text-center">
        <h1 className="text-5xl font-black text-black tracking-widest uppercase drop-shadow-lg">{t("bomb.explodedShort")}</h1>
        <p className="mt-4 font-bold text-xl">{t("bomb.watchMainScreen")}</p>
      </div>
    );
  }

  if (room.status === "finished") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-black text-white p-6 text-center">
        <h1 className="text-4xl font-black text-alaz-orange tracking-widest uppercase drop-shadow-lg">{t("bomb.gameOver")}</h1>
        <p className="mt-4 text-gray-400">{t("bomb.resultsOnScreen")}</p>
      </div>
    );
  }

  // Active game logic
  return (
    <div className={`flex-1 flex flex-col min-h-[100dvh] p-4 transition-colors duration-300 ${isMyTurn ? 'bg-[#ff003c]' : 'bg-black'} text-white`}>
      <div className="flex justify-between items-center mb-8 px-2 py-4">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <svg 
              key={i}
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill={i < currentLives ? (isMyTurn ? "black" : "#ff003c") : "transparent"} 
              stroke={i < currentLives ? (isMyTurn ? "black" : "#ff003c") : (isMyTurn ? "rgba(0,0,0,0.3)" : "#333")} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          ))}
        </div>
        <div className={`text-xs font-bold uppercase tracking-widest ${isMyTurn ? 'text-black' : 'text-gray-500'}`}>
          {t("bomb.categoryLabel", room.active_letter || "")}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {isMyTurn ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full"
          >
            <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-8 text-center drop-shadow-md animate-pulse">
              {t("bomb.yourTurn")}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                autoFocus
                disabled={isSubmitting}
                className="w-full bg-white text-black p-6 text-2xl font-black text-center uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-4 focus:ring-black"
                placeholder={t("bomb.wordPlaceholder")}
              />
              <button
                type="submit"
                disabled={!word.trim() || isSubmitting}
                className={`w-full p-6 text-xl font-black uppercase tracking-widest transition-all ${
                  !word.trim() || isSubmitting
                    ? 'bg-black/30 text-black/50 cursor-not-allowed'
                    : 'bg-black text-[#ff003c] shadow-xl hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isSubmitting ? t("bomb.throwing") : t("bomb.throwBomb")}
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">💣</div>
            <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-2">{t("bomb.elsewhereLabel")}</h2>
            <p className="text-4xl font-black text-white uppercase tracking-tighter">{t("bomb.elsewhere")}</p>
            <p className="mt-8 text-gray-500 font-medium">{t("bomb.waitYourTurn")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
