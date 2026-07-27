import { Game } from './Game.js';

/**
 * Application entry point.
 *
 * Creates a {@link Game} instance and starts the render loop.
 * Replace or extend the `Game` class to add your own game logic.
 */
const game = new Game({ canvasId: 'game-canvas', targetFps: 60 });
game.start();
