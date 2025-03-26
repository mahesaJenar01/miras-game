/**
 * main.js - Main game entry point
 * Updated to use the modular character system
 */
import ButtonSystem from './controls/ButtonSystem.js';
import { canvas, context, scene, stickfigure } from './utils/setup.js';
import Attacker from './components/character/Attacker.js';

class Game {
  /**
   * Creates a new Game instance.
   * @param {CanvasRenderingContext2D} context - The canvas rendering context.
   * @param {HTMLCanvasElement} canvas - The canvas element.
   * @param {Object} components - An object containing game components (scene, stickfigure).
   */
  constructor(context, canvas, components) {
    this.context = context;
    this.canvas = canvas;
    this.components = components; // { scene, stickfigure }
    this.worldOffset = 0;
    this.gameSpeed = 2;
    this.isWalking = false;
    this.animationFrameId = null;
    
    // Create the attacker instance
    this.attacker = new Attacker(context, components.stickfigure);
    
    // Create the button system
    this.buttonSystem = new ButtonSystem(this, canvas, context);
  }

  /**
   * The main animation loop that clears the canvas, draws all components,
   * and updates the game state.
   */
  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const { scene, stickfigure } = this.components;

    // Update and draw the scene with current world offset
    scene.update(this.worldOffset);
    scene.draw(this.worldOffset);

    // Update stickfigure
    if (stickfigure.update) {
      stickfigure.update();
    }
    
    // Update jump physics for the stickfigure before drawing
    if (stickfigure.updateJump) {
      stickfigure.updateJump();
    }
    
    // Draw the stickfigure
    stickfigure.draw();
    
    // Update and draw the attacker (in front of the main character)
    if (this.attacker) {
      this.attacker.update();
      this.attacker.draw();
    }

    // Update world offset if the stickfigure is walking
    if (this.isWalking) {
      this.worldOffset += this.gameSpeed;
      
      // Ensure stickfigure walking state is synchronized
      if (this.components.stickfigure && !this.components.stickfigure.isWalking) {
        this.components.stickfigure.isWalking = true;
      }
    } else {
      // Ensure stickfigure walking state is synchronized
      if (this.components.stickfigure && this.components.stickfigure.isWalking) {
        this.components.stickfigure.isWalking = false;
      }
    }

    // Draw buttons using the button system
    this.buttonSystem.draw();
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
   * Update game components
   * @param {Object} components - New components object
   */
  setComponents(components) {
    this.components = components;
  }
  
  /**
   * Restarts the animation loop with current components.
   * Used after resizing to ensure we're using updated components.
   */
  restart() {
    this.stop();
    // Recreate the attacker when restarting to ensure it uses the updated stickfigure
    this.attacker = new Attacker(this.context, this.components.stickfigure);
    // Update button positions
    this.buttonSystem.updateButtonPositions();
    this.start();
  }
}

// The main function initializes the game.
const main = () => {
  // Initialize the game with modular scene
  const game = new Game(context, canvas, {
    scene,
    stickfigure
  });
  
  // Expose the game instance globally so that other scripts can access it
  window.game = game;
  
  // Start the game.
  game.start();
};

// Only run main() when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export default Game;