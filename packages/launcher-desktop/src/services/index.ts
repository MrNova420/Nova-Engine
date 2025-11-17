/**
 * Desktop Services - Export all desktop-specific services
 */

export * from './LocalGameStorage';
export * from './LocalSaveData';
export * from './OfflineSync';
export * from './UpdateManager';

// Initialize all services
import { localGameStorage } from './LocalGameStorage';
import { localSaveData } from './LocalSaveData';
import { offlineSync } from './OfflineSync';
import { updateManager } from './UpdateManager';

/**
 * Initialize all desktop services
 */
export async function initializeServices(): Promise<void> {
  console.log('Initializing Nova Launcher Desktop services...');

  try {
    // Initialize in order
    await localGameStorage.initialize();
    await localSaveData.initialize();
    await offlineSync.initialize();
    await updateManager.initialize();

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Cleanup all services
 */
export function cleanupServices(): void {
  offlineSync.stopBackgroundSync();
  updateManager.stopUpdateChecks();
  console.log('Services cleaned up');
}
