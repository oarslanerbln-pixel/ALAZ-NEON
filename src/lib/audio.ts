export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  /** Yüklenemeyen dosyalar (404/403/desteklenmeyen) — bir daha denenmez, synth'e düşülür */
  private missing: Set<string> = new Set();
  /** Dosya yerine synth pad çalınan müzik yolu */
  private padFor: string | null = null;
  private pad: { ctx: AudioContext; stop: () => void } | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("alaz_neon_muted") === "true";
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Preload or get a sound
   */
  private getSound(path: string): HTMLAudioElement {
    if (!this.sounds.has(path)) {
      const audio = new Audio(path);
      // Dosya hiç yüklenemezse işaretle: bir sonraki çalma synth'e düşer
      audio.addEventListener("error", () => {
        console.warn("[audio] Kaynak yüklenemedi:", path);
        this.missing.add(path);
      });
      this.sounds.set(path, audio);
    }
    return this.sounds.get(path)!;
  }

  /**
   * Play a sound effect once
   * Supports both URL-based audio files and synth-generated SFX
   */
  public playSFX(path: string, volume: number = 0.5) {
    if (this.isMuted) return;

    // Handle synth-based SFX
    if (path.startsWith("synth:")) {
      this.playSynthSFX(path, volume);
      return;
    }

    // Dosya daha önce yüklenemediyse doğrudan synth karşılığını çal
    if (this.missing.has(path)) {
      const fb = SYNTH_FALLBACK[path];
      if (fb) this.playSynthSFX(fb, volume);
      return;
    }

    const sound = this.getSound(path);
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch((e: DOMException) => {
      if (e?.name === "NotSupportedError" || e?.name === "NotFoundError") {
        // Dosya yok / bozuk → kalıcı olarak synth'e geç
        console.warn("[audio] Dosya yüklenemedi, synth'e düşülüyor:", path);
        this.missing.add(path);
        const fb = SYNTH_FALLBACK[path];
        if (fb) this.playSynthSFX(fb, volume);
      } else {
        // NotAllowedError = tarayıcı autoplay politikası, dosya sorunu değil
        console.warn("Audio play failed:", path, e?.name);
      }
    });
  }

  /**
   * Play a synthesized sound effect (no external URL needed)
   */
  private playSynthSFX(type: string, volume: number = 0.5) {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(volume, now);
      master.connect(ctx.destination);

      switch (type) {
        case "synth:click": {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
          g.gain.setValueAtTime(0.3, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 0.1);
          setTimeout(() => ctx.close(), 200);
          break;
        }
        case "synth:success": {
          const freqs = [523.25, 659.25, 783.99, 1046.5];
          freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + i * 0.08);
            g.gain.setValueAtTime(0, now + i * 0.08);
            g.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            osc.connect(g);
            g.connect(master);
            osc.start(now + i * 0.08);
            osc.stop(now + 1.2);
          });
          setTimeout(() => ctx.close(), 1500);
          break;
        }
        case "synth:failure": {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
          g.gain.setValueAtTime(0.2, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 600;
          osc.connect(filter);
          filter.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 0.6);
          setTimeout(() => ctx.close(), 800);
          break;
        }
        case "synth:burn": {
          // Short whoosh
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buf;
          const nf = ctx.createBiquadFilter();
          nf.type = "bandpass";
          nf.frequency.setValueAtTime(500, now);
          nf.frequency.exponentialRampToValueAtTime(3000, now + 0.15);
          nf.Q.value = 5;
          const ng = ctx.createGain();
          ng.gain.setValueAtTime(0, now);
          ng.gain.linearRampToValueAtTime(0.3, now + 0.05);
          ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          noise.connect(nf);
          nf.connect(ng);
          ng.connect(master);
          noise.start(now);
          noise.stop(now + 0.3);
          setTimeout(() => ctx.close(), 500);
          break;
        }
        case "synth:siren": {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
          osc.frequency.linearRampToValueAtTime(600, now + 1.0);
          osc.frequency.linearRampToValueAtTime(1200, now + 1.5);
          osc.frequency.linearRampToValueAtTime(600, now + 2.0);
          
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.3, now + 0.1);
          g.gain.setValueAtTime(0.3, now + 1.9);
          g.gain.linearRampToValueAtTime(0, now + 2.0);
          
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 2.0);
          setTimeout(() => ctx.close(), 2500);
          break;
        }
        case "synth:boom": {
          // Sinematik patlama: alçalan sinüs + gürültü kuyruğu
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(28, now + 1.2);
          g.gain.setValueAtTime(0.6, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 1.7);

          const buf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buf;
          const nf = ctx.createBiquadFilter();
          nf.type = "lowpass";
          nf.frequency.setValueAtTime(1800, now);
          nf.frequency.exponentialRampToValueAtTime(160, now + 1.2);
          const ng = ctx.createGain();
          ng.gain.setValueAtTime(0.35, now);
          ng.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          noise.connect(nf);
          nf.connect(ng);
          ng.connect(master);
          noise.start(now);
          noise.stop(now + 1.3);
          setTimeout(() => ctx.close(), 2000);
          break;
        }
        case "synth:glitch": {
          // Dijital bozulma: kare dalga sıçramaları + kısa gürültü patlamaları
          for (let i = 0; i < 7; i++) {
            const t = now + i * 0.055;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(180 + Math.random() * 2600, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.18, t + 0.005);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
            osc.connect(g);
            g.connect(master);
            osc.start(t);
            osc.stop(t + 0.05);
          }
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) {
            d[i] = Math.random() > 0.75 ? Math.random() * 2 - 1 : 0;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buf;
          const nf = ctx.createBiquadFilter();
          nf.type = "highpass";
          nf.frequency.value = 1400;
          const ng = ctx.createGain();
          ng.gain.setValueAtTime(0.22, now);
          ng.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          noise.connect(nf);
          nf.connect(ng);
          ng.connect(master);
          noise.start(now);
          noise.stop(now + 0.4);
          setTimeout(() => ctx.close(), 700);
          break;
        }
        case "synth:tick_urgent": {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          g.gain.setValueAtTime(0.4, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 0.06);
          setTimeout(() => ctx.close(), 150);
          break;
        }
        case "synth:fanfare": {
          // Triad victory flourish: C5 -> E5 -> G5 -> C6
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            g.gain.setValueAtTime(0, now + i * 0.12);
            g.gain.linearRampToValueAtTime(0.2, now + i * 0.12 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + (i === 3 ? 1.8 : 0.4));
            
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 2500;
            
            osc.connect(filter);
            filter.connect(g);
            g.connect(master);
            
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + (i === 3 ? 2.0 : 0.5));
          });
          setTimeout(() => ctx.close(), 2500);
          break;
        }
        default:
          ctx.close();
      }
    } catch (e) {
      console.warn("Synth SFX failed:", e);
    }
  }

  /**
   * Play background music (loops)
   */
  public playMusic(path: string, volume: number = 0.3) {
    if (this.isMuted) return;

    // Dosya yoksa sürekli çalan synth pad'e düş
    if (this.missing.has(path)) {
      this.startPad(path, volume);
      return;
    }

    const music = this.getSound(path);
    music.volume = volume;
    music.loop = true;
    music.play().catch((e: DOMException) => {
      if (e?.name === "NotSupportedError" || e?.name === "NotFoundError") {
        console.warn("[audio] Müzik dosyası yüklenemedi, pad'e düşülüyor:", path);
        this.missing.add(path);
        this.startPad(path, volume);
      } else {
        console.warn("Music play failed:", path, e?.name);
      }
    });
  }

  /** Dosya bulunamadığında çalan, sürekli döngüdeki ambiyans pad'i */
  private startPad(path: string, volume: number) {
    if (this.pad && this.padFor === path) return; // zaten çalıyor
    this.stopPad();
    if (typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = volume * 0.25;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      filter.connect(master);
      master.connect(ctx.destination);

      // Hafif detune'lu üçlü akor + yavaş LFO = lounge ambiyans
      const oscs = [110, 164.81, 220].map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? "triangle" : "sawtooth";
        o.frequency.value = f;
        o.detune.value = (i - 1) * 6;
        const g = ctx.createGain();
        g.gain.value = 0.12;
        o.connect(g);
        g.connect(filter);
        o.start();
        return o;
      });

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 300;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      this.pad = {
        ctx,
        stop: () => {
          try {
            oscs.forEach((o) => o.stop());
            lfo.stop();
            ctx.close();
          } catch {
            /* zaten kapalı */
          }
        },
      };
      this.padFor = path;
    } catch (e) {
      console.warn("[audio] Pad başlatılamadı:", e);
    }
  }

  private stopPad() {
    if (this.pad) {
      this.pad.stop();
      this.pad = null;
      this.padFor = null;
    }
  }

  public stopSound(path: string) {
    if (this.padFor === path) this.stopPad();
    const sound = this.sounds.get(path);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("alaz_neon_muted", String(this.isMuted));

    if (this.isMuted) {
      this.sounds.forEach((sound) => sound.pause());
      this.stopPad();
    }
  }

  public isMutedStatus(): boolean {
    return this.isMuted;
  }

  /**
   * Starts the premium lounge music instead of the old synth drone
   */
  public startAmbientDrone() {
    if (this.isMuted || typeof window === "undefined") return;
    this.playMusic(sounds.LOBBY_AMBIENT, 0.4);
  }

  public stopAmbientDrone() {
    this.stopSound(sounds.LOBBY_AMBIENT);
  }
}
/**
 * TÜM sesler artık yerel (public/audio). CDN hotlink'i 403 veriyordu ve
 * hiçbir ses çalmıyordu. Dosya yoksa aşağıdaki synth karşılığına düşülür,
 * yani ses sistemi hiçbir koşulda sessiz kalmaz.
 *
 * Kendi mp3'ünü eklemek için: dosyayı public/audio/<isim>.mp3 olarak koy —
 * kod otomatik olarak dosyayı tercih eder, synth yedeği devre dışı kalır.
 */
