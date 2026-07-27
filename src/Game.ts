import { CanvasManager } from './CanvasManager.js';
import { InputManager } from './InputManager.js';
import type { GameConfig, InputSnapshot } from './types.js';

/** Possible lifecycle states for the game loop. */
type GameState = 'idle' | 'running' | 'stopped';

/**
 * Main game engine class.
 *
 * Orchestrates the 60 FPS `requestAnimationFrame` loop and delegates to the
 * {@link CanvasManager} and {@link InputManager} subsystems.  Subclass `Game`
 * and override {@link Game.update} and {@link Game.render} to implement your
 * own game logic.
 *
 * @example
 * ```ts
 * class MyGame extends Game {
 *   protected override update(dt: number, input: InputSnapshot): void {
 *     if (input.keyboard.right) this.playerX += 200 * dt;
 *   }
 *
 *   protected override render(): void {
 *     this.canvas.clear('#1a1a2e');
 *     this.canvas.fillRect({ x: this.playerX, y: 100, width: 32, height: 32 }, '#e94560');
 *   }
 * }
 *
 * const game = new MyGame({ canvasId: 'game-canvas' });
 * game.start();
 * ```
 */
export class Game {
  /** Canvas management subsystem. */
  protected readonly canvas: CanvasManager;
  /** Input tracking subsystem. */
  protected readonly input: InputManager;

  private _state: GameState = 'idle';
  private _rafHandle = 0;
  private _lastTimestamp = 0;

  /** Target frame duration in milliseconds derived from {@link GameConfig.targetFps}. */
  private readonly _targetFrameMs: number;

  /**
   * @param config - Optional configuration overrides.
   */
  constructor(config: GameConfig = {}) {
    const canvasId = config.canvasId ?? 'game-canvas';
    const targetFps = config.targetFps ?? 60;
    this._targetFrameMs = 1000 / targetFps;

    this.canvas = new CanvasManager(canvasId);
    this.input = new InputManager(this.canvas.canvas);
  }

  // ─── Private loop ─────────────────────────────────────────────────────────

  private _tick(timestamp: number): void {
    if (this._state !== 'running') return;

    // Cap delta time to avoid spiral-of-death after tab switches.
    const rawDt = timestamp - this._lastTimestamp;
    const dt = Math.min(rawDt, this._targetFrameMs * 5) / 1000; // seconds
    this._lastTimestamp = timestamp;

    const snapshot = this.input.getSnapshot();
    this.update(dt, snapshot);
    this.render();

    this._rafHandle = requestAnimationFrame(this._tick.bind(this));
  }

  // ─── Protected extension points ───────────────────────────────────────────

  /**
   * Called once per frame before rendering.  Override in a subclass to
   * implement game-logic updates.
   *
   * @param dt    - Elapsed time since last frame **in seconds**.
   * @param input - Snapshot of all input states for this frame.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected update(_dt: number, _input: InputSnapshot): void {
    // Default implementation is intentionally empty.
  }

  /**
   * Called once per frame after {@link Game.update}.  Override in a subclass
   * to draw the current game state.
   *
   * The canvas is **not** cleared automatically; call
   * {@link CanvasManager.clear} at the start of your render implementation.
   */
  protected render(): void {
    // Default implementation renders a placeholder splash screen.
    this.canvas.clear('#1a1a2e');

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.canvas.drawText(
      'Legless',
      { x: cx - 36, y: cy - 10 },
      '#e94560',
      'bold 32px monospace',
    );
    this.canvas.drawText(
      'Override Game.update() and Game.render() to get started.',
      { x: cx - 260, y: cy + 28 },
      '#aaaaaa',
      '14px monospace',
    );
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Starts the game loop.  Safe to call multiple times; subsequent calls while
   * already running are no-ops.
   */
  start(): void {
    if (this._state === 'running') return;
    this._state = 'running';
    this._rafHandle = requestAnimationFrame((ts) => {
      this._lastTimestamp = ts;
      this._tick(ts);
    });
  }

  /**
   * Pauses the game loop without releasing resources.
   * Call {@link Game.start} to resume.
   */
  pause(): void {
    if (this._state !== 'running') return;
    this._state = 'idle';
    cancelAnimationFrame(this._rafHandle);
  }

  /**
   * Permanently stops the game loop and releases all subsystem resources
   * (event listeners, etc.).  The instance cannot be restarted after this.
   */
  stop(): void {
    this._state = 'stopped';
    cancelAnimationFrame(this._rafHandle);
    this.canvas.destroy();
    this.input.destroy();
  }

  /** Current lifecycle state of the game. */
  get state(): GameState {
    return this._state;
  }
}
