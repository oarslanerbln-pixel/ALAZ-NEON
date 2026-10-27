import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { getCategoryPresets } from "../../../lib/categoryPresets";
import type { GameType, Room } from "../../../types/database";
import type { TranslationKey } from "../../../lib/i18n";
import { X, Play, Check, Clock, RotateCcw, HelpCircle, Heart, Users } from "lucide-react";
import { ShimmerButton, GameAnimatedLogo } from "../../../components/fx";

interface Props {
  isOpen: boolean;
  game: GameType | null;
  room?: Room;
  onClose: () => void;
  onStart: (game: GameType, settings: Partial<Room>) => Promise<void>;
}

interface GameMeta {
  title: string;
  badge: string;
  color: string;
  glow: string;
  icon: "flame" | "lightbulb" | "rocket" | "dashboard" | "users" | "crown" | "settings";
  description: string;
  /** Varsa açıklama bu anahtardan, host'un dilinde gösterilir. */
  descKey?: TranslationKey;
}

const GAME_METAS: Record<string, GameMeta> = {
  scattegories: {
    title: "HENGAME ARENA",
    badge: "WORT & TEMPO",
    color: "#ff5500",
    glow: "rgba(255,85,0,0.5)",
    icon: "flame",
    description: "Klassische Wort-Arena: Finde die kreativsten Begriffe mit dem vorgegebenen Buchstaben schneller als die anderen Tische."
  },
  quiz: {
    title: "HENGAME QUIZ",
    badge: "TRIVIA & KULTUR",
    color: "#00e5ff",
    glow: "rgba(0,229,255,0.5)",
    icon: "lightbulb",
    description: "Nachtleben, Musik, Film und Popkultur: 4 Antwortmöglichkeiten, rasante Runden und 2X Finale."
  },
  bomb: {
    title: "HENGAME BOMB",
    badge: "REFLEX & DRUCK",
    color: "#ff003c",
    glow: "rgba(255,0,60,0.5)",
    icon: "rocket",
    description: "Die tickende Wort-Bombe: Gib schnell ein passendes Wort ein und passe die Bombe weiter, bevor sie explodiert!"
  },
};

const QUIZ_CATEGORIES = [
  { id: "gece", label: "🍸 NIGHTLIFE & BAR", icon: "🍸" },
  { id: "muzik", label: "🎵 MUSIK & CHARTS", icon: "🎵" },
  { id: "sinema", label: "🎬 KINO & SERIEN", icon: "🎬" },
  { id: "zeka", label: "🧠 LOGIK & TRICK", icon: "🧠" },
  { id: "kultur", label: "🌍 ALLGEMEINWISSEN", icon: "🌍" },
  { id: "bilim", label: "🚀 TECH & TRENDS", icon: "🚀" }
];

