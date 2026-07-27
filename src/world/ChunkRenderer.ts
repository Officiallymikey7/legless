import { CanvasManager } from '../CanvasManager.js';
import { TileType } from '../types.js';
import { DEFAULT_TILE_SIZE, type Camera, type ChunkRenderer as ChunkRendererContract, type VisibleChunkRange, type World } from './types.js';

const TILE_COLORS: Record<TileType, string> = {
  [TileType.Air]: 'transparent',
  [TileType.Grass]: '#4caf50',
  [TileType.Dirt]: '#8b5a2b',
  [TileType.Stone]: '#6b7280',
};

/**
 * Draws only the chunks currently visible within the camera viewport.
 */
export class ChunkRenderer implements ChunkRendererContract {
  readonly canvas: CanvasManager;
  readonly tileSize: number;

  /**
   * @param canvas - Canvas subsystem used for drawing.
   * @param tileSize - Render size of a single tile in pixels.
   */
  constructor(canvas: CanvasManager, tileSize = DEFAULT_TILE_SIZE) {
    this.canvas = canvas;
    this.tileSize = tileSize;
  }

  /**
   * Calculates the visible chunk bounds for the current camera state.
   *
   * @param world - World being viewed.
   * @param camera - Current viewport camera.
   */
  getVisibleChunkRange(world: World, camera: Camera): VisibleChunkRange | null {
    const viewportLeft = camera.position.x - (camera.viewportWidth * 0.5);
    const viewportTop = camera.position.y - (camera.viewportHeight * 0.5);
    const viewportRight = viewportLeft + camera.viewportWidth;
    const viewportBottom = viewportTop + camera.viewportHeight;

    const minTileX = Math.max(0, Math.floor(viewportLeft / this.tileSize));
    const minTileY = Math.max(0, Math.floor(viewportTop / this.tileSize));
    const maxTileX = Math.min(world.width - 1, Math.floor((viewportRight - 1) / this.tileSize));
    const maxTileY = Math.min(world.height - 1, Math.floor((viewportBottom - 1) / this.tileSize));

    if (minTileX > maxTileX || minTileY > maxTileY) {
      return null;
    }

    return {
      minChunkX: Math.floor(minTileX / world.chunkSize),
      maxChunkX: Math.floor(maxTileX / world.chunkSize),
      minChunkY: Math.floor(minTileY / world.chunkSize),
      maxChunkY: Math.floor(maxTileY / world.chunkSize),
    };
  }

  /**
   * Renders only the visible chunks within the viewport.
   *
   * @param world - World to draw.
   * @param camera - Current viewport camera.
   */
  render(world: World, camera: Camera): void {
    const visibleRange = this.getVisibleChunkRange(world, camera);
    if (!visibleRange) {
      return;
    }

    const viewportLeft = camera.position.x - (camera.viewportWidth * 0.5);
    const viewportTop = camera.position.y - (camera.viewportHeight * 0.5);

    for (let chunkY = visibleRange.minChunkY; chunkY <= visibleRange.maxChunkY; chunkY += 1) {
      for (let chunkX = visibleRange.minChunkX; chunkX <= visibleRange.maxChunkX; chunkX += 1) {
        const chunk = world.getChunk(chunkX, chunkY);
        const chunkWorldTileX = chunk.chunkX * chunk.size;
        const chunkWorldTileY = chunk.chunkY * chunk.size;

        for (let localY = 0; localY < chunk.size; localY += 1) {
          for (let localX = 0; localX < chunk.size; localX += 1) {
            const tile = chunk.getTile(localX, localY);
            if (tile === TileType.Air) {
              continue;
            }

            const worldTileX = chunkWorldTileX + localX;
            const worldTileY = chunkWorldTileY + localY;
            if (worldTileX < 0 || worldTileY < 0 || worldTileX >= world.width || worldTileY >= world.height) {
              continue;
            }

            const screenX = (worldTileX * this.tileSize) - viewportLeft;
            const screenY = (worldTileY * this.tileSize) - viewportTop;
            this.canvas.fillRect(
              {
                x: screenX,
                y: screenY,
                width: this.tileSize,
                height: this.tileSize,
              },
              TILE_COLORS[tile],
            );
          }
        }
      }
    }
  }
}
