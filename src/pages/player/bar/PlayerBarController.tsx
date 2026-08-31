import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";
import { haptics } from "../../../lib/haptics";
import { useLocale } from "../../../hooks/useLocale";
import { X, Check } from "lucide-react";

interface Props {
  room: Room;
  player: Player;
}

const BOTTLE_COLORS = ["#ff0055", "#00e5ff", "#aeff00", "#ffaa00", "#b700ff"];

export function PlayerBarController({ room, player }: Props) {
  const { t } = useLocale();
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [status, setStatus] = useState<"playing" | "error" | "success" | "waiting">("playing");
  
  const currentRecipe = room.bar_active_recipe || [];
  const currentRecipeKey = currentRecipe.join(",");

  const [prevRecipeKey, setPrevRecipeKey] = useState(currentRecipeKey);
  const [prevStatus, setPrevStatus] = useState(room.status);

  // Reset state when a new recipe comes from the host (render phase update)
  if (currentRecipeKey !== prevRecipeKey || room.status !== prevStatus) {
    setPrevRecipeKey(currentRecipeKey);
    setPrevStatus(room.status);
    if (room.status === "bar_active") {
      setInputSequence([]);
      setStatus("playing");
    }
  }

  const handleBottleClick = (color: string) => {
    if (status !== "playing") return;
    haptics.tap();
    
    const newSequence = [...inputSequence, color];
    setInputSequence(newSequence);

    // Check if the current input is correct so far
    const isCorrectSoFar = newSequence.every((c, i) => c === currentRecipe[i]);
    
    if (!isCorrectSoFar) {
      haptics.warning();
      setStatus("error");
      setTimeout(() => {
        if (room.status === "bar_active") {
          setInputSequence([]);
          setStatus("playing");
        }
      }, 500);
      return;
    }

    // Check if completed
    if (newSequence.length === currentRecipe.length && currentRecipe.length > 0) {
      haptics.success();
      setStatus("success");
      
      // Update score in Firestore
      const playerRef = doc(db, "players", player.id);
      updateDoc(playerRef, {
        bar_score: increment(1)
      }).catch(console.error);

      setTimeout(() => {
        if (room.status === "bar_active") {
          setStatus("waiting");
        }
      }, 1000);
    }
  };

  if (room.status !== "bar_active") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-cyan-400 font-mono tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
          {t("player.barTitle")}
        </h1>
        <p className="text-white/60">
          TV'ye bak!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Top section: Player's current input sequence visually */}
      <div className="w-full flex justify-center gap-2 mb-8 h-16">
        {Array.from({ length: currentRecipe.length || 4 }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-12 h-16 rounded-md border-2 flex items-center justify-center ${
              inputSequence[i] ? "border-transparent" : "border-white/20 bg-white/5"
            }`}
            style={inputSequence[i] ? { 
              backgroundColor: `${inputSequence[i]}80`,
              borderColor: inputSequence[i],
              boxShadow: `0 0 15px ${inputSequence[i]}80`
            } : {}}
            animate={
              status === "error" && i === inputSequence.length - 1
                ? { x: [-5, 5, -5, 5, 0] }
                : {}
            }
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-red-500/20 backdrop-blur-sm pointer-events-none"
          >
            <X className="w-32 h-32 text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
          </motion.div>
        )}
        
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/20 backdrop-blur-sm pointer-events-none"
          >
            <Check className="w-32 h-32 text-green-500 drop-shadow-[0_0_20px_rgba(0,255,0,0.8)]" />
          </motion.div>
        )}
        
        {status === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-2">HARİKA!</div>
              <div className="text-white/60">Yeni sipariş bekleniyor...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom section: Interactive bottles */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-4 mb-4">
        {BOTTLE_COLORS.map((color) => (
          <motion.button
            key={color}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleBottleClick(color)}
            className="aspect-[1/2] rounded-xl border-4 flex items-end justify-center pb-4 relative overflow-hidden"
            style={{ 
              borderColor: color,
              backgroundColor: `${color}20`
            }}
          >
            <div 
              className="absolute bottom-0 w-full h-2/3 opacity-50"
              style={{ backgroundColor: color }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
