/**
 * Flower.js - Represents a decorative flower on the ground
 */
class Flower {
    /**
     * Create a new flower
     * @param {number} x - X position (relative to the ground tile)
     * @param {number} y - Y position (vertical offset from ground)
     * @param {number} size - Size of the flower
     * @param {string} color - Color of the flower petals
     */
    constructor(x, y, size, color) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.petalCount = 5;
      this.centerColor = "#FFEB85"; // Yellow center
      this.stemColor = "#A9DE9F"; // Light green stem
    }
    
    /**
     * Draw the flower
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} xOffset - X position offset (for parallax)
     * @param {number} baseY - Base Y position (ground top)
     */
    draw(context, xOffset, baseY) {
      // Draw stem
      context.beginPath();
      context.moveTo(xOffset + this.x, baseY);
      context.lineTo(xOffset + this.x, baseY + this.size);
      context.strokeStyle = this.stemColor;
      context.lineWidth = 1;
      context.stroke();
      context.closePath();
      
      // Draw petals
      for (let i = 0; i < this.petalCount; i++) {
        const angle = (i / this.petalCount) * Math.PI * 2;
        const petalX = xOffset + this.x + Math.cos(angle) * this.size;
        const petalY = baseY + this.y + Math.sin(angle) * this.size;
        
        context.beginPath();
        context.arc(petalX, petalY, this.size * 0.7, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
      }
      
      // Draw center
      context.beginPath();
      context.arc(xOffset + this.x, baseY + this.y, this.size * 0.5, 0, Math.PI * 2);
      context.fillStyle = this.centerColor;
      context.fill();
      context.closePath();
    }
    
    /**
     * Create a random flower
     * @param {number} minX - Minimum X position
     * @param {number} maxX - Maximum X position
     * @param {number} maxY - Maximum Y offset from ground
     * @param {string[]} colors - Array of possible colors
     * @param {number} minSize - Minimum size
     * @param {number} maxSize - Maximum size
     * @returns {Flower} New flower instance
     */
    static createRandom(minX, maxX, maxY, colors, minSize = 3, maxSize = 7) {
      const x = minX + Math.random() * (maxX - minX);
      const y = -Math.random() * maxY; // Negative because it's above the ground
      const size = minSize + Math.random() * (maxSize - minSize);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return new Flower(x, y, size, color);
    }
    
    /**
     * Generate multiple flowers for a region
     * @param {number} width - Width of the region
     * @param {number} count - Number of flowers to generate
     * @param {number} maxY - Maximum Y offset from ground
     * @param {string[]} colors - Array of possible colors
     * @returns {Flower[]} Array of flowers
     */
    static generateMultiple(width, count, maxY, colors) {
      const flowers = [];
      
      for (let i = 0; i < count; i++) {
        flowers.push(Flower.createRandom(0, width, maxY, colors));
      }
      
      return flowers;
    }
  }
  
  export default Flower;