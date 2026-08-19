/**
 * Türkçe küfür/hakaret sözlüğü.
 *
 * Bu liste bir moderasyon filtresi için var: oyuncuların yazdığı kelimeler
 * halka açık bir mekânda dev ekrana basılıyor, dolayısıyla filtresiz bırakmak
 * işletme için itibar riski.
 *
 * İki ayrı liste tutulmasının sebebi yanlış pozitifler:
 *
 * - `PROFANITY_PREFIX_TR` önek olarak eşleşir. Türkçe sondan eklemeli bir dil
 *   olduğu için ("sikeyim", "orospunun") kök + ek biçimlerini yakalamanın tek
 *   pratik yolu bu. Kelimenin ORTASINDA arama yapmıyoruz; "psikoloji" gibi
 *   masum kelimeler aksi hâlde yanardı.
 *
 * - `PROFANITY_EXACT_TR` yalnızca kelimenin tamamı eşleşirse yakalar. Kısa
 *   köklerde önek eşleşmesi felaket olurdu: "am" öneki "ama", "amaç", "amca"
 *   kelimelerini de yakalardı.
 *
 * `PROFANITY_ALLOWLIST_TR` ise önek listesiyle çakışan masum kelimeleri
 * kurtarır ("siklet", "götürmek" gibi).
 */

/** Yalnızca kelimenin tamamı bunlarsa küfür sayılır. */
export const PROFANITY_EXACT_TR: readonly string[] = [
  "am",
  "aq",
  "mk",
  "oc",
  "oç",
  "sg",
  "syg",
];

/** Bu köklerle BAŞLAYAN kelimeler küfür sayılır (ek almış hâlleri dahil). */
export const PROFANITY_PREFIX_TR: readonly string[] = [
  "amk",
  "amck",
  "amcik",
  "amcık",
  "ananı",
  "anani",
  "avrat",
  "dalyarak",
  "dangalak",
  "embesil",
  "gavat",
  "gerizekalı",
  "gerizekali",
  "göt",
  "got",
  "ibne",
  "kahpe",
  "kaltak",
  "orospu",
  "pezeven",
  "piç",
  "pic",
  "puşt",
  "pust",
  "salak",
  "sikik",
  "sikim",
  "sike",
  "siker",
  "sikey",
  "siki",
  "siktir",
  "sürtük",
  "surtuk",
  "şerefsiz",
  "serefsiz",
  "yarrak",
  "yarak",
  "yavşak",
  "yavsak",
];

/**
 * Önek listesiyle çakışan ama tamamen masum olan kelimeler.
 * Bunlar da önek olarak değerlendirilir ("götürmek", "götürdü" hepsi geçer).
 */
export const PROFANITY_ALLOWLIST_TR: readonly string[] = [
  "sikke",
  "siklet",
  "siklon",
  "sikloid",
  "götür",
  "gotur",
  "gotik",
  "salakça", // hakaret değil, sıfat kullanımı — host isterse elle reddeder
];
