import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import AnimationUtils from '../../utils/AnimationUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * Sun component that renders the sun with rays and glow
 * @extends Component
 */
class Sun extends Component {
  /**
   * Create a new Sun component
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {number} config.radius - Sun radius
   * @param {number} [config.glowRadius] - Glow radius (defaults to 1.5 * radius)
   * @param {number} [config.rays] - Number of rays
   * @param {number} [config.rayLength] - Length of each ray
   * @param {Object} [config.colors] - Sun colors
   */
  constructor(context, config) {
    super(context, config);
    this.time = 0;
  }

  /**
   * Initialize the sun component
   */
  initialize() {
    const { config } = this;
    
    this.x = config.x;
    this.y = config.y;
    this.radius = config.radius;
    this.glowRadius = config.glowRadius || this.radius * 1.5;
    this.rays = config.rays || 12;
    this.rayLength = config.rayLength || this.radius * 0.7;
    
    this.colors = config.colors || ColorPalette.sun;
  }

  /**
   * Update sun animation
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    // Scale time increment by deltaTime for consistent animation speed
    const timeIncrement = 0.01 * (deltaTime / 16.67); // 16.67ms is ~60fps
    this.time += timeIncrement;
    
    // Call super to update any children
    super.update(deltaTime);
  }

  /**
   * Draw the sun with rays and glow
   */
  draw() {
    const { context, x, y, radius, glowRadius, colors, rays, rayLength, time } = this;
    
    // Draw sun glow
    const glowGradient = DrawingUtils.createRadialGradient(
      context,
      x, y, radius * 0.5,
      x, y, glowRadius,
      [
        { offset: 0, color: colors.glow },
        { offset: 1, color: 'rgba(255, 209, 102, 0)' }
      ]
    );
    
    DrawingUtils.circle(context, x, y, glowRadius, glowGradient);
    
    // Draw sun rays
    context.save();
    context.translate(x, y);
    context.rotate(time);
    
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const innerRadius = radius * 1.1;
      const outerRadius = radius * 1.1 + rayLength;
      
      DrawingUtils.line(
        context,
        innerRadius * Math.cos(angle),
        innerRadius * Math.sin(angle),
        outerRadius * Math.cos(angle),
        outerRadius * Math.sin(angle),
        colors.main,
        3
      );
    }
    
    context.restore();
    
    // Draw sun body
    DrawingUtils.circle(context, x, y, radius, colors.main);
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Update the sun position and size
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} radius - New radius
   */
  updateProperties(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.glowRadius = radius * 1.5;
    this.rayLength = radius * 0.7;
  }
}

export default Sun;