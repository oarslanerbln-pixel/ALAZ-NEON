import { useEffect } from "react";

import type { Room, Player } from "../../../types/database";
import { HostEchoIntro } from "./HostEchoIntro";
import { HostEchoActive } from "./HostEchoActive";
import { HostEchoReveal } from "./HostEchoReveal";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

const PREMIUM_QUESTIONS = [
  "Bir zombi istilasında ilk kim yem olur?",
  "En kötü eski sevgiliye sahip olan kim?",
  "En çok 'Yarın diyete başlıyorum' diyen kim?",
  "Mekandaki en iyi giyinen kişi kim?",
  "Gizli bir ajan olma ihtimali en yüksek kim?",
  "Issız adaya düşse ilk kimi yer?",
];

export function HostEchoDisplay({ room, players, updateRoomStatus }: Props) {
  // If we are in lobby and starting the game
  useEffect(() => {
    if (room.status === "lobby" || room.status === "echo_intro") {
      if (!room.echo_question) {
        const randomQ = PREMIUM_QUESTIONS[Math.floor(Math.random() * PREMIUM_QUESTIONS.length)];
        updateRoomStatus("echo_intro", { echo_question: randomQ, echo_votes: {} });
      } else if (room.status !== "echo_intro") {
        updateRoomStatus("echo_intro");
      }
    }
  }, [room.status, room.echo_question, updateRoomStatus]);

  if (room.status === "echo_intro") {
    return <HostEchoIntro room={room} onNext={() => updateRoomStatus("echo_active", { round_end_time: Date.now() + 20000 })} />;
  }

  if (room.status === "echo_active") {
    return <HostEchoActive room={room} players={players} onNext={() => updateRoomStatus("echo_reveal")} />;
  }

  if (room.status === "echo_reveal") {
    return <HostEchoReveal room={room} players={players} onFinish={() => updateRoomStatus("lobby", { active_game: "none" })} />;
  }

  // Fallback loading
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-alaz-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
