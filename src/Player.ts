import type { CanvasManager } from './CanvasManager.js';
import type { InputSnapshot, Rect } from './types.js';
import type { Camera } from './world/types.js';

// ─── Physics constants ────────────────────────────────────────────────────────

/** Player width in world-space pixels. */
export const PLAYER_WIDTH = 16;

/** Player height in world-space pixels. */
export const PLAYER_HEIGHT = 32;

/** Horizontal acceleration applied when a movement key is held (px/s²). */
const PLAYER_ACCELERATION = 900;

/** Horizontal deceleration applied when no movement key is held (px/s²). */
const PLAYER_DECELERATION = 1400;

/** Downward gravitational acceleration (px/s²). */
const PLAYER_GRAVITY = 1200;

/** Initial upward velocity applied on jump (px/s). */
const PLAYER_JUMP_FORCE = 580;

/** Maximum horizontal speed (px/s). */
const PLAYER_MAX_SPEED = 220;

/** Terminal fall speed cap (px/s). */
const PLAYER_MAX_FALL_SPEED = 900;

/** Fill colour used to render the player rectangle. */
const PLAYER_COLOR = '#f97316';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * A physics-driven player entity with AABB bounds.
 *
 * Position (`x`, `y`) refers to the top-left corner of the player rectangle
 * in world-space pixels.  Call {@link Player.applyPhysics} once per frame to
 * integrate input and gravity into the velocity, then call the external
 * {@link resolveCollisions} function to step the position and resolve tile
 * collisions.
 *
 * @example
 * ```ts
 * const player = new Player(spawnX, spawnY);
 *
 * // inside game loop:
 * player.applyPhysics(dt, input);
 * resolveCollisions(player, world, tileSize, dt);
 * player.render(canvas, camera);
 * ```
 */
export class Player {
  /** World-space X coordinate of the player's left edge (px). */
  x: number;

  /** World-space Y coordinate of the player's top edge (px). */
  y: number;

  /** Horizontal velocity (px/s). Positive = rightward. */
  vx = 0;

  /** Vertical velocity (px/s). Positive = downward. */
  vy = 0;

  /**
   * True when the player's bottom edge is resting on a solid tile.
   * Managed by the collision resolution step.
   */
  isGrounded = false;

  /**
   * @param x - Initial world-space X position (left edge, px).
   * @param y - Initial world-space Y position (top edge, px).
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // ─── Physics constants (read-only access for external systems) ─────────────

  /** Player width in pixels. */
  static readonly WIDTH = PLAYER_WIDTH;

  /** Player height in pixels. */
  static readonly HEIGHT = PLAYER_HEIGHT;

  /** Horizontal acceleration constant (px/s²). */
  static readonly ACCELERATION = PLAYER_ACCELERATION;

  /** Horizontal deceleration constant (px/s²). */
  static readonly DECELERATION = PLAYER_DECELERATION;

  /** Gravity constant (px/s²). */
  static readonly GRAVITY = PLAYER_GRAVITY;

  /** Jump force constant (px/s). */
  static readonly JUMP_FORCE = PLAYER_JUMP_FORCE;

  /** Maximum horizontal speed (px/s). */
  static readonly MAX_SPEED = PLAYER_MAX_SPEED;

  /** Terminal fall speed (px/s). */
  static readonly MAX_FALL_SPEED = PLAYER_MAX_FALL_SPEED;

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Returns the player's world-space AABB as a {@link Rect}.
   *
   * The returned rectangle reflects the current `x`/`y` position and the
   * fixed player dimensions; it is recalculated on every call.
   */
  getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
  }

  /**
   * Applies input and gravity to the player's velocity for the current frame.
   *
   * This must be called **before** {@link resolveCollisions} so that velocity
   * is up-to-date when positions are stepped.
   *
   * @param dt    - Elapsed time since last frame in seconds.
   * @param input - Snapshot of all input states for this frame.
   */
  applyPhysics(dt: number, input: InputSnapshot): void {
    const { keyboard } = input;

    // ── Horizontal movement ──────────────────────────────────────────────────
    if (keyboard.left) {
      this.vx -= PLAYER_ACCELERATION * dt;
    } else if (keyboard.right) {
      this.vx += PLAYER_ACCELERATION * dt;
    } else {
      // Friction / deceleration toward zero.
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - PLAYER_DECELERATION * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + PLAYER_DECELERATION * dt);
      }
    }

    // Clamp horizontal speed.
    if (this.vx > PLAYER_MAX_SPEED) this.vx = PLAYER_MAX_SPEED;
    if (this.vx < -PLAYER_MAX_SPEED) this.vx = -PLAYER_MAX_SPEED;

    // ── Jump ─────────────────────────────────────────────────────────────────
    if ((keyboard.jump || keyboard.up) && this.isGrounded) {
      this.vy = -PLAYER_JUMP_FORCE;
    }

    // ── Gravity ──────────────────────────────────────────────────────────────
    this.vy += PLAYER_GRAVITY * dt;

    // Clamp fall speed to terminal velocity.
    if (this.vy > PLAYER_MAX_FALL_SPEED) this.vy = PLAYER_MAX_FALL_SPEED;
  }

  /**
   * Draws the player as a filled rectangle in screen space.
   *
   * The world-to-screen transform uses the same convention as
   * {@link ChunkRenderer}: `camera.position` is the **centre** of the
   * viewport in world-space pixels.
   *
   * @param canvas - Canvas subsystem used for drawing.
   * @param camera - Current viewport camera.
   */
  render(canvas: CanvasManager, camera: Camera): void {
    const viewportLeft = camera.position.x - camera.viewportWidth * 0.5;
    const viewportTop = camera.position.y - camera.viewportHeight * 0.5;

    canvas.fillRect(
      {
        x: this.x - viewportLeft,
        y: this.y - viewportTop,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
      },
      PLAYER_COLOR,
    );
  }
}
