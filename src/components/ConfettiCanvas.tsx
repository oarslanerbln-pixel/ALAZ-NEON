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

/**
 * Tam ekran konfeti tuvali.
 *
 * Boyut, pencereden değil tuvalin KENDİ kutusundan alınıyor (ResizeObserver).
 * `position: fixed` bir eleman TVScaleFrame gibi transform'lu bir atanın
 * içindeyse kutusu 1920×1080'lik sanal tuvaldir; pencere (ör. 1366×768)
 * baz alınınca tuval orantısız gerilip bulanıklaşıyordu.
 */
export const ConfettiCanvas = forwardRef<ConfettiCanvasRef, Props>(
  ({ trigger, autoCannon = true, className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<ConfettiEngine | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new ConfettiEngine(canvas);
      engineRef.current = engine;

      let observer: ResizeObserver | null = null;
      const onWindowResize = () => engine.resize();

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver((entries) => {
          const rect = entries[0]?.contentRect;
          if (rect) engine.resize(rect.width, rect.height);
        });
        observer.observe(canvas);
      } else {
        window.addEventListener("resize", onWindowResize);
      }

      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", onWindowResize);
        engine.destroy();
        engineRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (!trigger || !engineRef.current) return;
      if (autoCannon) {
        engineRef.current.celebrationCannon();
        // İkinci dalga: tek patlama "bitti" hissi verir, ikincisi kutlamayı sürdürür
        const timeout = setTimeout(() => engineRef.current?.celebrationCannon(), 600);
        return () => clearTimeout(timeout);
      }
      engineRef.current.burst();
    }, [trigger, autoCannon]);

    useImperativeHandle(ref, () => ({
      burst: (x, y, count) => engineRef.current?.burst(x, y, count),
      celebrationCannon: () => engineRef.current?.celebrationCannon(),
    }));

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`fixed inset-0 w-full h-full pointer-events-none z-[100] ${className}`}
      />
    );
  }
);

ConfettiCanvas.displayName = "ConfettiCanvas";
