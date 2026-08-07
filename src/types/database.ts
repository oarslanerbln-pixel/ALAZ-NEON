export type RoomStatus =
  | "lobby"
  | "playing"
  | "review"
  | "standings"
  | "countdown"
  | "finished"
  | "closed"
  | "intro";

export type GameMode = "individual" | "team";

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  categories: string[];
  timer_setting: number;
  total_rounds: number;
  current_round: number;
  active_letter?: string;
  time_left?: number;
  round_end_time?: number;
  game_mode: GameMode;
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

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: {
          id?: string;
          code: string;
          status: RoomStatus;
          categories: string[];
          timer_setting: number;
          total_rounds: number;
          current_round: number;
          active_letter?: string;
          time_left?: number;
          round_end_time?: number;
          game_mode: GameMode;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          status?: RoomStatus;
          categories?: string[];
          timer_setting?: number;
          total_rounds?: number;
          current_round?: number;
          active_letter?: string;
          time_left?: number;
          round_end_time?: number;
          game_mode?: GameMode;
          created_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: Player;
        Insert: {
          id?: string;
          nickname: string;
          team_name?: string | null;
          total_score?: number;
          room_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          team_name?: string | null;
          total_score?: number;
          room_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      answers: {
        Row: Answer;
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          round_letter: string;
          data: Record<string, string>;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string;
          round_letter?: string;
          data?: Record<string, string>;
          created_at?: string;
        };
        Relationships: [];
      };
      round_logs: {
        Row: RoundLog;
        Insert: {
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
        };
        Update: {
          id?: string;
          room_id?: string;
          round_number?: number;
          letter?: string;
          categories?: string[];
          player_count?: number;
          complexity_score?: number;
          predicted_avg_score?: number;
          actual_avg_score?: number;
          prediction_error?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
