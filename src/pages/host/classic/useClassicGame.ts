import { useState, useEffect, useCallback, useRef } from "react";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { sounds, SoundManager } from "../../../lib/audio";
import { calculateRoundScores } from "../../../lib/scoring";
import { cleanAnswerData } from "../../../lib/answerText";
import { grantGameRewards } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";
import type { useHostRoom } from "../../../hooks/useHostRoom";
import { useLocale } from "../../../hooks/useLocale";
import type { RoundResultInfo, Answer, RoomStatus } from "../../../types/database";
import { getRoundIntelligence, logRoundIntelligence, evaluateBestOfNight, type JulesAward } from "../../../lib/intelligence";
import { createLogger } from "../../../lib/logger";
import { useRoundTimer } from "../../../hooks/useRoundTimer";
import { accumulatePodiumStats, pickNextLetter, toggleAnswerValidity as toggleResultAnswer, type PodiumStats } from "../../../lib/classicRound";
import { useClassicMusic } from "./useClassicMusic";

const log = createLogger("HostDisplayGame");

type ClassicGameArgs = { roomId: string | null } & ReturnType<typeof useHostRoom>;

/**
 * Klasik harf oyununun durumu, akışı ve tur kapatma mantığı (TV tarafı).
 * Çizim HostDisplayGame.tsx'te; saf hesaplar lib/classicRound.ts ve
 * lib/scoring.ts'te (docs/roadmap.md, 2.7).
 */
