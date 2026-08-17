import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { NeonIcon } from "../../../components/NeonIcon";
import { useLocale } from "../../../hooks/useLocale";
import type { Player } from "../../../types/database";

const CAFE_IMAGES = [
  "/wait-1.png",
  "/wait-2.png",
  "/wait-3.png",
  "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000&auto=format&fit=crop", // Istanbul 1
  "https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=2000&auto=format&fit=crop", // Istanbul 2
];

declare const __LOCAL_IP__: string | undefined;

interface HostLobbyProps {
  room: {
    code: string;
    total_rounds: number;
    game_mode: "individual" | "team";
    categories: string[];
    game_type?: string;
  } | null;
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
  const isQuiz = room?.game_type === "quiz";
  const canStart = players.length >= 1 && (isQuiz || currentCategories.length >= 1);

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
            className="text-7xl md:text-[9rem] lg:text-[12rem] font-black text-white drop-shadow-[0_0_40px_rgba(255,0,60,0.8)] font-mono tabular-nums leading-none"
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
                <div className="bg-white p-2 rounded-xl">
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
            className="mt-8 px-6 py-2 rounded-full border border-white/20 text-white/50 hover:bg-white/10 hover:text-white transition-all text-xs tracking-widest uppercase font-bold backdrop-blur-md"
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
      <div className="lg:col-span-3 cyber-panel p-10 md:p-14 text-left relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,65,0.05)_0%,transparent_70%)] pointer-events-none animate-scanline" />
        <div className="relative z-10 flex flex-col xl:flex-row items-start gap-12">
          <div className="flex-1">
            <motion.h2
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#ff0000,45%,#ffaaaa,55%,#ff0000)] bg-[length:200%_100%] animate-shine text-5xl md:text-6xl font-black italic mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]"
            >
              {t("lobby.title")}
            </motion.h2>
            <p className="text-cyber-yellow/80 text-lg md:text-xl max-w-lg leading-relaxed font-mono">
              {t("lobby.subtitle", room?.total_rounds || 3)}
            </p>

            <div className="mt-12 flex flex-wrap gap-10 items-center">
              <div className="relative group/code">
                <span className="text-hacker-green uppercase tracking-[0.3em] text-[10px] font-black block mb-3 opacity-60 group-hover/code:opacity-100 transition-opacity font-mono">
                  &gt; SYSTEM_ID
                </span>
                <div className="relative">
                  <div 
                    className="text-5xl md:text-7xl lg:text-9xl font-sans font-black tracking-tight text-cyber-yellow bg-black/80 px-6 md:px-10 py-4 md:py-6 rounded-sm border border-cyber-yellow/30 relative z-10 shadow-[inset_0_0_20px_rgba(252,238,10,0.2)]"
                    data-text={room?.code || "...."}
                  >
                    {room?.code || "...."}
                  </div>
                  {/* Decorative glow behind code */}
                  <div className="absolute inset-0 bg-cyber-yellow/20 blur-3xl rounded-full opacity-50 group-hover/code:opacity-80 transition-opacity animate-flicker" />
                </div>
              </div>

