import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useIsStaff } from "../../hooks/useIsStaff";
import { StaffAccessNotice } from "../../components/StaffAccessNotice";
import type { Reward } from "../../types/database";
import { errorMessage } from "../../lib/errors";

const REWARD_TYPE_LABEL: Record<Reward["type"], string> = {
  drink: "İçecek",
  discount: "İndirim",
  special: "Özel",
};

/**
 * Personel tarafı: barda/kapıda ödül kodunu doğrulayıp "kullanıldı" olarak
 * işaretleme ekranı. VenueSettings ile aynı personel yetkisine
 * kilitli (bkz. firestore.rules) — anonim host/oyuncu oturumları artık
 * `status` alanını "claimed"a çeviremiyor, bu sayfa dışında hiçbir yerden.
 *
 * Kamera taramalı QR okuma BİLİNÇLİ olarak yok: yeni bir npm bağımlılığı
 * (jsQR/html5-qrcode) gerektirir, düşük ışıkta/çizik ekranda güvenilmez
 * çalışır. 6 haneli okunaklı kod elle girmek her cihazda çalışır ve barda
 * gerçekten daha hızlıdır — oyuncu ekranındaki QR ise kendi telefonuyla
 * fotoğraf gibi göstermek isteyenler için orada duruyor.
 */
export function RewardVerify() {
  const navigate = useNavigate();
  const { user: authUser, isStaff } = useIsStaff();

  const [code, setCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [found, setFound] = useState<(Reward & { id: string }) | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedNickname, setRedeemedNickname] = useState<string | null>(null);

  useEffect(() => {
  }, []);


  const resetLookup = () => {
    setFound(null);
    setErrorMsg("");
    setRedeemedNickname(null);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    resetLookup();
    setSearching(true);
    try {
      const q = query(collection(db, "rewards"), where("code", "==", normalized));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setErrorMsg("Bu kodla eşleşen bir ödül bulunamadı.");
        return;
      }
      const docSnap = snapshot.docs[0];
      setFound({ id: docSnap.id, ...docSnap.data() } as Reward & { id: string });
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const isExpired = (r: Reward) =>
    r.status === "available" && !!r.expires_at && Date.now() > r.expires_at;

  const handleRedeem = async () => {
    if (!found) return;
    // Ekrandaki "Onayla" butonu zaten süresi dolmuşken gizleniyor ama bu
    // fonksiyon başka bir yoldan (ör. eski bir sekmede kalmış state) yine de
    // çağrılabilir — son kontrol burada.
    if (isExpired(found)) {
      setErrorMsg("Bu ödülün süresi dolmuş, kullanılamaz.");
      return;
    }
    setRedeeming(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "rewards", found.id), {
        status: "claimed",
        claimed_at: Date.now(),
      });
      setRedeemedNickname(found.nickname);
      setFound(null);
      setCode("");
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setRedeeming(false);
    }
  };

  // Oturum ya da personel kaydı henüz çözülmedi.
  if (authUser === undefined || (authUser && isStaff === undefined)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        Yükleniyor...
      </div>
    );
  }

  if (!authUser || !isStaff) {
    return <StaffAccessNotice title="Ödül Doğrula" user={authUser} />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-inter">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-alaz-orange">
              Ödül Doğrula
            </h1>
            <p className="text-white/40 text-xs mt-2">{authUser.email}</p>
          </div>
          <button
            onClick={() => signOut(auth).then(() => navigate("/"))}
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white border border-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            Çıkış Yap
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <Link
            to="/admin/venue"
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
          >
            ← Mekan Ayarları
          </Link>
          <Link
            to="/admin/report"
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
          >
            Gecelik Rapor →
          </Link>
        </div>

        <form onSubmit={handleLookup} className="space-y-4 mb-8">
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">
            Ödül Kodu
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ÖRN: A3F9K2"
              autoFocus
              autoCapitalize="characters"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-2xl tracking-[0.2em] text-center focus:outline-none focus:border-alaz-orange transition-all uppercase"
            />
            <button
              type="submit"
              disabled={searching || !code.trim()}
              className="px-6 bg-alaz-orange text-black font-black uppercase tracking-widest rounded-2xl disabled:opacity-40 transition-all"
            >
              {searching ? "..." : "Bul"}
            </button>
          </div>
        </form>

        {errorMsg && (
          <p className="text-[#ff003c] text-sm font-bold bg-[#ff003c]/10 border border-[#ff003c]/30 rounded-xl px-4 py-3 mb-6">
            {errorMsg}
          </p>
        )}

        {redeemedNickname && (
          <div className="text-center bg-green-500/10 border border-green-500/40 rounded-2xl px-6 py-8 mb-6">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-green-400 font-black uppercase tracking-widest">
              Onaylandı
            </p>
            <p className="text-white/60 text-sm mt-1">{redeemedNickname} için ödül kullanıldı.</p>
          </div>
        )}

        {found && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            {found.status === "claimed" ? (
              <div className="text-center py-4">
                <p className="text-[#ff003c] font-black uppercase tracking-widest mb-2">
                  Bu ödül zaten kullanılmış
                </p>
                <p className="text-white/40 text-xs">
                  {found.claimed_at
                    ? new Date(found.claimed_at).toLocaleString("tr-TR")
                    : ""}
                </p>
              </div>
            ) : isExpired(found) ? (
              <div className="text-center py-4">
                <p className="text-[#ff003c] font-black uppercase tracking-widest mb-2">
                  Bu ödülün süresi dolmuş
                </p>
                <p className="text-white/40 text-xs mb-1">
                  {found.nickname} · {found.title}
                </p>
                <p className="text-white/30 text-[11px]">
                  Son geçerlilik: {new Date(found.expires_at!).toLocaleString("tr-TR")}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Oyuncu</p>
                  <p className="text-xl font-black">{found.nickname}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Ödül</p>
                  <p className="text-alaz-orange font-bold uppercase tracking-widest">{found.title}</p>
                  {found.description && (
                    <p className="text-white/50 text-sm mt-1">{found.description}</p>
                  )}
                  <p className="text-white/30 text-[11px] mt-2 uppercase tracking-widest">
                    {REWARD_TYPE_LABEL[found.type]}
                  </p>
                  {found.expires_at && (
                    <p className="text-white/30 text-[11px] mt-1">
                      Son geçerlilik: {new Date(found.expires_at).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="w-full py-4 bg-gradient-to-r from-alaz-orange to-[#ff003c] text-white font-black uppercase tracking-widest rounded-2xl disabled:opacity-50 transition-all"
                >
                  {redeeming ? "Onaylanıyor..." : "Ödülü Onayla ve Kullan"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
