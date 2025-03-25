/**
 * ButtonRenderer - Handles rendering of all buttons
 * Keeps drawing logic separated from button behavior
 */
export default class ButtonRenderer {
    /**
     * Create a new button renderer
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {Object} buttons - Object containing all button instances
     */
    constructor(context, buttons) {
      this.context = context;
      this.buttons = buttons;
    }
    
    /**
     * Draw all buttons
     */
    draw() {
      Object.values(this.buttons).forEach(button => {
        this.drawButton(button);
      });
    }
    
    /**
     * Draw a single button
     * @param {BaseButton} button - The button to draw
     */
    drawButton(button) {
      const { context } = this;
      const { x, y, width, height, cornerRadius, isHovered, isPressed } = button;
      
      // Determine current color based on state
      let currentColor = button.color;
      if (isPressed) {
        // Darker when pressed
        currentColor = this.darkenColor(button.color, 30);
      } else if (isHovered) {
        currentColor = button.hoverColor;
      }
      
      // Create gradient
      const gradient = context.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, currentColor);
      gradient.addColorStop(1, this.darkenColor(currentColor, 10));
      
      // Draw button shadow
      context.beginPath();
      this.roundRect(context, x + 2, y + 2, width, height, cornerRadius);
      context.fillStyle = "rgba(0, 0, 0, 0.2)";
      context.fill();
      context.closePath();
      
      // Draw button body
      context.beginPath();
      this.roundRect(context, x, y, width, height, cornerRadius);
      context.fillStyle = gradient;
      context.fill();
      
      // Add subtle border
      context.strokeStyle = this.darkenColor(currentColor, 15);
      context.lineWidth = 1;
      context.stroke();
      context.closePath();
      
      // Draw decorations
      if (button.decorations) {
        button.decorations.forEach(decoration => {
          if (decoration.type === 'flower') {
            this.drawFlower(
              x + decoration.x, 
              y + decoration.y,
              decoration.size,
              decoration.color
            );
          } else if (decoration.type === 'arrow') {
            this.drawArrow(
              x + decoration.x,
              y + decoration.y,
              button.height * 0.25,
              button.textColor
            );
          } else if (decoration.type === 'upArrow') {
            this.drawUpArrow(
              x + decoration.x,
              y + decoration.y,
              button.height * 0.25,
              button.textColor
            );
          } else if (decoration.type === 'star') {
            this.drawStar(
              x + decoration.x,
              y + decoration.y,
              decoration.size
            );
          }
        });
      }
      
      // Draw button text
      context.font = button.font;
      context.fillStyle = button.textColor;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(button.text, x + width / 2, y + height / 2);
      
      // Add glow effect when hovered
      if (isHovered && !isPressed) {
        const scale = 1.03;
        const glowX = x - (width * (scale - 1) / 2);
        const glowY = y - (height * (scale - 1) / 2);
        const glowWidth = width * scale;
        const glowHeight = height * scale;
        
        context.beginPath();
        this.roundRect(context, glowX, glowY, glowWidth, glowHeight, cornerRadius + 2);
        context.strokeStyle = button.hoverColor;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
      }
      
      // Draw cooldown overlay for attack button
      if (button.cooldownPercent > 0) {
        context.beginPath();
        this.roundRect(
          context,
          x,
          y + height * (1 - button.cooldownPercent),
          width,
          height * button.cooldownPercent,
          // Only use rounded corners at the bottom when cooldown is ending
          button.cooldownPercent < 0.5 ? cornerRadius : 0
        );
        context.fillStyle = "rgba(0, 0, 0, 0.3)";
        context.fill();
        context.closePath();
      }
      
      // Add special glow effect when the attack button is in "attacking" state
      if (button.isAttacking) {
        context.beginPath();
        this.roundRect(context, x - 5, y - 5, width + 10, height + 10, cornerRadius + 5);
        context.strokeStyle = "#FF10F0"; // Bright pink during attack
        context.lineWidth = 3;
        context.stroke();
        context.closePath();
        
        // Add second glow layer
        context.beginPath();
        this.roundRect(context, x - 10, y - 10, width + 20, height + 20, cornerRadius + 10);
        context.strokeStyle = "rgba(255, 16, 240, 0.5)"; // Semi-transparent pink
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
      }
    }
    
    /**
     * Draw a decorative flower
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Size of the flower
     * @param {string} color - Color of the flower petals
     */
    drawFlower(x, y, size, color) {
      const context = this.context;
      const petalCount = 5;
      
      // Draw petals
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const petalX = x + Math.cos(angle) * size;
        const petalY = y + Math.sin(angle) * size;
        
        context.beginPath();
        context.arc(petalX, petalY, size * 0.7, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.closePath();
      }
      
      // Draw center
      context.beginPath();
      context.arc(x, y, size * 0.5, 0, Math.PI * 2);
      context.fillStyle = "#FFEB85"; // Yellow center
      context.fill();
      context.closePath();
    }
    
    /**
     * Draw an arrow pointing right
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Size of the arrow
     * @param {string} color - Color of the arrow
     */
    drawArrow(x, y, size, color) {
      const context = this.context;
      
      context.beginPath();
      context.moveTo(x - size, y);
      context.lineTo(x, y - size / 2);
      context.lineTo(x, y + size / 2);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    }
    
    /**
     * Draw an arrow pointing up
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Size of the arrow
     * @param {string} color - Color of the arrow
     */
    drawUpArrow(x, y, size, color) {
      const context = this.context;
      
      context.beginPath();
      context.moveTo(x, y - size);
      context.lineTo(x - size / 2, y);
      context.lineTo(x + size / 2, y);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    }
    
    /**
     * Draw a star
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Size of the star
     */
    drawStar(x, y, size) {
      const context = this.context;
      const points = 5;
      const outerRadius = size;
      const innerRadius = size / 2;
      
      context.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (points * 2)) * Math.PI * 2;
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        
        if (i === 0) {
          context.moveTo(pointX, pointY);
        } else {
          context.lineTo(pointX, pointY);
        }
      }
      context.closePath();
      
      context.fillStyle = "#FF10F0"; // Match the sword color
      context.fill();
    }
    
    /**
     * Helper function to draw rounded rectangles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width of rectangle
     * @param {number} height - Height of rectangle
     * @param {number} radius - Corner radius
     */
    roundRect(ctx, x, y, width, height, radius) {
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    
    /**
     * Helper function to darken a color for effects
     * @param {string} color - Hex color string
     * @param {number} percent - Amount to darken
     * @returns {string} Darkened hex color
     */
    darkenColor(color, percent) {
      // Convert hex to RGB
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      // Darken
      r = Math.max(0, r - percent);
      g = Math.max(0, g - percent);
      b = Math.max(0, b - percent);
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }