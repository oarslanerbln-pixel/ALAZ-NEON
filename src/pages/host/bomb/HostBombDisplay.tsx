import { useCallback } from "react";
import type { Room, Player, RoomStatus } from "../../../types/database";
import { HostLobby } from "../views/HostLobby";
import { HostBombIntro } from "./HostBombIntro";
import { HostBombActive } from "./HostBombActive";
import { HostBombExplosion } from "./HostBombExplosion";
import { HostTutorial } from "../components/HostTutorial";
import { HostPodium } from "../views/HostPodium";
import { AnimatePresence, motion } from "framer-motion";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { SoundManager, sounds } from "../../../lib/audio";
import { grantRewardToPlayers } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: RoomStatus, extra?: Partial<Room>) => Promise<void>;
  updatePlayerScore: (playerId: string, delta: number) => Promise<void>;
}

export function HostBombDisplay({
  room,
  players,
  updateRoomStatus,
}: Props) {
  const { venue } = useVenue();
  // Initialize bomb game when started from lobby
  const handleStartGame = async () => {
    try {
      SoundManager.getInstance().playSFX(sounds.START);
      
      // Select random starting player
      const activePlayers = players.filter(p => (p.lives === undefined ? 3 : p.lives) > 0);
      if (activePlayers.length === 0) return;
      
      const randomPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      let availableCategories = room.categories.filter(c => !(room.used_bomb_categories || []).includes(c));
      if (availableCategories.length === 0) {
        availableCategories = room.categories;
      }
      const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

      await updateDoc(doc(db, "rooms", room.id), {
        status: "tutorial",
        tutorial_step: 0,
        current_round: 1,
        bomb_target_player: randomPlayer.id,
        // Repurposing active_letter as active_category for simplicity without changing types heavily
        active_letter: randomCategory,
        used_bomb_categories: [randomCategory],
        used_words: [],
        bomb_speed_multiplier: 1.0,
      });
    } catch (err) {
      console.error("Error starting bomb game:", err);
    }
  };

  const handleTutorialComplete = useCallback(async () => {
    try {
      await updateDoc(doc(db, "rooms", room.id), {
        status: "bomb_intro",
      });
    } catch (error) {
      console.error("Error completing tutorial:", error);
    }
  }, [room.id]);

  const handleIntroComplete = useCallback(async () => {
    try {
      // Start the bomb timer!
      const initialTime = 15; // 15 seconds
      await updateDoc(doc(db, "rooms", room.id), {
        status: "bomb_active",
        round_end_time: Date.now() + initialTime * 1000,
      });
    } catch (error) {
      console.error("Error transitioning to active:", error);
    }
  }, [room.id]);

  const handleBombExploded = useCallback(async (playerId: string) => {
    try {
      // Player lost a life!
      SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM);
      
      const targetPlayer = players.find(p => p.id === playerId);
      if (!targetPlayer) return;

      const currentLives = targetPlayer.lives !== undefined ? targetPlayer.lives : 3;
      const newLives = Math.max(0, currentLives - 1);

      const playerUpdates: Record<string, number> = { lives: newLives };
      if (newLives === 0) {
        // Bomba modu skorla değil "hayatta kalma" ile ilerliyor — ama
        // Podyum ekranı (HostPodium) sıralamayı total_score'a göre yapıyor.
        // Bomba modunda total_score hiç güncellenmediği için oyun bitince
        // TÜM oyuncular 0'da eşit kalıyor ve podyum gerçek kazananı değil,
        // players dizisindeki RASTGELE bir sırayı gösteriyordu. Elenme
        // anında "kaç rakibi geride bıraktığını" total_score'a yazıyoruz ki
        // podyum gerçek sonucu yansıtsın (kazanan handleNextRoundOrWinner'da
        // ayrıca en yüksek skoru alıyor).
        const aliveBefore = players.filter(
          (p) => (p.lives !== undefined ? p.lives : 3) > 0
        ).length;
        const outlasted = players.length - aliveBefore;
        playerUpdates.total_score = outlasted * 100;
      }

      // Update player lives (+ elenme anındaki placement skoru)
      await updateDoc(doc(db, "players", playerId), playerUpdates);

      await updateDoc(doc(db, "rooms", room.id), {
        status: "bomb_explosion"
      });
    } catch (error) {
      console.error("Error on explosion:", error);
    }
  }, [room.id, players]);

  const handleNextRoundOrWinner = useCallback(async () => {
    // Determine if there is only 1 player left with lives > 0
    const activePlayers = players.filter(p => (p.lives !== undefined ? p.lives : 3) > 0);
    
    if (activePlayers.length <= 1) {
      // We have a winner — bomba modu puan değil "son ayakta kalan"
      // modeliyle çalışıyor, bu yüzden grantGameRewards'ın puan bazlı
      // kazanan bulma mantığı burada işe yaramaz; kazananı doğrudan
      // hayatta kalan tek oyuncudan alıyoruz. İki oyuncu aynı anda
      // elenirse (activePlayers 0'a düşer) kimseye ödül verilmiyor.
      const survivor = activePlayers[0];
      if (survivor) {
        // Hayatta kalan tek oyuncu hiç elenmeden kazanıyor — podyumda 1.
        // sırada görünmesi için ona da aynı "outlasted rakip sayısı"
        // formülüyle herkesten yüksek skoru veriyoruz.
        updateDoc(doc(db, "players", survivor.id), {
          total_score: (players.length - 1) * 100,
        }).catch((err) =>
          console.error("[HostBombDisplay] Kazanan skoru yazılamadı:", err),
        );
      }
      if (survivor?.uid) {
        grantRewardToPlayers(
          [{ uid: survivor.uid, nickname: survivor.nickname }],
          venue,
        ).catch((err) =>
          console.error("[HostBombDisplay] Ödül dağıtımı başarısız:", err),
        );
      }
      await updateDoc(doc(db, "rooms", room.id), {
        status: "finished"
      });
    } else {
      // Start next round with new category and random player
      const randomPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      
      let availableCategories = room.categories.filter(c => !(room.used_bomb_categories || []).includes(c));
      if (availableCategories.length === 0) {
        availableCategories = room.categories;
      }
      const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
      
      const newUsedCategories = availableCategories.length === room.categories.length 
          ? [randomCategory] 
          : [...(room.used_bomb_categories || []), randomCategory];

      await updateDoc(doc(db, "rooms", room.id), {
        status: "bomb_intro",
        current_round: room.current_round + 1,
        bomb_target_player: randomPlayer.id,
        active_letter: randomCategory,
        used_bomb_categories: newUsedCategories,
        used_words: [],
        bomb_speed_multiplier: 1.0,
      });
    }
  }, [room, players, venue]);

  // Diğer üç modun hepsinde (Arena/Quiz/Sensör) HostHeader hep görünür —
  // oda kodu, tur sayacı, dil seçici ve "ERKEN BİTİR" her zaman erişilebilir.
  // Bomba modunda bu bileşen hiç import edilmemişti: host TV ekranında
  // oyunu manuel bitirmenin HİÇBİR yolu yoktu, oda kodunu da göremiyordu.
  // Erken bitirmede ödül verilmiyor — bomba modelinde "en yüksek puan" gibi
  // her an net bir lider yok, birden fazla oyuncu hâlâ hayattayken host
  // oyunu keserse tek bir kazanan seçmek keyfi olurdu.
  const handleEndGameEarly = () => {
    updateDoc(doc(db, "rooms", room.id), { status: "finished" }).catch((err) =>
      console.error("[HostBombDisplay] Erken bitirme başarısız:", err),
    );
  };

  const handleResetGame = useCallback(async () => {
    try {
      import("firebase/firestore").then(async ({ writeBatch }) => {
        const batch = writeBatch(db);
        players.forEach(p => {
          const pRef = doc(db, "players", p.id);
          batch.update(pRef, { total_score: 0, lives: 3 });
        });
        await batch.commit();

        await updateDoc(doc(db, "rooms", room.id), {
          status: "lobby",
          current_round: 0,
        });
      });
    } catch (err) {
      console.error("Error resetting bomb game:", err);
    }
  }, [room.id, players]);

  return (
    <TVScaleFrame>
    <div className="w-full h-full overflow-hidden bg-black text-white flex flex-col p-4">
      <HostHeader 
        room={room} 
        onEndGameEarly={handleEndGameEarly} 
        onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
      />
      <div className="flex-1 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {room.status === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <HostLobby
              room={room}
              players={players}
              onStartGame={handleStartGame}
              onUpdateCategories={() => {}}
            />
          </motion.div>
        )}

        {room.status === "tutorial" && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <HostTutorial room={room} onComplete={handleTutorialComplete} />
          </motion.div>
        )}

        {room.status === "bomb_intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <HostBombIntro room={room} onComplete={handleIntroComplete} />
          </motion.div>
        )}

        {room.status === "bomb_active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            className="w-full h-full"
          >
            <HostBombActive 
              room={room} 
              players={players} 
              onExplode={handleBombExploded} 
            />
          </motion.div>
        )}

        {room.status === "bomb_explosion" && (
          <motion.div
            key="explosion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full animate-screen-shake-violent"
          >
            <HostBombExplosion room={room} players={players} onComplete={handleNextRoundOrWinner} />
          </motion.div>
        )}

        {room.status === "finished" && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <HostPodium 
              room={room}
              players={players} 
              playerStats={{}}
              onResetGame={handleResetGame}
            />
          </motion.div>
        )}
        {!["lobby", "tutorial", "bomb_intro", "bomb_active", "bomb_explosion", "finished"].includes(room.status) && (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <HostLobby
              room={room}
              players={players}
              onStartGame={handleStartGame}
              onUpdateCategories={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
    </TVScaleFrame>
  );
}
