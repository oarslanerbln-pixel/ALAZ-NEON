/**
 * Normalizes a string for locale-specific character matching and case-insensitivity.
 */
export const normalizeTL = (str: string, locale: string = "tr"): string => {
  if (!str) return "";
  const s = str.trim();
  if (locale.startsWith("tr")) {
    return s.replace(/İ/g, "i").replace(/I/g, "ı").toLocaleLowerCase("tr-TR");
  } else if (locale.startsWith("de")) {
    return s.toLocaleLowerCase("de-DE");
  }
  return s.toLowerCase();
};

/**
 * Dile duyarlı büyük harfe çevirme.
 *
 * JavaScript'in `toUpperCase()` metodu dilden bağımsız çalışır ve Türkçe'nin
 * noktalı/noktasız i kuralını bilmez: "giriş" → "GIRIŞ" (yanlış), doğrusu
 * "GİRİŞ". Arayüz büyük harf ağırlıklı olduğu için bu fark ekranda doğrudan
 * göze çarpıyor. CSS `text-transform` <html lang> sayesinde zaten doğru
 * davranıyor; bu yardımcı ise metni JS tarafında çevirmek gerektiğinde.
 */
export const upperTL = (str: string, locale: string = "tr"): string => {
  if (!str) return "";
  return str.toLocaleUpperCase(locale.startsWith("de") ? "de-DE" : "tr-TR");
};

/**
 * Checks if a word starts with the given letter, considering locale rules.
 */
export const startsWithLetter = (word: string, letter: string, locale: string = "tr"): boolean => {
  if (!word || !letter) return false;
  return normalizeTL(word, locale).startsWith(normalizeTL(letter, locale));
};

/**
 * Validates a list of answers against a letter.
 */
export const validateAnswer = (answer: string, letter: string, locale: string = "tr"): boolean => {
  const val = normalizeTL(answer, locale);
  return !!val && val.startsWith(normalizeTL(letter, locale));
};
