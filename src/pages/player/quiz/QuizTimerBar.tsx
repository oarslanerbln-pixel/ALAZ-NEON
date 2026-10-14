import { useEffect, useState } from "react";

import { useLocale } from "../../../hooks/useLocale";
import { countdownDeadline, remainingMs } from "../../../lib/countdown";

interface QuizTimerBarProps {
  durationSec: number;
  roundEndTime?: number | null;
  /** Sorunun başladığını bu sayfa canlı gördü mü (yenilemede `false`). */
  live: boolean;
  /** Son 5 saniyeye girilince/çıkılınca — kumanda parçacıkları hızlandırıyor. */
  onUrgentChange?: (urgent: boolean) => void;
}

/**
 * Telefonun en üstündeki ince süre çubuğu. Her soruda yeniden mount
 * edilsin diye çağıran taraf `key` olarak soru indeksini veriyor; mount anı
 * "soruyu gördüğüm an" sayılıyor (bkz. lib/countdown).
 *
 * Saniyede dört kez yalnızca bu küçük bileşen render ediliyor; kumandanın
 * geri kalanı (parçacık arka planı, şık kartları) etkilenmiyor.
 */
export function QuizTimerBar({ durationSec, roundEndTime, live, onUrgentChange }: QuizTimerBarProps) {
  const { t } = useLocale();
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(mountedAt);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  const durationMs = Math.max(1, durationSec) * 1000;
  const deadline = countdownDeadline({ mountedAt, durationMs, roundEndTime, live });
  const leftMs = remainingMs(deadline, now, durationMs);
  const secondsLeft = Math.ceil(leftMs / 1000);
  const urgent = leftMs > 0 && secondsLeft <= 5;
  useEffect(() => {
    onUrgentChange?.(urgent);
  }, [urgent, onUrgentChange]);

  const tone = urgent ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : secondsLeft <= 10 ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]" : "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]";

  return (
    <>
      {urgent && <div className="absolute inset-0 bg-red-600/10 motion-safe:animate-pulse pointer-events-none z-0" aria-hidden="true" />}
      <div
        className="absolute top-0 inset-x-0 h-1.5 bg-white/10 z-30"
        role="progressbar"
        aria-label={t("quiz.timeLeft")}
        aria-valuemin={0}
        aria-valuemax={durationSec}
        aria-valuenow={secondsLeft}
      >
        <div
          className={`h-full origin-left transition-[transform,background-color] duration-300 ease-linear ${tone}`}
          style={{ transform: `scaleX(${leftMs / durationMs})` }}
        />
      </div>
    </>
  );
}
