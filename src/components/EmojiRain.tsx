import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmojiPulse } from "../hooks/useEmojiPulse";
import { EASE } from "../lib/motion";

interface Emoji {
  id: number;
  char: string;
  x: number;
  sway: number;
  rotate: number;
  duration: number;
}

interface EmojiRainProps {
  roomId: string;
}

/** Aynı anda ekranda tutulacak en fazla emoji — kalabalık salonda TV'yi korur. */
const MAX_ON_SCREEN = 36;

export function EmojiRain({ roomId }: EmojiRainProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  useEmojiPulse(roomId, (emojiChar) => {
    const duration = 2.4 + Math.random() * 0.8;
    const newEmoji: Emoji = {
      id: Date.now() + Math.random(),
      char: emojiChar,
      x: Math.random() * 80 + 10, // Kenarlardan uzak dur
      sway: (Math.random() - 0.5) * 8, // yatay salınım genliği (%)
      rotate: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180),
      duration,
    };

    setEmojis((prev) => [...prev.slice(-(MAX_ON_SCREEN - 1)), newEmoji]);

    // Animasyon bitince temizle
    setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, duration * 1000 + 200);
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {emojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{ y: "110vh", x: `${emoji.x}%`, opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{
              y: "-10vh",
              x: [`${emoji.x}%`, `${emoji.x + emoji.sway}%`, `${emoji.x - emoji.sway}%`, `${emoji.x}%`],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.5, 1.4, 1],
              rotate: emoji.rotate,
            }}
            transition={{ duration: emoji.duration, ease: EASE.out, times: [0, 0.15, 0.8, 1] }}
            className="absolute text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] will-change-transform"
          >
            {emoji.char}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
