import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { ConfettiEngine } from "../lib/confetti";

export interface ConfettiCanvasRef {
  burst: (originX?: number, originY?: number, particleCount?: number) => void;
  celebrationCannon: () => void;
}

interface Props {
  trigger?: boolean;
  autoCannon?: boolean;
  className?: string;
}

export const ConfettiCanvas = forwardRef<ConfettiCanvasRef, Props>(
  ({ trigger, autoCannon = true, className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<ConfettiEngine | null>(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const engine = new ConfettiEngine(canvasRef.current);
      engineRef.current = engine;

      const handleResize = () => engine.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        engine.destroy();
      };
    }, []);

    useEffect(() => {
      if (trigger && engineRef.current) {
        if (autoCannon) {
          engineRef.current.celebrationCannon();
          // Tekrarlayan patlama efekti (2. dalga)
          const timeout = setTimeout(() => {
            engineRef.current?.celebrationCannon();
          }, 600);
          return () => clearTimeout(timeout);
        } else {
          engineRef.current.burst();
        }
      }
    }, [trigger, autoCannon]);

    useImperativeHandle(ref, () => ({
      burst: (x, y, count) => engineRef.current?.burst(x, y, count),
      celebrationCannon: () => engineRef.current?.celebrationCannon(),
    }));

    return (
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-[100] ${className}`}
      />
    );
  }
);

ConfettiCanvas.displayName = "ConfettiCanvas";
