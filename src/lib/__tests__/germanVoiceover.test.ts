import { describe, it, expect, vi, beforeEach } from "vitest";
import { playGermanVoiceover, GERMAN_VOICEOVER_PATHS, type GermanVoiceoverId } from "../germanVoiceover";
import { SoundManager } from "../audio";

describe("germanVoiceover", () => {
  let playSFXMock: ReturnType<typeof vi.fn>;
  let getIsMutedMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    playSFXMock = vi.fn();
    getIsMutedMock = vi.fn().mockReturnValue(false);

    vi.spyOn(SoundManager, "getInstance").mockReturnValue({
      playSFX: playSFXMock,
      getIsMuted: getIsMutedMock,
    } as unknown as SoundManager);
  });

  it("her ses ID'si için doğru ses yolu tanımlanmıştır", () => {
    const keys: GermanVoiceoverId[] = [
      "welcome_arena",
      "game_starting",
      "new_player_joined",
      "countdown_10s",
      "countdown_321",
      "hurry_up",
      "bomb_intro",
      "bomb_tick_fast",
      "bomb_exploded",
      "quiz_correct",
      "quiz_wrong",
      "quiz_streak",
      "sensor_duel",
      "podium_reveal",
      "champion_announce",
      "free_drink_reward",
    ];

    for (const key of keys) {
      expect(GERMAN_VOICEOVER_PATHS[key]).toBe(`/audio/de/${key}.mp3`);
    }
  });

  it("ses açıkken ilgili dosya yolunu doğru ses seviyesiyle çalar", () => {
    playGermanVoiceover("welcome_arena", 0.9);
    expect(playSFXMock).toHaveBeenCalledWith("/audio/de/welcome_arena.mp3", 0.9);
  });

  it("ses kapalıyken (muted) ses çalmayı engeller", () => {
    getIsMutedMock.mockReturnValue(true);
    playGermanVoiceover("bomb_exploded");
    expect(playSFXMock).not.toHaveBeenCalled();
  });
});
