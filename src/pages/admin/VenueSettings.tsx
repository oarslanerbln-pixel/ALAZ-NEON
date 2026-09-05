import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useIsStaff } from "../../hooks/useIsStaff";
import { StaffAccessNotice } from "../../components/StaffAccessNotice";
import { useVenue } from "../../contexts/VenueContextCore";
import { DEFAULT_VENUE_CONFIG, type Reward, type SponsorAd, type WheelSlice } from "../../types/database";
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
 * Erişim personel listesine bağlı: yalnızca staff/{uid} kaydı olan hesap
 * yazabiliyor (bkz. firestore.rules isStaff()). Anonim host/oyuncu
 * oturumları ve sıradan kayıtlı hesaplar bu dokümanı sadece okuyabilir.
 */
export function VenueSettings() {
  const navigate = useNavigate();
  const { venue } = useVenue();
  const { user: authUser, isStaff } = useIsStaff();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ff5500");
  const [rewardsEnabled, setRewardsEnabled] = useState(true);
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [rewardType, setRewardType] = useState<Reward["type"]>("drink");
  const [rewardValidityDays, setRewardValidityDays] = useState(30);
  const [promoImages, setPromoImages] = useState<string[]>([]);
  const [newPromoUrl, setNewPromoUrl] = useState("");
  const [sponsorAds, setSponsorAds] = useState<SponsorAd[]>([]);
  const [newAdUrl, setNewAdUrl] = useState("");
  const [newAdSponsor, setNewAdSponsor] = useState("");
  const [newAdDuration, setNewAdDuration] = useState(10);
  const [newAdType, setNewAdType] = useState<"image" | "video">("image");

  const [wheelSlices, setWheelSlices] = useState<WheelSlice[]>([]);
  const [newSliceText, setNewSliceText] = useState("");
  const [newSliceColor, setNewSliceColor] = useState("#ffffff");
  const [newSliceWeight, setNewSliceWeight] = useState(1);
  
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
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
    setRewardValidityDays(venue.reward_validity_days ?? DEFAULT_VENUE_CONFIG.reward_validity_days!);
    setPromoImages(venue.promo_images || []);
    setSponsorAds(venue.sponsor_ads || []);
    setWheelSlices(venue.wheel_slices || DEFAULT_VENUE_CONFIG.wheel_slices || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPromoImage = () => {
    const url = newPromoUrl.trim();
    if (!url) return;
    setPromoImages((prev) => [...prev, url]);
    setNewPromoUrl("");
  };

  const removePromoImage = (index: number) => {
    setPromoImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSponsorAd = () => {
    if (!newAdUrl.trim() || !newAdSponsor.trim()) return;
    setSponsorAds(prev => [...prev, {
      id: crypto.randomUUID(),
      type: newAdType,
      url: newAdUrl.trim(),
      sponsor_name: newAdSponsor.trim(),
      duration_seconds: newAdDuration
    }]);
    setNewAdUrl("");
    setNewAdSponsor("");
  };

  const removeSponsorAd = (id: string) => {
    setSponsorAds(prev => prev.filter(ad => ad.id !== id));
  };

  const addWheelSlice = () => {
    if (!newSliceText.trim()) return;
    setWheelSlices(prev => [...prev, {
      id: crypto.randomUUID(),
      text: newSliceText.trim(),
      color: newSliceColor,
      weight: newSliceWeight
    }]);
    setNewSliceText("");
    setNewSliceWeight(1);
  };

  const removeWheelSlice = (id: string) => {
    setWheelSlices(prev => prev.filter(s => s.id !== id));
  };


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
        reward_validity_days: Math.max(1, Math.round(rewardValidityDays) || 30),
        promo_images: promoImages,
        sponsor_ads: sponsorAds,
        wheel_slices: wheelSlices,
        updated_at: Date.now(),
      });
      setSavedAt(Date.now());
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setSaving(false);
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

  // Giriş yok ya da hesap personel değil — ikisini de tek ekran anlatıyor.
  if (!authUser || !isStaff) {
    return <StaffAccessNotice title="Mekan Ayarları" user={authUser} />;
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

          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Tanıtım Görselleri (opsiyonel)
            </label>
            <p className="text-white/30 text-[11px]">
              Boşta ekranında (TV) şampiyonlar ve "nasıl oynanır" slaytları arasına eklenir — mekanın kendi kampanya/menü görseli. Görseli kendi barındırdığınız bir yere (Instagram, Google Drive genel link vb.) koyup URL'ini buraya yapıştırın.
            </p>
            <div className="flex gap-3">
              <input
                type="url"
                value={newPromoUrl}
                onChange={(e) => setNewPromoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPromoImage();
                  }
                }}
                placeholder="https://..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange transition-all"
              />
              <button
                type="button"
                onClick={addPromoImage}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-colors shrink-0"
              >
                Ekle
              </button>
            </div>
            {promoImages.length > 0 && (
              <ul className="space-y-2">
                {promoImages.map((url, index) => (
                  <li
                    key={`${url}-${index}`}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-black/40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                    <span className="flex-1 text-white/60 text-xs truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removePromoImage(index)}
                      className="text-white/40 hover:text-[#ff003c] transition-colors shrink-0 text-lg leading-none px-2"
                      aria-label="Kaldır"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-6">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-cyber-yellow">DOOH Reklam Ağı (Sponsorlar)</div>
              <p className="text-white/40 text-[11px] mt-1">
                TV ekranında (Host arayüzü) tam ekran gösterilecek reklamlar. İster video (mp4), ister görsel (jpg/png) ekleyin.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newAdSponsor}
                onChange={(e) => setNewAdSponsor(e.target.value)}
                placeholder="Sponsor Adı (örn: Red Bull)"
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-alaz-orange text-sm"
              />
              <input
                type="url"
                value={newAdUrl}
                onChange={(e) => setNewAdUrl(e.target.value)}
                placeholder="Medya URL (https://...)"
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-alaz-orange text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 items-center">
              <select
                value={newAdType}
                onChange={(e) => setNewAdType(e.target.value as "image" | "video")}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-alaz-orange text-sm"
              >
                <option value="image">Görsel (Image)</option>
                <option value="video">Video (MP4)</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={newAdDuration}
                  onChange={(e) => setNewAdDuration(Number(e.target.value))}
                  placeholder="Süre (Sn)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-alaz-orange text-sm"
                />
                <span className="text-xs text-gray-500 font-bold uppercase">SN</span>
              </div>
              <button
                type="button"
                onClick={addSponsorAd}
                className="px-4 py-3 bg-white/10 hover:bg-cyber-yellow hover:text-black text-white font-black uppercase tracking-widest text-xs rounded-xl transition-colors"
              >
                Reklam Ekle
              </button>
            </div>

            {sponsorAds.length > 0 && (
              <ul className="space-y-2 mt-4">
                {sponsorAds.map((ad) => (
                  <li
                    key={ad.id}
                    className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3"
                  >
                    {ad.type === "video" ? (
                      <div className="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center shrink-0 text-xs">🎥</div>
                    ) : (
                      <img src={ad.url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 bg-black/40" />
                    )}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-white text-xs font-bold truncate">{ad.sponsor_name}</div>
                      <div className="text-white/40 text-[10px] truncate">{ad.type.toUpperCase()} • {ad.duration_seconds}sn</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSponsorAd(ad.id)}
                      className="text-white/40 hover:text-[#ff003c] transition-colors shrink-0 text-lg leading-none px-2"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Wheel Slices Panel */}
          <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-6">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-alaz-orange">Çarkıfelek Ayarları</div>
              <p className="text-white/40 text-[11px] mt-1">
                Çarkıfelek mini-oyununda yer alacak dilimleri ve olasılıklarını (Ağırlık) belirleyin.
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-3 items-center">
              <input
                type="text"
                value={newSliceText}
                onChange={(e) => setNewSliceText(e.target.value)}
                placeholder="Ödül (Örn: %10 İndirim)"
                className="col-span-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-alaz-orange text-sm"
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newSliceColor}
                  onChange={(e) => setNewSliceColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer"
                  title="Dilim Rengi"
                />
                <input
                  type="number"
                  min={1}
                  value={newSliceWeight}
                  onChange={(e) => setNewSliceWeight(Number(e.target.value))}
                  placeholder="Ağırlık"
                  title="Olasılık Ağırlığı (Yüksek olan daha çok çıkar)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-alaz-orange text-sm text-center"
                />
              </div>
              <button
                type="button"
                onClick={addWheelSlice}
                className="px-2 py-3 bg-white/10 hover:bg-alaz-orange hover:text-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-colors"
              >
                Dilim Ekle
              </button>
            </div>

            {wheelSlices.length > 0 && (
              <ul className="space-y-2 mt-4 grid grid-cols-2 gap-2">
                {wheelSlices.map((slice) => (
                  <li
                    key={slice.id}
                    className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-3 py-2"
                  >
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-white text-xs font-bold truncate">{slice.text}</div>
                      <div className="text-white/40 text-[10px] truncate">Ağırlık: {slice.weight}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWheelSlice(slice.id)}
                      className="text-white/40 hover:text-[#ff003c] transition-colors shrink-0 text-lg leading-none px-2"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
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

              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Geçerlilik Süresi (Gün)
                </label>
                <input
                  type="number"
                  min={1}
                  value={rewardValidityDays}
                  onChange={(e) => setRewardValidityDays(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange transition-all"
                />
                <p className="text-white/30 text-[11px]">
                  Oyuncu bir ödülü kazandıktan kaç gün sonra kullanamaz hâle gelsin. Zaten dağıtılmış ödülleri etkilemez, yalnızca bundan sonra kazanılanlara uygulanır.
                </p>
              </div>

              <p className="text-white/30 text-[11px]">
                Kazanan: bireysel modda en yüksek puanlı oyuncu (veya beraberlikte hepsi); takım modunda kazanan takımın tüm üyeleri; bomba modunda son ayakta kalan oyuncu. Oyun bittiği an otomatik dağıtılır.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/admin/rewards"
                  className="block text-center text-[10px] uppercase tracking-widest text-alaz-orange hover:text-white border border-alaz-orange/30 hover:border-white/30 rounded-xl py-3 transition-colors"
                >
                  Ödül Doğrula →
                </Link>
                <Link
                  to="/admin/report"
                  className="block text-center text-[10px] uppercase tracking-widest text-alaz-orange hover:text-white border border-alaz-orange/30 hover:border-white/30 rounded-xl py-3 transition-colors"
                >
                  Gecelik Rapor →
                </Link>
              </div>
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
