import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * Cloud component that renders moving clouds
 * @extends Component
 */
class Cloud extends Component {
  /**
   * Create a new Cloud component
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {number} config.size - Cloud size
   * @param {number} [config.speed=0.1] - Cloud movement speed
   * @param {string} [config.color] - Cloud color
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the cloud component
   */
  initialize() {
    const { config } = this;
    
    this.x = config.x;
    this.y = config.y;
    this.size = config.size;
    this.speed = config.speed || 0.1;
    this.color = config.color || ColorPalette.cloud;
  }

  /**
   * Update cloud position
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    // Scale movement by deltaTime for consistent speed regardless of framerate
    const speedFactor = deltaTime / 16.67; // 16.67ms is roughly 60fps
    this.x += this.speed * speedFactor;
    
    // If cloud moves off screen, reset to the other side
    if (this.x > this.context.canvas.width + this.size * 2) {
      this.x = -this.size * 2;
    }
    
    // Call super to update any children
    super.update(deltaTime);
  }

  /**
   * Draw the cloud
   */
  draw() {
    const { context, x, y, size, color } = this;
    
    // Draw cloud as a collection of overlapping circles
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.arc(x + size * 0.8, y - size * 0.2, size * 0.8, 0, Math.PI * 2);
    context.arc(x + size * 1.5, y, size * 0.9, 0, Math.PI * 2);
    context.arc(x + size * 0.7, y + size * 0.3, size * 0.75, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Update cloud properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} size - New size
   * @param {number} speed - New speed
   */
  updateProperties(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
  }
  
  /**
   * Reset cloud position
   * @param {number} x - New X position
   */
  resetPosition(x) {
    this.x = x;
  }
}

export default Cloud;