import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * Flower decoration component
 * @extends Component
 */
class Flower extends Component {
  /**
   * Create a new Flower component
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position (relative to the ground tile)
   * @param {number} config.y - Y position (vertical offset for petals and center)
   * @param {number} config.size - Flower size
   * @param {string} config.color - Flower color
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the flower component
   */
  initialize() {
    const { config } = this;
    
    this.x = config.x;
    this.y = config.y;
    this.size = config.size;
    
    // If no color is provided, randomly select from the palette
    if (!config.color) {
      const colors = ColorPalette.flowers;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      this.color = config.color;
    }
  }

  /**
   * Draw the flower
   * @param {number} xOffset - Horizontal offset for position
   * @param {number} baseY - Base Y coordinate (ground level)
   */
  draw(xOffset = 0, baseY = 0) {
    const { context, x, y, size, color } = this;
    
    // Draw stem
    DrawingUtils.line(
      context,
      xOffset + x,
      baseY,
      xOffset + x,
      baseY + size,
      "#A9DE9F",
      1
    );
    
    // Draw petals
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = xOffset + x + Math.cos(angle) * size;
      const petalY = baseY + y + Math.sin(angle) * size;
      
      DrawingUtils.circle(context, petalX, petalY, size * 0.7, color);
    }
    
    // Draw center
    DrawingUtils.circle(context, xOffset + x, baseY + y, size * 0.5, "#FFEB85");
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Update flower properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} size - New size
   */
  updateProperties(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }
}

export default Flower;