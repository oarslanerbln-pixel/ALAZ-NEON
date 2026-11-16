import { Link } from "react-router-dom";
import { signOut, type User } from "firebase/auth";

import { auth } from "../lib/firebase";
import { useLocale } from "../hooks/useLocale";
import type { TranslationKey } from "../lib/i18n";

interface Props {
  /** Ekran başlığının çeviri anahtarı — yetki yokken de gösteriliyor ki kullanıcı nerede olduğunu bilsin. */
  titleKey: TranslationKey;
  /** Oturum sahibi; null ise hiç giriş yapılmamış. */
  user: User | null;
}

/**
 * Yönetim ekranlarının (mekan ayarları, ödül doğrulama, gecelik rapor)
 * ortak "yetkin yok" ekranı.
 *
 * Üç ekran da aynı kontrolü kendi içinde tekrarlıyordu ve üçü de yanlış
 * soruyu soruyordu: "e-posta/şifre ile mi girdin?". /register herkese açık
 * olduğu (sayfa kalktı ama Auth API'si hâlâ açık) için bu pratikte "kayıt
 * oldun mu?" demekti. Kontrol artık
 * useIsStaff() içinde tek yerde ve doğru soruyu soruyor: "staff/{uid}
 * kaydın var mı?".
 *
 * Bu bileşen bir GÜVENLİK SINIRI DEĞİL, arayüz kolaylığı: asıl sınır
 * firestore.rules'taki isStaff(). Buradaki kontrol atlansa bile yazma
 * işlemleri sunucu tarafında reddedilir.
 */
export function StaffAccessNotice({ titleKey, user }: Props) {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center gap-6">
      <h1 className="text-2xl font-black uppercase tracking-widest text-alaz-orange">{t(titleKey)}</h1>

      {!user ? (
        <>
          <p className="text-white/50 max-w-sm">
            {t("staff.loginRequired")}
          </p>
          <Link
            to="/login"
            className="px-8 py-3 bg-alaz-orange text-black font-black uppercase tracking-widest rounded-xl"
          >
            {t("host.login")}
          </Link>
        </>
      ) : (
        <>
          {/* Giriş yapılmış ama hesap personel listesinde değil. Sıradan bir
              oyuncu hesabıyla /admin adresine gelmenin normal sonucu — hata
              değil. Eskiden bu hesap ekranı açıp gerçekten yazabiliyordu. */}
          <p className="text-white/50 max-w-sm">
            <span className="text-white/80 font-bold">{user.email || t("staff.thisAccount")}</span>{" "}
            {t("staff.notStaff")}
          </p>
          <p className="text-white/30 text-xs max-w-sm">
            {t("staff.ownerHint")}
          </p>
          <code className="text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-2 rounded-lg break-all max-w-sm">
            staff/{user.uid}
          </code>
          <button
            onClick={() => signOut(auth)}
            className="text-xs uppercase tracking-widest text-white/40 hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            {t("profile.logout")}
          </button>
        </>
      )}
    </div>
  );
}
