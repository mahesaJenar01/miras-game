/**
 * ButtonRenderer - Handles rendering of all buttons
 * Enhanced with support for disabled button states
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
    const { x, y, width, height, cornerRadius, isHovered, isPressed, isDisabled } = button;
    
    // Determine current color based on state
    let currentColor;
    
    if (button.getCurrentColor) {
      // Use button's custom getCurrentColor method if available (for disabled state)
      currentColor = button.getCurrentColor();
    } else {
      // Fallback to standard color logic
      currentColor = button.color;
      if (isPressed) {
        // Darker when pressed
        currentColor = this.darkenColor(button.color, 30);
      } else if (isHovered) {
        currentColor = button.hoverColor;
      }
      
      // Apply disabled state if button is disabled
      if (isDisabled) {
        currentColor = "#A0A0A0"; // Gray for disabled state
      }
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
      // Get appropriate decoration color (might be different for disabled state)
      const decorationColor = isDisabled ? "#777777" : undefined;
      
      button.decorations.forEach(decoration => {
        if (decoration.type === 'flower') {
          this.drawFlower(
            x + decoration.x, 
            y + decoration.y,
            decoration.size,
            decorationColor || decoration.color
          );
        } else if (decoration.type === 'arrow') {
          this.drawArrow(
            x + decoration.x,
            y + decoration.y,
            button.height * 0.25,
            decorationColor || button.textColor
          );
        } else if (decoration.type === 'upArrow') {
          this.drawUpArrow(
            x + decoration.x,
            y + decoration.y,
            button.height * 0.25,
            decorationColor || button.textColor
          );
        } else if (decoration.type === 'star') {
          this.drawStar(
            x + decoration.x,
            y + decoration.y,
            decoration.size,
            decorationColor || "#FF10F0"
          );
        } else if (decoration.type === 'heart') {
          this.drawHeart(
            x + decoration.x,
            y + decoration.y,
            decoration.size,
            decorationColor || button.textColor
          );
        }
      });
    }
    
    // Draw button text
    let textColor;
    if (button.getCurrentTextColor) {
      // Use button's custom text color getter if available
      textColor = button.getCurrentTextColor();
    } else {
      textColor = isDisabled ? "#666666" : button.textColor;
    }
    
    context.font = button.font;
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(button.text, x + width / 2, y + height / 2);
    
    // Add glow effect when hovered (but not for disabled buttons)
    if (isHovered && !isPressed && !isDisabled) {
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
    
    // Draw disabled overlay if the button is disabled
    if (isDisabled) {
      context.beginPath();
      this.roundRect(context, x, y, width, height, cornerRadius);
      context.fillStyle = "rgba(0, 0, 0, 0.1)";
      context.fill();
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
   * @param {string} color - Color of the star
   */
  drawStar(x, y, size, color) {
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
    
    context.fillStyle = color; // Use provided color
    context.fill();
  }
  
  /**
   * Draw a heart decoration
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} size - Heart size
   * @param {string} color - Heart color
   */
  drawHeart(x, y, size, color) {
    const context = this.context;
    
    // Draw heart shape
    context.beginPath();
    
    // Top left curve
    context.moveTo(x, y + size * 0.3);
    context.bezierCurveTo(
      x - size * 0.5, y - size * 0.3, 
      x - size, y + size * 0.3, 
      x, y + size
    );
    
    // Top right curve
    context.bezierCurveTo(
      x + size, y + size * 0.3, 
      x + size * 0.5, y - size * 0.3, 
      x, y + size * 0.3
    );
    
    context.fillStyle = color;
    context.fill();
    context.closePath();
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