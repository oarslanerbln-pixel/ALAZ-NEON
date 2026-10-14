import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import type { Room, Player, Answer } from "../../../types/database";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { NeonIcon } from "../../../components/NeonIcon";
import { createLogger } from "../../../lib/logger";
import { newestFirst, newVaultCode, vaultFeedback, vaultWinner } from "../../../lib/vault";
import { SECRET_DOC } from "../../../lib/gameSecrets";
import { vaultFeedbackPayload, vaultSecretPayload } from "../../../lib/clientWrites";
import { useRoomSecret, writeRoomSecret } from "../../../hooks/useRoomSecret";

const log = createLogger("HostVaultDisplay");
import { pointsFields } from "../../../lib/scoreWrites";
import { finishNightRound } from "../../../lib/nightAwards";
import { placementPointsByOrder } from "../../../lib/nightLeague";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostVaultDisplay({ room, players, updateRoomStatus }: Props) {
  const { t } = useLocale();
  const [gameState, setGameState] = useState<"intro" | "active" | "reveal">("intro");
  const [guesses, setGuesses] = useState<(Answer & { nickname: string })[]>([]);
  const [isExploding, setIsExploding] = useState(false);
  const awardedCodeRef = useRef<string | null>(null);
  const feedbackSentRef = useRef(new Set<string>());
  const code = useRoomSecret<{ code: string }>(room.id, SECRET_DOC.vault)?.code;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (room.status === "vault_intro") {
      Promise.resolve().then(() => setGameState("intro"));
      SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.4);
      
      timer = setTimeout(async () => {
        // Kod yalnızca host'un okuduğu belgeye yazılır; oda belgesi herkese
        // açık okunuyor (önceden misafir kodu telefonundan okuyabiliyordu).
        try {
          await writeRoomSecret(room.id, SECRET_DOC.vault, vaultSecretPayload(newVaultCode()));
        } catch (err) {
          log.error("Kasa kodu yazılamadı:", err);
          return;
        }
        updateRoomStatus("vault_active", { vault_code: "", vault_winner_id: null });
      }, 5000);
    } else if (room.status === "vault_active") {
      Promise.resolve().then(() => setGameState("active"));
    } else if (room.status === "vault_reveal") {
      Promise.resolve().then(() => setGameState("reveal"));
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [room.status, room.id, updateRoomStatus]);

  // Listen for guesses during active state
  useEffect(() => {
    if (gameState !== "active") return;

    const q = query(
      collection(db, "answers"),
      where("room_id", "==", room.id),
      where("round_letter", "==", "VAULT")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const known = snapshot.docs
        .map((docSnap) => docSnap.data() as Answer)
        .filter((data) => players.some((p) => p.id === data.player_id));

      // İpucu telefonda hesaplanamıyor (kod orada yok): her yeni tahminin
      // ipucunu cevap belgesine TV yazıyor, telefon kendi belgesini dinliyor.
      if (code) {
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as Answer & { feedback?: unknown };
          const guess = data.data?.guess;
          if (data.feedback || !guess || feedbackSentRef.current.has(docSnap.id)) continue;
          feedbackSentRef.current.add(docSnap.id);
          updateDoc(docSnap.ref, vaultFeedbackPayload(vaultFeedback(guess, code))).catch((err) => {
            feedbackSentRef.current.delete(docSnap.id);
            log.error("Şifre ipucu yazılamadı:", err);
          });
        }
      }
      setGuesses(
        newestFirst(known).map((data) => ({
          ...data,
          nickname: players.find((p) => p.id === data.player_id)?.nickname ?? "",
        })),
      );

      // Kazanan kod başına bir kez ödüllendirilir: dinleyici her anlık
      // görüntüde (ve bağımlılık değişince yeniden kurulunca) tetikleniyor,
      // açıklamaya kadar geçen 3 sn'de puan defalarca ekleniyordu.
      const winnerId = vaultWinner(known, code);
      if (winnerId && code && room.status === "vault_active" && awardedCodeRef.current !== code) {
        awardedCodeRef.current = code;
        setIsExploding(true);
        SoundManager.getInstance().playSFX(sounds.SUCCESS);
        SoundManager.getInstance().stopSound(sounds.GAME_PULSE);

        updateDoc(doc(db, "players", winnerId), pointsFields(500)).catch(log.error);
        // Gecelik lig: şifreyi çözen birinci, diğerleri katılım.
        finishNightRound(room.id, placementPointsByOrder([winnerId], players.map((p) => p.id)));

        setTimeout(() => {
          // Oyun bitti: kod artık açıklanabilir.
          updateRoomStatus("vault_reveal", { vault_winner_id: winnerId, vault_code: code });
          setIsExploding(false);
        }, 3000);
      }
    });

    return () => unsubscribe();
  }, [gameState, room.id, code, room.status, players, updateRoomStatus]);

  const winner = players.find(p => p.id === room.vault_winner_id);

  return (
    <TVScaleFrame>
      <div className="w-full h-full flex flex-col p-8 overflow-hidden bg-black/90">
        <HostHeader 
          room={room} 
          onEndGameEarly={() => updateRoomStatus("lobby", { active_game: "none" })} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />

        <div className="flex-1 flex items-center justify-center relative w-full">
          <AnimatePresence mode="wait">
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center"
              >
                <NeonIcon type="flame" color="green" className="w-32 h-32 mb-8 animate-pulse" />
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-teal-600 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  {t("host.vaultIntroTitle")}
                </h1>
                <p className="text-white/50 text-2xl mt-4 uppercase tracking-[0.5em]">
                  {t("host.vaultIntroDesc")}
                </p>
              </motion.div>
            )}

            {gameState === "active" && !isExploding && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-5xl flex gap-12"
              >
                {/* Vault Graphic */}
                <div className="flex-1 flex flex-col items-center justify-center border-r border-white/10 pr-12">
                  <motion.div 
                    animate={{ boxShadow: ["0 0 50px rgba(16,185,129,0.2)", "0 0 100px rgba(16,185,129,0.4)", "0 0 50px rgba(16,185,129,0.2)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-80 h-80 rounded-full border-8 border-emerald-500/30 flex items-center justify-center relative overflow-hidden bg-black"
                  >
                    <div className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_15deg,rgba(16,185,129,0.1)_15deg,rgba(16,185,129,0.1)_30deg)] animate-spin-slow" />
                    <div className="relative z-10 w-48 h-48 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-black">
                      <NeonIcon type="lock" color="green" className="w-20 h-20" />
                    </div>
                  </motion.div>
                  <h2 className="text-3xl font-black text-emerald-400 mt-8 tracking-widest uppercase">
                    {t("vault.crackItBang")}
                  </h2>
                </div>

                {/* Live Guesses Stream */}
                <div className="flex-[0.8] relative h-[600px] overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-10" />
                  
                  <div className="flex flex-col gap-3">
                    <AnimatePresence>
                      {guesses.slice(0, 15).map((guess, i) => (
                        <motion.div
                          key={guess.id || i}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-white/10"
                        >
                          <span className="text-white/70 font-bold">{guess.nickname}</span>
                          <span className="text-emerald-400 font-mono text-xl tracking-[0.3em]">{guess.data.guess}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {isExploding && (
              <motion.div
                key="exploding"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 2 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-white"
              >
                <div className="w-full h-full bg-emerald-400 mix-blend-overlay animate-pulse" />
              </motion.div>
            )}

            {gameState === "reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <NeonIcon type="unlock" color="green" className="w-40 h-40 mb-8 drop-shadow-[0_0_50px_rgba(16,185,129,0.8)]" />
                <h2 className="text-4xl text-emerald-400 font-black tracking-widest uppercase mb-4">
                  {t("vault.opened")}
                </h2>
                <h1 className="text-8xl text-white font-black uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] mb-8">
                  {winner?.nickname || t("bar.unknown")}
                </h1>
                <p className="text-3xl font-mono text-emerald-400 bg-emerald-400/10 px-8 py-4 rounded-xl border border-emerald-400/30">
                  {t("vault.codeLabel", room.vault_code ?? "")}
                </p>
                <button
                  onClick={() => updateRoomStatus("lobby", { active_game: "none", vault_winner_id: null, vault_code: "" })}
                  className="mt-16 px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-full uppercase tracking-widest transition-colors shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  {t("common.backToLobby")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}
