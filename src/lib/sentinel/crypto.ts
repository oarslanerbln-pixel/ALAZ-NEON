/**
 * Sentinel Cryptography & Sanitization Module
 * Protects the game from XSS, SQLi-like payloads, and malicious text inputs.
 */

const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /onerror=/gi,
  /onload=/gi,
  /onclick=/gi,
  /<iframe/gi,
  /UNION SELECT/gi,
  /DROP TABLE/gi,
];

export class SentinelCrypto {
  /**
   * Sanitizes user input by stripping malicious HTML/JS patterns
   * and encoding basic HTML entities to prevent rendering attacks.
   */
  static sanitizePayload(input: string): string {
    if (!input || typeof input !== "string") return "";

    let sanitized = input;

    // 1. Remove obvious suspicious patterns (Basic XSS & SQLi heuristic)
    for (const pattern of SUSPICIOUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[ENGELLENDİ]");
    }

    // 2. Escape HTML entities for safe rendering in React
    // React normally escapes by default, but this adds a defense-in-depth layer
    // especially if answers are ever used in dangerous contexts.
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    // 3. Trim excessive whitespace that bots might use to bypass length limits
    sanitized = sanitized.trim().replace(/\s{2,}/g, " ");

    return sanitized;
  }

  /**
   * Generates a simple hash for future dictionary validation.
   * (Placeholder for future cryptographic dictionary sync)
   */
  static generateHash(word: string): string {
    let hash = 0;
    const cleanWord = word.trim().toUpperCase();
    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}