export const sounds = {
  // Müzik (yerel dosya, döngü)
  LOBBY_AMBIENT: "/audio/lobby-ambient.mp3",
  GAME_PULSE: "/audio/game-pulse.mp3",
  // Uzun/atmosferik efektler (yerel dosya)
  SIREN: "/audio/siren.mp3",
  CINEMATIC_BOOM: "/audio/cinematic-boom.mp3",
  CYBER_GLITCH: "/audio/cyber-glitch.mp3",
  // Kısa SFX — zaten kod içinde üretiliyor, dosya gerekmiyor
  START_JAZZ: "synth:burn",
  SUCCESS: "synth:success",
  FAILURE: "synth:failure",
  CLICK: "synth:click",
  VOTE_TICK: "synth:click",
  TICK_URGENT: "synth:tick_urgent",
  FANFARE: "synth:fanfare",
  BURN: "synth:burn",
  START: "synth:burn",
};

/** Dosya yüklenemezse devreye giren synth karşılıkları */
const SYNTH_FALLBACK: Record<string, string> = {
  [sounds.LOBBY_AMBIENT]: "synth:pad",
  [sounds.GAME_PULSE]: "synth:pad",
  [sounds.SIREN]: "synth:siren",
  [sounds.CINEMATIC_BOOM]: "synth:boom",
  [sounds.CYBER_GLITCH]: "synth:glitch",
};
