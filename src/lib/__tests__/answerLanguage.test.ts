import { describe, it, expect } from "vitest";

import {
  editDistance,
  foldForLookup,
  isProperNounCategory,
  judgeAnswer,
} from "../answerLanguage";
import { DE_WORDS } from "../../data/wordlists/de";
import { TR_WORDS } from "../../data/wordlists/tr";
import { EN_WORDS } from "../../data/wordlists/en";

describe("foldForLookup", () => {
  it("aksanları düşürüyor — telefonda umlaut atlamak cezalandırılmamalı", () => {
    expect(foldForLookup("Vögel")).toBe(foldForLookup("Vogel"));
    expect(foldForLookup("Käse")).toBe("kase");
    expect(foldForLookup("Straße")).toBe("strasse");
  });

  it("Türkçe noktalı/noktasız i'yi aynı anahtara indiriyor", () => {
    expect(foldForLookup("Işık")).toBe(foldForLookup("ışık"));
    expect(foldForLookup("İstanbul")).toBe("istanbul");
  });

  it("eksik HARF katlamadan sonra da fark ediliyor", () => {
    expect(foldForLookup("Vgel")).not.toBe(foldForLookup("Vögel"));
  });
});

describe("editDistance", () => {
  it("temel durumlar", () => {
    expect(editDistance("kedi", "kedi")).toBe(0);
    expect(editDistance("vogel", "vgel")).toBe(1);
    expect(editDistance("", "abc")).toBe(3);
  });
});

describe("yazım hatası — kısmi puan", () => {
  it("kullanıcının örneği: Almanca 'V' turunda 'Vgel' yazım hatası", () => {
    const verdict = judgeAnswer("Vgel", "de", "Tier");
    expect(verdict.kind).toBe("typo");
    if (verdict.kind === "typo") expect(verdict.suggestion).toBe("vogel");
  });

  it("doğru yazım tam puan alıyor", () => {
    expect(judgeAnswer("Vögel", "de", "Tier").kind).toBe("ok");
    expect(judgeAnswer("Vogel", "de", "Tier").kind).toBe("ok");
  });

  it("umlautsuz yazım yazım hatası SAYILMIYOR", () => {
    // "Kase" / "Käse" telefon klavyesinde çok yaygın; bunu cezalandırmak
    // misafiri haksız yere kaybettirirdi.
    expect(judgeAnswer("Kase", "de", "Essen").kind).toBe("ok");
  });

  it("Türkçe turda eksik harf yakalanıyor", () => {
    const verdict = judgeAnswer("kpek", "tr", "Hayvan");
    expect(verdict.kind).toBe("typo");
    if (verdict.kind === "typo") expect(verdict.suggestion).toBe("kopek");
  });

  it("çok kısa kelimelerde yazım hatası aranmıyor — 'kar' ile 'kaz' ayrı kelime", () => {
    expect(judgeAnswer("kaz", "tr", "Hayvan").kind).toBe("ok");
  });

  it("çekim eki / bileşik kelime yazım hatası SAYILMIYOR", () => {
    // Gerçek bir yanlış pozitifti: "Dachs" (porsuk) sözlükteki "dach"
    // (çatı) kelimesinin yazım hatası sanılıyordu. Biri diğerinin ön ekiyse
    // bu bir hata değil, başka bir kelimedir — çoğul, çekim ya da bileşik.
    expect(judgeAnswer("Dachs", "de", "Tier").kind).toBe("ok");
    expect(judgeAnswer("Hunde", "de", "Tier").kind).toBe("ok");
    expect(judgeAnswer("Katzen", "de", "Tier").kind).toBe("ok");
    expect(judgeAnswer("Kediler", "tr", "Hayvan").kind).toBe("ok");
  });

  it("listede olmayan ama geçerli kelimeler temiz geçiyor", () => {
    // Sözlük ~550 kelime; kapsamadığı geçerli cevaplar cezalandırılmamalı.
    const valid: Array<[string, string, string]> = [
      ["de", "Tier", "Waschbär"], ["de", "Tier", "Luchs"], ["de", "Essen", "Brezel"],
      ["de", "Essen", "Schnitzel"], ["de", "Gegenstand", "Kerze"], ["de", "Beruf", "Barkeeper"],
      ["tr", "Hayvan", "Sincap"], ["tr", "Yiyecek", "Menemen"], ["tr", "Eşya", "Vazo"],
      ["en", "Animal", "Raccoon"], ["en", "Food", "Pancake"], ["en", "Object", "Candle"],
    ];
    const flagged = valid
      .filter(([loc, cat, word]) => judgeAnswer(word, loc, cat).kind !== "ok")
      .map(([loc, , word]) => `${loc}/${word}`);
    expect(flagged).toEqual([]);
  });

  it("sözlükte hiç olmayan ve hiçbir şeye benzemeyen kelime dokunulmadan geçiyor", () => {
    // Sözlük kapsayıcı değil; tanımadığı kelimeyi geçersiz saymamalı.
    expect(judgeAnswer("Zwirbelfux", "de", "Tier").kind).toBe("ok");
  });
});

