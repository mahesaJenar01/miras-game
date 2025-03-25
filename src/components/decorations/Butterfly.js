import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import AnimationUtils from '../../utils/AnimationUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * Butterfly decoration component
 * @extends Component
 */
class Butterfly extends Component {
  /**
   * Create a new Butterfly component
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {number} config.size - Size
   * @param {string} config.wingColor - Wing color
   * @param {number} config.angle - Initial wing flap angle
   * @param {number} config.speed - Movement speed
   * @param {number} config.direction - Movement direction in radians
   * @param {number} config.flapSpeed - Wing flapping speed
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the butterfly component
   */
  initialize() {
    const { config } = this;
    
    this.x = config.x;
    this.y = config.y;
    this.size = config.size;
    
    // If no wing color is provided, randomly select from the palette
    if (!config.wingColor) {
      const colors = ColorPalette.flowers; // Reusing flower colors for butterflies
      this.wingColor = colors[Math.floor(Math.random() * colors.length)];
    } else {
      this.wingColor = config.wingColor;
    }
    
    this.angle = config.angle || 0;
    this.speed = config.speed || 0.1;
    this.direction = config.direction || 0;
    this.flapSpeed = config.flapSpeed || 0.1;
  }

  /**
   * Update butterfly position and animation
   * @param {number} deltaTime - Time elapsed since last update
   * @param {number} width - Width of movement area
   */
  update(deltaTime, width) {
    // Scale movement by deltaTime for consistent speed regardless of framerate
    const timeScale = deltaTime / 16.67; // 16.67ms is roughly 60fps
    
    // Update position based on direction and speed
    this.x += Math.cos(this.direction) * this.speed * timeScale;
    this.y += Math.sin(this.direction) * this.speed * timeScale;
    
    // Occasionally change direction
    if (Math.random() < 0.01 * timeScale) {
      this.direction += (Math.random() - 0.5) * Math.PI / 4;
    }
    
    // Update wing flap angle
    this.angle += this.flapSpeed * timeScale;
    
    // Keep the butterfly within bounds
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.y > 40) this.y = 40;
    
    // Call super to update any children
    super.update(deltaTime);
  }

  /**
   * Draw the butterfly
   * @param {number} xOffset - Horizontal offset for position
   * @param {number} baseY - Base Y coordinate (ground level)
   */
  draw(xOffset = 0, baseY = 0) {
    const { context, x, y, size, wingColor, angle } = this;
    
    context.save();
    // Adjust vertical position relative to the ground
    context.translate(xOffset + x, baseY - 10 + y);
    
    // Draw left wing
    const wingSpan = size * 2 * Math.abs(Math.sin(angle));
    context.beginPath();
    context.ellipse(-size * 0.5, 0, wingSpan, size, Math.PI * 0.25, 0, Math.PI * 2);
    context.fillStyle = wingColor;
    context.fill();
    context.closePath();
    
    // Draw right wing
    context.beginPath();
    context.ellipse(size * 0.5, 0, wingSpan, size, -Math.PI * 0.25, 0, Math.PI * 2);
    context.fillStyle = wingColor;
    context.fill();
    context.closePath();
    
    // Draw body
    context.beginPath();
    context.ellipse(0, 0, size * 0.2, size * 0.8, 0, 0, Math.PI * 2);
    context.fillStyle = "#333";
    context.fill();
    context.closePath();
    
    context.restore();
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Update butterfly properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} size - New size
   * @param {number} speed - New movement speed
   */
  updateProperties(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
  }
  
  /**
   * Create a butterfly with seeded random parameters
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} tileIndex - Tile index for seeded randomness
   * @param {number} index - Butterfly index within the tile
   * @param {number} width - Width of movement area
   * @returns {Butterfly} New butterfly instance
   */
  static createSeeded(context, tileIndex, index, width) {
    // Use the tile index and butterfly index as seeds for pseudo-random generation
    const seed = tileIndex * 10000 + index * 100;
    
    // Simple function to get a seeded random number
    const seededRandom = (offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };
    
    // Select a color from the palette using seeded random
    const colors = ColorPalette.flowers;
    const colorIndex = Math.floor(seededRandom(index * 0.8) * colors.length);
    
    return new Butterfly(context, {
      x: seededRandom(index * 0.5) * width,
      y: seededRandom(index * 0.6) * 40,
      size: 5 + seededRandom(index * 0.7) * 3,
      wingColor: colors[colorIndex],
      angle: seededRandom(index * 0.9) * Math.PI,
      speed: 0.05 + seededRandom(index + 1.0) * 0.05,
      direction: seededRandom(index + 1.1) * Math.PI * 2,
      flapSpeed: 0.1 + seededRandom(index + 1.2) * 0.1
    });
  }
}

export default Butterfly;