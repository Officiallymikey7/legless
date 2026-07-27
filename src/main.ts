import { Game } from './Game.js';
import { Player } from './Player.js';
import { resolveCollisions } from './physics/Collision.js';
import type { InputSnapshot } from './types.js';
import { World } from './world/World.js';
import { ChunkRenderer } from './world/ChunkRenderer.js';
import { DEFAULT_TILE_SIZE, type Camera } from './world/types.js';

const WORLD_WIDTH_TILES = 256;
const WORLD_HEIGHT_TILES = 128;
const DEMO_SEED = 1337;
const OVERLAY_TEXT_COLOR = '#f8fafc';
const OVERLAY_SHADOW_COLOR = '#111827';
const SKY_COLOR = '#7dd3fc';

/** Approximate surface height as a fraction of world height (must match WorldGenerator default). */
const SURFACE_LEVEL_FRACTION = 0.35;

/** Vertical offset above the surface (in tiles) where the player spawns. */
const SPAWN_TILES_ABOVE_SURFACE = 5;

/**
 * Demo game that renders a procedurally generated world and a physics-driven
 * player.  The camera tracks the player; use A/D (or Arrow keys) to move and
 * Space/W to jump.
 */
class WorldDemoGame extends Game {
  private readonly _world = new World({
    seed: DEMO_SEED,
    width: WORLD_WIDTH_TILES,
    height: WORLD_HEIGHT_TILES,
  });
  private readonly _renderer = new ChunkRenderer(this.canvas, DEFAULT_TILE_SIZE);

  private readonly _player: Player;

  private readonly _camera: Camera = {
    position: { x: 0, y: 0 },
    viewportWidth: 0,
    viewportHeight: 0,
  };

  constructor() {
    super({ canvasId: 'game-canvas', targetFps: 60 });

    // Spawn the player above the approximate surface level at world centre.
    const spawnTileX = Math.floor(WORLD_WIDTH_TILES * 0.5);
    const spawnTileY =
      Math.floor(WORLD_HEIGHT_TILES * SURFACE_LEVEL_FRACTION) - SPAWN_TILES_ABOVE_SURFACE;
    this._player = new Player(
      spawnTileX * DEFAULT_TILE_SIZE,
      spawnTileY * DEFAULT_TILE_SIZE,
    );

    // Initialise the camera on the spawn position.
    this._camera.position.x = this._player.x + Player.WIDTH * 0.5;
    this._camera.position.y = this._player.y + Player.HEIGHT * 0.5;
  }

  /**
   * Steps player physics, resolves tile collisions, and updates the camera.
   *
   * @param dt    - Elapsed frame time in seconds.
   * @param input - Snapshot of all input states for this frame.
   */
  protected override update(dt: number, input: InputSnapshot): void {
    this._player.applyPhysics(dt, input);
    resolveCollisions(this._player, this._world, DEFAULT_TILE_SIZE, dt);
    this._updateCamera();
  }

  /**
   * Renders the visible world and the player rectangle.
   */
  protected override render(): void {
    this._camera.viewportWidth = this.canvas.width;
    this._camera.viewportHeight = this.canvas.height;

    this.canvas.clear(SKY_COLOR);
    this._renderer.render(this._world, this._camera);
    this._player.render(this.canvas, this._camera);

    this.canvas.drawText('A/D or \u2190\u2192: Move   Space/W: Jump', { x: 17, y: 33 }, OVERLAY_SHADOW_COLOR, '16px monospace');
    this.canvas.drawText('A/D or \u2190\u2192: Move   Space/W: Jump', { x: 16, y: 32 }, OVERLAY_TEXT_COLOR, '16px monospace');
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /** Centres the camera on the player and clamps it to world bounds. */
  private _updateCamera(): void {
    const worldWidthPixels = WORLD_WIDTH_TILES * DEFAULT_TILE_SIZE;
    const worldHeightPixels = WORLD_HEIGHT_TILES * DEFAULT_TILE_SIZE;

    this._camera.position.x = this._player.x + Player.WIDTH * 0.5;
    this._camera.position.y = this._player.y + Player.HEIGHT * 0.5;

    const [minCameraX, maxCameraX] = getCameraBounds(worldWidthPixels, this.canvas.width);
    const [minCameraY, maxCameraY] = getCameraBounds(worldHeightPixels, this.canvas.height);

    this._camera.position.x = clamp(this._camera.position.x, minCameraX, maxCameraX);
    this._camera.position.y = clamp(this._camera.position.y, minCameraY, maxCameraY);
  }
}

const game = new WorldDemoGame();
game.start();

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getCameraBounds(worldSize: number, viewportSize: number): [number, number] {
  if (viewportSize >= worldSize) {
    const center = worldSize * 0.5;
    return [center, center];
  }

  const halfViewport = viewportSize * 0.5;
  return [halfViewport, worldSize - halfViewport];
}

