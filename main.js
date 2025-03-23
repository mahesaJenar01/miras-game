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
        if (this.components.stickfigure && this.components.stickfigure.startJump) {
          this.components.stickfigure.startJump();
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
  animate() {
    // Store reference to 'this' to use in the animation frame
    const self = this;
    
    this.animationFrameId = requestAnimationFrame(() => self.animate());
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background elements
    this.components.sky.draw();
    this.components.sun.draw();
    for (const cloud of this.components.clouds) {
      cloud.draw();
    }

    // Draw moving ground elements with translation for seamless tiling
    this.context.save();
    this.context.translate(0, 0);
    this.components.ground.draw(this.worldOffset);
    this.context.restore();

    // Update jump physics for the stickfigure before drawing
    if (this.components.stickfigure.updateJump) {
      this.components.stickfigure.updateJump();
    }

    // Draw the stickfigure on top so it remains static on screen
    this.components.stickfigure.draw();

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
function main() {
  const game = new Game(context, canvas, {
    sky,
    sun,
    clouds,
    ground,
    stickfigure
  });
  
  // Expose the game instance globally so that other scripts (e.g., button event handlers)
  // can access and modify the game state.
  window.game = game;
  
  game.start();
}

// Only run main() when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}