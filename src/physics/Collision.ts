import { TileType, type Rect } from '../types.js';
import type { Player } from '../Player.js';
import type { World } from '../world/types.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true when two AABBs intersect. */
function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Returns true when the tile type represents a solid surface. */
function isSolid(tile: TileType): boolean {
  return tile === TileType.Grass || tile === TileType.Dirt || tile === TileType.Stone;
}

/**
 * Returns the tile-space coordinates of the centre of a player's AABB.
 *
 * @param player   - The player whose bounds are used.
 * @param tileSize - Pixel size of one tile.
 */
function centerTile(player: Player, tileSize: number): { cx: number; cy: number } {
  const bounds = player.getBounds();
  return {
    cx: Math.floor((bounds.x + bounds.width * 0.5) / tileSize),
    cy: Math.floor((bounds.y + bounds.height * 0.5) / tileSize),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves AABB collisions between a player and the tile grid in two separate
 * passes — one per axis — to prevent tunnelling and enable smooth wall sliding.
 *
 * **Axis order:**
 * 1. Move player along X by `vx * dt`, then resolve all X-axis tile overlaps.
 * 2. Move player along Y by `vy * dt`, then resolve all Y-axis tile overlaps.
 *
 * **Grounded detection:**
 * `player.isGrounded` is reset to `false` at the start of every call and is
 * set back to `true` only when a downward Y collision is resolved (i.e. the
 * player is standing on a solid tile).
 *
 * **Broad-phase:**
 * Only the 3×3 grid of tiles centred on the player's midpoint is tested,
 * which is sufficient because the player dimensions are smaller than three
 * tiles in every direction.
 *
 * @param player   - The player to move and correct.
 * @param world    - The world whose tile grid is tested.
 * @param tileSize - Rendered pixel size of a single tile.
 * @param dt       - Elapsed time since last frame in seconds.
 */
export function resolveCollisions(
  player: Player,
  world: World,
  tileSize: number,
  dt: number,
): void {
  // ── X axis ──────────────────────────────────────────────────────────────────
  player.x += player.vx * dt;

  {
    const { cx, cy } = centerTile(player, tileSize);

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const tx = cx + dx;
        const ty = cy + dy;

        if (!isSolid(world.getTile(tx, ty))) continue;

        const tileBounds: Rect = {
          x: tx * tileSize,
          y: ty * tileSize,
          width: tileSize,
          height: tileSize,
        };

        const current = player.getBounds();
        if (!overlaps(current, tileBounds)) continue;

        // Penetration depths from each horizontal side.
        const overlapRight = current.x + current.width - tileBounds.x;
        const overlapLeft = tileBounds.x + tileBounds.width - current.x;

        // Resolve in the direction of motion; fall back to minimum overlap.
        if (player.vx > 0 || (player.vx === 0 && overlapRight < overlapLeft)) {
          player.x -= overlapRight;
        } else {
          player.x += overlapLeft;
        }
        player.vx = 0;
      }
    }
  }

  // ── Y axis ──────────────────────────────────────────────────────────────────
  player.isGrounded = false;
  player.y += player.vy * dt;

  {
    const { cx, cy } = centerTile(player, tileSize);

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const tx = cx + dx;
        const ty = cy + dy;

        if (!isSolid(world.getTile(tx, ty))) continue;

        const tileBounds: Rect = {
          x: tx * tileSize,
          y: ty * tileSize,
          width: tileSize,
          height: tileSize,
        };

        const current = player.getBounds();
        if (!overlaps(current, tileBounds)) continue;

        // Penetration depths from each vertical side.
        const overlapDown = current.y + current.height - tileBounds.y;
        const overlapUp = tileBounds.y + tileBounds.height - current.y;

        if (player.vy > 0 || (player.vy === 0 && overlapDown < overlapUp)) {
          // Landing on top of a tile.
          player.y -= overlapDown;
          player.vy = 0;
          player.isGrounded = true;
        } else {
          // Hitting the underside of a tile (ceiling).
          player.y += overlapUp;
          player.vy = 0;
        }
      }
    }
  }
}
