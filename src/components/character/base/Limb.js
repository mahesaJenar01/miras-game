/**
 * Limb.js - Represents a character's limb (hand or leg)
 * Handles limb rendering with static and animated positions
 */
import BasePart from './BasePart.js';

class Limb extends BasePart {
  /**
   * Create a new limb
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - Base X position
   * @param {number} y - Base Y position
   * @param {Object} config - Configuration object
   * @param {string} type - Type of limb ('hand' or 'leg')
   * @param {boolean} isLeft - Whether this is a left limb
   */
  constructor(context, x, y, config = {}, type = 'hand', isLeft = true) {
    super(context, x, y, config);
    this.type = type;
    this.isLeft = isLeft;
    
    // Set length based on type
    if (this.type === 'hand') {
      this.length = config.handsLength || 20;
    } else { // leg
      this.length = config.legLength || 30;
    }
    
    // Animation properties
    this.swing = 0; // Current swing angle (-1 to 1)
  }

  /**
   * Draw the limb in static position
   */
  draw() {
    this.beginDraw();
    
    this.context.beginPath();
    this.context.moveTo(0, 0);
    
    let endX, endY;
    
    if (this.hasFeminineFeatures) {
      // Slightly more graceful angles for feminine figure
      if (this.type === 'hand') {
        if (this.isLeft) {
          endX = -this.length * 0.7;
          endY = this.length * 0.9;
        } else {
          endX = this.length * 0.7;
          endY = this.length * 0.9;
        }
      } else { // leg
        if (this.isLeft) {
          endX = -this.length * 0.4;
          endY = this.length;
        } else {
          endX = this.length * 0.4;
          endY = this.length;
        }
      }
    } else {
      // Standard angles
      if (this.type === 'hand') {
        if (this.isLeft) {
          endX = -this.length * 0.75;
          endY = this.length;
        } else {
          endX = this.length * 0.75;
          endY = this.length;
        }
      } else { // leg
        if (this.isLeft) {
          endX = -this.length * 0.5;
          endY = this.length;
        } else {
          endX = this.length * 0.5;
          endY = this.length;
        }
      }
    }
    
    this.context.lineTo(endX, endY);
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
    
    this.endDraw();
  }
  
  /**
   * Draw the limb with animated movement
   * @param {number} swing - The swing value (-1 to 1)
   */
  drawAnimated(swing) {
    this.beginDraw();
    
    // Store the swing value for reference
    this.swing = swing;
    
    // Slightly more graceful swinging for feminine figure
    const swingMultiplier = this.hasFeminineFeatures ? 
      (this.type === 'hand' ? 0.9 : 0.85) : 1;
    
    const angle = Math.PI / 2 + swing * Math.PI / 6 * swingMultiplier;
    
    // Flip angle for right limbs
    const actualAngle = this.isLeft ? angle : Math.PI - angle;
    
    const endX = Math.cos(actualAngle) * this.length;
    const endY = Math.sin(actualAngle) * this.length;
    
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(endX, endY);
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
    
    this.endDraw();
  }
  
  /**
   * Update limb-specific configuration
   * @param {Object} config - New configuration properties
   */
  updateConfig(config = {}) {
    super.updateConfig(config);
    
    if (this.type === 'hand' && config.handsLength !== undefined) {
      this.length = config.handsLength;
    } else if (this.type === 'leg' && config.legLength !== undefined) {
      this.length = config.legLength;
    }
  }
  
  /**
   * Get the end position of the limb
   * @returns {Object} Position object {x, y}
   */
  getEndPosition() {
    let endX, endY;
    
    // If we have a stored swing value, use that to calculate position
    if (this.swing !== 0) {
      // Slightly more graceful swinging for feminine figure
      const swingMultiplier = this.hasFeminineFeatures ? 
        (this.type === 'hand' ? 0.9 : 0.85) : 1;
      
      const angle = Math.PI / 2 + this.swing * Math.PI / 6 * swingMultiplier;
      
      // Flip angle for right limbs
      const actualAngle = this.isLeft ? angle : Math.PI - angle;
      
      endX = Math.cos(actualAngle) * this.length;
      endY = Math.sin(actualAngle) * this.length;
    } else {
      // Use static position calculation
      if (this.hasFeminineFeatures) {
        if (this.type === 'hand') {
          if (this.isLeft) {
            endX = -this.length * 0.7;
            endY = this.length * 0.9;
          } else {
            endX = this.length * 0.7;
            endY = this.length * 0.9;
          }
        } else { // leg
          if (this.isLeft) {
            endX = -this.length * 0.4;
            endY = this.length;
          } else {
            endX = this.length * 0.4;
            endY = this.length;
          }
        }
      } else {
        if (this.type === 'hand') {
          if (this.isLeft) {
            endX = -this.length * 0.75;
            endY = this.length;
          } else {
            endX = this.length * 0.75;
            endY = this.length;
          }
        } else { // leg
          if (this.isLeft) {
            endX = -this.length * 0.5;
            endY = this.length;
          } else {
            endX = this.length * 0.5;
            endY = this.length;
          }
        }
      }
    }
    
    return { x: endX, y: endY };
  }
}

export default Limb;