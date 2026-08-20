import type { Locale } from "./i18n";

/**
 * `locale` uygulama genelinde tek bir kaynaktan geliyor (useLocale/i18n) —
 * arayüz dili İngilizce'ye çıkınca bu fonksiyon hâlâ yalnızca "de" / diğer
 * her şey" ayrımı yapıyorsa İngilizce arayüzde sessizce Türkçe kategori
 * önayarları görünürdü. Üç dili de ayrı ayrı ele alarak bu boşluğu kapatıyor.
 *
 * "Türk Klasiği 🦅" kültürel bir önayar; Almanca sürümde de karşılığı yok,
 * İngilizcede de bilerek eklenmedi.
 */
const PRESETS_DE: Record<string, string[]> = {
  "Klassisch 🏛️": ["Stadt", "Land", "Name", "Gegenstand", "Tier"],
  "Natur 🌿": ["Pflanze", "Tier", "Fluss", "Berg", "Frucht"],
  "Popkultur 🎬": ["Film", "Sänger", "Marke", "Essen", "Charakter"],
  "Expertenmodus 🔥": ["Fabelwesen", "Nobelpreisträger", "Chemisches Element", "Hauptstadt", "Sportbegriff"],
  "Nachtleben 🍹": ["Cocktail", "Nachtclub", "DJ", "Snack", "Getränkemarke"],
  "Café / Bistro ☕": ["Kaffeeart", "Dessert", "Küchengerät", "Mitarbeiter", "Frühstück"],
};

const PRESETS_TR: Record<string, string[]> = {
  "Klasik 🏛️": ["Şehir", "Ülke", "İsim", "Eşya", "Hayvan"],
  "Doğa 🌿": ["Bitki", "Hayvan", "Nehir", "Dağ", "Meyve"],
  "Pop Kültürü 🎬": ["Film", "Şarkıcı", "Marka", "Yiyecek", "Karakter"],
  "Türk Klasiği 🦅": ["Türk Şehri", "Türk İsmi", "Yemek", "Tarihi Yer", "Türk Filmi"],
  "Zor Mod 🔥": ["Mitolojik Varlık", "Nobel Ödüllüsü", "Kimyasal Element", "Başkent", "Spor Terimi"],
  "Gece Hayatı 🍹": ["Kokteyl", "Gece Kulübü", "Popüler DJ", "Gece Atıştırmalığı", "İçecek Markası"],
  "Kafe / Bistro ☕": ["Kahve Çeşidi", "Tatlı", "Mutfak Ekipmanı", "Çalışan Unvanı", "Kahvaltılık"],
};

const PRESETS_EN: Record<string, string[]> = {
  "Classic 🏛️": ["City", "Country", "Name", "Object", "Animal"],
  "Nature 🌿": ["Plant", "Animal", "River", "Mountain", "Fruit"],
  "Pop Culture 🎬": ["Movie", "Singer", "Brand", "Food", "Character"],
  "Expert Mode 🔥": ["Mythological Being", "Nobel Laureate", "Chemical Element", "Capital City", "Sports Term"],
  "Nightlife 🍹": ["Cocktail", "Nightclub", "DJ", "Late-Night Snack", "Drink Brand"],
  "Café / Bistro ☕": ["Coffee Type", "Dessert", "Kitchen Tool", "Job Title", "Breakfast Item"],
};

const PRESETS_BY_LOCALE: Record<Locale, Record<string, string[]>> = {
  de: PRESETS_DE,
  tr: PRESETS_TR,
  en: PRESETS_EN,
};

export const getCategoryPresets = (locale: Locale): Record<string, string[]> =>
  PRESETS_BY_LOCALE[locale] ?? PRESETS_TR;
