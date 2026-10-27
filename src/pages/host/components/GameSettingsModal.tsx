import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { getCategoryPresets } from "../../../lib/categoryPresets";
import { GAME_CARDS, GAME_CATEGORY_KEY, gameTitle } from "../../../lib/gameCatalog";
import type { GameType, Room } from "../../../types/database";
import { X, Play, Check, Clock, RotateCcw, HelpCircle } from "lucide-react";
import { GameAnimatedLogo } from "../../../components/fx";

interface Props {
  isOpen: boolean;
  game: GameType | null;
  room?: Room;
  onClose: () => void;
  onStart: (game: GameType, settings: Partial<Room>) => Promise<void>;
}

const QUIZ_CATEGORIES = [
  { id: "gece", label: "🍸 NIGHTLIFE & BAR", icon: "🍸" },
  { id: "muzik", label: "🎵 MUSIK & CHARTS", icon: "🎵" },
  { id: "sinema", label: "🎬 KINO & SERIEN", icon: "🎬" },
  { id: "zeka", label: "🧠 LOGIK & TRICK", icon: "🧠" },
  { id: "kultur", label: "🌍 ALLGEMEINWISSEN", icon: "🌍" },
  { id: "bilim", label: "🚀 TECH & TRENDS", icon: "🚀" }
];

/**
 * Oyun kurulum penceresi. Yalnızca gerçekten uygulanan ayarlar burada:
 * Arena kategori/süre/tur, Quiz konu/soru sayısı/süre. Bomba ve Yörünge
 * Sapanı'nın ayarı yok; pencere yalnızca açıklama ve "SPIEL STARTEN" gösterir
 * (her oyun aynı onay adımından başlar, TV'de yanlışlıkla dokunma oyunu açmaz).
 *
 * Kaldırılanlar ve sebebi: takım/bireysel seçimi (puanlama, ödül ve gecelik
 * lig bireysel; oda hep `individual`), quiz "2X final" anahtarı (son soru zaten
 * her zaman çift puan), bomba fitil/can/tur/hız seçimleri (hiçbiri oyuna
 * uygulanmıyordu).
 */