export function GameSettingsModal({ isOpen, game, onClose, onStart }: Props) {
  const { t, locale } = useLocale();
  const presets = getCategoryPresets(locale);

  // Common States
  const [totalRounds, setTotalRounds] = useState("3");
  const [timerValue, setTimerValue] = useState("60");
  const [gameMode, setGameMode] = useState<"individual" | "team">("individual");
  
  // Scattegories Specific
  const [categories, setCategories] = useState(t("categories.default"));
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Quiz Specific
  const [quizQuestionsCount, setQuizQuestionsCount] = useState("8");
  const [quizTimePerQuestion, setQuizTimePerQuestion] = useState("20");
  const [quizDoubleFinal, setQuizDoubleFinal] = useState(true);
  const [selectedQuizCategories, setSelectedQuizCategories] = useState<string[]>([
    "gece", "muzik", "sinema", "zeka", "kultur", "bilim"
  ]);

  // Bomb Specific
  const [bombFuseTime, setBombFuseTime] = useState("30");
  const [bombLives, setBombLives] = useState("3");
  const [bombSpeedMultiplier] = useState(1.0);

  // Track previous game to sync defaults during render
  const [prevGame, setPrevGame] = useState<GameType | null>(null);
  if (game !== prevGame) {
    setPrevGame(game);
    if (game === "scattegories") {
      setTimerValue("60");
      setTotalRounds("3");
    } else if (game === "quiz") {
      setTotalRounds("5");
      setQuizTimePerQuestion("20");
      setQuizQuestionsCount("8");
    } else if (game === "bomb") {
      setBombFuseTime("30");
      setBombLives("3");
      setTotalRounds("3");
    }
  }

  if (!isOpen || !game) return null;

  const meta = GAME_METAS[game] || GAME_METAS.scattegories;

  const handleApplyPreset = (name: string) => {
    setCategories(presets[name].join(", "));
    setActivePreset(name);
    SoundManager.getInstance().playSFX(sounds.CLICK);
  };

  const toggleQuizCategory = (catId: string) => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setSelectedQuizCategories(prev => 
      prev.includes(catId) 
        ? (prev.length > 1 ? prev.filter(id => id !== catId) : prev) 
        : [...prev, catId]
    );
  };

  const handleStartGame = async () => {
    SoundManager.getInstance().playSFX(sounds.START);

    const baseSettings: Partial<Room> = {
      game_mode: gameMode,
      total_rounds: parseInt(totalRounds, 10),
      timer_setting: parseInt(timerValue, 10)
    };

    if (game === "scattegories") {
      const parsed = categories.split(",").map(c => c.trim()).filter(Boolean);
      baseSettings.categories = parsed.length > 0 ? parsed : ["Stadt", "Land", "Name", "Tier"];
      baseSettings.timer_setting = parseInt(timerValue, 10);
    } else if (game === "quiz") {
      baseSettings.total_rounds = parseInt(quizQuestionsCount, 10);
      baseSettings.timer_setting = parseInt(quizTimePerQuestion, 10);
      // Secim onceden yalnizca ekranda isaretli gorunuyordu; hicbir yere
      // gecmiyordu. Artik odaya yaziliyor ve soru secimi bunu uyguluyor.
      baseSettings.quiz_topics = selectedQuizCategories;
    } else if (game === "bomb") {
      baseSettings.timer_setting = parseInt(bombFuseTime, 10);
      baseSettings.bomb_speed_multiplier = bombSpeedMultiplier;
    }

    await onStart(game, baseSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 select-none">
        
        {/* Frosted Deep Black Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c0c16] border-2 border-white/20 rounded-[2.2rem] shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white z-10"
          style={{
            boxShadow: `0 0 60px ${meta.glow}`
          }}
        >
          {/* Ambient Glow */}
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-40"
            style={{ backgroundColor: meta.color }}
          />

          {/* ════════════════ MODAL HEADER (HIGH CLARITY) ════════════════ */}
          <div className="p-6 sm:p-8 pb-5 border-b border-white/15 flex items-center justify-between relative z-10 bg-black/40">
            <div className="flex items-center gap-4 min-w-0">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shrink-0 shadow-lg relative overflow-hidden backdrop-blur-md"
                style={{ 
                  backgroundColor: `${meta.color}25`,
                  borderColor: meta.color,
                  boxShadow: `0 0 25px ${meta.color}50`
                }}
              >
                {game && <GameAnimatedLogo game={game} size="md" glow={true} className="w-10 h-10 sm:w-12 sm:h-12" />}
              </div>
              <div className="min-w-0">
                <span 
                  className="text-[11px] font-mono font-black uppercase tracking-[0.22em] px-3 py-1 rounded-full border inline-block"
                  style={{ 
                    backgroundColor: `${meta.color}20`,
                    borderColor: `${meta.color}70`,
                    color: meta.color
                  }}
                >
                  {meta.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-sans mt-1 truncate">
                  {meta.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95 shrink-0 ml-3 cursor-pointer"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* ════════════════ MODAL BODY ════════════════ */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7 custom-scrollbar relative z-10 text-white">
            
            {/* Description Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.05] border border-white/15 text-gray-200 text-sm sm:text-base font-semibold leading-relaxed shadow-inner">
              {meta.descKey ? t(meta.descKey) : meta.description}
            </div>

            {/* ════════════════ SCATTEGORIES SETTINGS ════════════════ */}
            {game === "scattegories" && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-amber-400 font-black block mb-3">
                    {t("gameSettings.presets")}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.keys(presets).map((name) => (
                      <button
                        key={name}
                        onClick={() => handleApplyPreset(name)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all border cursor-pointer ${
                          activePreset === name
                            ? "bg-alaz-orange text-black border-alaz-orange shadow-[0_0_20px_rgba(255,85,0,0.6)] scale-105"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-white font-black block mb-2">
                    {t("gameSettings.categories")}
                  </label>
                  <textarea
                    rows={2}
                    value={categories}
                    onChange={(e) => {
                      setCategories(e.target.value);
                      setActivePreset(null);
                    }}
                    className="w-full bg-black/80 border-2 border-white/25 rounded-2xl p-4 text-base text-white focus:border-alaz-orange focus:outline-none resize-none font-mono font-bold shadow-inner"
                    placeholder="Stadt, Land, Name, Tier..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{t("gameSettings.roundTime")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["30", "45", "60"].map(tVal => (
                        <button
                          key={tVal}
                          onClick={() => setTimerValue(tVal)}
                          className={`py-3.5 rounded-xl font-mono font-black text-sm transition-all border-2 cursor-pointer ${
                            timerValue === tVal
                              ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {tVal} {t("gameSettings.secondsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <RotateCcw className="w-4 h-4 text-alaz-orange" />
                      <span>{t("gameSettings.totalRounds")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["3", "5", "7"].map(rVal => (
                        <button
                          key={rVal}
                          onClick={() => setTotalRounds(rVal)}
                          className={`py-3.5 rounded-xl font-mono font-black text-sm transition-all border-2 cursor-pointer ${
                            totalRounds === rVal
                              ? "bg-alaz-orange text-black border-alaz-orange shadow-[0_0_20px_rgba(255,85,0,0.5)] scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {rVal} {t("gameSettings.roundsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════ QUIZ SETTINGS ════════════════ */}
            {game === "quiz" && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-cyan-400 font-black block mb-3">
                    {t("gameSettings.quizPool")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {QUIZ_CATEGORIES.map(cat => {
                      const isSelected = selectedQuizCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleQuizCategory(cat.id)}
                          className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,229,255,0.3)] font-black" 
                              : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-bold tracking-wide">{cat.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-300 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>{t("gameSettings.quizQuestionsCount")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["5", "8", "12"].map(qVal => (
                        <button
                          key={qVal}
                          onClick={() => setQuizQuestionsCount(qVal)}
                          className={`py-3.5 rounded-xl font-mono font-black text-sm transition-all border-2 cursor-pointer ${
                            quizQuestionsCount === qVal
                              ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.5)] scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {qVal} {t("gameSettings.quizQuestionsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{t("gameSettings.quizTimePerQuestion")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["15", "20", "30"].map(tVal => (
                        <button
                          key={tVal}
                          onClick={() => setQuizTimePerQuestion(tVal)}
                          className={`py-3.5 rounded-xl font-mono font-black text-sm transition-all border-2 cursor-pointer ${
                            quizTimePerQuestion === tVal
                              ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {tVal} {t("gameSettings.secondsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2X Double Final Toggle */}
                <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.05] border border-white/15">
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                      {t("gameSettings.quizDoubleFinalTitle")}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                      {t("gameSettings.quizDoubleFinalDesc")}
                    </p>
                  </div>
                  <button
                    onClick={() => setQuizDoubleFinal(!quizDoubleFinal)}
                    className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ml-4 ${
                      quizDoubleFinal ? "bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.6)]" : "bg-white/20"
                    }`}
                  >
                    <motion.div
                      animate={{ x: quizDoubleFinal ? 24 : 0 }}
                      className="w-6 h-6 rounded-full bg-black shadow-md"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════ BOMB SETTINGS ════════════════ */}
            {game === "bomb" && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-red-400 font-black block mb-2.5">
                    {t("gameSettings.bombFuseTime")}
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {["15", "20", "30", "45"].map(fVal => (
                      <button
                        key={fVal}
                        onClick={() => setBombFuseTime(fVal)}
                        className={`py-3.5 rounded-xl font-mono font-black text-xs sm:text-sm transition-all border-2 cursor-pointer ${
                          bombFuseTime === fVal
                            ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.6)] scale-105"
                            : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {fVal} {t("gameSettings.secondsSuffix")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span>{t("gameSettings.bombLives")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["1", "2", "3"].map(lVal => (
                        <button
                          key={lVal}
                          onClick={() => setBombLives(lVal)}
                          className={`py-3.5 rounded-xl font-mono font-black text-xs sm:text-sm transition-all border-2 cursor-pointer ${
                            bombLives === lVal
                              ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {lVal} {t("gameSettings.livesSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <RotateCcw className="w-4 h-4 text-red-400" />
                      <span>{t("gameSettings.totalRounds")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["3", "5", "7"].map(rVal => (
                        <button
                          key={rVal}
                          onClick={() => setTotalRounds(rVal)}
                          className={`py-3.5 rounded-xl font-mono font-black text-xs sm:text-sm transition-all border-2 cursor-pointer ${
                            totalRounds === rVal
                              ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)] scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {rVal} {t("gameSettings.roundsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Common Game Mode (Solo vs Team) */}
            {["scattegories", "quiz"].includes(game) && (
              <div>
                <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-3">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{t("gameSettings.gameMode")}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    onClick={() => setGameMode("individual")}
                    className={`py-4 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2.5 cursor-pointer ${
                      gameMode === "individual"
                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-102"
                        : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    <span>{t("gameSettings.individual")}</span>
                  </button>
                  <button
                    onClick={() => setGameMode("team")}
                    className={`py-4 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2.5 cursor-pointer ${
                      gameMode === "team"
                        ? "bg-alaz-orange text-black border-alaz-orange shadow-[0_0_25px_rgba(255,85,0,0.5)] scale-102"
                        : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    <span>{t("gameSettings.team")}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ════════════════ FOOTER ACTION BUTTONS ════════════════ */}
          <div className="p-6 sm:p-8 pt-5 border-t border-white/15 flex gap-4 bg-black/60 relative z-10">
            <button
              onClick={onClose}
              className="flex-1 py-4 sm:py-4.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 transition-all active:scale-95 cursor-pointer"
            >
              {t("gameSettings.cancel")}
            </button>
            <ShimmerButton
              color={meta.color === "#ff5500" ? "orange" : meta.color === "#00e5ff" ? "blue" : meta.color === "#ff003c" ? "pink" : "purple"}
              onClick={handleStartGame}
              className="flex-[2] rounded-2xl"
              innerClassName="!bg-white !text-black font-black text-sm sm:text-base uppercase tracking-widest py-4 sm:py-4.5 px-8 flex items-center justify-center gap-3 shadow-2xl"
            >
              <Play className="w-5 h-5 fill-black text-black" />
              <span>{t("gameSettings.startSession")}</span>
            </ShimmerButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
