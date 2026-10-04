import { Eye, Heart, RotateCcw } from "lucide-react";

import { useLocale } from "../../../../hooks/useLocale";
import { OptionGrid } from "./OptionGrid";
import { suffixed, WHITE_ACTIVE, type SectionProps } from "./sectionShared";

/** Parti oyunlarının ayar bölümleri (bomba, sensör, bar, neon savaşları). */
export function BombSettings({ form, set }: SectionProps) {
  const { t } = useLocale();
  const small = "text-xs sm:text-sm";
  return (
    <div className="space-y-6">
      <OptionGrid
        label={t("gameSettings.bombFuseTime")}
        labelClassName="text-red-400"
        options={suffixed(["15", "20", "30", "45"], t("gameSettings.secondsSuffix"))}
        value={form.bombFuseTime}
        onChange={(v) => set("bombFuseTime", v)}
        activeClassName="bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.6)]"
        columns={4}
        textClassName={small}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <OptionGrid
          label={t("gameSettings.bombLives")}
          icon={<Heart className="w-4 h-4 text-red-400" />}
          options={suffixed(["1", "2", "3"], t("gameSettings.livesSuffix"))}
          value={form.bombLives}
          onChange={(v) => set("bombLives", v)}
          activeClassName={WHITE_ACTIVE}
          columns={3}
          textClassName={small}
        />
        <OptionGrid
          label={t("gameSettings.totalRounds")}
          icon={<RotateCcw className="w-4 h-4 text-red-400" />}
          options={suffixed(["3", "5", "7"], t("gameSettings.roundsSuffix"))}
          value={form.totalRounds}
          onChange={(v) => set("totalRounds", v)}
          activeClassName="bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)]"
          columns={3}
          textClassName={small}
        />
      </div>
    </div>
  );
}

export function SensorSettings({ form, set }: SectionProps) {
  const { t } = useLocale();
  const pink = "bg-pink-500 text-white border-pink-500 shadow-[0_0_20px_rgba(255,0,128,0.5)]";
  return (
    <div className="space-y-6">
      <OptionGrid
        label={t("gameSettings.sensorUnblur")}
        labelClassName="text-pink-400"
        icon={<Eye className="w-4 h-4 text-pink-400" />}
        options={suffixed(["15", "25", "35"], t("gameSettings.secondsSuffix"))}
        value={form.sensorUnblurDuration}
        onChange={(v) => set("sensorUnblurDuration", v)}
        activeClassName={pink}
        columns={3}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <OptionGrid
          label={t("gameSettings.sensorImagesCount")}
          options={suffixed(["3", "5", "7"], t("gameSettings.imagesSuffix"))}
          value={form.totalRounds}
          onChange={(v) => set("totalRounds", v)}
          activeClassName={pink}
          columns={3}
        />
        <div>
          <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-300 font-black block mb-2.5">
            {t("gameSettings.sensorReward")}
          </label>
          <div className="py-3.5 px-4 rounded-xl font-mono font-black text-base bg-pink-500/20 border-2 border-pink-500/50 text-pink-300 text-center shadow-[0_0_15px_rgba(255,0,128,0.2)]">
            +{form.sensorPointReward} XP
          </div>
        </div>
      </div>
    </div>
  );
}

export function BarSettings({ form, set }: SectionProps) {
  const { t } = useLocale();
  return (
    <div className="space-y-6">
      <OptionGrid
        label="⏱️ COCKTAIL-SERVIERZEIT"
        labelClassName="text-pink-400"
        options={suffixed(["45", "60", "90"], t("gameSettings.secondsSuffix"))}
        value={form.barTime}
        onChange={(v) => set("barTime", v)}
        activeClassName="bg-pink-500 text-white border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]"
        columns={3}
      />
      <OptionGrid
        label="⚡ REZEPT-GESCHWINDIGKEIT"
        options={[
          { value: "4.5", label: "Normal (4.5s)" },
          { value: "3.0", label: "Turbo Barmen (3.0s)" },
        ]}
        value={form.barRecipeSpeed}
        onChange={(v) => set("barRecipeSpeed", v)}
        activeClassName="bg-white text-black border-white shadow-md"
        columns={2}
      />
    </div>
  );
}

const COLORS_CONDITIONS = [
  {
    value: "domination" as const,
    title: "100% DOMINANZ",
    description: "Das Team, das die Mittellinie vollständig schiebt, gewinnt sofort.",
  },
  {
    value: "timed" as const,
    title: "45s ZEIT-DUELL",
    description: "Nach Ablauf der Zeit siegt das Team mit der größeren Fläche.",
  },
];

export function ColorsSettings({ form, set }: SectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-purple-400 font-black block mb-2.5">
          🏆 SIEGBEDINGUNG
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {COLORS_CONDITIONS.map((condition) => (
            <button
              key={condition.value}
              type="button"
              aria-pressed={form.colorsWinCondition === condition.value}
              onClick={() => set("colorsWinCondition", condition.value)}
              className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                form.colorsWinCondition === condition.value
                  ? "bg-purple-500/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] font-black"
                  : "bg-white/5 border-white/15 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="font-black text-base text-white mb-1">{condition.title}</div>
              <div className="text-xs text-gray-300">{condition.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
