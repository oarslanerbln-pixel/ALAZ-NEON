import { Link } from "react-router-dom";
import { signOut, type User } from "firebase/auth";

import { auth } from "../lib/firebase";

interface Props {
  /** Ekran başlığı — yetki yokken de gösteriliyor ki kullanıcı nerede olduğunu bilsin. */
  title: string;
  /** Oturum sahibi; null ise hiç giriş yapılmamış. */
  user: User | null;
}

/**
 * Yönetim ekranlarının (mekan ayarları, ödül doğrulama, gecelik rapor)
 * ortak "yetkin yok" ekranı.
 *
 * Üç ekran da aynı kontrolü kendi içinde tekrarlıyordu ve üçü de yanlış
 * soruyu soruyordu: "e-posta/şifre ile mi girdin?". /register herkese açık
 * olduğu için bu pratikte "kayıt oldun mu?" demekti. Kontrol artık
 * useIsStaff() içinde tek yerde ve doğru soruyu soruyor: "staff/{uid}
 * kaydın var mı?".
 *
 * Bu bileşen bir GÜVENLİK SINIRI DEĞİL, arayüz kolaylığı: asıl sınır
 * firestore.rules'taki isStaff(). Buradaki kontrol atlansa bile yazma
 * işlemleri sunucu tarafında reddedilir.
 */
export function StaffAccessNotice({ title, user }: Props) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center gap-6">
      <h1 className="text-2xl font-black uppercase tracking-widest text-alaz-orange">{title}</h1>

      {!user ? (
        <>
          <p className="text-white/50 max-w-sm">
            Bu ekran yalnızca işletme hesabıyla giriş yapıldığında açılır.
          </p>
          <Link
            to="/login"
            className="px-8 py-3 bg-alaz-orange text-black font-black uppercase tracking-widest rounded-xl"
          >
            Giriş Yap
          </Link>
        </>
      ) : (
        <>
          {/* Giriş yapılmış ama hesap personel listesinde değil. Sıradan bir
              oyuncu hesabıyla /admin adresine gelmenin normal sonucu — hata
              değil. Eskiden bu hesap ekranı açıp gerçekten yazabiliyordu. */}
          <p className="text-white/50 max-w-sm">
            <span className="text-white/80 font-bold">{user.email || "Bu hesap"}</span> bir
            işletme personeli hesabı değil. Yönetim ekranları yalnızca mekan sahibinin
            yetkilendirdiği hesaplara açık.
          </p>
          <p className="text-white/30 text-xs max-w-sm">
            Mekan sahibiyseniz: Firebase Console → Firestore → <code>staff</code>{" "}
            koleksiyonuna bu hesabın kimliğiyle bir doküman ekleyin.
          </p>
          <code className="text-[10px] text-white/40 bg-white/5 border border-white/10 px-3 py-2 rounded-lg break-all max-w-sm">
            staff/{user.uid}
          </code>
          <button
            onClick={() => signOut(auth)}
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            Çıkış Yap
          </button>
        </>
      )}
    </div>
  );
}
