import { TileType, type WorldConfig } from '../types.js';
import { Chunk } from './Chunk.js';
import { SimplexNoise } from './noise.js';
import {
  DEFAULT_CHUNK_SIZE,
  type Chunk as ChunkContract,
  type WorldGenerator as WorldGeneratorContract,
} from './types.js';

const DEFAULT_SURFACE_WAVELENGTH = 40;
const DEFAULT_SURFACE_AMPLITUDE = 6;
const DEFAULT_DIRT_DEPTH = 5;
const DEFAULT_SURFACE_LEVEL = 0.35;
const DEFAULT_CAVE_SCALE = 0.08;
const DEFAULT_CAVE_THRESHOLD = 0.4;
const DEFAULT_OCTAVES = 4;
const DEFAULT_PERSISTENCE = 0.5;
const DEFAULT_LACUNARITY = 2;
const SURFACE_NOISE_OFFSET = 101.137;
const CAVE_NOISE_OFFSET_X = 397.271;
const CAVE_NOISE_OFFSET_Y = 613.911;

/**
 * Procedural terrain generator backed by seeded 2D simplex noise.
 */
export class WorldGenerator implements WorldGeneratorContract {
  readonly config: Required<WorldConfig>;

  private readonly _noise: SimplexNoise;

  /**
   * @param config - World-generation settings.
   */
  constructor(config: WorldConfig) {
    this.config = {
      chunkSize: DEFAULT_CHUNK_SIZE,
      surfaceWavelength: DEFAULT_SURFACE_WAVELENGTH,
      surfaceAmplitude: DEFAULT_SURFACE_AMPLITUDE,
      dirtDepth: DEFAULT_DIRT_DEPTH,
      surfaceLevel: DEFAULT_SURFACE_LEVEL,
      caveScale: DEFAULT_CAVE_SCALE,
      caveThreshold: DEFAULT_CAVE_THRESHOLD,
      octaves: DEFAULT_OCTAVES,
      persistence: DEFAULT_PERSISTENCE,
      lacunarity: DEFAULT_LACUNARITY,
      ...config,
    };
    this._noise = new SimplexNoise(this.config.seed);
  }

  private _sampleFractalNoise(x: number, y: number): number {
    let amplitude = 1;
    let frequency = 1;
    let total = 0;
    let amplitudeSum = 0;

    for (let octave = 0; octave < this.config.octaves; octave += 1) {
      total += this._noise.noise2D(x * frequency, y * frequency) * amplitude;
      amplitudeSum += amplitude;
      amplitude *= this.config.persistence;
      frequency *= this.config.lacunarity;
    }

    if (amplitudeSum === 0) {
      return 0;
    }

    return total / amplitudeSum;
  }

  private _normalizeNoise(value: number): number {
    return (value + 1) * 0.5;
  }

  private _getSurfaceHeight(worldX: number): number {
    const normalizedSurfaceNoise = this._normalizeNoise(
      this._sampleFractalNoise(
        (worldX / this.config.surfaceWavelength) + SURFACE_NOISE_OFFSET,
        SURFACE_NOISE_OFFSET,
      ),
    );
    const baseSurfaceHeight = Math.floor(this.config.height * this.config.surfaceLevel);
    const surfaceOffset = Math.round((normalizedSurfaceNoise - 0.5) * 2 * this.config.surfaceAmplitude);

    return clamp(baseSurfaceHeight + surfaceOffset, 0, this.config.height - 1);
  }

  private _getTileAt(worldX: number, worldY: number): TileType {
    if (
      worldX < 0 ||
      worldY < 0 ||
      worldX >= this.config.width ||
      worldY >= this.config.height
    ) {
      return TileType.Air;
    }

    const surfaceHeight = this._getSurfaceHeight(worldX);
    if (worldY < surfaceHeight) {
      return TileType.Air;
    }

    if (worldY === surfaceHeight) {
      return TileType.Grass;
    }

    const dirtDepthLimit = surfaceHeight + this.config.dirtDepth;
    if (worldY <= dirtDepthLimit) {
      return TileType.Dirt;
    }

    const caveNoise = this._normalizeNoise(
      this._sampleFractalNoise(
        (worldX * this.config.caveScale) + CAVE_NOISE_OFFSET_X,
        (worldY * this.config.caveScale) + CAVE_NOISE_OFFSET_Y,
      ),
    );

    if (caveNoise < this.config.caveThreshold) {
      return TileType.Air;
    }

    return TileType.Stone;
  }

  /**
   * Generates a chunk for the given chunk-space coordinates.
   *
   * @param chunkX - Chunk X coordinate.
   * @param chunkY - Chunk Y coordinate.
   */
  generateChunk(chunkX: number, chunkY: number): ChunkContract {
    const size = this.config.chunkSize;
    const tiles = new Uint8Array(size * size);
    const startX = chunkX * size;
    const startY = chunkY * size;

    for (let localY = 0; localY < size; localY += 1) {
      for (let localX = 0; localX < size; localX += 1) {
        const worldX = startX + localX;
        const worldY = startY + localY;
        tiles[(localY * size) + localX] = this._getTileAt(worldX, worldY);
      }
    }

    return new Chunk(chunkX, chunkY, tiles, size);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
