/**
 * Shared interfaces and type definitions for the Legless game engine.
 */

/** Stable tile identifiers used throughout world generation and rendering. */
export enum TileType {
  Air = 0,
  Grass = 1,
  Dirt = 2,
  Stone = 3,
}

/** A 2D point in screen or world space. */
export interface Vector2 {
  x: number;
  y: number;
}

/** Axis-aligned bounding rectangle. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Current state of all tracked keyboard keys. */
export interface KeyboardState {
  /** True while the W key or ArrowUp key is held. */
  up: boolean;
  /** True while the S key or ArrowDown key is held. */
  down: boolean;
  /** True while the A key or ArrowLeft key is held. */
  left: boolean;
  /** True while the D key or ArrowRight key is held. */
  right: boolean;
}

/** Current state of the mouse. */
export interface MouseState {
  /** Mouse position relative to the canvas in CSS pixels. */
  position: Vector2;
  /** True while the left mouse button is held. */
  leftButton: boolean;
  /** True while the right mouse button is held. */
  rightButton: boolean;
}

/** Snapshot of all input states for a single frame. */
export interface InputSnapshot {
  keyboard: KeyboardState;
  mouse: MouseState;
}

/** Configuration options accepted by the Game constructor. */
export interface GameConfig {
  /** The id of the <canvas> element to render into. Defaults to "game-canvas". */
  canvasId?: string;
  /** Target frames per second. Defaults to 60. */
  targetFps?: number;
}

/** Configuration values used to generate a procedural world. */
export interface WorldConfig {
  /** Seed used to make terrain generation deterministic. */
  seed: number;
  /** Total world width in tiles. */
  width: number;
  /** Total world height in tiles. */
  height: number;
  /** Chunk width and height in tiles. Defaults to 16. */
  chunkSize?: number;
  /** Approximate surface wavelength in tiles. Defaults to 40. */
  surfaceWavelength?: number;
  /** Maximum surface displacement in tiles. Defaults to 6. */
  surfaceAmplitude?: number;
  /** Dirt depth below the grass surface in tiles. Defaults to 5. */
  dirtDepth?: number;
  /** Average surface height as a fraction of the world height. Defaults to 0.35. */
  surfaceLevel?: number;
  /** Scale used for 2D cave noise sampling. Defaults to 0.08. */
  caveScale?: number;
  /** Normalized cave threshold. Values below this become air. Defaults to 0.4. */
  caveThreshold?: number;
  /** Number of octaves to use for fractal noise. Defaults to 4. */
  octaves?: number;
  /** Fractal persistence applied between octaves. Defaults to 0.5. */
  persistence?: number;
  /** Fractal lacunarity applied between octaves. Defaults to 2. */
  lacunarity?: number;
}
