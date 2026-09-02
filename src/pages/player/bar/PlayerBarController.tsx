import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";
import { haptics } from "../../../lib/haptics";
import { useLocale } from "../../../hooks/useLocale";
import { X, Check } from "lucide-react";
import { SoundManager, sounds } from "../../../lib/audio";

interface Props {
  room: Room;
  player: Player;
}

const BOTTLE_ITEMS = [
  { color: "#ff0055", label: "ÇİLEK", emoji: "🍓" },
  { color: "#00e5ff", label: "CURAÇAO", emoji: "🫐" },
  { color: "#aeff00", label: "LIME", emoji: "🍏" },
  { color: "#ffaa00", label: "PORTAKAL", emoji: "🍊" },
  { color: "#b700ff", label: "VİYOLA", emoji: "🍇" },
];

export function PlayerBarController({ room, player }: Props) {
  const { t } = useLocale();
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [status, setStatus] = useState<"playing" | "error" | "success" | "waiting">("playing");
  
  const currentRecipe = room.bar_active_recipe || [];
  const currentRecipeKey = currentRecipe.join(",");

  const [prevRecipeKey, setPrevRecipeKey] = useState(currentRecipeKey);
  const [prevStatus, setPrevStatus] = useState(room.status);

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
    SoundManager.getInstance().playSFX(sounds.CLICK);
    
    const newSequence = [...inputSequence, color];
    setInputSequence(newSequence);

    const isCorrectSoFar = newSequence.every((c, i) => c === currentRecipe[i]);
    
    if (!isCorrectSoFar) {
      haptics.warning();
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      setStatus("error");
      setTimeout(() => {
        if (room.status === "bar_active") {
          setInputSequence([]);
          setStatus("playing");
        }
      }, 500);
      return;
    }

    if (newSequence.length === currentRecipe.length && currentRecipe.length > 0) {
      haptics.success();
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
      setStatus("success");
      
      const playerRef = doc(db, "players", player.id);
      updateDoc(playerRef, {
        bar_score: increment(1)
      }).catch(console.error);

      setTimeout(() => {
        if (room.status === "bar_active") {
          setStatus("waiting");
        }
      }, 700);
    }
  };

  if (room.status !== "bar_active") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[100dvh] bg-[#0d000f] text-white">
        <span className="text-7xl mb-4 animate-bounce">🍹</span>
        <h1 className="text-3xl font-black text-cyan-400 font-mono tracking-widest uppercase mb-2">
          {t("player.barTitle")}
        </h1>
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
          TV'deki kokteyl tarifine bak ve doğru sırayla dök!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 min-h-[100dvh] bg-[#0d000f] text-white select-none">
      
      {/* Top section: Player's current filled cocktail glass */}
      <div className="w-full flex flex-col items-center">
        <div className="flex justify-between items-center w-full px-2 mb-4">
          <span className="text-xs font-mono text-pink-400 uppercase tracking-widest font-bold">
            🍹 SENİN KOKTEYLİN
          </span>
          <span className="text-sm font-black text-white font-mono bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/40">
            {player.bar_score || 0} TAMAMLANDI
          </span>
        </div>

        <div className="w-full max-w-xs h-20 bg-black/60 border-2 border-white/20 rounded-2xl p-2 flex gap-2 items-center justify-center shadow-inner">
          {Array.from({ length: currentRecipe.length || 4 }).map((_, i) => (
            <motion.div
              key={i}
              className={`flex-1 h-full rounded-xl border-2 flex items-center justify-center transition-all ${
                inputSequence[i] ? "border-white/50 shadow-md" : "border-dashed border-white/20 bg-white/5"
              }`}
              style={inputSequence[i] ? { 
                backgroundColor: inputSequence[i],
                boxShadow: `0 0 15px ${inputSequence[i]}`
              } : {}}
              animate={
                status === "error" && i === inputSequence.length - 1
                  ? { x: [-5, 5, -5, 5, 0] }
                  : {}
              }
            >
              {inputSequence[i] && (
                <span className="text-xs font-black text-white drop-shadow-md">
                  #{i + 1}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Status Feedback */}
      <AnimatePresence mode="wait">
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-950/70 backdrop-blur-sm pointer-events-none"
          >
            <X className="w-28 h-28 text-red-500 mb-2 drop-shadow-[0_0_25px_rgba(255,0,0,0.9)]" />
            <span className="text-2xl font-black text-red-400 uppercase tracking-widest">
              YANLIŞ İÇECEK!
            </span>
          </motion.div>
        )}
        
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-950/70 backdrop-blur-sm pointer-events-none"
          >
            <Check className="w-28 h-28 text-emerald-400 mb-2 drop-shadow-[0_0_25px_rgba(74,222,128,0.9)]" />
            <span className="text-2xl font-black text-emerald-300 uppercase tracking-widest">
              KOKTEYL SERVİS EDİLDİ! +1
            </span>
          </motion.div>
        )}
        
        {status === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <span className="text-5xl mb-2 block">✨</span>
              <div className="text-2xl font-black text-cyan-400 mb-1">HARİKA!</div>
              <div className="text-gray-400 text-xs font-mono">Sıradaki sipariş hazırlanıyor...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom section: 5 Ergonomic Neon Cocktail Bottles */}
      <div className="w-full max-w-sm grid grid-cols-5 gap-2 my-auto">
        {BOTTLE_ITEMS.map(({ color, label, emoji }) => (
          <motion.button
            key={color}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleBottleClick(color)}
            className="h-44 rounded-2xl border-2 flex flex-col items-center justify-between p-2 relative overflow-hidden transition-all shadow-md active:brightness-125"
            style={{ 
              borderColor: color,
              backgroundColor: `${color}15`
            }}
          >
            <span className="text-2xl mt-1 z-10">{emoji}</span>
            
            <div 
              className="absolute inset-x-0 bottom-0 h-2/3 opacity-70 rounded-b-xl"
              style={{ 
                backgroundColor: color,
                boxShadow: `0 0 15px ${color}`
              }}
            />

            <span className="text-[10px] font-black text-white z-10 text-center uppercase leading-tight drop-shadow-md">
              {label}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="text-center text-[10px] font-mono text-gray-500 py-1">
        ALAZ NEON BAR MIXOLOGY • DOĞRU SIRAYLA DÖK
      </div>
    </div>
  );
}
