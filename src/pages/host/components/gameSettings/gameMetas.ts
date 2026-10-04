/**
 * Oyun ayarları modalının oyun başına görünüm bilgileri (başlık, renk,
 * açıklama) ve quiz konu listesi. GameSettingsModal.tsx'ten ayrıştırıldı
 * (docs/roadmap.md, 2.7).
 */
import type { TranslationKey } from "../../../../lib/i18n";

export interface GameMeta {
  title: string;
  badge: string;
  color: string;
  glow: string;
  icon: "flame" | "lightbulb" | "rocket" | "dashboard" | "users" | "crown" | "settings";
  description: string;
  /** Varsa açıklama bu anahtardan, host'un dilinde gösterilir. */
  descKey?: TranslationKey;
}

export const GAME_METAS: Record<string, GameMeta> = {
  scattegories: {
    title: "HENGAME ARENA",
    badge: "WORT & TEMPO",
    color: "#ff5500",
    glow: "rgba(255,85,0,0.5)",
    icon: "flame",
    description: "Klassische Wort-Arena: Finde die kreativsten Begriffe mit dem vorgegebenen Buchstaben schneller als die anderen Tische."
  },
  quiz: {
    title: "HENGAME QUIZ",
    badge: "TRIVIA & KULTUR",
    color: "#00e5ff",
    glow: "rgba(0,229,255,0.5)",
    icon: "lightbulb",
    description: "Nachtleben, Musik, Film und Popkultur: 4 Antwortmöglichkeiten, rasante Runden und 2X Finale."
  },
  bomb: {
    title: "HENGAME BOMB",
    badge: "REFLEX & DRUCK",
    color: "#ff003c",
    glow: "rgba(255,0,60,0.5)",
    icon: "rocket",
    description: "Die tickende Wort-Bombe: Gib schnell ein passendes Wort ein und passe die Bombe weiter, bevor sie explodiert!"
  },
  sensor: {
    title: "HENGAME SENSOR",
    badge: "BILD & BUZZER",
    color: "#ff007f",
    glow: "rgba(255,0,128,0.5)",
    icon: "dashboard",
    description: "Das Bild wird schrittweise schärfer: Wer den Buzzer zuerst drückt und das Bild errät, holt die Punkte."
  },
  overload: {
    title: "NEON OVERLOAD",
    badge: "REAKTOR-UEBERLASTUNG",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.5)",
    icon: "flame",
    description: "Jeder Pass erhöht die Hochspannung: Halte die Reaktorspannung stabil und wehre die Ladung sofort ab!"
  },
  colors: {
    title: "NEON WARS",
    badge: "TEAM-TAUDRÜCKEN",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.5)",
    icon: "users",
    description: "Team Rot gegen Team Blau: Schnelligkeit entscheidet, wer die Vorherrschaft auf dem Hauptbildschirm erobert."
  },
  bar: {
    title: "NEON MIXOLOGY",
    badge: "BAR-MEISTER",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.5)",
    icon: "crown",
    description: "Cocktail-Rezepte in Rekordzeit: Gieße die richtigen Zutaten in der exakten Reihenfolge ein."
  },
  wheel: {
    title: "HENGAME GLÜCKSRAD",
    badge: "PREISE & SHOTS",
    color: "#eab308",
    glow: "rgba(234,179,8,0.5)",
    icon: "crown",
    description: "Belohne deine Gäste mit Shots, Drinks und Specials über das interaktive Neon-Glücksrad."
  },
  kablo: {
    title: "CYBER WIRE",
    badge: "SCHALTKREIS",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.5)",
    icon: "flame",
    description: "Verbinde die Leitungen, um den Hauptgenerator des Clubs im Teamplay aufzuladen."
  },
  vault: {
    title: "NEON TRESOR",
    badge: "CODE-KNACKER",
    color: "#10b981",
    glow: "rgba(16,185,129,0.5)",
    icon: "dashboard",
    description: "Knacke die 4-stellige Tresor-Kombination durch logische Hinweise vor allen anderen."
  },
  unity: {
    title: "NEON EINHEIT",
    badge: "GEMEINSAME ENERGIE",
    color: "#f97316",
    glow: "rgba(249,115,22,0.5)",
    icon: "users",
    description: "Alle Spieler klicken im Takt, um die Club-Batterie zur maximalen Entladung zu bringen."
  },
  ayna: {
    title: "HENGAME AYNA",
    badge: "WELT & EMPATHIE",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.5)",
    icon: "lightbulb",
    description: "",
    descKey: "dashboard.modeAynaDesc",
  },
  echo: {
    title: "HENGAME ECHO",
    badge: "CLUB-VOTING",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.5)",
    icon: "users",
    description: "Das soziale Voting: Wer ist der lustigste, verrückteste oder aktivste Tisch des Abends?"
  },
  pulse: {
    title: "NEON PULSE",
    badge: "TIMING-REFLEX",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.5)",
    icon: "flame",
    description: "Erwische den perfekten Moment, wenn der Herzschlag-Impuls auf dem TV-Bildschirm den Peak erreicht."
  }
};

export const QUIZ_CATEGORIES = [
  { id: "gece", label: "🍸 NIGHTLIFE & BAR", icon: "🍸" },
  { id: "muzik", label: "🎵 MUSIK & CHARTS", icon: "🎵" },
  { id: "sinema", label: "🎬 KINO & SERIEN", icon: "🎬" },
  { id: "zeka", label: "🧠 LOGIK & TRICK", icon: "🧠" },
  { id: "kultur", label: "🌍 ALLGEMEINWISSEN", icon: "🌍" },
  { id: "bilim", label: "🚀 TECH & TRENDS", icon: "🚀" }
];
