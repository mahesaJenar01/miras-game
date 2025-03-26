/**
 * Head.js - Represents a character's head
 * Handles head rendering with optional feminine features
 */
import BasePart from './BasePart.js';

class Head extends BasePart {
  /**
   * Create a new head
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - Base X position
   * @param {number} y - Base Y position
   * @param {Object} config - Configuration object
   */
  constructor(context, x, y, config = {}) {
    super(context, x, y, config);
    this.radius = config.radius || 10;
  }

  /**
   * Draw the head with optional feminine features
   */
  draw() {
    this.beginDraw();
    
    // Draw basic head
    this.context.beginPath();
    this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
    
    // Draw feminine features if enabled
    if (this.hasFeminineFeatures) {
      this.drawFeminineFeatures();
    }
    
    this.endDraw();
  }
  
  /**
   * Draw feminine features on the head
   * Includes hair and a bow
   */
  drawFeminineFeatures() {
    // Draw simple hair (small curves around the top of the head)
    this.context.beginPath();
    
    // Left side hair
    this.context.moveTo(-this.radius * 0.8, this.radius * 0.2);
    this.context.bezierCurveTo(
      -this.radius * 1.2, -this.radius * 0.4,
      -this.radius * 0.8, -this.radius * 1.2,
      -this.radius * 0.3, -this.radius * 0.8
    );
    
    // Middle hair
    this.context.moveTo(0, -this.radius);
    this.context.bezierCurveTo(
      -this.radius * 0.2, -this.radius * 1.3,
      this.radius * 0.2, -this.radius * 1.3,
      0, -this.radius
    );
    
    // Right side hair
    this.context.moveTo(this.radius * 0.3, -this.radius * 0.8);
    this.context.bezierCurveTo(
      this.radius * 0.8, -this.radius * 1.2,
      this.radius * 1.2, -this.radius * 0.4,
      this.radius * 0.8, this.radius * 0.2
    );
    
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness * 0.8;
    this.context.stroke();
    this.context.closePath();
    
    // Draw a small bow
    this.drawBow();
  }
  
  /**
   * Draw a decorative bow for feminine styling
   */
  drawBow() {
    const bowX = this.radius * 0.7;
    const bowY = -this.radius * 0.5;
    const bowSize = this.radius * 0.4;
    
    // Draw bow center
    this.context.beginPath();
    this.context.arc(bowX, bowY, bowSize * 0.3, 0, Math.PI * 2);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.closePath();
    
    // Draw bow left loop
    this.context.beginPath();
    this.context.ellipse(
      bowX - bowSize * 0.6, bowY,
      bowSize * 0.7, bowSize * 0.5,
      Math.PI * 0.2, 0, Math.PI * 2
    );
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness * 0.8;
    this.context.stroke();
    this.context.closePath();
    
    // Draw bow right loop
    this.context.beginPath();
    this.context.ellipse(
      bowX + bowSize * 0.6, bowY,
      bowSize * 0.7, bowSize * 0.5,
      -Math.PI * 0.2, 0, Math.PI * 2
    );
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness * 0.8;
    this.context.stroke();
    this.context.closePath();
    
    // Draw bow ribbons
    this.context.beginPath();
    // Left ribbon
    this.context.moveTo(bowX - bowSize * 0.3, bowY + bowSize * 0.2);
    this.context.quadraticCurveTo(
      bowX - bowSize * 0.7, bowY + bowSize * 0.7,
      bowX - bowSize * 0.5, bowY + bowSize
    );
    
    // Right ribbon
    this.context.moveTo(bowX + bowSize * 0.3, bowY + bowSize * 0.2);
    this.context.quadraticCurveTo(
      bowX + bowSize * 0.7, bowY + bowSize * 0.7,
      bowX + bowSize * 0.5, bowY + bowSize
    );
    
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness * 0.8;
    this.context.stroke();
    this.context.closePath();
  }
  
  /**
   * Update head-specific configuration
   * @param {Object} config - New configuration properties
   */
  updateConfig(config = {}) {
    super.updateConfig(config);
    if (config.radius !== undefined) this.radius = config.radius;
  }
}

export default Head;