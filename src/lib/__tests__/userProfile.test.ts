import { describe, it, expect } from "vitest";
import { normalizeProfile } from "../userProfile";

describe("normalizeProfile", () => {
  it("tam kaydı olduğu gibi döndürür", () => {
    const data = {
      phone_number: "+905551112233",
      nickname: "ALFA",
      total_lifetime_score: 420,
      current_league: "GOLD",
      created_at: 1,
      last_active: 2,
    };
    expect(normalizeProfile("uid-1234", data)).toEqual({ uid: "uid-1234", ...data });
  });

  // Katılım ekranının takma adı tam profilden önce yazdığı yarış: kayıtta
  // yalnızca nickname var. Profil kartı eskiden phone_number.replace'te çöküyordu.
  it("yalnızca takma adı olan eksik kaydı varsayılanlarla tamamlar", () => {
    expect(normalizeProfile("uid-1234", { nickname: "BETA" })).toEqual({
      uid: "uid-1234",
      phone_number: "",
      nickname: "BETA",
      total_lifetime_score: 0,
      current_league: "BRONZE",
      created_at: 0,
      last_active: 0,
    });
  });

  it("geçersiz lig ve boş takma adı düzeltir", () => {
    const profile = normalizeProfile("abcd9999", { nickname: "  ", current_league: "UZAY" });
    expect(profile.current_league).toBe("BRONZE");
    expect(profile.nickname).toBe("PLAYER_abcd");
  });

  it("kayıt hiç yoksa (undefined) tamamen varsayılan profil üretir", () => {
    expect(normalizeProfile("uid-0000", undefined).nickname).toBe("PLAYER_uid-");
  });
});
