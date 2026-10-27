/**
 * Telefon arka planı: tek, küçük, nötr (gri tonlu) bir webp ve üstünde koyu
 * katman. Eskiden 3 × ~800 KB PNG 8 sn'de bir çapraz geçişle değişip
 * yakınlaşıyordu; kafe wifi'sinde ilk açılışı yavaşlatıyor, tek vurgu
 * rengiyle de çatışıyordu. Telefonda video/Three.js yok (bkz. görsel dil).
 */
export function PlayerBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-bg pointer-events-none" aria-hidden="true">
      <img src="/player-bg.webp" alt="" decoding="async" className="w-full h-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/80 to-bg" />
    </div>
  );
}
