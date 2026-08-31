import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import type { Room, Player } from "../../../types/database";

interface Props {
  room: Room;
  player: Player;
}

type Feedback = "correct" | "present" | "absent";

interface GuessHistory {
  guess: string;
  feedback: Feedback[];
}

export function PlayerVaultController({ room, player }: Props) {
  const { t } = useLocale();
  const [currentGuess, setCurrentGuess] = useState("");
  const [history, setHistory] = useState<GuessHistory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const targetCode = room.vault_code || "";
  const maxDigits = 4;

  const handleKeyPress = (key: string) => {
    if (hasWon || isSubmitting) return;
    
    SoundManager.getInstance().playSFX(sounds.CLICK);
    
    if (key === "DEL") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < maxDigits) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const calculateFeedback = (guess: string, target: string): Feedback[] => {
    const feedback: Feedback[] = Array(maxDigits).fill("absent");
    const targetChars = target.split("");
    const guessChars = guess.split("");

    // First pass: correct
    for (let i = 0; i < maxDigits; i++) {
      if (guessChars[i] === targetChars[i]) {
        feedback[i] = "correct";
        targetChars[i] = ""; // mark as used
        guessChars[i] = ""; // mark as checked
      }
    }

    // Second pass: present
    for (let i = 0; i < maxDigits; i++) {
      if (guessChars[i] === "") continue;
      const index = targetChars.indexOf(guessChars[i]);
      if (index !== -1) {
        feedback[i] = "present";
        targetChars[index] = ""; // mark as used
      }
    }

    return feedback;
  };

  const handleSubmit = async () => {
    if (currentGuess.length !== maxDigits || isSubmitting || hasWon) return;
    setIsSubmitting(true);

    const feedback = calculateFeedback(currentGuess, targetCode);
    
    setHistory(prev => [{ guess: currentGuess, feedback }, ...prev]);
    
    const isWin = feedback.every(f => f === "correct");
    if (isWin) {
      setHasWon(true);
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
    } else {
      SoundManager.getInstance().playSFX(sounds.FAILURE);
    }

    try {
      await addDoc(collection(db, "answers"), {
        room_id: room.id,
        player_id: player.id,
        round_letter: "VAULT",
        round_index: 0,
        data: { guess: currentGuess },
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }

    setCurrentGuess("");
    setIsSubmitting(false);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "DEL"];

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Title */}
      <div className="p-4 text-center border-b border-white/10">
        <h2 className="text-xl font-black text-emerald-400 tracking-widest uppercase">
          {t("player.vaultTitle", "ŞİFREYİ ÇÖZ")}
        </h2>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-2">
        <AnimatePresence>
          {history.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-2"
            >
              {h.guess.split("").map((digit, j) => {
                const fb = h.feedback[j];
                const bg = fb === "correct" ? "bg-emerald-500" : fb === "present" ? "bg-amber-500" : "bg-zinc-800";
                return (
                  <div key={j} className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-2xl text-white ${bg}`}>
                    {digit}
                  </div>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Current Guess Display */}
      <div className="p-4 flex justify-center gap-2">
        {Array.from({ length: maxDigits }).map((_, i) => (
          <div key={i} className="w-14 h-16 rounded-xl border-2 border-emerald-500/50 flex items-center justify-center text-3xl font-black text-emerald-400 bg-emerald-500/10">
            {currentGuess[i] || ""}
          </div>
        ))}
      </div>

      {/* Numpad */}
      <div className="p-4 bg-zinc-900 rounded-t-3xl pb-safe">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {keys.slice(0, 9).map(key => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="aspect-square bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white transition-colors"
            >
              {key}
            </button>
          ))}
          <div className="aspect-square" />
          <button
            onClick={() => handleKeyPress("0")}
            className="aspect-square bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white transition-colors"
          >
            0
          </button>
          <button
            onClick={() => handleKeyPress("DEL")}
            className="aspect-square bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 rounded-2xl flex items-center justify-center text-xl font-bold text-red-400 transition-colors"
          >
            SİL
          </button>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={currentGuess.length !== maxDigits || isSubmitting || hasWon}
          className="w-full py-5 rounded-2xl bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black uppercase tracking-widest text-xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none"
        >
          {isSubmitting ? "..." : t("player.vaultSubmit", "ONAYLA")}
        </button>
      </div>
      
      {hasWon && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
          <h1 className="text-6xl text-emerald-400 font-black animate-pulse">BAŞARILI!</h1>
          <p className="text-white mt-4">Kasa kırıldı. TV ekranına bak!</p>
        </div>
      )}
    </div>
  );
}
