import type { ReactNode } from "react";

/**
 * Oyun kumandalarının ortak kabı: ekranı tam dolduran bir esnek sütun.
 *
 * Kumandaların çoğu kök elemanında `flex-1` / `h-full` kullanıyor, yani
 * yüksekliği ebeveynden bekliyor. Eskiden PlayerGame onları kapsız render
 * ediyordu; içeriği `absolute` olan Spectrum'un yüksekliği sıfıra iniyor ve
 * misafir oyunun ortasında simsiyah bir ekran görüyordu. Doğrudan çocuk
 * her zaman kalan alanı kaplar (`[&>*]:flex-1`).
 */
export function PlayerGameShell({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] flex flex-col bg-black text-white [&>*]:flex-1">{children}</div>;
}
