import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useLocale } from "../../hooks/useLocale";
import { errorMessage } from "../../lib/errors";
import { PhoneAuth } from "../../components/PhoneAuth";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { PlayerProfileCard } from "./components/PlayerProfileCard";
import { PlayerRewards } from "./components/PlayerRewards";
import { useUserProfile } from "../../hooks/useUserProfile";
import { containsProfanity } from "../../lib/profanity";
import type { Room } from "../../types/database";

export function PlayerJoin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get("code");
  const [roomCode, setRoomCode] = useState(urlCode || "");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [teamName, setTeamName] = useState("");
  const [gameMode, setGameMode] = useState<"individual" | "team">("individual");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const { profile, updateNickname } = useUserProfile();
  const { t } = useLocale();
  const [nicknamePrefilledFrom, setNicknamePrefilledFrom] = useState<string | null>(null);

  // Profile'dan gelen nickname'i RENDER sırasında senkronla (bkz. useRoom.ts
  // vb. aynı desen) — effect içinde yapmak fazladan bir render turu
  // doğuruyordu. nicknamePrefilledFrom, kullanıcı alanı sonradan elle
  // değiştirse bile aynı profile için tekrar üzerine yazmamayı sağlıyor.
  if (profile?.nickname && nicknamePrefilledFrom !== profile.nickname && !nickname) {
    setNickname(profile.nickname);
    setNicknamePrefilledFrom(profile.nickname);
  }

  // App.tsx'in kökünde `useAuth()` HERKESİ (bu sayfaya daha PhoneAuth hiç
  // görünmeden) otomatik olarak anonim oturuma açıyor — bu tüm uygulama için
  // tek bir global Firebase Auth örneği, yani o anonim oturum bu sayfanın
  // KENDİ onAuthStateChanged dinleyicisine de anında yansıyordu. Sonuç: bu
  // sayfa `!currentUser` kontrolüyle "giriş yapılmış mı" diye bakıyordu ama
  // anonim oturum zaten bunu karşılıyordu — PhoneAuth ekranı bir anlığına
  // görünüp oyuncu daha numarasını yazmadan katılım formuna geçiyordu.
  // Telefonla doğrulama böylece FİİLEN hiç zorunlu olmuyordu: leaderboard,
  // ödül ve lig sistemi gerçek bir telefon numarasına değil, rastgele bir
  // anonim uid'e bağlanabiliyordu. isAnonymous kontrolü, gerçekten "phone"
  // sağlayıcısıyla doğrulanmış bir oturum gelene kadar PhoneAuth'u açık
  // tutuyor (bkz. RewardVerify/NightlyReport'taki providerId === "password"
  // ile aynı desen, oradaki de aynı sebepten anonim oturumu personel girişi
  // saymıyor).
  const isPhoneVerified =
    !!currentUser &&
    !currentUser.isAnonymous &&
    currentUser.providerData.some((p) => p.providerId === "phone");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Check room mode when code changes
  useEffect(() => {
    if (roomCode.length === 4) {
      const checkMode = async () => {
        const q = query(collection(db, "rooms"), where("code", "==", roomCode.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setGameMode(data.game_mode || "individual");
        }
      };
      checkMode();
    }
  }, [roomCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const cleanCode = roomCode.trim().toUpperCase();

      const q = query(collection(db, "rooms"), where("code", "==", cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrorMsg(t("join.errorNoRoom"));
        setIsLoading(false);
        return;
      }
      
      const roomDoc = querySnapshot.docs[0];
      const room = { id: roomDoc.id, ...roomDoc.data() } as Room;

      if (room.status === "closed" || room.status === "finished") {
        setErrorMsg(t("join.errorStarted"));
        setIsLoading(false);
        return;
      }

      // Takma ad tek bir cevaptan çok daha kalıcı: lobide, skor tablosunda ve
      // podyumda bütün gece dev ekranda duruyor. Bu yüzden burada maskelemek
      // değil, baştan reddetmek doğru.
      if (containsProfanity(nickname)) {
        setErrorMsg(t("join.errorNickname", "Bu takma ad kullanılamaz."));
        setIsLoading(false);
        return;
      }

      // Odanın dilini artık oyuncunun kendi seçtiği arayüz diline
      // zorlamıyoruz: oyuncu kendi telefonunda kendi dilini seçebiliyor
      // (bkz. LanguageSwitcher), bunu sessizce ezmek o seçimi anlamsız
      // kılardı. room.locale hâlâ host tarafında kategori diline karar
      // veriyor, sadece oyuncunun arayüzünü artık değiştirmiyor.

      try {
        if (profile?.nickname !== nickname.trim()) {
           await updateNickname(nickname.trim());
        }

        const playerRef = await addDoc(collection(db, "players"), {
            room_id: room.id,
            nickname: nickname.trim(),
            team_name: room.game_mode === "team" ? teamName.trim() : null,
            total_score: 0,
            night_score: 0,
            uid: currentUser?.uid || "anonymous",
            created_at: Date.now()
        });

        localStorage.setItem("cafe_game_playerId", playerRef.id);
        localStorage.setItem("cafe_game_roomId", room.id);
        localStorage.setItem("cafe_game_playerName", nickname.trim());
        localStorage.setItem("cafe_game_teamName", room.game_mode === "team" ? teamName.trim() : "");
        navigate("/play");
      } catch (playerError) {
        setErrorMsg(t("join.errorPlayer") + errorMessage(playerError));
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t("join.errorGeneral"));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-safe px-5 min-h-[100dvh] bg-black relative overflow-y-auto selection:bg-alaz-orange selection:text-black">
      {/* Soft ambient glow — sade/premium yönünde CRT tarama çizgileri ve
          keskin neon kenarlıklar kaldırıldı, yerine tek bir yumuşak radyal
          parıltı geldi. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,85,0,0.12),transparent_55%)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm z-10 flex flex-col gap-7 pb-10"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs font-medium shrink-0"
          >
            <span className="text-base leading-none">←</span> {t("common.back", "ANA SAYFA")}
          </button>
          <LanguageSwitcher />
        </div>

        {/* Marka: ikon yok, sadece altın/gümüş/siyah arası sürekli dönen
            metalik bir parıltı — ikon denemeleri beğenilmedi, sade bir
            "mühür" hissi istendi. */}
        <div className="flex flex-col items-center text-center gap-3 mt-2">
          <div className="w-16 h-16 rounded-2xl relative overflow-hidden shadow-lg shadow-black/50 border border-white/20">
            <motion.div
              className="absolute inset-[-35%]"
              style={{
                background:
                  "conic-gradient(from 0deg, #d4af37, #050505, #d9dce2, #050505, #d4af37)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
          </div>
          <div>
            <h1 className="font-premium text-2xl font-black text-white tracking-tight">
              {t("join.title")}
            </h1>
            <p className="text-white/40 text-xs mt-1.5 tracking-wide">
              {t("join.subtitle")}
            </p>
          </div>
        </div>

        {/* Kart */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-2xl">
          <form onSubmit={handleJoin} className="flex flex-col gap-5">
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-xs font-medium overflow-hidden"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {authChecking ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-6 h-6 border-2 border-alaz-orange border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !isPhoneVerified ? (
              <PhoneAuth onSuccess={() => {}} />
            ) : (
              <>
                <PlayerProfileCard />
                <PlayerRewards />

                {/* Oda Kodu */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                    {t("join.roomCode")}
                  </label>
                  {urlCode ? (
                    <div className="rounded-2xl bg-alaz-orange/10 border border-alaz-orange/30 px-4 py-4 flex items-center justify-center">
                      <span className="text-2xl font-black tracking-[0.3em] text-alaz-orange">
                        {roomCode}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-alaz-orange/60 focus-within:bg-white/[0.06] transition-colors">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        inputMode="text"
                        autoCapitalize="characters"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="****"
                        className="w-full bg-transparent px-4 py-4 text-2xl tracking-[0.3em] text-center uppercase font-black text-white placeholder:text-white/15 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Takma Ad */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                    {t("join.nickname")}
                  </label>
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-alaz-orange/60 focus-within:bg-white/[0.06] transition-colors">
                    <input
                      type="text"
                      required
                      autoFocus={!!urlCode}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder={t("join.nicknamePlaceholderShort")}
                      maxLength={15}
                      className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-white placeholder:text-white/20 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Takım Adı */}
                <AnimatePresence>
                  {gameMode === "team" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                        {t("join.teamLabel")}
                      </label>
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-alaz-orange/60 focus-within:bg-white/[0.06] transition-colors">
                        <input
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder={t("join.teamPlaceholderShort")}
                          maxLength={20}
                          className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-white placeholder:text-white/20 focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={!isLoading ? { scale: 1.01 } : {}}
                  whileTap={!isLoading ? { scale: 0.99 } : {}}
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-alaz-orange text-black font-bold py-4 text-sm tracking-wide shadow-lg shadow-alaz-orange/20 hover:shadow-alaz-orange/40 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-40 disabled:shadow-none mt-1"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {t("join.connecting")}
                    </span>
                  ) : (
                    t("join.submit")
                  )}
                </motion.button>
              </>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
