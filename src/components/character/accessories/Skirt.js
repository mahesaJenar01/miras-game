/**
 * Skirt.js - A feminine skirt accessory for the StickFigure
 * Draws a simple A-line skirt with transparency
 */
class Skirt {
    /**
     * Create a new skirt accessory
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {Character} character - The character wearing the skirt
     */
    constructor(context, character) {
      this.context = context;
      this.character = character;
      this.color = character.config.color;
      this.opacity = 0.2; // Semi-transparent
    }
    
    /**
     * Draw the skirt
     */
    draw() {
      // Get character properties
      const { x, y, config } = this.character;
      const radius = config.radius;
      const bodyLength = config.bodyLength;
      
      // Calculate position (at hip level, where legs start)
      const legsPosition = y + radius + (bodyLength * config.legsRatio);
      
      // Draw a simple skirt
      this.drawSkirt(legsPosition);
    }
    
    /**
     * Draw a simple A-line skirt
     * @param {number} legsPosition - Y position where legs connect
     */
    drawSkirt(legsPosition) {
      const { x } = this.character;
      const radius = this.character.config.radius;
      
      // Skirt dimensions
      const skirtTop = legsPosition - radius * 0.5;
      const skirtWidth = radius * 1.5;
      const skirtLength = radius * 1.2;
      
      // Save context state
      this.context.save();
      
      // Draw a simple A-line skirt
      this.context.beginPath();
      
      // Draw skirt outline
      this.context.moveTo(x - skirtWidth * 0.4, skirtTop);
      
      // Left side of skirt with a slight curve
      this.context.quadraticCurveTo(
        x - skirtWidth * 0.8, skirtTop + skirtLength * 0.5,
        x - skirtWidth, skirtTop + skirtLength
      );
      
      // Bottom of skirt with a slight curve
      this.context.quadraticCurveTo(
        x, skirtTop + skirtLength * 1.1,
        x + skirtWidth, skirtTop + skirtLength
      );
      
      // Right side of skirt with a slight curve
      this.context.quadraticCurveTo(
        x + skirtWidth * 0.8, skirtTop + skirtLength * 0.5,
        x + skirtWidth * 0.4, skirtTop
      );
      
      // Close the path
      this.context.closePath();
      
      // Fill with a semi-transparent version of the main color
      let skirtColor = this.color;
      
      // Check if the color is a hex color, and if so, convert it to rgba
      if (skirtColor.startsWith('#')) {
        // Convert hex to rgb
        const r = parseInt(skirtColor.slice(1, 3), 16);
        const g = parseInt(skirtColor.slice(3, 5), 16);
        const b = parseInt(skirtColor.slice(5, 7), 16);
        skirtColor = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
      } else if (skirtColor.startsWith('rgb(')) {
        // Convert rgb to rgba
        skirtColor = skirtColor.replace('rgb(', 'rgba(').replace(')', `, ${this.opacity})`);
      } else if (skirtColor.startsWith('rgba(')) {
        // Just update the alpha value
        skirtColor = skirtColor.replace(/[\d.]+\)$/, `${this.opacity})`);
      }
      
      this.context.fillStyle = skirtColor;
      this.context.fill();
      
      // Add a border
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.character.config.tickness * 0.7;
      this.context.stroke();
      
      // Restore context state
      this.context.restore();
    }
    
    /**
     * Update position if character moves
     * No explicit update needed as we calculate position based on character in draw()
     */
    updatePosition() {
      // Position is calculated dynamically in draw method
    }
  }
  
  export default Skirt;