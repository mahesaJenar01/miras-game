/**
 * Butterfly.js - Represents an animated butterfly
 */
class Butterfly {
    /**
     * Create a new butterfly
     * @param {number} x - X position (relative to the ground tile)
     * @param {number} y - Y position (vertical offset from ground)
     * @param {number} size - Size of the butterfly
     * @param {string} wingColor - Color of the wings
     * @param {number} angle - Initial wing flap angle
     * @param {number} speed - Movement speed
     * @param {number} direction - Movement direction (in radians)
     * @param {number} flapSpeed - Wing flapping speed
     */
    constructor(x, y, size, wingColor, angle, speed, direction, flapSpeed) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.wingColor = wingColor;
      this.angle = angle;
      this.speed = speed;
      this.direction = direction;
      this.flapSpeed = flapSpeed;
      this.bodyColor = "#333"; // Dark body color
    }
    
    /**
     * Update butterfly position and animation
     * @param {number} width - Boundary width
     */
    update(width) {
      // Update position based on direction and speed
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;
      
      // Occasionally change direction
      if (Math.random() < 0.01) {
        this.direction += (Math.random() - 0.5) * Math.PI / 4;
      }
      
      // Update wing flap angle
      this.angle += this.flapSpeed;
      
      // Keep the butterfly within bounds
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = 0;
      if (this.y > 40) this.y = 40;
    }
    
    /**
     * Draw the butterfly
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} xOffset - X position offset (for parallax)
     * @param {number} baseY - Base Y position (ground top)
     */
    draw(context, xOffset, baseY) {
      context.save();
      
      // Adjust vertical position relative to the ground (subtracting to move upward)
      context.translate(xOffset + this.x, baseY - 10 + this.y);
      
      // Draw left wing
      const wingSpan = this.size * 2 * Math.abs(Math.sin(this.angle));
      context.beginPath();
      context.ellipse(-this.size * 0.5, 0, wingSpan, this.size, Math.PI * 0.25, 0, Math.PI * 2);
      context.fillStyle = this.wingColor;
      context.fill();
      context.closePath();
      
      // Draw right wing
      context.beginPath();
      context.ellipse(this.size * 0.5, 0, wingSpan, this.size, -Math.PI * 0.25, 0, Math.PI * 2);
      context.fillStyle = this.wingColor;
      context.fill();
      context.closePath();
      
      // Draw body
      context.beginPath();
      context.ellipse(0, 0, this.size * 0.2, this.size * 0.8, 0, 0, Math.PI * 2);
      context.fillStyle = this.bodyColor;
      context.fill();
      context.closePath();
      
      context.restore();
    }
    
    /**
     * Create a random butterfly
     * @param {number} width - Width of the region
     * @param {string[]} colors - Array of possible colors
     * @returns {Butterfly} New butterfly instance
     */
    static createRandom(width, colors) {
      const x = Math.random() * width;
      const y = Math.random() * 40; // Height above ground
      const size = 5 + Math.random() * 3;
      const wingColor = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI;
      const speed = 0.05 + Math.random() * 0.05;
      const direction = Math.random() * Math.PI * 2;
      const flapSpeed = 0.1 + Math.random() * 0.1;
      
      return new Butterfly(x, y, size, wingColor, angle, speed, direction, flapSpeed);
    }
    
    /**
     * Generate multiple butterflies for a region
     * @param {number} width - Width of the region
     * @param {number} count - Number of butterflies to generate
     * @param {string[]} colors - Array of possible colors
     * @returns {Butterfly[]} Array of butterflies
     */
    static generateMultiple(width, count, colors) {
      const butterflies = [];
      
      for (let i = 0; i < count; i++) {
        butterflies.push(Butterfly.createRandom(width, colors));
      }
      
      return butterflies;
    }
  }
  
  export default Butterfly;