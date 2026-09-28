import { collection, doc, getDocs, increment, query, runTransaction, where } from "firebase/firestore";

import { db } from "../../../lib/firebase";
import { aynaRoundKey, parseGuess, scoreGuess } from "../../../lib/ayna";
import { aynaQuestionById } from "../../../lib/aynaQuestions";
import { AYNA_SURVEY_MS, applySurveyResults, isSalonId, salonTruth, tallySurvey } from "../../../lib/aynaSalon";
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

/** İlk sorunun başlangıç alanları. */
function firstQuestionUpdates(room: Room): Partial<Room> {
  return {
    status: "ayna_active",
    ayna_index: 0,
    round_end_time: Date.now() + (room.timer_setting || 25) * 1000,
    ayna_round_guesses: {},
    ayna_round_points: {},
    ayna_round_truth: null,
    ayna_round_sample: null,
  };
}

/**
 * Anket cevapları. Yalnızca host okuyabiliyor (bkz. firestore.rules →
 * ayna_survey); sorgu, kuralın doğrulayabilmesi için host_uid'i de filtreler.
 * Okunamazsa (ör. TV odanın sahibi olmayan bir hesapla açıldıysa) boş liste
 * döner: salon soruları yedek dünya sorularıyla değişir, oyun durmaz.
 */
async function fetchSurvey(room: Room): Promise<{ answers?: unknown }[]> {
  if (!room.host_uid) return [];
  try {
    const snap = await getDocs(
      query(collection(db, "ayna_survey"), where("room_id", "==", room.id), where("host_uid", "==", room.host_uid)),
    );
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.error("[AYNA] Anket okunamadı:", err);
    return [];
  }
}

/** Tanıtım bitti → anket (salon sorusu varsa) ya da doğrudan ilk soru. */
export function startAynaAfterIntro(room: Room): Promise<boolean> {
  const expect = { status: "ayna_intro" as const, index: room.ayna_index ?? 0 };
  if ((room.ayna_survey_ids?.length ?? 0) > 0) {
    return guardedUpdate(room.id, expect, { status: "ayna_survey", round_end_time: Date.now() + AYNA_SURVEY_MS });
  }
  return guardedUpdate(room.id, expect, firstQuestionUpdates(room));
}

/**
 * Anket kapandı → sonuçlara göre son soru sırası ve ilk soru. Yeterli cevap
 * gelmeyen salon soruları burada yedek dünya sorularıyla değişiyor.
 */
export async function finishAynaSurvey(room: Room): Promise<boolean> {
  const ids = room.ayna_survey_ids ?? [];
  const tally = tallySurvey(await fetchSurvey(room), ids);
  const order = applySurveyResults(room.ayna_question_ids ?? [], room.ayna_reserve_ids ?? [], tally);
  return guardedUpdate(room.id, { status: "ayna_survey", index: room.ayna_index ?? 0 }, {
    ...firstQuestionUpdates(room),
    ayna_question_ids: order,
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
  const questionId = room.ayna_question_ids?.[index];

  // Gerçek: dünya sorusunda havuzdan, salon sorusunda anketin toplamından.
  let truth: number | null = null;
  let sample: number | null = null;
  if (isSalonId(questionId)) {
    const tally = tallySurvey(await fetchSurvey(room), [questionId as string])[questionId as string];
    truth = salonTruth(tally);
    sample = tally?.total ?? 0;
  } else {
    truth = aynaQuestionById(questionId)?.answer ?? null;
  }
  // Gerçeği bilinmeyen tur (havuzdan kalkmış kimlik ya da eşiğin altında
  // kalmış salon sorusu — anket sonrası elendiği için beklenmez) TV'de
  // yanıltıcı bir "GERÇEK %0" göstermek yerine puansız atlanıyor.
  if (truth === null) {
    return guardedUpdate(room.id, { status: "ayna_active", index }, nextQuestionUpdates(room, index));
  }

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
    points[playerId] = scoreGuess(guess, truth);
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
      ayna_round_truth: isSalonId(questionId) ? truth : null,
      ayna_round_sample: sample,
      ...totals,
    });
    return true;
  });
}

/** `index`'ten sonraki soru ya da sorular bittiyse gecenin aynası. */
function nextQuestionUpdates(room: Room, index: number): Partial<Room> {
  const total = room.ayna_question_ids?.length ?? 0;
  if (index + 1 >= total) return { status: "ayna_final" };
  return {
    status: "ayna_active",
    ayna_index: index + 1,
    round_end_time: Date.now() + (room.timer_setting || 25) * 1000,
    ayna_round_guesses: {},
    ayna_round_points: {},
    ayna_round_truth: null,
    ayna_round_sample: null,
  };
}

/** Açıklama bitti → sonraki soru ya da gecenin aynası. */
export function advanceAyna(room: Room): Promise<boolean> {
  const index = room.ayna_index ?? 0;
  return guardedUpdate(room.id, { status: "ayna_reveal", index }, nextQuestionUpdates(room, index));
}
