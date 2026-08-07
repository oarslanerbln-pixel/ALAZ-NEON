/**
 * ALAZ NEON — Premium Cinematic Sound Engine v3
 * A full cinematic intro sequence with rhythm, bass, risers, and impact.
 */

function getAudioContext(): AudioContext {
  const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return new AudioContextClass();
}

/**
 * CINEMATIC INTRO SEQUENCE (~4 seconds)
 * Phase 1: Deep rhythmic bass pulses (0.0s - 1.5s)
 * Phase 2: Ascending synth riser with tension (0.3s - 2.0s)
 * Phase 3: THE DROP — massive sub impact + white noise burst (2.0s)
 * Phase 4: Shimmering harmonic cascade + metallic tail (2.0s - 4.0s)
 */
export function playCinematicWhoosh() {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.7, now);
    master.connect(ctx.destination);

    // ═══════════════════════════════════════════
    // PHASE 1: RHYTHMIC BASS PULSES (The Heartbeat)
    // ═══════════════════════════════════════════
    const kickTimes = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.4, 1.5, 1.55, 1.6];
    kickTimes.forEach((t, i) => {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      const kickFilter = ctx.createBiquadFilter();

      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(80, now + t);
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + t + 0.15);

      kickFilter.type = "lowpass";
      kickFilter.frequency.value = 150;

      // Accelerating intensity
      const vol = 0.3 + (i / kickTimes.length) * 0.5;
      kickGain.gain.setValueAtTime(0, now + t);
      kickGain.gain.linearRampToValueAtTime(vol, now + t + 0.01);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.15);

      kickOsc.connect(kickFilter);
      kickFilter.connect(kickGain);
      kickGain.connect(master);
      kickOsc.start(now + t);
      kickOsc.stop(now + t + 0.2);
    });

    // ═══════════════════════════════════════════
    // PHASE 2: SYNTH RISER (Building Tension)
    // ═══════════════════════════════════════════
    const riserOsc = ctx.createOscillator();
    const riserOsc2 = ctx.createOscillator();
    const riserGain = ctx.createGain();
    const riserFilter = ctx.createBiquadFilter();

    riserOsc.type = "sawtooth";
    riserOsc.frequency.setValueAtTime(80, now + 0.3);
    riserOsc.frequency.exponentialRampToValueAtTime(2000, now + 2.0);

    riserOsc2.type = "sawtooth";
    riserOsc2.frequency.setValueAtTime(80.5, now + 0.3); // Detuned for thickness
    riserOsc2.frequency.exponentialRampToValueAtTime(2005, now + 2.0);

    riserFilter.type = "bandpass";
    riserFilter.frequency.setValueAtTime(100, now + 0.3);
    riserFilter.frequency.exponentialRampToValueAtTime(4000, now + 2.0);
    riserFilter.Q.value = 3;

    riserGain.gain.setValueAtTime(0, now + 0.3);
    riserGain.gain.linearRampToValueAtTime(0.15, now + 1.0);
    riserGain.gain.linearRampToValueAtTime(0.25, now + 1.8);
    riserGain.gain.linearRampToValueAtTime(0, now + 2.05); // Cut before drop

    riserOsc.connect(riserFilter);
    riserOsc2.connect(riserFilter);
    riserFilter.connect(riserGain);
    riserGain.connect(master);

    riserOsc.start(now + 0.3);
    riserOsc.stop(now + 2.1);
    riserOsc2.start(now + 0.3);
    riserOsc2.stop(now + 2.1);

    // ═══════════════════════════════════════════
    // PHASE 3: THE DROP (Massive Impact)
    // ═══════════════════════════════════════════
    const dropTime = now + 2.0;

    // Sub-bass impact
    const dropOsc = ctx.createOscillator();
    const dropGain = ctx.createGain();
    const dropDist = ctx.createWaveShaper();

    // Soft clip distortion curve
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = i / 128 - 1;
      curve[i] = ((Math.PI + 3) * x) / (Math.PI + 3 * Math.abs(x));
    }
    dropDist.curve = curve;

    dropOsc.type = "sine";
    dropOsc.frequency.setValueAtTime(60, dropTime);
    dropOsc.frequency.exponentialRampToValueAtTime(25, dropTime + 1.5);

    dropGain.gain.setValueAtTime(0, dropTime);
    dropGain.gain.linearRampToValueAtTime(1.0, dropTime + 0.02);
    dropGain.gain.exponentialRampToValueAtTime(0.001, dropTime + 2.0);

    dropOsc.connect(dropDist);
    dropDist.connect(dropGain);
    dropGain.connect(master);
    dropOsc.start(dropTime);
    dropOsc.stop(dropTime + 2.0);

    // White noise burst (impact texture)
    const noiseLen = ctx.sampleRate * 0.5;
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();

    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(5000, dropTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, dropTime + 0.4);

    noiseGain.gain.setValueAtTime(0, dropTime);
    noiseGain.gain.linearRampToValueAtTime(0.4, dropTime + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, dropTime + 0.4);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSrc.start(dropTime);
    noiseSrc.stop(dropTime + 0.5);

    // ═══════════════════════════════════════════
    // PHASE 4: HARMONIC CASCADE (The Shimmer)
    // ═══════════════════════════════════════════
    const chordFreqs = [
      // Cm9 voicing — dark, cinematic, premium
      { f: 130.81, vol: 0.08 }, // C3
      { f: 155.56, vol: 0.06 }, // Eb3
      { f: 196.0, vol: 0.07 }, // G3
      { f: 233.08, vol: 0.05 }, // Bb3
      { f: 293.66, vol: 0.04 }, // D4
      // Upper shimmer partials
      { f: 523.25, vol: 0.03 }, // C5
      { f: 783.99, vol: 0.02 }, // G5
      { f: 1046.5, vol: 0.015 }, // C6
    ];

    chordFreqs.forEach(({ f, vol }, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const delay = i * 0.04;

      osc.type = i < 5 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, dropTime + delay);

      g.gain.setValueAtTime(0, dropTime + delay);
      g.gain.linearRampToValueAtTime(vol, dropTime + delay + 0.05);
      g.gain.setValueAtTime(vol, dropTime + delay + 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, dropTime + 2.0);

      osc.connect(g);
      g.connect(master);
      osc.start(dropTime + delay);
      osc.stop(dropTime + 2.5);
    });

    // Metallic ping tail
    const pingFreqs = [2637, 3520, 4186]; // E7, A7, C8
    pingFreqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const t = dropTime + 0.05 + i * 0.08;

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);

      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.04, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 1.2);
    });

    setTimeout(() => ctx.close(), 5000);
  } catch (e) {
    console.warn("Cinematic synthesis failed:", e);
  }
}

/**
 * Cinematic Impact (used for letter reveals, etc.)
 */
export function playCinematicImpact() {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Sub-bass punch
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(50, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.8, now + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.8);

    // Noise layer
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nf = ctx.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.setValueAtTime(100, now);
    nf.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
    nf.frequency.exponentialRampToValueAtTime(100, now + 0.8);
    nf.Q.value = 8;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, now);
    ng.gain.linearRampToValueAtTime(0.3, now + 0.05);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.8);

    setTimeout(() => ctx.close(), 1500);
  } catch (e) {
    console.warn("Impact synthesis failed:", e);
  }
}

/**
 * Success Harmonics (Round win / Score reveal)
 */
export function playSuccessHarmonics() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C major arpeggio

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      g.gain.setValueAtTime(0, now + i * 0.06);
      g.gain.linearRampToValueAtTime(0.1, now + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + 1.5);
    });

    setTimeout(() => ctx.close(), 2000);
  } catch (e) {
    console.warn("Success harmonics failed:", e);
  }
}

/**
 * Legacy alias
 */
export function playPremiumIntroLaunch() {
  playCinematicWhoosh();
}
