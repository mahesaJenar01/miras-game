/**
 * Scene.js - Main container for all scene elements
 * Encapsulates sky, sun, clouds, ground and their interactions
 */
import SceneManager from './SceneManager.js';
import Sky from './components/Sky.js';
import Sun from './components/Sun.js';
import Cloud from './components/Cloud.js';
import Ground from './components/Ground.js';

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
  }
  
  /**
   * Update scene components
   * @param {number} worldOffset - The current world offset for parallax
   */
  update(worldOffset) {
    this.manager.update(worldOffset);
  }
  
  /**
   * Draw all scene components
   * @param {number} worldOffset - The current world offset for parallax
   */
  draw(worldOffset) {
    this.manager.draw(worldOffset);
  }
  
  /**
   * Resize the scene to fit new dimensions
   * @param {number} width - New canvas width
   * @param {number} height - New canvas height
   * @param {Object} config - Updated configuration
   */
  resize(width, height, config) {
    this.config = config;
    
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
}

export default Scene;