import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import type { HostGameProps } from "../gameDisplays";
import type { SlingshotPlayer, ArenaShot } from "../../../components/slingshot/Slingshot3DArena";
import { Slingshot3DArena } from "../../../components/slingshot/Slingshot3DArena";
import { SoundManager, sounds } from "../../../lib/audio";
import { db } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";
import { useVenue } from "../../../contexts/VenueContextCore";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { finishNightRound, NIGHT_ROUND_OPEN } from "../../../lib/nightAwards";
import { nightPointsForPlayers } from "../../../lib/nightLeague";
import { grantGameRewards } from "../../../lib/rewards";
import { clearRoomAnswers, resetPlayersForNewGame } from "../../../lib/gameReset";
import { pointsFields } from "../../../lib/scoreWrites";
import { gameTitle } from "../../../lib/gameCatalog";
import {
  SLINGSHOT_DRAIN_MS,
  SLINGSHOT_GOAL_POINTS,
  SLINGSHOT_INTRO_MS,
  SLINGSHOT_ROUND_SEC,
  goalsFromScore,
  parseShot,
  slingshotRoundKey,
  type ShotResult,
} from "../../../lib/slingshot";
import { ShimmerButton } from "../../../components/fx";
import type { Player } from "../../../types/database";

const PLAYER_COLORS = ["#00f3ff", "#ff5500", "#f43f5e", "#10b981", "#a855f7", "#eab308"];
/** Sonuç yazısı ekranda kalsın, sonra sıradaki şut. */
const RESULT_HOLD_MS = 2200;
/** Top hiç sonuçlanmazsa (ör. sekme arka planda) kuyruk kilitlenmesin. */
const SHOT_TIMEOUT_MS = 6000;
/** TV üst şeridine sığan oyuncu sayısı. */
const HUD_PLAYERS = 6;

function colorOf(players: readonly Player[], playerId: string): string {
  const i = players.findIndex((p) => p.id === playerId);
  return PLAYER_COLORS[(i < 0 ? 0 : i) % PLAYER_COLORS.length];
}

