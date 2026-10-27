import { describe, it, expect } from "vitest";

import { GAME_CARDS } from "../gameCatalog";
import { setLocale, t, type Locale } from "../i18n";

/**
 * Bir zamanlar bazi modlarin host ekrani, oyuncu kumandasi ve ceviri metinleri
 * tamamen yazilmisti ama dashboard katalogunda kartlari olmadigi icin hicbir
 * sekilde baslatilamiyorlardi. Derleme zamani kontrolu gameCatalog.ts'in
 * sonunda; buradaki testler kartlarin icerigini (benzersizlik, gercek ceviri
 * anahtari, siralama) tutuyor.
 */

const LOCALES: Locale[] = ["tr", "de", "en"];

/**
 * Yonlendirmenin dayandigi mod kimlikleri. GameType birligi derleme sonrasi
 * silindigi icin calisma zamaninda ayrica listelenmek zorunda; gercek koruma
 * gameCatalog.ts'teki exhaustiveness kontrolu, bu liste onun ikinci kordonu.
 */
const EXPECTED_GAME_IDS = ["scattegories", "quiz", "bomb", "slingshot"] as const;

describe("oyun katalogu", () => {
  it("her oyun modunun bir dashboard karti var", () => {
    const cardIds = GAME_CARDS.map((g) => g.id);
    expect([...cardIds].sort()).toEqual([...EXPECTED_GAME_IDS].sort());
  });

  it("ayni mod iki kez listelenmiyor", () => {
    const cardIds = GAME_CARDS.map((g) => g.id);
    expect(new Set(cardIds).size).toBe(cardIds.length);
  });

  it("her kartin aciklamasi uc dilde de gercek bir ceviriye cozuluyor", () => {
    for (const locale of LOCALES) {
      setLocale(locale);
      for (const card of GAME_CARDS) {
        const text = t(card.descKey);
        // t() bilinmeyen anahtarda anahtarin kendisini geri veriyor; bir
        // yazim hatasi ekranda "dashboard.modeXDesc" olarak gorunurdu.
        expect(text, `${card.id} / ${locale}`).not.toBe(card.descKey);
        expect(text.length, `${card.id} / ${locale}`).toBeGreaterThan(10);
      }
    }
    setLocale("de");
  });

  it("kart basliklari bos degil", () => {
    for (const card of GAME_CARDS) {
      expect(card.titlePrefix.trim(), card.id).not.toBe("");
      expect(card.titleHighlight.trim(), card.id).not.toBe("");
    }
  });

  it("yalnızca Arena, Quiz ve Bomb oynanabilir; Yörünge Sapanı kilitli", () => {
    const active = GAME_CARDS.filter((g) => !g.isComingSoon).map((g) => g.id);
    const locked = GAME_CARDS.filter((g) => g.isComingSoon).map((g) => g.id);
    expect(active.sort()).toEqual(["bomb", "quiz", "scattegories"]);
    expect(locked).toEqual(["slingshot"]);
  });

  it("karuselde oynanabilir modlar kilitlilerden önce gelir", () => {
    const firstLocked = GAME_CARDS.findIndex((g) => g.isComingSoon);
    const lastPlayable = GAME_CARDS.map((g) => !g.isComingSoon).lastIndexOf(true);
    expect(lastPlayable).toBeLessThan(firstLocked);
  });
});
