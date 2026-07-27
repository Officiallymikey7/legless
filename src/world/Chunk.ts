import { TileType } from '../types.js';
import type { Chunk as ChunkContract } from './types.js';

/**
 * Fixed-size chunk of tile data stored in a compact typed array.
 */
export class Chunk implements ChunkContract {
  readonly chunkX: number;
  readonly chunkY: number;
  readonly size: number;
  readonly tiles: Uint8Array;

  /**
   * @param chunkX - Chunk X coordinate in chunk-space.
   * @param chunkY - Chunk Y coordinate in chunk-space.
   * @param tiles - Packed tile identifiers in row-major order.
   * @param size - Chunk edge length in tiles.
   */
  constructor(chunkX: number, chunkY: number, tiles: Uint8Array, size: number) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;
    this.size = size;
    this.tiles = tiles;
  }

  /**
   * Returns a tile at chunk-local coordinates.
   *
   * @param localX - Tile X coordinate within the chunk.
   * @param localY - Tile Y coordinate within the chunk.
   */
  getTile(localX: number, localY: number): TileType {
    if (localX < 0 || localY < 0 || localX >= this.size || localY >= this.size) {
      return TileType.Air;
    }

    return this.tiles[(localY * this.size) + localX] as TileType;
  }
}
