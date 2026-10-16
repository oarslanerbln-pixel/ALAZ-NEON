import { foldForLookup } from "./stringUtils";
import { DE_ABSTRACT, DE_ANIMALS, DE_CLOTHING, DE_OBJECTS } from "../data/wordlists/de";
import { TR_ABSTRACT, TR_ANIMALS, TR_CLOTHING, TR_OBJECTS } from "../data/wordlists/tr";
import { EN_ABSTRACT, EN_ANIMALS, EN_CLOTHING, EN_OBJECTS } from "../data/wordlists/en";
import { WORLD_CITIES, WORLD_COUNTRIES, WORLD_RIVERS } from "../data/wordlists/geo";


/**
 * Kelime Arenası (Scattegories) kategorilerinin anlamsal türleri.
 */
export type CategoryKind =
  | "object"
  | "animal"
  | "city"
  | "country"
  | "river"
  | "plant_fruit"
  | "food"
  | "person_name"
  | "other";

export type CategoryRejectCode =
  | "abstractNotObject"
  | "animalNotObject"
  | "placeNotObject"
  | "objectNotAnimal"
  | "abstractNotAnimal"
  | "placeNotAnimal"
  | "countryNotCity"
  | "animalNotCity"
  | "objectNotCity"
  | "abstractNotCity"
  | "cityNotCountry"
  | "animalNotCountry"
  | "objectNotCountry"
  | "abstractNotCountry"
  | "animalNotPlant"
  | "objectNotPlant"
  | "abstractNotPlant"
  | "objectNotName"
  | "abstractNotName"
  | "genericWrongCategory";

export interface CategoryValidationSuccess {
  valid: true;
}

export interface CategoryValidationFailure {
  valid: false;
  reasonCode: CategoryRejectCode;
  defaultMessage: string;
}

export type CategoryValidationResult =
  | CategoryValidationSuccess
  | CategoryValidationFailure;

type SupportedLocale = "de" | "tr" | "en";

function normalizeCategoryLocale(locale?: string, category?: string): SupportedLocale {
  if (locale?.startsWith("de")) return "de";
  if (locale?.startsWith("en")) return "en";
  if (locale?.startsWith("tr")) return "tr";

  // Eğer oda locale verilmemişse kategorinin dilinden tahmin et
  if (category) {
    const folded = foldForLookup(category);
    if (folded.includes("gegenstand") || folded.includes("tier") || folded.includes("stadt") || folded.includes("land") || folded.includes("pflanze")) {
      return "de";
    }
    if (folded.includes("object") || folded.includes("animal") || folded.includes("city") || folded.includes("country")) {
      return "en";
    }
  }
  return "tr";
}

// Soyut kavramlar (hangi dilde yazılırsa yazılsın soyut kavramdır)
const ALL_ABSTRACT = new Set<string>([
  ...DE_ABSTRACT.map(foldForLookup),
  ...TR_ABSTRACT.map(foldForLookup),
  ...EN_ABSTRACT.map(foldForLookup),
]);

// Hayvanlar (tüm diller)
const ALL_ANIMALS = new Set<string>([
  ...DE_ANIMALS.map(foldForLookup),
  ...TR_ANIMALS.map(foldForLookup),
  ...EN_ANIMALS.map(foldForLookup),
]);

// Eşyalar (tüm diller ve dile özgü kümeler)
const OBJECTS_BY_LOCALE: Record<SupportedLocale, ReadonlySet<string>> = {
  de: new Set([...DE_OBJECTS.map(foldForLookup), ...DE_CLOTHING.map(foldForLookup)]),
  tr: new Set([...TR_OBJECTS.map(foldForLookup), ...TR_CLOTHING.map(foldForLookup)]),
  en: new Set([...EN_OBJECTS.map(foldForLookup), ...EN_CLOTHING.map(foldForLookup)]),
};

const ALL_OBJECTS = new Set<string>([
  ...OBJECTS_BY_LOCALE.de,
  ...OBJECTS_BY_LOCALE.tr,
  ...OBJECTS_BY_LOCALE.en,
]);

