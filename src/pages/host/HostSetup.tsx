import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { retentionExpiry } from "../../lib/retention";
import { allocateRoomCode } from "../../lib/roomQueries";
import { motion } from "framer-motion";
import { NeonIcon } from "../../components/NeonIcon";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useLocale } from "../../hooks/useLocale";
import { useToast } from "../../contexts/ToastContextCore";
import { errorMessage } from "../../lib/errors";
import { useVenue } from "../../contexts/VenueContextCore";

export function HostSetup() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  // Mekân ayarları gelmeden oda açılırsa odaya varsayılan marka kopyalanıyordu
  // (bkz. Room.venue_*): düğme o zamana kadar kapalı.
  const { venue, loading: venueLoading } = useVenue();
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  const startLobby = async () => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setIsCreating(true);

    try {
      const roomCode = await allocateRoomCode();

      const docRef = await addDoc(collection(db, "rooms"), {
          code: roomCode,
          status: "night_lobby",
          active_game: "none",
          categories: [],
          timer_setting: 60,
          total_rounds: 3,
          current_round: 0,
          time_left: 0,
          game_mode: "individual",
          locale: locale,
          created_at: Date.now(),
          // Firestore TTL politikasi bu alana bakip dokumani siliyor
          // (bkz. lib/retention.ts ve README).
          expires_at: retentionExpiry(),
          host_uid: auth.currentUser?.uid || "anonymous",
          // Aktif mekan markasının anlık kopyası — canlı referans değil,
          // bkz. types/database.ts Room.venue_* alanlarındaki not.
          venue_name: venue.name,
          venue_logo_url: venue.logo_url || null,
        });
        
        navigate(`/host/display?roomId=${docRef.id}`);
      } catch (err) {
        console.error("Error creating room:", err);
        showToast(t("setup.errorCreate") + errorMessage(err), "error");
        isCreatingRef.current = false;
        setIsCreating(false);
      }
  };

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-black text-white">
      <div className="p-10 max-w-5xl mx-auto w-full relative z-10">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          <button
            onClick={() => navigate("/")}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest relative z-20"
          >
            <span className="text-xl">←</span> {t("common.back", "ANA SAYFA")}
          </button>

          <div className="grid grid-cols-1 gap-8 auto-rows-[minmax(220px,auto)]">
            {/* Main Settings Panel */}
            <div className="surface rounded-xl">
              <div className="p-8 sm:p-12 flex flex-col h-full relative">
                <div className="flex flex-col items-center justify-center mb-12 relative z-10 text-center">
                  <NeonIcon type="settings" color="orange" className="w-16 h-16 mb-4 opacity-80" />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-accent tracking-tighter uppercase">
                    {t("setup.title")}
                  </h2>
                  <p className="text-gray-300 font-bold text-xs mt-4 uppercase tracking-[0.25em]">{t("setup.subtitle")}</p>
                </div>

                <div className="flex-1 relative z-10 w-full max-w-md mx-auto flex flex-col justify-center">
                  {/* Language Selector */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                      {t("setup.languageLabel")}
                    </label>
                    <LanguageSwitcher
                      className="w-full"
                      fullWidth
                    />
                  </div>
                </div>

                <div className="mt-12 relative z-10 w-full max-w-md mx-auto">
                  <button
                    onClick={startLobby}
                    disabled={isCreating || venueLoading}
                    className="btn-primary w-full py-5 sm:py-6 text-lg sm:text-2xl font-sans font-black uppercase tracking-[0.18em] rounded-xl"
                  >
                    <span className="whitespace-nowrap block">
                      {isCreating ? t("setup.starting", "BAŞLATILIYOR...") : t("setup.startNight", "GECEYİ BAŞLAT →")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
