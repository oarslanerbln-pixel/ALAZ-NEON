import { motion } from "framer-motion";

interface EmojiToolbarProps {
  onEmojiClick: (emoji: string) => void;
}

export function EmojiToolbar({ onEmojiClick }: EmojiToolbarProps) {
  const emojis = ["👍", "👎", "😂", "🚨", "🤯", "💀"];

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-4 flex justify-between items-center gap-3 overflow-x-auto shadow-2xl relative rounded-none">
        {/* Geometric accents */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white/20" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white/20" />
        
        {emojis.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEmojiClick(emoji)}
            className={`text-2xl flex-1 py-3 bg-zinc-800/40 border border-zinc-700/50 hover:border-zinc-500 hover:bg-zinc-700/50 transition-colors rounded-none ${
              emoji !== "👍" && emoji !== "👎" ? "grayscale hover:grayscale-0" : ""
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      <p className="text-[10px] text-center text-zinc-500 font-light uppercase tracking-[0.4em] mt-6 mb-2">
        TEPKİ GÖNDER
      </p>
    </div>
  );
}
