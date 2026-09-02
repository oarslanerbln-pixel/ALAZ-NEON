import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useLocale } from "../hooks/useLocale";
import { haptics } from "../lib/haptics";

interface HoldButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  className?: string;
  text: string;
  holdText?: string;
  holdDuration?: number;
}

/**
 * Basılı tutma butonu.
 *
 * Dolum çubuğu bir motion value ile `scaleX` üzerinden sürülüyor: eskiden her
 * rAF karesinde `setProgress` ile React yeniden render ediliyor ve `width`
 * (layout özelliği) değiştiriliyordu — saniyede 60 render + 60 layout.
 * Şimdi kare başına tek bir transform yazımı var; React hiç uyanmıyor.
 */
export function HoldButton({
  onComplete,
  disabled = false,
  className = "",
  text,
  holdText,
  holdDuration = 1000,
}: HoldButtonProps) {
  const { t } = useLocale();
  // Varsayılan artık sabit Türkçe değil: prop imzasında bir literal
  // olamayacağı için (t() çağrısı gerekiyor) burada çözülüyor.
  const resolvedHoldText = holdText ?? t("game.submitting");
  const [isHolding, setIsHolding] = useState(false);
  const progress = useMotionValue(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const resetHold = () => {
    setIsHolding(false);
    progress.set(0);
    startTimeRef.current = 0;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  };

  const startHold = () => {
    if (disabled || animationRef.current) return;
    setIsHolding(true);
    haptics.tap();
    // Başlangıç zamanını requestAnimationFrame'in verdiği timestamp ile alıyoruz;
    // elapsed hesabı aynı zaman kaynağından geldiği için tutarlı.
    startTimeRef.current = 0;

    const animate = (time: number) => {
      if (startTimeRef.current === 0) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const current = Math.min(elapsed / holdDuration, 1);
      progress.set(current);

      if (current < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = 0;
        haptics.success();
        onComplete();
        resetHold();
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <button
      onPointerDown={startHold}
      onPointerUp={resetHold}
      onPointerLeave={resetHold}
      onPointerCancel={resetHold}
      onContextMenu={(e) => e.preventDefault()}
      disabled={disabled}
      style={{ touchAction: "none", WebkitUserSelect: "none" }}
      className={`relative overflow-hidden w-full py-5 rounded-sm font-black font-mono text-lg tracking-widest transition-[transform,opacity,background-color,border-color,box-shadow,color] duration-200 border-2 select-none
        ${
          disabled
            ? "bg-black/50 border-gray-800 text-gray-500 cursor-not-allowed scale-95 opacity-50"
            : isHolding
              ? "bg-black border-alaz-orange text-white shadow-[0_0_30px_rgba(255,77,0,0.4)] scale-[0.98]"
              : "bg-hacker-green/20 border-hacker-green text-hacker-green hover:bg-hacker-green hover:text-black shadow-[0_0_30px_rgba(0,255,65,0.4)]"
        } ${className}`}
    >
      {!disabled && (
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress, originX: 0 }}
          className="absolute inset-0 bg-alaz-orange z-0 will-change-transform"
        />
      )}

      {!disabled && !isHolding && (
        <div
          aria-hidden="true"
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-hacker-green/30 to-transparent animate-shimmer z-0 pointer-events-none"
        />
      )}

      <span className="relative z-10 drop-shadow-md">
        {isHolding ? `> ${resolvedHoldText}` : `> ${text}`}
      </span>
    </button>
  );
}
