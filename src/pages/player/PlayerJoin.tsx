import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { collection, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { retentionExpiry } from "../../lib/retention";
import { findJoinableRoomByCode, findPlayerResume } from "../../lib/roomQueries";
import { readPlayerSession, savePlayerSession, type SessionPlayer } from "../../lib/roomSession";
import { useLocale } from "../../hooks/useLocale";
import { errorMessage } from "../../lib/errors";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { PlayerProfileCard } from "./components/PlayerProfileCard";
import { PlayerRewards } from "./components/PlayerRewards";
import { useUserProfile } from "../../hooks/useUserProfile";
import { containsProfanity } from "../../lib/profanity";
import { DURATION, EASE } from "../../lib/motion";

export function PlayerJoin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get("code");
  const [roomCode, setRoomCode] = useState(urlCode ? urlCode.toUpperCase() : "");

  useEffect(() => {
    if (urlCode) {
      setRoomCode(urlCode.toUpperCase());
    }
  }, [urlCode]);
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
  const [nicknameTouched, setNicknameTouched] = useState(false);
  // QR ile gelen ve bu odada zaten kaydı olan misafiri formu hiç göstermeden
  // eski kaydına geri götürüyoruz (bkz. lib/roomSession.ts). Kontrol bitene
  // kadar form yerine bekleme ekranı: yoksa form bir an görünüp kayboluyor.
  const [resumeCheckPending, setResumeCheckPending] = useState(
    () => !!urlCode && !!readPlayerSession(localStorage),
  );
  const [resumingAs, setResumingAs] = useState<string | null>(null);

  // Profile'dan gelen nickname'i RENDER sırasında senkronla (bkz. useRoom.ts
  // vb. aynı desen) — effect içinde yapmak fazladan bir render turu
  // doğuruyordu. nicknamePrefilledFrom, kullanıcı alanı sonradan elle
  // değiştirse bile aynı profile için tekrar üzerine yazmamayı sağlıyor.
  // Misafir alana bir kez dokunduysa hiç doldurma: alanı silip yazmaya
  // başladığı anda profil gelirse boş alan "PLAYER_xxxx" ile doluyor, yazılan
  // ad onun arkasına ekleniyordu ("PLAYER_Oi4GGAST", E2E'de yakalandı).
  if (profile?.nickname && !nicknameTouched && nicknamePrefilledFrom !== profile.nickname && !nickname) {
    setNickname(profile.nickname);
    setNicknamePrefilledFrom(profile.nickname);
  }

  // Profil adı, misafir alana odaklanıp ilk harfi basmadan hemen önce
  // gelebiliyor (QR akışında alan autoFocus): o zaman yazılan harf önerinin
  // arkasına ekleniyordu ("PLAYER_7LRQAYSE", E2E'de yakalandı). Öneri odaktaki
  // alana seçili gelir; ilk tuş onun yerine geçer.
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const input = nicknameInputRef.current;
    if (nicknamePrefilledFrom && input && document.activeElement === input) input.select();
  }, [nicknamePrefilledFrom]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const resumeSession = (roomId: string, player: SessionPlayer) => {
    savePlayerSession(localStorage, {
      roomId,
      playerId: player.id,
      nickname: player.nickname,
      teamName: player.team_name,
    });
    setResumingAs(player.nickname);
    // Kısa "tekrar hoş geldin" — misafir neden form görmediğini anlasın.
    window.setTimeout(() => navigate("/play", { replace: true }), 900);
  };

  useEffect(() => {
    if (!urlCode || authChecking) return;
    const session = readPlayerSession(localStorage);
    if (!session) return;
    let cancelled = false;
    findPlayerResume(session, urlCode, currentUser?.uid).then((decision) => {
      if (cancelled) return;
      if (decision.kind === "resume") resumeSession(decision.roomId, decision.player);
      else setResumeCheckPending(false);
    });
    return () => {
      cancelled = true;
    };
    // resumeSession her render'da yeniden oluşuyor; tetikleyici yalnızca
    // kod ve oturum bilgisinin netleşmesi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode, authChecking, currentUser?.uid]);

  // Check room mode when code changes
  useEffect(() => {
    if (roomCode.length === 4) {
      const checkMode = async () => {
        // Katilim akisiyla AYNI secim: kod cakismasinda burada baska bir
        // odanin modunu gosterip katilimda baskasina girmek olmasin.
        const room = await findJoinableRoomByCode(roomCode);
        if (room) setGameMode(room.game_mode || "individual");
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

      // Kodu elle giren misafir de bu odada zaten kayıtlıysa yeni kayıt
      // açmıyoruz: puanı eski kayıtta, yenisi lobide hayalet kopya olurdu.
      const resume = await findPlayerResume(
        readPlayerSession(localStorage),
        cleanCode,
        currentUser?.uid,
      );
      if (resume.kind === "resume") {
        resumeSession(resume.roomId, resume.player);
        return;
      }

      // Onceden sorgudan donen ILK dokuman aliniyor, durum kontrolu ondan
      // SONRA yapiliyordu: kod cakismasi varsa oyuncu kapanmis eski odaya
      // dusup "oyun baslamis" hatasi aliyor, canli odaya hic giremiyordu.
      // Artik eleme once yapiliyor (bkz. lib/roomCodes.ts).
      const room = await findJoinableRoomByCode(cleanCode);

      if (!room) {
        setErrorMsg(t("join.errorNoRoom"));
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

        // Kimlik istemcide üretilip setDoc ile yazılıyor: addDoc "yoksa
        // oluştur" koşuluyla gidiyor; kayıt sunucuda açılıp onay yolda
        // kaybolunca (kafe wifi'si) SDK'nın yeniden denemesi ALREADY_EXISTS
        // ile reddediliyor, misafir hata görüp odada hayalet kayıt kalıyordu.
        // Aynı veriyle tekrar yazım kuralca serbest (değişen alan yok).
        const playerRef = doc(collection(db, "players"));
        await setDoc(playerRef, {
            room_id: room.id,
            nickname: nickname.trim(),
            team_name: room.game_mode === "team" ? teamName.trim() : null,
            total_score: 0,
            night_score: 0,
            uid: currentUser?.uid || "anonymous",
            created_at: Date.now(),
            // Firestore TTL politikasi bu alana bakip dokumani siliyor
            // (bkz. lib/retention.ts ve README).
            expires_at: retentionExpiry(),
        });

        savePlayerSession(localStorage, {
          roomId: room.id,
          playerId: playerRef.id,
          nickname: nickname.trim(),
          teamName: room.game_mode === "team" ? teamName.trim() : null,
        });
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

  const fieldClass =
    "w-full h-16 px-5 rounded-2xl bg-surface-2 border border-line text-center uppercase font-extrabold text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-safe min-h-[100dvh] bg-bg relative overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE.out }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-ink-2 hover:text-ink transition-colors text-sm font-semibold shrink-0 h-11 px-4 rounded-full bg-surface border border-line"
          >
            <span aria-hidden="true">←</span> {t("common.back", "ANA SAYFA")}
          </button>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-6">
          <div>
            <p className="text-base font-semibold text-accent">{t("join.subtitle")}</p>
            <h1 className="mt-1 text-4xl font-extrabold text-ink tracking-tight">{t("join.title")}</h1>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
                role="alert"
                className="rounded-2xl bg-bad/10 border border-bad/40 px-4 py-3 text-base text-bad"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {resumingAs ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center" role="status">
              <span className="text-3xl font-extrabold text-ink">{t("join.welcomeBack", resumingAs)}</span>
              <span className="text-base text-ink-2">{t("join.resuming")}</span>
            </div>
          ) : authChecking || resumeCheckPending || !currentUser ? (
            // Anonim oturum açılana kadar bekleme ekranı (useAuth her
            // ziyaretçiye anonim oturum açıyor; telefonla giriş kaldırıldı).
            <div className="flex justify-center items-center py-10">
              <span className="text-base text-ink-2">{t("join.connecting")}</span>
            </div>
          ) : (
            <>
              <PlayerProfileCard />
              <PlayerRewards />

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-ink-2">{t("join.roomCode")}</span>
                {urlCode ? (
                  <div className={`${fieldClass} flex items-center justify-center font-mono text-3xl tracking-[0.3em]`}>{roomCode}</div>
                ) : (
                  <input
                    type="text"
                    required
                    maxLength={4}
                    inputMode="text"
                    autoCapitalize="characters"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="••••"
                    className={`${fieldClass} font-mono text-3xl tracking-[0.3em]`}
                  />
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-ink-2">{t("join.nickname")}</span>
                <input
                  ref={nicknameInputRef}
                  type="text"
                  required
                  autoFocus={!!urlCode}
                  autoCapitalize="characters"
                  value={nickname}
                  onChange={(e) => {
                    setNicknameTouched(true);
                    setNickname(e.target.value);
                  }}
                  placeholder={t("join.nicknamePlaceholderShort")}
                  maxLength={15}
                  className={`${fieldClass} text-xl tracking-wide`}
                />
              </label>

              <AnimatePresence>
                {gameMode === "team" && (
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DURATION.base }}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-sm font-semibold text-ink-2">{t("join.teamLabel")}</span>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder={t("join.teamPlaceholderShort")}
                      maxLength={20}
                      className={`${fieldClass} text-xl tracking-wide`}
                    />
                  </motion.label>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-16 mt-2 text-lg uppercase tracking-wide"
              >
                {isLoading ? t("join.connecting") : t("join.submit")}
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
