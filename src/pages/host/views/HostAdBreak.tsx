import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { useVenue } from "../../../contexts/VenueContextCore";
import { useLocale } from "../../../hooks/useLocale";
import { recordAdImpression } from "../../../hooks/adImpressions";
import type { Room } from "../../../types/database";

interface HostAdBreakProps {
  onComplete: () => void;
  /** Gösterim kaydı (proof-of-play) bu odaya yazılır; verilmezse kayıt yok. */
  room?: Pick<Room, "id" | "host_uid">;
  /** Gösterim anında bağlı misafir sayısı (sponsor raporundaki izleyici). */
  audience?: number;
}

/**
 * Sponsor reklam arası. Her reklam için bir gösterim kaydı yazılır
 * (docs/roadmap.md, 3.3): sonuna kadar gösterildi mi, ne kadar ekranda
 * kaldı, kaç misafir bağlıydı. Atlanan ya da yarıda kesilen reklam da
 * kaydedilir (`completed: false`); sponsora yalnızca tam gösterim faturalanır.
 */
export function HostAdBreak({ onComplete, room, audience = 0 }: HostAdBreakProps) {
  const { venue } = useVenue();
  const { t } = useLocale();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = useMemo(() => venue.sponsor_ads || [], [venue.sponsor_ads]);

  // TV her oda güncellemesinde (nabız dahil) yeniden çiziliyor; geri çağrı
  // ve izleyici ref'te tutuluyor ki görsel reklamın zamanlayıcısı her
  // çizimde baştan başlamasın (önceden reklam hiç bitmeyebiliyordu).
  const onCompleteRef = useRef(onComplete);
  const audienceRef = useRef(audience);
  const roomRef = useRef(room);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    audienceRef.current = audience;
    roomRef.current = room;
  });

  const shown = useRef<{ index: number; startedAt: number } | null>(null);
  const videoMs = useRef(0);

  const finishAd = useCallback(
    (completed: boolean) => {
      const current = shown.current;
      if (!current) return;
      shown.current = null;
      const ad = ads[current.index];
      if (!ad || !roomRef.current) return;
      recordAdImpression({
        ad,
        room: roomRef.current,
        startedAt: current.startedAt,
        shownMs: Date.now() - current.startedAt,
        plannedMs: ad.type === "image" ? (ad.duration_seconds || 10) * 1000 : videoMs.current,
        completed,
        audience: audienceRef.current,
      });
    },
    [ads],
  );

  const advance = useCallback(
    (completed: boolean) => {
      finishAd(completed);
      if (currentAdIndex < ads.length - 1) setCurrentAdIndex((i) => i + 1);
      else onCompleteRef.current();
    },
    [ads.length, currentAdIndex, finishAd],
  );

  useEffect(() => {
    SoundManager.getInstance().stopSound(sounds.LOBBY_AMBIENT);
    SoundManager.getInstance().stopSound(sounds.GAME_PULSE);
  }, []);

  // Gösterimin başlangıcı; reklam bitmeden ekran kapanırsa "kesildi" olarak kaydedilir.
  useEffect(() => {
    if (!ads[currentAdIndex]) return;
    shown.current = { index: currentAdIndex, startedAt: Date.now() };
    videoMs.current = 0;
    return () => finishAd(false);
  }, [currentAdIndex, ads, finishAd]);

  useEffect(() => {
    const currentAd = ads[currentAdIndex];
    if (!currentAd) {
      onCompleteRef.current();
      return;
    }
    // Video kendi sonunu bildiriyor (onEnded); görselin süresi ayarda.
    if (currentAd.type !== "image") return;
    const timeout = setTimeout(() => advance(true), (currentAd.duration_seconds || 10) * 1000);
    return () => clearTimeout(timeout);
  }, [currentAdIndex, ads, advance]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];
  if (!currentAd) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      {currentAd.type === "video" ? (
        <video
          key={currentAd.id}
          src={currentAd.url}
          autoPlay
          muted={false} // Allow ad audio
          onLoadedMetadata={(e) => {
            videoMs.current = Math.round((e.currentTarget.duration || 0) * 1000);
          }}
          onEnded={() => advance(true)}
          // Yüklenemeyen video reklam arasını sonsuza dek kilitliyordu.
          onError={() => advance(false)}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          key={currentAd.id}
          src={currentAd.url}
          alt={currentAd.sponsor_name}
          className="w-full h-full object-contain"
        />
      )}

      <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-3">
        <span className="text-white/50 text-xs font-black uppercase tracking-widest">{t("adBreak.sponsor")}</span>
        <span className="text-cyber-yellow font-black uppercase tracking-widest">{currentAd.sponsor_name}</span>
      </div>

      <button
        onClick={() => {
          finishAd(false);
          onCompleteRef.current();
        }}
        className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white/50 text-xs font-black uppercase tracking-widest transition-colors z-50 relative cursor-pointer"
        style={{ pointerEvents: "auto" }}
      >
        {t("adBreak.skip")}
      </button>
    </motion.div>
  );
}
