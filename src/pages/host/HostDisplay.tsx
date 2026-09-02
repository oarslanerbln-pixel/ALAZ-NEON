import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ParticleBackground } from "../../components/ParticleBackground";
import { TVScaleFrame } from "../../components/TVScaleFrame";
import { KineticSpark } from "../../components/KineticSpark";
import { DURATION, EASE } from "../../lib/motion";
import { sounds, SoundManager } from "../../lib/audio";
import { calculateRoundScores } from "../../lib/scoring";
import { Sentinel } from "../../lib/sentinel";
import { grantGameRewards } from "../../lib/rewards";
import { useVenue } from "../../contexts/VenueContextCore";

// Hooks
import { useHostRoom } from "../../hooks/useHostRoom";
import { useLocale } from "../../hooks/useLocale";

// Types
import type { RoundResultInfo, Answer, RoomStatus } from "../../types/database";

// Extracted Components
import { HostHeader } from "./components/HostHeader";
import { HostLobby } from "./views/HostLobby";
import { HostIntro } from "./views/HostIntro";
import { HostPlaying } from "./views/HostPlaying";
import { HostReview } from "./views/HostReview";
import { HostStandings } from "./views/HostStandings";
import { HostPodium } from "./views/HostPodium";
import { HostAdBreak } from "./views/HostAdBreak";
import { HostQuizDisplay } from "./quiz/HostQuizDisplay";
import { HostBombDisplay } from "./bomb/HostBombDisplay";
import { HostSensorDisplay } from "./sensor/HostSensorDisplay";
import { HostWheelDisplay } from "./wheel/HostWheelDisplay";
import { HostOverloadDisplay } from "./overload/HostOverloadDisplay";
import { HostEchoDisplay } from "./echo/HostEchoDisplay";
import { HostPulseDisplay } from "./pulse/HostPulseDisplay";
import { HostSpectrumDisplay } from "./spectrum/HostSpectrumDisplay";
import { HostColorsDisplay } from "./colors/HostColorsDisplay";
import { HostVaultDisplay } from "./vault/HostVaultDisplay";
import { HostUnityDisplay } from "./unity/HostUnityDisplay";
import { HostBarDisplay } from "./bar/HostBarDisplay";
import { HostKabloDisplay } from "./kablo/HostKabloDisplay";
import { HostDashboard } from "./dashboard/HostDashboard";
import { HostTutorial } from "./components/HostTutorial";
import { DatabaseStatus } from "../../components/DatabaseStatus";
import { RoomStatusScreen } from "../../components/RoomStatusScreen";
import { EmojiRain } from "../../components/EmojiRain";
import { LetterSpinner } from "../../components/LetterSpinner";
import {
  getRoundIntelligence,
  logRoundIntelligence,
  evaluateBestOfNight,
  type JulesAward
} from "../../lib/intelligence";

