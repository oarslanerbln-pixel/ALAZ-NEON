import { collection, doc, getDocs, increment, query, runTransaction, where } from "firebase/firestore";

import { db } from "../../../lib/firebase";
import { aynaRoundKey, parseGuess, scoreGuess } from "../../../lib/ayna";
import { aynaQuestionById } from "../../../lib/aynaQuestions";
import { toMillis } from "../../../lib/timestamps";
import type { Answer, Room } from "../../../types/database";

/**
 * AYNA'nın host tarafı durum geçişleri.
 *
 * Her geçiş bir transaction içinde "hâlâ beklediğim durumda mıyım?" diye
 * bakıyor. Otomatik ilerleme zamanlayıcıları React'in StrictMode'unda iki
 * kez tetiklenebiliyor, mekânda da TV ile tabletin aynı odayı açık tutması
 * mümkün. Kontrol olmasa aynı soru iki kez puanlanır ya da bir soru atlanırdı.
 */

type Expectation = { status: Room["status"]; index: number };

async function guardedUpdate(roomId: string, expect: Expectation, updates: Partial<Room>): Promise<boolean> {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, "rooms", roomId);
    const snap = await tx.get(ref);
    const data = snap.data() as Room | undefined;
    if (!data || data.status !== expect.status || (data.ayna_index ?? 0) !== expect.index) return false;
    tx.update(ref, updates);
    return true;
  });
}

/** Tanıtım bitti → ilk soru. */
export function startAynaQuestions(room: Room): Promise<boolean> {
  return guardedUpdate(room.id, { status: "ayna_intro", index: room.ayna_index ?? 0 }, {
    status: "ayna_active",
    round_end_time: Date.now() + (room.timer_setting || 25) * 1000,
    ayna_round_guesses: {},
    ayna_round_points: {},
  });
}

/**
 * Süre doldu (ya da herkes kilitledi) → tahminleri topla, puanla, açıkla.
 *
 * Cevaplar transaction dışında okunuyor (istemci transaction'ı sorgu
 * çalıştıramıyor). Her oyuncunun İLK cevabı geçerli; odadan çıkmış
 * oyuncuların dokümanı artık olmayabileceği için yalnızca `playerIds`
 * içindekiler puanlanıyor — olmayan bir dokümana yazmak tüm transaction'ı
 * düşürürdü.
 */
export async function revealAynaRound(room: Room, playerIds: ReadonlySet<string>): Promise<boolean> {
  const index = room.ayna_index ?? 0;
  const question = aynaQuestionById(room.ayna_question_ids?.[index]);
  if (!question) return false;

  const snapshot = await getDocs(
    query(collection(db, "answers"), where("room_id", "==", room.id), where("round_letter", "==", aynaRoundKey(index))),
  );
  const answers = snapshot.docs
    .map((d) => d.data() as Answer)
    .sort((a, b) => toMillis(a.created_at) - toMillis(b.created_at));

  const guesses: Record<string, number> = {};
  for (const answer of answers) {
    if (!playerIds.has(answer.player_id) || answer.player_id in guesses) continue;
    const guess = parseGuess(answer.data?.guess);
    if (guess !== null) guesses[answer.player_id] = guess;
  }

  const points: Record<string, number> = {};
  for (const [playerId, guess] of Object.entries(guesses)) {
    points[playerId] = scoreGuess(guess, question.answer);
  }

  return runTransaction(db, async (tx) => {
    const roomRef = doc(db, "rooms", room.id);
    const snap = await tx.get(roomRef);
    const data = snap.data() as Room | undefined;
    if (!data || data.status !== "ayna_active" || (data.ayna_index ?? 0) !== index) return false;
    if ((data.ayna_scored_through ?? -1) >= index) return false;

    const totals: Record<string, ReturnType<typeof increment>> = {};
    for (const [playerId, p] of Object.entries(points)) {
      if (p <= 0) continue;
      tx.update(doc(db, "players", playerId), { total_score: increment(p) });
      totals[`ayna_totals.${playerId}`] = increment(p);
    }

    tx.update(roomRef, {
      status: "ayna_reveal",
      ayna_round_guesses: guesses,
      ayna_round_points: points,
      ayna_scored_through: index,
      ...totals,
    });
    return true;
  });
}

/** Açıklama bitti → sonraki soru ya da gecenin aynası. */
export function advanceAyna(room: Room): Promise<boolean> {
  const index = room.ayna_index ?? 0;
  const total = room.ayna_question_ids?.length ?? 0;
  const expect = { status: "ayna_reveal" as const, index };
  if (index + 1 >= total) {
    return guardedUpdate(room.id, expect, { status: "ayna_final" });
  }
  return guardedUpdate(room.id, expect, {
    status: "ayna_active",
    ayna_index: index + 1,
    round_end_time: Date.now() + (room.timer_setting || 25) * 1000,
    ayna_round_guesses: {},
    ayna_round_points: {},
  });
}
