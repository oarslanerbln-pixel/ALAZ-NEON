/**
 * Çark sonucu: dilim ağırlıklarına göre bir indeks.
 *
 * TV'de (host) çalışır; dilimler mekânın ödülleri olduğu için sonucu
 * misafirin telefonu seçmemeli (bkz. firestore.rules → isWheelSpinRequest).
 * `rand` [0, 1) aralığında; test için enjekte ediliyor.
 */
export function pickWeightedIndex(weights: readonly number[], rand: number = Math.random()): number {
  const safe = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const total = safe.reduce((a, b) => a + b, 0);
  if (safe.length === 0) return 0;
  // Hepsi sıfır/geçersizse eşit dağılım.
  if (total === 0) return Math.min(safe.length - 1, Math.floor(rand * safe.length));
  let remaining = rand * total;
  for (let i = 0; i < safe.length; i++) {
    remaining -= safe[i];
    if (remaining < 0) return i;
  }
  // Kayan nokta artığı: son pozitif ağırlıklı dilim.
  for (let i = safe.length - 1; i >= 0; i--) if (safe[i] > 0) return i;
  return 0;
}
