import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { useLocale } from "../../../hooks/useLocale";
import { DURATION, EASE } from "../../../lib/motion";
import { buildShowcaseSlides, nextShowcaseIndex, SHOWCASE_IMAGE_MS } from "../../../lib/showcase";

interface HostShowcaseProps {
  joinUrl: string;
  roomCode: string;
  venuePromos?: string[];
  onClose: () => void;
  /** Yalnız önizleme için: döngü bu slayttan başlar. */
  initialIndex?: number;
}

/**
 * Gece lobisinin tanıtım döngüsü (eski kiosk modunun yerine). Marka videosu,
 * gerçek oyun ekranları bindirilmiş sahne görselleri ve mekanın kendi
 * görselleri döner; köşede HER ZAMAN bu odanın gerçek katılım QR'ı durur —
 * tanıtım misafiri masadan telefona çekmek için var.
 *
 * Geçişler üst üste binen opaklık (crossfade): `mode="wait"` arada siyah bir
 * kare bırakıyordu. Görseller yalnızca `scale` ile yavaşça yaklaşır (Ken
 * Burns); hareketi azaltmada durur, video yerine poster gelir.
 */
export function HostShowcase({ joinUrl, roomCode, venuePromos, onClose, initialIndex = 0 }: HostShowcaseProps) {
  const { t } = useLocale();
  const reduced = useReducedMotion() ?? false;
  const slides = useMemo(() => buildShowcaseSlides(venuePromos, reduced), [venuePromos, reduced]);
  const [index, setIndex] = useState(initialIndex);
  const active = index % slides.length;
  const slide = slides[active];

  const advance = useCallback(() => setIndex((i) => nextShowcaseIndex(i % slides.length, slides.length)), [slides.length]);

  // Görseller süreyle, video kendi sonunda (onEnded) ilerler.
  useEffect(() => {
    if (slide.kind !== "image") return;
    const timer = setTimeout(advance, SHOWCASE_IMAGE_MS);
    return () => clearTimeout(timer);
  }, [slide, advance]);

  // Sıradaki görseli önceden indir: geçişte boş kare görünmesin.
  useEffect(() => {
    const next = slides[nextShowcaseIndex(active, slides.length)];
    if (next?.kind === "image") new Image().src = next.src;
  }, [active, slides]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE.out }}
      onClick={onClose}
      className="fixed inset-0 z-[999] bg-black cursor-pointer overflow-hidden"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${active}-${slide.kind}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.cinematic, ease: EASE.inOut }}
          className="absolute inset-0"
        >
          {slide.kind === "video" ? (
            <video
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={slide.poster}
              onEnded={advance}
              onError={advance}
              className="w-full h-full object-cover"
            >
              <source src={slide.mp4} type="video/mp4" />
              <source src={slide.webm} type="video/webm" />
            </video>
          ) : (
            <motion.img
              src={slide.src}
              alt=""
              initial={{ scale: 1 }}
              animate={{ scale: reduced || slide.contain ? 1 : 1.08 }}
              transition={{ duration: SHOWCASE_IMAGE_MS / 1000 + DURATION.cinematic, ease: "linear" }}
              // Bozuk mekan adresi TV'yi kırık ikonda bırakmasın.
              onError={advance}
              className={`w-full h-full ${slide.contain ? "object-contain" : "object-cover"} will-change-transform`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* QR kartı okunsun diye alt kenarda yumuşak karartma. */}
      <div className="absolute inset-x-0 bottom-0 h-[380px] bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" aria-hidden="true" />

      {/* Katılım kartı animasyonsuz: döngünün asıl işi bu, görünürlüğü bir
          giriş animasyonunun bitmesine bağlı kalmasın. Katmanın kendisi zaten
          açılırken yumuşakça beliriyor. */}
      <div
        className="absolute bottom-12 right-12 flex items-center gap-6 rounded-3xl bg-black/70 border border-white/15 backdrop-blur-md px-7 py-6 shadow-[0_0_60px_rgba(255,85,0,0.25)]"
      >
        <div className="flex flex-col items-end gap-2">
          <span className="text-white font-black text-3xl uppercase tracking-[0.12em]">{t("attract.scanToJoin")}</span>
          <span className="text-white/60 text-lg font-bold uppercase tracking-[0.3em]">{t("hostHeader.roomCode")}</span>
          <span className="text-alaz-orange font-mono font-black text-5xl tracking-widest">{roomCode}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl">
          <QRCodeSVG value={joinUrl} size={196} bgColor="#ffffff" fgColor="#000000" level="H" />
        </div>
      </div>

      {/* Sol üstte: sağ üst köşe videonun kendi logosuna ayrıldı. */}
      <div className="absolute top-8 left-8 text-white/60 text-base font-bold uppercase tracking-widest bg-black/50 px-5 py-2.5 rounded-xl">
        {t("dashboard.kioskExit")}
      </div>
    </motion.div>
  );
}