const ALL_CITIES = new Set<string>(WORLD_CITIES.map(foldForLookup));
const ALL_COUNTRIES = new Set<string>(WORLD_COUNTRIES.map(foldForLookup));
const ALL_RIVERS = new Set<string>(WORLD_RIVERS.map(foldForLookup));

const ALL_PLANTS_AND_FRUITS = new Set<string>([
  // Almanca bitkiler & meyveler
  "apfel","birne","banane","orange","zitrone","traube","erdbeere","himbeere","kirsche","pfirsich",
  "pflaume","melone","ananas","mango","rose","tulpe","nelke","lilie","eiche","tanne","birke",
  "buche","kiefer","palme","kaktus","moos","pilz","baum","blume","pflanze","frucht",
  // Türkçe bitkiler & meyveler
  "elma","armut","muz","portakal","limon","üzüm","çilek","ahududu","kiraz","şeftali",
  "erik","kavun","karpuz","ananas","mango","gül","lale","karanfil","zambak","meşe","çam",
  "huş","kayın","palmiye","kaktüs","yosun","ağaç","çiçek","bitki","meyve",
  // İngilizce
  "apple","pear","banana","orange","lemon","grape","strawberry","raspberry","cherry","peach",
  "plum","melon","watermelon","pineapple","mango","rose","tulip","lily","oak","pine",
  "birch","beech","palm","cactus","moss","tree","flower","plant","fruit",
].map(foldForLookup));

/**
 * Çok kelimeli cevaplarda ihmal edilecek artikeller ve bağlaçlar.
 */
const STOP_WORDS = new Set<string>([
  "der","die","das","ein","eine","einen","einem","einer","eines",
  "bir","ve","ile",
  "the","a","an","and",
]);

/**
 * Kategori adından anlamsal kategoriyi tespit eder.
 */
export function detectCategoryKind(category: string): CategoryKind {
  const folded = foldForLookup(category);

  // Eşya / Nesne
  if (
    folded.includes("gegenstand") ||
    folded.includes("esya") ||
    folded.includes("nesne") ||
    folded.includes("object") ||
    folded.includes("kuchengerat") ||
    folded.includes("kuechengeraet") ||
    folded.includes("mutfak") ||
    folded.includes("tool") ||
    folded.includes("werkzeug") ||
    folded.includes("alet")
  ) {
    return "object";
  }

  // Hayvan
  if (
    folded.includes("tier") ||
    folded.includes("hayvan") ||
    folded.includes("animal") ||
    folded.includes("fabelwesen") ||
    folded.includes("mitolojik")
  ) {
    return "animal";
  }

  // Şehir
  if (
    folded.includes("stadt") ||
    folded.includes("sehir") ||
    folded.includes("city") ||
    folded.includes("hauptstadt") ||
    folded.includes("baskent") ||
    folded.includes("capital")
  ) {
    return "city";
  }

  // Ülke
  if (
    folded.includes("land") ||
    folded.includes("ulke") ||
    folded.includes("country")
  ) {
    return "country";
  }

  // Nehir
  if (
    folded.includes("fluss") ||
    folded.includes("nehir") ||
    folded.includes("river")
  ) {
    return "river";
  }

  // Bitki / Meyve
  if (
    folded.includes("pflanze") ||
    folded.includes("bitki") ||
    folded.includes("plant") ||
    folded.includes("frucht") ||
    folded.includes("meyve") ||
    folded.includes("fruit")
  ) {
    return "plant_fruit";
  }

  // Yemek / İçecek
  if (
    folded.includes("essen") ||
    folded.includes("yiyecek") ||
    folded.includes("yemek") ||
    folded.includes("food") ||
    folded.includes("snack") ||
    folded.includes("atistirmalik") ||
    folded.includes("tatli") ||
    folded.includes("dessert") ||
    folded.includes("fruhstuck") ||
    folded.includes("fruehstueck") ||
    folded.includes("kahvalti") ||
    folded.includes("breakfast") ||
    folded.includes("cocktail") ||
    folded.includes("kokteyl") ||
    folded.includes("kaffee") ||
    folded.includes("kahve")
  ) {
    return "food";
  }

  // Kişi adı / Meslek
  if (
    folded.includes("name") ||
    folded.includes("isim") ||
    folded.includes("sanger") ||
    folded.includes("saenger") ||
    folded.includes("sarkici") ||
    folded.includes("singer") ||
    folded.includes("actor") ||
    folded.includes("oyuncu") ||
    folded.includes("schauspieler") ||
    folded.includes("autor") ||
    folded.includes("yazar") ||
    folded.includes("writer") ||
    folded.includes("mitarbeiter") ||
    folded.includes("calisan") ||
    folded.includes("job") ||
    folded.includes("unvan")
  ) {
    return "person_name";
  }

  return "other";
}

