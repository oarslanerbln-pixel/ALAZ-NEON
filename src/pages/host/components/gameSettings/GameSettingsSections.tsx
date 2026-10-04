import { motion } from "framer-motion";
import { Check, Clock, HelpCircle, RotateCcw, Users } from "lucide-react";

import { useLocale } from "../../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../../lib/audio";
import { getCategoryPresets } from "../../../../lib/categoryPresets";
import { toggleQuizTopic } from "../../../../lib/gameSettings";
import { QUIZ_CATEGORIES } from "./gameMetas";
import { OptionGrid } from "./OptionGrid";
import { suffixed, WHITE_ACTIVE, type SectionProps } from "./sectionShared";
/** Kelime ve bilgi oyunlarının ayar bölümleri + ortak oyun modu seçimi. */
export function ScattegoriesSettings({ form, set }: SectionProps) {
  const { t, locale } = useLocale();
  const presets = getCategoryPresets(locale);

  const applyPreset = (name: string) => {
    set("categories", presets[name].join(", "));
    set("activePreset", name);
    SoundManager.getInstance().playSFX(sounds.CLICK);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-amber-400 font-black block mb-3">
          {t("gameSettings.presets")}
        </label>
        <div className="flex flex-wrap gap-2.5">
          {Object.keys(presets).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={form.activePreset === name}
              onClick={() => applyPreset(name)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all border cursor-pointer ${
                form.activePreset === name
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
          value={form.categories}
          aria-label={t("gameSettings.categories")}
          onChange={(e) => {
            set("categories", e.target.value);
            set("activePreset", null);
          }}
          className="w-full bg-black/80 border-2 border-white/25 rounded-2xl p-4 text-base text-white focus:border-alaz-orange focus:outline-none resize-none font-mono font-bold shadow-inner"
          placeholder="Stadt, Land, Name, Tier..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <OptionGrid
          label={t("gameSettings.roundTime")}
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          options={suffixed(["30", "45", "60"], t("gameSettings.secondsSuffix"))}
          value={form.timerValue}
          onChange={(v) => set("timerValue", v)}
          activeClassName={WHITE_ACTIVE}
          columns={3}
        />
        <OptionGrid
          label={t("gameSettings.totalRounds")}
          icon={<RotateCcw className="w-4 h-4 text-alaz-orange" />}
          options={suffixed(["3", "5", "7"], t("gameSettings.roundsSuffix"))}
          value={form.totalRounds}
          onChange={(v) => set("totalRounds", v)}
          activeClassName="bg-alaz-orange text-black border-alaz-orange shadow-[0_0_20px_rgba(255,85,0,0.5)]"
          columns={3}
        />
      </div>
    </div>
  );
}

export function QuizSettings({ form, set }: SectionProps) {
  const { t } = useLocale();

  const toggleTopic = (id: string) => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    set("quizTopics", toggleQuizTopic(form.quizTopics, id));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-cyan-400 font-black block mb-3">
          {t("gameSettings.quizPool")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUIZ_CATEGORIES.map((cat) => {
            const isSelected = form.quizTopics.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleTopic(cat.id)}
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
        <OptionGrid
          label={t("gameSettings.quizQuestionsCount")}
          icon={<HelpCircle className="w-4 h-4 text-cyan-400" />}
          options={suffixed(["5", "8", "12"], t("gameSettings.quizQuestionsSuffix"))}
          value={form.quizQuestionsCount}
          onChange={(v) => set("quizQuestionsCount", v)}
          activeClassName="bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.5)]"
          columns={3}
        />
        <OptionGrid
          label={t("gameSettings.quizTimePerQuestion")}
          icon={<Clock className="w-4 h-4 text-cyan-400" />}
          options={suffixed(["15", "20", "30"], t("gameSettings.secondsSuffix"))}
          value={form.quizTimePerQuestion}
          onChange={(v) => set("quizTimePerQuestion", v)}
          activeClassName={WHITE_ACTIVE}
          columns={3}
        />
      </div>

      {/* 2X Double Final Toggle */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.05] border border-white/15">
        <div>
          <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
            {t("gameSettings.quizDoubleFinalTitle")}
          </h4>
          <p className="text-xs sm:text-sm text-gray-300 mt-0.5">{t("gameSettings.quizDoubleFinalDesc")}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.quizDoubleFinal}
          aria-label={t("gameSettings.quizDoubleFinalTitle")}
          onClick={() => set("quizDoubleFinal", !form.quizDoubleFinal)}
          className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ml-4 ${
            form.quizDoubleFinal ? "bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.6)]" : "bg-white/20"
          }`}
        >
          <motion.div animate={{ x: form.quizDoubleFinal ? 24 : 0 }} className="w-6 h-6 rounded-full bg-black shadow-md" />
        </button>
      </div>
    </div>
  );
}

export function AynaSettings({ form, set }: SectionProps) {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <OptionGrid
        label={t("gameSettings.quizQuestionsCount")}
        icon={<HelpCircle className="w-4 h-4 text-cyan-400" />}
        options={suffixed(["5", "7", "10"], t("gameSettings.quizQuestionsSuffix"))}
        value={form.totalRounds}
        onChange={(v) => set("totalRounds", v)}
        activeClassName="bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
        columns={3}
      />
      <OptionGrid
        label={t("gameSettings.quizTimePerQuestion")}
        icon={<Clock className="w-4 h-4 text-cyan-400" />}
        options={suffixed(["20", "25", "35"], t("gameSettings.secondsSuffix"))}
        value={form.timerValue}
        onChange={(v) => set("timerValue", v)}
        activeClassName={WHITE_ACTIVE}
        columns={3}
      />
    </div>
  );
}

const GAME_MODES = [
  {
    value: "individual" as const,
    labelKey: "gameSettings.individual" as const,
    active: "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-102",
  },
  {
    value: "team" as const,
    labelKey: "gameSettings.team" as const,
    active: "bg-alaz-orange text-black border-alaz-orange shadow-[0_0_25px_rgba(255,85,0,0.5)] scale-102",
  },
];

/** Bireysel / takım seçimi (klasik oyun ve quiz). */
export function GameModeSettings({ form, set }: SectionProps) {
  const { t } = useLocale();
  return (
    <div>
      <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black flex items-center gap-1.5 mb-3">
        <Users className="w-4 h-4 text-amber-400" />
        <span>{t("gameSettings.gameMode")}</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {GAME_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            aria-pressed={form.gameMode === mode.value}
            onClick={() => set("gameMode", mode.value)}
            className={`py-4 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2.5 cursor-pointer ${
              form.gameMode === mode.value
                ? mode.active
                : "bg-white/5 border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
            }`}
          >
            <span>{t(mode.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
