/**
 * ShopUiRenderer.js - Utility class for common UI drawing operations
 * Ensures consistent visual styling across components
 */
class ShopUiRenderer {
    /**
     * Create a new shop UI renderer
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     */
    constructor(context) {
      this.context = context;
    }
    
    /**
     * Draw a rounded rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width of rectangle
     * @param {number} height - Height of rectangle
     * @param {number} radius - Corner radius
     */
    roundRect(ctx, x, y, width, height, radius) {
      // Ensure radius isn't too large
      const safeRadius = Math.min(radius, Math.min(width, height) / 2);
      
      ctx.moveTo(x + safeRadius, y);
      ctx.lineTo(x + width - safeRadius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
      ctx.lineTo(x + width, y + height - safeRadius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
      ctx.lineTo(x + safeRadius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
      ctx.lineTo(x, y + safeRadius);
      ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    }
    
    /**
     * Draw a standard flower icon
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} size - Icon size
     * @param {string} petalColor - Color for petals (defaults to pink)
     * @param {string} centerColor - Color for center (defaults to yellow)
     */
    drawFlower(x, y, size, petalColor = '#FF9AA2', centerColor = '#FFEB3B') {
      const { context } = this;
      const petalCount = 5;
      
      // Draw petals
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const petalX = x + Math.cos(angle) * size * 0.5;
        const petalY = y + Math.sin(angle) * size * 0.5;
        
        context.beginPath();
        context.arc(petalX, petalY, size * 0.4, 0, Math.PI * 2);
        context.fillStyle = petalColor;
        context.fill();
        context.closePath();
      }
      
      // Draw center
      context.beginPath();
      context.arc(x, y, size * 0.3, 0, Math.PI * 2);
      context.fillStyle = centerColor;
      context.fill();
      context.closePath();
    }
    
    /**
     * Draw a heart shape
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} size - Heart size
     * @param {string} color - Heart color
     */
    drawHeart(x, y, size, color) {
      const { context } = this;
      
      context.beginPath();
      context.moveTo(x, y + size * 0.3);
      
      // Left curve
      context.bezierCurveTo(
        x - size * 0.5, y - size * 0.3, 
        x - size, y + size * 0.3, 
        x, y + size
      );
      
      // Right curve
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
     * Create a gradient fill based on a base color
     * @param {number} x - X coordinate for gradient start
     * @param {number} y - Y coordinate for gradient start
     * @param {number} width - Width of gradient area
     * @param {number} height - Height of gradient area
     * @param {string} baseColor - Base color for gradient
     * @param {number} darkenAmount - Amount to darken for gradient end
     * @returns {CanvasGradient} The created gradient
     */
    createGradient(x, y, width, height, baseColor, darkenAmount = 20) {
      const gradient = this.context.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, this.darkenColor(baseColor, darkenAmount));
      return gradient;
    }
    
    /**
     * Darken a color for effects
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
      
      // Convert back to hex with padding
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Lighten a color for effects
     * @param {string} color - Hex color string
     * @param {number} percent - Amount to lighten
     * @returns {string} Lightened hex color
     */
    lightenColor(color, percent) {
      // Convert hex to RGB
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      // Lighten
      r = Math.min(255, r + percent);
      g = Math.min(255, g + percent);
      b = Math.min(255, b + percent);
      
      // Convert back to hex with padding
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  
  export default ShopUiRenderer;