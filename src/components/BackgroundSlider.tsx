import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_IMAGES } from "../data/heroImages";

interface BackgroundSliderProps {
  className?: string;
}

export function BackgroundSlider({ className = "absolute inset-0 z-0 overflow-hidden pointer-events-none" }: BackgroundSliderProps) {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // 6 seconds per image
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={bgIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className={className}
      >
        <motion.img
          initial={{ scale: 1.0 }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 10, ease: "linear" }}
          src={HERO_IMAGES[bgIndex]}
          alt="Background"
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
