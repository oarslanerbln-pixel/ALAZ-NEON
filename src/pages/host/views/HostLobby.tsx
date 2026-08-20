import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { NeonIcon } from "../../../components/NeonIcon";
import { useLocale } from "../../../hooks/useLocale";
import { upperTL } from "../../../lib/stringUtils";
import type { Player, Room } from "../../../types/database";

const CAFE_IMAGES = [
  "/wait-1.png",
  "/wait-2.png",
  "/wait-3.png",
  "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000&auto=format&fit=crop", // Istanbul 1
  "https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=2000&auto=format&fit=crop", // Istanbul 2
];

declare const __LOCAL_IP__: string | undefined;

interface HostLobbyProps {
  room: Room | null;
  players: Player[];
  onStartGame: () => void;
  onUpdateCategories: (newCategories: string[]) => void;
}

export function HostLobby({
  room,
  players,
  onStartGame,
  onUpdateCategories,
}: HostLobbyProps) {
  const [newCategory, setNewCategory] = useState("");
  const { t } = useLocale();

  const handleAddCategory = () => {
    if (!newCategory.trim() || !room) return;
    const updated = [...(room.categories || []), newCategory.trim()];
    onUpdateCategories(updated);
    setNewCategory("");
  };

  const handleRemoveCategory = (index: number) => {
    if (!room) return;
    const updated = room.categories.filter((_, i) => i !== index);
    onUpdateCategories(updated);
  };

  const currentCategories = room?.categories || [];
  const activeGame = room?.active_game || room?.game_type || "scattegories";
  const requiresCategories = ["scattegories", "bomb"].includes(activeGame);
  const canStart = players.length >= 1 && (!requiresCategories || currentCategories.length >= 1);

  // Countdown State
  const [countdownEnd, setCountdownEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [bgIndex, setBgIndex] = useState(0);

  // Background Slider for Countdown
  useEffect(() => {
    if (!countdownEnd) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % CAFE_IMAGES.length);
    }, 6000); // 6 seconds per image
    return () => clearInterval(interval);
  }, [countdownEnd]);

  // Timer Logic
  useEffect(() => {
    if (!countdownEnd) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((countdownEnd - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setCountdownEnd(null);
        onStartGame();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [countdownEnd, onStartGame]);

  const startCountdown = (minutes: number) => {
    setCountdownEnd(Date.now() + minutes * 60000);
  };

  const cancelCountdown = () => {
    setCountdownEnd(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (countdownEnd) {
    return (
      <motion.div
        key="countdown-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background Slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            <motion.img
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.15 }}
              transition={{ duration: 10, ease: "linear" }}
              src={CAFE_IMAGES[bgIndex]}
              alt="Wait Screen Background"
              className="w-full h-full object-cover object-center opacity-90"
            />
            {/* Cinematic Gradient Overlays - Reduced for visibility */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center flex flex-col items-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-alaz-orange to-yellow-300 uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] mb-8 font-premium"
          >
            Oyun Birazdan Başlıyor
          </motion.h1>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-7xl md:text-[9rem] lg:text-[12rem] font-black text-white drop-shadow-md font-mono tabular-nums leading-none bg-black/60 backdrop-blur-xl px-12 py-4 border-y-4 border-white border-x-8"
          >
            {formatTime(timeLeft)}
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex items-center gap-6"
          >
             <div className="bg-black/50 backdrop-blur-xl px-10 py-5 rounded-[2rem] border border-white/20 flex items-center gap-6">
                <div className="text-right">
                  <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest font-black mb-1">Kodla Katıl</p>
                  <p className="text-3xl md:text-5xl font-mono text-cyber-yellow font-black tracking-widest">{room?.code}</p>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="bg-white p-3 rounded-sm border-2 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <QRCodeSVG
                    value={`${window.location.protocol}//${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ + (window.location.port ? ':' + window.location.port : '') : window.location.host}/join?code=${room?.code}`}
                    size={80}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
             </div>
          </motion.div>

          <button
            onClick={cancelCountdown}
            className="mt-8 px-6 py-2 border border-white text-white/50 hover:bg-white hover:text-black transition-all text-xs tracking-widest uppercase font-bold backdrop-blur-md bg-black/50"
          >
            Geri Sayımı İptal Et
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8"
    >
      <div className="lg:col-span-3 bg-black/80 backdrop-blur-xl border border-white/20 p-10 md:p-14 text-left relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col xl:flex-row items-start gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-10 bg-alaz-orange"></div>
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-white text-4xl md:text-5xl font-black tracking-widest uppercase font-mono"
              >
                {t("lobby.title")}
              </motion.h2>
            </div>
            <p className="text-white/60 text-lg md:text-xl max-w-lg leading-relaxed font-mono uppercase tracking-wide">
              {t("lobby.subtitle", room?.total_rounds || 3)}
            </p>

            <div className="mt-12 flex flex-wrap gap-10 items-center">
              <div className="relative group/code">
                <span className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black block mb-3 font-mono">
                  ROOM_CODE
                </span>
                <div className="relative">
                  <div 
                    className="text-5xl md:text-7xl lg:text-9xl font-mono font-black tracking-tighter text-white bg-black/90 px-6 md:px-10 py-4 md:py-6 border-l-[6px] border-alaz-orange border-y border-y-white/10 relative z-10"
                    data-text={room?.code || "...."}
                  >
                    {room?.code || "...."}
                  </div>
                </div>
              </div>

              {room?.code && (
                <motion.div
                  className="bg-black/80 backdrop-blur-xl p-6 border-l-[6px] border-alaz-orange border-y border-y-white/10 flex flex-col items-center gap-6 shrink-0"
                >
                  <div className="bg-white p-4">
                    <QRCodeSVG
                      value={`${window.location.protocol}//${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ + (window.location.port ? ':' + window.location.port : '') : window.location.host}/join?code=${room.code}`}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      marginSize={0}
                    />
                  </div>
                  <div className="bg-white text-black px-10 py-3 text-sm font-black uppercase tracking-[0.3em]">
                    {t("lobby.connect")}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="w-full xl:w-96 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-white/50 uppercase tracking-[0.3em] text-[10px] font-black font-mono">
                {t("lobby.categories")}
              </span>
              <span className="text-alaz-orange text-[10px] font-black tracking-widest uppercase">
                {currentCategories.length} {t("lobby.active")}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 min-h-[160px] p-5 bg-black/60 border border-white/10 content-start">
              <AnimatePresence>
                {currentCategories.map((cat, idx) => (
                  <motion.div
                    key={`${cat}-${idx}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white text-black px-6 py-2 text-xs font-black border border-white/20 flex items-center gap-3 uppercase tracking-widest"
                  >
                    {cat}
                    <button
                      onClick={() => handleRemoveCategory(idx)}
                      aria-label={t("lobby.removeCategory", "Kategoriyi Sil")}
                      className="text-black/50 hover:text-alaz-orange transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentCategories.length === 0 && (
                <p className="text-white/30 text-xs italic p-2 w-full text-center mt-8">
                  {t("lobby.noCategories")}
                </p>
              )}
            </div>

            <div className="flex gap-2 p-2 bg-black/60 border border-white/10 focus-within:border-white/30 transition-all">
              <input
                type="text"
                placeholder={t("lobby.newCategory")}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-1 bg-transparent px-5 py-3 text-sm focus:outline-none placeholder:text-white/30 font-medium text-white uppercase tracking-widest font-mono"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                aria-label={t("lobby.addCategory", "Kategori Ekle")}
                className="bg-alaz-orange text-white w-12 h-12 flex items-center justify-center text-xl font-black cursor-pointer hover:bg-white hover:text-black transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 bg-black/80 backdrop-blur-xl border border-white/20 p-10 flex flex-col justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/10 border-2 border-white flex items-center justify-center mx-auto mb-6">
            <NeonIcon
              type="users"
              color="orange"
              className="w-10 h-10 text-white"
            />
          </div>
          <h3 className="text-6xl font-black text-white transition-all mb-2 font-mono">
            {room?.game_mode === "team"
              ? Array.from(new Set(players.map((p) => p.team_name))).filter(
                  Boolean,
                ).length
              : players.length}
          </h3>
          <p className="text-white/50 text-xs uppercase tracking-[0.4em] font-black font-mono">
            {room?.game_mode === "team"
              ? t("lobby.teamReady")
              : t("lobby.playerReady")}
          </p>
        </div>

        <div className="mt-10 pt-10 border-t border-white/20 relative z-10">
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`w-full py-5 font-black uppercase tracking-[0.3em] text-lg transition-all border-b-4 ${
              !canStart
                ? "bg-black text-white/30 border-black cursor-not-allowed border-x border-t border-white/5"
                : "bg-white text-black border-black hover:bg-alaz-orange hover:text-white hover:border-alaz-orange active:border-b-0 active:translate-y-1"
            }`}
          >
            <span className="relative z-10">{t("lobby.startGame")}</span>
          </button>
          
          <div className="mt-4 flex gap-2 w-full justify-center">
             <button
                onClick={() => startCountdown(5)}
                disabled={!canStart}
                className="flex-1 py-3 bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-colors"
             >
                5 Dk Bekle
             </button>
             <button
                onClick={() => startCountdown(10)}
                disabled={!canStart}
                className="flex-1 py-3 bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-colors"
             >
                10 Dk Bekle
             </button>
          </div>

          {players.length > 0 && currentCategories.length === 0 && requiresCategories && (
            <p className="text-[10px] text-red-500 mt-4 font-black animate-pulse tracking-widest uppercase">
              {t("lobby.noCategory")}
            </p>
          )}
        </div>
      </div>

      {/* Floating Neon Player Badges */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
        <AnimatePresence>
          {players.map((p, i) => {
            // Golden angle approximation for pseudo-random distribution
            const angle = (i * 137.5) * (Math.PI / 180);
            const radius = 25 + (i * 5) % 20; // 25 to 45 vmin
            
            // Randomize animation slightly per player
            const durationX = 15 + (i % 5) * 2;
            const durationY = 18 + (i % 7) * 2;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: [
                    `calc(-50% + ${Math.cos(angle) * radius}vw)`, 
                    `calc(-50% + ${Math.cos(angle + 1) * (radius + 5)}vw)`, 
                    `calc(-50% + ${Math.cos(angle) * radius}vw)`
                  ],
                  y: [
                    `calc(-50% + ${Math.sin(angle) * radius}vh)`, 
                    `calc(-50% + ${Math.sin(angle + 1.5) * (radius + 5)}vh)`, 
                    `calc(-50% + ${Math.sin(angle) * radius}vh)`
                  ],
                }}
                transition={{ 
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5, type: "spring", bounce: 0.5 },
                  x: { duration: durationX, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: durationY, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute left-1/2 top-1/2 bg-black/90 px-5 py-3 flex items-center gap-4 border border-white/20 border-l-[6px] border-l-alaz-orange shadow-2xl backdrop-blur-xl"
              >
                <div className="w-8 h-8 bg-white flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-black">
                    {upperTL(p.nickname.substring(0, 2))}
                  </span>
                </div>
                <div className="flex flex-col items-start pr-4">
                  <p className="text-sm font-bold text-white uppercase tracking-widest truncate max-w-[120px]">
                    {p.nickname}
                  </p>
                  {p.team_name && (
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none truncate max-w-[120px] mt-1 font-mono">
                      {p.team_name}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
