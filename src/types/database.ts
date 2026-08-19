import type { Locale } from "../lib/i18n";
import type { FieldValue, Timestamp } from "firebase/firestore";

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
  | "quiz_leaderboard"
  | "bomb_intro"
  | "bomb_active"
  | "bomb_explosion"
  | "bomb_standings"
  | "tutorial"
  | "sensor_intro"
  | "sensor_active"
  | "sensor_buzzed"
  | "sensor_reveal";

export type GameMode = "individual" | "team";
export type GameType = "scattegories" | "quiz" | "bomb" | "sensor";

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
  status: RoomStatus | "night_lobby";
  active_game?: GameType | "none";
  game_type?: GameType; // Legacy
  host_uid?: string;
  categories: string[];
  timer_setting: number;
  total_rounds: number;
  current_round: number;
  active_letter?: string;
  time_left?: number;
  round_end_time?: number;
  game_mode: GameMode;
  used_letters?: string[];
  used_sensor_images?: string[];
  used_bomb_categories?: string[];
  locale?: Locale;
  quiz_questions?: QuizQuestion[];
  current_question_index?: number;
  next_letter?: string;
  // Bomb Game Fields
  bomb_target_player?: string;
  previous_bomb_target_player?: string | null;
  used_words?: string[];
  bomb_speed_multiplier?: number;
  // Tutorial Fields
  tutorial_step?: number;
  // Sensor Game Fields
  sensor_current_media?: string;
  sensor_media_answer?: string;
  sensor_buzzer_player_id?: string | null;
  sensor_buzzer_timestamp?: number | null;
  sensor_player_answer?: string | null;
}

export interface Player {
  id: string;
  room_id: string;
  nickname: string;
  uid?: string;
  team_name: string | null;
  total_score: number;
  night_score?: number;
  created_at: number;
  lives?: number;
}

export interface Answer {
  id?: string;
  room_id: string;
  player_id: string;
  round_letter: string;
  round_index?: number;
  data: Record<string, string>;
  // ISO string (scattegories) at write-time, a resolved Firestore Timestamp
  // once read back, or a pending FieldValue while serverTimestamp() (quiz)
  // hasn't committed yet.
  created_at?: string | Timestamp | FieldValue;
}

export interface AnswerBreakdown {
  value: string;
  isUnique: boolean;
  points: number;
  isValid: boolean;
  isJoker?: boolean;
  /**
   * Otomatik moderasyon/doğrulama işaretleri. Bunlar cevabı geçersiz sayar ama
   * SON SÖZ HOST'TA: inceleme ekranından tek tıkla geri onaylanabilir.
   */
  isProfane?: boolean;
  isGibberish?: boolean;
  gibberishReason?: string;
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

export type LeagueTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "NEON" | "LEGEND";

export interface UserProfile {
  uid: string;
  phone_number: string;
  nickname: string;
  total_lifetime_score: number;
  current_league: LeagueTier;
  created_at: number;
  last_active: number;
}

export interface Reward {
  id?: string;
  uid: string;
  type: "drink" | "discount" | "special";
  title: string;
  description: string;
  status: "available" | "claimed";
  code: string;
  earned_at: number;
  claimed_at?: number;
}
