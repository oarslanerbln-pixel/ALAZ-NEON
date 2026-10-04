import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { nextUnityReport, unityInputPayload } from "../../../lib/clientWrites";
import { reportWriteError } from "../../../lib/writeErrors";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import type { Room, Player } from "../../../types/database";
import { NeonIcon } from "../../../components/NeonIcon";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerUnityController({ room, player }: Props) {
  const { t } = useLocale();
  const [localClicks, setLocalClicks] = useState(0);
  const clickBuffer = useRef(0);
  const controls = useAnimation();

  // Bu tur için en son bildirilen toplam. Dokunuşlar eskiden oda
  // dokümanındaki unity_current'a increment ile yazılıyordu: kuralda böyle
  // bir izin yoktu (her dokunuş reddediliyordu) ve olsa da 30 telefonun tek
  // dokümana saniyede yazması hem yazma sınırını hem okuma kotasını aşardı.
  // Artık her telefon kendi giriş kaydına bu turdaki toplamını yazıyor;
  // host toplayıp odaya yazıyor (bkz. lib/roomInputs.ts).
  const reported = useRef<{ round: number; clicks: number } | null>(null);

  // Batch flush clicks every 1 second
  useEffect(() => {
    const round = room.input_round;
    if (room.status !== "unity_active" || typeof round !== "number") return;
    if (reported.current?.round !== round) {
      // Yeni tur: önceki oyundan kalmış bekleyen dokunuşlar bu tura sayılmasın.
      reported.current = { round, clicks: 0 };
      clickBuffer.current = 0;
    }

    const interval = setInterval(() => {
      const state = reported.current;
      if (!state || clickBuffer.current === 0) return;
      // Kural tek yazmada en fazla UNITY_MAX_STEP artışa izin veriyor;
      // birikmiş fazlası sonraki saniyelere kalıyor.
      const next = nextUnityReport(state.clicks, state.clicks + clickBuffer.current);
      const step = next - state.clicks;
      clickBuffer.current -= step;
      state.clicks = next;

      setDoc(doc(db, "rooms", room.id, "inputs", player.id), unityInputPayload(round, next)).catch(
        (err) => {
          // Toplam mutlak değer olduğu için geri alıp yeniden denemek güvenli.
          state.clicks -= step;
          clickBuffer.current += step;
          reportWriteError("unity_input", err);
        },
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [room.id, room.status, room.input_round, player.id]);

  const handleTap = () => {
    if (room.status !== "unity_active") return;
    
    // Haptic feedback if supported
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      try { window.navigator.vibrate(20); } catch { /* ignore */ }
    }

    SoundManager.getInstance().playSFX(sounds.CLICK);
    
    setLocalClicks(prev => prev + 1);
    clickBuffer.current += 1;

    controls.start({
      scale: [1, 0.9, 1],
      transition: { duration: 0.1 }
    });
  };

  const isFinished = room.status === "unity_reveal";
  const target = room.unity_target || 1;
  const current = room.unity_current || 0;
  const isWin = current >= target;

  return (
    <div className="flex flex-col h-full bg-black touch-none">
      <div className="p-4 text-center border-b border-white/10 shrink-0">
        <h2 className="text-xl font-black text-amber-400 tracking-widest uppercase">
          {t("player.unityTitle", "NEON BİRLİK")}
        </h2>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {isFinished ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center z-10"
          >
            {isWin ? (
              <>
                <NeonIcon type="flame" color="orange" className="w-32 h-32 mx-auto mb-6" />
                <h1 className="text-5xl font-black text-amber-400 uppercase tracking-widest mb-2">{t("unity.success")}</h1>
                <p className="text-white">{t("unity.surgeHappened")}</p>
              </>
            ) : (
              <>
                <h1 className="text-5xl font-black text-red-500 uppercase tracking-widest mb-2">{t("unity.failed")}</h1>
                <p className="text-white/50">{t("unity.notEnough")}</p>
              </>
            )}
          </motion.div>
        ) : (
          <>
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.5)_0%,transparent_70%)]" />
            
            <motion.button
              animate={controls}
              onPointerDown={handleTap}
              className="w-full max-w-[300px] aspect-square rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center border-8 border-white/20 active:border-white/50 active:shadow-[0_0_100px_rgba(245,158,11,0.8)] relative z-10"
            >
              <span className="text-5xl font-black text-white mix-blend-overlay uppercase tracking-widest">
                BAS!
              </span>
              <span className="text-white/80 font-bold mt-2">
                Senin Katkın: {localClicks}
              </span>
            </motion.button>
            
            <p className="mt-12 text-center text-amber-400/50 font-bold tracking-widest uppercase animate-pulse">
              {t("unity.watchTimer")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
