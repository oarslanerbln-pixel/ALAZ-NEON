import { upperTL } from "./stringUtils";

/** TV lobisindeki oyuncu duvarı: tek sütun, sekiz satır (en kısa lobiye sığan sayı). */
export const LOBBY_WALL_SLOTS = 8;

export interface LobbyWall<T> {
  /** Katılım sırasıyla, ekranda adı görünen oyuncular. */
  shown: T[];
  /** Sığmadığı için son hücredeki sayaca kalanlar. */
  hidden: number;
}

/**
 * Lobide hangi isimlerin görüneceğini seçer. Herkes sığıyorsa hepsi, katılım
 * sırasıyla. Sığmıyorsa son hücre "+N" sayacına ayrılır ve en yeni katılanlar
 * gösterilir: misafir QR'ı okuttuğunda adını TV'de görmeli, salon dolu diye
 * görünmez kalmamalı.
 */
export function lobbyWall<T extends { created_at: number }>(players: readonly T[], slots: number): LobbyWall<T> {
  const ordered = [...players].sort((a, b) => a.created_at - b.created_at);
  const capacity = Math.max(1, Math.floor(slots));
  if (ordered.length <= capacity) return { shown: ordered, hidden: 0 };

  const named = capacity - 1;
  return {
    shown: named > 0 ? ordered.slice(-named) : [],
    hidden: ordered.length - named,
  };
}

/**
 * Rozetteki iki harf. Kod noktasına göre bölünür: `substring(0, 2)` emoji ile
 * başlayan adı vekil çiftin ortasından kesip bozuk karakter basıyordu.
 */
export function initialsOf(nickname: string, locale: string = "tr"): string {
  const letters = Array.from(nickname.trim()).slice(0, 2).join("");
  return letters ? upperTL(letters, locale) : "?";
}
