import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * Sky component that renders the gradient background
 * @extends Component
 */
class Sky extends Component {
  /**
   * Create a new Sky component
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.width - Sky width
   * @param {number} config.height - Sky height
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the sky component
   */
  initialize() {
    const { config } = this;
    this.width = config.width || this.context.canvas.width;
    this.height = config.height || this.context.canvas.height;
    this.colors = config.colors || ColorPalette.sky;
  }

  /**
   * Draw the sky gradient
   */
  draw() {
    const { context, width, height, colors } = this;
    
    const colorStops = [
      { offset: 0, color: colors.top },
      { offset: 0.5, color: colors.middle },
      { offset: 1, color: colors.bottom }
    ];
    
    const gradient = DrawingUtils.createLinearGradient(
      context, 0, 0, 0, height * 0.8, colorStops
    );
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height * 0.8);
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Update the sky dimensions
   * @param {number} width - New width
   * @param {number} height - New height
   */
  updateDimensions(width, height) {
    this.width = width;
    this.height = height;
  }
}

export default Sky;