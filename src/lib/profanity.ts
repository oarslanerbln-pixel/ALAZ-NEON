import {
  PROFANITY_EXACT_TR,
  PROFANITY_PREFIX_TR,
  PROFANITY_ALLOWLIST_TR,
} from "../data/profanityTr";

/**
 * Küfür/hakaret filtresi.
 *
 * Oyuncuların yazdığı her şey host ekranında (kafede dev ekran) gösteriliyor,
 * bu yüzden gösterimden önce buradan geçmesi gerekiyor.
 */

/** Yaygın kaçamak yazımları düz harfe indirger: "s1k", "$ik", "s.i.k" → "sik". */
const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  $: "s",
  "!": "i",
  "*": "",
};

/**
 * Eşleştirme için metni sadeleştirir: küçük harfe indirir, leet karakterleri
 * çevirir, harf olmayan her şeyi atar ("a.m.k" → "amk") ve üç+ tekrarı ikiye
 * indirir.
 *
 * Tekrarları tek harfe İNDİRMİYORUZ: "sikke" → "sike" olurdu ve masum kelime
 * küfür köküyle çakışırdı. Uzatarak kaçma girişimi ("siiiktir") ayrıca
 * `fullyCollapse` ile ele alınıyor.
 */
export function normalizeForProfanity(input: string): string {
  if (!input) return "";

  const leetResolved = input
    .toLocaleLowerCase("tr-TR")
    .split("")
    .map((ch) => (ch in LEET_MAP ? LEET_MAP[ch] : ch))
    .join("");

  // Harf dışındaki her şeyi (nokta, boşluk, tire, alt çizgi) at — kaçamak
  // yazımların çoğu araya ayraç sıkıştırarak çalışıyor.
  const lettersOnly = leetResolved.replace(/[^\p{L}]/gu, "");

  // Üç ve daha fazla tekrarı ikiye indir.
  return lettersOnly.replace(/(.)\1{2,}/gu, "$1$1");
}

/** Tüm tekrarları tek harfe indirir: "siiktir" → "siktir". */
function fullyCollapse(token: string): string {
  return token.replace(/(.)\1+/gu, "$1");
}

function isAllowlisted(token: string): boolean {
  return PROFANITY_ALLOWLIST_TR.some((safe) => token.startsWith(safe));
}

function matchesRoot(token: string): boolean {
  if (!token) return false;
  if (PROFANITY_EXACT_TR.includes(token)) return true;
  return PROFANITY_PREFIX_TR.some((root) => token.startsWith(root));
}

/**
 * Tek bir sadeleştirilmiş jetonun küfür olup olmadığını söyler.
 *
 * Beyaz liste, tekrarları korunmuş hâl üzerinden değerlendirilir ("sikke"
 * burada hâlâ "sikke"); eşleşme ise hem bu hâlde hem de tekrarları tamamen
 * kırpılmış hâlde aranır, böylece "siiiktir" de yakalanır.
 */
function isProfaneToken(token: string): boolean {
  if (!token) return false;
  if (isAllowlisted(token)) return false;
  return matchesRoot(token) || matchesRoot(fullyCollapse(token));
}

/**
 * Metinde küfür geçip geçmediğini söyler.
 *
 * Hem kelime kelime hem de tüm metin bitişik hâlde kontrol edilir; ikincisi
 * araya boşluk serpiştirerek filtreyi atlatmayı ("a m k") engelliyor.
 */
export function containsProfanity(input: string): boolean {
  if (!input) return false;

  const tokens = input.split(/\s+/).filter(Boolean);
  if (tokens.some((token) => isProfaneToken(normalizeForProfanity(token)))) {
    return true;
  }

  const collapsed = normalizeForProfanity(input);
  // Boşlukları kaldırınca oluşan birleşik hâli yalnızca çok jetonlu girdide
  // ayrıca kontrol ediyoruz; tek jetonda yukarıdaki döngü zaten baktı.
  return tokens.length > 1 && isProfaneToken(collapsed);
}

/**
 * Küfürlü metni ekranda gösterilebilir hâle getirir: ilk harf kalır, gerisi
 * yıldız olur. Host'un neyin reddedildiğini görebilmesi için tamamen silmiyoruz.
 */
export function maskProfanity(input: string): string {
  if (!input) return "";

  return input
    .split(/(\s+)/)
    .map((chunk) => {
      if (!chunk.trim()) return chunk;
      if (!isProfaneToken(normalizeForProfanity(chunk))) return chunk;
      const visible = chunk.trim().charAt(0);
      return visible + "*".repeat(Math.max(2, chunk.trim().length - 1));
    })
    .join("");
}

/**
 * Gösterim için güvenli hâle getirir: küfür varsa maskeler, yoksa dokunmaz.
 * Host ekranındaki her oyuncu üretimi metin bundan geçmeli.
 */
export function safeForDisplay(input: string): string {
  return containsProfanity(input) ? maskProfanity(input) : input;
}
