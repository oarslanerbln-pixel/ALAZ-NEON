/**
 * Oyuncu girişleri: rooms/{roomId}/inputs/{playerId} (bkz. firestore.rules).
 *
 * Echo oyu ve pulse dokunuşu eskiden oda dokümanındaki haritalara
 * yazılıyordu. Her oy odadaki her telefona bir okuma olarak yayılıyordu ve
 * haritanın tamamı başkasının oyunu ezecek şekilde yazılabiliyordu. Artık
 * her oyuncu yalnızca kendi kaydına, host'un açtığı tur (`rooms.input_round`)
 * için bir kez yazıyor. Kayıtları yalnızca host dinliyor ve sonucu reveal
 * anında odaya o yazıyor; oyuncu ekranları sonucu oradan okumaya devam ediyor.
 *
 * Kayıt her tur üzerine yazıldığı için eski turun girişi kayıtta durabilir:
 * okuyan taraf her zaman tur numarasına bakmalı.
 */
export interface RoomInput {
  round?: number;
  echo_vote?: string;
  pulse_click?: number;
}

/** Kayıt bu tura mı ait. Tur açılmamışsa (`round` yoksa) hiçbir kayıt sayılmaz. */
export function isInputForRound(
  input: RoomInput | null | undefined,
  round: number | null | undefined,
): input is RoomInput {
  return input != null && typeof round === "number" && input.round === round;
}

/** Bu turun echo oyları: oy veren oyuncu → oy verilen oyuncu. */
export function echoVotesFromInputs(
  inputs: Readonly<Record<string, RoomInput>>,
  round: number | null | undefined,
): Record<string, string> {
  const votes: Record<string, string> = {};
  for (const [playerId, input] of Object.entries(inputs)) {
    if (isInputForRound(input, round) && typeof input.echo_vote === "string") {
      votes[playerId] = input.echo_vote;
    }
  }
  return votes;
}

/** Bu turun pulse dokunuşları: oyuncu → dokunuş anı (epoch ms). */
export function pulseClicksFromInputs(
  inputs: Readonly<Record<string, RoomInput>>,
  round: number | null | undefined,
): Record<string, number> {
  const clicks: Record<string, number> = {};
  for (const [playerId, input] of Object.entries(inputs)) {
    if (isInputForRound(input, round) && typeof input.pulse_click === "number") {
      clicks[playerId] = input.pulse_click;
    }
  }
  return clicks;
}
