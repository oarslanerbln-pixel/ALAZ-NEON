import { motion } from "framer-motion";

interface EmojiToolbarProps {
  onEmojiClick: (emoji: string) => void;
}

export function EmojiToolbar({ onEmojiClick }: EmojiToolbarProps) {
  const emojis = ["👍", "👎", "😂", "🚨", "🤯", "💀"];

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
      <div className="glass-panel-alaz p-4 rounded-sm flex justify-around items-center gap-2 overflow-x-auto">
        {emojis.map((emoji) => (
          <motion.button
            key={emoji}
            whileTap={{ scale: 1.5 }}
            onClick={() => onEmojiClick(emoji)}
            className={`text-4xl transition-all p-2 ${
              emoji === "👍" || emoji === "👎"
                ? "hover:scale-110"
                : "grayscale hover:grayscale-0"
            }`}
            style={{
              filter:
                emoji === "👍"
                  ? "drop-shadow(0 0 10px rgba(34,197,94,0.6))"
                  : emoji === "👎"
                    ? "drop-shadow(0 0 10px rgba(239,68,68,0.6))"
                    : "",
            }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      <p className="text-[10px] text-center text-gray-500 font-black uppercase tracking-widest mt-4">
        EKRANDAKİ CEVABI OYLA / TEPKİ VER!
      </p>
    </div>
  );
}
