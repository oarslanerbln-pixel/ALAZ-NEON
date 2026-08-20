import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useVenue } from "../../contexts/VenueContextCore";
import { DEFAULT_VENUE_CONFIG, type Reward } from "../../types/database";
import { errorMessage } from "../../lib/errors";

const REWARD_TYPE_OPTIONS: { value: Reward["type"]; label: string }[] = [
  { value: "drink", label: "İçecek" },
  { value: "discount", label: "İndirim" },
  { value: "special", label: "Özel" },
];

/**
 * Aktif mekan markasını düzenleme ekranı — yalnızca satıcı/işletme sahibi
 * için. Bir sonraki demo/satış görüşmesi öncesi marka adı, logo ve ana
 * rengi buradan değiştirilir; kaydedilince landing/login/host kurulumu
 * anında yeni markayla güncellenir (canlı Firestore dinleyicisi üzerinden).
 *
 * Erişim e-posta/şifre ile girişe bağlı (bkz. firestore.rules) — anonim
 * host/oyuncu oturumları bu dokümana yazamaz, sadece okuyabilir.
 */
export function VenueSettings() {
  const navigate = useNavigate();
  const { venue } = useVenue();
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ff5500");
  const [rewardsEnabled, setRewardsEnabled] = useState(true);
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [rewardType, setRewardType] = useState<Reward["type"]>("drink");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setAuthUser);
  }, []);

  // Context'ten gelen canlı değeri form alanlarına yansıt (yalnızca ilk
  // yüklemede/dışarıdan değişince — kullanıcı yazarken üzerine yazma).
  useEffect(() => {
    setName(venue.name);
    setLogoUrl(venue.logo_url || "");
    setPrimaryColor(venue.primary_color || DEFAULT_VENUE_CONFIG.primary_color!);
    setRewardsEnabled(venue.rewards_enabled);
    setRewardTitle(venue.reward_title || "");
    setRewardDescription(venue.reward_description || "");
    setRewardType(venue.reward_type || "drink");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPasswordAuthed =
    !!authUser && authUser.providerData.some((p) => p.providerId === "password");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMsg("");
    setSaving(true);
    try {
      await setDoc(doc(db, "app_config", "active_venue"), {
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        primary_color: primaryColor,
        rewards_enabled: rewardsEnabled,
        reward_title: rewardTitle.trim(),
        reward_description: rewardDescription.trim(),
        reward_type: rewardType,
        updated_at: Date.now(),
      });
      setSavedAt(Date.now());
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Auth durumu henüz bilinmiyor
  if (authUser === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        Yükleniyor...
      </div>
    );
  }

  // Anonim (host/oyuncu) oturum ya da hiç oturum yok — gerçek girişe yönlendir
  if (!isPasswordAuthed) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center gap-6">
        <h1 className="text-2xl font-black uppercase tracking-widest text-alaz-orange">
          Mekan Ayarları
        </h1>
        <p className="text-white/50 max-w-sm">
          Bu ekran yalnızca işletme hesabıyla giriş yapıldığında açılır.
        </p>
        <Link
          to="/login"
          className="px-8 py-3 bg-alaz-orange text-black font-black uppercase tracking-widest rounded-xl"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-inter">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-alaz-orange">
              Mekan Ayarları
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

        <form onSubmit={handleSave} className="space-y-8">
          {errorMsg && (
            <p className="text-[#ff003c] text-xs font-bold bg-[#ff003c]/10 border border-[#ff003c]/30 rounded-xl px-4 py-3">
              {errorMsg}
            </p>
          )}

          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Mekan Adı
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: LUNA Rooftop"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange transition-all"
            />
            <p className="text-white/30 text-[11px]">
              Landing, giriş ekranı ve host başlığında görünen isim. Boş bırakılırsa varsayılan HENGAME markası kullanılır.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Logo URL (opsiyonel)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Ana Renk
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-16 rounded-2xl border border-white/10 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-alaz-orange transition-all"
              />
            </div>
            <p className="text-white/30 text-[11px]">
              Uygulama genelindeki turuncu vurgu rengini değiştirir (bomba/quiz/sensör kendi neon renklerini korur).
            </p>
          </div>

          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest">Ödül Sistemi</div>
              <p className="text-white/40 text-[11px] mt-1">
                Kapalıysa oyuncu ekranında ödül paneli hiç görünmez.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRewardsEnabled((v) => !v)}
              className={`w-14 h-8 rounded-full relative transition-colors shrink-0 ${
                rewardsEnabled ? "bg-alaz-orange" : "bg-white/10"
              }`}
            >
              <motion.div
                animate={{ x: rewardsEnabled ? 24 : 4 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.3 }}
                className="absolute top-1 w-6 h-6 rounded-full bg-white"
              />
            </button>
          </div>

          {/*
            Ödül şablonu: her mekan kendi ödülünü kod yazmadan tanımlıyor.
            Başlık boşsa oyun sonunda hiç ödül üretilmiyor (bkz. lib/
            rewards.ts) — toggle açık ama şablon boşken sahte ödül
            dağıtılmasın diye.
          */}
          {rewardsEnabled && (
            <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl px-6 py-6">
              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Ödül Başlığı
                </label>
                <input
                  type="text"
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="Örn: Ücretsiz Espresso"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange transition-all"
                />
                <p className="text-white/30 text-[11px]">
                  Boş bırakılırsa oyun bittiğinde hiç ödül dağıtılmaz — sistemi kapatmadan geçici olarak durdurmanın yolu.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Ödül Açıklaması (opsiyonel)
                </label>
                <input
                  type="text"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  placeholder="Örn: Barda kod ile geçerli, 1 kişi/gece"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Ödül Tipi
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {REWARD_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRewardType(opt.value)}
                      className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
                        rewardType === opt.value
                          ? "bg-alaz-orange border-alaz-orange text-black"
                          : "bg-black/40 border-white/10 text-white/50 hover:border-white/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-white/30 text-[11px]">
                Kazanan: bireysel modda en yüksek puanlı oyuncu (veya beraberlikte hepsi); takım modunda kazanan takımın tüm üyeleri; bomba modunda son ayakta kalan oyuncu. Oyun bittiği an otomatik dağıtılır.
              </p>

              <Link
                to="/admin/rewards"
                className="block text-center text-[10px] uppercase tracking-widest text-alaz-orange hover:text-white border border-alaz-orange/30 hover:border-white/30 rounded-xl py-3 transition-colors"
              >
                Ödül Doğrulama Ekranına Git →
              </Link>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-gradient-to-r from-alaz-orange to-[#ff003c] text-white font-black text-lg rounded-2xl uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {saving ? "Kaydediliyor..." : "Markayı Kaydet"}
          </motion.button>

          {savedAt && (
            <p className="text-center text-green-400 text-xs font-bold uppercase tracking-widest">
              Kaydedildi — tüm ekranlar güncellendi
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
