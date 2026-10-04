import { useEffect } from "react";

import { SoundManager, sounds } from "../../../lib/audio";
import type { RoomStatus } from "../../../types/database";

/**
 * Klasik oyunun müzik/ambiyans orkestrasyonu ve TV'nin yerel açılış
 * sinematiği (4 sn sonra lobiye geçer, oturum boyunca bir kez).
 */
export function useClassicMusic(
  gameState: RoomStatus,
  roomId: string | null,
  setGameState: (state: RoomStatus) => void,
) {
  useEffect(() => {
    const sound = SoundManager.getInstance();

    if (gameState === "intro") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.6); // Start cinematic intro immediately
      const timer = setTimeout(() => {
        setGameState("lobby");
        if (roomId) sessionStorage.setItem(`hostIntro_${roomId}`, "true");
      }, 4000);
      return () => clearTimeout(timer);
    } else if (gameState === "lobby") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.4);
      sound.startAmbientDrone();
    } else if (gameState === "tutorial") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.2);
    } else if (gameState === "gameIntro") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.5); // high energy
    } else if (gameState === "playing") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.3);
      sound.startAmbientDrone(); // Keep drone running for consistency
    } else if (gameState === "countdown") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
    } else if (gameState === "review") {
      sound.stopSound(sounds.GAME_PULSE);
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.2); // Low lobby music for review
    } else if (gameState === "standings") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.4); // Bring back up a bit for standings
    } else {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.stopSound(sounds.GAME_PULSE);
      sound.stopAmbientDrone();
    }
  }, [gameState, roomId, setGameState]);
}
