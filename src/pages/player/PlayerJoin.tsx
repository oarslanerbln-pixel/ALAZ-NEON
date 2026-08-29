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
    <div className="flex-1 flex flex-col items-center justify-start pt-10 pb-safe p-5 min-h-[100dvh] bg-black relative overflow-y-auto font-sans selection:bg-alaz-orange selection:text-black">
      {/* Cinematic Deep Background */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top,rgba(255,85,0,0.12)_0%,rgba(0,0,0,1)_70%)]" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-white/[0.01] bg-[url('/noise.png')] mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest shrink-0 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
          >
            <span className="text-lg leading-none">←</span> {t("common.back", "ANA SAYFA")}
          </button>
          <LanguageSwitcher />
        </div>
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
          
          {/* Subtle top glow highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />

          <form onSubmit={handleJoin} className="p-8 md:p-12 space-y-8">
            <div className="text-center mb-10 flex flex-col items-center">
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 uppercase tracking-[0.2em] drop-shadow-lg mb-2">
                {t("join.title")}
              </h1>
              <p className="text-alaz-orange mt-2 uppercase tracking-[0.4em] text-[10px] font-bold">
                {t("join.subtitle")}
              </p>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#ff003c]/10 border-l-2 border-[#ff003c] p-4 text-[#ff003c] text-xs uppercase tracking-wider"
                >
                  <span className="font-bold">ERR:</span> {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {authChecking ? (
              <div className="flex justify-center items-center py-10">
                <span className="text-alaz-orange font-bold uppercase tracking-widest animate-pulse">CONNECTING...</span>
              </div>
            ) : !currentUser ? (
              <PhoneAuth onSuccess={() => {}} />
            ) : (
              <>
                <div className="mb-4">
                  <PlayerProfileCard />
                </div>
                
                <div className="mb-8">
                  <PlayerRewards />
                </div>
                
                <div className="space-y-6">
                  {/* Room Code */}
              <div className="group">
                <label className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 ml-2">
                  {t("join.roomCode")}
                </label>
                <div className="flex bg-white/[0.02] border border-white/10 rounded-2xl group-focus-within:border-alaz-orange/60 group-focus-within:bg-white/[0.04] transition-all shadow-inner overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-alaz-orange/80 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  {urlCode ? (
                    <div className="w-full px-6 py-5 text-3xl tracking-[0.4em] uppercase font-black text-white bg-transparent flex items-center justify-center">
                      {roomCode}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      maxLength={4}
                      inputMode="text"
                      autoCapitalize="characters"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="****"
                      className="w-full px-6 py-5 text-center text-3xl tracking-[0.4em] uppercase font-black focus:outline-none bg-transparent text-white placeholder:text-white/10"
                    />
                  )}
                </div>
              </div>

              {/* Nickname */}
              <div className="group mt-6">
                <label className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 ml-2">
                  {t("join.nickname")}
                </label>
                <div className="flex bg-white/[0.02] border border-white/10 rounded-2xl group-focus-within:border-alaz-orange/60 group-focus-within:bg-white/[0.04] transition-all shadow-inner overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-alaz-orange/80 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="text"
                    required
                    autoFocus={!!urlCode}
                    autoCapitalize="characters"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t("join.nicknamePlaceholderShort")}
                    maxLength={15}
                    className="w-full px-6 py-5 text-center text-xl tracking-[0.3em] uppercase font-black focus:outline-none bg-transparent text-white placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Team Name */}
              <AnimatePresence>
                {gameMode === "team" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group"
                  >
                    <label className="flex items-center gap-2 text-[#ff003c]/70 text-xs font-bold uppercase tracking-widest mb-2">
                      <span className="text-alaz-orange">[3]</span> {t("join.teamLabel")}
                    </label>
                    <div className="flex bg-[#ff003c]/5 border border-[#ff003c]/30 group-focus-within:border-[#ff003c] transition-colors">
                      <div className="px-4 py-4 border-r border-[#ff003c]/30 text-[#ff003c] font-bold bg-[#ff003c]/10 flex items-center justify-center">
                        TEAM
                      </div>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder={t("join.teamPlaceholderShort")}
                        maxLength={20}
                        className="w-full px-4 py-4 text-xl tracking-[0.2em] uppercase font-bold focus:outline-none bg-transparent text-[#ff003c] placeholder:text-[#ff003c]/20"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl transition-all font-black tracking-[0.4em] uppercase text-sm mt-10 relative overflow-hidden group ${
                isLoading
                  ? "bg-white/[0.05] border border-white/10 text-white/30 cursor-not-allowed"
                  : nickname.trim().length > 0
                    ? "bg-white text-black border border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                    : "bg-white/[0.03] border border-white/20 text-white/50 hover:bg-white/[0.08]"
              }`}
            >
              {nickname.trim().length > 0 && !isLoading && (
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.1),transparent)] translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
              )}
              {isLoading ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-white/50 animate-ping" />
                  {t("join.connecting")}
                </span>
              ) : (
                <span className="relative z-10">
                  {t("join.submit")}
                </span>
              )}
            </motion.button>
              </>
            )}
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-medium">
            {t("join.terminalFooter")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
