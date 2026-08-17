import { useState, useRef, useEffect } from "react";

interface HoldButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  className?: string;
  text: string;
  holdText?: string;
  holdDuration?: number;
}

export function HoldButton({
  onComplete,
  disabled = false,
  className = "",
  text,
  holdText = "GÖNDERİLİYOR...",
  holdDuration = 1000,
}: HoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const startHold = () => {
    if (disabled) return;
    setIsHolding(true);
    // Başlangıç zamanını performance.now() ile değil, requestAnimationFrame'in
    // verdiği timestamp ile alıyoruz — render saflığı kuralını ihlal etmiyor
    // ve elapsed hesabı aynı zaman kaynağından geldiği için daha tutarlı.
    startTimeRef.current = 0;

    const animate = (time: number) => {
      if (startTimeRef.current === 0) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const currentProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
        resetHold();
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const resetHold = () => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = 0;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
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
      onContextMenu={(e) => e.preventDefault()}
      disabled={disabled}
      style={{ touchAction: "none", WebkitUserSelect: "none" }}
      className={`relative overflow-hidden w-full py-5 rounded-sm font-black font-mono text-lg tracking-widest transition-all border-2 select-none 
        ${
          disabled
            ? "bg-black/50 border-gray-800 text-gray-500 cursor-not-allowed scale-95 opacity-50"
            : isHolding
              ? "bg-black border-alaz-orange text-white shadow-[0_0_30px_rgba(255,77,0,0.4)] scale-[0.98]"
              : "bg-hacker-green/20 border-hacker-green text-hacker-green hover:bg-hacker-green hover:text-black shadow-[0_0_30px_rgba(0,255,65,0.4)]"
        } ${className}`}
    >
      {!disabled && (
        <div
          className="absolute inset-y-0 left-0 bg-alaz-orange transition-none z-0"
          style={{ width: `${progress}%` }}
        />
      )}

      {!disabled && !isHolding && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-hacker-green/30 to-transparent -translate-x-full animate-shimmer z-0" />
      )}

      <span className="relative z-10 drop-shadow-md">
        {isHolding ? `> ${holdText}` : `> ${text}`}
      </span>
    </button>
  );
}