              {room?.code && (
                <motion.div
                  animate={{
                    borderColor: ['#ff4d00', '#00f3ff', '#ff003c', '#00ff41', '#ff4d00'],
                    boxShadow: [
                      '0 0 40px rgba(255,77,0,0.4)',
                      '0 0 40px rgba(0,243,255,0.4)',
                      '0 0 40px rgba(255,0,60,0.4)',
                      '0 0 40px rgba(0,255,65,0.4)',
                      '0 0 40px rgba(255,77,0,0.4)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-white p-6 rounded-sm border-8 flex flex-col items-center gap-3 shrink-0 relative"
                >
                  <QRCodeSVG
                    value={`${window.location.protocol}//${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ + (window.location.port ? ':' + window.location.port : '') : window.location.host}/join?code=${room.code}`}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    marginSize={1}
                  />
                  <div className="bg-alaz-orange text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest absolute -bottom-4 shadow-xl border-2 border-white">
                    {t("lobby.connect")}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="w-full xl:w-96 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black">
                {t("lobby.categories")}
              </span>
              <span className="text-alaz-orange text-[10px] font-black">
                {currentCategories.length} {t("lobby.active")}
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 min-h-[160px] p-4 bg-black/20 backdrop-blur-md rounded-[1.5rem] border border-white/5 content-start">
              <AnimatePresence>
                {currentCategories.map((cat, idx) => (
                  <motion.div
                    key={`${cat}-${idx}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-alaz-orange/10 hover:bg-alaz-orange/20 px-4 py-2 rounded-xl text-sm font-bold border border-alaz-orange/20 flex items-center gap-3 group/cat transition-all text-white/90"
                  >
                    {cat}
                    <button
                      onClick={() => handleRemoveCategory(idx)}
                      className="text-white/20 hover:text-red-500 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentCategories.length === 0 && (
                <p className="text-gray-600 text-xs italic p-2 w-full text-center mt-8">
                  {t("lobby.noCategories")}
                </p>
              )}
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-sm border border-white/5 group/input focus-within:border-alaz-orange/30 transition-all relative z-20">
              <input
                type="text"
                placeholder={t("lobby.newCategory")}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-1 bg-transparent px-5 py-3 text-sm focus:outline-none placeholder:text-gray-600 font-medium"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-alaz-orange hover:bg-orange-500 text-white w-12 h-12 rounded-sm transition-all shadow-[0_0_15px_rgba(255,77,0,0.4)] flex items-center justify-center text-xl font-black cursor-pointer active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-hacker-green/10 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyber-yellow/5 blur-[100px] -ml-30 -mb-30 pointer-events-none" />
      </div>

      <div className="lg:col-span-1 cyber-panel-yellow p-10 flex flex-col justify-center text-center group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="w-20 h-20 bg-cyber-yellow/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-cyber-yellow/40 shadow-[0_0_30px_rgba(252,238,10,0.2)]">
            <NeonIcon
              type="users"
              color="orange"
              className="w-10 h-10 animate-beat text-cyber-yellow"
            />
          </div>
          <h3 className="text-6xl font-black text-cyber-yellow drop-shadow-[0_0_10px_rgba(252,238,10,0.8)] transition-all mb-2 font-mono">
            {room?.game_mode === "team"
              ? Array.from(new Set(players.map((p) => p.team_name))).filter(
                  Boolean,
                ).length
              : players.length}
          </h3>
          <p className="text-gray-400 text-xs uppercase tracking-[0.4em] font-black opacity-60">
            {room?.game_mode === "team"
              ? t("lobby.teamReady")
              : t("lobby.playerReady")}
          </p>
        </div>

        <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`w-full py-5 rounded-[1.5rem] font-black text-lg transition-all relative overflow-hidden group/start ${
              !canStart
                ? "bg-gray-900/50 text-gray-700 cursor-not-allowed border border-white/5"
                : "bg-white text-black hover:bg-alaz-orange hover:text-white shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(255,77,0,0.4)] hover:-translate-y-1"
            }`}
          >
            <span className="relative z-10">{t("lobby.startGame")}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/start:translate-x-[100%] transition-transform duration-1000" />
          </button>
          
          <div className="mt-4 flex gap-2 w-full justify-center">
             <button
                onClick={() => startCountdown(5)}
                disabled={!canStart}
                className="flex-1 py-3 bg-black/50 border border-white/10 text-white/80 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all backdrop-blur-md"
             >
                5 Dk Bekle
             </button>
             <button
                onClick={() => startCountdown(10)}
                disabled={!canStart}
                className="flex-1 py-3 bg-black/50 border border-white/10 text-white/80 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all backdrop-blur-md"
             >
                10 Dk Bekle
             </button>
          </div>

          {players.length > 0 && currentCategories.length === 0 && !isQuiz && (
            <p className="text-[10px] text-red-500 mt-4 font-black animate-pulse tracking-widest uppercase">
              {t("lobby.noCategory")}
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5 pt-8">
        <AnimatePresence>
          {players.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-panel-neon-blue p-5 text-center group cursor-default"
            >
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10 group-hover:border-neon-blue/40 transition-all">
                <span className="text-[10px] font-black text-neon-blue">
                  #{p.nickname.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-base font-black text-white/90 group-hover:text-glow-premium-blue transition-all truncate">
                {p.nickname}
              </p>
              {p.team_name && (
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  {p.team_name}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
