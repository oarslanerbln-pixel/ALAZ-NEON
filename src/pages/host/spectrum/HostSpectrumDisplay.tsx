import { useEffect } from "react";
import type { Room, Player } from "../../../types/database";
import { HostSpectrumIntro } from "./HostSpectrumIntro";
import { HostSpectrumActive } from "./HostSpectrumActive";
import { HostSpectrumReveal } from "./HostSpectrumReveal";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostSpectrumDisplay({ room, players, updateRoomStatus }: Props) {
  // Initialize the game
  useEffect(() => {
    if (room.status === "lobby" || room.status === "spectrum_intro") {
      if (!room.spectrum_teams) {
        // Assign teams randomly
        const teams: Record<string, "red" | "blue"> = {};
        
        // Shuffle players
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        
        shuffled.forEach((p, index) => {
          teams[p.id] = index % 2 === 0 ? "red" : "blue";
        });
        
        updateRoomStatus("spectrum_intro", { 
          spectrum_teams: teams,
          spectrum_scores: { red: 50, blue: 50 } // Start tied at 50% each
        });
      } else if (room.status !== "spectrum_intro") {
        updateRoomStatus("spectrum_intro");
      }
    }
  }, [room.status, room.spectrum_teams, players, updateRoomStatus]);

  if (room.status === "spectrum_intro") {
    return <HostSpectrumIntro room={room} onNext={() => updateRoomStatus("spectrum_active", { spectrum_end_time: Date.now() + 30000 })} />;
  }

  if (room.status === "spectrum_active") {
    return <HostSpectrumActive room={room} onNext={() => updateRoomStatus("spectrum_reveal")} />;
  }

  if (room.status === "spectrum_reveal") {
    return <HostSpectrumReveal room={room} onFinish={() => updateRoomStatus("lobby", { active_game: "none" })} />;
  }

  // Fallback loading
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-alaz-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
