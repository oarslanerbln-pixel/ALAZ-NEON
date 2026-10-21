/**
 * HENGAME — eski anons kimlikleri için uyumluluk katmanı.
 *
 * Lobi, bomba ve podyum ekranları anonslarını kendi zamanlamalarıyla bu
 * kimliklerle çağırıyor. Çağrılar artık TV spikerine (lib/announcerPlayer)
 * gider: hangi kimliğin hangi ana düştüğü ve hangilerinin bilinçli olarak
 * sustuğu lib/announcer.ts → cueForLegacyId içinde.
 */

import { cueForLegacyId } from "./announcer";
import { hostAnnouncer } from "./announcerPlayer";

export type GermanVoiceoverId =
  | "welcome_arena"
  | "game_starting"
  | "new_player_joined"
  | "countdown_10s"
  | "countdown_321"
  | "hurry_up"
  | "bomb_intro"
  | "bomb_tick_fast"
  | "bomb_exploded"
  | "quiz_correct"
  | "quiz_wrong"
  | "quiz_streak"
  | "sensor_duel"
  | "podium_reveal"
  | "champion_announce"
  | "free_drink_reward";

/**
 * TV Host ekranında ilgili anonsu spikere iletir. Ses seviyesi spikerde
 * sabittir; parametre eski çağrılarla uyum için duruyor.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- eski çağrılar ses seviyesi geçiriyor
export function playGermanVoiceover(id: GermanVoiceoverId, _volume?: number): void {
  const cue = cueForLegacyId(id);
  if (cue) hostAnnouncer.say(cue);
}
