/**
 * GrassBlade.js - Represents an individual blade of grass
 */
class GrassBlade {
    /**
     * Create a new grass blade
     * @param {number} relativeX - Relative X position within ground tile
     * @param {number} controlX - Control point X for quadratic curve
     * @param {number} controlY - Control point Y for quadratic curve
     * @param {number} endX - End point X
     * @param {number} endY - End point Y
     * @param {number} strokeWidth - Width of the stroke
     * @param {number} colorIndex - Index for color selection
     */
    constructor(relativeX, controlX, controlY, endX, endY, strokeWidth, colorIndex) {
      this.relativeX = relativeX;
      this.controlX = controlX;
      this.controlY = controlY;
      this.endX = endX;
      this.endY = endY;
      this.strokeWidth = strokeWidth;
      this.colorIndex = colorIndex;
    }
    
    /**
     * Draw this blade of grass
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} xOffset - X position offset (for parallax)
     * @param {number} baseY - Base Y position (ground top)
     * @param {string[]} grassColors - Array of grass colors to choose from
     */
    draw(context, xOffset, baseY, grassColors) {
      context.beginPath();
      context.moveTo(xOffset + this.relativeX, baseY);
      context.quadraticCurveTo(
        xOffset + this.controlX, this.controlY,
        xOffset + this.endX, this.endY
      );
      context.strokeStyle = grassColors[this.colorIndex];
      context.lineWidth = this.strokeWidth;
      context.stroke();
      context.closePath();
    }
    
    /**
     * Create random grass blade based on position
     * @param {number} x - X position
     * @param {number} baseY - Base Y position (ground top)
     * @param {number} maxHeight - Maximum height of grass
     * @param {number} colorCount - Number of colors available
     * @returns {GrassBlade} New grass blade instance
     */
    static createRandom(x, baseY, maxHeight, colorCount) {
      const grassDetailHeight = maxHeight * 0.2 + Math.random() * maxHeight * 0.3;
      const relativeX = x;
      const controlX = x + (Math.random() - 0.5) * 10;
      const controlY = baseY - grassDetailHeight * 0.7;
      const endX = x + (Math.random() - 0.5) * 5;
      const endY = baseY - grassDetailHeight;
      const strokeWidth = 1 + Math.random();
      const colorIndex = Math.floor(Math.random() * colorCount);
      
      return new GrassBlade(relativeX, controlX, controlY, endX, endY, strokeWidth, colorIndex);
    }
    
    /**
     * Generate multiple grass blades for a region
     * @param {number} startX - Starting X position
     * @param {number} width - Width of the region
     * @param {number} spacing - Spacing between blades
     * @param {number} baseY - Base Y position (ground top)
     * @param {number} maxHeight - Maximum height of grass
     * @param {number} colorCount - Number of colors available
     * @returns {GrassBlade[]} Array of grass blades
     */
    static generateMultiple(startX, width, spacing, baseY, maxHeight, colorCount) {
      const blades = [];
      
      for (let x = 0; x < width; x += spacing) {
        blades.push(GrassBlade.createRandom(startX + x, baseY, maxHeight, colorCount));
      }
      
      return blades;
    }
  }
  
  export default GrassBlade;