import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackdropImage, type BackdropSource } from "./BackdropImage";

const BACKGROUND_IMAGES: readonly BackdropSource[] = [
  { avif: "/player-bg-1.avif", webp: "/player-bg-1.webp" },
  { avif: "/player-bg-2.avif", webp: "/player-bg-2.webp" },
  { avif: "/player-bg-3.avif", webp: "/player-bg-3.webp" },
];

export function PlayerBackground() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 8000); // 8 seconds per image
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={bgIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <BackdropImage
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.15 }}
            transition={{ duration: 12, ease: "linear" }}
            source={BACKGROUND_IMAGES[bgIndex]}
            className="w-full h-full object-cover opacity-60"
          />
          {/* Subtle gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
