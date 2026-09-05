import { useState, useEffect, type ComponentProps } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { SoundManager, sounds } from "../../../lib/audio";
import { NeonIcon } from "../../../components/NeonIcon";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import type { Room, Player, GameType } from "../../../types/database";

import { doc, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";

import { getRandomSensorImage } from "../../../data/sensorImages";
import { GameSettingsModal } from "../components/GameSettingsModal";
import { useLocale } from "../../../hooks/useLocale";
import type { TranslationKey } from "../../../lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVenue } from "../../../contexts/VenueContextCore";


/**
 * Dashboard'daki oyun kartlari. `id` alani `GameType` ile birebir ortusmeli:
 * HostDisplay ve PlayerGame yonlendirmesi bu degere bakiyor. Bir mod burada
 * yoksa uygulamada baslatilamaz — echo/pulse/spectrum/bar/kablo uzun sure
 * bu yuzden erisilemez kalmisti.
 */
interface GameCard {
  id: GameType;
  titlePrefix: string;
  titleHighlight: string;
  gradientText: string;
  shadowColor: string;
  icon: NonNullable<ComponentProps<typeof NeonIcon>["type"]>;
  iconColor: NonNullable<ComponentProps<typeof NeonIcon>["color"]>;
  descKey: TranslationKey;
  bgAccent: string;
  hoverBgAccent: string;
  iconAccent: string;
  borderAccent: string;
}

const GAMES: GameCard[] = [
  {
    id: "scattegories",
    titlePrefix: "HENGAME",
    titleHighlight: "ARENA",
    gradientText: "from-alaz-orange to-yellow-500 drop-shadow-[0_0_10px_rgba(255,85,0,0.3)]",
    shadowColor: "rgba(255,85,0,0.4)",
    icon: "flame" as const,
    iconColor: "orange" as const,
    descKey: "dashboard.modeArenaDesc",
    bgAccent: "bg-alaz-orange/20",
    hoverBgAccent: "group-hover:bg-alaz-orange/40",
    iconAccent: "bg-alaz-orange/10 border-alaz-orange/40",
    borderAccent: "hover:border-alaz-orange/60"
  },
  {
    id: "quiz",
    titlePrefix: "HENGAME",
    titleHighlight: "QUIZ",
    gradientText: "from-neon-blue to-blue-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]",
    shadowColor: "rgba(0,229,255,0.3)",
    icon: "lightbulb" as const,
    iconColor: "blue" as const,
    descKey: "dashboard.modeQuizDesc",
    bgAccent: "bg-neon-blue/20",
    hoverBgAccent: "group-hover:bg-neon-blue/40",
    iconAccent: "bg-neon-blue/10 border-neon-blue/40",
    borderAccent: "hover:border-neon-blue/60"
  },
  {
    id: "bomb",
    titlePrefix: "HENGAME",
    titleHighlight: "BOMB",
    gradientText: "from-red-500 to-orange-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]",
    shadowColor: "rgba(255,0,0,0.3)",
    icon: "rocket" as const,
    iconColor: "red" as const,
    descKey: "dashboard.modeBombDesc",
    bgAccent: "bg-red-500/20",
    hoverBgAccent: "group-hover:bg-red-500/40",
    iconAccent: "bg-red-500/10 border-red-500/40",
    borderAccent: "hover:border-red-500/60"
  },
  {
    id: "sensor",
    titlePrefix: "HENGAME",
    titleHighlight: "SENSÖR",
    gradientText: "from-neon-pink to-purple-500 drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]",
    shadowColor: "rgba(255,0,255,0.3)",
    icon: "dashboard" as const,
    iconColor: "pink" as const,
    descKey: "dashboard.modeSensorDesc",
    bgAccent: "bg-neon-pink/20",
    hoverBgAccent: "group-hover:bg-neon-pink/40",
    iconAccent: "bg-neon-pink/10 border-neon-pink/40",
    borderAccent: "hover:border-neon-pink/60"
  },
  {
    id: "overload",
    titlePrefix: "NEON",
    titleHighlight: "OVERLOAD",
    gradientText: "from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]",
    shadowColor: "rgba(0,255,255,0.3)",
    icon: "flame" as const,
    iconColor: "blue" as const,
    descKey: "dashboard.modeOverloadDesc",
    bgAccent: "bg-cyan-400/20",
    hoverBgAccent: "group-hover:bg-cyan-400/40",
    iconAccent: "bg-cyan-400/10 border-cyan-400/40",
    borderAccent: "hover:border-cyan-400/60"
  },
  {
    id: "colors",
    titlePrefix: "NEON",
    titleHighlight: "SAVAŞLARI",
    gradientText: "from-purple-400 to-pink-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]",
    shadowColor: "rgba(168,85,247,0.3)",
    icon: "dashboard" as const,
    iconColor: "pink" as const,
    descKey: "dashboard.modeColorsDesc",
    bgAccent: "bg-purple-500/20",
    hoverBgAccent: "group-hover:bg-purple-500/40",
    iconAccent: "bg-purple-500/10 border-purple-500/40",
    borderAccent: "hover:border-purple-500/60"
  },
  {
    id: "wheel",
    titlePrefix: "HENGAME",
    titleHighlight: "ÇARK",
    gradientText: "from-cyber-yellow to-alaz-orange drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]",
    shadowColor: "rgba(255,215,0,0.3)",
    icon: "flame" as const,
    iconColor: "gold" as const,
    descKey: "dashboard.modeWheelDesc",
    bgAccent: "bg-cyber-yellow/20",
    hoverBgAccent: "group-hover:bg-cyber-yellow/40",
    iconAccent: "bg-cyber-yellow/10 border-cyber-yellow/40",
    borderAccent: "hover:border-cyber-yellow/60"
  },
  {
    id: "vault",
    titlePrefix: "NEON",
    titleHighlight: "ŞİFRE",
    gradientText: "from-emerald-400 to-teal-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    shadowColor: "rgba(16,185,129,0.3)",
    icon: "flame" as const,
    iconColor: "green" as const,
    descKey: "dashboard.modeVaultDesc",
    bgAccent: "bg-emerald-500/20",
    hoverBgAccent: "group-hover:bg-emerald-500/40",
    iconAccent: "bg-emerald-500/10 border-emerald-500/40",
    borderAccent: "hover:border-emerald-500/60"
  },
  {
    id: "unity",
    titlePrefix: "NEON",
    titleHighlight: "BİRLİK",
    gradientText: "from-amber-400 to-orange-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]",
    shadowColor: "rgba(245,158,11,0.3)",
    icon: "flame" as const,
    iconColor: "orange" as const,
    descKey: "dashboard.modeUnityDesc",
    bgAccent: "bg-amber-500/20",
    hoverBgAccent: "group-hover:bg-amber-500/40",
    iconAccent: "bg-amber-500/10 border-amber-500/40",
    borderAccent: "hover:border-amber-500/60"
  },
  {
    id: "echo",
    titlePrefix: "HENGAME",
    titleHighlight: "ECHO",
    gradientText: "from-indigo-400 to-violet-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]",
    shadowColor: "rgba(99,102,241,0.3)",
    icon: "users",
    iconColor: "blue",
    descKey: "dashboard.modeEchoDesc",
    bgAccent: "bg-indigo-500/20",
    hoverBgAccent: "group-hover:bg-indigo-500/40",
    iconAccent: "bg-indigo-500/10 border-indigo-500/40",
    borderAccent: "hover:border-indigo-500/60"
  },
  {
    id: "pulse",
    titlePrefix: "NEON",
    titleHighlight: "PULSE",
    gradientText: "from-neon-blue to-cyan-300 drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]",
    shadowColor: "rgba(0,243,255,0.3)",
    icon: "dashboard",
    iconColor: "blue",
    descKey: "dashboard.modePulseDesc",
    bgAccent: "bg-neon-blue/20",
    hoverBgAccent: "group-hover:bg-neon-blue/40",
    iconAccent: "bg-neon-blue/10 border-neon-blue/40",
    borderAccent: "hover:border-neon-blue/60"
  },
  {
    id: "spectrum",
    titlePrefix: "NEON",
    titleHighlight: "SPEKTRUM",
    gradientText: "from-rose-400 to-sky-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]",
    shadowColor: "rgba(244,63,94,0.3)",
    icon: "users",
    iconColor: "pink",
    descKey: "dashboard.modeSpectrumDesc",
    bgAccent: "bg-rose-500/20",
    hoverBgAccent: "group-hover:bg-rose-500/40",
    iconAccent: "bg-rose-500/10 border-rose-500/40",
    borderAccent: "hover:border-rose-500/60"
  },
  {
    id: "bar",
    titlePrefix: "NEON",
    titleHighlight: "BAR",
    gradientText: "from-pink-400 to-fuchsia-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]",
    shadowColor: "rgba(236,72,153,0.3)",
    icon: "crown",
    iconColor: "pink",
    descKey: "dashboard.modeBarDesc",
    bgAccent: "bg-pink-500/20",
    hoverBgAccent: "group-hover:bg-pink-500/40",
    iconAccent: "bg-pink-500/10 border-pink-500/40",
    borderAccent: "hover:border-pink-500/60"
  },
  {
    id: "kablo",
    titlePrefix: "NEON",
    titleHighlight: "KABLO",
    gradientText: "from-yellow-400 to-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]",
    shadowColor: "rgba(245,158,11,0.3)",
    icon: "flame",
    iconColor: "gold",
    descKey: "dashboard.modeKabloDesc",
    bgAccent: "bg-yellow-500/20",
    hoverBgAccent: "group-hover:bg-yellow-500/40",
    iconAccent: "bg-yellow-500/10 border-yellow-500/40",
    borderAccent: "hover:border-yellow-500/60"
  }
];

interface HostDashboardProps {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostDashboard({ room, players, updateRoomStatus }: HostDashboardProps) {
  const { t } = useLocale();
  const { venue } = useVenue();
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [kioskImageIndex, setKioskImageIndex] = useState(0);

  // Game Setup State
  const [setupGameMode, setSetupGameMode] = useState<GameType | null>(null);

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    let next = carouselIndex + newDirection;
    if (next < 0) next = GAMES.length - 1;
    if (next >= GAMES.length) next = 0;
    setCarouselIndex(next);
  };


  useEffect(() => {
    if (!isKioskMode) return;
    const interval = setInterval(() => {
      setKioskImageIndex((prev) => (prev + 1) % (venue.promo_images?.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isKioskMode, venue.promo_images]);

  const handleStartGame = (game: GameType) => {
    setSetupGameMode(game);
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
    if (game === "colors") {
      initialStatus = "colors_intro";
      extraUpdates = {
        active_game: game,
      };
    }

    // Echo / Spectrum / Pulse ekranlari kurulumlarini kendileri yapiyor, ama
    // bunu yalnizca ilgili alan BOSKEN yapiyorlar: alanlar burada
    // temizlenmezse ikinci tur onceki turun sorusu/oylari ve kadrosuyla
    // aciliyor. Ayrica dogrudan *_intro ile basliyoruz — "lobby" uzerinden
    // gecmek, oyuncu telefonlarinda hicbir dala uymayan kisa bir bos kare
    // birakiyordu (bu ekranlarin hepsi *_intro durumunu tanıyor).
    if (game === "echo") {
      initialStatus = "echo_intro";
      extraUpdates = {
        ...extraUpdates,
        echo_question: null,
        echo_votes: {},
      };
    }

    if (game === "spectrum") {
      initialStatus = "spectrum_intro";
      extraUpdates = {
        ...extraUpdates,
        spectrum_teams: null,
        spectrum_scores: { red: 50, blue: 50 },
      };
    }

    if (game === "pulse") {
      initialStatus = "pulse_intro";
      extraUpdates = {
        ...extraUpdates,
        pulse_clicks: {},
      };
    }

    // Bar ve Kablo, Echo/Spectrum'un aksine "lobby"den kendini baslatmiyor:
    // ekranlari dogrudan *_intro durumunu bekliyor. Lobby ile acilirlarsa
    // hicbir dala girmeyip bos ekranda kaliyorlar.
    if (game === "bar") {
      initialStatus = "bar_intro";
      extraUpdates = {
        ...extraUpdates,
        bar_active_recipe: [],
        bar_end_time: 0,
      };
    }

    if (game === "kablo") {
      initialStatus = "kablo_intro";
      extraUpdates = {
        ...extraUpdates,
        kablo_winner_id: null,
      };
    }

    // Bar ve Kablo skorlari oyuncu dokumaninda birikiyor ve hicbir yerde
    // sifirlanmiyordu: ikinci Kablo turu, onceki turun toplami zaten hedefin
    // ustunde oldugu icin aninca "kazanildi" ekranina duserdi.
    if (game === "bar" || game === "kablo") {
      const resetField = game === "bar" ? "bar_score" : "kablo_score";
      const batch = writeBatch(db);
      players.forEach((p) => {
        batch.update(doc(db, "players", p.id), { [resetField]: 0 });
      });
      await batch.commit();
    }

    await updateRoomStatus(initialStatus, extraUpdates);
  };

  const joinUrl = `${window.location.protocol}//${window.location.host}/join?code=${room.code}`;

  return (
    <TVScaleFrame>
    <div className="w-full h-full relative overflow-hidden font-sans selection:bg-alaz-orange selection:text-black">
      {/* Light Pastel Background */}
      <div className="absolute inset-0 bg-slate-50 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 z-0" />
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />

      <div className="p-6 md:p-10 flex flex-col h-full relative z-10">
        <HostHeader
          room={room}
        />

        <div className="flex-1 mt-4 w-full max-w-[1600px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* QR Code and Players Column */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="bg-[#0b0b14]/90 backdrop-blur-3xl p-5 rounded-[1.5rem] border border-white/10 flex flex-col items-center shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] relative overflow-hidden group/qr">
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
                  SİSTEME <span className="text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-yellow-500">{t("host.login", "GİRİŞ YAP")}</span>
                </h3>
                
                <p className="text-gray-300 text-[11px] font-medium text-center px-2 mb-4 leading-relaxed">
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

            <div className="flex-1 bg-[#0b0b14]/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] p-4 flex flex-col overflow-hidden max-h-[250px]">
              <h3 className="text-gray-300 font-black text-sm uppercase tracking-widest mb-4">
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
            <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[500px]">
              <h2 className="text-lg font-black text-slate-500 uppercase tracking-[0.3em] drop-shadow-sm mb-6">
                {t("host.step2", "ADIM 2: ")}<span className="text-slate-800">{t("host.selectGame", "OYUN SEÇ")}</span>
              </h2>
              
              <div className="relative w-full max-w-4xl aspect-[21/9] flex items-center justify-center perspective-1000">
                {/* Carousel Left Arrow */}
                <button
                  onClick={() => paginate(-1)}
                  className="absolute left-0 z-20 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 shadow-xl -ml-8"
                >
                  <ChevronLeft className="w-8 h-8 text-slate-800 opacity-80" />
                </button>

                <div className="w-full h-full relative overflow-visible flex items-center justify-center px-4">
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={carouselIndex}
                      custom={direction}
                      initial={{ opacity: 0, x: direction > 0 ? 300 : -300, scale: 0.8, rotateY: direction > 0 ? -15 : 15 }}
                      animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, x: direction < 0 ? 300 : -300, scale: 0.8, rotateY: direction < 0 ? -15 : 15 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-0 flex items-center justify-center p-4"
                    >
                      {(() => {
                        const game = GAMES[carouselIndex];
                        return (
                          <button
                            onClick={() => handleStartGame(game.id)}
                            className={`w-full h-full relative group overflow-hidden bg-[#0b0b14]/90 backdrop-blur-3xl border border-white/10 ${game.borderAccent} p-10 rounded-sm text-left transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]`}
                            style={{ boxShadow: `0 20px 50px ${game.shadowColor}, inset 0 1px 1px rgba(255,255,255,0.3)` }}
                          >
                            {/* Devasa Filigran İkon */}
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000 pointer-events-none rotate-12">
                              <NeonIcon type={game.icon} color={game.iconColor} className="w-96 h-96" />
                            </div>

                            {/* Arka Plan Glow */}
                            <div className={`absolute -right-20 -top-20 w-64 h-64 ${game.bgAccent} rounded-full blur-[80px] ${game.hoverBgAccent} transition-colors duration-700 pointer-events-none`} />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col h-full justify-between">
                              <div>
                                <div className={`w-16 h-16 ${game.iconAccent} border-[1.5px] rounded-sm flex items-center justify-center mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-xl`}>
                                  <NeonIcon type={game.icon} color={game.iconColor} className="w-8 h-8" />
                                </div>
                                <h3 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-widest transition-colors uppercase">
                                  {game.titlePrefix} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${game.gradientText}`}>{game.titleHighlight}</span>
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed mt-4 max-w-xl font-medium">
                                  {t(game.descKey)}
                                </p>
                              </div>
                              
                              <div className="mt-8 flex items-center gap-4 text-white text-sm font-black tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-all duration-300">
                                <div className="bg-white/10 px-6 py-3 rounded-sm flex items-center gap-3 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-colors">
                                  {t("dashboard.startSession", "SESSION STARTEN")} <span className="text-xl leading-none group-hover:translate-x-3 transition-transform">→</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Carousel Right Arrow */}
                <button
                  onClick={() => paginate(1)}
                  className="absolute right-0 z-20 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 shadow-xl -mr-8"
                >
                  <ChevronRight className="w-8 h-8 text-slate-800 opacity-80" />
                </button>
              </div>
              
              {/* Carousel Indicators */}
              {/* 14 mod var: tek satira sigmazsa alt satira sarsin. */}
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8 max-w-md">
                {GAMES.map((g, idx) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setDirection(idx > carouselIndex ? 1 : -1);
                      setCarouselIndex(idx);
                    }}
                    aria-label={`${g.titlePrefix} ${g.titleHighlight}`}
                    aria-current={idx === carouselIndex}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === carouselIndex ? 'w-8 bg-slate-800' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
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
              <span className="text-white font-bold uppercase tracking-widest text-[10px] mb-2">{t("host.joinGame", "Oyuna Katıl")}</span>
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={joinUrl} size={80} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
              <span className="text-alaz-orange font-mono font-bold mt-2">{room.code}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Setup Modal */}
      <GameSettingsModal
        isOpen={!!setupGameMode}
        game={setupGameMode}
        room={room}
        onClose={() => setSetupGameMode(null)}
        onStart={executeStartGame}
      />
    </div>
    </TVScaleFrame>
  );
}
