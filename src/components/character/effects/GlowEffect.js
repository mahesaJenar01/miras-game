/**
 * GlowEffect.js - Handles various glow effects for characters and accessories
 * Creates visual glows with configurable appearance
 */
class GlowEffect {
    /**
     * Create a new glow effect
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     */
    constructor(context) {
      this.context = context;
      this.color = 'rgba(255, 255, 255, 0.5)';
      this.radius = 20;
      this.blur = 15;
      this.intensity = 1.0;
    }
    
    /**
     * Configure the glow effect
     * @param {Object} config - Configuration object
     * @returns {GlowEffect} This GlowEffect for chaining
     */
    configure(config = {}) {
      if (config.color !== undefined) this.color = config.color;
      if (config.radius !== undefined) this.radius = config.radius;
      if (config.blur !== undefined) this.blur = config.blur;
      if (config.intensity !== undefined) this.intensity = config.intensity;
      return this;
    }
    
    /**
     * Draw a circular glow
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {Object} options - Optional override configuration
     */
    drawCircular(x, y, options = {}) {
      // Apply configuration overrides
      const config = { ...this, ...options };
      
      const { context, color, radius, intensity } = config;
      
      // Save the current context state
      context.save();
      
      // Create a radial gradient for the glow
      const gradient = context.createRadialGradient(
        x, y, radius * 0.1,  // Inner circle
        x, y, radius         // Outer circle
      );
      
      // Parse the color to extract components for the gradient
      let baseColor = color;
      let alpha = 0.5;
      
      if (color.startsWith('rgba')) {
        const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (parts) {
          const [, r, g, b, a] = parts;
          baseColor = `rgb(${r}, ${g}, ${b})`;
          alpha = parseFloat(a);
        }
      }
      
      // Create the gradient stops
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
      
      // Apply the glow
      context.globalAlpha = intensity;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();
      context.closePath();
      
      // Restore the context state
      context.restore();
      
      return this;
    }
    
    /**
     * Draw a directional glow (like behind a moving object)
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} angle - Direction angle in radians
     * @param {number} length - Length of the glow trail
     * @param {Object} options - Optional override configuration
     */
    drawDirectional(x, y, angle, length, options = {}) {
      // Apply configuration overrides
      const config = { ...this, ...options };
      
      const { context, color, radius, intensity } = config;
      
      // Save the current context state
      context.save();
      
      // Calculate the end point of the glow trail
      const endX = x - Math.cos(angle) * length;
      const endY = y - Math.sin(angle) * length;
      
      // Create a linear gradient for the trail
      const gradient = context.createLinearGradient(x, y, endX, endY);
      
      // Create the gradient stops
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
      
      // Apply the transform for the glow direction
      context.translate(x, y);
      context.rotate(angle);
      context.translate(-x, -y);
      
      // Draw the glow trail
      context.globalAlpha = intensity;
      context.beginPath();
      context.moveTo(x, y - radius);
      
      // Draw a teardrop shape
      context.quadraticCurveTo(
        x + radius * 2, y,
        x, y + radius
      );
      context.quadraticCurveTo(
        endX, y,
        x, y - radius
      );
      
      context.fillStyle = gradient;
      context.fill();
      context.closePath();
      
      // Restore the context state
      context.restore();
      
      return this;
    }
    
    /**
     * Draw a pulsing glow that changes size
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} time - Current time value for animation
     * @param {number} frequency - Pulse frequency
     * @param {number} amplitude - Size change amplitude
     * @param {Object} options - Optional override configuration
     */
    drawPulsing(x, y, time, frequency = 0.1, amplitude = 0.3, options = {}) {
      // Apply configuration overrides
      const config = { ...this, ...options };
      
      // Calculate the current pulse size
      const pulseModifier = 1 + Math.sin(time * frequency) * amplitude;
      
      // Draw with the modified radius
      return this.drawCircular(x, y, {
        ...config,
        radius: config.radius * pulseModifier
      });
    }
    
    /**
     * Draw a glow along a path
     * @param {Array} points - Array of {x, y} points defining the path
     * @param {Object} options - Optional override configuration
     */
    drawPath(points, options = {}) {
      if (!points || points.length < 2) return this;
      
      // Apply configuration overrides
      const config = { ...this, ...options };
      
      const { context, color, radius, intensity } = config;
      
      // Save the current context state
      context.save();
      
      // Create path from points
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
      }
      
      // Set line properties
      context.lineWidth = radius * 2;
      context.strokeStyle = color;
      context.globalAlpha = intensity;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      // Draw the glow
      context.stroke();
      context.closePath();
      
      // Restore the context state
      context.restore();
      
      return this;
    }
    
    /**
     * Draw a glow for a weapon swing
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} endX - Ending X position
     * @param {number} endY - Ending Y position
     * @param {number} width - Width of the glow
     * @param {Object} options - Optional override configuration
     */
    drawSwing(startX, startY, endX, endY, width, options = {}) {
      // Apply configuration overrides
      const config = { ...this, ...options };
      
      const { context, color, intensity } = config;
      
      // Save the current context state
      context.save();
      
      // Begin drawing the swing
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.strokeStyle = color;
      context.lineWidth = width;
      context.globalAlpha = intensity;
      context.lineCap = 'round';
      context.stroke();
      context.closePath();
      
      // Restore the context state
      context.restore();
      
      return this;
    }
  }
  
  export default GlowEffect;