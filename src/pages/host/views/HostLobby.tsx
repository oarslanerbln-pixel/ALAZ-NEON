import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { NeonIcon } from "../../../components/NeonIcon";
import { useLocale } from "../../../hooks/useLocale";
import { getCategoryPresets } from "../../../lib/categoryPresets";
import { upperTL } from "../../../lib/stringUtils";
import { Users, QrCode, Play, Clock, X } from "lucide-react";
import type { Player } from "../../../types/database";
import { NumberTicker } from "../../../components/fx";
import { playGermanVoiceover } from "../../../lib/germanVoiceover";
import { getJoinUrl } from "../../../lib/roomUrls";

const CAFE_IMAGES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=1920"
];

interface HostLobbyProps {
  room: {
    code: string;
    total_rounds: number;
    game_mode: string;
    categories?: string[];
    active_game?: string;
    game_type?: string;
  } | null;
  players: Player[];
  onStartGame: () => void;
  onUpdateCategories?: (categories: string[]) => void;
}

export function HostLobby({
  room,
  players,
  onStartGame,
  onUpdateCategories,
}: HostLobbyProps) {
  const { t, locale } = useLocale();
  const [newCategory, setNewCategory] = useState("");
  const presets = getCategoryPresets(locale);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (name: string) => {
    onUpdateCategories?.(presets[name]);
    setActivePreset(name);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const current = room?.categories || [];
    if (!current.includes(newCategory.trim())) {
      onUpdateCategories?.([...current, newCategory.trim()]);
    }
    setNewCategory("");
    setActivePreset(null);
  };

  const handleRemoveCategory = (index: number) => {
    const current = room?.categories || [];
    onUpdateCategories?.(current.filter((_, i) => i !== index));
    setActivePreset(null);
  };

  const currentCategories = room?.categories || [];
  const activeGame = room?.active_game || room?.game_type || "scattegories";
  const requiresCategories = activeGame === "scattegories";
  const canStart = players.length >= 1 && (!requiresCategories || currentCategories.length >= 1);

  // Countdown State
  const [countdownEnd, setCountdownEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [bgIndex, setBgIndex] = useState(0);
  const prevPlayerCountRef = useRef(players.length);
  const announcedLobby10Ref = useRef(false);

  // 1. Lobi açılış anonsu
  useEffect(() => {
    playGermanVoiceover("welcome_arena", 0.8);
  }, []);

  // 2. Yeni oyuncu katıldığında anons
  useEffect(() => {
    if (players.length > prevPlayerCountRef.current && prevPlayerCountRef.current > 0) {
      playGermanVoiceover("new_player_joined", 0.75);
    }
    prevPlayerCountRef.current = players.length;
  }, [players.length]);

  // Background Slider for Countdown
  useEffect(() => {
    if (!countdownEnd) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % CAFE_IMAGES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [countdownEnd]);

  useEffect(() => {
    if (!countdownEnd) return;
    announcedLobby10Ref.current = false;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((countdownEnd - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 10 && !announcedLobby10Ref.current) {
        announcedLobby10Ref.current = true;
        playGermanVoiceover("countdown_10s", 0.85);
      }

      if (remaining === 0) {
        clearInterval(interval);
        setCountdownEnd(null);
        playGermanVoiceover("game_starting", 0.9);
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
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none"
      >
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
              animate={{ scale: 1.12 }}
              transition={{ duration: 10, ease: "linear" }}
              src={CAFE_IMAGES[bgIndex]}
              alt="Background"
              className="w-full h-full object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center flex flex-col items-center p-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black text-accent uppercase tracking-[0.2em] mb-6 font-sans"
          >
            {t("hostLobby.countdownTitle")}
          </motion.h1>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-8xl md:text-[10rem] font-black text-white tabular-nums leading-none bg-black/80 px-16 py-8 rounded-[3rem] border-2 border-alaz-orange/50"
          >
            {formatTime(timeLeft)}
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center gap-6"
          >
             <div className="bg-[#0c0c14]/90 px-10 py-6 rounded-[2.5rem] border border-white/20 flex items-center gap-8">
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-[0.25em] tabular-nums font-bold mb-1">
                    {t("hostLobby.joinWithCode")}
                  </p>
                  <p className="text-4xl md:text-6xl tabular-nums text-alaz-orange font-black tracking-widest">
                    {room?.code}
                  </p>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                  <QRCodeSVG
                    value={getJoinUrl(room?.code)}
                    size={90}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
             </div>
          </motion.div>

          <button
            onClick={cancelCountdown}
            className="mt-10 px-8 py-3.5 border border-white/20 text-gray-400 hover:text-white hover:border-white/50 transition-all text-xs tracking-[0.25em] uppercase font-bold bg-black/60 rounded-full active:scale-95"
          >
            {t("hostLobby.cancelCountdown")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8 select-none"
    >
      {/* ════════════════ LEFT: JOIN STAGE & CATEGORIES ════════════════ */}
      <div className="surface lg:col-span-3 rounded-[2.5rem] p-8 md:p-12 text-left relative overflow-hidden">

        <div className="relative z-10 flex flex-col xl:flex-row items-start gap-10">
          
          <div className="flex-1 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-alaz-orange" />
                <span className="text-xs tabular-nums font-bold tracking-[0.3em] uppercase text-alaz-orange">
                  LOBİ BEKLEME SALONU
                </span>
              </div>
              <h2 className="text-white text-3xl md:text-5xl font-black tracking-tight uppercase font-sans">
                {t("lobby.title")}
              </h2>
              <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed font-medium mt-2">
                {t("lobby.subtitle", room?.total_rounds || 3)}
              </p>
            </div>

            {/* Room Code & QR Showcase Card */}
            <div className="surface-2 rounded-3xl p-6 flex flex-wrap items-center gap-6">
              {/* Room Code */}
              <div className="flex-1 min-w-[200px]">
                <span className="text-gray-400 uppercase tracking-[0.25em] text-xs tabular-nums font-bold block mb-2">
                  ODAYA KATILMA KODU
                </span>
                <div className="text-5xl md:text-7xl font-black tracking-widest text-alaz-orange tabular-nums">
                  {room?.code || "...."}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-300 font-medium">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Kameranızla QR kodu okutun</span>
                </div>
              </div>

              {/* QR Code */}
              {room?.code && (
                <div className="bg-white p-3.5 rounded-2xl flex items-center justify-center shrink-0">
                  <QRCodeSVG
                    value={getJoinUrl(room.code)}
                    size={155}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    marginSize={0}
                  />
                </div>
              )}
            </div>

            {/* Connected Player Count summary */}
            <div className="flex items-center gap-4 text-sm text-gray-300 font-medium">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <Users className="w-4 h-4 text-emerald-400" />
                <NumberTicker value={players.length} className="tabular-nums font-bold text-white text-sm" />
                <span className="text-xs text-gray-400">Oyuncu Bağlandı</span>
              </div>
            </div>
          </div>

          {/* Categories Panel (For Word Arena / Scattegories) */}
          {requiresCategories && (
            <div className="w-full xl:w-96 space-y-6 bg-black/60 p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl shrink-0">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-400 uppercase tracking-[0.25em] text-xs tabular-nums font-bold block mb-1">
                    {t("lobby.categories")}
                  </span>
                  <span className="text-alaz-orange text-xs tabular-nums font-bold tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-alaz-orange" />
                    {currentCategories.length} {t("lobby.active")}
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2.5">
                <span className="text-gray-400 uppercase tracking-[0.2em] text-xs tabular-nums font-bold block">
                  HIZLI PRESETLER
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(presets).map((name) => (
                    <button
                      key={name}
                      onClick={() => applyPreset(name)}
                      className={`px-3 py-1.5 tabular-nums text-xs uppercase font-bold tracking-wider transition-all rounded-xl border ${
                        activePreset === name
                          ? "bg-alaz-orange text-black border-alaz-orange "
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Categories List */}
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto p-3 bg-black/40 rounded-2xl border border-white/5 custom-scrollbar">
                <AnimatePresence>
                  {currentCategories.map((cat, idx) => (
                    <motion.div
                      key={`${cat}-${idx}`}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 10, opacity: 0 }}
                      className="bg-white/5 text-white/90 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/10 flex items-center justify-between uppercase tracking-wider"
                    >
                      <span className="truncate pr-3">{cat}</span>
                      <button
                        onClick={() => handleRemoveCategory(idx)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentCategories.length === 0 && (
                  <p className="text-gray-500 text-xs tabular-nums text-center py-4">
                    {t("lobby.noCategories")}
                  </p>
                )}
              </div>

              {/* Add Custom Category */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("lobby.newCategory")}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  className="flex-1 bg-black/60 border border-white/15 px-4 py-3 rounded-2xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-alaz-orange tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-white/10 hover:bg-alaz-orange hover:text-black border border-white/15 text-white px-5 rounded-2xl font-black text-lg transition-all active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ════════════════ RIGHT: PLAYER ROSTER & LAUNCH ════════════════ */}
      <div className="surface lg:col-span-1 rounded-[2.5rem] p-8 flex flex-col justify-between text-center relative overflow-hidden">

        <div className="relative z-10">
          <div className="w-20 h-20 bg-accent/10 border border-accent/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <NeonIcon
              type="users"
              color="white"
              className="w-10 h-10 text-alaz-orange"
            />
          </div>

          <div className="text-6xl md:text-7xl font-black text-white tracking-tight tabular-nums mb-2">
            <NumberTicker
              value={room?.game_mode === "team"
                ? Array.from(new Set(players.map((p) => p.team_name))).filter(Boolean).length
                : players.length}
              className="text-6xl md:text-7xl font-black text-white tabular-nums"
            />
          </div>
          
          <p className="text-gray-400 text-xs tabular-nums font-bold uppercase tracking-[0.25em] bg-white/5 border border-white/10 px-4 py-1.5 rounded-full inline-block">
            {room?.game_mode === "team" ? t("lobby.teamReady") : t("lobby.playerReady")}
          </p>
        </div>

        {/* Start Button & Timer Triggers */}
        <div className="mt-8 pt-6 border-t border-white/10 relative z-10 space-y-4">
          <button
            type="button"
            onClick={onStartGame}
            disabled={!canStart}
            className="btn-primary w-full px-6 py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-sm flex items-center justify-center gap-3"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t("lobby.startGame")}</span>
          </button>
          
          {/* Quick Timers */}
          <div className="flex gap-2">
             <button
                onClick={() => startCountdown(5)}
                disabled={!canStart}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/30 text-xs tabular-nums font-bold uppercase tracking-wider disabled:opacity-30 transition-all flex items-center justify-center gap-1.5"
             >
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>5 Dk</span>
             </button>
             <button
                onClick={() => startCountdown(10)}
                disabled={!canStart}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/30 text-xs tabular-nums font-bold uppercase tracking-wider disabled:opacity-30 transition-all flex items-center justify-center gap-1.5"
             >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>10 Dk</span>
             </button>
          </div>

          {players.length > 0 && currentCategories.length === 0 && requiresCategories && (
            <p className="text-xs text-red-400 tabular-nums font-bold tracking-wider uppercase">
              {t("lobby.noCategory")}
            </p>
          )}
        </div>
      </div>

      {/* Oyuncu avatarları: yerinde sabit, yalnızca girişte belirir */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
        <AnimatePresence>
          {players.map((p, i) => {
            const angle = (i * 137.5) * (Math.PI / 180);
            const radius = 26 + (i * 5) % 18;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: `calc(-50% + ${Math.cos(angle) * radius}vw)`,
                  y: `calc(-50% + ${Math.sin(angle) * radius}vh)`,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 surface px-5 py-3 rounded-2xl flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl surface-2 flex items-center justify-center shrink-0 tabular-nums font-black text-white text-xs">
                  {upperTL(p.nickname.substring(0, 2))}
                </div>
                <div className="flex flex-col items-start pr-2">
                  <p className="text-xs font-black text-white uppercase tracking-wider truncate max-w-[130px]">
                    {p.nickname}
                  </p>
                  {p.team_name && (
                    <p className="text-xs text-alaz-orange tabular-nums font-bold uppercase tracking-tight leading-none truncate max-w-[130px] mt-1">
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
