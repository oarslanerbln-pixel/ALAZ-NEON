import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmojiPulse } from "../hooks/useEmojiPulse";

interface Emoji {
  id: number;
  char: string;
  x: number;
  rotate: number;
}

interface EmojiRainProps {
  roomId: string;
}

export function EmojiRain({ roomId }: EmojiRainProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  useEmojiPulse(roomId, (emojiChar) => {
    const newEmoji: Emoji = {
      id: Date.now() + Math.random(),
      char: emojiChar,
      x: Math.random() * 80 + 10, // Avoid edges
      rotate: Math.random() > 0.5 ? 360 : -360,
    };

    setEmojis((prev) => [...prev, newEmoji]);

    // Cleanup after animation
    setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 3000);
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <AnimatePresence>
        {emojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{
              y: "110vh",
              x: `${emoji.x}%`,
              opacity: 0,
              scale: 0.5,
              rotate: 0,
            }}
            animate={{
              y: "-10vh",
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.5, 1.5, 1],
              rotate: emoji.rotate,
            }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute text-5xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          >
            {emoji.char}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
