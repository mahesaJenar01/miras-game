/**
 * BasePart.js - Foundation class for all character parts
 * Handles common properties and methods used by all body parts
 */
class BasePart {
    /**
     * Create a new base part
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {Object} config - Configuration object
     */
    constructor(context, x, y, config = {}) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.color = config.color || "#000";
      this.tickness = config.tickness || 2;
      this.scale = config.scale || 1;
      this.hasFeminineFeatures = config.hasFeminineFeatures || false;
    }
  
    /**
     * Update the position of the part
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    updatePosition(x, y) {
      this.x = x;
      this.y = y;
    }
  
    /**
     * Update the configuration
     * @param {Object} config - New configuration properties
     */
    updateConfig(config = {}) {
      if (config.color !== undefined) this.color = config.color;
      if (config.tickness !== undefined) this.tickness = config.tickness;
      if (config.scale !== undefined) this.scale = config.scale;
      if (config.hasFeminineFeatures !== undefined) this.hasFeminineFeatures = config.hasFeminineFeatures;
    }
  
    /**
     * Draw the part (to be implemented by subclasses)
     */
    draw() {
      // Base implementation does nothing
      // Subclasses should override this method
    }
  
    /**
     * Apply transformations to context before drawing
     * Saves context state
     */
    beginDraw() {
      this.context.save();
      this.context.translate(this.x, this.y);
      this.context.scale(this.scale, this.scale);
    }
  
    /**
     * Restores context state after drawing
     */
    endDraw() {
      this.context.restore();
    }
  }
  
  export default BasePart;