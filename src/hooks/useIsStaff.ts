import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export interface StaffState {
  /** Oturum çözülene kadar undefined; sonra hesap ya da null. */
  user: User | null | undefined;
  /** Hesap personel listesinde mi. Oturum/kayıt çözülene kadar undefined. */
  isStaff: boolean | undefined;
}

/**
 * "Bu hesap işletme personeli mi?" sorusunun tek cevap yeri.
 *
 * Önceden her yönetim ekranı bunu kendi başına `providerData` içinde
 * "password" sağlayıcısı arayarak karar veriyordu. Ama /register herkese
 * açık bir oyuncu kayıt ekranı ve orada da e-posta/şifre hesabı açılıyor —
 * yani o kontrol "kayıt olan herkes personeldir" demekti. Yetkinin kaynağı
 * artık Firestore'daki staff/{uid} dokümanı; bu doküman hiçbir istemciden
 * yazılamıyor (bkz. firestore.rules), yalnızca Firebase Console'dan ya da
 * Admin SDK ile ekleniyor.
 *
 * Kural okumayı yalnızca kişinin KENDİ kaydına açtığı için burada yapılan
 * dinleme hiçbir zaman izin hatası vermiyor: kayıt yoksa doküman "yok"
 * olarak dönüyor.
 */
export function useIsStaff(): StaffState {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  /**
   * Cevabı hangi hesap için aldığımızı da tutuyoruz: hesap değiştiğinde
   * (çıkış → başka hesapla giriş) önceki hesabın cevabı bir an için yeni
   * hesaba ait sanılmasın diye. Efekt gövdesinde setState yok — durum
   * yalnızca dinleyici geri çağrılarından güncelleniyor.
   */
  const [answer, setAnswer] = useState<{ uid: string; isStaff: boolean } | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    return onSnapshot(
      doc(db, "staff", uid),
      (snap) => setAnswer({ uid, isStaff: snap.exists() }),
      (err) => {
        console.error("[useIsStaff] Personel kaydı okunamadı:", err);
        // Hata hâlinde yetki VERMİYORUZ: güvenlik kararı her zaman kapalı
        // tarafa düşmeli.
        setAnswer({ uid, isStaff: false });
      },
    );
  }, [user]);

  const isStaff =
    user === undefined
      ? undefined // oturum henüz çözülmedi
      : user === null
        ? false // giriş yok
        : answer?.uid === user.uid
          ? answer.isStaff
          : undefined; // bu hesabın kaydı henüz okunmadı

  return { user, isStaff };
}
