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
  | "sensor_reveal"
  | "ad_break"
  | "wheel_active"
  | "wheel_spinning"
  | "wheel_result"
  | "echo_intro"
  | "echo_active"
  | "echo_reveal"
  | "pulse_intro"
  | "pulse_active"
  | "pulse_reveal"
  | "spectrum_intro"
  | "spectrum_active"
  | "spectrum_reveal";

export type GameMode = "individual" | "team";
export type GameType = "scattegories" | "quiz" | "bomb" | "sensor" | "wheel" | "overload" | "echo" | "pulse" | "spectrum";

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
  // Wheel Game Fields
  wheel_spinner_id?: string | null;
  wheel_result_index?: number | null;
  // Overload Game Fields
  overload_target_id?: string | null;
  overload_time_allowed?: number;
  overload_start_time?: number;
  overload_eliminated_ids?: string[];
  // Echo Game Fields
  echo_question?: string;
  echo_votes?: Record<string, string>;
  // Pulse Game Fields
  pulse_target_time?: number;
  pulse_clicks?: Record<string, number>;
  pulse_result?: number;
  // Spectrum Game Fields
  spectrum_teams?: Record<string, "red" | "blue">; // playerId -> team
  spectrum_scores?: Record<"red" | "blue", number>;
  spectrum_end_time?: number;
  // Ad Break Flow Control
  ad_break_next_state?: RoomStatus;
  // Mekan markalaması — oda açılırken o anki aktif mekan profilinden
  // KOPYALANIR (canlı referans değil). Böylece bir mekana satış sonrası
  // marka değiştirilse bile geçmiş odaların/demoların markası değişmez.
  // Alanlar boşsa varsayılan HENGAME markası kullanılır.
  venue_name?: string;
  venue_logo_url?: string;
  venue_primary_color?: string;
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

export interface SponsorAd {
  id: string;
  type: "image" | "video";
  url: string;
  duration_seconds: number;
  sponsor_name: string;
}

export interface WheelSlice {
  id: string;
  text: string;
  color: string;
  weight: number;
}

/**
 * Aktif mekan markası — tek bir doküman (app_config/active_venue).
 *
 * Bu, tam çoklu-kiracı (multi-tenant) bir sistem DEĞİL: aynı anda tek bir
 * "aktif" marka vardır, satıcı bunu her mekana giderken değiştirir. Bir oda
 * açıldığında bu ayarların bir KOPYASI Room'a yazılır (bkz. Room.venue_*),
 * böylece marka sonradan değişse bile geçmiş odalar etkilenmez.
 */
export interface VenueConfig {
  name: string;
  logo_url?: string;
  /** Hex renk, örn. "#ff5500". Boşsa varsayılan HENGAME turuncusu kullanılır. */
  primary_color?: string;
  rewards_enabled: boolean;
  /**
   * Ödül şablonu — oyun bittiğinde kazanana (bireysel modda tek oyuncu,
   * takım modunda kazanan takımın TÜM üyelerine) bu şablondan bir Reward
   * dokümanı üretilir. Boş bırakılırsa (reward_title yok) hiç ödül
   * üretilmez, `rewards_enabled` açık olsa bile — satıcı ödülü henüz
   * tanımlamadıysa sahte/boş bir ödül dağıtılmasın diye.
   */
  reward_title?: string;
  reward_description?: string;
  reward_type?: "drink" | "discount" | "special";
  /**
   * Bir ödül kaç gün geçerli kalsın. Önceden ödüller hiç sona ermiyordu —
   * bir oyuncu kazanıp hiç kullanmazsa "available" statüsünde sonsuza kadar
   * birikiyordu. Varsayılan 30 gün; satıcı isterse kısaltıp uzatabiliyor.
   */
  reward_validity_days?: number;
  /**
   * Boşta ekranı (AttractMode) döngüsüne eklenen tanıtım görselleri —
   * mekanın kendi kampanyası/menüsü/etkinliği. Firebase Storage
   * kullanılmıyor bilerek: proje Spark (ücretsiz) planda ve Storage artık
   * yalnızca Blaze planında çalışıyor (Google, Eylül 2024'te duyurup
   * kademeli zorunlu hâle getirdi). Satıcı görselini kendi barındırdığı bir
   * yere (Instagram, Google Drive genel link vb.) koyup URL'ini buraya
   * yapıştırıyor — tıpkı logo_url gibi.
   */
  promo_images?: string[];
  /**
   * Sponsor reklamları - Ad Network için
   */
  sponsor_ads?: SponsorAd[];
  /**
   * Çarkıfelek dilimleri
   */
  wheel_slices?: WheelSlice[];
  updated_at?: number;
}

export const DEFAULT_VENUE_CONFIG: VenueConfig = {
  name: "HENGAME",
  primary_color: "#ff5500",
  rewards_enabled: true,
  reward_title: "",
  reward_description: "",
  reward_type: "drink",
  reward_validity_days: 30,
  promo_images: [],
  sponsor_ads: [],
  wheel_slices: [
    { id: "1", text: "%10 İndirim", color: "#ff5500", weight: 3 },
    { id: "2", text: "Pas", color: "#333333", weight: 5 },
    { id: "3", text: "Bedava Çay", color: "#00f3ff", weight: 2 },
    { id: "4", text: "Pas", color: "#333333", weight: 5 },
    { id: "5", text: "Tatlı İkramı", color: "#ff00e5", weight: 1 },
    { id: "6", text: "Pas", color: "#333333", weight: 5 },
  ],
};

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
  /**
   * Kazanıldığı andaki oyuncu adı — kalıcı bir kullanıcı profiline (users/
   * {uid}) bağımlı değil, çünkü telefonla giriş yapmamış (yalnızca anonim)
   * oyuncuların böyle bir profili hiç olmayabilir. Personel doğrulama
   * ekranı bu yüzden ekstra bir sorguya gerek duymadan direkt bu alanı
   * gösteriyor.
   */
  nickname: string;
  type: "drink" | "discount" | "special";
  title: string;
  description: string;
  status: "available" | "claimed";
  code: string;
  earned_at: number;
  claimed_at?: number;
  /**
   * `venue.reward_validity_days`'e göre kazanıldığı anda hesaplanıp
   * dokümana gömülür (o anki mekan ayarı neyse) — sonradan satıcı süreyi
   * değiştirse bile ZATEN dağıtılmış kuponları geriye dönük etkilemez.
   * Eski (bu alan olmadan üretilmiş) ödüller `undefined` gelir; okuyan
   * taraf bunu "süresiz" değil "eski format" olarak ele almalı.
   */
  expires_at?: number;
}
