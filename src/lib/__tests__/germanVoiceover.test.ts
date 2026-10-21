import { describe, it, expect, vi, beforeEach } from "vitest";
import { playGermanVoiceover } from "../germanVoiceover";
import { hostAnnouncer } from "../announcerPlayer";

describe("germanVoiceover (uyumluluk katmanı)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("eski kimliği spikerin yeni anına iletir", () => {
    const say = vi.spyOn(hostAnnouncer, "say").mockImplementation(() => {});
    playGermanVoiceover("podium_reveal", 0.9);
    expect(say).toHaveBeenCalledWith("podium");
  });

  it("susturulmuş kimlik spikere hiç ulaşmaz", () => {
    const say = vi.spyOn(hostAnnouncer, "say").mockImplementation(() => {});
    playGermanVoiceover("new_player_joined");
    expect(say).not.toHaveBeenCalled();
  });
});
