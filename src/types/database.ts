import type { Locale } from "../lib/i18n";

export type RoomStatus =
  | "lobby"
  | "playing"
  | "review"
  | "standings"
  | "countdown"
  | "gameIntro"
  | "finished"
  | "closed"
  | "intro"
  | "quiz_intro"
  | "quiz_lobby"
  | "question_intro"
  | "question_active"
  | "question_reveal"
  | "quiz_leaderboard";

export type GameMode = "individual" | "team";
export type GameType = "scattegories" | "quiz";

export interface QuizQuestion {
  id: string;
  text: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: "A" | "B" | "C" | "D";
  difficulty: 1 | 2 | 3;
}

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  game_type?: GameType;
  categories: string[];
  timer_setting: number;
  total_rounds: number;
  current_round: number;
  active_letter?: string;
  time_left?: number;
  round_end_time?: number;
  game_mode: GameMode;
  used_letters?: string[];
  locale?: Locale;
  quiz_questions?: QuizQuestion[];
  current_question_index?: number;
  next_letter?: string;
}

export interface Player {
  id: string;
  nickname: string;
  team_name: string | null;
  total_score: number;
  room_id: string;
}

export interface Answer {
  id?: string;
  room_id: string;
  player_id: string;
  round_letter: string;
  round_index?: number;
  data: Record<string, string>;
  created_at?: string;
}

export interface AnswerBreakdown {
  value: string;
  isUnique: boolean;
  points: number;
  isValid: boolean;
  isJoker?: boolean;
}

export interface BusinessReport {
  revenue: number;
  tips: number;
  satisfaction: number; // 0-100
  staffEfficiency: number; // 0-100
}

export type PlayerPersona =
  | "Sprinter" // Fast but might have errors
  | "Innovator" // High uniqueness
  | "Sniper" // High accuracy/validity
  | "Strategist" // Balanced performance
  | "Ghost"; // Low participation/empty answers

export interface RoundResultInfo {
  playerId: string;
  name: string;
  teamName: string | null;
  roundScore: number;
  totalScore: number;
  answers: Record<string, AnswerBreakdown>;
  earlyBonus: boolean;
  persona?: PlayerPersona;
}

export interface RoundLog {
  id?: string;
  room_id: string;
  round_number: number;
  letter: string;
  categories: string[];
  player_count: number;
  complexity_score: number;
  predicted_avg_score: number;
  actual_avg_score: number;
  prediction_error: number;
  created_at?: string;
}
