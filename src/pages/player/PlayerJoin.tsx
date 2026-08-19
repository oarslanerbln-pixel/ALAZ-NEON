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
  const { t, switchLocale } = useLocale();
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

      if (room.status !== "lobby") {
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

      if (room.locale) {
        switchLocale(room.locale);
      }

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
    <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-safe p-4 min-h-[100dvh] bg-black relative overflow-y-auto font-mono selection:bg-alaz-orange selection:text-black">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
      
      {/* Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,77,0,0.1)_0%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 text-alaz-orange/70 hover:text-alaz-orange transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <span className="text-xl">←</span> {t("common.back", "ANA SAYFA")}
        </button>
        <div className="border border-alaz-orange/30 bg-black/80 backdrop-blur-sm shadow-[0_0_30px_rgba(255,77,0,0.1)] relative">
          
          {/* Terminal Header */}
          <div className="border-b border-alaz-orange/30 bg-alaz-orange/5 p-3 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 border border-[#ff003c]/50 bg-[#ff003c]/20" />
              <div className="w-3 h-3 border border-alaz-orange/50 bg-alaz-orange/20" />
              <div className="w-3 h-3 border border-white/50 bg-white/20" />
            </div>
            <span className="text-[10px] text-alaz-orange/60 uppercase tracking-widest font-bold">{t("join.terminalHeader")}</span>
          </div>

          <form onSubmit={handleJoin} className="p-6 md:p-10 space-y-8">
            <div className="text-center mb-8 flex flex-col items-center">
              <h1 className="text-2xl md:text-4xl font-bold text-alaz-orange uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,77,0,0.8)] flex justify-center items-center gap-2">
                &gt; {t("join.title")} <span className="w-3 h-8 bg-alaz-orange animate-pulse" />
              </h1>
              <p className="text-[#ff003c] mt-4 uppercase tracking-[0.3em] text-xs">
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
                <label className="flex items-center gap-2 text-alaz-orange/70 text-xs font-bold uppercase tracking-widest mb-2">
                  <span className="text-[#ff003c]">[1]</span> {t("join.roomCode")}
                </label>
                <div className="flex bg-alaz-orange/5 border border-alaz-orange/30 group-focus-within:border-alaz-orange transition-colors">
                  <div className="px-4 py-4 border-r border-alaz-orange/30 text-alaz-orange font-bold bg-alaz-orange/10 flex items-center justify-center">
                    C:\&gt;
                  </div>
                  {urlCode ? (
                    <div className="w-full px-4 py-4 text-2xl tracking-[0.3em] uppercase font-bold text-alaz-orange bg-transparent flex items-center">
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
                      className="w-full px-4 py-4 text-2xl tracking-[0.3em] uppercase font-bold focus:outline-none bg-transparent text-alaz-orange placeholder:text-alaz-orange/20"
                    />
                  )}
                </div>
              </div>

              {/* Nickname */}
              <div className="group">
                <label className="flex items-center gap-2 text-alaz-orange/70 text-xs font-bold uppercase tracking-widest mb-2">
                  <span className="text-[#ff003c]">[2]</span> {t("join.nickname")}
                </label>
                <div className="flex bg-alaz-orange/5 border border-alaz-orange/30 group-focus-within:border-alaz-orange transition-colors">
                  <div className="px-4 py-4 border-r border-alaz-orange/30 text-alaz-orange font-bold bg-alaz-orange/10 flex items-center justify-center">
                    USR_
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus={!!urlCode}
                    autoCapitalize="characters"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t("join.nicknamePlaceholderShort")}
                    maxLength={15}
                    className="w-full px-4 py-4 text-xl tracking-[0.2em] uppercase font-bold focus:outline-none bg-transparent text-alaz-orange placeholder:text-alaz-orange/20"
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
              whileHover={!isLoading ? { scale: 1.01, backgroundColor: "rgba(255, 77, 0, 0.2)" } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 border-2 transition-all font-bold tracking-[0.3em] uppercase text-sm mt-8 ${
                isLoading
                  ? "border-gray-700 text-gray-500 cursor-not-allowed"
                  : nickname.trim().length > 0
                    ? "border-alaz-orange text-alaz-orange bg-alaz-orange/10 hover:shadow-[0_0_20px_rgba(255,77,0,0.4)]"
                    : "border-alaz-orange/30 text-alaz-orange/50 hover:border-alaz-orange hover:text-alaz-orange"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-3 h-3 bg-alaz-orange animate-ping" />
                  {t("join.connecting")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  [ {t("join.submit")} ]
                </span>
              )}
            </motion.button>
              </>
            )}
          </form>

          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-alaz-orange" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-alaz-orange" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-alaz-orange" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-alaz-orange" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] text-alaz-orange/40 uppercase tracking-[0.5em] font-bold">
            {t("join.terminalFooter")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
