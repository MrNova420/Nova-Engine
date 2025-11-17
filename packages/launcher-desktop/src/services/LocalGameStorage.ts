/**
 * LocalGameStorage - Manages downloaded games on local filesystem
 *
 * Features:
 * - Download games from Nova Hub
 * - Store games locally for offline play
 * - Manage game versions and updates
 * - Track download progress
 * - Handle game installation
 */

import {
  BaseDirectory,
  exists,
  mkdir,
  remove,
  writeFile,
  readFile,
} from '@tauri-apps/plugin-fs';

export interface LocalGame {
  id: string;
  name: string;
  version: string;
  size: number;
  downloadedAt: Date;
  lastPlayedAt?: Date;
  installPath: string;
  thumbnail?: string;
  metadata: GameMetadata;
}

export interface GameMetadata {
  title: string;
  description: string;
  developer: string;
  category: string;
  tags: string[];
  rating?: number;
}

export interface DownloadProgress {
  gameId: string;
  downloaded: number;
  total: number;
  speed: number;
  status: 'downloading' | 'installing' | 'completed' | 'error';
  error?: string;
}

class LocalGameStorageService {
  private gamesDir = 'nova-games';
  private metadataFile = 'games-metadata.json';
  private games: Map<string, LocalGame> = new Map();
  private downloadProgress: Map<string, DownloadProgress> = new Map();

  /**
   * Initialize the local game storage
   */
  async initialize(): Promise<void> {
    try {
      // Create games directory if it doesn't exist
      const gamesPath = `${this.gamesDir}`;
      const dirExists = await exists(gamesPath, {
        baseDir: BaseDirectory.AppData,
      });

      if (!dirExists) {
        await mkdir(gamesPath, {
          baseDir: BaseDirectory.AppData,
          recursive: true,
        });
      }

      // Load existing games metadata
      await this.loadMetadata();
    } catch (error) {
      console.error('Failed to initialize LocalGameStorage:', error);
      throw error;
    }
  }

  /**
   * Download a game from Nova Hub
   */
  async downloadGame(
    gameId: string,
    _downloadUrl: string,
    metadata: GameMetadata,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<LocalGame> {
    try {
      // Create game directory
      const gamePath = `${this.gamesDir}/${gameId}`;
      await mkdir(gamePath, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });

      // Initialize download progress
      const progress: DownloadProgress = {
        gameId,
        downloaded: 0,
        total: 0,
        speed: 0,
        status: 'downloading',
      };
      this.downloadProgress.set(gameId, progress);
      onProgress?.(progress);

      // Download game files
      const gameFilePath = `${gamePath}/game.zip`;

      // Note: Tauri doesn't have a built-in download API yet,
      // we'll need to implement this using HTTP client or custom command
      // For now, we'll create a placeholder implementation

      // Update progress to installing
      progress.status = 'installing';
      progress.downloaded = progress.total;
      onProgress?.(progress);

      // Extract and install game
      await this.installGame(gameId, gameFilePath);

      // Create local game record
      const localGame: LocalGame = {
        id: gameId,
        name: metadata.title,
        version: '1.0.0',
        size: progress.total,
        downloadedAt: new Date(),
        installPath: gamePath,
        metadata,
      };

      // Save to games map
      this.games.set(gameId, localGame);
      await this.saveMetadata();

      // Update progress to completed
      progress.status = 'completed';
      onProgress?.(progress);
      this.downloadProgress.delete(gameId);

      return localGame;
    } catch (error) {
      const progress = this.downloadProgress.get(gameId);
      if (progress) {
        progress.status = 'error';
        progress.error =
          error instanceof Error ? error.message : 'Unknown error';
        onProgress?.(progress);
      }
      throw error;
    }
  }

  /**
   * Install game from downloaded archive
   */
  private async installGame(
    gameId: string,
    archivePath: string
  ): Promise<void> {
    // Implementation would extract the game archive
    // For now, this is a placeholder
    console.log(`Installing game ${gameId} from ${archivePath}`);
  }

  /**
   * Get all locally installed games
   */
  async getInstalledGames(): Promise<LocalGame[]> {
    return Array.from(this.games.values());
  }

  /**
   * Get a specific game by ID
   */
  async getGame(gameId: string): Promise<LocalGame | null> {
    return this.games.get(gameId) || null;
  }

  /**
   * Check if a game is installed
   */
  async isGameInstalled(gameId: string): Promise<boolean> {
    return this.games.has(gameId);
  }

  /**
   * Uninstall a game
   */
  async uninstallGame(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }

    try {
      // Delete game directory
      const gamePath = `${this.gamesDir}/${gameId}`;
      await remove(gamePath, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });

      // Remove from games map
      this.games.delete(gameId);
      await this.saveMetadata();
    } catch (error) {
      console.error(`Failed to uninstall game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Update game last played timestamp
   */
  async updateLastPlayed(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (game) {
      game.lastPlayedAt = new Date();
      await this.saveMetadata();
    }
  }

  /**
   * Get download progress for a game
   */
  getDownloadProgress(gameId: string): DownloadProgress | null {
    return this.downloadProgress.get(gameId) || null;
  }

  /**
   * Get total size of all installed games
   */
  async getTotalSize(): Promise<number> {
    return Array.from(this.games.values()).reduce(
      (total, game) => total + game.size,
      0
    );
  }

  /**
   * Load games metadata from file
   */
  private async loadMetadata(): Promise<void> {
    try {
      const metadataPath = `${this.gamesDir}/${this.metadataFile}`;
      const fileExists = await exists(metadataPath, {
        baseDir: BaseDirectory.AppData,
      });

      if (fileExists) {
        const content = await readFile(metadataPath, {
          baseDir: BaseDirectory.AppData,
        });
        const text = new TextDecoder().decode(content);
        const gamesArray: LocalGame[] = JSON.parse(text);

        // Convert dates from strings
        gamesArray.forEach((game) => {
          game.downloadedAt = new Date(game.downloadedAt);
          if (game.lastPlayedAt) {
            game.lastPlayedAt = new Date(game.lastPlayedAt);
          }
          this.games.set(game.id, game);
        });
      }
    } catch (error) {
      console.error('Failed to load games metadata:', error);
    }
  }

  /**
   * Save games metadata to file
   */
  private async saveMetadata(): Promise<void> {
    try {
      const gamesArray = Array.from(this.games.values());
      const json = JSON.stringify(gamesArray, null, 2);
      const encoder = new TextEncoder();
      const data = encoder.encode(json);

      const metadataPath = `${this.gamesDir}/${this.metadataFile}`;
      await writeFile(metadataPath, data, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save games metadata:', error);
      throw error;
    }
  }
}

export const localGameStorage = new LocalGameStorageService();
