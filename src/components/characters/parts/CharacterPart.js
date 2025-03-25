import Component from '../../base/Component.js';
import DrawingUtils from '../../../utils/DrawingUtils.js';

/**
 * Base class for all character parts
 * @extends Component
 */
class CharacterPart extends Component {
  /**
   * Create a new character part
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {string} config.color - Part color
   * @param {number} config.thickness - Line thickness
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the character part
   */
  initialize() {
    const { config } = this;
    
    this.x = config.x;
    this.y = config.y;
    this.color = config.color;
    this.thickness = config.thickness || 2;
    this.hasFeminineFeatures = config.hasFeminineFeatures !== undefined ? 
                               config.hasFeminineFeatures : true;
  }

  /**
   * Draw the part (static version - to be overridden)
   */
  draw() {
    // Implement in subclass
    super.draw();
  }

  /**
   * Update part position
   * @param {number} x - New X position
   * @param {number} y - New Y position
   */
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  /**
   * Update part appearance
   * @param {string} color - New color
   * @param {number} thickness - New thickness
   */
  updateAppearance(color, thickness) {
    this.color = color;
    this.thickness = thickness;
  }
  
  /**
   * Toggle feminine features
   * @param {boolean} enabled - Whether feminine features should be enabled
   */
  setFeminineFeatures(enabled) {
    this.hasFeminineFeatures = enabled;
  }
}

export default CharacterPart;