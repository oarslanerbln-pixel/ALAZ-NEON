import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion } from "framer-motion";
import { NeonIcon } from "../../components/NeonIcon";
import { KineticSpark } from "../../components/KineticSpark";
import { ParticleBackground } from "../../components/ParticleBackground";
import { CATEGORY_PRESETS } from "../../lib/categoryPresets";
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
      className={`relative overflow-hidden rounded-3xl border border-white/10 group shadow-2xl ${className}`}
    >
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,var(--neon-color)_50%,transparent_65%)] bg-[length:300%_300%] animate-shine opacity-20" 
          style={{ '--neon-color': neonColor, animationDelay: delay } as React.CSSProperties}
        />
        <div 
          className="absolute inset-[1px] bg-[#0a0a0f]/70 backdrop-blur-2xl rounded-3xl z-10 transition-colors duration-500 group-hover:bg-[#15151f]/70" 
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

  const applyPreset = (name: string) => {
    setCategories(CATEGORY_PRESETS[name].join(", "));
    setActivePreset(name);
  };

  const startLobby = async () => {
    setIsCreating(true);
    localStorage.setItem("cafe_game_timer", timerValue);
    localStorage.setItem("cafe_game_categories", categories);
    localStorage.setItem("cafe_game_mode", gameMode);

    try {
      const parsedCategories = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (parsedCategories.length === 0) {
        showToast(
          t("setup.errorNoCategory"),
          "warning",
        );
        setIsCreating(false);
        return;
      }
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
          locale: locale,
          created_at: Date.now()
        });
        
        navigate(`/host/display?roomId=${docRef.id}`);
      } catch (err: any) {
        console.error("Error creating room:", err);
        showToast(t("setup.errorCreate") + err.message, "error");
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
                  <h2 className="text-3xl font-sans font-semibold text-white tracking-tight uppercase">
                    {t("setup.title")}
                  </h2>
                  <p className="text-gray-400 font-medium text-sm mt-1">{t("setup.subtitle")}</p>
                </div>
                <div className="bg-alaz-orange/10 text-alaz-orange px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-widest border border-alaz-orange/30 uppercase">
                  {t("setup.premiumMode")}
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
                      className="w-full bg-white/5 border border-white/10 p-5 text-white focus:border-alaz-orange focus:outline-none transition-all font-sans font-medium text-[14px] uppercase tracking-[0.1em] rounded-2xl"
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
                      {["3", "5", "7", "10"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setTotalRounds(r)}
                          className={`py-4 font-sans font-medium text-lg transition-all border rounded-2xl ${
                            totalRounds === r
                              ? "bg-alaz-orange text-black border-alaz-orange"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-alaz-orange/40 hover:text-white"
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
                        className={`py-4 font-sans font-medium text-xs uppercase tracking-widest transition-all border flex items-center justify-center rounded-2xl ${
                          gameMode === "individual"
                            ? "bg-white text-black border-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/40"
                        }`}
                      >
                        {t("setup.individual")}
                      </button>
                      <button
                        onClick={() => setGameMode("team")}
                        className={`py-4 font-sans font-medium text-xs uppercase tracking-widest transition-all border flex items-center justify-center rounded-2xl ${
                          gameMode === "team"
                            ? "bg-alaz-orange text-black border-alaz-orange"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-alaz-orange/40"
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
                        className={`py-4 font-sans font-medium text-xs uppercase tracking-widest transition-all border flex items-center justify-center rounded-2xl ${
                          locale === "tr"
                            ? "bg-white/20 text-white border-white/40"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        TÜRKÇE
                      </button>
                      <button
                        onClick={() => {
                          switchLocale("de");
                          setCategories(t("categories.default"));
                        }}
                        className={`py-4 font-sans font-medium text-xs uppercase tracking-widest transition-all border flex items-center justify-center rounded-2xl ${
                          locale === "de"
                            ? "bg-white/20 text-white border-white/40"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        DEUTSCH
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categories Column */}
                <div className="flex flex-col gap-4">
                  {/* Preset Buttons */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.presetLabel")}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(CATEGORY_PRESETS).map((name) => (
                        <button
                          key={name}
                          onClick={() => applyPreset(name)}
                          className={`px-5 py-2.5 font-sans font-medium text-[11px] uppercase tracking-widest transition-all border rounded-xl ${
                            activePreset === name
                              ? "bg-white border-white text-black"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories textarea */}
                  <div className="flex flex-col flex-1">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.categoriesLabel")}
                    </label>
                    <textarea
                      rows={5}
                      value={categories}
                      onChange={(e) => {
                        setCategories(e.target.value);
                        setActivePreset(null);
                      }}
                      className="w-full bg-white/5 border border-white/10 p-5 text-white focus:border-alaz-orange focus:outline-none flex-1 resize-none font-medium leading-relaxed rounded-2xl"
                      placeholder={t("setup.categoriesPlaceholder")}
                    />
                    <p className="text-[10px] text-gray-500 mt-2 italic opacity-60">
                      {t("setup.categoriesHint")}
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={startLobby}
                disabled={isCreating}
                className={`w-full py-6 mt-10 font-sans font-semibold text-lg uppercase tracking-widest transition-all duration-500 relative z-50 cursor-pointer rounded-2xl ${
                  isCreating
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-alaz-orange hover:text-white"
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
