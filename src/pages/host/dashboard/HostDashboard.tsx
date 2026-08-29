import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { SoundManager, sounds } from "../../../lib/audio";
import { BackgroundSlider } from "../../../components/BackgroundSlider";
import { NeonIcon } from "../../../components/NeonIcon";
import { HostHeader } from "../components/HostHeader";
import type { Room, Player, GameType } from "../../../types/database";

import { getRandomSensorImage } from "../../../data/sensorImages";
import { getCategoryPresets } from "../../../lib/categoryPresets";
import { useToast } from "../../../contexts/ToastContextCore";
import { useLocale } from "../../../hooks/useLocale";
import { useVenue } from "../../../contexts/VenueContextCore";

interface HostDashboardProps {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostDashboard({ room, players, updateRoomStatus }: HostDashboardProps) {
  const { t, locale } = useLocale();
  const { venue } = useVenue();
  const { showToast } = useToast();
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [kioskImageIndex, setKioskImageIndex] = useState(0);

  // Game Setup State
  const [setupGameMode, setSetupGameMode] = useState<GameType | null>(null);
  const [categories, setCategories] = useState(t("categories.default"));
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [timerValue, setTimerValue] = useState("60");
  const [gameMode, setGameMode] = useState<"individual" | "team">("individual");
  const [totalRounds, setTotalRounds] = useState("3");
  const presets = getCategoryPresets(locale);

