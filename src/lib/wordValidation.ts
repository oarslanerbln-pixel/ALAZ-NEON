/**
 * Anlamsız cevap (gibberish) tespiti.
 *
 * Oyun şu ana kadar bir cevabı yalnızca "doğru harfle başlıyor mu" diye
 * kontrol ediyordu; "Kkkk" ya da "asdf" tam puan alıyordu. Tam bir Türkçe
 * sözlük paketlemek hem megabaytlarca yük hem de kategoriler serbest metin
 * olduğu için ("Şehir", "Ünlü biri") tek başına yeterli değil.
 *
 * Bunun yerine dilden bağımsız, ucuz ve yüksek isabetli sinyallere bakıyoruz.
 * Sonuç BAĞLAYICI DEĞİL: puanlama bunu "şüpheli" olarak işaretler, son söz
 * host'ta kalır — zaten inceleme ekranında her cevap tek tıkla onaylanabiliyor.
 */

const TURKISH_VOWELS = "aeıioöuü";

/** Klavye sıraları — "asdf", "qwerty" gibi ezmeleri yakalamak için. */
const KEYBOARD_ROWS = ["qwertyuıopğü", "asdfghjklşi", "zxcvbnmöç"];

const MIN_KEYBOARD_RUN = 4;

function normalize(word: string): string {
  return word.trim().toLocaleLowerCase("tr-TR");
}

function hasVowel(word: string): boolean {
  return word.split("").some((ch) => TURKISH_VOWELS.includes(ch));
}

/** "kkkk" gibi aynı harfin üç ve daha fazla üst üste tekrarı. */
function hasExcessiveRepeat(word: string): boolean {
  return /(.)\1{2,}/u.test(word);
}

/** Beş ve daha fazla ünsüzün art arda gelmesi Türkçede pratikte imkânsız. */
function hasImpossibleConsonantRun(word: string): boolean {
  let run = 0;
  for (const ch of word) {
    if (/\p{L}/u.test(ch) && !TURKISH_VOWELS.includes(ch)) {
      run += 1;
      if (run >= 5) return true;
    } else {
      run = 0;
    }
  }
  return false;
}

/** Klavyede yan yana duran harflerin arka arkaya yazılması. */
function hasKeyboardRun(word: string): boolean {
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i + MIN_KEYBOARD_RUN <= row.length; i++) {
      const slice = row.slice(i, i + MIN_KEYBOARD_RUN);
      const reversed = slice.split("").reverse().join("");
      if (word.includes(slice) || word.includes(reversed)) return true;
    }
  }
  return false;
}

/**
 * "asdasd", "abcabc" gibi kısa bir parçanın tekrarından ibaret kelimeler.
 * Birim uzunluğunu 3'ten başlatıyoruz; aksi hâlde "mama", "gaga" gibi gerçek
 * kelimeler yanardı.
 */
function isRepeatedUnit(word: string): boolean {
  if (word.length < 6) return false;
  for (let unit = 3; unit <= word.length / 2; unit++) {
    if (word.length % unit !== 0) continue;
    const head = word.slice(0, unit);
    if (word.match(new RegExp(`^(${head})+$`, "u"))) return true;
  }
  return false;
}

export interface GibberishVerdict {
  isGibberish: boolean;
  /** Host'a gösterilebilecek kısa gerekçe. */
  reason?: "tooShort" | "noVowel" | "repeatedLetters" | "consonantRun" | "keyboardMash" | "repeatedPattern";
}

/**
 * Bir cevabın anlamsız görünüp görünmediğini değerlendirir.
 * Boş cevap gibberish DEĞİLDİR — o ayrı bir durum (oyuncu yetişememiş).
 */
export function analyzeGibberish(rawWord: string): GibberishVerdict {
  const word = normalize(rawWord);
  if (!word) return { isGibberish: false };

  // Çok kelimeli cevaplarda ("New York") her parçayı ayrı değerlendirip
  // herhangi biri şüpheliyse tamamını işaretliyoruz.
  const tokens = word.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    for (const token of tokens) {
      const verdict = analyzeGibberish(token);
      if (verdict.isGibberish) return verdict;
    }
    return { isGibberish: false };
  }

  // Sıra önemli: en açıklayıcı gerekçe önce dönsün. "Kkkk" hem tekrarlı hem
  // ünlüsüz; host'a "tekrarlanan harf" demek "ünlü yok" demekten anlaşılır.
  if (word.length < 2) return { isGibberish: true, reason: "tooShort" };
  if (hasExcessiveRepeat(word)) return { isGibberish: true, reason: "repeatedLetters" };
  if (hasKeyboardRun(word)) return { isGibberish: true, reason: "keyboardMash" };
  if (isRepeatedUnit(word)) return { isGibberish: true, reason: "repeatedPattern" };
  if (!hasVowel(word)) return { isGibberish: true, reason: "noVowel" };
  if (hasImpossibleConsonantRun(word)) return { isGibberish: true, reason: "consonantRun" };

  return { isGibberish: false };
}

/** Kısa yol: yalnızca sonuç lazımsa. */
export function looksLikeGibberish(word: string): boolean {
  return analyzeGibberish(word).isGibberish;
}
