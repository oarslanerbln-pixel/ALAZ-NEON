import type { Answer, Player } from "../types/database";

/**
 * Kelime Arenası'nda "bu cevap hangi tura ait" sorusunun tek cevap yeri.
 *
 * Odanın `answers` koleksiyonu gece boyunca biriken HER oyunun cevaplarını
 * tutuyor (quiz, kasa, ayna…). Host yalnızca oda kimliğine göre dinlediği
 * için eskiden şu iki hata oluşuyordu:
 *
 * 1. Host sayfası tur ortasında yenilenince ilk anlık görüntü odadaki TÜM
 *    geçmiş cevapları "yeni" diye getiriyor, "herkes cevapladı" sayacı dolu
 *    başlıyor ve tur ~1 saniye sonra erken kapanıyordu.
 * 2. Tur kapanırken cevaplar yalnızca harfe göre çekiliyordu; aynı harf
 *    önceki bir oyunda da çıktıysa oyuncunun ESKİ cevabı (en erken olduğu
 *    için) yeni cevabının yerine puanlanıyordu.
 */
export type RoundAnswerRef = Pick<Answer, "player_id" | "round_letter" | "round_index">;

export function isAnswerForRound(
  answer: RoundAnswerRef,
  letter: string | null | undefined,
  round: number | null | undefined,
): boolean {
  if (!letter || answer.round_letter !== letter) return false;
  // round_index eklenmeden önce yazılmış kayıtlarda alan yok: yalnızca harfe
  // bakılabiliyor (eski davranış).
  if (answer.round_index === undefined || round === undefined || round === null) return true;
  return answer.round_index === round;
}

/** Bu tura cevap göndermiş oyuncuların kimlikleri (tekrarsız). */
export function submittedPlayerIdsForRound(
  answers: Iterable<RoundAnswerRef>,
  letter: string | null | undefined,
  round: number | null | undefined,
): string[] {
  const ids = new Set<string>();
  for (const answer of answers) {
    if (isAnswerForRound(answer, letter, round)) ids.add(answer.player_id);
  }
  return [...ids];
}

/**
 * Odadaki her oyuncu cevap gönderdi mi.
 *
 * Sayı karşılaştırması (`gönderen >= oyuncu`) yetmiyor: odadan çıkmış bir
 * oyuncunun cevabı sayıyı şişirip turu, hâlâ yazan birini beklemeden
 * kapatabiliyordu. Her oyuncu tek tek aranıyor.
 */
export function haveAllPlayersSubmitted(
  players: readonly Pick<Player, "id">[],
  submittedIds: readonly string[],
): boolean {
  if (players.length === 0) return false;
  const submitted = new Set(submittedIds);
  return players.every((p) => submitted.has(p.id));
}
