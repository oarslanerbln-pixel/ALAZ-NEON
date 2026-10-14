import { useState, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

import { NeonIcon } from "../../../components/NeonIcon";
import { useEscapeKey } from "../../../hooks/useEscapeKey";
import { useLocale } from "../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../lib/audio";
import {
  buildRoomSettings,
  initialSettingsForm,
  withGameDefaults,
  type GameSettingsForm,
} from "../../../lib/gameSettings";
import type { GameType, Room } from "../../../types/database";
import { GAME_METAS } from "./gameSettings/gameMetas";
import {
  AynaSettings,
  GameModeSettings,
  QuizSettings,
  ScattegoriesSettings,
} from "./gameSettings/GameSettingsSections";
import { BarSettings, BombSettings, ColorsSettings, SensorSettings } from "./gameSettings/PartyGameSettings";
import type { SectionProps } from "./gameSettings/sectionShared";

interface Props {
  isOpen: boolean;
  game: GameType | null;
  room?: Room;
  onClose: () => void;
  onStart: (game: GameType, settings: Partial<Room>) => Promise<void>;
}

/** Oyun başına ayar bölümü; listede olmayan oyunların ayarı yok. */
const SECTIONS: Partial<Record<GameType, (props: SectionProps) => ReactElement>> = {
  scattegories: ScattegoriesSettings,
  quiz: QuizSettings,
  ayna: AynaSettings,
  bomb: BombSettings,
  sensor: SensorSettings,
  bar: BarSettings,
  colors: ColorsSettings,
};

/** Bireysel/takım seçimi yalnızca bu oyunlarda anlamlı. */
const HAS_GAME_MODE: readonly GameType[] = ["scattegories", "quiz"];

/**
 * Oyun başlatmadan önceki ayarlar. Form durumu ve odaya yazılan ayarlar
 * lib/gameSettings.ts'te (saf, testli); oyun başına bölümler
 * gameSettings/GameSettingsSections.tsx'te (docs/roadmap.md, 2.7).
 */
export function GameSettingsModal({ isOpen, game, onClose, onStart }: Props) {
  const { t } = useLocale();
  useEscapeKey(isOpen, onClose);

  const [form, setForm] = useState<GameSettingsForm>(() => initialSettingsForm(t("categories.default")));
  const set: SectionProps["set"] = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Modal başka bir oyun için açılınca o oyunun varsayılanları — render
  // sırasında, önceki oyun izlenerek (efektte yapılsa bir kare eski değer görünürdü).
  const [prevGame, setPrevGame] = useState<GameType | null>(null);
  if (game !== prevGame) {
    setPrevGame(game);
    setForm((prev) => withGameDefaults(prev, game));
  }

  if (!isOpen || !game) return null;

  const meta = GAME_METAS[game] || GAME_METAS.scattegories;
  const Section = SECTIONS[game];

  const handleStartGame = async () => {
    SoundManager.getInstance().playSFX(sounds.START);
    await onStart(game, buildRoomSettings(game, form));
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
          role="presentation"
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
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shrink-0 shadow-lg"
                style={{ 
                  backgroundColor: `${meta.color}25`,
                  borderColor: meta.color,
                  boxShadow: `0 0 25px ${meta.color}50`
                }}
              >
                <NeonIcon type={meta.icon} color="white" className="w-8 h-8" />
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
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
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

            {Section && <Section form={form} set={set} />}
            {HAS_GAME_MODE.includes(game) && <GameModeSettings form={form} set={set} />}
          </div>

          {/* ════════════════ FOOTER ACTION BUTTONS ════════════════ */}
          <div className="p-6 sm:p-8 pt-5 border-t border-white/15 flex gap-4 bg-black/60 relative z-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 sm:py-4.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 transition-all active:scale-95 cursor-pointer"
            >
              {t("gameSettings.cancel")}
            </button>
            <button
              type="button"
              onClick={handleStartGame}
              className="flex-[2] py-4 sm:py-4.5 px-8 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest text-black transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: meta.color,
                boxShadow: `0 0 35px ${meta.glow}`
              }}
            >
              <Play className="w-5 h-5 fill-black text-black" />
              <span>{t("gameSettings.startSession")}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
