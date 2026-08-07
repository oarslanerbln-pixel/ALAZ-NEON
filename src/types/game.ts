export type GameMode = "individual" | "team";

export interface Room {
  id: string;
  code: string;
  status: "lobby" | "playing" | "review" | "finished";
  categories: string[];
  timer_setting: number;
  total_rounds: number;
  current_round: number;
  active_letter?: string;
  time_left?: number;
  game_mode: GameMode;
  created_at?: string;
}

export interface Player {
  id: string;
  room_id: string;
  nickname: string;
  total_score: number;
  team_name?: string;
  is_host: boolean;
  created_at?: string;
}

export interface Answer {
  id: string;
  room_id: string;
  player_id: string;
  round_letter: string;
  data: Record<string, string>;
  is_submitted: boolean;
  points?: number;
  created_at?: string;
}
