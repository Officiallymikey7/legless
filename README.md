# Legless

A production-ready **2D tile-based browser sandbox game engine** inspired by Terraria, built with TypeScript and HTML5 Canvas API. Zero external game engine dependencies—pure ES modules with Vite tooling.

## Features

- 🎮 **60 FPS Game Loop** – requestAnimationFrame-based with delta-time capping
- ⌨️ **Input Management** – WASD + Arrow keys, mouse position tracking, left/right clicks
- 🎨 **Canvas Subsystem** – Auto-resizing, HiDPI scaling, rendering utilities
- 📦 **Type-Safe** – TypeScript strict mode with full type definitions
- ⚡ **Zero Dependencies** – No game engines, no frameworks—just raw Canvas API
- 🔨 **Modern Tooling** – Vite 6.4.3, TypeScript 5.5, npm scripts for dev/build

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens a local dev server (typically `http://localhost:5173`). Hot-reload enabled.

### Build

```bash
npm run build
```

Produces optimized output in `dist/`.

### Type Checking

```bash
npm run typecheck
```

Validates TypeScript without emitting output.

## Project Structure

```
legless/
├── src/
│   ├── main.ts              – Entry point; instantiates your game
│   ├── Game.ts              – Core game loop orchestrator
│   ├── CanvasManager.ts      – Canvas lifecycle & rendering utilities
│   ├── InputManager.ts       – Keyboard & mouse state tracking
│   └── types.ts             – Shared TypeScript interfaces
├── dist/                    – Built output (generated)
├── assets/                  – Game sprites, audio, fonts
├── index.html               – HTML entry point
├── tsconfig.json            – TypeScript configuration
├── vite.config.ts           – Vite build configuration
└── package.json             – Dependencies & scripts
```

## Architecture Overview

### Game Engine (`Game.ts`)

Main orchestrator managing the 60 FPS loop and lifecycle. Extend this class to implement your game:

```typescript
class MyGame extends Game {
  private playerX = 100;
  private playerY = 100;

  protected override update(dt: number, input: InputSnapshot): void {
    // dt is in seconds; input is this frame's keyboard/mouse state
    if (input.keyboard.right) this.playerX += 200 * dt;
    if (input.keyboard.left) this.playerX -= 200 * dt;
    if (input.mouse.leftClick) console.log('Clicked at', input.mouse.position);
  }

  protected override render(): void {
    // Draw your game state
    this.canvas.clear('#1a1a2e');
    this.canvas.fillRect(
      { x: this.playerX, y: this.playerY, width: 32, height: 32 },
      '#e94560'
    );
    this.canvas.drawText(
      `FPS: ${Math.round(1 / this.lastDt)}`,
      { x: 10, y: 20 },
      '#fff'
    );
  }
}

// Start the game
const game = new MyGame({ canvasId: 'game-canvas', targetFps: 60 });
game.start();
```

### Canvas Manager (`CanvasManager.ts`)

Handles canvas lifecycle, DPI scaling, and rendering utilities:

```typescript
// Clear canvas
this.canvas.clear('#1a1a2e');

// Draw shapes
this.canvas.fillRect({ x: 10, y: 20, width: 64, height: 64 }, '#ff0000');
this.canvas.strokeRect({ x: 100, y: 100, width: 50, height: 50 }, '#0000ff', 2);
this.canvas.fillCircle({ x: 200, y: 200 }, 25, '#00ff00');

// Draw text
this.canvas.drawText('Hello!', { x: 50, y: 50 }, '#fff', '16px sans-serif');

// Draw lines
this.canvas.drawLine({ x: 0, y: 0 }, { x: 100, y: 100 }, '#ffff00', 2);

// Access properties
const width = this.canvas.width;   // Current canvas width
const height = this.canvas.height; // Current canvas height
const ctx = this.canvas.context;   // Raw 2D rendering context (advanced)
```

### Input Manager (`InputManager.ts`)

Tracks keyboard and mouse state, returning a snapshot per frame:

```typescript
const snapshot = input.getSnapshot();

// Keyboard (WASD + Arrow keys)
if (snapshot.keyboard.up || snapshot.keyboard.w) { /* move up */ }
if (snapshot.keyboard.down || snapshot.keyboard.s) { /* move down */ }
if (snapshot.keyboard.left || snapshot.keyboard.a) { /* move left */ }
if (snapshot.keyboard.right || snapshot.keyboard.d) { /* move right */ }

// Mouse
console.log(snapshot.mouse.position); // { x, y } in canvas-relative coordinates
console.log(snapshot.mouse.leftClick); // true if left button pressed this frame
console.log(snapshot.mouse.rightClick); // true if right button pressed this frame
```

## Game Configuration

Pass a `GameConfig` object to the `Game` constructor:

```typescript
interface GameConfig {
  canvasId?: string;  // Default: 'game-canvas'
  targetFps?: number; // Default: 60
}
```

Example:

```typescript
const game = new MyGame({
  canvasId: 'my-canvas',
  targetFps: 120
});
game.start();
```

## Game Lifecycle

| Method | Purpose |
|--------|---------|
| `start()` | Begin the game loop (safe to call multiple times) |
| `pause()` | Pause without releasing resources; call `start()` to resume |
| `stop()` | Permanently stop and clean up event listeners |
| `state` | Get current state: `'idle'` \| `'running'` \| `'stopped'` |

## Performance Considerations

1. **Delta-Time Capping**: The engine caps delta-time to 5× the target frame duration to prevent spiral-of-death after tab switches or stalls.
2. **Canvas Resize**: Automatically scales on window resize and applies DPI scaling for HiDPI displays.
3. **Input Snapshots**: Each frame gets a defensive copy of input state; past frames don't interfere with new input.

## TypeScript Interfaces

### Vector2
```typescript
interface Vector2 {
  x: number;
  y: number;
}
```

### Rect
```typescript
interface Rect extends Vector2 {
  width: number;
  height: number;
}
```

### KeyboardState
```typescript
interface KeyboardState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}
```

### MouseState
```typescript
interface MouseState {
  position: Vector2;
  leftClick: boolean;
  rightClick: boolean;
}
```

### InputSnapshot
```typescript
interface InputSnapshot {
  keyboard: KeyboardState;
  mouse: MouseState;
}
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires support for:
- ES 2020 modules
- Canvas 2D API
- requestAnimationFrame
- ResizeObserver (for canvas auto-resize)

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- TypeScript strict mode compliance
- Clear JSDoc comments on public APIs
- No external game engine dependencies
- Modular, single-responsibility design
