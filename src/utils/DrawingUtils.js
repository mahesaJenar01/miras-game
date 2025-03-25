/**
 * Utility class for common drawing operations
 */
class DrawingUtils {
    /**
     * Draw a rounded rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width of rectangle
     * @param {number} height - Height of rectangle
     * @param {number} radius - Corner radius
     * @param {boolean} fill - Whether to fill the rectangle
     * @param {boolean} stroke - Whether to stroke the rectangle
     */
    static roundRect(ctx, x, y, width, height, radius, fill = false, stroke = false) {
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      if (fill) {
        ctx.fill();
      }
      
      if (stroke) {
        ctx.stroke();
      }
    }
  
    /**
     * Create a linear gradient with multiple color stops
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Starting X position
     * @param {number} y1 - Starting Y position
     * @param {number} x2 - Ending X position
     * @param {number} y2 - Ending Y position
     * @param {Array} colorStops - Array of {offset, color} objects
     * @returns {CanvasGradient} The created gradient
     */
    static createLinearGradient(ctx, x1, y1, x2, y2, colorStops) {
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      
      for (const stop of colorStops) {
        gradient.addColorStop(stop.offset, stop.color);
      }
      
      return gradient;
    }
  
    /**
     * Create a radial gradient with multiple color stops
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Starting X position
     * @param {number} y1 - Starting Y position
     * @param {number} r1 - Starting radius
     * @param {number} x2 - Ending X position
     * @param {number} y2 - Ending Y position
     * @param {number} r2 - Ending radius
     * @param {Array} colorStops - Array of {offset, color} objects
     * @returns {CanvasGradient} The created gradient
     */
    static createRadialGradient(ctx, x1, y1, r1, x2, y2, r2, colorStops) {
      const gradient = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
      
      for (const stop of colorStops) {
        gradient.addColorStop(stop.offset, stop.color);
      }
      
      return gradient;
    }
  
    /**
     * Draw a circle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Circle radius
     * @param {string|CanvasGradient} fillStyle - Fill style
     * @param {string} strokeStyle - Stroke style
     * @param {number} lineWidth - Line width
     */
    static circle(ctx, x, y, radius, fillStyle = null, strokeStyle = null, lineWidth = 1) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
      
      ctx.closePath();
    }
  
    /**
     * Draw a line
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Starting X
     * @param {number} y1 - Starting Y
     * @param {number} x2 - Ending X
     * @param {number} y2 - Ending Y
     * @param {string} strokeStyle - Stroke style
     * @param {number} lineWidth - Line width
     */
    static line(ctx, x1, y1, x2, y2, strokeStyle, lineWidth = 1) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.closePath();
    }
  
    /**
     * Draw a bezier curve
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Starting X
     * @param {number} y1 - Starting Y
     * @param {number} cp1x - First control point X
     * @param {number} cp1y - First control point Y
     * @param {number} cp2x - Second control point X
     * @param {number} cp2y - Second control point Y
     * @param {number} x2 - Ending X
     * @param {number} y2 - Ending Y
     * @param {string} strokeStyle - Stroke style
     * @param {number} lineWidth - Line width
     */
    static bezierCurve(ctx, x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, strokeStyle, lineWidth = 1) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.closePath();
    }
  
    /**
     * Draw a quadratic curve
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Starting X
     * @param {number} y1 - Starting Y
     * @param {number} cpx - Control point X
     * @param {number} cpy - Control point Y
     * @param {number} x2 - Ending X
     * @param {number} y2 - Ending Y
     * @param {string} strokeStyle - Stroke style
     * @param {number} lineWidth - Line width
     */
    static quadraticCurve(ctx, x1, y1, cpx, cpy, x2, y2, strokeStyle, lineWidth = 1) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.closePath();
    }
  
    /**
     * Adjust a color's brightness
     * @param {string} hex - Hex color code
     * @param {number} percent - Percentage to adjust brightness (-100 to 100)
     * @returns {string} Adjusted hex color
     */
    static adjustBrightness(hex, percent) {
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
  
      r = Math.max(0, Math.min(255, r + (percent * 255 / 100)));
      g = Math.max(0, Math.min(255, g + (percent * 255 / 100)));
      b = Math.max(0, Math.min(255, b + (percent * 255 / 100)));
  
      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }
  
    /**
     * Create a color with alpha transparency
     * @param {string} hex - Hex color code
     * @param {number} alpha - Alpha value (0-1)
     * @returns {string} RGBA color string
     */
    static withAlpha(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  
  export default DrawingUtils;