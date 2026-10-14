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
