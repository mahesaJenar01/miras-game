/**
 * Body.js - Represents a character's body
 * Handles body rendering with optional feminine features
 */
import BasePart from './BasePart.js';

class Body extends BasePart {
  /**
   * Create a new body
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - Base X position
   * @param {number} y - Base Y position
   * @param {Object} config - Configuration object
   */
  constructor(context, x, y, config = {}) {
    super(context, x, y, config);
    this.length = config.bodyLength || 50;
  }

  /**
   * Draw the body with optional feminine features
   */
  draw() {
    this.beginDraw();
    
    this.context.beginPath();
    
    if (this.hasFeminineFeatures) {
      // Draw a slightly curved body for a more feminine silhouette
      const controlX = -this.length * 0.07; // Slight curve for feminine figure
      const controlY = this.length * 0.5;
      
      this.context.moveTo(0, 0);
      this.context.quadraticCurveTo(
        controlX, controlY,
        0, this.length
      );
    } else {
      // Draw straight body
      this.context.moveTo(0, 0);
      this.context.lineTo(0, this.length);
    }
    
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
    
    this.endDraw();
  }
  
  /**
   * Update body-specific configuration
   * @param {Object} config - New configuration properties
   */
  updateConfig(config = {}) {
    super.updateConfig(config);
    if (config.bodyLength !== undefined) this.length = config.bodyLength;
  }
  
  /**
   * Get the bottom position of the body in local coordinates
   * @returns {Object} Position object {x, y}
   */
  getBottomPosition() {
    return { x: 0, y: this.length };
  }
}

export default Body;