import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import ColorPalette from '../../config/ColorPalette.js';
import GrassBlade from '../decorations/GrassBlade.js';
import Flower from '../decorations/Flower.js';
import Butterfly from '../decorations/Butterfly.js';

/**
 * Ground Component with tile-based system
 * @extends Component
 */
class Ground extends Component {
  /**
   * Create a new Ground component
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {number} config.height - Total ground height
   * @param {number} config.width - Ground width
   * @param {number} [config.grassHeight] - Height of grass portion
   */
  constructor(context, config) {
    super(context, config);
    this.tileDecorations = new Map(); // Map to store decorations by tile index
    this.lastTileIndex = -1; // Track the last tile index we've rendered
  }

  /**
   * Initialize the ground component
   */
  initialize() {
    const { config } = this;
    
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    
    // Calculate grass and dirt heights
    this.grassHeight = config.grassHeight || this.height * 0.3;
    this.dirtHeight = this.height - this.grassHeight;
    
    // Get colors from palette
    this.grassColors = ColorPalette.ground.grass;
    this.dirtColors = ColorPalette.ground.dirt;
    
    // Create grass blades for seamless tiling
    this.createGrassBlades();
  }

  /**
   * Create grass blade decorations
   */
  createGrassBlades() {
    this.grasses = [];
    const grassCount = Math.floor(this.width / 10);
    
    for (let i = 0; i < grassCount; i++) {
      const x = i * 10;
      const blade = GrassBlade.createRandom(this.context, x, this.grassHeight * 0.5);
      this.grasses.push(blade);
    }
  }

  /**
   * Generate deterministic decorations for a specific tile
   * @param {number} tileIndex - Tile index for seeded randomness
   * @returns {Object} Object containing flowers and butterflies for the tile
   */
  generateTileDecorations(tileIndex) {
    // Create flowers
    const flowers = [];
    const flowerCount = Math.floor(this.width / 100);
    for (let i = 0; i < flowerCount; i++) {
      const x = this.getSeededRandom(tileIndex, i * 0.1) * this.width;
      const y = this.getSeededRandom(tileIndex, i * 0.2) * (this.grassHeight * 0.8);
      const size = 3 + this.getSeededRandom(tileIndex, i * 0.3) * 4;
      
      // Get a color from the palette based on seeded random
      const colorIndex = Math.floor(this.getSeededRandom(tileIndex, i * 0.4) * ColorPalette.flowers.length);
      const color = ColorPalette.flowers[colorIndex];
      
      flowers.push(new Flower(this.context, { x, y, size, color }));
    }
    
    // Create butterflies
    const butterflies = [];
    const butterflyCount = Math.floor(this.width / 300);
    for (let i = 0; i < butterflyCount; i++) {
      butterflies.push(Butterfly.createSeeded(this.context, tileIndex, i, this.width));
    }
    
    return { flowers, butterflies };
  }
  
  /**
   * Get a seeded random number based on tile index and offset
   * @param {number} tileIndex - Tile index seed
   * @param {number} offset - Additional offset value
   * @returns {number} Pseudo-random number between 0-1
   */
  getSeededRandom(tileIndex, offset = 0) {
    const seed = tileIndex * 10000 + offset;
    return Math.abs(Math.sin(seed) * 10000 % 1);
  }

  /**
   * Get or generate decorations for a specific tile
   * @param {number} tileIndex - Tile index
   * @returns {Object} Object containing flowers and butterflies for the tile
   */
  getTileDecorations(tileIndex) {
    if (!this.tileDecorations.has(tileIndex)) {
      this.tileDecorations.set(tileIndex, this.generateTileDecorations(tileIndex));
      
      // Limit the cache size to prevent memory issues
      if (this.tileDecorations.size > 10) {
        // Remove the oldest entry (first key in the map)
        const firstKey = this.tileDecorations.keys().next().value;
        this.tileDecorations.delete(firstKey);
      }
    }
    
    return this.tileDecorations.get(tileIndex);
  }

