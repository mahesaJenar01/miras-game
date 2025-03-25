import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * GrassBlade decoration component
 * @extends Component
 */
class GrassBlade extends Component {
  /**
   * Create a new GrassBlade component
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.relativeX - X position relative to offset
   * @param {number} config.controlX - Control point X for curve
   * @param {number} config.controlY - Control point Y for curve
   * @param {number} config.endX - End point X
   * @param {number} config.endY - End point Y
   * @param {number} config.strokeWidth - Line width
   * @param {number} config.colorIndex - Index into grass colors array
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the grass blade component
   */
  initialize() {
    const { config } = this;
    
    this.relativeX = config.relativeX;
    this.controlX = config.controlX;
    this.controlY = config.controlY;
    this.endX = config.endX;
    this.endY = config.endY;
    this.strokeWidth = config.strokeWidth;
    this.colorIndex = config.colorIndex;
    
    // Store colors directly from palette
    this.colors = ColorPalette.ground.grass;
  }

  /**
   * Draw the grass blade
   * @param {number} xOffset - Horizontal offset for position
   * @param {number} baseY - Base Y coordinate (ground level)
   */
  draw(xOffset = 0, baseY = 0) {
    const { context, relativeX, controlX, controlY, endX, endY, strokeWidth, colorIndex, colors } = this;
    
    DrawingUtils.quadraticCurve(
      context,
      xOffset + relativeX,
      baseY,
      xOffset + controlX,
      controlY,
      xOffset + endX,
      endY,
      colors[colorIndex],
      strokeWidth
    );
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Update grass blade properties
   * @param {number} relativeX - New relative X position
   * @param {number} height - Grass height to scale control and end points
   */
  updateProperties(relativeX, height) {
    this.relativeX = relativeX;
    
    // Scale control and end positions based on new height
    const heightRatio = height / (this.controlY - this.endY);
    this.controlY = this.controlY * heightRatio;
    this.endY = this.endY * heightRatio;
  }
  
  /**
   * Generate a random grass blade
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} x - Position along ground
   * @param {number} maxHeight - Maximum grass height
   * @returns {GrassBlade} New grass blade instance
   */
  static createRandom(context, x, maxHeight) {
    const grassDetailHeight = maxHeight * 0.2 + Math.random() * maxHeight * 0.3;
    const relativeX = x;
    const controlX = x + (Math.random() - 0.5) * 10;
    const controlY = -grassDetailHeight * 0.7;
    const endX = x + (Math.random() - 0.5) * 5;
    const endY = -grassDetailHeight;
    const strokeWidth = 1 + Math.random();
    const colorIndex = Math.floor(Math.random() * ColorPalette.ground.grass.length);
    
    return new GrassBlade(context, {
      relativeX,
      controlX,
      controlY,
      endX,
      endY,
      strokeWidth,
      colorIndex
    });
  }
}

export default GrassBlade;