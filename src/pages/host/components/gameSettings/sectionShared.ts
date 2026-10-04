import type { GameSettingsForm } from "../../../../lib/gameSettings";
import type { Option } from "./OptionGrid";

/**
 * Oyun başına ayar bölümleri. Durum modalda tek bir form nesnesinde
 * (lib/gameSettings.ts); bölümler yalnızca okuyup `set` ile değiştirir.
 */
export interface SectionProps {
  form: GameSettingsForm;
  set: <K extends keyof GameSettingsForm>(key: K, value: GameSettingsForm[K]) => void;
}

/** "45" → { value: "45", label: "45 Sn" } */
export function suffixed(values: string[], suffix: string): Option[] {
  return values.map((value) => ({ value, label: `${value} ${suffix}` }));
}

export const WHITE_ACTIVE = "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]";
