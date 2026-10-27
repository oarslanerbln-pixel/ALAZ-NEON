import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import { haptics } from "../../../lib/haptics";
import { SPRING, TWEEN } from "../../../lib/motion";
import { Volume2, VolumeX, Radio, Sparkles } from "lucide-react";

interface PlayerIntroVideoProps {
  gameTitle?: string;
  /** İkisi de verilirse tur rozeti görünür (bomba turları sabit sayıda değil). */
  currentRound?: number;
  totalRounds?: number;
}

/**
 * Hengame Mobil Oyun Açılış Sinematiği (PlayerIntroVideo)
 *
 * Oyun başlarken (gameIntro / intro) misafirin telefonunda statik bekleme yazısı yerine,
 * projenin yüksek çözünürlüklü tanıtım videosunu 60 FPS donanım hızlandırmalı
 * siberpunk HUD katmanlarıyla oynatır.
 */
export function PlayerIntroVideo({
  gameTitle = "HENGAME ARENA",
  currentRound,
  totalRounds,
}: PlayerIntroVideoProps) {
  const { t } = useLocale();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleSound = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    haptics.tap();
  };

  return (
    <motion.div
      key="player-intro-video"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={TWEEN.screen}
      className="flex-1 flex flex-col justify-between py-2 px-1 max-w-md mx-auto w-full select-none"
    >
      {/* ═══════════════════════════════════════════════════════════════
          ÜST HUD: CANLI YAYIN & TUR BİLGİSİ
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-black/60 border border-white/10 mb-3 shadow-lg">
        {/* Canlı Yayın Beacon */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs tabular-nums font-black uppercase tracking-[0.2em] text-white">
            {t("intro.liveBroadcast")}
          </span>
        </div>

        {/* Tur Bilgisi & Ses Aç/Kapa */}
        <div className="flex items-center gap-2">
          {currentRound !== undefined && totalRounds !== undefined && (
            <span className="text-xs tabular-nums font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-white/70 border border-white/10">
              {t("hostHeader.roundLabel", currentRound, totalRounds)}
            </span>
          )}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/80 active:scale-90 transition-all"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-white/50" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ORTA ÇEKİRDEK: SİNEMATİK VİDEO OYNATICI & SİBER ÇERÇEVE
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/20 bg-black">
        {/* Video Elemanı */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          poster="/media/tanitim/video-poster.webp"
          className="w-full h-full object-cover will-change-transform"
        >
          <source src="/media/tanitim/hengame-tanitim-720.webm" type="video/webm" />
          <source src="/media/tanitim/hengame-tanitim-1080.mp4" type="video/mp4" />
        </video>

        {/* Üst ve Alt Karartma Gradyanı */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

        {/* Video Üstü Canlı Logo / Başlık Rozeti */}
        <div className="absolute inset-x-0 bottom-4 px-4 flex flex-col items-center text-center z-20 pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING.snappy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 mb-1 shadow-lg"
          >
            <Sparkles className="w-3 h-3 text-alaz-orange" />
            <span className="text-xs tabular-nums font-black tracking-[0.25em] text-white uppercase">
              {gameTitle}
            </span>
          </motion.div>
          <p className="text-sm font-bold text-white">
            {t("intro.getReady")}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ALT HUD: TAKTİK BRİFİNG & BÜYÜK EKRAN UYARISI
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-4 flex flex-col gap-2.5">
        {/* Hızlı Taktik Kartı */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-alaz-orange/20 border border-alaz-orange/40 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-alaz-orange" />
          </div>
          <p className="text-xs font-semibold text-white/80 leading-snug">
            {t("intro.arenaTip")}
          </p>
        </div>

        {/* Büyük Ekrana Odaklanma Rozeti */}
        <div
          className="py-2.5 px-4 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center gap-2 text-accent text-xs tabular-nums font-bold tracking-[0.2em] uppercase"
        >
          <span>👀</span>
          <span>{t("playerReview.watchMainScreen")}</span>
        </div>
      </div>
    </motion.div>
  );
}
