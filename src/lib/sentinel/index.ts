import { SentinelCrypto } from "./crypto";
import { SentinelRadar } from "./radar";

/**
 * Sentinel Core Service
 * The main background AI sentinel that manages game security and observability.
 * Implemented as a Singleton for the Host.
 */
class SentinelCore {
  private static instance: SentinelCore;
  
  public crypto: typeof SentinelCrypto;
  public radar: SentinelRadar;

  private constructor() {
    this.crypto = SentinelCrypto;
    this.radar = new SentinelRadar();
  }

  public static getInstance(): SentinelCore {
    if (!SentinelCore.instance) {
      SentinelCore.instance = new SentinelCore();
    }
    return SentinelCore.instance;
  }

  /**
   * Main entry point for validating an incoming answer from a player.
   * Runs the answer through Crypto (Sanitization) and Radar (Behavior).
   * 
   * @returns The sanitized answer, or null if the player is shadowbanned/caught.
   */
  public processIncomingAnswer(playerId: string, rawAnswer: string): string | null {
    // 1. Check if already shadowbanned
    if (this.radar.isShadowbanned(playerId)) {
      return null; // Silently drop
    }

    // 2. Sanitize payload
    const safeAnswer = this.crypto.sanitizePayload(rawAnswer);

    // 3. Radar speed check
    const isHuman = this.radar.analyzeAnswerSpeed(playerId, safeAnswer);
    if (!isHuman) {
      return null; // Silently drop and ban
    }

    return safeAnswer;
  }
}

export const Sentinel = SentinelCore.getInstance();
