import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

import { isHostOnline } from "../lib/liveness";
import { useLocale } from "../hooks/useLocale";
import type { Room } from "../types/database";

/**
 * TV ekranı sustuğunda misafirin telefonunda çıkan uyarı.
 *
 * Önceden host tarayıcısı kapanınca oda donuyordu ve misafir bunu hiç
 * öğrenemiyordu — ekranda bekleyip duruyordu. (`join.hostOffline` çevirisi
 * üç dilde hazırdı ama hiçbir yerde kullanılmıyordu.)
 *
 * Kendi sayacı var: host öldüğünde artık yeni oda snapshot'ı gelmiyor,
 * dolayısıyla bileşen kendiliğinden yeniden render olmazdı ve uyarı hiç
 * görünmezdi. Beş saniyede bir tazeleniyor.
 *
 * TV'nin saatini telefonun saatiyle kıyaslamıyor (bkz. isHostOnline):
 * `host_last_active` değerinin en son değiştiğini BU cihazın saatiyle ne
 * zaman gördüğümüzü tutuyor. Sayfa açıldığında sayaç o andan başlıyor;
 * yani zaten ölmüş bir host en geç eşik süresi sonunda fark ediliyor.
 */
export function HostOfflineBanner({ room }: { room: Room | null }) {
  const { t } = useLocale();
  const [now, setNow] = useState(() => Date.now());
  const beat = room?.host_last_active;
  const [seen, setSeen] = useState(() => ({ beat, at: now }));

  // Yeni sinyal geldi — render sırasında izlenen değeri güncelle (React'in
  // "prop değişince state'i ayarla" deseni; effect zincirleme render doğurur).
  if (beat !== seen.beat) setSeen({ beat, at: now });

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const lastChangeSeenAt = typeof beat === "number" ? seen.at : null;
  if (!room || isHostOnline(lastChangeSeenAt, now)) return null;

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[90] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-black font-black text-[11px] uppercase tracking-widest shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{t("join.hostOffline")}</span>
    </div>
  );
}
