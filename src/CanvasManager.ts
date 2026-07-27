import type { Rect, Vector2 } from './types.js';

/**
 * Manages the HTML5 Canvas element and its 2D rendering context.
 *
 * Responsibilities:
 * - Auto-resizes the canvas to fill the browser window.
 * - Applies device-pixel-ratio scaling for crisp rendering on high-DPI screens.
 * - Exposes the 2D context and utility drawing helpers.
 *
 * @example
 * ```ts
 * const canvasManager = new CanvasManager('game-canvas');
 * canvasManager.clear('#1a1a2e');
 * canvasManager.fillRect({ x: 10, y: 10, width: 32, height: 32 }, '#e94560');
 * ```
 */
export class CanvasManager {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;

  /** Logical width in CSS pixels (independent of device pixel ratio). */
  private _logicalWidth = 0;
  /** Logical height in CSS pixels (independent of device pixel ratio). */
  private _logicalHeight = 0;

  private readonly _onResize: () => void;

  /**
   * @param canvasId - The `id` attribute of the `<canvas>` element in the DOM.
   * @throws If the element is not found or is not a canvas, or if the 2D
   *   context cannot be obtained.
   */
  constructor(canvasId: string) {
    const el = document.getElementById(canvasId);
    if (el === null) {
      throw new Error(`CanvasManager: element #${canvasId} was not found in the DOM.`);
    }
    if (!(el instanceof HTMLCanvasElement)) {
      throw new Error(`CanvasManager: element #${canvasId} is not a <canvas>.`);
    }
    this._canvas = el;

    const ctx = this._canvas.getContext('2d');
    if (!ctx) {
      throw new Error('CanvasManager: failed to obtain 2D rendering context.');
    }
    this._ctx = ctx;

    this._onResize = this._resize.bind(this);
    window.addEventListener('resize', this._onResize);

    // Perform the initial resize synchronously so the canvas is sized before
    // the first frame is rendered.
    this._resize();
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Resizes the canvas backing buffer to match the current window dimensions,
   * taking the device pixel ratio into account for crisp rendering.
   */
  private _resize(): void {
    const dpr = window.devicePixelRatio ?? 1;
    this._logicalWidth = window.innerWidth;
    this._logicalHeight = window.innerHeight;

    // Set the physical pixel dimensions of the backing buffer.
    this._canvas.width = Math.round(this._logicalWidth * dpr);
    this._canvas.height = Math.round(this._logicalHeight * dpr);

    // Set the CSS display size to the logical dimensions.
    this._canvas.style.width = `${this._logicalWidth}px`;
    this._canvas.style.height = `${this._logicalHeight}px`;

    // Scale the context so that all drawing operations use CSS pixel units.
    this._ctx.scale(dpr, dpr);
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** The underlying `<canvas>` element. */
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  /** The 2D rendering context. */
  get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }

  /** Current logical canvas width in CSS pixels. */
  get width(): number {
    return this._logicalWidth;
  }

  /** Current logical canvas height in CSS pixels. */
  get height(): number {
    return this._logicalHeight;
  }

  /**
   * Clears the entire canvas with the given fill color.
   *
   * @param color - Any CSS color string (e.g. `'#000'`, `'black'`).
   *   Defaults to solid black.
   */
  clear(color = '#000000'): void {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._logicalWidth, this._logicalHeight);
  }

  /**
   * Draws a filled rectangle.
   *
   * @param rect  - Position and dimensions in logical pixels.
   * @param color - CSS fill color.
   */
  fillRect(rect: Rect, color: string): void {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  /**
   * Draws a stroked rectangle outline.
   *
   * @param rect        - Position and dimensions in logical pixels.
   * @param color       - CSS stroke color.
   * @param lineWidth   - Stroke width in logical pixels. Defaults to 1.
   */
  strokeRect(rect: Rect, color: string, lineWidth = 1): void {
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = lineWidth;
    this._ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  /**
   * Draws a line between two points.
   *
   * @param from      - Start point in logical pixels.
   * @param to        - End point in logical pixels.
   * @param color     - CSS stroke color.
   * @param lineWidth - Line width in logical pixels. Defaults to 1.
   */
  drawLine(from: Vector2, to: Vector2, color: string, lineWidth = 1): void {
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = lineWidth;
    this._ctx.beginPath();
    this._ctx.moveTo(from.x, from.y);
    this._ctx.lineTo(to.x, to.y);
    this._ctx.stroke();
  }

  /**
   * Draws a filled circle.
   *
   * @param center - Centre point in logical pixels.
   * @param radius - Circle radius in logical pixels.
   * @param color  - CSS fill color.
   */
  fillCircle(center: Vector2, radius: number, color: string): void {
    this._ctx.fillStyle = color;
    this._ctx.beginPath();
    this._ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this._ctx.fill();
  }

  /**
   * Renders a text string onto the canvas.
   *
   * @param text     - The string to draw.
   * @param position - Anchor point in logical pixels: `x` is the left edge of
   *   the text, `y` is the alphabetic baseline (not the top of the glyphs).
   * @param color    - CSS fill color. Defaults to white.
   * @param font     - CSS font string. Defaults to `'16px monospace'`.
   */
  drawText(
    text: string,
    position: Vector2,
    color = '#ffffff',
    font = '16px monospace',
  ): void {
    this._ctx.fillStyle = color;
    this._ctx.font = font;
    this._ctx.fillText(text, position.x, position.y);
  }

  /**
   * Removes the resize event listener.
   * Call this when tearing down the game to avoid memory leaks.
   */
  destroy(): void {
    window.removeEventListener('resize', this._onResize);
  }
}
