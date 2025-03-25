import CharacterPart from './CharacterPart.js';
import DrawingUtils from '../../../utils/DrawingUtils.js';
import AnimationUtils from '../../../utils/AnimationUtils.js';

/**
 * Limb component for character hands and legs
 * @extends CharacterPart
 */
class Limb extends CharacterPart {
  /**
   * Create a new Limb component
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {string} config.color - Limb color
   * @param {number} config.thickness - Line thickness
   * @param {number} config.length - Limb length
   * @param {boolean} config.isLeft - Whether this is a left limb
   * @param {string} config.type - Type of limb ('hand' or 'leg')
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the limb component
   */
  initialize() {
    super.initialize();
    
    const { config } = this;
    this.length = config.length || 30;
    this.isLeft = config.isLeft !== undefined ? config.isLeft : true;
    this.type = config.type || 'leg'; // 'hand' or 'leg'
  }

  /**
   * Draw the limb statically
   */
  draw() {
    if (this.swingValue !== undefined) {
      // If swingValue is provided, use animated drawing
      this.drawAnimated(this.swingValue);
    } else {
      // Otherwise use static drawing
      this.drawStatic();
    }
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Draw the limb statically
   */
  drawStatic() {
    const { context, x, y, color, thickness, length, isLeft, type, hasFeminineFeatures } = this;
    
    context.beginPath();
    context.moveTo(x, y);
    
    let endX, endY;
    
    if (hasFeminineFeatures) {
      // Slightly more graceful angles for feminine figure
      if (type === 'hand') {
        // Hands are positioned slightly different than legs
        if (isLeft) {
          endX = x - length * 0.7;
          endY = y + length * 0.9;
        } else {
          endX = x + length * 0.7;
          endY = y + length * 0.9;
        }
      } else { // leg
        if (isLeft) {
          endX = x - length * 0.4;
          endY = y + length;
        } else {
          endX = x + length * 0.4;
          endY = y + length;
        }
      }
    } else {
      // Regular positioning for non-feminine figures
      if (type === 'hand') {
        if (isLeft) {
          endX = x - length * 0.75;
          endY = y + length;
        } else {
          endX = x + length * 0.75;
          endY = y + length;
        }
      } else { // leg
        if (isLeft) {
          endX = x - length * 0.5;
          endY = y + length;
        } else {
          endX = x + length * 0.5;
          endY = y + length;
        }
      }
    }
    
    context.lineTo(endX, endY);
    context.strokeStyle = color;
    context.lineWidth = thickness;
    context.stroke();
    context.closePath();
  }
  
  /**
   * Draw the limb with animation
   * @param {number} swingValue - Swing value for animation (-1 to 1)
   */
  drawAnimated(swingValue) {
    const { context, x, y, color, thickness, length, isLeft, type, hasFeminineFeatures } = this;
    
    // Adjust swing amplitude based on feminine features
    const swingFactor = hasFeminineFeatures ? 
      (type === 'hand' ? 0.9 : 0.85) : 1;
    
    // Calculate swing direction (reverse for right limbs)
    const adjustedSwing = isLeft ? swingValue : -swingValue;
    
    // Calculate angle based on swing value
    const angle = Math.PI / 2 + (adjustedSwing * swingFactor);
    
    // Calculate end points
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    // Draw the limb
    DrawingUtils.line(
      context,
      x, y,
      endX, endY,
      color,
      thickness
    );
  }
  
  /**
   * Set animation swing value
   * @param {number} value - Swing value (-1 to 1)
   */
  setSwingValue(value) {
    this.swingValue = value;
  }
  
  /**
   * Update limb properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} length - New length
   */
  updateProperties(x, y, length) {
    this.updatePosition(x, y);
    this.length = length;
  }
}

export default Limb;