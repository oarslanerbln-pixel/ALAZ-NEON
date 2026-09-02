import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useLocale } from "../hooks/useLocale";
import { useTopPlayers } from "../hooks/useTopPlayers";
import { useVenue } from "../contexts/VenueContextCore";

const SLIDE_DURATION = 10000; // 10 seconds per slide

type Slide =
  | { kind: "champions" }
  | { kind: "promo"; url: string }
  | { kind: "howToPlay" };

export function AttractMode({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  const { venue } = useVenue();
  const [index, setIndex] = useState(0);
  // Eskiden burada sabit, uydurma bir üçlü vardı ("Ateşin_Oğlu", 12450 puan...)
  // ve mekan sahibine demo yapılırken TV'de bu sahte isimler dönüyordu.
  const { players: topPlayers } = useTopPlayers("week", 3);

  // Gerçek veriyle podyum her zaman dolu olmayabilir. Üç kişi yoksa şampiyon
  // slaytı hiç gösterilmiyor (boş kutular yerine) — yeni bir mekanın ilk
  // gecesinde olan tam olarak budur. Mekanın kendi tanıtım görselleri
  // (VenueSettings'ten URL olarak eklenir) varsa şampiyon/nasıl-oynanır
  // slaytlarının arasına serpiştiriliyor.
  const hasPodium = topPlayers.length >= 3;
  const promoImages = venue.promo_images || [];
  const slides: Slide[] = [
    ...(hasPodium ? [{ kind: "champions" as const }] : []),
    ...promoImages.map((url) => ({ kind: "promo" as const, url })),
    { kind: "howToPlay" as const },
  ];
  // index sınır dışına taşabilir (ör. görsel listesi küçülürse) — effect
  // içinde ayrıca setIndex çağırmak yerine render sırasında TÜRETİYORUZ.
  const activeIndex = index % slides.length;
  const activeSlide = slides[activeIndex];

  // Auto-slide — yalnızca birden fazla slayt varken anlamlı
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col items-center justify-center cursor-pointer"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-alaz-orange/20 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-neon-blue/20 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: "7s" }} />
      </div>

      <AnimatePresence mode="wait">
        {activeSlide.kind === "champions" ? (
          // SLIDE: CHAMPIONS (SERIOUS & PRESTIGIOUS)
          <motion.div
            key="champions"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
            transition={{ duration: 1 }}
            className="w-full max-w-5xl flex flex-col items-center select-none"
          >
            <div className="text-center mb-8">
              <span className="text-[10px] sm:text-xs font-mono font-black tracking-[0.3em] uppercase text-amber-400 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
                ⚡ {t("leaderboard.league")} ⚡
              </span>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                {t("leaderboard.title")}
              </h1>
              <p className="text-gray-400 font-mono font-semibold uppercase tracking-[0.2em] text-xs sm:text-sm mt-2">
                {t("leaderboard.subtitle")}
              </p>
            </div>

            <div className="flex justify-center items-end gap-6 sm:gap-8 h-[380px] w-full max-w-3xl">
              {/* Rank 2 - Silver */}
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-200 mb-1 text-center truncate max-w-[180px]">
                  {topPlayers[1].name}
                </div>
                <div className="text-gray-400 font-mono font-bold text-xs sm:text-sm mb-3">
                  {topPlayers[1].score.toLocaleString()} XP
                </div>
                <div className="w-full h-44 bg-gradient-to-b from-[#1c1c28] to-[#0d0d14] border-t-2 border-t-gray-300 border-x border-white/10 rounded-t-3xl flex flex-col items-center justify-center shadow-lg">
                  <span className="text-4xl font-mono font-black text-gray-400">#02</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">SILBER</span>
                </div>
              </motion.div>

              {/* Rank 1 - Gold Champion */}
              <motion.div 
                initial={{ y: 180, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="flex-[1.2] flex flex-col items-center z-10"
              >
                <span className="px-3 py-0.5 rounded-full bg-yellow-400 text-black font-mono font-black text-[9px] uppercase tracking-widest mb-1.5 shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                  👑 CHAMPION
                </span>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1 text-center drop-shadow-sm truncate max-w-[220px]">
                  {topPlayers[0].name}
                </div>
                <div className="text-amber-400 font-mono font-black text-sm sm:text-base mb-3 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  {topPlayers[0].score.toLocaleString()} XP
                </div>
                <div className="w-full h-60 bg-gradient-to-b from-[#2a1d0d] to-[#120c05] border-t-2 border-t-yellow-400 border-x border-amber-500/30 rounded-t-3xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.25)]">
                  <span className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">#01</span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-amber-400 mt-1">GOLD</span>
                </div>
              </motion.div>

              {/* Rank 3 - Bronze */}
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="text-xl sm:text-2xl font-black uppercase tracking-tight text-amber-500 mb-1 text-center truncate max-w-[180px]">
                  {topPlayers[2].name}
                </div>
                <div className="text-gray-400 font-mono font-bold text-xs sm:text-sm mb-3">
                  {topPlayers[2].score.toLocaleString()} XP
                </div>
                <div className="w-full h-36 bg-gradient-to-b from-[#1f140e] to-[#0c0805] border-t-2 border-t-amber-700 border-x border-white/10 rounded-t-3xl flex flex-col items-center justify-center shadow-lg">
                  <span className="text-4xl font-mono font-black text-amber-700">#03</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 mt-1">BRONZE</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : activeSlide.kind === "promo" ? (
          // SLIDE: MEKANIN TANITIM GÖRSELİ
          <motion.div
            key={`promo-${activeIndex}`}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.2 }}
            className="w-full h-full flex items-center justify-center px-10 py-10"
          >
            <img
              src={activeSlide.url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)]"
              onError={() => {
                // URL bozuksa (silinmiş paylaşım, süresi dolmuş link vb.)
                // TV'de kırık görsel ikonuyla takılı kalmak yerine hemen
                // bir sonraki slayta geç.
                setIndex((prev) => (prev + 1) % slides.length);
              }}
            />
          </motion.div>
        ) : (
          // SLIDE: HOW TO PLAY
          <motion.div
            key="howToPlay"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.2 }}
            className="w-full max-w-5xl flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-16 text-center shadow-black drop-shadow-2xl">
              {t("attract.howToPlay")}
            </h1>

            <div className="grid grid-cols-3 gap-8 w-full">
              {[
                { step: 1, text: t("attract.step1"), color: "border-blue-500", glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]" },
                { step: 2, text: t("attract.step2"), color: "border-purple-500", glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]" },
                { step: 3, text: t("attract.step3"), color: "border-alaz-orange", glow: "shadow-[0_0_50px_rgba(255,77,0,0.5)]" }
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.5 + 0.5 }}
                  className={`bg-black/60 backdrop-blur-xl border-t-4 ${item.color} p-10 rounded-2xl ${item.glow} flex flex-col items-center text-center`}
                >
                  <div className={`text-6xl font-black mb-6 opacity-30 ${item.color.replace('border-', 'text-')}`}>
                    0{item.step}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase">
                    {item.text}
                  </h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED QR CODE OVERLAY */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 right-10 flex flex-col items-center bg-black/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="text-white font-black tracking-widest mb-4 animate-pulse uppercase">
          {t("attract.scanToJoin")}
        </div>
        <div className="bg-white p-3 rounded-xl">
          {/* Use window.location.origin to point to the current deployed URL */}
          <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : 'https://alaz-neon.app'}/join`} size={150} />
        </div>
        <div className="mt-4 text-alaz-orange font-black tracking-widest text-sm">
          {t("attract.joinNow")}
        </div>
      </motion.div>

      {/* Touch to start hint */}
      <div className="absolute bottom-10 left-10 text-white/40 font-bold tracking-widest uppercase text-sm animate-pulse">
        {t("landing.tagline")}
      </div>
    </motion.div>
  );
}
