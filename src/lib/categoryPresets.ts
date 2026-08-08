import type { Locale } from "./i18n";

export const getCategoryPresets = (locale: Locale): Record<string, string[]> => {
  if (locale === "de") {
    return {
      "Klassisch 🏛️": ["Stadt", "Land", "Name", "Gegenstand", "Tier"],
      "Natur 🌿": ["Pflanze", "Tier", "Fluss", "Berg", "Frucht"],
      "Popkultur 🎬": ["Film", "Sänger", "Marke", "Essen", "Charakter"],
      "Expertenmodus 🔥": ["Fabelwesen", "Nobelpreisträger", "Chemisches Element", "Hauptstadt", "Sportbegriff"],
      "Nachtleben 🍹": ["Cocktail", "Nachtclub", "DJ", "Snack", "Getränkemarke"],
      "Café / Bistro ☕": ["Kaffeeart", "Dessert", "Küchengerät", "Mitarbeiter", "Frühstück"],
    };
  }

  return {
    "Klasik 🏛️": ["Şehir", "Ülke", "İsim", "Eşya", "Hayvan"],
    "Doğa 🌿": ["Bitki", "Hayvan", "Nehir", "Dağ", "Meyve"],
    "Pop Kültürü 🎬": ["Film", "Şarkıcı", "Marka", "Yiyecek", "Karakter"],
    "Türk Klasiği 🦅": ["Türk Şehri", "Türk İsmi", "Yemek", "Tarihi Yer", "Türk Filmi"],
    "Zor Mod 🔥": ["Mitolojik Varlık", "Nobel Ödüllüsü", "Kimyasal Element", "Başkent", "Spor Terimi"],
    "Gece Hayatı 🍹": ["Kokteyl", "Gece Kulübü", "Popüler DJ", "Gece Atıştırmalığı", "İçecek Markası"],
    "Kafe / Bistro ☕": ["Kahve Çeşidi", "Tatlı", "Mutfak Ekipmanı", "Çalışan Unvanı", "Kahvaltılık"],
  };
};