  useEffect(() => {
    if (!isKioskMode) return;
    const interval = setInterval(() => {
      setKioskImageIndex((prev) => (prev + 1) % (venue.promo_images?.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isKioskMode, venue.promo_images]);

  const applyPreset = (name: string) => {
    setCategories(presets[name].join(", "));
    setActivePreset(name);
  };

  const confirmStartGame = async () => {
    if (!setupGameMode) return;
    
    let parsedCategories: string[] = [];
    if (["scattegories", "quiz", "bomb"].includes(setupGameMode)) {
      parsedCategories = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
            
      if (parsedCategories.length === 0) {
        showToast(t("setup.errorNoCategory", "Kategori seçiniz!"), "warning");
        return;
      }
    }

    const settings: Partial<Room> = {
      timer_setting: parseInt(timerValue, 10),
      total_rounds: parseInt(totalRounds, 10),
      game_mode: gameMode,
      ...(parsedCategories.length > 0 ? { categories: parsedCategories } : {})
    };

    await executeStartGame(setupGameMode, settings);
    setSetupGameMode(null);
  };

  const handleStartGame = (game: GameType) => {
    if (["scattegories", "quiz", "bomb", "sensor"].includes(game)) {
      setSetupGameMode(game);
    } else {
      executeStartGame(game);
    }
  };

  const executeStartGame = async (game: GameType, settings?: Partial<Room>) => {
    SoundManager.getInstance().playSFX(sounds.START);
    // Scattegories "lobby" ile başlar. Buraya kalıcı olarak "intro" yazmak
    // oyunu tamamen kilitliyordu: "intro" host'un YEREL sinematik animasyonu,
    // odaya ait bir durum değil. Yerel animasyon bitip gameState "lobby"ye
    // geçince senkron efekti odadan hâlâ "intro" okuyup geri çeviriyor, bu da
    // sonsuz döngü kurup lobiye hiç ulaşılamamasına yol açıyordu.
    // Quiz/bomba/sensör kendi intro DURUMLARINI ekranlarında yönettiği için
    // onlarda böyle bir sorun yok.
    let initialStatus: Room["status"] = "lobby";
    let extraUpdates: Partial<Room> = { active_game: game, ...settings };

    if (game === "quiz") {
      import("../../../lib/quizQuestions").then(({ getQuizQuestions }) => {
        const questions = getQuizQuestions(room.locale || "tr", settings?.total_rounds || 3);
        const startState = (settings?.current_round === 0 || room.current_round === 0) ? "tutorial" : "quiz_intro";
        updateRoomStatus(startState, {
          ...extraUpdates,
          current_question_index: 0,
          quiz_questions: questions,
          ...(startState === "tutorial" ? { tutorial_step: 0 } : {})
        });
      });
      return; // Async update handled above
    }
    
    if (game === "bomb") {
      const activePlayers = players.filter(p => (p.lives === undefined ? 3 : p.lives) > 0);
      const randomPlayer = activePlayers.length > 0 ? activePlayers[Math.floor(Math.random() * activePlayers.length)] : null;
      const availableCategories = settings?.categories || room.categories || [];
      const randomCategory = availableCategories.length > 0 ? availableCategories[Math.floor(Math.random() * availableCategories.length)] : "GENEL";
      
      initialStatus = "tutorial";
      extraUpdates = {
        ...extraUpdates,
        tutorial_step: 0,
        current_round: 1,
        bomb_target_player: randomPlayer?.id,
        active_letter: randomCategory,
        used_bomb_categories: [randomCategory],
        used_words: [],
        bomb_speed_multiplier: 1.0,
      };
    }

    if (game === "sensor") {
      const firstImg = getRandomSensorImage([]);
      initialStatus = "sensor_intro";
      extraUpdates = {
        active_game: game,
        current_round: 0,
        used_sensor_images: [firstImg.id],
        sensor_current_media: firstImg.url,
        sensor_media_answer: firstImg.answer,
        sensor_buzzer_player_id: null,
        sensor_buzzer_timestamp: null,
        sensor_player_answer: null
      };
    }
    if (game === "wheel") {
      initialStatus = "wheel_active";
      extraUpdates = {
        active_game: game,
        wheel_spinner_id: null,
        wheel_result_index: null
      };
    }
    if (game === "overload") {
      initialStatus = "playing";
      extraUpdates = {
        active_game: game,
        overload_target_id: null,
        overload_time_allowed: 10,
        overload_start_time: 0,
        overload_eliminated_ids: []
      };
    }

    await updateRoomStatus(initialStatus, extraUpdates);
  };

  const joinUrl = `${window.location.protocol}//${window.location.host}/join?code=${room.code}`;

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-black font-sans selection:bg-alaz-orange selection:text-black">
      <BackgroundSlider className="fixed inset-0 z-0 opacity-40 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />

      <div className="p-6 md:p-10 flex flex-col h-full relative z-10">
        <HostHeader
          room={room}
        />

        <div className="flex-1 mt-4 w-full max-w-[1600px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* QR Code and Players Column */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="bg-black/60 backdrop-blur-2xl p-5 rounded-[1.5rem] border border-alaz-orange/30 flex flex-col items-center shadow-[0_0_40px_rgba(255,85,0,0.15)] relative overflow-hidden group/qr">
              <div className="absolute inset-0 bg-gradient-to-b from-alaz-orange/10 to-transparent pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-alaz-orange/20 rounded-full blur-[60px] pointer-events-none group-hover/qr:bg-alaz-orange/30 transition-colors duration-700" />

              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 bg-alaz-orange rounded-full animate-pulse shadow-[0_0_10px_#ff5500]" />
                  <span className="text-alaz-orange font-black text-[10px] uppercase tracking-[0.3em]">
                    ADIM 1 / STEP 1
                  </span>
                </div>
                
                <h3 className="text-white font-black text-xl mb-1 uppercase tracking-widest text-center leading-tight">
                  SİSTEME <span className="text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-yellow-500">GİRİŞ YAP</span>
                </h3>
                
                <p className="text-gray-400 text-[10px] font-medium text-center px-2 mb-4 leading-relaxed">
                  Müşterilerinizin oyunlara katılabilmesi için önce yandaki QR kodu okutması veya oda kodunu girmesi gerekmektedir.
                </p>

                <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] border-[4px] border-white/5 relative group-hover/qr:scale-105 transition-transform duration-500">
                  <QRCodeSVG value={joinUrl} size={140} bgColor="#ffffff" fgColor="#000000" level="H" marginSize={1} />
                </div>
                
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">ODA KODU</span>
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center justify-center">
                    <p className="text-alaz-orange font-mono font-black text-3xl tracking-widest drop-shadow-[0_0_15px_rgba(255,85,0,0.5)]">{room.code}</p>
                  </div>
                </div>

                {venue.promo_images && venue.promo_images.length > 0 && (
                  <button
                    onClick={() => setIsKioskMode(true)}
                    className="mt-8 w-full py-3 bg-white/5 hover:bg-white/15 border border-white/20 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] transition-colors"
                  >
                    Kiosk Modunu Başlat
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col overflow-hidden max-h-[250px]">
              <h3 className="text-white/60 font-black text-sm uppercase tracking-widest mb-4">
                {t("dashboard.playersCount", players.length)}
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {players.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center mt-10">{t("dashboard.waiting")}</div>
                ) : (
                  players.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 border border-white/10 p-3 rounded-xl flex justify-between items-center"
                    >
                      <span className="font-bold text-white">{p.nickname}</span>
                      <span className="text-alaz-orange font-mono text-sm">{t("dashboard.pointsSuffix", p.night_score || 0)}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Game Selection Column */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h2 className="text-lg font-black text-white/50 uppercase tracking-[0.3em] pl-2 m-0">ADIM 2: <span className="text-white">OYUN SEÇ</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              
              {/* ALAZ ARENA Card */}
              <button
                onClick={() => handleStartGame("scattegories")}
                className="relative group overflow-hidden bg-black/60 backdrop-blur-2xl border-[1.5px] border-alaz-orange/30 hover:border-alaz-orange p-5 rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(255,85,0,0.4)]"
              >
                {/* Background Glow */}
                <div className="absolute -right-20 -top-20 w-32 h-32 bg-alaz-orange/20 rounded-full blur-[50px] group-hover:bg-alaz-orange/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 bg-alaz-orange/10 border-[1.5px] border-alaz-orange/40 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(255,85,0,0.2)]">
                    <NeonIcon type="flame" color="orange" className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-widest group-hover:text-alaz-orange transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-yellow-500 drop-shadow-[0_0_10px_rgba(255,85,0,0.3)]">ARENA</span></h3>
                  <p className="text-gray-400 text-[10px] leading-snug mt-1 flex-1 font-medium">{t("dashboard.modeArenaDesc")}</p>
                  
                  <div className="mt-3 flex items-center gap-3 text-alaz-orange text-xs font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-300">
                    {t("dashboard.startSession")} <span className="text-lg leading-none group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ QUIZ Card */}
              <button
                onClick={() => handleStartGame("quiz")}
                className="relative group overflow-hidden bg-black/60 backdrop-blur-2xl border-[1.5px] border-neon-blue/30 hover:border-neon-blue p-5 rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(0,229,255,0.3)]"
              >
                <div className="absolute -right-20 -top-20 w-32 h-32 bg-neon-blue/20 rounded-full blur-[50px] group-hover:bg-neon-blue/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 bg-neon-blue/10 border-[1.5px] border-neon-blue/40 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                    <NeonIcon type="lightbulb" color="blue" className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-widest group-hover:text-neon-blue transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-blue-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]">QUIZ</span></h3>
                  <p className="text-gray-400 text-[10px] leading-snug mt-1 flex-1 font-medium">{t("dashboard.modeQuizDesc")}</p>
                  
                  <div className="mt-3 flex items-center gap-3 text-neon-blue text-xs font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-300">
                    Oturumu Başlat <span className="text-lg leading-none group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ BOMB Card */}
              <button
                onClick={() => handleStartGame("bomb")}
                className="relative group overflow-hidden bg-black/60 backdrop-blur-2xl border-[1.5px] border-red-500/30 hover:border-red-500 p-5 rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(255,0,0,0.3)]"
              >
                <div className="absolute -right-20 -top-20 w-32 h-32 bg-red-500/20 rounded-full blur-[50px] group-hover:bg-red-500/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 bg-red-500/10 border-[1.5px] border-red-500/40 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                    <NeonIcon type="rocket" color="red" className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-widest group-hover:text-red-500 transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]">BOMB</span></h3>
                  <p className="text-gray-400 text-[10px] leading-snug mt-1 flex-1 font-medium">{t("dashboard.modeBombDesc")}</p>
                  
                  <div className="mt-3 flex items-center gap-3 text-red-500 text-xs font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-300">
                    Oturumu Başlat <span className="text-lg leading-none group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ SENSÖR Card */}
              <button
                onClick={() => handleStartGame("sensor")}
                className="relative group overflow-hidden bg-black/60 backdrop-blur-2xl border-[1.5px] border-neon-pink/30 hover:border-neon-pink p-5 rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(255,0,255,0.3)]"
              >
                <div className="absolute -right-20 -top-20 w-32 h-32 bg-neon-pink/20 rounded-full blur-[50px] group-hover:bg-neon-pink/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 bg-neon-pink/10 border-[1.5px] border-neon-pink/40 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(255,0,255,0.2)]">
                    <NeonIcon type="dashboard" color="pink" className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-widest group-hover:text-neon-pink transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-500 drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]">SENSÖR</span></h3>
                  <p className="text-gray-400 text-[10px] leading-snug mt-1 flex-1 font-medium">{t("dashboard.modeSensorDesc")}</p>
                  
                  <div className="mt-3 flex items-center gap-3 text-neon-pink text-xs font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-300">
                    Oturumu Başlat <span className="text-lg leading-none group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>

              {/* NEON OVERLOAD Card */}
              <button
                onClick={() => handleStartGame("overload")}
                className="relative group overflow-hidden bg-black/60 backdrop-blur-2xl border-[1.5px] border-cyan-400/30 hover:border-cyan-400 p-5 rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(0,255,255,0.3)]"
              >
                <div className="absolute -right-20 -top-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-[50px] group-hover:bg-cyan-400/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,255,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 bg-cyan-400/10 border-[1.5px] border-cyan-400/40 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-125 transition-transform duration-500 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                    <NeonIcon type="flame" color="blue" className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-widest group-hover:text-cyan-400 transition-colors">NEON <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">OVERLOAD</span></h3>
                  <p className="text-gray-400 text-[10px] leading-snug mt-1 flex-1 font-medium">Cyberpunk temalı hız ve refleks oyunu. Top patlamadan telefonu salla veya butona basarak sıranı devret!</p>
                  
                  <div className="mt-3 flex items-center gap-3 text-cyan-400 text-xs font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-300">
                    Oturumu Başlat <span className="text-lg leading-none group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ ÇARK Card */}
              <button
                onClick={() => handleStartGame("wheel")}
                className="relative group overflow-hidden bg-black/60 backdrop-blur-2xl border-[1.5px] border-cyber-yellow/30 hover:border-cyber-yellow p-5 rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(255,215,0,0.3)] "
              >
                <div className="absolute -right-20 -top-20 w-32 h-32 bg-cyber-yellow/20 rounded-full blur-[50px] group-hover:bg-cyber-yellow/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 bg-cyber-yellow/10 border-[1.5px] border-cyber-yellow/40 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-180 transition-transform duration-1000 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                    <NeonIcon type="flame" color="gold" className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-widest group-hover:text-cyber-yellow transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-yellow to-alaz-orange drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">ÇARK</span></h3>
                  <p className="text-gray-400 text-[10px] leading-snug mt-1 flex-1 font-medium">Oyun aralarında müşterilerinize sürpriz ödüller (indirim, bedava içecek vb.) dağıtın. Rastgele seçilen müşteri çarkı çevirir.</p>
                  
                  <div className="mt-3 flex items-center gap-3 text-cyber-yellow text-xs font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-300">
                    Çarkıfeleği Başlat <span className="text-lg leading-none group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isKioskMode && venue.promo_images && venue.promo_images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsKioskMode(false)}
            className="fixed inset-0 z-[999] bg-black cursor-pointer flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={kioskImageIndex}
                src={venue.promo_images[kioskImageIndex]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="w-full h-full object-contain"
                alt="Promo"
              />
            </AnimatePresence>
            <div className="absolute top-8 right-8 text-white/30 text-[10px] uppercase tracking-widest bg-black/50 px-4 py-2 rounded-lg">
              Çıkmak için ekrana dokunun
            </div>
            
            {/* Show QR code subtly in corner during kiosk mode */}
            <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex flex-col items-center">
              <span className="text-white font-bold uppercase tracking-widest text-[10px] mb-2">Oyuna Katıl</span>
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={joinUrl} size={80} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
              <span className="text-alaz-orange font-mono font-bold mt-2">{room.code}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Setup Modal */}
      <AnimatePresence>
        {setupGameMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0f] border border-white/20 p-8 w-full max-w-2xl shadow-[0_0_50px_rgba(255,77,0,0.2)] relative overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-alaz-orange/20 rounded-full blur-[80px] pointer-events-none" />
              
              <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2 relative z-10">
                {setupGameMode === "scattegories" ? "HENGAME ARENA" : setupGameMode === "quiz" ? "HENGAME QUIZ" : "HENGAME BOMB"}
              </h3>
              <p className="text-alaz-orange text-xs font-bold uppercase tracking-widest mb-8 relative z-10">{t("setup.title", "Oyun Ayarları")}</p>

              <div className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto pr-2">
                
                {["scattegories", "quiz", "bomb"].includes(setupGameMode) && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                        {t("setup.presetLabel", "Hızlı Preset")}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {Object.keys(presets).map((name) => (
                          <button
                            key={name}
                            onClick={() => applyPreset(name)}
                            className={`px-4 py-2 font-sans font-black text-[10px] uppercase tracking-widest transition-all border-[0.5px] rounded-none shadow-md ${
                              activePreset === name
                                ? "bg-white border-white text-black"
                                : "bg-black/60 border-white/20 text-gray-400 hover:border-white/50 hover:text-white"
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-[11px] uppercase tracking-[0.3em] font-black text-alaz-orange mb-3 animate-pulse">
                        {t("setup.categoriesLabel", "Kategoriler (Virgülle Ayır)")}
                      </label>
                      <textarea
                        rows={2}
                        value={categories}
                        onChange={(e) => {
                          setCategories(e.target.value);
                          setActivePreset(null);
                        }}
                        className="w-full bg-black/60 border-[0.5px] border-white/20 p-5 text-white focus:border-alaz-orange focus:outline-none resize-none font-black leading-relaxed rounded-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                        placeholder="Şehir, Ülke, İsim..."
                      />
                    </div>

                    {/* Timer */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                        {t("setup.timerLabel", "Tur Süresi")}
                      </label>
                      <select
                        value={timerValue}
                        onChange={(e) => setTimerValue(e.target.value)}
                        className="w-full bg-black/60 border-[0.5px] border-white/20 p-3 text-white focus:border-alaz-orange focus:outline-none transition-all font-sans font-black text-[12px] uppercase tracking-[0.1em] rounded-none"
                      >
                        <option className="bg-[#0a0a0f] text-white" value="30">{t("setup.timer30", "30 Saniye")}</option>
                        <option className="bg-[#0a0a0f] text-white" value="45">{t("setup.timer45", "45 Saniye")}</option>
                        <option className="bg-[#0a0a0f] text-white" value="60">{t("setup.timer60", "60 Saniye")}</option>
                        <option className="bg-[#0a0a0f] text-white" value="90">{t("setup.timer90", "90 Saniye")}</option>
                      </select>
                    </div>

                    {/* Game Mode */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                        {t("setup.gameModeLabel", "Oyun Modu")}
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setGameMode("individual")}
                          className={`py-3 font-sans font-black text-xs uppercase tracking-widest transition-all border-[0.5px] rounded-none ${
                            gameMode === "individual" ? "bg-white text-black border-white" : "bg-black/60 border-white/20 text-gray-400 hover:border-white/40"
                          }`}
                        >
                          {t("setup.individual", "Bireysel")}
                        </button>
                        <button
                          onClick={() => setGameMode("team")}
                          className={`py-3 font-sans font-black text-xs uppercase tracking-widest transition-all border-[0.5px] rounded-none ${
                            gameMode === "team" ? "bg-alaz-orange text-black border-alaz-orange" : "bg-black/60 border-white/20 text-gray-400 hover:border-alaz-orange/40"
                          }`}
                        >
                          {t("setup.team", "Takım")}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Total Rounds (For all except wheel) */}
                {["scattegories", "quiz", "bomb", "sensor"].includes(setupGameMode) && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.roundsLabel", "Tur Sayısı")}
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                      {["3", "5", "7", "10"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setTotalRounds(r)}
                          className={`py-3 font-sans font-black text-lg transition-all border-[0.5px] rounded-none ${
                            totalRounds === r ? "bg-alaz-orange text-black border-alaz-orange" : "bg-black/60 border-white/20 text-gray-400 hover:border-alaz-orange/40"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setSetupGameMode(null)}
                    className="flex-1 py-4 font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    {t("common.cancel", "İPTAL")}
                  </button>
                  <button
                    onClick={confirmStartGame}
                    className="flex-1 py-4 font-black text-xs uppercase tracking-widest bg-alaz-orange hover:bg-alaz-orange/80 text-black transition-colors shadow-[0_0_20px_rgba(255,77,0,0.3)]"
                  >
                    {t("setup.startButton", "BAŞLAT")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