export function GameSettingsModal({ isOpen, game, onClose, onStart }: Props) {
  const { t, locale } = useLocale();
  const presets = getCategoryPresets(locale);

  // Arena
  const [totalRounds, setTotalRounds] = useState("3");
  const [timerValue, setTimerValue] = useState("60");
  const [categories, setCategories] = useState(t("categories.default"));
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Quiz
  const [quizQuestionsCount, setQuizQuestionsCount] = useState("8");
  const [quizTimePerQuestion, setQuizTimePerQuestion] = useState("20");
  const [selectedQuizCategories, setSelectedQuizCategories] = useState<string[]>([
    "gece", "muzik", "sinema", "zeka", "kultur", "bilim"
  ]);

  // Track previous game to sync defaults during render
  const [prevGame, setPrevGame] = useState<GameType | null>(null);
  if (game !== prevGame) {
    setPrevGame(game);
    if (game === "scattegories") {
      setTimerValue("60");
      setTotalRounds("3");
    } else if (game === "quiz") {
      setQuizTimePerQuestion("20");
      setQuizQuestionsCount("8");
    }
  }

  if (!isOpen || !game) return null;

  const card = GAME_CARDS.find((c) => c.id === game);
  const meta = {
    title: gameTitle(game),
    badge: card ? t(GAME_CATEGORY_KEY[card.category]) : "",
    description: card ? t(card.descKey) : "",
  };

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

    // Oda hep bireysel; eski bir sürümün takım moduna aldığı oda da düzelir.
    const settings: Partial<Room> = { game_mode: "individual" };

    if (game === "scattegories") {
      const parsed = categories.split(",").map(c => c.trim()).filter(Boolean);
      settings.categories = parsed.length > 0 ? parsed : ["Stadt", "Land", "Name", "Tier"];
      settings.total_rounds = parseInt(totalRounds, 10);
      settings.timer_setting = parseInt(timerValue, 10);
    } else if (game === "quiz") {
      settings.total_rounds = parseInt(quizQuestionsCount, 10);
      settings.timer_setting = parseInt(quizTimePerQuestion, 10);
      // Secim onceden yalnizca ekranda isaretli gorunuyordu; hicbir yere
      // gecmiyordu. Artik odaya yaziliyor ve soru secimi bunu uyguluyor.
      settings.quiz_topics = selectedQuizCategories;
    }

    await onStart(game, settings);
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
          className="absolute inset-0 bg-black/85"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="surface relative w-full max-w-2xl max-h-[90vh] rounded-[2.2rem] flex flex-col overflow-hidden text-white z-10"
        >
          {/* ════════════════ MODAL HEADER ════════════════ */}
          <div className="p-6 sm:p-8 pb-5 border-b border-white/15 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border border-accent bg-accent/10 shrink-0 relative overflow-hidden">
                {game && <GameAnimatedLogo game={game} size="md" className="w-10 h-10 sm:w-12 sm:h-12" />}
              </div>
              <div className="min-w-0">
                <span className="text-xs tabular-nums font-black uppercase tracking-[0.22em] px-3 py-1 rounded-full border border-accent/50 bg-accent/10 text-accent inline-block"
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
              {meta.description}
            </div>

            {/* ════════════════ SCATTEGORIES SETTINGS ════════════════ */}
            {game === "scattegories" && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs sm:text-sm tabular-nums uppercase tracking-[0.2em] text-amber-400 font-black block mb-3">
                    {t("gameSettings.presets")}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.keys(presets).map((name) => (
                      <button
                        key={name}
                        onClick={() => handleApplyPreset(name)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all border cursor-pointer ${
                          activePreset === name
                            ? "bg-alaz-orange text-black border-alaz-orange  scale-105"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm tabular-nums uppercase tracking-[0.2em] text-white font-black block mb-2">
                    {t("gameSettings.categories")}
                  </label>
                  <textarea
                    rows={2}
                    value={categories}
                    onChange={(e) => {
                      setCategories(e.target.value);
                      setActivePreset(null);
                    }}
                    className="w-full bg-black/80 border-2 border-white/25 rounded-2xl p-4 text-base text-white focus:border-alaz-orange focus:outline-none resize-none tabular-nums font-bold shadow-inner"
                    placeholder="Stadt, Land, Name, Tier..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs sm:text-sm tabular-nums uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{t("gameSettings.roundTime")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["30", "45", "60"].map(tVal => (
                        <button
                          key={tVal}
                          onClick={() => setTimerValue(tVal)}
                          className={`py-3.5 rounded-xl tabular-nums font-black text-sm transition-all border-2 cursor-pointer ${
                            timerValue === tVal
                              ? "bg-white text-black border-white  scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {tVal} {t("gameSettings.secondsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm tabular-nums uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <RotateCcw className="w-4 h-4 text-alaz-orange" />
                      <span>{t("gameSettings.totalRounds")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["3", "5", "7"].map(rVal => (
                        <button
                          key={rVal}
                          onClick={() => setTotalRounds(rVal)}
                          className={`py-3.5 rounded-xl tabular-nums font-black text-sm transition-all border-2 cursor-pointer ${
                            totalRounds === rVal
                              ? "bg-alaz-orange text-black border-alaz-orange  scale-105"
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
                  <label className="text-xs sm:text-sm tabular-nums uppercase tracking-[0.2em] text-cyan-400 font-black block mb-3">
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
                              ? "bg-cyan-500/25 border-cyan-400 text-white  font-black" 
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
                    <label className="text-xs sm:text-sm tabular-nums uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>{t("gameSettings.quizQuestionsCount")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["5", "8", "12"].map(qVal => (
                        <button
                          key={qVal}
                          onClick={() => setQuizQuestionsCount(qVal)}
                          className={`py-3.5 rounded-xl tabular-nums font-black text-sm transition-all border-2 cursor-pointer ${
                            quizQuestionsCount === qVal
                              ? "bg-cyan-400 text-black border-cyan-400  scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {qVal} {t("gameSettings.quizQuestionsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm tabular-nums uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-2.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{t("gameSettings.quizTimePerQuestion")}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["15", "20", "30"].map(tVal => (
                        <button
                          key={tVal}
                          onClick={() => setQuizTimePerQuestion(tVal)}
                          className={`py-3.5 rounded-xl tabular-nums font-black text-sm transition-all border-2 cursor-pointer ${
                            quizTimePerQuestion === tVal
                              ? "bg-white text-black border-white  scale-105"
                              : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {tVal} {t("gameSettings.secondsSuffix")}
                        </button>
                      ))}
                    </div>
                  </div>
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
            <button
              type="button"
              onClick={handleStartGame}
              className="btn-primary flex-[2] rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest py-4 sm:py-4.5 px-8 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t("gameSettings.startSession")}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
