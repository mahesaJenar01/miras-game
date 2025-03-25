import ButtonSystem from './controls/ButtonSystem.js';
import ScalingConfig from './config/ScalingConfig.js';
import eventSystem from './utils/EventSystem.js';

// Import component classes
import Sky from './components/environment/Sky.js';
import Sun from './components/environment/Sun.js';
import Cloud from './components/decorations/Cloud.js';
import Ground from './components/environment/Ground.js';
import Stickfigure from './components/characters/Stickfigure.js';
import Attacker from './components/characters/Attacker.js';

/**
 * Main Game class that manages all components and game state
 */
class Game {
  /**
   * Creates a new Game instance.
   * @param {CanvasRenderingContext2D} context - The canvas rendering context.
   * @param {HTMLCanvasElement} canvas - The canvas element.
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    this.worldOffset = 0;
    this.gameSpeed = 2;
    this.isWalking = false;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    
    // Initialize scaling configuration
    this.scaling = new ScalingConfig(canvas.width, canvas.height);
    
    // Initialize game components
    this.initializeComponents();
    
    // Create the button system
    this.buttonSystem = new ButtonSystem(this, canvas, context);
    
    // Subscribe to events
    this.setupEventListeners();
  }
  
  /**
   * Initialize all game components
   */
  initializeComponents() {
    const { context, scaling } = this;
    
    // Create environment components
    this.sky = new Sky(context, scaling.sky);
    this.sun = new Sun(context, scaling.sun);
    this.ground = new Ground(context, scaling.ground);
    
    // Create cloud components
    this.clouds = scaling.clouds.map(config => new Cloud(context, config));
    
    // Create stickfigure
    this.stickfigure = new Stickfigure(context, scaling.stickfigure);
    
    // Create attacker based on stickfigure
    this.attacker = new Attacker(context, {
      ...scaling.attacker,
      stickfigure: this.stickfigure
    });
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for window resize events
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Subscribe to game events
    eventSystem.subscribe('attack', this.handleAttack.bind(this));
    eventSystem.subscribe('jump', this.handleJump.bind(this));
    eventSystem.subscribe('move', this.handleMove.bind(this));
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Update canvas dimensions
    this.canvas.width = window.innerWidth * 0.9;
    this.canvas.height = window.innerHeight * 0.9;
    
    // Update scaling configuration
    this.scaling.updateDimensions(this.canvas.width, this.canvas.height);
    
    // Update all components with new dimensions
    this.updateComponentDimensions();
    
    // Update button system
    this.buttonSystem.updateButtonPositions();
  }
  
  /**
   * Update all component dimensions based on new scaling
   */
  updateComponentDimensions() {
    const { scaling } = this;
    
    // Update environment components
    this.sky.updateDimensions(scaling.sky.width, scaling.sky.height);
    this.sun.updateProperties(scaling.sun.x, scaling.sun.y, scaling.sun.radius);
    this.ground.updateDimensions(
      scaling.ground.x,
      scaling.ground.y,
      scaling.ground.width,
      scaling.ground.height
    );
    
    // Update clouds
    for (let i = 0; i < this.clouds.length; i++) {
      const config = scaling.clouds[i];
      this.clouds[i].updateProperties(
        config.x,
        config.y,
        config.size,
        config.speed
      );
    }
    
    // Update stickfigure
    this.stickfigure.updateProperties(
      scaling.stickfigure.x,
      scaling.stickfigure.y,
      scaling.stickfigure.radius,
      scaling.stickfigure.thickness
    );
    
    // Recreate attacker since it depends on stickfigure
    this.attacker = new Attacker(this.context, {
      ...scaling.attacker,
      stickfigure: this.stickfigure
    });
  }
  
  /**
   * Handle attack event
   */
  handleAttack() {
    if (this.attacker && this.attacker.startAttack()) {
      console.log("Attack triggered!");
    }
  }
  
  /**
   * Handle jump event
   */
  handleJump() {
    if (this.stickfigure) {
      this.stickfigure.startJump();
    }
  }
  
  /**
   * Handle move event
   * @param {boolean} isActive - Whether movement should be active
   */
  handleMove(isActive) {
    this.isWalking = isActive;
    if (this.stickfigure) {
      this.stickfigure.isWalking = isActive;
    }
  }

  /**
   * The main animation loop
   * @param {DOMHighResTimeStamp} timestamp - Current timestamp
   */
  animate = (timestamp) => {
    // Calculate delta time for frame-rate independent updates
    const deltaTime = this.lastFrameTime ? timestamp - this.lastFrameTime : 16.67;
    this.lastFrameTime = timestamp;
    
    // Request next frame first to ensure smooth animation
    this.animationFrameId = requestAnimationFrame(this.animate);
    
    // Clear the canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update all components
    this.update(deltaTime);
    
    // Draw all components
    this.draw();
  }
  
  /**
   * Update all game components
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    // Update clouds
    for (const cloud of this.clouds) {
      cloud.update(deltaTime);
    }
    
    // Update sun
    this.sun.update(deltaTime);
    
    // Update ground with world offset
    this.ground.update(deltaTime, this.worldOffset);
    
    // Update stickfigure
    this.stickfigure.update(deltaTime);
    
    // Update attacker
    this.attacker.update(deltaTime);
    
    // Update world offset if walking
    if (this.isWalking) {
      // Scale movement by deltaTime for consistent speed
      this.worldOffset += this.gameSpeed * (deltaTime / 16.67);
    }
  }
  
  /**
   * Draw all game components
   */
  draw() {
    // Draw background elements
    this.sky.draw();
    this.sun.draw();
    
    // Draw clouds
    for (const cloud of this.clouds) {
      cloud.draw();
    }
    
    // Draw ground with world offset
    this.ground.draw(this.worldOffset);
    
    // Draw stickfigure
    this.stickfigure.draw();
    
    // Draw attacker
    this.attacker.draw();
    
    // Draw UI elements
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
    
    // Reset last frame time
    this.lastFrameTime = 0;
    
    // Start animation loop
    this.animationFrameId = requestAnimationFrame(this.animate);
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
   */
  restart() {
    this.stop();
    this.start();
  }
  
  /**
   * Clean up resources when game is destroyed
   */
  destroy() {
    this.stop();
    
    // Clean up event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Unsubscribe from events
    eventSystem.clearAllEvents();
    
    // Clean up components
    if (this.buttonSystem) {
      this.buttonSystem.destroy();
    }
  }
}

export default Game;