/**
 * Verilen cevabın seçili kategoriye anlamsal uygunluğunu denetler.
 *
 * Temel İlke: Bilinmeyen geçerli kelimeleri (ör. "Isolierband", küçük kasabalar vb.)
 * yanlışlıkla reddetmemek için POZİTİF KANIT ilkesiyle çalışır:
 * Sadece kelimenin açıkça yasaklı bir gruba (örn. Soyut kavram, hayvan vb.)
 * ait olduğu biliniyorsa reddedilir.
 */
export function validateCategoryMatch(
  rawAnswer: string,
  category: string,
  locale?: string,
): CategoryValidationResult {
  const trimmed = rawAnswer.trim();
  if (!trimmed) return { valid: true };

  const kind = detectCategoryKind(category);
  if (kind === "other") return { valid: true };

  const currentLocale = normalizeCategoryLocale(locale, category);

  // Cevabı analiz için anahtar kelimelere böl
  const fullFolded = foldForLookup(trimmed);
  const tokens = trimmed
    .split(/\s+/)
    .map(foldForLookup)
    .filter((tok) => tok.length > 0 && !STOP_WORDS.has(tok));

  // Arama için adaylar: hem tam ifade hem de tekil belirleyici sözcükler
  const candidates = [fullFolded, ...tokens];

  const hasIn = (set: Set<string> | ReadonlySet<string>) =>
    candidates.some((c) => set.has(c));

  switch (kind) {
    case "object": {
      // Eğer doğrudan bilinen bir eşyaysa kesinlikle geçer
      if (hasIn(OBJECTS_BY_LOCALE[currentLocale]) || hasIn(ALL_OBJECTS)) return { valid: true };


      // 1. Soyut kavramlar eşya olamaz (Kullanıcının karşılaştığı hata: Irrtum, Fikir, Zaman vb.)
      if (hasIn(ALL_ABSTRACT)) {
        return {
          valid: false,
          reasonCode: "abstractNotObject",
          defaultMessage: "Soyut kavram eşya sayılamaz",
        };
      }

      // 2. Hayvanlar eşya olamaz (Hund, Köpek, Dog)
      if (hasIn(ALL_ANIMALS)) {
        return {
          valid: false,
          reasonCode: "animalNotObject",
          defaultMessage: "Hayvan eşya sayılamaz",
        };
      }

      // 3. Şehirler ve Ülkeler eşya olamaz (Berlin, Deutschland, Ankara)
      if (hasIn(ALL_CITIES) || hasIn(ALL_COUNTRIES)) {
        return {
          valid: false,
          reasonCode: "placeNotObject",
          defaultMessage: "Şehir veya ülke eşya sayılamaz",
        };
      }

      return { valid: true };
    }

    case "animal": {
      // Doğrudan bilinen hayvansa geçer
      if (hasIn(ALL_ANIMALS)) return { valid: true };

      if (hasIn(ALL_ABSTRACT)) {
        return {
          valid: false,
          reasonCode: "abstractNotAnimal",
          defaultMessage: "Soyut kavram hayvan sayılamaz",
        };
      }

      // Yalnızca oyunun dilindeki açık ev eşyaları/mobilyaları hayvan olamaz
      // (Örn: Almanca Tisch, Stuhl; Türkçe Masa vb. Farklı dillerdeki homonimler çakışmasın)
      if (hasIn(OBJECTS_BY_LOCALE[currentLocale])) {
        return {
          valid: false,
          reasonCode: "objectNotAnimal",
          defaultMessage: "Eşya hayvan sayılamaz",
        };
      }

      if (hasIn(ALL_CITIES) || hasIn(ALL_COUNTRIES)) {
        return {
          valid: false,
          reasonCode: "placeNotAnimal",
          defaultMessage: "Şehir veya ülke hayvan sayılamaz",
        };
      }

      return { valid: true };
    }

    case "city": {
      // Doğrudan bilinen şehir ise geçer
      if (hasIn(ALL_CITIES)) return { valid: true };

      // Ülke şehir olarak yazılmışsa (ör. Deutschland, Türkiye, Frankreich, Italien)
      if (hasIn(ALL_COUNTRIES) && !hasIn(ALL_CITIES)) {
        return {
          valid: false,
          reasonCode: "countryNotCity",
          defaultMessage: "Ülke şehir sayılamaz",
        };
      }

      if (hasIn(ALL_ABSTRACT)) {
        return {
          valid: false,
          reasonCode: "abstractNotCity",
          defaultMessage: "Soyut kavram şehir sayılamaz",
        };
      }

      return { valid: true };
    }

    case "country": {
      // Doğrudan bilinen ülke ise geçer
      if (hasIn(ALL_COUNTRIES)) return { valid: true };

      // Şehir ülke olarak yazılmışsa (ör. Berlin, Paris, Ankara, London)
      if (hasIn(ALL_CITIES) && !hasIn(ALL_COUNTRIES)) {
        return {
          valid: false,
          reasonCode: "cityNotCountry",
          defaultMessage: "Şehir ülke sayılamaz",
        };
      }

      if (hasIn(ALL_ABSTRACT)) {
        return {
          valid: false,
          reasonCode: "abstractNotCountry",
          defaultMessage: "Soyut kavram ülke sayılamaz",
        };
      }

      return { valid: true };
    }

    case "plant_fruit": {
      if (hasIn(ALL_PLANTS_AND_FRUITS)) return { valid: true };

      if (hasIn(ALL_ANIMALS)) {
        return {
          valid: false,
          reasonCode: "animalNotPlant",
          defaultMessage: "Hayvan bitki sayılamaz",
        };
      }

      if (hasIn(OBJECTS_BY_LOCALE[currentLocale])) {
        return {
          valid: false,
          reasonCode: "objectNotPlant",
          defaultMessage: "Eşya bitki sayılamaz",
        };
      }

      if (hasIn(ALL_ABSTRACT)) {
        return {
          valid: false,
          reasonCode: "abstractNotPlant",
          defaultMessage: "Soyut kavram bitki sayılamaz",
        };
      }

      return { valid: true };
    }

    case "person_name": {
      if (hasIn(OBJECTS_BY_LOCALE[currentLocale])) {
        return {
          valid: false,
          reasonCode: "objectNotName",
          defaultMessage: "Eşya kişi adı sayılamaz",
        };
      }

      if (hasIn(ALL_ABSTRACT)) {
        return {
          valid: false,
          reasonCode: "abstractNotName",
          defaultMessage: "Soyut kavram kişi adı sayılamaz",
        };
      }

      return { valid: true };
    }

    case "river": {
      if (hasIn(ALL_RIVERS)) return { valid: true };
      if (hasIn(ALL_COUNTRIES)) {
        return {
          valid: false,
          reasonCode: "countryNotCity",
          defaultMessage: "Ülke nehir sayılamaz",
        };
      }
      if (hasIn(ALL_ABSTRACT)) {
        return {
          valid: false,
          reasonCode: "abstractNotCity",
          defaultMessage: "Soyut kavram nehir sayılamaz",
        };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

