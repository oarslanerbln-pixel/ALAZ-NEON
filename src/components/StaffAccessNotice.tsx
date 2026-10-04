import { Link, useLocation } from "react-router-dom";
import { signOut, type User } from "firebase/auth";

import { auth } from "../lib/firebase";
import { useLocale } from "../hooks/useLocale";

interface Props {
  /** Ekran başlığı — yetki yokken de gösteriliyor ki kullanıcı nerede olduğunu bilsin. */
  title: string;
  /** Oturum sahibi; null ise hiç giriş yapılmamış. */
  user: User | null;
}

/**
 * Personel gerektiren ekranların (mekan ayarları, ödül doğrulama, gecelik
 * rapor, oyun kurulumu) ortak "yetkin yok" ekranı.
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
  const { t } = useLocale();
  const location = useLocation();
  // useAuth her ziyaretçiyi anonim oturumla açıyor: anonim hesap "giriş
  // yapılmamış" demek. Eskiden bu durumda giriş bağlantısı yerine "bu hesap
  // personel değil" çıkıyordu ve TV'deki kurulum ekranından çıkış yolu yoktu.
  const signedIn = user !== null && !user.isAnonymous;
  const loginHref = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center gap-6">
      <h1 className="text-2xl font-black uppercase tracking-widest text-alaz-orange">{title}</h1>

      {!signedIn ? (
        <>
          <p className="text-white/50 max-w-sm">{t("staff.loginRequired")}</p>
          <Link
            to={loginHref}
            className="px-8 py-3 bg-alaz-orange text-black font-black uppercase tracking-widest rounded-xl"
          >
            {t("staff.login")}
          </Link>
        </>
      ) : (
        <>
          {/* Giriş yapılmış ama hesap personel listesinde değil. Sıradan bir
              oyuncu hesabıyla /admin adresine gelmenin normal sonucu — hata
              değil. Eskiden bu hesap ekranı açıp gerçekten yazabiliyordu. */}
          <p className="text-white/50 max-w-sm">
            {t("staff.notStaff", user.email || t("staff.thisAccount"))}
          </p>
          <p className="text-white/30 text-xs max-w-sm">{t("staff.ownerHint")}</p>
          <code className="text-[10px] text-white/40 bg-white/5 border border-white/10 px-3 py-2 rounded-lg break-all max-w-sm">
            staff/{user.uid}
          </code>
          <button
            onClick={() => signOut(auth)}
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            {t("staff.signOut")}
          </button>
        </>
      )}
    </div>
  );
}
