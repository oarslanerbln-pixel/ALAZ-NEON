import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { useVenue } from "../../../contexts/VenueContextCore";
import { useLocale } from "../../../hooks/useLocale";

interface HostAdBreakProps {
  onComplete: () => void;
}

export function HostAdBreak({ onComplete }: HostAdBreakProps) {
  const { venue } = useVenue();
  const { t } = useLocale();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = useMemo(() => venue.sponsor_ads || [], [venue.sponsor_ads]);
  
  useEffect(() => {
    SoundManager.getInstance().stopSound(sounds.LOBBY_AMBIENT);
    SoundManager.getInstance().stopSound(sounds.GAME_PULSE);
  }, []);

  useEffect(() => {
    if (ads.length === 0) {
      onComplete();
      return;
    }

    const currentAd = ads[currentAdIndex];
    if (!currentAd) {
      onComplete();
      return;
    }

    // Video ads control their own progression via onEnded, 
    // but we set a safety timeout or handle images here.
    let timeout: ReturnType<typeof setTimeout>;
    
    if (currentAd.type === "image") {
      timeout = setTimeout(() => {
        if (currentAdIndex < ads.length - 1) {
          setCurrentAdIndex(prev => prev + 1);
        } else {
          onComplete();
        }
      }, (currentAd.duration_seconds || 10) * 1000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentAdIndex, ads, onComplete]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      {currentAd.type === "video" ? (
        <video
          src={currentAd.url}
          autoPlay
          muted={false} // Allow ad audio
          onEnded={() => {
            if (currentAdIndex < ads.length - 1) {
              setCurrentAdIndex(prev => prev + 1);
            } else {
              onComplete();
            }
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <img 
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
        onClick={onComplete}
        className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white/50 text-xs font-black uppercase tracking-widest transition-colors z-50 relative cursor-pointer"
        style={{ pointerEvents: "auto" }}
      >
        {t("adBreak.skip")}
      </button>
    </motion.div>
  );
}