  /**
   * Update dynamic elements like butterflies
   * @param {number} deltaTime - Time elapsed since last update
   * @param {number} worldOffset - Current world scroll offset
   */
  update(deltaTime, worldOffset) {
    // Calculate the number of full tiles we've scrolled past
    const tilesPassed = Math.floor(worldOffset / this.width);
    
    // Update butterflies for visible tiles
    this.updateButterflies(deltaTime, tilesPassed);
    this.updateButterflies(deltaTime, tilesPassed + 1);
    
    // Store last tile index for optimization
    this.lastTileIndex = tilesPassed;
    
    // Call super to update any children
    super.update(deltaTime);
  }
  
  /**
   * Update butterflies for a specific tile
   * @param {number} deltaTime - Time elapsed since last update
   * @param {number} tileIndex - Tile index
   */
  updateButterflies(deltaTime, tileIndex) {
    const decorations = this.getTileDecorations(tileIndex);
    for (const butterfly of decorations.butterflies) {
      butterfly.update(deltaTime, this.width);
    }
  }

  /**
   * Draw the ground with tiles
   * @param {number} worldOffset - Current world scroll offset
   */
  draw(worldOffset = 0) {
    // Calculate the number of full tiles we've scrolled past
    const tilesPassed = Math.floor(worldOffset / this.width);
    
    // Calculate the tile offset using modulus so the tile repeats seamlessly
    const offset = worldOffset % this.width;
    
    // Draw the first tile at the adjusted x position with its correct tile index
    this.drawTile(this.x - offset, tilesPassed);
    
    // Draw a second tile if needed to cover the full canvas width
    if ((this.x - offset + this.width) < this.context.canvas.width) {
      this.drawTile(this.x - offset + this.width, tilesPassed + 1);
    }
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Draw a single ground tile
   * @param {number} xOffset - X offset for the tile
   * @param {number} tileIndex - Tile index
   */
  drawTile(xOffset, tileIndex) {
    this.drawGroundLayers(xOffset);
    this.drawGrassDetails(xOffset);
    
    // Get decorations for this specific tile
    const decorations = this.getTileDecorations(tileIndex);
    this.drawDecorations(xOffset, decorations);
  }
  
  /**
   * Draw ground layers with gradients
   * @param {number} xOffset - X offset for drawing
   */
  drawGroundLayers(xOffset) {
    const { context, y, width, grassHeight, dirtHeight, grassColors, dirtColors } = this;
    
    // Draw grass with a gradient
    const grassGradient = DrawingUtils.createLinearGradient(
      context,
      xOffset, y,
      xOffset, y + grassHeight,
      [
        { offset: 0, color: grassColors[0] },
        { offset: 1, color: grassColors[2] }
      ]
    );
    
    context.beginPath();
    context.fillStyle = grassGradient;
    context.fillRect(xOffset, y, width, grassHeight);
    context.closePath();
    
    // Draw dirt with a gradient
    const dirtGradient = DrawingUtils.createLinearGradient(
      context,
      xOffset, y + grassHeight,
      xOffset, y + this.height,
      [
        { offset: 0, color: dirtColors[0] },
        { offset: 1, color: dirtColors[2] }
      ]
    );
    
    context.beginPath();
    context.fillStyle = dirtGradient;
    context.fillRect(xOffset, y + grassHeight, width, dirtHeight);
    context.closePath();
  }
  
  /**
   * Draw grass blade details
   * @param {number} xOffset - X offset for drawing
   */
  drawGrassDetails(xOffset) {
    for (const grassBlade of this.grasses) {
      grassBlade.draw(xOffset, this.y);
    }
  }
  
  /**
   * Draw decorative elements (flowers, butterflies)
   * @param {number} xOffset - X offset for drawing
   * @param {Object} decorations - Object containing decoration components
   */
  drawDecorations(xOffset, decorations) {
    // Draw flowers
    for (const flower of decorations.flowers) {
      flower.draw(xOffset, this.y);
    }
    
    // Draw butterflies
    for (const butterfly of decorations.butterflies) {
      butterfly.draw(xOffset, this.y);
    }
  }
  
  /**
   * Update ground dimensions
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} width - New width
   * @param {number} height - New height
   */
  updateDimensions(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Recalculate dependent dimensions
    this.grassHeight = this.height * 0.3;
    this.dirtHeight = this.height - this.grassHeight;
    
    // Recreate grass blades for new dimensions
    this.createGrassBlades();
    
    // Clear decoration cache to regenerate with new dimensions
    this.tileDecorations.clear();
  }
}

export default Ground;