import { ButtonManager } from './components/button.js';
import { canvas, context, sky, sun, clouds, ground, stickfigure } from './utils/setup.js';
import Attacker from './components/attacker.js';

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
    
    // Create the attacker instance
    this.attacker = new Attacker(context, components.stickfigure);
    // Create the button manager for canvas buttons
    this.buttonManager = new ButtonManager(context, canvas);
    
    // Initialize event listeners for keyboard and canvas buttons
    this.initEventListeners();
  }

  /**
   * Initializes event listeners for keyboard and canvas button interactions.
   */
  initEventListeners() {
    // Keyboard controls
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
      } else if (e.key === "z" || e.key === "Z") {
        // Add keyboard support for attack
        this.triggerAttack();
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowRight") {
        this.isWalking = false;
        this.components.stickfigure.isWalking = false;
      }
    });
    
    // Canvas button controls - mouse events
    this.canvas.addEventListener("mousedown", (e) => {
      this.handleCanvasClick(e.clientX, e.clientY, true);
    });
    
    this.canvas.addEventListener("mouseup", (e) => {
      this.handleCanvasClick(e.clientX, e.clientY, false);
    });
    
    this.canvas.addEventListener("mousemove", (e) => {
      this.handleCanvasHover(e.clientX, e.clientY);
    });
    
    // Canvas button controls - touch events for mobile
    this.canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      this.handleCanvasClick(touch.clientX, touch.clientY, true);
      // Prevent default to avoid scrolling/zooming
      e.preventDefault();
    });
    
    this.canvas.addEventListener("touchend", (e) => {
      const touch = e.changedTouches[0];
      this.handleCanvasClick(touch.clientX, touch.clientY, false);
      // Prevent default to avoid scrolling/zooming
      e.preventDefault();
    });
  }
  
  /**
   * Handle canvas clicks for button interaction.
   * @param {number} clientX - Client X coordinate.
   * @param {number} clientY - Client Y coordinate.
   * @param {boolean} isDown - Whether the mouse/touch is down.
   */
  handleCanvasClick(clientX, clientY, isDown) {
    // Convert client coordinates to canvas coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Check if any button was clicked
    const { move, jump, attack } = this.buttonManager.buttons;
    
    // Handle Move button
    if (this.isPointInButton(x, y, move)) {
      move.setPressed(isDown);
      if (isDown) {
        this.isWalking = true;
        this.components.stickfigure.isWalking = true;
      } else {
        this.isWalking = false;
        this.components.stickfigure.isWalking = false;
      }
    }
    
    // Handle Jump button
    if (this.isPointInButton(x, y, jump) && isDown) {
      jump.setPressed(true);
      setTimeout(() => jump.setPressed(false), 100); // Visual feedback
      const { stickfigure } = this.components;
      if (stickfigure && stickfigure.startJump) {
        stickfigure.startJump();
      }
    }
    
    // Handle Attack button
    if (this.isPointInButton(x, y, attack) && isDown) {
      attack.setPressed(true);
      setTimeout(() => attack.setPressed(false), 100); // Visual feedback
      this.triggerAttack();
    }
  }
  
  /**
   * Handle hover effects for buttons.
   * @param {number} clientX - Client X coordinate.
   * @param {number} clientY - Client Y coordinate.
   */
  handleCanvasHover(clientX, clientY) {
    // Convert client coordinates to canvas coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Update hover state for all buttons
    Object.values(this.buttonManager.buttons).forEach(button => {
      button.setHovered(this.isPointInButton(x, y, button));
    });
  }
  
  /**
   * Check if a point is inside a button.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {object} button - Button object to check.
   * @returns {boolean} Whether the point is inside the button.
   */
  isPointInButton(x, y, button) {
    if (!button) return false;
    return (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    );
  }

  /**
   * Trigger attack action
   */
  triggerAttack() {
    if (this.attacker) {
      // Try to start an attack and play a sound if successful
      if (this.attacker.startAttack()) {
        // You could add attack sound effects here in the future
        console.log("Attack triggered!");
      }
    }
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
    
    // Draw the stickfigure first
    stickfigure.draw();
    
    // Update and draw the attacker (in front of the main character)
    if (this.attacker) {
      this.attacker.update();
      this.attacker.draw();
    }
    
    // Draw attack cooldown indicator if needed
    this.drawAttackCooldown();

    // Update world offset if the stickfigure is walking
    if (this.isWalking) {
      this.worldOffset += this.gameSpeed;
    }

    // Draw buttons
    this.buttonManager.draw();
  }
  
  /**
   * Draw a cooldown indicator for attack
   */
  drawAttackCooldown() {
    if (!this.attacker) return;
    
    const cooldownPercent = this.attacker.getCooldownPercentage();
    if (cooldownPercent > 0 && this.buttonManager) {
      // Update the attack button cooldown visualization
      this.buttonManager.updateAttackCooldown(cooldownPercent);
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
    // Recreate the attacker when restarting to ensure it uses the updated stickfigure
    this.attacker = new Attacker(this.context, this.components.stickfigure);
    // Completely recreate the ButtonManager for proper scaling
    this.buttonManager = new ButtonManager(this.context, this.canvas);
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