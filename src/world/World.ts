import { TileType, type WorldConfig } from '../types.js';
import { WorldGenerator } from './WorldGenerator.js';
import type {
  Chunk as ChunkContract,
  World as WorldContract,
  WorldGenerator as WorldGeneratorContract,
} from './types.js';

/**
 * Lazily generated chunked world with an in-memory chunk cache.
 */
export class World implements WorldContract {
  readonly width: number;
  readonly height: number;
  readonly chunkSize: number;
  readonly surfaceLevel: number;

  private readonly _generator: WorldGeneratorContract;
  private readonly _chunkCache = new Map<string, ChunkContract>();

  /**
   * @param config - World-generation settings.
   * @param generator - Optional custom world generator.
   */
  constructor(config: WorldConfig, generator?: WorldGeneratorContract) {
    this.width = config.width;
    this.height = config.height;
    this._generator = generator ?? new WorldGenerator(config);
    this.chunkSize = this._generator.config.chunkSize;
    this.surfaceLevel = this._generator.config.surfaceLevel;
  }

  private _chunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }

  /**
   * Returns a lazily generated chunk at the given chunk-space coordinates.
   *
   * @param chunkX - Chunk X coordinate.
   * @param chunkY - Chunk Y coordinate.
   */
  getChunk(chunkX: number, chunkY: number): ChunkContract {
    const key = this._chunkKey(chunkX, chunkY);
    const cachedChunk = this._chunkCache.get(key);
    if (cachedChunk) {
      return cachedChunk;
    }

    const generatedChunk = this._generator.generateChunk(chunkX, chunkY);
    this._chunkCache.set(key, generatedChunk);
    return generatedChunk;
  }

  /**
   * Returns a tile at world-space tile coordinates.
   *
   * @param worldX - Tile X coordinate in world space.
   * @param worldY - Tile Y coordinate in world space.
   */
  getTile(worldX: number, worldY: number): TileType {
    if (worldX < 0 || worldY < 0 || worldX >= this.width || worldY >= this.height) {
      return TileType.Air;
    }

    const tileX = Math.floor(worldX);
    const tileY = Math.floor(worldY);
    const chunkX = Math.floor(tileX / this.chunkSize);
    const chunkY = Math.floor(tileY / this.chunkSize);
    const localX = positiveModulo(tileX, this.chunkSize);
    const localY = positiveModulo(tileY, this.chunkSize);

    return this.getChunk(chunkX, chunkY).getTile(localX, localY);
  }
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
