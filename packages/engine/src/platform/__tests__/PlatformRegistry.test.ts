/**
 * Copyright (c) 2025 Kayden Shawn Massengill (WeNova Interactive)
 * Licensed under the Nova Engine License - see LICENSE file
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  PlatformRegistry,
  getPlatform,
  registerPlatform,
} from '../PlatformRegistry';
import { IPlatform, PlatformType, OSType } from '../IPlatform';

// Mock platform implementation
class MockPlatform implements IPlatform {
  private initialized = false;

  getType(): PlatformType {
    return PlatformType.WEB;
  }

  getOS(): OSType {
    return OSType.WEB_BROWSER;
  }

  getVersion(): string {
    return 'Mock/1.0';
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
  }

  get fileSystem(): any {
    return {};
  }

  get threading(): any {
    return {};
  }

  get network(): any {
    return {};
  }

  get window(): any {
    return {};
  }

  get timing(): any {
    return {};
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

describe('PlatformRegistry', () => {
  let registry: PlatformRegistry;

  beforeEach(() => {
    registry = PlatformRegistry.getInstance();
    registry.clear(); // Clear before each test
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PlatformRegistry.getInstance();
      const instance2 = PlatformRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Platform Registration', () => {
    it('should register a platform', () => {
      const platform = new MockPlatform();
      registry.registerPlatform(PlatformType.WEB, platform);
      expect(registry.hasPlatform(PlatformType.WEB)).toBe(true);
    });

    it('should detect unregistered platforms', () => {
      expect(registry.hasPlatform(PlatformType.DESKTOP)).toBe(false);
    });

    it('should allow multiple platform registrations', () => {
      const webPlatform = new MockPlatform();
      const desktopPlatform = new MockPlatform();

      registry.registerPlatform(PlatformType.WEB, webPlatform);
      registry.registerPlatform(PlatformType.DESKTOP, desktopPlatform);

      expect(registry.hasPlatform(PlatformType.WEB)).toBe(true);
      expect(registry.hasPlatform(PlatformType.DESKTOP)).toBe(true);
    });
  });

  describe('Current Platform Management', () => {
    it('should set and get current platform', async () => {
      const platform = new MockPlatform();
      registry.registerPlatform(PlatformType.WEB, platform);
      await registry.setCurrentPlatform(PlatformType.WEB);

      const current = registry.getCurrentPlatform();
      expect(current).toBe(platform);
      expect((platform as any).isInitialized()).toBe(true);
    });

    it('should throw error when getting platform without setting', () => {
      expect(() => registry.getCurrentPlatform()).toThrow(
        'No platform is currently set'
      );
    });

    it('should throw error when setting unregistered platform', async () => {
      await expect(
        registry.setCurrentPlatform(PlatformType.DESKTOP)
      ).rejects.toThrow('Platform desktop is not registered');
    });

    it('should shutdown previous platform when switching', async () => {
      const platform1 = new MockPlatform();
      const platform2 = new MockPlatform();

      registry.registerPlatform(PlatformType.WEB, platform1);
      registry.registerPlatform(PlatformType.DESKTOP, platform2);

      await registry.setCurrentPlatform(PlatformType.WEB);
      expect((platform1 as any).isInitialized()).toBe(true);

      await registry.setCurrentPlatform(PlatformType.DESKTOP);
      expect((platform1 as any).isInitialized()).toBe(false);
      expect((platform2 as any).isInitialized()).toBe(true);
    });
  });

  describe('Shutdown', () => {
    it('should shutdown current platform', async () => {
      const platform = new MockPlatform();
      registry.registerPlatform(PlatformType.WEB, platform);
      await registry.setCurrentPlatform(PlatformType.WEB);

      expect((platform as any).isInitialized()).toBe(true);

      await registry.shutdown();
      expect((platform as any).isInitialized()).toBe(false);
    });

    it('should handle shutdown with no current platform', async () => {
      await expect(registry.shutdown()).resolves.not.toThrow();
    });
  });

  describe('Convenience Functions', () => {
    it('should register platform via convenience function', () => {
      const platform = new MockPlatform();
      registerPlatform(PlatformType.WEB, platform);
      expect(registry.hasPlatform(PlatformType.WEB)).toBe(true);
    });

    it('should get platform via convenience function', async () => {
      const platform = new MockPlatform();
      registerPlatform(PlatformType.WEB, platform);
      await registry.setCurrentPlatform(PlatformType.WEB);

      const current = getPlatform();
      expect(current).toBe(platform);
    });
  });

  describe('Clear', () => {
    it('should clear all platforms', () => {
      const platform = new MockPlatform();
      registry.registerPlatform(PlatformType.WEB, platform);
      expect(registry.hasPlatform(PlatformType.WEB)).toBe(true);

      registry.clear();
      expect(registry.hasPlatform(PlatformType.WEB)).toBe(false);
    });
  });
});
