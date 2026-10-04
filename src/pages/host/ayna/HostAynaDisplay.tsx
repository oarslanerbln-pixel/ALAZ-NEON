import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { db } from "../../../lib/firebase";
import { sounds, SoundManager } from "../../../lib/audio";
import { aynaRoundKey } from "../../../lib/ayna";
import { aynaRoundQuestion } from "../../../lib/aynaQuestions";
import { useLocale } from "../../../hooks/useLocale";
import type { Player, Room } from "../../../types/database";
import { advanceAyna, finishAynaSurvey, revealAynaRound, startAynaAfterIntro } from "./aynaActions";
import { AynaActiveScreen, AynaBackdrop, AynaFinalScreen, AynaIntroScreen, AynaRevealScreen, AynaSurveyScreen } from "./HostAynaScreens";
import { createLogger } from "../../../lib/logger";

const log = createLogger("HostAynaDisplay");

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], extra?: Partial<Room>) => Promise<void>;
}

const INTRO_MS = 8_000;
const REVEAL_MS = 16_000;
/** Herkes kilitledikten sonra açıklamadan önce kısa bir nefes. */
const ALL_LOCKED_GRACE_MS = 1_500;

/** Geçiş isteği ağ hatasıyla düşerse oyun takılmasın diye aralıklı tekrar. */
const RETRY_MS = 4_000;

/**
 * `delayMs` sonra `fn`'i çağırır, ardından efekt temizlenene kadar (yani
 * oda durumu değişene kadar) her RETRY_MS'de yeniden dener. Geçişler
 * transaction ile korunduğu için tekrarlar zararsız.
 */
function scheduleWithRetry(fn: () => void, delayMs: number): () => void {
  let timer = setTimeout(function tick() {
    fn();
    timer = setTimeout(tick, RETRY_MS);
  }, Math.max(0, delayMs));
  return () => clearTimeout(timer);
}

/**
 * AYNA host yönlendiricisi: ekranı seçer, zamanlayıcıları yürütür.
 * Durum geçişleri aynaActions.ts'te transaction ile korunuyor; buradaki
 * zamanlayıcılar ne kadar tetiklenirse tetiklensin bir soru bir kez açıklanır.
 */
