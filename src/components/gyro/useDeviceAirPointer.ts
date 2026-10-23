import { useState, useEffect, useRef, useCallback } from "react";

export interface AirPointerState {
  x: number; // -1 (sol) ile +1 (sağ) arası normalleştirilmiş
  y: number; // -1 (üst) ile +1 (alt) arası normalleştirilmiş
  isSupported: boolean;
  permissionState: "idle" | "prompt" | "granted" | "denied";
  recalibrate: () => void;
  requestPermission: () => Promise<boolean>;
}

/**
 * Web DeviceOrientation API tabanlı, jiroskopik "Hava Faresi" (Air Pointer) hook'u.
 * iOS Safari DeviceMotionEvent.requestPermission() güvenlik akışını tam destekler.
 * Sensör kaymasını (drift) önlemek için anlık merkezleme (recalibration) içerir.
 */
export function useDeviceAirPointer(): AirPointerState {
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<"idle" | "prompt" | "granted" | "denied">("idle");

  // Kalibrasyon sıfır noktaları
  const originBetaRef = useRef<number | null>(null);
  const originGammaRef = useRef<number | null>(null);

  // Yumuşatma (Lerp) için anlık değerler
  const currentX = useRef(0);
  const currentY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);

  // Hassasiyet çarpanı (kaç derecelik eğim ekran kenarına ulaşır)
  const SENSITIVITY = 22; // +-22 derece tam ekran genişliği

  const recalibrate = useCallback(() => {
    originBetaRef.current = null;
    originGammaRef.current = null;
    targetX.current = 0;
    targetY.current = 0;
    currentX.current = 0;
    currentY.current = 0;
    setCoords({ x: 0, y: 0 });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // iOS 13+ Safari özel izni
    if (
      typeof window !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (response === "granted") {
          setPermissionState("granted");
          return true;
        } else {
          setPermissionState("denied");
          return false;
        }
      } catch (err) {
        console.warn("[AirPointer] Sensör izni reddedildi:", err);
        setPermissionState("denied");
        return false;
      }
    }

    // Android ve standart tarayıcılarda doğrudan izinli
    setPermissionState("granted");
    return true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setIsSupported(false);
      return;
    }

    // iOS Safari kontrolü: izin gerekiyor mu?
    if (
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      setPermissionState("prompt");
    } else {
      setPermissionState("granted");
    }
  }, []);

  useEffect(() => {
    if (permissionState !== "granted") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta; // X ekseni (öne-arkaya eğim: -180 ile 180)
      const gamma = e.gamma; // Y ekseni (sağa-sola yatma: -90 ile 90)

      if (beta === null || gamma === null) return;

      // İlk okunan değer veya sıfırlama anı merkez kabul edilir
      if (originBetaRef.current === null) originBetaRef.current = beta;
      if (originGammaRef.current === null) originGammaRef.current = gamma;

      const deltaGamma = gamma - originGammaRef.current;
      const deltaBeta = beta - originBetaRef.current;

      // -1 ile +1 arasına sıkıştır
      const rawX = Math.max(-1, Math.min(1, deltaGamma / SENSITIVITY));
      const rawY = Math.max(-1, Math.min(1, deltaBeta / SENSITIVITY));

      targetX.current = rawX;
      targetY.current = rawY;
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    // 60 FPS Exponential Moving Average (Jitter giderme)
    let animId: number;
    const smoothLoop = () => {
      currentX.current += (targetX.current - currentX.current) * 0.25;
      currentY.current += (targetY.current - currentY.current) * 0.25;

      setCoords({
        x: Number(currentX.current.toFixed(3)),
        y: Number(currentY.current.toFixed(3)),
      });

      animId = requestAnimationFrame(smoothLoop);
    };

    animId = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      cancelAnimationFrame(animId);
    };
  }, [permissionState]);

  return {
    x: coords.x,
    y: coords.y,
    isSupported,
    permissionState,
    recalibrate,
    requestPermission,
  };
}
