import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, ensureAnonymousAuth } from "../../lib/firebase";
import { motion } from "framer-motion";
import { NeonIcon } from "../../components/NeonIcon";
import { KineticSpark } from "../../components/KineticSpark";
import { ParticleBackground } from "../../components/ParticleBackground";
import { getCategoryPresets } from "../../lib/categoryPresets";
import { useLocale } from "../../hooks/useLocale";
import { useToast } from "../../contexts/ToastContextCore";

// Premium Glass Panel with Looping Neon Animation
function GlassPanel({ 
  children, 
  className = "", 
  neonColor = "rgba(255,215,0,0.8)",
  delay = "0s"
}: { 
  children: React.ReactNode; 
  className?: string;
  neonColor?: string;
  delay?: string;
}) {
  return (
    <div 
      className={`relative overflow-hidden rounded-none border-[0.5px] border-white/20 group shadow-[0_10px_30px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,var(--neon-color)_50%,transparent_65%)] bg-[length:300%_300%] animate-shine opacity-20" 
          style={{ '--neon-color': neonColor, animationDelay: delay } as React.CSSProperties}
        />
        <div 
          className="absolute inset-[1px] bg-black/80 backdrop-blur-2xl rounded-none z-10 transition-colors duration-500 group-hover:bg-black/90" 
        />
      </div>
      <div className="relative z-20 h-full">
        {children}
      </div>
    </div>
  );
}

// Helper to generate a 4-character random code
const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function HostSetup() {
  const navigate = useNavigate();
  const { t, locale, switchLocale } = useLocale();
  const { showToast } = useToast();
  const [categories, setCategories] = useState(t("categories.default"));
  const [timerValue, setTimerValue] = useState("60");
  const [gameMode, setGameMode] = useState<"individual" | "team">("individual");
  const [totalRounds, setTotalRounds] = useState("3");
  const [isCreating, setIsCreating] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const location = useLocation();
  const gameType = location.state?.gameType || "scattegories";

  // ALAZ QUIZ draws from a fixed 9-question-per-language bank; offering more
  // rounds than that guarantees an exact repeat within the same session.
  const roundOptions = gameType === "quiz" ? ["3", "5", "7", "9"] : ["3", "5", "7", "10"];

  const presets = getCategoryPresets(locale);

  const applyPreset = (name: string) => {
    setCategories(presets[name].join(", "));
    setActivePreset(name);
  };

  const startLobby = async () => {
    setIsCreating(true);
    localStorage.setItem("cafe_game_timer", timerValue);
    localStorage.setItem("cafe_game_categories", categories);
    localStorage.setItem("cafe_game_mode", gameMode);

    try {
      const parsedCategories = gameType === "quiz" 
        ? [] 
        : categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
            
      if (gameType === "scattegories" && parsedCategories.length === 0) {
        showToast(
          t("setup.errorNoCategory"),
          "warning",
        );
        setIsCreating(false);
        return;
      }

      const hostUser = await ensureAnonymousAuth();
      const roomCode = generateRoomCode();

      try {
        const docRef = await addDoc(collection(db, "rooms"), {
          code: roomCode,
          status: "lobby",
          categories: parsedCategories,
          timer_setting: parseInt(timerValue, 10),
          total_rounds: parseInt(totalRounds, 10),
          current_round: 0,
          time_left: 0,
          game_mode: gameMode,
          game_type: gameType,
          locale: locale,
          host_uid: hostUser.uid,
          created_at: Date.now()
        });
        
        navigate(`/host/display?roomId=${docRef.id}`);
      } catch (err) {
        console.error("Error creating room:", err);
        const message = err instanceof Error ? err.message : String(err);
        showToast(t("setup.errorCreate") + message, "error");
        setIsCreating(false);
        return;
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      showToast(
        t("setup.errorFirebase"),
        "error",
      );
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-black">
      {/* Deep Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,77,0,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(0,243,255,0.1),transparent_50%)] pointer-events-none" />
      <ParticleBackground speedMultiplier={0.3} />

      <div className="p-10 max-w-5xl mx-auto w-full relative z-10">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative"
        >
          <header className="mb-12 pointer-events-none opacity-90 scale-[0.6] origin-left">
            <div className="absolute top-10 w-full h-[120px] opacity-20 pointer-events-none">
              <KineticSpark
                className="scale-50"
                delay={-1}
              />
            </div>
          </header>

          <button
            onClick={() => navigate("/")}
            className="mb-8 flex items-center gap-2 text-alaz-orange/70 hover:text-alaz-orange transition-colors text-xs font-bold uppercase tracking-widest relative z-20"
          >
            <span className="text-xl">←</span> {t("common.back", "ANA SAYFA")}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(220px,auto)]">
            {/* Main Settings Panel */}
            <GlassPanel className="md:col-span-2 md:row-span-2" neonColor="rgba(255,215,0,0.8)">
              <div className="p-10 flex flex-col h-full relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-alaz-orange/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <h2 className="text-3xl font-sans font-black text-white tracking-tighter uppercase">
                    {gameType === "quiz" ? "ALAZ QUIZ AYARLARI" : t("setup.title")}
                  </h2>
                  <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">{t("setup.subtitle")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1 relative z-10">
                <div className="space-y-6">
                  {/* Timer */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.timerLabel")}
                    </label>
                    <select
                      aria-label={t("setup.timerAriaLabel")}
                      value={timerValue}
                      onChange={(e) => setTimerValue(e.target.value)}
                      className="w-full bg-black/60 border-[0.5px] border-white/20 p-5 text-white focus:border-alaz-orange focus:outline-none transition-all font-sans font-black text-[14px] uppercase tracking-[0.1em] rounded-none shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                    >
                      <option
                        className="bg-[#0a0a0f] text-white py-2"
                        value="30"
                      >
                        {t("setup.timer30")}
                      </option>
                      <option
                        className="bg-[#0a0a0f] text-white py-2"
                        value="45"
                      >
                        {t("setup.timer45")}
                      </option>
                      <option
                        className="bg-[#0a0a0f] text-white py-2"
                        value="60"
                      >
                        {t("setup.timer60")}
                      </option>
                      <option
                        className="bg-[#0a0a0f] text-white py-2"
                        value="90"
                      >
                        {t("setup.timer90")}
                      </option>
                    </select>
                  </div>

                  {/* Total Rounds */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.roundsLabel")}
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                      {roundOptions.map((r) => (
                        <button
                          key={r}
                          onClick={() => setTotalRounds(r)}
                          className={`py-4 font-sans font-black text-lg transition-all border-[0.5px] rounded-none ${
                            totalRounds === r
                              ? "bg-alaz-orange text-black border-alaz-orange"
                              : "bg-black/60 border-white/20 text-gray-400 hover:border-alaz-orange/40 hover:text-white"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2 italic">
                      {t(
                        "setup.roundsCalc",
                        totalRounds,
                        timerValue,
                        parseInt(totalRounds) * parseInt(timerValue),
                      )}
                    </p>
                  </div>

                  {/* Game Mode */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.gameModeLabel")}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setGameMode("individual")}
                        className={`py-4 font-sans font-black text-xs uppercase tracking-widest transition-all border-[0.5px] flex items-center justify-center rounded-none ${
                          gameMode === "individual"
                            ? "bg-white text-black border-white"
                            : "bg-black/60 border-white/20 text-gray-400 hover:border-white/40"
                        }`}
                      >
                        {t("setup.individual")}
                      </button>
                      <button
                        onClick={() => setGameMode("team")}
                        className={`py-4 font-sans font-black text-xs uppercase tracking-widest transition-all border-[0.5px] flex items-center justify-center rounded-none ${
                          gameMode === "team"
                            ? "bg-alaz-orange text-black border-alaz-orange"
                            : "bg-black/60 border-white/20 text-gray-400 hover:border-alaz-orange/40"
                        }`}
                      >
                        {t("setup.team")}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2 italic">
                      {gameMode === "individual"
                        ? t("setup.individualDesc")
                        : t("setup.teamDesc")}
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.languageLabel")}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          switchLocale("tr");
                          setCategories(t("categories.default"));
                        }}
                        className={`py-4 font-sans font-black text-xs uppercase tracking-widest transition-all border-[0.5px] flex items-center justify-center rounded-none ${
                          locale === "tr"
                            ? "bg-white/20 text-white border-white/40"
                            : "bg-black/60 border-white/20 text-gray-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        TÜRKÇE
                      </button>
                      <button
                        onClick={() => {
                          switchLocale("de");
                          setCategories(t("categories.default"));
                        }}
                        className={`py-4 font-sans font-black text-xs uppercase tracking-widest transition-all border-[0.5px] flex items-center justify-center rounded-none ${
                          locale === "de"
                            ? "bg-white/20 text-white border-white/40"
                            : "bg-black/60 border-white/20 text-gray-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        DEUTSCH
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categories Column */}
                {gameType === "quiz" ? (
                  <div className="flex flex-col gap-4 bg-blue-500/10 border border-blue-500/20 p-8 justify-center items-center text-center">
                    <NeonIcon type="rocket" color="blue" className="w-16 h-16 mb-4 opacity-50" />
                    <h3 className="text-xl font-black text-blue-400 uppercase tracking-widest mb-2">OTOMATİK SORU HAVUZU</h3>
                    <p className="text-gray-400 text-sm font-medium">
                      ALAZ QUIZ modunda kategorilere ihtiyacınız yoktur. Sorular yapay zeka tarafından seçilen global soru havuzundan Türkçe veya Almanca (dil seçiminize göre) otomatik olarak çekilecektir.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Preset Buttons */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                        {t("setup.presetLabel")}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {Object.keys(presets).map((name) => (
                          <button
                            key={name}
                            onClick={() => applyPreset(name)}
                            className={`px-5 py-3 font-sans font-black text-[11px] uppercase tracking-widest transition-all border-[0.5px] rounded-none shadow-md ${
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

                    {/* Categories textarea */}
                    <div className="flex flex-col flex-1">
                      <label className="block text-[11px] uppercase tracking-[0.3em] font-black text-alaz-orange mb-3 animate-pulse drop-shadow-[0_0_10px_rgba(255,77,0,0.8)]">
                        {t("setup.categoriesLabel")}
                      </label>
                      <textarea
                        rows={5}
                        value={categories}
                        onChange={(e) => {
                          setCategories(e.target.value);
                          setActivePreset(null);
                        }}
                        className="w-full bg-black/60 border-[0.5px] border-white/20 p-5 text-white focus:border-alaz-orange focus:outline-none flex-1 resize-none font-black leading-relaxed rounded-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                        placeholder={t("setup.categoriesPlaceholder")}
                      />
                      <p className="text-[10px] text-gray-500 mt-2 italic opacity-60">
                        {t("setup.categoriesHint")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={startLobby}
                disabled={isCreating}
                className={`w-full py-6 mt-10 font-sans font-black text-xl uppercase tracking-[0.2em] transition-all duration-500 relative z-50 cursor-pointer rounded-none border-[0.5px] border-white/20 shadow-[0_0_30px_rgba(255,77,0,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] ${
                  isCreating
                    ? "bg-black/80 text-gray-500 cursor-not-allowed"
                    : "bg-alaz-orange text-black hover:bg-white hover:text-black"
                }`}
              >
                {isCreating
                  ? t("setup.starting")
                  : t("setup.startButton", totalRounds)}
              </motion.button>
              </div>
            </GlassPanel>

            {/* Status Bento */}
            <GlassPanel neonColor="rgba(255,0,60,0.8)" delay="-1s">
              <div className="p-8 flex flex-col justify-center h-full relative">
                <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <NeonIcon type="crown" color="pink" className="w-24 h-24" />
                </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="text-[#ff003c] text-[10px] font-semibold tracking-widest uppercase">
                  {t("setup.statusTitle")}
                </span>
              </div>
              <h3 className="text-2xl font-sans font-semibold mb-3 text-white tracking-tight uppercase">
                {t("setup.statusWaiting")}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-medium">
                {t("setup.statusDesc")}
              </p>
              </div>
            </GlassPanel>

            {/* Scoring Info Bento */}
            <GlassPanel neonColor="rgba(0,243,255,0.8)" delay="-2s">
              <div className="p-8 flex flex-col h-full relative">
              <h3 className="text-lg font-sans font-semibold mb-5 text-white uppercase tracking-tight relative z-10">
                {t("setup.scoringTitle")}
              </h3>
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">
                    {t("setup.scoreUnique")}
                  </span>
                  <span className="text-neon-blue font-black">+20</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">
                    {t("setup.scoreShared")}
                  </span>
                  <span className="text-white font-black">+10</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">{t("setup.scoreEarly")}</span>
                  <span className="text-neon-blue font-black">+15</span>
                </div>
              </div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-blue/5 blur-3xl rounded-full" />
              </div>
            </GlassPanel>

            {/* History Bento */}
            <GlassPanel className="md:col-span-1" neonColor="rgba(255,0,60,0.8)" delay="-3s">
              <div className="p-6 flex items-center justify-between h-full opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-5">
                <div>
                  <h3 className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    {t("setup.historyTitle")}
                  </h3>
                  <p className="text-[10px] text-gray-600">
                    {t("setup.historyEmpty")}
                  </p>
                </div>
              </div>
              </div>
            </GlassPanel>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
