/**
 * Shared interfaces and type definitions for the Legless game engine.
 */

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
