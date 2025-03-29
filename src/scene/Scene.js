/**
 * Scene.js - Main container for all scene elements
 * Updated to support collectible items
 */
import SceneManager from './SceneManager.js';
import Sky from './components/Sky.js';
import Sun from './components/Sun.js';
import Cloud from './components/Cloud.js';
import Ground from './components/Ground.js';
import GameEvents from '../events/GameEvents.js';
import { SCENE_EVENTS, GAME_EVENTS, COLLECTIBLE_EVENTS } from '../events/EventTypes.js';

class Scene {
  /**
   * Create a new Scene
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {Object} config - Scene configuration object
   */
  constructor(context, canvas, config) {
    this.context = context;
    this.canvas = canvas;
    this.config = config;
    
    // Initialize scene components
    this.initialize();
    
    // Create scene manager to handle updates and drawing
    this.manager = new SceneManager(this);
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners for scene interactions
   */
  registerEventListeners() {
    // Listen for world updates to update parallax
    GameEvents.on(GAME_EVENTS.WORLD_UPDATE, (data) => {
      this.handleWorldUpdate(data.worldOffset);
    });
    
    // Listen for resize events
    GameEvents.on(GAME_EVENTS.RESIZE, (data) => {
      const { width, height, config } = data;
      if (width && height && config) {
        this.resize(width, height, config);
      }
    });
    
    // Listen for scene effect requests
    GameEvents.on(SCENE_EVENTS.EFFECT_START, (data) => {
      const { effect, options } = data;
      if (effect && this.manager) {
        this.manager.applyEffect(effect, options);
      }
    });
    
    // Listen for collectible generation requests
    GameEvents.on(COLLECTIBLE_EVENTS.COLLECTIBLE_GENERATED, (data) => {
      // Handle any scene effects that might be triggered when collectibles are generated
      // For example, we could add subtle visual effects near collectible spawn points
      if (data.worldOffset && this.manager) {
        // We could potentially add special effects at the collectible spawn points
      }
    });
  }
  
  /**
   * Clean up event listeners
   */
  cleanup() {
    // In a real implementation, we would keep references to listeners
    // and remove them specifically, but this is a simplified example
  }
  
  /**
   * Handle world update events for parallax scrolling
   * @param {number} worldOffset - The updated world offset
   */
  handleWorldUpdate(worldOffset) {
    // Store the world offset for drawing
    this.currentWorldOffset = worldOffset;
    
    // Emit scene update event
    GameEvents.emitScene(SCENE_EVENTS.PARALLAX_UPDATE, {
      worldOffset
    });
  }
  
  /**
   * Initialize all scene components
   */
  initialize() {
    const { context, canvas, config } = this;
    
    // Create sky
    this.sky = new Sky(context, canvas.width, canvas.height);
    
    // Create sun
    this.sun = new Sun(
      context, 
      config.sun.x, 
      config.sun.y, 
      config.sun.radius
    );
    
    // Create clouds
    this.clouds = config.clouds.map(cloudConfig => 
      new Cloud(
        context,
        cloudConfig.x,
        cloudConfig.y,
        cloudConfig.size,
        cloudConfig.speed
      )
    );
    
    // Create ground
    this.ground = new Ground(
      context,
      config.ground.x,
      config.ground.y,
      config.ground.height,
      config.ground.width
    );
    
    // Initialize world offset
    this.currentWorldOffset = 0;
  }
  
  /**
   * Update scene components
   * @param {number} worldOffset - The current world offset for parallax
   */
  update(worldOffset) {
    // Store the world offset for drawing
    this.currentWorldOffset = worldOffset;
    
    // Update components via the manager
    this.manager.update(worldOffset);
  }
  
  /**
   * Draw all scene components
   * @param {number} worldOffset - The current world offset for parallax
   */
  draw(worldOffset) {
    // Use the stored world offset if none provided
    const offset = worldOffset !== undefined ? worldOffset : this.currentWorldOffset;
    
    // Draw components via the manager
    this.manager.draw(offset);
  }
  
  /**
   * Resize the scene to fit new dimensions
   * @param {number} width - New canvas width
   * @param {number} height - New canvas height
   * @param {Object} config - Updated configuration
   */
  resize(width, height, config) {
    this.config = config;
    
    // Emit scene update event before reinitializing
    GameEvents.emitScene(SCENE_EVENTS.SCENERY_UPDATE, {
      width,
      height,
      config
    });
    
    // Reinitialize components with new dimensions
    this.initialize();
  }
  
  /**
   * Get all scene components for external use
   * @returns {Object} Object with sky, sun, clouds, and ground
   */
  getComponents() {
    return {
      sky: this.sky,
      sun: this.sun,
      clouds: this.clouds,
      ground: this.ground
    };
  }
  
  /**
   * Get the ground Y position to place collectibles correctly
   * @returns {number} The Y position of the ground top
   */
  getGroundTopPosition() {
    if (this.ground) {
      return this.ground.y;
    }
    return this.canvas.height * 0.8; // Default if ground not available
  }

  /**
   * Get the ground height for positioning calculations
   * @returns {number} The height of the ground
   */
  getGroundHeight() {
    if (this.ground) {
      return this.ground.height;
    }
    return this.canvas.height * 0.2; // Default if ground not available
  }

  /**
   * Get grass height (needed to position collectibles above grass level)
   * @returns {number} The height of the grass portion of the ground
   */
  getGrassHeight() {
    if (this.ground) {
      return this.ground.grassHeight;
    }
    return this.canvas.height * 0.06; // Default if ground not available
  }
  
  /**
   * Apply a scene effect (delegated to SceneManager)
   * @param {string} effect - Effect type
   * @param {Object} options - Effect parameters
   */
  applyEffect(effect, options = {}) {
    if (this.manager) {
      this.manager.applyEffect(effect, options);
      
      // Emit effect start event
      GameEvents.emitScene(SCENE_EVENTS.EFFECT_START, {
        effect,
        options
      });
    }
  }
}

export default Scene;