import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../../../lib/firebase";
import type { Reward } from "../../../types/database";

export function PlayerRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // `auth.currentUser` bir effect bağımlılığı olarak reaktif değil (bkz.
  // useUserProfile.ts'teki aynı düzeltme) — ayrıca eski kod auth henüz
  // çözülmemişken sadece `return` yapıp `loading`'i hiç false'a çekmiyordu,
  // bu da bileşeni sonsuza kadar spinner'da bırakabiliyordu.
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setRewards([]);
        setLoading(false);
        return;
      }

      const fetchRewards = async () => {
        setLoading(true);
        try {
          const q = query(
            collection(db, "rewards"),
            where("uid", "==", user.uid),
            where("status", "==", "available")
          );
          const snapshot = await getDocs(q);
          const fetchedRewards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
          setRewards(fetchedRewards);
        } catch (err) {
          console.error("Failed to fetch rewards", err);
        } finally {
          setLoading(false);
        }
      };

      fetchRewards();
    });

    return () => unsubscribeAuth();
  }, []);

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
        <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-bold">KULLANILABİLİR ÖDÜL BULUNMUYOR</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-[#ff003c] animate-pulse" />
        <h3 className="text-[#ff003c] text-xs font-bold uppercase tracking-widest">AKTİF ÖDÜLLER</h3>
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
            <button className="px-3 py-2 bg-[#ff003c]/20 border border-[#ff003c]/50 text-[#ff003c] text-[10px] uppercase font-bold tracking-widest group-hover:bg-[#ff003c] group-hover:text-black transition-colors">
              KULLAN
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
