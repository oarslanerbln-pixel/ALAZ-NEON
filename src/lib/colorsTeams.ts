/**
 * Neon Savaşları takım kurulumu. Panodan başlatılan oyun bunu atlıyordu:
 * takımlar oyuncu kimliğinin son karakterinden çıkıyor (2 oyuncu aynı
 * takıma düşebiliyordu) ve hedef oyuncu sayısına göre ayarlanmıyordu.
 */
export type ColorsTeam = "red" | "blue";

/** Oyuncuları karıştırıp sırayla kırmızı/mavi dağıtır: takımlar en fazla bir kişi farklı. */
export function assignColorsTeams(
  playerIds: readonly string[],
  random: () => number = Math.random,
): Record<string, ColorsTeam> {
  // Fisher–Yates: `sort(() => random() - 0.5)` eşit olasılıklı karıştırmıyor.
  const shuffled = [...playerIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return Object.fromEntries(shuffled.map((id, index) => [id, index % 2 === 0 ? "red" : "blue"]));
}

/** Çubuğun bir uca dayanması için gereken dokunuş farkı. */
export function colorsTargetClicks(playerCount: number): number {
  return Math.max(80, playerCount * 35);
}
