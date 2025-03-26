/**
 * Ground.js - Manages the ground with grass, dirt, and decorations
 * Uses modular components: GrassBlade, Flower, and Butterfly
 */
import GrassBlade from './GrassBlade.js';
import Flower from './Flower.js';
import Butterfly from './Butterfly.js';

class BaseGround {
  constructor(context, x, y, height, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.context = context;
  }
}

class SubGround extends BaseGround {
  constructor(context, x, y, height, width, color) {
    super(context, x, y, height, width);
    this.color = color;
  }

  draw() {
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.width, this.height);
    this.context.closePath();
  }
}

class Ground extends BaseGround {
  constructor(context, x, y, height, width) {
    super(context, x, y, height, width);
    
    // Proportions
    this.grassHeight = this.height * 0.3;
    this.dirtHeight = this.height - this.grassHeight;
    
    // Colors with a feminine touch
    this.grassColors = ["#A9DE9F", "#B9E4AA", "#C9EBB5"];
    this.dirtColors = ["#D9BFA9", "#E3CAB1", "#F0DDCA"];
    
    // Create grass blades using the GrassBlade component
    this.grassBlades = GrassBlade.generateMultiple(
      0, width, 10, this.y, this.grassHeight * 0.5, this.grassColors.length
    );
    
    // Store flower colors
    this.flowerColors = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#F7C8E0"];
    
    // Tile decoration tracking
    this.lastTileIndex = -1;
    this.tileDecorations = new Map(); // Map to store decorations by tile index
  }
  
  // Generate deterministic but varied elements for a specific tile
  generateTileDecorations(tileIndex) {
    // Use the tile index as a seed for pseudo-random generation
    const seed = tileIndex * 10000;
    
    // Simple function to get a seeded random number
    const seededRandom = (offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };
    
    // Generate flowers using the Flower class
    const flowerCount = Math.floor(this.width / 100);
    const flowers = [];
    
    for (let i = 0; i < flowerCount; i++) {
      flowers.push(new Flower(
        seededRandom(i * 0.1) * this.width,
        seededRandom(i * 0.2) * (this.grassHeight * 0.8),
        3 + seededRandom(i * 0.3) * 4,
        this.flowerColors[Math.floor(seededRandom(i * 0.4) * this.flowerColors.length)]
      ));
    }
    
    // Generate butterflies using the Butterfly class
    const butterflyCount = Math.floor(this.width / 300);
    const butterflies = [];
    
    for (let i = 0; i < butterflyCount; i++) {
      butterflies.push(new Butterfly(
        seededRandom(i * 0.5) * this.width,
        seededRandom(i * 0.6) * 40,
        5 + seededRandom(i * 0.7) * 3,
        this.flowerColors[Math.floor(seededRandom(i * 0.8) * this.flowerColors.length)],
        seededRandom(i * 0.9) * Math.PI,
        0.05 + seededRandom(i + 1.0) * 0.05,
        seededRandom(i + 1.1) * Math.PI * 2,
        0.1 + seededRandom(i + 1.2) * 0.1
      ));
    }
    
    return { flowers, butterflies };
  }
  
  // Get or generate decorations for a specific tile
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
  
  // Update butterflies for a specific tile
  updateButterflies(tileIndex) {
    const decorations = this.getTileDecorations(tileIndex);
    decorations.butterflies.forEach(butterfly => butterfly.update(this.width));
  }
  
  // Draw a single ground tile at the given x offset and tile index
  drawTile(xOffset, tileIndex) {
    // Draw grass with a gradient
    const grassGradient = this.context.createLinearGradient(xOffset, this.y, xOffset, this.y + this.grassHeight);
    grassGradient.addColorStop(0, this.grassColors[0]);
    grassGradient.addColorStop(1, this.grassColors[2]);
    this.context.beginPath();
    this.context.fillStyle = grassGradient;
    this.context.fillRect(xOffset, this.y, this.width, this.grassHeight);
    this.context.closePath();
    
    // Draw dirt with a gradient
    const dirtGradient = this.context.createLinearGradient(xOffset, this.y + this.grassHeight, xOffset, this.y + this.height);
    dirtGradient.addColorStop(0, this.dirtColors[0]);
    dirtGradient.addColorStop(1, this.dirtColors[2]);
    this.context.beginPath();
    this.context.fillStyle = dirtGradient;
    this.context.fillRect(xOffset, this.y + this.grassHeight, this.width, this.dirtHeight);
    this.context.closePath();
    
    // Draw grass blade details
    this.drawGrassDetails(xOffset);
    
    // Get decorations for this specific tile
    const decorations = this.getTileDecorations(tileIndex);
    
    // Draw flowers
    this.drawFlowers(xOffset, decorations.flowers);
    
    // Draw butterflies
    this.drawButterflies(xOffset, decorations.butterflies);
  }
  
  // Draw grass blade details
  drawGrassDetails(xOffset) {
    this.grassBlades.forEach(blade => {
      blade.draw(this.context, xOffset, this.y, this.grassColors);
    });
  }
  
  // Draw flowers
  drawFlowers(xOffset, flowers) {
    flowers.forEach(flower => {
      flower.draw(this.context, xOffset, this.y);
    });
  }
  
  // Draw butterflies
  drawButterflies(xOffset, butterflies) {
    butterflies.forEach(butterfly => {
      butterfly.draw(this.context, xOffset, this.y);
    });
  }
  
  // The main draw method that handles parallax scrolling
  draw(worldOffset) {
    // Canvas reference - we need this for proper calculations
    const canvas = this.context.canvas;
    
    // Calculate the number of full tiles we've scrolled past
    const tilesPassed = Math.floor(worldOffset / this.width);
    
    // Calculate the tile offset using modulus for seamless tiling
    const offset = worldOffset % this.width;
    
    // Update dynamic elements (like butterflies) for both visible tiles
    this.updateButterflies(tilesPassed);
    this.updateButterflies(tilesPassed + 1);
    
    // Draw the first tile at the adjusted x position with its correct tile index
    this.drawTile(this.x - offset, tilesPassed);
    
    // Draw a second tile if needed to cover the full canvas width
    if ((this.x - offset + this.width) < canvas.width) {
      this.drawTile(this.x - offset + this.width, tilesPassed + 1);
    }
  }
  
  // Regenerate grass blades when canvas is resized
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.grassHeight = this.height * 0.3;
    this.dirtHeight = this.height - this.grassHeight;
    
    // Regenerate grass blades for the new width
    this.grassBlades = GrassBlade.generateMultiple(
      0, width, 10, this.y, this.grassHeight * 0.5, this.grassColors.length
    );
    
    // Clear cached decorations since dimensions have changed
    this.tileDecorations.clear();
  }
}

export default Ground;