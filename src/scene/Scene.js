/**
 * Modified Scene.js with improved parallax and constant speed handling
 * This focuses on rendering elements correctly while maintaining constant game speed
 */

import SceneManager from './SceneManager.js';
import Sky from './components/Sky.js';
import Sun from './components/Sun.js';
import Cloud from './components/Cloud.js';
import Ground from './components/Ground.js';
import GameEvents from '../events/GameEvents.js';
import { SCENE_EVENTS, GAME_EVENTS } from '../events/EventTypes.js';

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
    
    // Store reference width for proper scaling
    this.referenceWidth = 1920;
    this.referenceHeight = 1080;
    
    // Calculate scale factor for rendering
    this.updateScaleFactor();
    
    // Initialize scene components
    this.initialize();
    
    // Create scene manager to handle updates and drawing
    this.manager = new SceneManager(this);
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Update the scale factor based on canvas dimensions
   */
  updateScaleFactor() {
    const widthScale = this.canvas.width / this.referenceWidth;
    const heightScale = this.canvas.height / this.referenceHeight;
    this.scaleFactor = Math.min(widthScale, heightScale);
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
        this.updateScaleFactor();
      }
    });
    
    // Listen for scene effect requests
    GameEvents.on(SCENE_EVENTS.EFFECT_START, (data) => {
      const { effect, options } = data;
      if (effect && this.manager) {
        this.manager.applyEffect(effect, options);
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
    
    // Ensure config exists to prevent errors
    if (!config) {
      return;
    }
    
    // Create sky
    this.sky = new Sky(context, canvas.width, canvas.height);
    
    // Create sun with safer access to config
    if (config.sun) {
      this.sun = new Sun(
        context, 
        config.sun.x || canvas.width * 0.75, 
        config.sun.y || canvas.height * 0.2, 
        config.sun.radius || canvas.height * 0.06
      );
    } else {
      // Create with defaults if config.sun is missing
      this.sun = new Sun(
        context,
        canvas.width * 0.75,
        canvas.height * 0.2,
        canvas.height * 0.06
      );
    }
    
    // Create clouds with safer array handling
    if (config.clouds && Array.isArray(config.clouds)) {
      this.clouds = config.clouds.map(cloudConfig => 
        new Cloud(
          context,
          cloudConfig.x || Math.random() * canvas.width,
          cloudConfig.y || Math.random() * canvas.height * 0.3,
          cloudConfig.size || canvas.height * 0.03,
          cloudConfig.speed || 0.1
        )
      );
    } else {
      // Create default clouds if config.clouds is missing
      this.clouds = [
        new Cloud(context, canvas.width * 0.1, canvas.height * 0.15, canvas.height * 0.03, 0.1),
        new Cloud(context, canvas.width * 0.5, canvas.height * 0.25, canvas.height * 0.04, 0.05),
        new Cloud(context, canvas.width * 0.8, canvas.height * 0.1, canvas.height * 0.035, 0.07)
      ];
    }
    
    // Create ground with safer access
    if (config.ground) {
      this.ground = new Ground(
        context,
        config.ground.x || 0,
        config.ground.y || canvas.height * 0.8,
        config.ground.height || canvas.height * 0.2,
        config.ground.width || canvas.width
      );
    } else {
      // Create with defaults if config.ground is missing
      this.ground = new Ground(
        context,
        0,
        canvas.height * 0.8,
        canvas.height * 0.2,
        canvas.width
      );
    }
    
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
   * Draw all scene components with proper scaling
   * @param {number} worldOffset - The current world offset for parallax
   */
  draw(worldOffset) {
    // Use the stored world offset if none provided
    const offset = worldOffset !== undefined ? worldOffset : this.currentWorldOffset;
    
    // Apply consistent parallax based on absolute pixel movement
    const scaledOffset = offset;
    
    // Draw components via the manager
    this.manager.draw(scaledOffset);
  }
  
  /**
   * Resize the scene to fit new dimensions
   * @param {number} width - New canvas width
   * @param {number} height - New canvas height
   * @param {Object} config - Updated configuration
   */
  resize(width, height, config) {
    this.config = config;
    this.updateScaleFactor();
    
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