export function HostSlingshotDisplay({ room, players, updateRoomStatus }: HostGameProps) {
  const { t } = useLocale();
  const { venue } = useVenue();
  const currentStatus = room.status;
  const roundKey = slingshotRoundKey(room.slingshot_end_time);

  const [timeLeft, setTimeLeft] = useState(SLINGSHOT_ROUND_SEC);
  const [currentShot, setCurrentShot] = useState<ArenaShot | null>(null);

  const latestPlayers = useRef(players);
  useEffect(() => {
    latestPlayers.current = players;
  }, [players]);

  // Şut kuyruğu: TV tek top fırlatıyor, şutlar geliş sırasıyla bekler.
  const queueRef = useRef<ArenaShot[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef(false);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const finishedRef = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  const pump = useCallback(() => {
    if (inFlightRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;
    inFlightRef.current = true;
    setCurrentShot(next);
    later(() => {
      // Sonuç gelmedi: bu şutu bırak, kuyruk ilerlesin.
      if (inFlightRef.current) {
        inFlightRef.current = false;
        pump();
      }
    }, SHOT_TIMEOUT_MS);
  }, [later]);

  const handleShotResult = useCallback(
    (shot: ArenaShot, result: ShotResult) => {
      if (result === "goal") {
        updateDoc(doc(db, "players", shot.playerId), pointsFields(SLINGSHOT_GOAL_POINTS)).catch((err) =>
          console.error("[HostSlingshot] Gol puanı yazılamadı:", err),
        );
      }
      later(() => {
        inFlightRef.current = false;
        pump();
      }, RESULT_HOLD_MS);
    },
    [later, pump],
  );

  // Sayfa kapanırken bekleyen zamanlayıcılar boşa çalışmasın.
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const finishGame = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const finalPlayers = latestPlayers.current;
    grantGameRewards("individual", finalPlayers, venue).catch((err) =>
      console.error("[HostSlingshot] Ödül dağıtımı başarısız:", err),
    );
    finishNightRound(room.id, nightPointsForPlayers("individual", finalPlayers));
    SoundManager.getInstance().playSFX(sounds.FANFARE, 0.8);
    updateRoomStatus("slingshot_reveal");
  }, [room.id, updateRoomStatus, venue]);

  // Dashboard'dan "lobby" ile açılan eski odalar için.
  useEffect(() => {
    if (currentStatus === "lobby") updateRoomStatus("slingshot_intro");
  }, [currentStatus, updateRoomStatus]);

  // Intro -> Active
  useEffect(() => {
    if (currentStatus !== "slingshot_intro") return;
    queueRef.current = [];
    seenRef.current = new Set();
    inFlightRef.current = false;
    finishedRef.current = false;
    SoundManager.getInstance().playSFX(sounds.FANFARE, 0.6);
    const timer = setTimeout(() => {
      updateRoomStatus("slingshot_active", { slingshot_end_time: Date.now() + SLINGSHOT_ROUND_SEC * 1000 });
    }, SLINGSHOT_INTRO_MS);
    return () => clearTimeout(timer);
  }, [currentStatus, updateRoomStatus]);

  // Telefonların şutları: yalnızca bu turun cevapları.
  useEffect(() => {
    if (currentStatus !== "slingshot_active" || !roundKey) return;
    const q = query(collection(db, "answers"), where("room_id", "==", room.id), where("round_letter", "==", roundKey));
    // TV sayfası tur ortasında yenilenirse önceki şutlar yeniden fırlatılıp
    // gol puanı ikinci kez yazılmasın: ilk anlık görüntüde zaten var olanlar
    // "görüldü" sayılır.
    let initial = true;
    return onSnapshot(
      q,
      (snap) => {
        if (initial) {
          snap.docs.forEach((d) => seenRef.current.add(d.id));
          // Önbellekten gelen ilk görüntü boş olabilir; sunucunun ilk cevabı
          // da "önceden var olan" sayılır.
          if (!snap.metadata.fromCache) initial = false;
          return;
        }
        let added = false;
        for (const change of snap.docChanges()) {
          if (change.type !== "added" || seenRef.current.has(change.doc.id)) continue;
          seenRef.current.add(change.doc.id);
          const answer = change.doc.data();
          const shot = parseShot(answer.data);
          const shooter = latestPlayers.current.find((p) => p.id === answer.player_id);
          if (!shot || !shooter) continue;
          queueRef.current.push({
            ...shot,
            id: change.doc.id,
            playerId: shooter.id,
            shooterName: shooter.nickname,
            color: colorOf(latestPlayers.current, shooter.id),
          });
          added = true;
        }
        if (added) pump();
      },
      (err) => console.error("[HostSlingshot] Şutlar dinlenemedi:", err),
    );
  }, [currentStatus, roundKey, room.id, pump]);

  // Süre sayacı. Süre bitince kuyruktaki şutlar en fazla SLINGSHOT_DRAIN_MS
  // daha fırlatılır: son saniyede çekilen şut da sayılsın.
  useEffect(() => {
    if (currentStatus !== "slingshot_active") return;
    SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.4);
    const endTime = room.slingshot_end_time || Date.now() + SLINGSHOT_ROUND_SEC * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.ceil((endTime - now) / 1000)));
      if (now < endTime) return;
      const drained = !inFlightRef.current && queueRef.current.length === 0;
      if (drained || now >= endTime + SLINGSHOT_DRAIN_MS) {
        clearInterval(interval);
        finishGame();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [currentStatus, room.slingshot_end_time, finishGame]);

  const hudPlayers: SlingshotPlayer[] = useMemo(
    () =>
      players
        .map((p) => ({ id: p.id, nickname: p.nickname, color: colorOf(players, p.id), score: goalsFromScore(p.total_score) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, HUD_PLAYERS),
    [players],
  );

  const handleReturnToLobby = () => {
    updateRoomStatus("night_lobby", { active_game: "none" });
  };

  const handleRestart = () => {
    const failed = (err: unknown) => console.error("[HostSlingshot] Yeniden başlatma sıfırlaması başarısız:", err);
    resetPlayersForNewGame(players.map((p) => p.id)).catch(failed);
    clearRoomAnswers(room.id).catch(failed);
    setCurrentShot(null);
    updateRoomStatus("slingshot_intro", { slingshot_end_time: 0, ...NIGHT_ROUND_OPEN });
  };

  const title = gameTitle("slingshot");

  return (
    <TVScaleFrame>
      <div className="relative w-full h-full min-h-[1080px] flex flex-col justify-between overflow-hidden bg-black text-white font-inter">
        <AnimatePresence mode="wait">
          {/* 1. İNTRO BRİFİNGİ */}
          {currentStatus === "slingshot_intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 bg-black/90 backdrop-blur-xl"
            >
              <div className="w-24 h-24 mb-6 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-5xl shadow-[0_0_50px_#10b981]">
                ⚽
              </div>
              <h2 className="text-xl font-mono tracking-[0.4em] uppercase text-emerald-400 font-black mb-2">
                {t("slingshot.introEyebrow")}
              </h2>
              <h1 className="text-6xl font-black text-white tracking-tight mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                {title}
              </h1>
              <p className="text-2xl text-gray-300 max-w-2xl text-center font-light leading-relaxed mb-8">
                {t("slingshot.introBody")}
              </p>
              <div className="flex items-center gap-4 text-emerald-300 font-mono text-lg animate-pulse">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                <span>{t("slingshot.introReady")}</span>
              </div>
            </motion.div>
          )}

          {/* 2. AKTİF STADYUM ARENASI */}
          {currentStatus === "slingshot_active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex-1"
            >
              <Slingshot3DArena players={hudPlayers} shot={currentShot} onShotResult={handleShotResult} />
              <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 px-6 py-2 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-md font-mono text-4xl font-black text-alaz-orange tabular-nums drop-shadow-[0_0_20px_rgba(255,85,0,0.8)]">
                {timeLeft}s
              </div>
            </motion.div>
          )}

          {/* 3. SONUÇ PODYUMU */}
          {currentStatus === "slingshot_reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 bg-black/95 backdrop-blur-2xl"
            >
              <div className="text-sm font-mono tracking-[0.4em] uppercase text-emerald-400 font-bold mb-2">
                {t("slingshot.revealEyebrow")}
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight mb-8 drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                {t("slingshot.revealTitle")}
              </h1>

              {/* Podyum Kartları */}
              <div className="flex items-end justify-center gap-6 w-full max-w-4xl mb-12">
                {players
                  .slice()
                  .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
                  .slice(0, 3)
                  .map((p, rank) => (
                    <motion.div
                      key={p.id}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: rank * 0.15 }}
                      className={`flex flex-col items-center p-6 rounded-3xl border backdrop-blur-md ${
                        rank === 0
                          ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-110 z-10"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="text-3xl mb-2">{rank === 0 ? "🏆" : rank === 1 ? "🥈" : "🥉"}</div>
                      <div className="text-xl font-bold text-white mb-1">{p.nickname}</div>
                      <div className="font-mono text-2xl font-black text-emerald-300">
                        {t("slingshot.goals", goalsFromScore(p.total_score))}
                      </div>
                    </motion.div>
                  ))}
              </div>

              {/* Kontrol Butonları */}
              <div className="flex items-center gap-4">
                <ShimmerButton
                  onClick={handleRestart}
                  className="px-8 py-4 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold text-lg hover:bg-emerald-500/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  {t("slingshot.playAgain")}
                </ShimmerButton>
                <button
                  onClick={handleReturnToLobby}
                  className="px-8 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all border border-white/15"
                >
                  {t("slingshot.backToLobby")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TVScaleFrame>
  );
}