describe("dil kontrolü", () => {
  it("Almanca turda Türkçe cevap reddediliyor (sözlük kanıtı)", () => {
    const verdict = judgeAnswer("Kedi", "de", "Tier");
    expect(verdict.kind).toBe("foreign");
    if (verdict.kind === "foreign") expect(verdict.language).toBe("tr");
  });

  it("Almanca turda ayırt edici Türkçe harf reddediliyor", () => {
    const verdict = judgeAnswer("Yılan", "de", "Tier");
    expect(verdict.kind).toBe("foreign");
    if (verdict.kind === "foreign") expect(verdict.language).toBe("tr");
  });

  it("Türkçe turda Almanca cevap reddediliyor", () => {
    const verdict = judgeAnswer("Hund", "tr", "Hayvan");
    expect(verdict.kind).toBe("foreign");
    if (verdict.kind === "foreign") expect(verdict.language).toBe("de");
  });

  it("Türkçe turda ayırt edici Almanca harf reddediliyor", () => {
    expect(judgeAnswer("Käse", "tr", "Yiyecek").kind).toBe("foreign");
  });

  it("İngilizce turda Almanca cevap reddediliyor", () => {
    expect(judgeAnswer("Hund", "en", "Animal").kind).toBe("foreign");
  });

  it("oyunun kendi dilindeki cevap kabul ediliyor", () => {
    expect(judgeAnswer("Hund", "de", "Tier").kind).toBe("ok");
    expect(judgeAnswer("Kedi", "tr", "Hayvan").kind).toBe("ok");
    expect(judgeAnswer("Dog", "en", "Animal").kind).toBe("ok");
  });

  it("iki dilde de olan kelime reddedilmiyor", () => {
    // "Orange" hem Almanca hem İngilizce listede; kanıt yok, geçmeli.
    expect(judgeAnswer("Orange", "de", "Obst").kind).toBe("ok");
    expect(judgeAnswer("Orange", "en", "Fruit").kind).toBe("ok");
  });

  it("Latin dışı yazı sistemi reddediliyor", () => {
    expect(judgeAnswer("Кот", "de", "Tier").kind).toBe("foreign");
  });
});

describe("özel isim istisnası", () => {
  it("isim/yer/marka kategorileri tanınıyor", () => {
    for (const cat of ["Name", "İsim", "Stadt", "Şehir", "City", "Land", "Ülke",
                       "Marke", "Marka", "Film", "Sänger", "Şarkıcı", "Hauptstadt",
                       "Başkent", "Chemisches Element", "Nobelpreisträger"]) {
      expect(isProperNounCategory(cat), cat).toBe(true);
    }
  });

  it("cins isim kategorileri muaf değil", () => {
    for (const cat of ["Tier", "Hayvan", "Animal", "Essen", "Yiyecek", "Gegenstand", "Eşya"]) {
      expect(isProperNounCategory(cat), cat).toBe(false);
    }
  });

  it("özel isim kategorisinde yabancı görünen cevap kabul ediliyor", () => {
    // "Hund" Almanca sözlükte; Türkçe bir "İsim" turunda yine de geçmeli,
    // çünkü isimler uluslararası.
    expect(judgeAnswer("Hund", "tr", "İsim").kind).toBe("ok");
    expect(judgeAnswer("Kedi", "de", "Stadt").kind).toBe("ok");
  });

  it("özel isim kategorisinde bile yazım hatası yakalanıyor", () => {
    // Dil kontrolü muaf, yazım kontrolü değil.
    expect(judgeAnswer("Vgel", "de", "Name").kind).toBe("typo");
  });
});

describe("çok kelimeli ve boş cevaplar", () => {
  it("boş cevap sorunsuz", () => {
    expect(judgeAnswer("", "de", "Tier").kind).toBe("ok");
    expect(judgeAnswer("   ", "de", "Tier").kind).toBe("ok");
  });

  it("çok kelimeli cevapta herhangi bir parça yabancıysa reddediliyor", () => {
    expect(judgeAnswer("kleine Kedi", "de", "Tier").kind).toBe("foreign");
  });
});

describe("yanlış pozitif güvencesi", () => {
  // En büyük risk bu özellikte yanlış pozitif: geçerli bir cevabı reddetmek,
  // kaçırmaktan çok daha kötü — misafir haksız yere puan kaybeder ve oyuna
  // güveni biter. Her dilin KENDİ listesindeki hiçbir kelime, o dilde
  // oynanan bir turda reddedilmemeli ya da yazım hatası sayılmamalı.
  const POOLS = [
    ["de", DE_WORDS, "Tier"],
    ["tr", TR_WORDS, "Hayvan"],
    ["en", EN_WORDS, "Animal"],
  ] as const;

  for (const [locale, words, category] of POOLS) {
    it(`${locale}: kendi listesindeki her kelime temiz geçiyor`, () => {
      const flagged: string[] = [];
      for (const word of words) {
        const verdict = judgeAnswer(word, locale, category);
        if (verdict.kind !== "ok") flagged.push(`${word} → ${verdict.kind}`);
      }
      expect(flagged).toEqual([]);
    });
  }

  it("özel isim kategorisinde hiçbir dil reddi olmuyor", () => {
    const flagged: string[] = [];
    for (const [, words] of POOLS) {
      for (const word of words.slice(0, 120)) {
        const verdict = judgeAnswer(word, "de", "Stadt");
        if (verdict.kind === "foreign") flagged.push(word);
      }
    }
    expect(flagged).toEqual([]);
  });
});
