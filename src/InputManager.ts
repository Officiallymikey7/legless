import type { InputSnapshot, KeyboardState, MouseState, Vector2 } from './types.js';

/**
 * Manages all keyboard and mouse input for the game.
 *
 * Attach it to the window once and query its state each frame via
 * {@link InputManager.getSnapshot}.
 *
 * @example
 * ```ts
 * const input = new InputManager(canvas);
 * // inside game loop:
 * const { keyboard, mouse } = input.getSnapshot();
 * if (keyboard.left) player.moveLeft();
 * ```
 */
export class InputManager {
  private readonly _canvas: HTMLCanvasElement;

  private _keyboard: KeyboardState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  private _mouse: MouseState = {
    position: { x: 0, y: 0 },
    leftButton: false,
    rightButton: false,
  };

  // Bound listener references kept so we can remove them in destroy().
  private readonly _onKeyDown: (e: KeyboardEvent) => void;
  private readonly _onKeyUp: (e: KeyboardEvent) => void;
  private readonly _onMouseMove: (e: MouseEvent) => void;
  private readonly _onMouseDown: (e: MouseEvent) => void;
  private readonly _onMouseUp: (e: MouseEvent) => void;
  private readonly _onContextMenu: (e: MouseEvent) => void;

  /**
   * @param canvas - The canvas element used to calculate relative mouse coordinates.
   */
  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;

    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this._canvas.addEventListener('mousemove', this._onMouseMove);
    this._canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    this._canvas.addEventListener('contextmenu', this._onContextMenu);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /** Maps a KeyboardEvent key value to the corresponding movement flag. */
  private _resolveMovementKey(key: string): keyof KeyboardState | null {
    switch (key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        return 'up';
      case 's':
      case 'S':
      case 'ArrowDown':
        return 'down';
      case 'a':
      case 'A':
      case 'ArrowLeft':
        return 'left';
      case 'd':
      case 'D':
      case 'ArrowRight':
        return 'right';
      default:
        return null;
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    const flag = this._resolveMovementKey(e.key);
    if (flag !== null) {
      this._keyboard[flag] = true;
    }
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    const flag = this._resolveMovementKey(e.key);
    if (flag !== null) {
      this._keyboard[flag] = false;
    }
  }

  /** Computes mouse position relative to the canvas top-left corner. */
  private _canvasPosition(e: MouseEvent): Vector2 {
    const rect = this._canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private _handleMouseMove(e: MouseEvent): void {
    this._mouse.position = this._canvasPosition(e);
  }

  private _handleMouseDown(e: MouseEvent): void {
    this._mouse.position = this._canvasPosition(e);
    if (e.button === 0) this._mouse.leftButton = true;
    if (e.button === 2) this._mouse.rightButton = true;
  }

  private _handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) this._mouse.leftButton = false;
    if (e.button === 2) this._mouse.rightButton = false;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Returns a snapshot of the current input state.
   *
   * The returned object is a shallow copy so callers cannot mutate internal
   * state.  Keyboard and mouse sub-objects are also copied.
   */
  getSnapshot(): InputSnapshot {
    return {
      keyboard: { ...this._keyboard },
      mouse: {
        position: { ...this._mouse.position },
        leftButton: this._mouse.leftButton,
        rightButton: this._mouse.rightButton,
      },
    };
  }

  /**
   * Removes all event listeners registered by this instance.
   * Call this when tearing down the game to avoid memory leaks.
   */
  destroy(): void {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this._canvas.removeEventListener('mousemove', this._onMouseMove);
    this._canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    this._canvas.removeEventListener('contextmenu', this._onContextMenu);
  }
}
