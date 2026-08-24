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

    await executeStartGame(setupGameMode, parsedCategories.length > 0 ? parsedCategories : undefined);
    setSetupGameMode(null);
  };

  const handleStartGame = (game: GameType) => {
    if (["scattegories", "quiz", "bomb"].includes(game)) {
      setSetupGameMode(game);
    } else {
      executeStartGame(game);
    }
  };

  const executeStartGame = async (game: GameType, gameCategories?: string[]) => {
    SoundManager.getInstance().playSFX(sounds.START);
    // Scattegories "lobby" ile başlar. Buraya kalıcı olarak "intro" yazmak
    // oyunu tamamen kilitliyordu: "intro" host'un YEREL sinematik animasyonu,
    // odaya ait bir durum değil. Yerel animasyon bitip gameState "lobby"ye
    // geçince senkron efekti odadan hâlâ "intro" okuyup geri çeviriyor, bu da
    // sonsuz döngü kurup lobiye hiç ulaşılamamasına yol açıyordu.
    // Quiz/bomba/sensör kendi intro DURUMLARINI ekranlarında yönettiği için
    // onlarda böyle bir sorun yok.
    let initialStatus: Room["status"] = "lobby";
    let extraUpdates: Partial<Room> = { active_game: game };
    
    if (gameCategories) {
      extraUpdates.categories = gameCategories;
    }

    if (game === "quiz") initialStatus = "quiz_intro";
    if (game === "bomb") initialStatus = "bomb_intro";
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

        <div className="flex-1 mt-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code and Players Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 flex flex-col items-center shadow-[0_0_30px_rgba(255,215,0,0.1)]">
              <h3 className="text-white font-black text-xl mb-6 uppercase tracking-widest text-center">
                {t("dashboard.joinNight")}
              </h3>
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={joinUrl} size={180} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
              <p className="mt-6 text-alaz-orange font-mono font-bold text-3xl tracking-widest">{room.code}</p>
              
              {venue.promo_images && venue.promo_images.length > 0 && (
                <button
                  onClick={() => setIsKioskMode(true)}
                  className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Kiosk Modunu Başlat
                </button>
              )}
            </div>

            <div className="flex-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col overflow-hidden max-h-[400px]">
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
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t("dashboard.startGame")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ALAZ ARENA Card */}
              <button
                onClick={() => handleStartGame("scattegories")}
                className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-alaz-orange/50 p-8 rounded-3xl text-left transition-all duration-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(255,85,0,0.3)]"
              >
                {/* Background Glow */}
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-alaz-orange/20 rounded-full blur-[80px] group-hover:bg-alaz-orange/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 bg-alaz-orange/10 border border-alaz-orange/30 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <NeonIcon type="flame" color="orange" className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-widest group-hover:text-alaz-orange transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-yellow-500">ARENA</span></h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2 flex-1">{t("dashboard.modeArenaDesc")}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-alaz-orange text-xs font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    {t("dashboard.startSession")} <span className="text-lg leading-none">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ QUIZ Card */}
              <button
                onClick={() => handleStartGame("quiz")}
                className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-neon-blue/50 p-8 rounded-3xl text-left transition-all duration-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(0,229,255,0.3)]"
              >
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-neon-blue/20 rounded-full blur-[80px] group-hover:bg-neon-blue/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 bg-neon-blue/10 border border-neon-blue/30 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <NeonIcon type="lightbulb" color="blue" className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-widest group-hover:text-neon-blue transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-blue-400">QUIZ</span></h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2 flex-1">{t("dashboard.modeQuizDesc")}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-neon-blue text-xs font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    Oturumu Başlat <span className="text-lg leading-none">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ BOMB Card */}
              <button
                onClick={() => handleStartGame("bomb")}
                className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/50 p-8 rounded-3xl text-left transition-all duration-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(255,0,0,0.3)]"
              >
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-red-500/20 rounded-full blur-[80px] group-hover:bg-red-500/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <NeonIcon type="rocket" color="red" className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-widest group-hover:text-red-500 transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">BOMB</span></h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2 flex-1">{t("dashboard.modeBombDesc")}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-red-500 text-xs font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    Oturumu Başlat <span className="text-lg leading-none">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ SENSÖR Card */}
              <button
                onClick={() => handleStartGame("sensor")}
                className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-neon-pink/50 p-8 rounded-3xl text-left transition-all duration-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(255,0,255,0.3)]"
              >
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-neon-pink/20 rounded-full blur-[80px] group-hover:bg-neon-pink/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 bg-neon-pink/10 border border-neon-pink/30 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <NeonIcon type="dashboard" color="pink" className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-widest group-hover:text-neon-pink transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-500">SENSÖR</span></h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2 flex-1">{t("dashboard.modeSensorDesc")}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-neon-pink text-xs font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    Oturumu Başlat <span className="text-lg leading-none">→</span>
                  </div>
                </div>
              </button>

              {/* ALAZ ÇARK Card */}
              <button
                onClick={() => handleStartGame("wheel")}
                className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyber-yellow/50 p-8 rounded-3xl text-left transition-all duration-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] md:col-span-2"
              >
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-cyber-yellow/20 rounded-full blur-[80px] group-hover:bg-cyber-yellow/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-180 transition-transform duration-1000">
                    <NeonIcon type="flame" color="gold" className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-widest group-hover:text-cyber-yellow transition-colors">HENGAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-yellow to-alaz-orange">ÇARK</span></h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2 flex-1">Oyun aralarında müşterilerinize sürpriz ödüller (indirim, bedava içecek vb.) dağıtın. Rastgele seçilen müşteri çarkı çevirir.</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-cyber-yellow text-xs font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    Çarkıfeleği Başlat <span className="text-lg leading-none">→</span>
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

              <div className="space-y-6 relative z-10">
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
                    rows={4}
                    value={categories}
                    onChange={(e) => {
                      setCategories(e.target.value);
                      setActivePreset(null);
                    }}
                    className="w-full bg-black/60 border-[0.5px] border-white/20 p-5 text-white focus:border-alaz-orange focus:outline-none resize-none font-black leading-relaxed rounded-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                    placeholder="Şehir, Ülke, İsim..."
                  />
                </div>

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
