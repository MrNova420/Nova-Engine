/**
 * Copyright (c) 2025 Kayden Shawn Massengill (WeNova Interactive)
 * Licensed under the Nova Engine License - see LICENSE file
 */

import { IPlatform, PlatformType } from './IPlatform';

/**
 * Platform Registry
 *
 * Manages platform instances and provides access to the current platform
 */
export class PlatformRegistry {
  private static instance: PlatformRegistry | null = null;
  private currentPlatform: IPlatform | null = null;
  private platforms: Map<PlatformType, IPlatform> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PlatformRegistry {
    if (!PlatformRegistry.instance) {
      PlatformRegistry.instance = new PlatformRegistry();
    }
    return PlatformRegistry.instance;
  }

  /**
   * Register a platform implementation
   */
  public registerPlatform(type: PlatformType, platform: IPlatform): void {
    this.platforms.set(type, platform);
  }

  /**
   * Set the current platform
   */
  public async setCurrentPlatform(type: PlatformType): Promise<void> {
    const platform = this.platforms.get(type);
    if (!platform) {
      throw new Error(`Platform ${type} is not registered`);
    }

    // Shutdown previous platform if exists
    if (this.currentPlatform) {
      await this.currentPlatform.shutdown();
    }

    // Initialize new platform
    await platform.initialize();
    this.currentPlatform = platform;
  }

  /**
   * Get the current platform
   */
  public getCurrentPlatform(): IPlatform {
    if (!this.currentPlatform) {
      throw new Error('No platform is currently set');
    }
    return this.currentPlatform;
  }

  /**
   * Check if a platform is registered
   */
  public hasPlatform(type: PlatformType): boolean {
    return this.platforms.has(type);
  }

  /**
   * Auto-detect and set the appropriate platform
   */
  public async autoDetectPlatform(): Promise<void> {
    let detectedType: PlatformType;

    // Detect platform based on environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Browser environment
      detectedType = PlatformType.WEB;
    } else if (typeof process !== 'undefined' && process.versions?.node) {
      // Node.js environment (desktop)
      detectedType = PlatformType.DESKTOP;
    } else {
      throw new Error('Unable to detect platform');
    }

    if (!this.hasPlatform(detectedType)) {
      throw new Error(`Platform ${detectedType} is not registered`);
    }

    await this.setCurrentPlatform(detectedType);
  }

  /**
   * Shutdown current platform
   */
  public async shutdown(): Promise<void> {
    if (this.currentPlatform) {
      await this.currentPlatform.shutdown();
      this.currentPlatform = null;
    }
  }

  /**
   * Clear all registered platforms (for testing)
   */
  public clear(): void {
    this.platforms.clear();
    this.currentPlatform = null;
  }
}

/**
 * Convenience function to get the current platform
 */
export function getPlatform(): IPlatform {
  return PlatformRegistry.getInstance().getCurrentPlatform();
}

/**
 * Convenience function to register a platform
 */
export function registerPlatform(
  type: PlatformType,
  platform: IPlatform
): void {
  PlatformRegistry.getInstance().registerPlatform(type, platform);
}
