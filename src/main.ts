import { Game } from './Game.js';
import type { InputSnapshot } from './types.js';
import { World } from './world/World.js';
import { ChunkRenderer } from './world/ChunkRenderer.js';
import { DEFAULT_TILE_SIZE, type Camera } from './world/types.js';

const WORLD_WIDTH_TILES = 256;
const WORLD_HEIGHT_TILES = 128;
const CAMERA_SPEED_PIXELS_PER_SECOND = 600;
const DEMO_SEED = 1337;
const OVERLAY_TEXT_COLOR = '#f8fafc';
const OVERLAY_SHADOW_COLOR = '#111827';
const SKY_COLOR = '#7dd3fc';

/**
 * Demo game that pans a procedurally generated chunked world with WASD.
 */
class WorldDemoGame extends Game {
  private readonly _world = new World({
    seed: DEMO_SEED,
    width: WORLD_WIDTH_TILES,
    height: WORLD_HEIGHT_TILES,
  });
  private readonly _renderer = new ChunkRenderer(this.canvas, DEFAULT_TILE_SIZE);
  private readonly _camera: Camera = {
    position: {
      x: (WORLD_WIDTH_TILES * DEFAULT_TILE_SIZE) * 0.5,
      y: (WORLD_HEIGHT_TILES * DEFAULT_TILE_SIZE) * 0.35,
    },
    viewportWidth: 0,
    viewportHeight: 0,
  };

  /**
   * Updates the camera position from keyboard input.
   *
   * @param dt - Elapsed frame time in seconds.
   * @param input - Snapshot of all input states for this frame.
   */
  protected override update(dt: number, input: InputSnapshot): void {
    let moveX = 0;
    let moveY = 0;

    if (input.keyboard.left) {
      moveX -= 1;
    }
    if (input.keyboard.right) {
      moveX += 1;
    }
    if (input.keyboard.up) {
      moveY -= 1;
    }
    if (input.keyboard.down) {
      moveY += 1;
    }

    this._camera.position.x += moveX * CAMERA_SPEED_PIXELS_PER_SECOND * dt;
    this._camera.position.y += moveY * CAMERA_SPEED_PIXELS_PER_SECOND * dt;

    const halfViewportWidth = this.canvas.width * 0.5;
    const halfViewportHeight = this.canvas.height * 0.5;
    const maxCameraX = WORLD_WIDTH_TILES * DEFAULT_TILE_SIZE;
    const maxCameraY = WORLD_HEIGHT_TILES * DEFAULT_TILE_SIZE;

    this._camera.position.x = clamp(this._camera.position.x, halfViewportWidth, maxCameraX - halfViewportWidth);
    this._camera.position.y = clamp(this._camera.position.y, halfViewportHeight, maxCameraY - halfViewportHeight);
  }

  /**
   * Renders the visible portion of the world and a small control hint overlay.
   */
  protected override render(): void {
    this._camera.viewportWidth = this.canvas.width;
    this._camera.viewportHeight = this.canvas.height;

    this.canvas.clear(SKY_COLOR);
    this._renderer.render(this._world, this._camera);
    this.canvas.drawText('WASD / Arrow Keys: Pan camera', { x: 17, y: 33 }, OVERLAY_SHADOW_COLOR, '16px monospace');
    this.canvas.drawText('WASD / Arrow Keys: Pan camera', { x: 16, y: 32 }, OVERLAY_TEXT_COLOR, '16px monospace');
  }
}

const game = new WorldDemoGame({ canvasId: 'game-canvas', targetFps: 60 });
game.start();

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
