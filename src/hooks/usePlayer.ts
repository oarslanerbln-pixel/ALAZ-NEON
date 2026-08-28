import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Player } from "../types/database";

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(Boolean(playerId));
  const [trackedPlayerId, setTrackedPlayerId] = useState(playerId);
  // Bu playerId için en son users/{uid}.total_lifetime_score'a senkronize
  // edilmiş total_score değeri. null = henüz senkron başlangıcı yapılmadı.
  const syncedScoreRef = useRef<number | null>(null);

  // playerId değişince state'i RENDER sırasında sıfırla; effect içinde
  // setState yapmak zincirleme render'a yol açıyordu.
  if (playerId !== trackedPlayerId) {
    setTrackedPlayerId(playerId);
    setPlayer(null);
    setLoading(Boolean(playerId));
  }

  useEffect(() => {
    if (!playerId) return;

    // Yeni oda/oyuncu dokümanı — bu odanın total_score'u 0'dan başlıyor,
    // senkron da sıfırdan başlasın (önceki odanın puanı burada tekrar
    // eklenmemeli). Render sırasında değil, burada (effect içinde) sıfırlanıyor
    // — ref'e render sırasında yazmak React'ın kurallarını ihlal ediyordu.
    syncedScoreRef.current = null;

    const docRef = doc(db, "players", playerId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPlayer({ id: docSnap.id, ...docSnap.data() } as Player);
        } else {
          setPlayer(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching player:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [playerId]);

  // KALICI (lifetime) PUAN SENKRONU
  // users/{uid}.total_lifetime_score eskiden hiçbir yerde güncellenmiyordu:
  // useUserProfile profili oluştururken 0/BRONZE'a sabitliyor, sonra bir daha
  // hiç yazılmıyordu — Lig sistemi baştan beri tamamen süsti (dormant bug).
  //
  // Bu yazmayı HOST yapamaz: Firestore kuralları users/{uid}'ye yazmayı
  // sadece request.auth.uid === uid olduğunda izin veriyor (bkz.
  // firestore.rules) — host farklı bir uid ile yazmaya çalışsa
  // permission-denied alır. O yüzden senkronu oyuncunun KENDİ cihazı, kendi
  // players/{playerId}.total_score değişimini izleyerek yapıyor.
  //
  // total_score bir odada sıfırdan başlayıp round'lar boyunca birikiyor;
  // burada HER seferinde tüm değeri eklemek yerine sadece bir önceki
  // senkrona göre ARADAKİ FARKI (delta) increment() ile ekliyoruz — aksi
  // halde her Firestore güncellemesinde puan katbekat şişerdi.
  useEffect(() => {
    if (!player || !player.uid || player.uid === "anonymous") return;
    const current = player.total_score || 0;

    if (syncedScoreRef.current === null) {
      // İlk gözlem: bu anki değeri "zaten senkron" say, sadece BUNDAN
      // SONRAKİ artışları lifetime'a ekle (sayfa yenilemesinde puanı
      // ikinci kez eklememek için).
      syncedScoreRef.current = current;
      return;
    }

    const delta = current - syncedScoreRef.current;
    syncedScoreRef.current = current;
    if (delta === 0) return;

    // "Tekrar Oyna" (host resetGame) HER modda total_score'u 0'a
    // sıfırlıyor (bkz. HostDisplayClassic/HostQuizDisplay/
    // HostSensorDisplay/HostBombDisplay resetGame). Bu, buradan bakınca
    // dev bir NEGATİF delta gibi görünür — kontrol etmezsek her "yeni oyun"
    // oyuncunun kalıcı lig puanından o ana kadar kazandığını SİLERDİ. 0'a
    // dönüşü (gerçek bir düşüş değil, oda sıfırlaması) senkron dışı bırakıp
    // sadece yeni baseline'a geçiyoruz; küçük düzeltmeler (ör. hakem bir
    // cevabı geçersiz kılınca puanın azalması) her zamanki gibi işleniyor.
    if (current === 0 && delta < 0) return;

    const userRef = doc(db, "users", player.uid);
    updateDoc(userRef, {
      total_lifetime_score: increment(delta),
    }).catch((err) => {
      console.error("[usePlayer] Kalıcı puan senkronu başarısız:", err);
    });
  }, [player]);

  return { player, loading, totalScore: player?.total_score || 0 };
}
