import type { CanvasManager } from '../CanvasManager.js';
import type { TileType, Vector2, WorldConfig } from '../types.js';

/** Shared chunk size used by the world system. */
export const DEFAULT_CHUNK_SIZE = 16;

/** Width of a tile in screen pixels for the demo renderer. */
export const DEFAULT_TILE_SIZE = 32;

/** Camera state used to determine the visible viewport. */
export interface Camera {
  /** World-space camera position in pixels. */
  position: Vector2;
  /** Viewport width in pixels. */
  viewportWidth: number;
  /** Viewport height in pixels. */
  viewportHeight: number;
}

/** Inclusive chunk bounds visible within a viewport. */
export interface VisibleChunkRange {
  minChunkX: number;
  maxChunkX: number;
  minChunkY: number;
  maxChunkY: number;
}

/** Public chunk contract used by the world system. */
export interface Chunk {
  /** Chunk X coordinate in chunk-space. */
  readonly chunkX: number;
  /** Chunk Y coordinate in chunk-space. */
  readonly chunkY: number;
  /** Number of tiles along one edge of the chunk. */
  readonly size: number;
  /** Packed tile identifiers stored in row-major order. */
  readonly tiles: Uint8Array;
  /**
   * Returns a tile at chunk-local coordinates.
   *
   * @param localX - Tile X coordinate within the chunk.
   * @param localY - Tile Y coordinate within the chunk.
   */
  getTile(localX: number, localY: number): TileType;
}

/** Public terrain generator contract used by {@link World}. */
export interface WorldGenerator {
  /** Fully resolved world-generation configuration. */
  readonly config: Required<WorldConfig>;
  /**
   * Generates or derives a chunk for the given chunk-space coordinates.
   *
   * @param chunkX - Chunk X coordinate.
   * @param chunkY - Chunk Y coordinate.
   */
  generateChunk(chunkX: number, chunkY: number): Chunk;
}

/** Public world contract used by renderers and gameplay systems. */
export interface World {
  /** Total world width in tiles. */
  readonly width: number;
  /** Total world height in tiles. */
  readonly height: number;
  /** Chunk width and height in tiles. */
  readonly chunkSize: number;
  /**
   * Returns a lazily generated chunk at the given chunk-space coordinates.
   *
   * @param chunkX - Chunk X coordinate.
   * @param chunkY - Chunk Y coordinate.
   */
  getChunk(chunkX: number, chunkY: number): Chunk;
  /**
   * Returns a tile at world-space tile coordinates.
   *
   * @param worldX - Tile X coordinate in world space.
   * @param worldY - Tile Y coordinate in world space.
   */
  getTile(worldX: number, worldY: number): TileType;
}

/** Public renderer contract for chunk-based viewport rendering. */
export interface ChunkRenderer {
  /** Pixel size of a single rendered tile. */
  readonly tileSize: number;
  /** Canvas subsystem used for rendering. */
  readonly canvas: CanvasManager;
  /**
   * Calculates the visible chunk bounds for the current camera state.
   *
   * @param world - World being viewed.
   * @param camera - Current viewport camera.
   */
  getVisibleChunkRange(world: World, camera: Camera): VisibleChunkRange | null;
  /**
   * Renders only the visible chunks within the viewport.
   *
   * @param world - World to draw.
   * @param camera - Current viewport camera.
   */
  render(world: World, camera: Camera): void;
}
