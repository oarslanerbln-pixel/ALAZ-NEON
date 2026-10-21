/**
 * TV spikerinin çalıcısı: önceden yükler, müziği kısar, üst üste bindirmez.
 * Karar mantığı saf olarak lib/announcer.ts'te; burası yalnızca HTMLAudio ve
 * SoundManager'a bağlanır. Yalnızca host ekranı kullanır.
 */

import { SoundManager } from "./audio";
import {
  ANNOUNCER_CUES,
  MUSIC_DUCK_LEVEL,
  announcerPath,
  createAnnouncerState,
  decideCue,
  pickQueued,
  recordPlay,
  startNewGame,
  type AnnouncerCue,
  type AnnouncerState,
  type NowPlaying,
} from "./announcer";

const VOICE_MUTED_KEY = "alaz_neon_voice_muted";
const VOICE_VOLUME = 0.95;
/** Süre bilgisi (metadata) yüklenmeden çalarsa varsayılan uzunluk. */
const FALLBACK_DURATION_MS = 3500;

function readVoiceMuted(): boolean {
  try {
    return localStorage.getItem(VOICE_MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

class HostAnnouncer {
  private state: AnnouncerState = createAnnouncerState();
  private clips = new Map<AnnouncerCue, HTMLAudioElement>();
  private missing = new Set<AnnouncerCue>();
  private playing: (NowPlaying & { audio: HTMLAudioElement }) | null = null;
  private queued: AnnouncerCue | null = null;
  private voiceMuted = typeof window !== "undefined" && readVoiceMuted();

  /** TV açılırken bütün anonsları indirir (~200 KB); ilk anons gecikmez. */
  preload() {
    if (typeof window === "undefined") return;
    for (const cue of ANNOUNCER_CUES) this.clip(cue);
  }

  private clip(cue: AnnouncerCue): HTMLAudioElement {
    let audio = this.clips.get(cue);
    if (!audio) {
      audio = new Audio(announcerPath(cue));
      audio.preload = "auto";
      audio.addEventListener("error", () => this.missing.add(cue));
      this.clips.set(cue, audio);
    }
    return audio;
  }

  isVoiceMuted() {
    return this.voiceMuted;
  }

  setVoiceMuted(muted: boolean) {
    this.voiceMuted = muted;
    try {
      localStorage.setItem(VOICE_MUTED_KEY, String(muted));
    } catch {
      /* gizli sekme: yalnızca bu oturumda geçerli */
    }
    if (muted) this.stop();
  }

  newGame() {
    this.state = startNewGame(this.state);
  }

  say(cue: AnnouncerCue) {
    if (this.missing.has(cue)) return;
    const muted = this.voiceMuted || SoundManager.getInstance().getIsMuted();
    const decision = decideCue(this.state, cue, Date.now(), this.playing, muted);
    switch (decision.kind) {
      case "skip":
        return;
      case "queue":
        this.queued = pickQueued(this.queued, cue);
        return;
      case "interrupt":
        this.halt();
        this.start(cue);
        return;
      case "play":
        this.start(cue);
    }
  }

  private start(cue: AnnouncerCue) {
    const audio = this.clip(cue);
    const now = Date.now();
    const durationMs = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration * 1000 : FALLBACK_DURATION_MS;
    this.state = recordPlay(this.state, cue, now);
    this.playing = { cue, endsAt: now + durationMs, audio };

    SoundManager.getInstance().setMusicDuck(MUSIC_DUCK_LEVEL);
    audio.volume = VOICE_VOLUME;
    audio.currentTime = 0;
    audio.onended = () => this.finish(audio);
    audio.play().catch(() => {
      // Autoplay engeli ya da eksik dosya: sessiz geç, müziği geri aç.
      this.finish(audio);
    });
  }

  private finish(audio: HTMLAudioElement) {
    if (this.playing?.audio !== audio) return;
    this.playing = null;
    const next = this.queued;
    this.queued = null;
    if (next) this.say(next);
    if (!this.playing) SoundManager.getInstance().setMusicDuck(1);
  }

  private halt() {
    if (!this.playing) return;
    const { audio } = this.playing;
    audio.onended = null;
    audio.pause();
    this.playing = null;
  }

  /** Susturma ya da ekrandan çıkış: çalan ve bekleyen anons düşer. */
  stop() {
    this.halt();
    this.queued = null;
    SoundManager.getInstance().setMusicDuck(1);
  }
}

export const hostAnnouncer = new HostAnnouncer();
