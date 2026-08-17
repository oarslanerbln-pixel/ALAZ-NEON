import { motion } from "framer-motion";

interface EmojiToolbarProps {
  onEmojiClick: (emoji: string) => void;
}

export function EmojiToolbar({ onEmojiClick }: EmojiToolbarProps) {
  const emojis = ["👍", "👎", "😂", "🚨", "🤯", "💀"];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent z-40 pb-safe">
      <div className="px-4 pb-1 pt-2">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 flex justify-between items-center gap-2 shadow-2xl relative overflow-hidden">
          {/* Geometric accents */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white/20" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white/20" />

          {emojis.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEmojiClick(emoji)}
              className={`text-2xl flex-1 touch-target bg-zinc-800/40 border border-zinc-700/50 hover:border-zinc-500 hover:bg-zinc-700/50 transition-colors ${
                emoji !== "👍" && emoji !== "👎" ? "grayscale hover:grayscale-0" : ""
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-center text-zinc-600 font-light uppercase tracking-[0.3em] mt-1.5">
          TEPKİ GÖNDER
        </p>
      </div>
    </div>
  );
}
