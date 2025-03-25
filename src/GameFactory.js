import Game from './Game.js';
import ScalingConfig from './config/ScalingConfig.js';
import eventSystem from './utils/EventSystem.js';

/**
 * Factory for creating game instances with proper initialization
 */
class GameFactory {
  /**
   * Create a new game instance
   * @param {string} canvasId - ID of the canvas element
   * @returns {Game} New game instance
   */
  static createGame(canvasId = 'canvas') {
    // Get canvas element
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas element with ID '${canvasId}' not found`);
    }
    
    // Get rendering context
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas rendering context');
    }
    
    // Set canvas size
    GameFactory.resizeCanvas(canvas);
    
    // Create game instance
    const game = new Game(context, canvas);
    
    // Set up window resize handling
    window.addEventListener('resize', () => {
      GameFactory.resizeCanvas(canvas);
      // Game will handle its own resizing in its handleResize method
    });
    
    return game;
  }
  
  /**
   * Resize canvas to fit window
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {number} widthPercent - Percentage of window width (0-1)
   * @param {number} heightPercent - Percentage of window height (0-1)
   */
  static resizeCanvas(canvas, widthPercent = 0.9, heightPercent = 0.9) {
    if (!canvas) return;
    
    canvas.width = window.innerWidth * widthPercent;
    canvas.height = window.innerHeight * heightPercent;
  }
  
  /**
   * Create a simplified game for testing or specific use cases
   * @param {string} canvasId - ID of the canvas element
   * @param {Object} options - Configuration options
   * @returns {Game} New game instance
   */
  static createTestGame(canvasId = 'canvas', options = {}) {
    const game = GameFactory.createGame(canvasId);
    
    // Apply test options
    if (options.noButtons) {
      // Remove button system if not needed
      if (game.buttonSystem) {
        game.buttonSystem.destroy();
        game.buttonSystem = null;
      }
    }
    
    // Set up custom events if specified
    if (options.customEvents) {
      Object.entries(options.customEvents).forEach(([eventName, handler]) => {
        eventSystem.subscribe(eventName, handler);
      });
    }
    
    return game;
  }
  
  /**
   * Clean up game resources
   * @param {Game} game - Game instance to clean up
   */
  static destroyGame(game) {
    if (!game) return;
    
    // Call game's destroy method
    if (typeof game.destroy === 'function') {
      game.destroy();
    }
    
    // Remove global reference if it exists
    if (window.game === game) {
      delete window.game;
    }
  }
}

export default GameFactory;