export function HostAynaDisplay({ room, players, updateRoomStatus }: Props) {
  const { locale } = useLocale();
  const index = room.ayna_index ?? 0;
  const total = room.ayna_question_ids?.length ?? 0;
  const question = aynaRoundQuestion(room.ayna_question_ids?.[index], room, locale);
  const status = room.status;

  // Zamanlayıcılar her oda snapshot'ında (ör. canlılık sinyali) yeniden
  // kurulmasın diye en güncel oda/oyuncu listesi ref'te tutuluyor.
  const latest = useRef({ room, players });
  useEffect(() => {
    latest.current = { room, players };
  });

  const reveal = useCallback(() => {
    const { room: r, players: ps } = latest.current;
    revealAynaRound(r, new Set(ps.map((p) => p.id)))
      .then((changed) => {
        if (changed) SoundManager.getInstance().playSFX(sounds.SUCCESS);
      })
      .catch((err) => log.error("Açıklama başarısız:", err));
  }, []);

  const advance = useCallback(() => {
    advanceAyna(latest.current.room).catch((err) => log.error("İlerleme başarısız:", err));
  }, []);

  // Tanıtım → salon anketi (ya da anket yoksa doğrudan ilk soru)
  useEffect(() => {
    if (status !== "ayna_intro") return;
    return scheduleWithRetry(() => {
      startAynaAfterIntro(latest.current.room).catch((err) => log.error("Başlatma başarısız:", err));
    }, INTRO_MS);
  }, [status]);

  // Anketi tamamlayanların sayısı. Yalnızca SAYI okunuyor — kimin ne dediği
  // ekrana hiç gelmiyor; sorgu host_uid filtresiyle kurallardan geçiyor.
  const [surveyCount, setSurveyCount] = useState<{ roomId: string; n: number }>({ roomId: "", n: 0 });
  useEffect(() => {
    if (status !== "ayna_survey" || !room.host_uid) return;
    const q = query(collection(db, "ayna_survey"), where("room_id", "==", room.id), where("host_uid", "==", room.host_uid));
    return onSnapshot(
      q,
      (snap) => setSurveyCount({ roomId: room.id, n: snap.size }),
      (err) => log.error("Anket dinlenemedi:", err),
    );
  }, [status, room.id, room.host_uid]);
  const surveyAnswered = surveyCount.roomId === room.id ? surveyCount.n : 0;
  const everyoneSurveyed = players.length > 0 && surveyAnswered >= players.length;

  // Bu soruyu kilitleyenler — canlı sayaç ve "herkes kilitledi" erken açıklaması.
  const [locked, setLocked] = useState<{ key: string; ids: string[] }>({ key: "", ids: [] });
  const roundKey = `${room.id}:${index}`;
  useEffect(() => {
    if (status !== "ayna_active") return;
    const q = query(collection(db, "answers"), where("room_id", "==", room.id), where("round_letter", "==", aynaRoundKey(index)));
    return onSnapshot(
      q,
      (snap) => setLocked({ key: roundKey, ids: [...new Set(snap.docs.map((d) => d.data().player_id as string))] }),
      (err) => log.error("Cevaplar dinlenemedi:", err),
    );
  }, [status, room.id, index, roundKey]);
  const lockedPlayers = useMemo(() => {
    const ids = locked.key === roundKey ? locked.ids : [];
    return players.filter((p) => ids.includes(p.id));
  }, [players, locked, roundKey]);
  const everyoneLocked = players.length > 0 && lockedPlayers.length >= players.length;

  // Soru ve anket süresi
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (status !== "ayna_active" && status !== "ayna_survey") return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [status]);
  const endAt = room.round_end_time ?? 0;
  const secondsLeft = Math.max(0, Math.ceil((endAt - now) / 1000));

  useEffect(() => {
    if (status !== "ayna_active" || !endAt) return;
    const wait = everyoneLocked ? Math.min(ALL_LOCKED_GRACE_MS, endAt - Date.now()) : endAt - Date.now();
    return scheduleWithRetry(reveal, wait);
  }, [status, index, endAt, everyoneLocked, reveal]);

  // Anket → ilk soru (süre dolunca ya da herkes yanıtlayınca)
  useEffect(() => {
    if (status !== "ayna_survey" || !endAt) return;
    const wait = everyoneSurveyed ? Math.min(ALL_LOCKED_GRACE_MS, endAt - Date.now()) : endAt - Date.now();
    return scheduleWithRetry(() => {
      finishAynaSurvey(latest.current.room)
        .then((changed) => {
          if (changed) SoundManager.getInstance().playSFX(sounds.START);
        })
        .catch((err) => log.error("Anket kapatılamadı:", err));
    }, wait);
  }, [status, endAt, everyoneSurveyed]);

  // Açıklama → sonraki soru
  useEffect(() => {
    if (status !== "ayna_reveal") return;
    return scheduleWithRetry(advance, REVEAL_MS);
  }, [status, index, advance]);

  const backToLobby = () => updateRoomStatus("night_lobby", { active_game: "none" });

  let screen: ReactNode;
  let screenKey: string;
  if (status === "ayna_intro") {
    screenKey = "intro";
    screen = <AynaIntroScreen durationMs={INTRO_MS} />;
  } else if (status === "ayna_survey") {
    screenKey = "survey";
    screen = <AynaSurveyScreen answered={surveyAnswered} playerCount={players.length} secondsLeft={secondsLeft} />;
  } else if (status === "ayna_active" && question) {
    screenKey = `active-${index}`;
    screen = (
      <AynaActiveScreen
        question={question}
        index={index}
        total={total}
        secondsLeft={secondsLeft}
        lockedPlayers={lockedPlayers}
        playerCount={players.length}
        onRevealNow={reveal}
      />
    );
  } else if (status === "ayna_reveal" && question) {
    screenKey = `reveal-${index}`;
    screen = (
      <AynaRevealScreen
        question={question}
        index={index}
        total={total}
        guesses={room.ayna_round_guesses ?? {}}
        points={room.ayna_round_points ?? {}}
        players={players}
        isLast={index + 1 >= total}
        onNext={advance}
      />
    );
  } else if (status === "ayna_final") {
    screenKey = "final";
    screen = <AynaFinalScreen totals={room.ayna_totals ?? {}} players={players} onBackToLobby={backToLobby} />;
  } else {
    // Soru bulunamadı (havuzdan kaldırılmış bir kimlik) ya da beklenmeyen
    // bir durum: siyah ekran yerine oyunu güvenle bitirmeye izin ver.
    screenKey = "fallback";
    screen = <AynaFinalScreen totals={room.ayna_totals ?? {}} players={players} onBackToLobby={backToLobby} />;
  }

  return (
    <TVScaleFrame>
      <AynaBackdrop>
        <AnimatePresence mode="wait">
          <motion.div
            key={screenKey}
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {screen}
          </motion.div>
        </AnimatePresence>
      </AynaBackdrop>
    </TVScaleFrame>
  );
}
