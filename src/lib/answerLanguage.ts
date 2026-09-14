import { DE_WORDS } from "../data/wordlists/de";
import { TR_WORDS } from "../data/wordlists/tr";
import { EN_WORDS } from "../data/wordlists/en";

/**
 * İlk oyundaki (kelime arenası) cevapların dil ve yazım denetimi.
 *
 * İki eksiği birden kapatıyor:
 *
 * 1. YAZIM HATASI — oyun bir cevabı yalnızca "doğru harfle başlıyor mu" diye
 *    kontrol ediyordu. "Vgel" (doğrusu "Vögel") tam puan alıyordu; dahası
 *    doğru yazanlarla benzerliği %80'de kaldığı için AYRI bir cevap sayılıp
 *    benzersizlik bonusu bile kazanabiliyordu — yani yanlış yazan, doğru
 *    yazandan fazla puan alabiliyordu.
 *
 * 2. YABANCI DİL — Almanca oynanan bir turda Türkçe cevap yazmak serbestti.
 *
 * Yaklaşım: sözlükler kapsayıcı olmadığı için "listede yok = geçersiz"
 * DEMİYORUZ. Yalnızca POZİTİF kanıt varken karar veriyoruz:
 *   - kelime BAŞKA bir dilin listesinde ve oyun dilinin listesinde değilse
 *     → yabancı dil,
 *   - kelime hiçbir listede yok ama oyun dilindeki bir kelimeye bir-iki
 *     harf uzaklıktaysa → yazım hatası.
 * Geri kalan her şey eskisi gibi geçer. Son söz yine host'ta: inceleme
 * ekranında her cevap tek tıkla onaylanabiliyor.
 */

export type AnswerLocale = "tr" | "de" | "en";

export type AnswerJudgement =
  | { kind: "ok" }
  /** Oyun dilinde yazılmamış; puan almaz. */
  | { kind: "foreign"; language: AnswerLocale }
  /** Yazım hatası; kısmi puan alır. `suggestion` host'a gösterilir. */
  | { kind: "typo"; suggestion: string };

/**
 * Sözlük araması için harf katlama: küçük harfe indirir ve aksanları
 * düşürür.
 *
 * Aksanları düşürmek bilinçli: telefon klavyesinde umlaut/şapka atlamak çok
 * yaygın ve bunu "yazım hatası" saymak misafiri haksız yere cezalandırırdı.
 * "Vogel" ile "Vögel" burada aynı anahtara düşüyor, ikisi de tam puan alıyor;
 * ama "Vgel" (eksik HARF) hâlâ farklı bir anahtar, yani yakalanıyor.
 *
 * Dikkat: dil tespitindeki karakter sinyali bu katlamadan ÖNCE, ham kelime
 * üzerinde çalışmak zorunda — aksi hâlde "ğ"yi düşürüp kanıtı yok ederdik.
 */
