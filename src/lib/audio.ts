export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;

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

    const sound = this.getSound(path);
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch((e) => console.warn("Audio play failed:", e));
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

    const music = this.getSound(path);
    music.volume = volume;
    music.loop = true;
    music.play().catch((e) => console.warn("Music play failed:", e));
  }

  public stopSound(path: string) {
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
export const sounds = {
  // Premium Music Tracks (URL-based, longer loops)
  LOBBY_AMBIENT:
    "https://cdn.pixabay.com/audio/2022/01/21/audio_31743c58bc.mp3", // Upbeat Pop
  GAME_PULSE: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf7eb.mp3", // Relaxing Lofi Study
  // Synthesized SFX (no external URL needed — immune to 403 errors)
  START_JAZZ: "synth:burn",
  SUCCESS: "synth:success",
  FAILURE: "synth:failure",
  CLICK: "synth:click",
  VOTE_TICK: "synth:click",
  BURN: "synth:burn",
  START: "synth:burn",
  SIREN: "synth:siren",
};
