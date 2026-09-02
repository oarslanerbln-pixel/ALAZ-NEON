import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { SoundManager, sounds } from "../../../lib/audio";
import { getRandomSensorImage, SENSOR_IMAGES, type SensorImage } from "../../../data/sensorImages";

import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { HostLobby } from "../views/HostLobby";
import { HostPodium } from "../views/HostPodium";
import { grantGameRewards } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";

import type { Room, Player } from "../../../types/database";

// New modular components
import { HostSensorIntro } from "./HostSensorIntro";
import { HostSensorActive } from "./HostSensorActive";
import { HostSensorReveal } from "./HostSensorReveal";

export function HostSensorDisplay({
  room,
  players,
  updateRoomStatus,
  updatePlayerScore,
}: {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], extra?: Partial<Room>) => Promise<void>;
  updatePlayerScore: (playerId: string, score: number) => Promise<void>;
}) {
  const { venue } = useVenue();
  const grantSensorRewards = () =>
    grantGameRewards("individual", players, venue).catch((err) =>
      console.error("[HostSensorDisplay] Ödül dağıtımı başarısız:", err),
    );
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  
  const rawStatus = room?.status || "lobby";
  const gameState =
    rawStatus === "lobby" ? "lobby" :
    rawStatus === "tutorial" ? "tutorial" :
    rawStatus.startsWith("sensor_") || rawStatus === "finished"
      ? rawStatus
      : "lobby";

  const isSensorScreen =
    gameState === "sensor_intro" ||
    gameState === "sensor_active" ||
    gameState === "sensor_buzzed" ||
    gameState === "sensor_reveal";
    
  const currentImage: SensorImage | null =
    (isSensorScreen && room.sensor_current_media
      ? SENSOR_IMAGES.find(i => i.url === room.sensor_current_media) || SENSOR_IMAGES[0]
      : null) || null;
      
  const currentImageIndex = room.current_round || 0;
  const buzzerPlayerName = room.sensor_buzzer_player_id
    ? players.find(pl => pl.id === room.sensor_buzzer_player_id)?.nickname || null
    : null;

  // When somebody buzzes, play sound
  useEffect(() => {
    if (gameState === "sensor_buzzed") {
      SoundManager.getInstance().playSFX(sounds.SIREN);
    }
  }, [gameState]);

  const startGame = async () => {
    if (!roomId) return;
    SoundManager.getInstance().playSFX(sounds.START);
    
    try {
      const q = query(collection(db, "answers"), where("room_id", "==", roomId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn("Could not delete old answers:", e);
    }

    const firstImg = getRandomSensorImage([]);
    await updateRoomStatus("sensor_intro", { 
      current_round: 0,
      used_sensor_images: [firstImg.id],
      sensor_current_media: firstImg.url,
      sensor_media_answer: firstImg.answer,
      sensor_buzzer_player_id: null,
      sensor_buzzer_timestamp: null,
      sensor_player_answer: null
    });
  };

  const startRound = async () => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    await updateRoomStatus("sensor_active", {
      sensor_buzzer_player_id: null,
      sensor_buzzer_timestamp: null,
      sensor_player_answer: null
    });
  };

  const handleEvaluate = async (isCorrect: boolean) => {
    if (isCorrect && room.sensor_buzzer_player_id) {
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
      // Add 100 points to the buzzer player's EXISTING total, not overwrite it
      const buzzerPlayer = players.find(p => p.id === room.sensor_buzzer_player_id);
      const currentScore = buzzerPlayer?.total_score ?? 0;
      await updatePlayerScore(room.sensor_buzzer_player_id, currentScore + 100);
      await updateRoomStatus("sensor_reveal");
    } else {
      SoundManager.getInstance().playSFX(sounds.FAILURE);
      await updateRoomStatus("sensor_active", {
        sensor_buzzer_player_id: null,
        sensor_buzzer_timestamp: null,
        sensor_player_answer: null
      });
    }
  };
  
  const nextRound = async () => {
    const nextIdx = (room.current_round || 0) + 1;
    if (nextIdx >= Math.min(room.total_rounds, SENSOR_IMAGES.length)) {
      grantSensorRewards();
      await updateRoomStatus("finished");
      return;
    }
    
    const used = room.used_sensor_images || [];
    const nextImg = getRandomSensorImage(used);

    await updateRoomStatus("sensor_intro", { 
      current_round: nextIdx,
      used_sensor_images: [...used, nextImg.id],
      sensor_current_media: nextImg.url,
      sensor_media_answer: nextImg.answer,
      sensor_buzzer_player_id: null,
      sensor_buzzer_timestamp: null,
      sensor_player_answer: null
    });
  };

  const handleResetGame = async () => {
    if (!roomId) return;
    try {
      const batch = writeBatch(db);
      players.forEach(p => {
        const pRef = doc(db, "players", p.id);
        batch.update(pRef, { total_score: 0 });
      });

      const q = query(collection(db, "answers"), where("room_id", "==", roomId));
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => batch.delete(docSnap.ref));

      await batch.commit();
      await updateRoomStatus("lobby", { active_game: "none", current_round: 0 });
    } catch (err) {
      console.error("Error resetting sensor game:", err);
    }
  };

  if (gameState === "lobby") {
    return (
      <TVScaleFrame>
        <div className="w-full h-full bg-black text-white overflow-hidden flex flex-col font-mono relative">
          <HostHeader 
            room={room} 
            onEndGameEarly={() => { grantSensorRewards(); updateRoomStatus("finished"); }} 
            onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
          />
          <div className="flex-1 relative z-10">
            <HostLobby
              room={room}
              players={players}
              onStartGame={startGame}
            />
          </div>
        </div>
      </TVScaleFrame>
    );
  }

  return (
    <TVScaleFrame>
      <div className="w-full h-full bg-black text-white overflow-hidden flex flex-col font-sans relative">
        <HostHeader 
          room={room} 
          onEndGameEarly={() => { grantSensorRewards(); updateRoomStatus("finished"); }} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />

        <div className="flex-1 flex flex-col relative z-10">
          {gameState === "sensor_intro" && currentImage && (
            <HostSensorIntro 
              currentImageIndex={currentImageIndex} 
              currentImage={currentImage} 
              onStartRound={startRound} 
            />
          )}

          {(gameState === "sensor_active" || gameState === "sensor_buzzed") && currentImage && (
            <HostSensorActive 
              room={room} 
              currentImage={currentImage} 
              buzzerPlayerName={buzzerPlayerName} 
              onEvaluate={handleEvaluate} 
            />
          )}

          {gameState === "sensor_reveal" && currentImage && (
            <HostSensorReveal 
              currentImage={currentImage} 
              buzzerPlayerName={buzzerPlayerName} 
              onNextRound={nextRound} 
            />
          )}

          {gameState === "finished" && (
            <HostPodium 
              room={room}
              players={players} 
              playerStats={{}}
              onResetGame={handleResetGame}
            />
          )}
        </div>
      </div>
    </TVScaleFrame>
  );
}
