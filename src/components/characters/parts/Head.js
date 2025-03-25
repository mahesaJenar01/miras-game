import CharacterPart from './CharacterPart.js';
import DrawingUtils from '../../../utils/DrawingUtils.js';

/**
 * Head component for characters
 * @extends CharacterPart
 */
class Head extends CharacterPart {
  /**
   * Create a new Head component
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {string} config.color - Head color
   * @param {number} config.thickness - Line thickness
   * @param {number} config.radius - Head radius
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the head component
   */
  initialize() {
    super.initialize();
    
    const { config } = this;
    this.radius = config.radius || 10;
  }

  /**
   * Draw the head
   */
  draw() {
    const { context, x, y, radius, color, thickness, hasFeminineFeatures } = this;
    
    // Draw basic head
    DrawingUtils.circle(context, x, y, radius, null, color, thickness);
    
    // Draw feminine features if enabled
    if (hasFeminineFeatures) {
      this.drawFeminineFeatures();
    }
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Draw feminine features (hair and bow)
   */
  drawFeminineFeatures() {
    const { context, x, y, radius, color, thickness } = this;
    
    // Draw simple hair (small curves around the top of the head)
    context.beginPath();
    
    // Left side hair
    context.moveTo(x - radius * 0.8, y + radius * 0.2);
    context.bezierCurveTo(
      x - radius * 1.2, y - radius * 0.4,
      x - radius * 0.8, y - radius * 1.2,
      x - radius * 0.3, y - radius * 0.8
    );
    
    // Middle hair
    context.moveTo(x, y - radius);
    context.bezierCurveTo(
      x - radius * 0.2, y - radius * 1.3,
      x + radius * 0.2, y - radius * 1.3,
      x, y - radius
    );
    
    // Right side hair
    context.moveTo(x + radius * 0.3, y - radius * 0.8);
    context.bezierCurveTo(
      x + radius * 0.8, y - radius * 1.2,
      x + radius * 1.2, y - radius * 0.4,
      x + radius * 0.8, y + radius * 0.2
    );
    
    context.strokeStyle = color;
    context.lineWidth = thickness * 0.8;
    context.stroke();
    context.closePath();
    
    // Draw a small bow
    this.drawBow();
  }
  
  /**
   * Draw a decorative bow
   */
  drawBow() {
    const { context, x, y, radius, color, thickness } = this;
    
    const bowX = x + radius * 0.7;
    const bowY = y - radius * 0.5;
    const bowSize = radius * 0.4;
    
    // Draw bow center
    DrawingUtils.circle(context, bowX, bowY, bowSize * 0.3, color);
    
    // Draw bow left loop
    context.beginPath();
    context.ellipse(
      bowX - bowSize * 0.6, bowY,
      bowSize * 0.7, bowSize * 0.5,
      Math.PI * 0.2, 0, Math.PI * 2
    );
    context.strokeStyle = color;
    context.lineWidth = thickness * 0.8;
    context.stroke();
    context.closePath();
    
    // Draw bow right loop
    context.beginPath();
    context.ellipse(
      bowX + bowSize * 0.6, bowY,
      bowSize * 0.7, bowSize * 0.5,
      -Math.PI * 0.2, 0, Math.PI * 2
    );
    context.strokeStyle = color;
    context.lineWidth = thickness * 0.8;
    context.stroke();
    context.closePath();
    
    // Draw bow ribbons
    context.beginPath();
    // Left ribbon
    context.moveTo(bowX - bowSize * 0.3, bowY + bowSize * 0.2);
    context.quadraticCurveTo(
      bowX - bowSize * 0.7, bowY + bowSize * 0.7,
      bowX - bowSize * 0.5, bowY + bowSize
    );
    
    // Right ribbon
    context.moveTo(bowX + bowSize * 0.3, bowY + bowSize * 0.2);
    context.quadraticCurveTo(
      bowX + bowSize * 0.7, bowY + bowSize * 0.7,
      bowX + bowSize * 0.5, bowY + bowSize
    );
    
    context.strokeStyle = color;
    context.lineWidth = thickness * 0.8;
    context.stroke();
    context.closePath();
  }
  
  /**
   * Update head properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} radius - New radius
   */
  updateProperties(x, y, radius) {
    this.updatePosition(x, y);
    this.radius = radius;
  }
}

export default Head;