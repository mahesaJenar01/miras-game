/**
 * SceneManager.js - Manages all scene components
 * Handles drawing order, updates, and scene-wide effects
 */
class SceneManager {
    /**
     * Create a new SceneManager
     * @param {Scene} scene - Reference to parent Scene instance
     */
    constructor(scene) {
      this.scene = scene;
      this.context = scene.context;
      this.canvas = scene.canvas;
    }
    
    /**
     * Update all scene components
     * @param {number} worldOffset - The current world offset for parallax
     */
    update(worldOffset) {
      const { clouds } = this.scene;
      
      // Update clouds
      clouds.forEach(cloud => cloud.update());
      
      // Update sun
      this.scene.sun.update();
    }
    
    /**
     * Draw all scene components in correct order
     * @param {number} worldOffset - The current world offset for parallax
     */
    draw(worldOffset) {
      // Draw background elements first
      this.drawBackground();
      
      // Draw midground elements
      this.drawMidground();
      
      // Draw ground with parallax
      this.drawGround(worldOffset);
    }
    
    /**
     * Draw background elements (sky, sun)
     */
    drawBackground() {
      const { sky, sun } = this.scene;
      
      // Draw sky
      sky.draw();
      
      // Draw sun
      sun.draw();
    }
    
    /**
     * Draw midground elements (clouds)
     */
    drawMidground() {
      const { clouds } = this.scene;
      
      // Draw clouds
      clouds.forEach(cloud => cloud.draw());
    }
    
    /**
     * Draw ground with parallax effect
     * @param {number} worldOffset - The current world offset
     */
    drawGround(worldOffset) {
      const { ground } = this.scene;
      const { context } = this;
      
      // Save context state
      context.save();
      
      // Apply translation for ground (if needed)
      context.translate(0, 0);
      
      // Draw ground with the current world offset
      ground.draw(worldOffset);
      
      // Restore context state
      context.restore();
    }
    
    /**
     * Apply special effects to the entire scene (weather, time of day, etc.)
     * @param {string} effect - Effect type
     * @param {Object} options - Effect parameters
     */
    applyEffect(effect, options = {}) {
      // Could implement various scene-wide effects here
      // For example: day/night cycle, weather effects, etc.
      switch (effect) {
        case 'sunset':
          // Apply sunset coloring
          break;
        case 'rain':
          // Add rain particles
          break;
        default:
          // No effect
          break;
      }
    }
  }
  
  export default SceneManager;