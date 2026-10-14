/**
 * Neon Şifre: tahmin listesi ve kazanan. TV'deki dinleyici her anlık
 * görüntüde kazananı yeniden buluyordu; seçim belge kimliği sırasına göre
 * yapılıyordu ve puan her görüntüde yeniden ekleniyordu (bkz. HostVaultDisplay).
 */
import { toMillis } from "./timestamps";

export interface VaultGuess {
  player_id: string;
  data?: Record<string, string>;
  created_at?: Parameters<typeof toMillis>[0];
}

/** Ekrandaki liste: en yeni tahmin üstte (girdi değiştirilmez). */
export function newestFirst<T extends VaultGuess>(guesses: readonly T[]): T[] {
  return [...guesses].sort((a, b) => toMillis(b.created_at) - toMillis(a.created_at));
}

/** Kodu ilk bulan oyuncu (en erken doğru tahmin); yoksa null. */
export function vaultWinner(guesses: readonly VaultGuess[], code: string | undefined): string | null {
  if (!code) return null;
  const correct = guesses.filter((g) => g.data?.guess === code);
  if (correct.length === 0) return null;
  return correct.reduce((first, g) => (toMillis(g.created_at) < toMillis(first.created_at) ? g : first)).player_id;
}

export type VaultFeedback = "correct" | "present" | "absent";

/** Rastgele 4 haneli kasa kodu (1000–9999). */
export function newVaultCode(random: () => number = Math.random): string {
  return String(1000 + Math.floor(random() * 9000));
}

/**
 * Tahminin ipucu (Mastermind): doğru yerde rakam "correct", kodda başka
 * yerde varsa "present", yoksa "absent". Kod telefonda olmadığı için bunu
 * host hesaplıyor (bkz. HostVaultDisplay).
 */
export function vaultFeedback(guess: string, code: string): VaultFeedback[] {
  const feedback: VaultFeedback[] = Array(code.length).fill("absent");
  const codeChars: (string | null)[] = code.split("");
  const guessChars: (string | null)[] = guess.split("");
  for (let i = 0; i < code.length; i++) {
    if (guessChars[i] === codeChars[i]) {
      feedback[i] = "correct";
      codeChars[i] = null;
      guessChars[i] = null;
    }
  }
  for (let i = 0; i < code.length; i++) {
    if (guessChars[i] === null || guessChars[i] === undefined) continue;
    const index = codeChars.indexOf(guessChars[i]);
    if (index !== -1) {
      feedback[i] = "present";
      codeChars[index] = null;
    }
  }
  return feedback;
}
