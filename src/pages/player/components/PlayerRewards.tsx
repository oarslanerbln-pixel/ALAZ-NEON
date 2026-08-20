import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { db, auth } from "../../../lib/firebase";
import type { Reward } from "../../../types/database";
import { useVenue } from "../../../contexts/VenueContextCore";
import { useLocale } from "../../../hooks/useLocale";

export function PlayerRewards() {
  const { venue } = useVenue();
  const { t } = useLocale();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReward, setOpenReward] = useState<Reward | null>(null);

  // `auth.currentUser` bir effect bağımlılığı olarak reaktif değil (bkz.
  // useUserProfile.ts'teki aynı düzeltme) — ayrıca eski kod auth henüz
  // çözülmemişken sadece `return` yapıp `loading`'i hiç false'a çekmiyordu,
  // bu da bileşeni sonsuza kadar spinner'da bırakabiliyordu.
  //
  // Tek seferlik `getDocs` yerine `onSnapshot` kullanıyoruz: oyun biterken
  // ödül tam bu ekran açıkken kazanılıyor (bkz. lib/rewards.ts), tek seferlik
  // sorgu olsaydı oyuncu sayfayı yenilemeden yeni ödülü hiç göremezdi.
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setRewards([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const q = query(
        collection(db, "rewards"),
        where("uid", "==", user.uid),
        where("status", "==", "available"),
      );
      const unsubscribeRewards = onSnapshot(
        q,
        (snapshot) => {
          const fetched = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Reward,
          );
          setRewards(fetched);
          setLoading(false);
        },
        (err) => {
          console.error("Failed to listen to rewards", err);
          setLoading(false);
        },
      );
      return unsubscribeRewards;
    });

    return () => unsubscribeAuth();
  }, []);

  // Aktif ödül listesi değişince (ör. kullanılan bir ödül artık "available"
  // gelmiyor) açık modal referansı geçersizleşmiş olabilir. Effect içinde
  // senkron setState yerine RENDER SIRASINDA düzeltiyoruz (React'in "prop
  // değişince state'i ayarla" deseni) — bu dosyanın PlayerJoin/PlayerQuiz
  // Controller'daki gibi kurulu örüntüsü; effect'te yapmak fazladan bir
  // render turu doğururdu.
  if (openReward && !rewards.some((r) => r.id === openReward.id)) {
    setOpenReward(null);
  }

  // Bu mekanda ödül sistemi kapalıysa panel hiç görünmez — daha önce her
  // mekanda (kapalı olsa bile) "KULLANILABİLİR ÖDÜL BULUNMUYOR" gösteren,
  // hiçbir zaman dolmayan boş bir panel vardı.
  if (!venue.rewards_enabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-4">
        <div className="w-4 h-4 border-2 border-[#ff003c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="w-full border border-white/10 bg-black/20 p-4 text-center">
        <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-bold">{t("rewards.none")}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-[#ff003c] animate-pulse" />
        <h3 className="text-[#ff003c] text-xs font-bold uppercase tracking-widest">{t("rewards.active")}</h3>
      </div>

      <AnimatePresence>
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full border border-[#ff003c]/30 bg-[#ff003c]/5 p-4 flex justify-between items-center group hover:bg-[#ff003c]/10 transition-colors"
          >
            <div>
              <p className="text-[#ff003c] font-bold tracking-widest text-sm uppercase">{reward.title}</p>
              <p className="text-white/60 text-[10px] tracking-wider mt-1">{reward.description}</p>
            </div>
            <button
              onClick={() => setOpenReward(reward)}
              className="px-3 py-2 bg-[#ff003c]/20 border border-[#ff003c]/50 text-[#ff003c] text-[10px] uppercase font-bold tracking-widest group-hover:bg-[#ff003c] group-hover:text-black transition-colors"
            >
              {t("rewards.use")}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/*
        Kod + QR modalı: personel barda ya doğrudan kodu okuyup /admin/venue
        doğrulama ekranına yazacak ya da telefonun QR'ını okutacak. İkisi de
        aynı `reward.code`'a bakıyor, tek doğruluk kaynağı Firestore.
      */}
      <AnimatePresence>
        {openReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setOpenReward(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-black border-2 border-[#ff003c] p-8 flex flex-col items-center gap-6 relative shadow-[0_0_60px_rgba(255,0,60,0.35)]"
            >
              <button
                onClick={() => setOpenReward(null)}
                className="absolute top-3 right-3 text-white/40 hover:text-white text-xl leading-none"
                aria-label={t("rewards.close")}
              >
                ✕
              </button>

              <div className="text-center">
                <p className="text-[#ff003c] font-black tracking-widest text-lg uppercase">
                  {openReward.title}
                </p>
                {openReward.description && (
                  <p className="text-white/50 text-xs mt-1">{openReward.description}</p>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={openReward.code} size={160} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>

              <div className="text-center">
                <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] mb-1">{t("rewards.codeLabel")}</p>
                <p className="text-white font-mono font-black text-3xl tracking-[0.3em]">{openReward.code}</p>
              </div>

              <p className="text-white/40 text-[10px] text-center uppercase tracking-widest">
                {t("rewards.showAtCounter")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
