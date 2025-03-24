// ES6 version of main.js
import { canvas, context, sky, sun, clouds, ground, stickfigure } from './setup.js';
import { initializeButtons } from './buttonManager.js';

class Game {
  /**
   * Creates a new Game instance.
   * @param {CanvasRenderingContext2D} context - The canvas rendering context.
   * @param {HTMLCanvasElement} canvas - The canvas element.
   * @param {Object} components - An object containing game components (sky, sun, clouds, ground, stickfigure).
   */
  constructor(context, canvas, components) {
    this.context = context;
    this.canvas = canvas;
    this.components = components; // { sky, sun, clouds, ground, stickfigure }
    this.worldOffset = 0;
    this.gameSpeed = 2;
    this.isWalking = false;
    this.animationFrameId = null;
    this.initEventListeners();
  }

  /**
   * Initializes event listeners for keydown and keyup events.
   */
  initEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        this.isWalking = true;
        this.components.stickfigure.isWalking = true;
      } else if (e.key === "ArrowUp" || e.key === " ") {
        // Add keyboard support for jumping
        const { stickfigure } = this.components;
        if (stickfigure && stickfigure.startJump) {
          stickfigure.startJump();
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowRight") {
        this.isWalking = false;
        this.components.stickfigure.isWalking = false;
      }
    });
  }

  /**
   * The main animation loop that clears the canvas, draws all components,
   * and updates the game state.
   */
  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const { sky, sun, clouds, ground, stickfigure } = this.components;

    // Draw background elements
    sky.draw();
    sun.draw();
    clouds.forEach(cloud => cloud.draw());

    // Draw moving ground elements with translation for seamless tiling
    this.context.save();
    this.context.translate(0, 0);
    ground.draw(this.worldOffset);
    this.context.restore();

    // Update jump physics for the stickfigure before drawing
    if (stickfigure.updateJump) {
      stickfigure.updateJump();
    }

    // Draw the stickfigure on top so it remains static on screen
    stickfigure.draw();

    // Update world offset if the stickfigure is walking
    if (this.isWalking) {
      this.worldOffset += this.gameSpeed;
    }
  }

  /**
   * Starts the game by initiating the animation loop.
   */
  start() {
    // If there's already an animation frame running, cancel it first
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animate();
  }
  
  /**
   * Stops the game animation loop.
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Restarts the animation loop with current components.
   * Used after resizing to ensure we're using updated components.
   */
  restart() {
    this.stop();
    this.start();
  }
}

// The main function initializes the game.
const main = () => {
  // Initialize the game
  const game = new Game(context, canvas, {
    sky,
    sun,
    clouds,
    ground,
    stickfigure
  });
  
  // Expose the game instance globally so that other scripts can access it
  window.game = game;
  
  // Initialize all buttons and their handlers
  initializeButtons();
  
  // Start the game
  game.start();
};

// Only run main() when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export default Game;