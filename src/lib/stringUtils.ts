/**
 * Normalizes a string for Turkish character matching and case-insensitivity.
 */
export const normalizeTL = (str: string): string => {
  return str.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase().trim();
};

/**
 * Checks if a word starts with the given letter, considering Turkish characters.
 */
export const startsWithLetter = (word: string, letter: string): boolean => {
  if (!word || !letter) return false;
  return normalizeTL(word).startsWith(normalizeTL(letter));
};

/**
 * Validates a list of answers against a letter.
 */
export const validateAnswer = (answer: string, letter: string): boolean => {
  const val = normalizeTL(answer);
  return !!val && val.startsWith(normalizeTL(letter));
};