export function useClassicGame({
  roomId,
  room,
  players,
  submittedPlayerIds,
  updateRoomStatus,
  updatePlayerScore,
}: ClassicGameArgs) {
  const { t } = useLocale();
  const { venue } = useVenue();
  // Local UI States
  const [gameState, setGameState] = useState<RoomStatus>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rId = urlParams.get("roomId");
    return rId && sessionStorage.getItem(`hostIntro_${rId}`)
      ? "lobby"
      : "intro";
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentLetter, setCurrentLetter] = useState("?");
  const [nextLetter, setNextLetter] = useState("");

  // Turun bitiş anı yerel state DEĞİL, odadan türetiliyor. Host sayfayı
  // yenilediğinde ya da başka bir cihazdan devraldığında zamanlayıcı böylece
  // kaldığı yerden devam ediyor; yerel state olsaydı null'a düşüp tur sonsuza
  // kadar askıda kalırdı.
  const roundEndTime = room?.round_end_time ?? null;
  const [roundResults, setRoundResults] = useState<RoundResultInfo[]>([]);
  const [gameHistory, setGameHistory] = useState<RoundResultInfo[]>([]);
  const [awards, setAwards] = useState<{ creative: JulesAward | null; funny: JulesAward | null } | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stats for Podium Badges
  const [playerStats, setPlayerStats] = useState<Record<string, PodiumStats>>({});

  useClassicMusic(gameState, roomId, setGameState);

  // Sync Game State with Room Status
  useEffect(() => {
    if (room) {
      if (gameState !== "intro" && gameState !== "gameIntro" && gameState !== "countdown" && gameState !== "tutorial") {
        const newStatus = room.status as typeof gameState;
        if (gameState !== newStatus) {
          setTimeout(() => setGameState(newStatus), 0);
        }
      }
      if (room.active_letter && room.active_letter !== currentLetter) {
        setTimeout(() => setCurrentLetter(room.active_letter || "?"), 0);
      }
    }
  }, [room, gameState, currentLetter]);

  // "intro" host'un YEREL sinematiği; odaya ait kalıcı bir durum değil. Odada
  // "intro" olarak kalırsa yukarıdaki senkron efekti, animasyon bitip yerel
  // durum "lobby"ye geçtiği anda onu tekrar "intro"ya çeviriyor ve oyun lobiye
  // hiç ulaşamıyor. Yerel sinematik bittiğinde odayı da lobiye alarak döngüyü
  // kırıyoruz — bu, o durumda takılı kalmış mevcut odaları da kurtarıyor.
  useEffect(() => {
    if (gameState === "lobby" && room?.status === "intro") {
      updateRoomStatus("lobby");
    }
  }, [gameState, room?.status, updateRoomStatus]);

  const endRound = useCallback(async () => {
    if (!roomId || !room) return;
    setGameState("review");
    setIsAnalyzing(true);

    await updateRoomStatus("review");
    SoundManager.getInstance().playSFX(sounds.SIREN);

    // Give players 2.5 seconds to auto-submit their final answers
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const letterToQuery = room.active_letter || currentLetter;

    const q = query(
      collection(db, "answers"),
      where("room_id", "==", roomId),
      where("round_letter", "==", letterToQuery)
    );
    const querySnapshot = await getDocs(q);
    const rawAnswers: Answer[] = [];
    querySnapshot.forEach((docSnap) => {
      rawAnswers.push({ id: docSnap.id, ...docSnap.data() } as Answer);
    });

    if (!rawAnswers || rawAnswers.length === 0) {
      setIsAnalyzing(false);
      return;
    }

    // Cevap metni puanlamadan ve TV'de gösterilmeden önce temizleniyor
    // (boşluk, görünmez karakter, uzunluk sınırı — bkz. lib/answerText.ts).
    const safeAnswers: Answer[] = rawAnswers.map((ans) => ({ ...ans, data: cleanAnswerData(ans.data) }));

    const results = calculateRoundScores(
      room,
      players,
      safeAnswers,
      letterToQuery,
    );
    setRoundResults(results.sort((a, b) => b.totalScore - a.totalScore));
    setGameHistory((prev) => [...prev, ...results]);

    // AI Intelligence Logging (Self-Learning)
    const prediction = getRoundIntelligence(
      letterToQuery,
      room.categories,
      players.length,
      room.timer_setting,
      room.current_round,
    );
    logRoundIntelligence(
      roomId,
      room.current_round,
      letterToQuery,
      room.categories,
      players.length,
      prediction.expectedAvgScore,
      results,
    ).then();

    // Podyum rozetleri için istatistik (fonksiyonel güncelleyici: eski kapanış yok).
    setPlayerStats((prev) => accumulatePodiumStats(prev, results));

    // Push scores to DB
    for (const res of results) {
      await updatePlayerScore(res.playerId, res.totalScore);
    }

    setIsAnalyzing(false);
  }, [
    roomId,
    room,
    players,
    currentLetter,
    updateRoomStatus,
    updatePlayerScore,
  ]);

  // Bir tur yalnızca BİR KEZ kapatılabilir. endRound puanları oyuncunun mevcut
  // toplamına EKLEDİĞİ için ikinci bir çağrı puanları iki kez yazardı; zamanlayıcı
  // efekti ise bağımlılıkları (room/players) her değiştiğinde yeniden kuruluyor
  // ve süresi dolmuş bir turda tekrar tetiklenebiliyor.
  const endedRoundRef = useRef<number | null>(null);
  const endRoundOnce = useCallback(() => {
    const thisRound = room?.current_round ?? null;
    if (endedRoundRef.current === thisRound) return;
    endedRoundRef.current = thisRound;
    endRound();
  }, [endRound, room?.current_round]);

  const startGame = async () => {
    if (!roomId || !room) return;
    SoundManager.getInstance().playSFX(sounds.BURN);

    const { letter: randomLetter, usedLetters: newUsedLetters } = pickNextLetter(room.used_letters || []);
    setNextLetter(randomLetter);

    const hasAds = venue.sponsor_ads && venue.sponsor_ads.length > 0;
    const nextState = room.current_round === 0 ? "tutorial" : "countdown";
    // Anlatım yalnızca ilk turda; sonraki turlarda alan hiç yazılmamalı
    // (undefined yazmak Firestore'da hata, TV bağlantı hatasına düşüyordu).
    const nextUpdateData = {
      ...(room.current_round === 0 ? { tutorial_step: 0 } : {}),
      used_letters: newUsedLetters,
    };

    if (hasAds) {
      await updateRoomStatus("ad_break", { ...nextUpdateData, ad_break_next_state: nextState });
      setGameState("ad_break");
    } else {
      await updateRoomStatus(nextState, nextUpdateData);
      setGameState(nextState);
    }
  };

  const handleTutorialComplete = useCallback(async () => {
    if (!roomId || !room) return;
    // Yerel gösteri (~13sn'lik HostIntro sinematiği) başlarken oda durumu
    // Firestore'da hâlâ "tutorial" kalıyordu — bu yüzden o süre boyunca
    // oyuncunun telefonu son tutorial slaytında donmuş gibi görünüyordu,
    // TV'deki gösteriden habersiz kalıyordu. Firestore'u da güncelleyerek
    // oyuncu tarafının "Ana Ekrana Bakın" bekleme ekranına geçmesini sağlıyoruz
    // (bkz. PlayerGame.tsx — gameState "gameIntro" için zaten bu ekranı gösteriyordu,
    // sadece hiç tetiklenmiyordu).
    await updateRoomStatus("gameIntro");
    setGameState("gameIntro");
  }, [roomId, room, updateRoomStatus]);

  const handleGameIntroComplete = useCallback(() => {
    // Aynı sebep: harf çarkı dönerken de oda durumu hâlâ senkronsuzdu.
    updateRoomStatus("countdown");
    setGameState("countdown");
  }, [updateRoomStatus]);

  const handleSpinnerComplete = async () => {
    if (!roomId || !room) return;

    const nextRound = (room.current_round || 0) + 1;
    const usedLetters = room.used_letters || [];

    // Turun bitiş anı Firestore'a YAZILIYOR. Eskiden yalnızca host'un yerel
    // state'inde duruyordu ve bunun iki sonucu vardı: host sayfayı yenilerse
    // zamanlayıcı ölü kalıp tur hiç bitmiyordu, ayrıca her oyuncu kendi
    // yükleme anından saydığı için aralarında kayma oluşuyordu. Tek bir mutlak
    // zaman damgası ikisini de çözüyor.
    const endTime = Date.now() + room.timer_setting * 1000;

    await updateRoomStatus("playing", {
      active_letter: nextLetter,
      current_round: nextRound,
      time_left: room.timer_setting,
      round_end_time: endTime,
      used_letters: [...usedLetters, nextLetter]
    });

    setCurrentLetter(nextLetter);
    setTimeLeft(room.timer_setting);

    setGameState("playing");
  };

  const toggleAnswerValidity = (playerId: string, category: string) => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setRoundResults((prev) =>
      prev.map((res) => {
        if (res.playerId !== playerId) return res;
        const updated = toggleResultAnswer(res, category);
        updatePlayerScore(res.playerId, updated.totalScore).then();
        return updated;
      }),
    );
  };

  const nextStep = async () => {
    if (!roomId || !room) return;
    SoundManager.getInstance().playSFX(sounds.START);
    
    // Move from review to standings
    await updateRoomStatus("standings");
    setGameState("standings");
  };

  const proceedFromStandings = async () => {
    if (!roomId || !room) return;
    SoundManager.getInstance().playSFX(sounds.START);

    if (room.current_round >= room.total_rounds) {
      // Evaluate best of night before finishing
      const finalAwards = evaluateBestOfNight(gameHistory);
      setAwards(finalAwards);

      // Ödül dağıtımı Firestore yazma hatasında bile oyunun bitişini
      // engellememeli — hata varsa sadece konsola düşer.
      grantGameRewards(room.id, room.game_mode, players, venue).catch((err) =>
        log.error("Ödül dağıtımı başarısız:", err),
      );

      await updateRoomStatus("finished");
      setGameState("finished");
    } else {
      startGame();
    }
  };

  const resetGame = async () => {
    if (!roomId) return;
    const batch = writeBatch(db);
    players.forEach(p => {
      const pRef = doc(db, "players", p.id);
      batch.update(pRef, { total_score: 0, lifetime_credited: 0 });
    });
    await batch.commit();
    setPlayerStats({});
    setRoundResults([]);
    setGameHistory([]);
    setAwards(undefined);
    await updateRoomStatus("lobby", { current_round: 0, active_letter: "?", used_letters: [] });
    setGameState("lobby");
  };

  const handleEndGameEarly = async () => {
    if (!roomId || !room) return;
    const confirmEnd = window.confirm(t("host.confirmEndGame"));
    if (confirmEnd) {
      const finalAwards = evaluateBestOfNight(gameHistory);
      setAwards(finalAwards);
      grantGameRewards(room.id, room.game_mode, players, venue).catch((err) =>
        log.error("Ödül dağıtımı başarısız:", err),
      );
      await updateRoomStatus("finished");
      setGameState("finished");
    }
  };

  // Geri sayım (bitiş anı odadan; bkz. useRoundTimer).
  useRoundTimer(gameState === "playing", roundEndTime, setTimeLeft, endRoundOnce);

  // Herkes cevapladıysa süre dolmasını beklemeden turu bitir. Kısa bir
  // duraklama bırakıyoruz ki son oyuncunun cevabı "Live Link Status"ta
  // (bkz. HostPlaying) 100% olarak görünsün, sonra tur kapansın — aniden
  // kesilmiş hissi vermesin. endRoundOnce zaten tek seferlik olduğu için
  // zamanlayıcı efektiyle yarışsa bile (biri erken biter, öbürü hiç
  // tetiklenmez) iki kez puan yazılmaz.
  useEffect(() => {
    if (gameState !== "playing") return;
    if (players.length === 0) return;
    if (submittedPlayerIds.length < players.length) return;
    const t = setTimeout(endRoundOnce, 900);
    return () => clearTimeout(t);
  }, [gameState, submittedPlayerIds.length, players.length, endRoundOnce]);

  // Calculate Aesthetic Tension
  const tensionRatio =
    room && room.total_rounds > 0
      ? (room.current_round || 0) / room.total_rounds
      : 0;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--tension-level",
      tensionRatio.toString(),
    );
  }, [tensionRatio]);

  return {
    awards,
    currentLetter,
    gameState,
    handleEndGameEarly,
    handleGameIntroComplete,
    handleSpinnerComplete,
    handleTutorialComplete,
    isAnalyzing,
    nextLetter,
    nextStep,
    playerStats,
    proceedFromStandings,
    resetGame,
    roundResults,
    setGameState,
    startGame,
    tensionRatio,
    timeLeft,
    toggleAnswerValidity,
  };
}
