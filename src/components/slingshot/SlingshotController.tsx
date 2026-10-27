import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "../../lib/haptics";
import { SoundManager, sounds } from "../../lib/audio";
import { EASE } from "../../lib/motion";
import { useLocale } from "../../hooks/useLocale";

export interface SlingshotLaunchData {
  power: number; // 0..100
  angle: number; // -45..+45 derece
  curve: number; // -1 (sol falso) .. +1 (sağ falso)
  timestamp: number;
}

interface SlingshotControllerProps {
  onLaunch?: (data: SlingshotLaunchData) => void;
  disabled?: boolean;
  roundHint?: string;
}

export function SlingshotController({
  onLaunch,
  disabled = false,
  roundHint,
}: SlingshotControllerProps) {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPulling, setIsPulling] = useState(false);
  const [pullPower, setPullPower] = useState(0); // 0..100
  const [pullAngle, setPullAngle] = useState(0); // -45..45
  const [curveFactor, setCurveFactor] = useState(0); // -1..1
  const [hasLaunched, setHasLaunched] = useState(false);

  // Dokunma başlangıç ve anlık koordinatları
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const currentTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastHapticPowerRef = useRef(0);

  // Canvas Boyutlandırma & Çizim
  const renderSlingshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const anchorY = height * 0.35; // Sapan çatalının yüksekliği
    const forkWidth = Math.min(width * 0.65, 240);

    const leftForkX = centerX - forkWidth / 2;
    const rightForkX = centerX + forkWidth / 2;

    // Sapanın sol ve sağ neon çatal direkleri
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#00f3ff";
    ctx.shadowColor = "#00f3ff";
    ctx.shadowBlur = 15;

    // Sol direk
    ctx.beginPath();
    ctx.arc(leftForkX, anchorY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Sağ direk
    ctx.beginPath();
    ctx.arc(rightForkX, anchorY, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Topun çekildiği nokta (mevcut parmak)
    const pullX = currentTouchRef.current ? currentTouchRef.current.x : centerX;
    const pullY = currentTouchRef.current ? Math.max(anchorY + 10, currentTouchRef.current.y) : anchorY + 30;

    // Gergi Rengi (Güce göre Yeşilden Kırmızıya)
    const p = pullPower / 100;
    const bandColor = p > 0.75 ? "#ff0055" : p > 0.4 ? "#ffaa00" : "#00f3ff";

    // Sol elastik gergi bandı
    ctx.save();
    ctx.lineWidth = Math.max(2, 6 * (1 - p * 0.5));
    ctx.strokeStyle = bandColor;
    ctx.shadowColor = bandColor;
    ctx.shadowBlur = 12 * p + 5;
    ctx.beginPath();
    ctx.moveTo(leftForkX, anchorY);
    ctx.lineTo(pullX, pullY);
    ctx.stroke();

    // Sağ elastik gergi bandı
    ctx.beginPath();
    ctx.moveTo(rightForkX, anchorY);
    ctx.lineTo(pullX, pullY);
    ctx.stroke();
    ctx.restore();

    // Çekilen 3D Futbol Topu / Enerji Çekirdeği
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = bandColor;
    ctx.shadowBlur = 20 * p + 8;
    ctx.beginPath();
    ctx.arc(pullX, pullY, 22, 0, Math.PI * 2);
    ctx.fill();

    // Topun deseni
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }, [pullPower]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);
      renderSlingshot();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderSlingshot]);

  useEffect(() => {
    renderSlingshot();
  }, [pullPower, renderSlingshot]);

  // Dokunma Başlangıcı
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    originRef.current = { x: rect.width / 2, y: rect.height * 0.35 };
    currentTouchRef.current = { x, y };

    setIsPulling(true);
    setHasLaunched(false);
    lastHapticPowerRef.current = 0;
    haptics.tap();
  };

  // Dokunarak Geri Çekme
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPulling || !originRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentTouchRef.current = { x, y };

    const dx = x - originRef.current.x;
    const dy = y - originRef.current.y;

    // Mesafe ve güç hesaplama
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 160;
    const power = Math.min(100, Math.round((distance / maxDistance) * 100));

    // Açı hesaplama (-45 ile +45 derece)
    const angleRad = Math.atan2(-dx, dy);
    const angleDeg = Math.round((angleRad * 180) / Math.PI);

    // Falso faktörü (-1..+1)
    const curve = Math.max(-1, Math.min(1, -dx / 80));

    setPullPower(power);
    setPullAngle(Math.max(-45, Math.min(45, angleDeg)));
    setCurveFactor(Number(curve.toFixed(2)));

    // Güç arttıkça kademeli dokunsal gerilim titreşimi
    if (Math.abs(power - lastHapticPowerRef.current) > 18) {
      haptics.tap();
      lastHapticPowerRef.current = power;
    }

    renderSlingshot();
  };

  // Fırlatma Anı (Parmağı Bırakma)
  const handlePointerUp = () => {
    if (!isPulling) return;

    setIsPulling(false);
    currentTouchRef.current = null;

    if (pullPower > 15) {
      setHasLaunched(true);
      haptics.impact();
      SoundManager.getInstance().playSFX(sounds.SUCCESS, 0.8);

      if (onLaunch) {
        onLaunch({
          power: pullPower,
          angle: pullAngle,
          curve: curveFactor,
          timestamp: Date.now(),
        });
      }
    }

    setPullPower(0);
    renderSlingshot();
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-4 select-none overflow-hidden bg-black text-white">
      {/* Fırlatma Flaş Efekti */}
      <AnimatePresence>
        {hasLaunched && (
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE.out }}
            className="absolute inset-0 bg-gradient-to-t from-alaz-orange to-white pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Üst HUD: Durum & Güç Telemetrisi */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-alaz-orange" />
          <span className="tabular-nums text-xs tracking-widest font-black uppercase text-white/90">
            {roundHint ?? t("slingshot.penaltyShot")}
          </span>
        </div>

        {/* Gerilim & Açı Göstergesi */}
        <div className="flex items-center gap-3 tabular-nums text-xs font-bold">
          <div className="text-cyan-400">
            {t("slingshot.angle")}: <span className="text-white">{pullAngle > 0 ? `+${pullAngle}°` : `${pullAngle}°`}</span>
          </div>
          <div className="text-alaz-orange">
            {t("slingshot.power")}: <span className="text-white">%{pullPower}</span>
          </div>
        </div>
      </div>

      {/* Orta Alan: Sapan Çizim Canvası */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex-1 my-3 flex items-center justify-center rounded-3xl border border-white/15 bg-black/50 overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Başlangıç Yönergesi */}
        {!isPulling && (disabled || !hasLaunched) && (
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center pointer-events-none text-center">
            <span className="text-3xl mb-2">👇</span>
            <span className="tabular-nums text-xs font-bold uppercase tracking-wider text-white/80 bg-black/60 px-4 py-1.5 rounded-full border border-white/15">
              {disabled ? t("slingshot.reloading") : t("slingshot.pullHint")}
            </span>
          </div>
        )}
      </div>

      {/* Alt Alan: Falso / Spin Kontrol Barı */}
      <div className="relative z-10 w-full flex flex-col gap-2 bg-white/5 border border-white/10 rounded-2xl p-3">
        <div className="flex justify-between items-center text-xs tabular-nums tracking-widest uppercase text-white/60">
          <span>⤹ {t("slingshot.curveLeft")}</span>
          <span className="text-cyan-300 font-bold">{t("slingshot.spin")}: {curveFactor}</span>
          <span>{t("slingshot.curveRight")} ⤸</span>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-neon-blue via-alaz-orange to-neon-pink transition-all"
            style={{
              left: `${(curveFactor + 1) * 50}%`,
              width: "12px",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
