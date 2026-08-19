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

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: RoomStatus) => Promise<void>;
  updatePlayerScore: (playerId: string, delta: number) => Promise<void>;
}

export function HostBombDisplay({
  room,
  players,
}: Props) {
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
      
      // Update player lives
      await updateDoc(doc(db, "players", playerId), {
        lives: newLives
      });

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
      // We have a winner
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
  }, [room, players]);


  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white">
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
            className="w-full h-full"
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
              onResetGame={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