export function foldForLookup(word: string): string {
  return word
    .trim()
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

const DICTIONARIES: Record<AnswerLocale, ReadonlySet<string>> = {
  de: new Set(DE_WORDS.map(foldForLookup)),
  tr: new Set(TR_WORDS.map(foldForLookup)),
  en: new Set(EN_WORDS.map(foldForLookup)),
};

const ALL_LOCALES: AnswerLocale[] = ["tr", "de", "en"];

/**
 * Yalnızca tek bir dile ait olan harfler.
 *
 * ö/ü ikisinde birden (Türkçe + Almanca) olduğu için kanıt sayılmıyor.
 * Bu liste yüksek isabetli ama dar: ayırt edici harf taşımayan bir kelime
 * ("Kedi") buradan geçer, onu sözlük yakalar.
 */
const EXCLUSIVE_LETTERS: Record<AnswerLocale, RegExp> = {
  tr: /[ığş]/u,
  de: /[äß]/u,
  en: /^$/u, // İngilizcenin kendine ait aksanlı harfi yok.
};

/** Latin harfleri dışında bir yazı sistemi (Kiril, Yunan, Arap, CJK...). */
const NON_LATIN = /[^\p{Script=Latin}\p{N}\p{P}\p{Z}\p{M}]/u;

function normalizeLocale(locale: string): AnswerLocale {
  if (locale.startsWith("de")) return "de";
  if (locale.startsWith("en")) return "en";
  return "tr";
}

/** İki kelime arasındaki Levenshtein uzaklığı. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Yazım hatası sayılacak en fazla harf farkı.
 *
 * Kısa kelimelerde tek harf bile anlamı tamamen değiştirdiği için sınır dar
 * tutuluyor: "kedi"/"kedı" tolere edilmeli ama "kar"/"kaz" iki ayrı kelime.
 */
function maxEdits(length: number): number {
  if (length <= 3) return 0;
  if (length <= 6) return 1;
  return 2;
}

/** Sözlükte kelimeye en yakın adayı bulur; yoksa null. */
function nearestDictionaryWord(folded: string, locale: AnswerLocale): string | null {
  const limit = maxEdits(folded.length);
  if (limit === 0) return null;
  let best: string | null = null;
  let bestDistance = limit + 1;
  for (const candidate of DICTIONARIES[locale]) {
    // Uzunluk farkı sınırı aşıyorsa mesafeyi hesaplamaya gerek yok.
    if (Math.abs(candidate.length - folded.length) > limit) continue;
    // Oyunun kuralı gereği cevap belirli bir harfle başlıyor; ilk harfi
    // tutmayan aday zaten yazım hatası adayı değil.
    if (candidate[0] !== folded[0]) continue;
    const distance = editDistance(folded, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
      if (distance === 1) break; // Daha iyisi olamaz (0 zaten tam eşleşme).
    }
  }
  return bestDistance <= limit ? best : null;
}

/**
 * Özel isim kategorisi mi — öyleyse dil kontrolü HİÇ uygulanmaz.
 *
 * "İsimler uluslararası": şehir, ülke, kişi, marka, film, şarkı adları her
 * dilde aynı yazılır. Kategoriyi host kendisi seçtiği için bu sinyal
 * güvenilir; cevabın kendisini tahmin etmeye çalışmaktan çok daha sağlam.
 */
const PROPER_NOUN_HINTS = [
  // Kişi
  "name","isim","ad","ünlü","unlu","berühmt","beruhmt","celebrity","star",
  "sänger","sanger","şarkıcı","sarkici","singer","schauspieler","oyuncu","actor",
  "autor","yazar","writer","charakter","karakter","character","laureate","preisträger","ödüllüsü","odullusu",
  // Yer
  "stadt","şehir","sehir","city","land","ülke","ulke","country","hauptstadt","başkent","baskent","capital",
  "fluss","nehir","river","berg","dağ","dag","mountain","ort","yer","place","insel","ada","island",
  // Marka & eser
  "marke","marka","brand","film","movie","dizi","serie","series","buch","kitap","book",
  "lied","şarkı","sarki","song","album","albüm","club","kulüp","kulup","dj",
  // Uluslararası terim havuzları
  "element","cocktail","kokteyl","marke","fabelwesen","mitolojik","mythological",
];

export function isProperNounCategory(category: string): boolean {
  const folded = foldForLookup(category);
  return PROPER_NOUN_HINTS.some((hint) => folded.includes(foldForLookup(hint)));
}

/**
 * Bir cevabı değerlendirir.
 *
 * Çok kelimeli cevaplarda ("kırmızı biber") her parça ayrı bakılır; ilk
 * kesin kanıt kararı belirler.
 */
export function judgeAnswer(
  rawAnswer: string,
  roomLocale: string,
  category: string,
): AnswerJudgement {
  const locale = normalizeLocale(roomLocale);
  const raw = rawAnswer.trim();
  if (!raw) return { kind: "ok" };

  const exemptFromLanguage = isProperNounCategory(category);

  for (const token of raw.split(/\s+/).filter(Boolean)) {
    const folded = foldForLookup(token);
    if (!folded) continue;

    if (!exemptFromLanguage) {
      // Latin dışı bir yazı sistemi her üç dil için de yabancı.
      if (NON_LATIN.test(token)) return { kind: "foreign", language: locale };

      // Ayırt edici harf kanıtı (ham kelime üzerinde, katlamadan önce).
      for (const other of ALL_LOCALES) {
        if (other === locale) continue;
        if (EXCLUSIVE_LETTERS[other].test(token) && !EXCLUSIVE_LETTERS[locale].test(token)) {
          return { kind: "foreign", language: other };
        }
      }

      // Sözlük kanıtı: başka dilde var, oyun dilinde yok.
      if (!DICTIONARIES[locale].has(folded)) {
        for (const other of ALL_LOCALES) {
          if (other === locale) continue;
          if (DICTIONARIES[other].has(folded)) return { kind: "foreign", language: other };
        }
      }
    }

    // Yazım hatası: hiçbir sözlükte yok ama oyun dilindeki bir kelimeye çok
    // yakın. Özel isim kategorilerinde de çalışıyor — orada da "Berln" yazan
    // biri tam puan almamalı; yalnızca DİL kontrolü muaf.
    const inAnyDictionary = ALL_LOCALES.some((l) => DICTIONARIES[l].has(folded));
    if (!inAnyDictionary) {
      const suggestion = nearestDictionaryWord(folded, locale);
      if (suggestion) return { kind: "typo", suggestion };
    }
  }

  return { kind: "ok" };
}