export function HostDisplay() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const hostRoom = useHostRoom(roomId);
  const { room, loading, notFound, error } = hostRoom;

  // Oda durum kapıları. HostDisplay'in kendi hook sayısı sabit olduğu için
  // buradaki erken dönüşler hook sırasını bozmuyor. Eskiden burada çıplak bir
  // siyah div dönülüyordu ve hatalı/silinmiş oda sonsuz siyah ekran demekti.
  if (error) return <RoomStatusScreen kind="error" roomId={roomId} detail={error.message} />;
  if (loading) return <RoomStatusScreen kind="loading" roomId={roomId} />;
  if (notFound || room === null) return <RoomStatusScreen kind="notfound" roomId={roomId} />;

  // Route to Quiz Display if active_game is quiz. This must happen before any
  // of the classic-game-only hooks below are declared, so the quiz view
  // never runs those hooks at all (keeps hook order stable either way).
  if (room.active_game === "quiz" || room.game_type === "quiz") {
    return (
      <HostQuizDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
        updatePlayerScore={hostRoom.updatePlayerScore}
      />
    );
  }

  // Route to Bomb Display if active_game is bomb. 
  if (room.active_game === "bomb" || room.game_type === "bomb") {
    return (
      <HostBombDisplay 
        room={room} 
        players={hostRoom.players} 
        updateRoomStatus={hostRoom.updateRoomStatus} 
        updatePlayerScore={hostRoom.updatePlayerScore}
      />
    );
  }

  if (room.active_game === "sensor" || room.game_type === "sensor") {
    return (
      <HostSensorDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
        updatePlayerScore={hostRoom.updatePlayerScore}
      />
    );
  }

  if (room.active_game === "wheel" || room.game_type === "wheel") {
    return (
      <HostWheelDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "overload" || room.game_type === "overload") {
    return (
      <HostOverloadDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "echo" || room.game_type === "echo") {
    return (
      <HostEchoDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "pulse" || room.game_type === "pulse") {
    return (
      <HostPulseDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "spectrum" || room.game_type === "spectrum") {
    return (
      <HostSpectrumDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "colors" || room.game_type === "colors") {
    return (
      <HostColorsDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "vault" || room.game_type === "vault") {
    return (
      <HostVaultDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "unity" || room.game_type === "unity") {
    return (
      <HostUnityDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "bar" || room.game_type === "bar") {
    return (
      <HostBarDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.active_game === "kablo" || room.game_type === "kablo") {
    return (
      <HostKabloDisplay
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  if (room.status === "night_lobby" || room.active_game === "none") {
    return (
      <HostDashboard
        room={room}
        players={hostRoom.players}
        updateRoomStatus={hostRoom.updateRoomStatus}
      />
    );
  }

  return <HostDisplayGame roomId={roomId} {...hostRoom} />;
}

function HostDisplayGame({
  roomId,
  room,
  players,
  submittedPlayerIds,
  updateRoomStatus,
  updatePlayerScore,
}: { roomId: string | null } & ReturnType<typeof useHostRoom>) {
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
  const [playerStats, setPlayerStats] = useState<
    Record<
      string,
      { uniqueCount: number; earlyCount: number; blankCount: number }
    >
  >({});

  // Orchestrate Intro and Music
  useEffect(() => {
    const sound = SoundManager.getInstance();

    if (gameState === "intro") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.6); // Start cinematic intro immediately
      const timer = setTimeout(() => {
        setGameState("lobby");
        if (roomId) sessionStorage.setItem(`hostIntro_${roomId}`, "true");
      }, 4000);
      return () => clearTimeout(timer);
    } else if (gameState === "lobby") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.4);
      sound.startAmbientDrone();
    } else if (gameState === "tutorial") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.2);
    } else if (gameState === "gameIntro") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.5); // high energy
    } else if (gameState === "playing") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.3);
      sound.startAmbientDrone(); // Keep drone running for consistency
    } else if (gameState === "countdown") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
    } else if (gameState === "review") {
      sound.stopSound(sounds.GAME_PULSE);
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.2); // Low lobby music for review
    } else if (gameState === "standings") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.4); // Bring back up a bit for standings
    } else {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.stopSound(sounds.GAME_PULSE);
      sound.stopAmbientDrone();
    }
  }, [gameState, roomId]);

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

    // 1. SENTINEL FILTER: Remove shadowbanned players and sanitize payloads
    const safeAnswers: Answer[] = [];
    for (const ans of rawAnswers) {
      if (Sentinel.radar.isShadowbanned(ans.player_id)) {
        console.warn(
          `[SENTINEL] Dropping answer from shadowbanned player: ${ans.player_id}`,
        );
        continue;
      }

      // Sanitize all category inputs
      const safeData: Record<string, string> = {};
      if (ans.data) {
        for (const [cat, val] of Object.entries(ans.data)) {
          Reflect.set(safeData, cat, Sentinel.crypto.sanitizePayload(val || ""));
        }
      }

      safeAnswers.push({ ...ans, data: safeData });
    }

    if (safeAnswers.length === 0) {
      setIsAnalyzing(false);
      return; // Everyone was a bot, or no valid answers
    }

    // Use the safe, sanitized answers
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

    // Update Stats for Podium — all at once inside functional updater (no stale closure)
    setPlayerStats((prev) => {
      const next = { ...prev };
      results.forEach((res) => {
        const current = Object.prototype.hasOwnProperty.call(next, res.playerId)
          ? next[res.playerId]
          : { uniqueCount: 0, earlyCount: 0, blankCount: 0 };
        const newStats = { ...current };
        if (res.earlyBonus) newStats.earlyCount++;
        Object.values(res.answers).forEach((ans) => {
          if (!ans.value) newStats.blankCount++;
          else if (ans.isUnique && ans.isValid) newStats.uniqueCount++;
        });
        next[res.playerId] = newStats;
      });
      return next;
    });

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

    const letters = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");
    const usedLetters = room.used_letters || [];
    let availableLetters = letters.filter(l => !usedLetters.includes(l));
    let newUsedLetters = usedLetters;
    
    // If all letters used, reset pool
    if (availableLetters.length === 0) {
      availableLetters = letters;
      newUsedLetters = [];
    }
    
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    setNextLetter(randomLetter);
    
    // Save the newUsedLetters locally or wait to save it in handleSpinnerComplete?
    // It's safer to just set an internal ref or we can pass it via state to handleSpinnerComplete.
    // Instead, let's just update room status right away.
    setNextLetter(randomLetter);
    
    const hasAds = venue.sponsor_ads && venue.sponsor_ads.length > 0;
    const nextState = room.current_round === 0 ? "tutorial" : "countdown";
    const nextUpdateData = { 
      tutorial_step: room.current_round === 0 ? 0 : undefined, 
      used_letters: newUsedLetters 
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

    // Notify Sentinel that the round timer has officially started
    Sentinel.radar.startRoundTime();

    setGameState("playing");
  };

  const toggleAnswerValidity = (playerId: string, category: string) => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setRoundResults((prev) =>
      prev.map((res) => {
        if (res.playerId !== playerId) return res;
        const targetAns = Reflect.get(res.answers, category);
        const wasValid = targetAns.isValid;
        const newValid = !wasValid;
        const newPoints = newValid ? (targetAns.isUnique ? 20 : 10) : 0;
        const pointDiff = newPoints - (wasValid ? targetAns.points : 0);

        const updatedResult = {
          ...res,
          roundScore: res.roundScore + pointDiff,
          totalScore: res.totalScore + pointDiff,
          answers: {
            ...res.answers,
            [category]: { ...targetAns, isValid: newValid, points: newPoints },
          },
        };

        updatePlayerScore(res.playerId, updatedResult.totalScore).then();
        return updatedResult;
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
      grantGameRewards(room.game_mode, players, venue).catch((err) =>
        console.error("[HostDisplay] Ödül dağıtımı başarısız:", err),
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
      batch.update(pRef, { total_score: 0 });
    });
    await batch.commit();
    setPlayerStats({});
    setRoundResults([]);
    setGameHistory([]);
    setAwards(undefined);
    Sentinel.radar.clearRadar(); // Clear bans on reset
    await updateRoomStatus("lobby", { current_round: 0, active_letter: "?", used_letters: [] });
    setGameState("lobby");
  };

  const handleEndGameEarly = async () => {
    if (!roomId || !room) return;
    const confirmEnd = window.confirm(t("host.confirmEndGame"));
    if (confirmEnd) {
      const finalAwards = evaluateBestOfNight(gameHistory);
      setAwards(finalAwards);
      grantGameRewards(room.game_mode, players, venue).catch((err) =>
        console.error("[HostDisplay] Ödül dağıtımı başarısız:", err),
      );
      await updateRoomStatus("finished");
      setGameState("finished");
    }
  };

  // Timer Logic (Optimistic UI)
  useEffect(() => {
    if (gameState !== "playing" || !roundEndTime) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((roundEndTime - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      return remaining;
    };

    // Hemen bir kez çalıştır: yenileme sonrası ekranın 500ms boyunca eski
    // süreyi göstermesini engelliyor ve süresi çoktan dolmuş bir turu
    // (host bir süre kapalı kalmışsa) anında kapatıyor. Kapatma bir tik
    // sonraya alınıyor; efekt gövdesinde senkron setState zincirleme render
    // doğuruyor (dosyadaki diğer geçişler de aynı deseni kullanıyor).
    if (tick() === 0) {
      const t = setTimeout(endRoundOnce, 0);
      return () => clearTimeout(t);
    }

    const interval = setInterval(() => {
      if (tick() === 0) {
        clearInterval(interval);
        endRoundOnce();
      }
    }, 500); // Check twice a second for precision

    return () => clearInterval(interval);
  }, [gameState, roundEndTime, endRoundOnce]);

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

  return (
    <TVScaleFrame>
    <div
      // Not: eskiden son 10 saniye boyunca tüm TV `animate-shake` ile
      // titriyordu. Sarsıntı artık HostPlaying'de, yalnızca süre bittiği anda,
      // tek seferlik (oyun "juice" kuralı: sarsıntı noktalama işaretidir).
      className="w-full h-full flex flex-col p-8 overflow-hidden"
      data-tension={
        tensionRatio > 0.8 ? "high" : tensionRatio > 0.5 ? "medium" : "low"
      }
    >
      <ParticleBackground
        speedMultiplier={gameState === "playing" && timeLeft <= 10 ? 5 : 1}
      />
      {/* TV Cyberpunk Vignette & Scanlines */}
      <div className="tv-cyber-vignette fixed inset-0 z-40 pointer-events-none" />
      <div className="tv-scanlines fixed inset-0 z-40 pointer-events-none opacity-25" />
      {gameState !== "intro" && gameState !== "gameIntro" && gameState !== "ad_break" && (
        <HostHeader 
          room={room} 
          onEndGameEarly={handleEndGameEarly} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
          onTriggerAdBreak={() => {
            updateRoomStatus("ad_break", { ad_break_next_state: "lobby" }).then(() => setGameState("ad_break"));
          }}
        />
      )}

      <div className={`flex-1 flex justify-center relative w-full ${gameState === "standings" || gameState === "finished" ? "items-start pt-8" : "items-center"}`}>
        <AnimatePresence mode="wait">
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // Tam ekran bir elemanda blur(40px) çıkışı her karede
              // 1920×1080'lik yeniden boyama demekti; ölçek + opaklık aynı
              // "uzaklaşarak kaybolma" hissini compositor'da verir.
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: DURATION.cinematic, ease: EASE.in }}
              className="bg-black fixed inset-0 z-[100] flex items-center justify-center overflow-hidden noise-suppression"
            >
              <div className="relative w-full max-w-7xl flex flex-col items-center justify-center">
                <KineticSpark delay={0.5} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.1, 0.05, 0.15] }}
                  transition={{
                    delay: 2,
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                  className="absolute inset-0 bg-alaz-orange/10 blur-[150px] -z-10 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {gameState === "lobby" && (
            <HostLobby
              room={room}
              players={players}
              onStartGame={startGame}
              onUpdateCategories={(cats) =>
                updateRoomStatus("lobby", { categories: cats })
              }
            />
          )}

          {gameState === "tutorial" && (
            <HostTutorial room={room!} onComplete={handleTutorialComplete} />
          )}

          {gameState === "gameIntro" && (
            <HostIntro players={players} onComplete={handleGameIntroComplete} />
          )}

          {gameState === "countdown" && (
            <LetterSpinner
              targetLetter={nextLetter}
              onComplete={handleSpinnerComplete}
            />
          )}

          {gameState === "playing" && (
            <HostPlaying
              currentLetter={currentLetter}
              timeLeft={timeLeft}
              maxTime={room?.timer_setting}
              categories={room?.categories || []}
              submittedPlayerIds={submittedPlayerIds}
              playersCount={players.length}
              currentRound={room?.current_round}
            />
          )}

          {gameState === "review" && (
            <HostReview
              room={room}
              isAnalyzing={isAnalyzing}
              roundResults={roundResults}
              players={players}
              currentLetter={currentLetter}
              onToggleAnswer={toggleAnswerValidity}
              onNextStep={nextStep}
            />
          )}

          {gameState === "standings" && (
            <HostStandings
              room={room}
              players={players}
              roundResults={roundResults}
              onNextStep={proceedFromStandings}
            />
          )}

          {gameState === "finished" && (
            <HostPodium
              room={room}
              players={players}
              playerStats={playerStats}
              awards={awards}
              onResetGame={resetGame}
            />
          )}

          {gameState === "ad_break" && (
            <HostAdBreak 
              onComplete={() => {
                const next = room?.ad_break_next_state || "lobby";
                updateRoomStatus(next).then(() => setGameState(next as RoomStatus));
              }} 
            />
          )}
        </AnimatePresence>
      </div>

      {(gameState === "review" || gameState === "standings" || gameState === "finished") && roomId && (
        <EmojiRain roomId={roomId} />
      )}

      <DatabaseStatus />
    </div>
    </TVScaleFrame>
  );
}
