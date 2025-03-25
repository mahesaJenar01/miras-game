import CharacterPart from './CharacterPart.js';
import DrawingUtils from '../../../utils/DrawingUtils.js';

/**
 * Body component for characters
 * @extends CharacterPart
 */
class Body extends CharacterPart {
  /**
   * Create a new Body component
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {string} config.color - Body color
   * @param {number} config.thickness - Line thickness
   * @param {number} config.length - Body length
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the body component
   */
  initialize() {
    super.initialize();
    
    const { config } = this;
    this.length = config.length || 50;
  }

  /**
   * Draw the body
   */
  draw() {
    const { context, x, y, color, thickness, length, hasFeminineFeatures } = this;
    
    context.beginPath();
    
    if (hasFeminineFeatures) {
      // Draw a slightly curved body for a more feminine silhouette
      const controlX = x - length * 0.07; // Slight curve for feminine figure
      const controlY = y + length * 0.5;
      
      context.moveTo(x, y);
      context.quadraticCurveTo(
        controlX, controlY,
        x, y + length
      );
    } else {
      // Draw straight body
      context.moveTo(x, y);
      context.lineTo(x, y + length);
    }
    
    context.strokeStyle = color;
    context.lineWidth = thickness;
    context.stroke();
    context.closePath();
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Update body properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} length - New length
   */
  updateProperties(x, y, length) {
    this.updatePosition(x, y);
    this.length = length;
  }
}

export default Body;