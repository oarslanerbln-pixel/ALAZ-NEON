import { describe, expect, it } from "vitest";

import { BOMB_DEFAULT_CATEGORIES, bombLives, nextBombCategory, pickBombHolder } from "../bomb";

describe("bombLives", () => {
  it("yazılmamış can tam sayılır", () => {
    expect(bombLives({ lives: undefined })).toBe(3);
    expect(bombLives({ lives: 0 })).toBe(0);
  });
});

describe("pickBombHolder", () => {
  const players = [
    { id: "a", lives: 2 },
    { id: "b", lives: 0 },
    { id: "c", lives: undefined },
    { id: "d", lives: 1 },
  ];

  it("elenmişleri ve hariç tutulanı seçmez", () => {
    for (const r of [0, 0.34, 0.67, 0.9999]) {
      const id = pickBombHolder(players, "a", () => r);
      expect(id).not.toBe("a");
      expect(id).not.toBe("b");
    }
  });

  it("random 1'e çok yakın olsa da dizinin dışına taşmaz", () => {
    expect(pickBombHolder(players, null, () => 0.999999)).toBe("d");
  });

  it("canı olan kimse kalmadıysa null", () => {
    expect(pickBombHolder([{ id: "x", lives: 0 }], null)).toBeNull();
    expect(pickBombHolder([{ id: "x", lives: 2 }], "x")).toBeNull();
  });
});

describe("BOMB_DEFAULT_CATEGORIES", () => {
  it("üç dilde de ~10 benzersiz, boş olmayan kategori var", () => {
    for (const locale of ["de", "tr", "en"] as const) {
      const list = BOMB_DEFAULT_CATEGORIES[locale];
      expect(list.length, locale).toBeGreaterThanOrEqual(8);
      expect(new Set(list).size, locale).toBe(list.length);
      for (const c of list) expect(c.trim(), locale).not.toBe("");
    }
  });
});

describe("nextBombCategory", () => {
  it("kategori listesi boşsa odanın dilindeki hazır listeden seçer — boş/undefined yazılmaz", () => {
    expect(nextBombCategory([], [], "tr", () => 0)).toEqual({ category: "Hayvanlar", used: ["Hayvanlar"] });
    expect(nextBombCategory(undefined, undefined, "en", () => 0)).toEqual({ category: "Animals", used: ["Animals"] });
    expect(BOMB_DEFAULT_CATEGORIES.de).toContain(nextBombCategory(["", "  "], [], "de").category);
  });

  it("dil bilinmiyorsa Almanca listeye düşer", () => {
    expect(nextBombCategory([], [], undefined, () => 0).category).toBe(BOMB_DEFAULT_CATEGORIES.de[0]);
  });

  it("hazır listede de tüm kategoriler bitmeden tekrar yok, bitince baştan", () => {
    const list = BOMB_DEFAULT_CATEGORIES.de;
    let used: string[] = [];
    const seen: string[] = [];
    for (let i = 0; i < list.length; i++) {
      const next = nextBombCategory([], used, "de", () => 0.5);
      seen.push(next.category);
      used = next.used;
    }
    expect([...seen].sort()).toEqual([...list].sort());
    expect(nextBombCategory([], used, "de", () => 0).used).toHaveLength(1);
  });

  it("odanın kendi kategorileri varsa hazır liste kullanılmaz", () => {
    expect(nextBombCategory(["Tiere"], [], "tr", () => 0).category).toBe("Tiere");
  });

  it("kullanılmamış kategorilerden seçer ve listeye ekler", () => {
    expect(nextBombCategory(["Tiere", "Städte", "Namen"], ["Tiere"], "de", () => 0)).toEqual({
      category: "Städte",
      used: ["Tiere", "Städte"],
    });
  });

  it("hepsi kullanılınca listeyi baştan başlatır", () => {
    expect(nextBombCategory(["Tiere", "Städte"], ["Tiere", "Städte"], "de", () => 0.99)).toEqual({
      category: "Städte",
      used: ["Städte"],
    });
  });

  it("eski gecenin 'GENEL' gibi listede olmayan kayıtlarını yok sayar", () => {
    expect(nextBombCategory(["Tiere"], ["GENEL", ""], "de", () => 0)).toEqual({ category: "Tiere", used: ["Tiere"] });
  });
});
