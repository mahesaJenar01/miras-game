import { canvas, context, sky, sun, clouds, ground, stickfigure } from './utils/setup.js';
import { initializeButtons } from './controls/buttonManager.js';
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
  }
  
  /**
   * Draw a cooldown indicator for attack
   */
  drawAttackCooldown() {
    if (!this.attacker) return;
    
    const cooldownPercent = this.attacker.getCooldownPercentage();
    if (cooldownPercent > 0) {
      // Get the attack button position
      const attackBtn = document.getElementById("attack-btn");
      if (!attackBtn) return;
      
      const rect = attackBtn.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      
      // Convert screen coordinates to canvas coordinates
      const x = rect.left - canvasRect.left + rect.width / 2;
      const y = rect.top - canvasRect.top - 10; // 10px above the button
      
      // Draw circular cooldown indicator
      const radius = 15;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (1 - cooldownPercent) * Math.PI * 2;
      
      this.context.beginPath();
      this.context.arc(x, y, radius, startAngle, startAngle + Math.PI * 2);
      this.context.fillStyle = "rgba(0, 0, 0, 0.3)";
      this.context.fill();
      this.context.closePath();
      
      this.context.beginPath();
      this.context.moveTo(x, y);
      this.context.arc(x, y, radius, startAngle, endAngle);
      this.context.lineTo(x, y);
      this.context.fillStyle = "#4CAF50"; // Green
      this.context.fill();
      this.context.closePath();
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