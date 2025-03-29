/**
 * TulipFlower.js - A tulip flower collectible
 * Extends the base Collectible class with tulip-specific rendering
 */
import Collectible from './Collectible.js';

class TulipFlower extends Collectible {
  /**
   * Create a new tulip flower collectible
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - X position in world coordinates
   * @param {number} y - Y position in world coordinates
   */
  constructor(context, x, y) {
    // Call parent constructor with tulip-specific size
    const width = 30;  // Increase hitbox width (was 20)
    const height = 40; // Increase hitbox height (was 30)
    super(context, x, y, width, height);
    
    // Tulip-specific properties
    this.petalColor = this.getRandomPetalColor();
    this.stemColor = "#A9DE9F"; // Light green stem
    this.swayAngle = 0;
    this.swaySpeed = 0.02 + Math.random() * 0.02;
    this.swayAmount = 0.1 + Math.random() * 0.1;
    
    // Make hitbox more accurate by positioning it better
    this.updateHitbox();
  }  
  
  /**
   * Get a random petal color from a predefined list
   * @returns {string} A random color in hex format
   */
  getRandomPetalColor() {
    const colors = [
      "#FF9AA2", // Light pink
      "#FFB7B2", // Salmon pink
      "#FFDAC1", // Light peach
      "#E2F0CB", // Light yellow-green
      "#B5EAD7", // Mint green
      "#C7CEEA", // Light blue
      "#F7C8E0"  // Light magenta
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  /**
   * Update the tulip
   * @returns {boolean} True if the tulip is still active
   */
  update() {
    // Update collection animation if collected
    if (this.isCollected) {
      super.update();
      return this.isActive;
    }
    
    // Update swaying animation
    this.swayAngle += this.swaySpeed;
    
    // Call parent update method
    return super.update();
  }
  
  /**
   * Draw the tulip flower
   * @param {number} worldOffset - Current world offset for positioning
   */
  draw(worldOffset) {
    if (!this.isActive) return;
    
    const screenX = this.x - worldOffset;
    let yOffset = 0;
    let alpha = 1;
    
    // Apply collection animation if collected
    if (this.isCollected) {
      // Move up and fade out
      const progress = this.collectionAnimationProgress / this.collectionAnimationDuration;
      yOffset = -progress * 30; // Move up by 30 pixels
      alpha = 1 - progress;     // Fade out
    }
    
    // Calculate sway offset
    const swayOffset = Math.sin(this.swayAngle) * this.swayAmount * 10;
    
    // Save context state
    this.context.save();
    
    // Apply opacity for collection animation
    this.context.globalAlpha = alpha;
    
    // Draw stem
    const stemHeight = 25;
    const stemWidth = 2;
    
    this.context.beginPath();
    this.context.moveTo(screenX, this.y + yOffset + stemHeight / 2);
    this.context.quadraticCurveTo(
      screenX + swayOffset, 
      this.y + yOffset,
      screenX, 
      this.y + yOffset - stemHeight / 2
    );
    this.context.strokeStyle = this.stemColor;
    this.context.lineWidth = stemWidth;
    this.context.stroke();
    this.context.closePath();
    
    // Draw tulip petals (stylized tulip shape)
    this.context.beginPath();
    
    // Draw bottom of tulip bulb
    this.context.moveTo(screenX - 7, this.y + yOffset - stemHeight / 2);
    
    // Left side petal
    this.context.quadraticCurveTo(
      screenX - 10, 
      this.y + yOffset - stemHeight / 2 - 12,
      screenX, 
      this.y + yOffset - stemHeight / 2 - 18
    );
    
    // Right side petal
    this.context.quadraticCurveTo(
      screenX + 10, 
      this.y + yOffset - stemHeight / 2 - 12,
      screenX + 7, 
      this.y + yOffset - stemHeight / 2
    );
    
    // Close the shape
    this.context.closePath();
    
    // Fill with petal color
    this.context.fillStyle = this.petalColor;
    this.context.fill();
    
    // Optional: add slight outline for definition
    this.context.strokeStyle = this.darkenColor(this.petalColor, 20);
    this.context.lineWidth = 1;
    this.context.stroke();
    
    // Draw a small leaf on the stem
    this.drawLeaf(screenX, this.y + yOffset, swayOffset);
    
    // Restore context state
    this.context.restore();
    
    // Call parent draw for hitbox debugging
    super.draw(worldOffset);
  }
  
  /**
   * Draw a leaf on the tulip stem
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} swayOffset - Current sway offset
   */
  drawLeaf(x, y, swayOffset) {
    const leafSize = 6;
    const leafX = x + 2;
    const leafY = y + 5;
    
    this.context.beginPath();
    this.context.moveTo(leafX, leafY);
    
    // Draw leaf shape
    this.context.quadraticCurveTo(
      leafX + leafSize + swayOffset / 2, 
      leafY - leafSize / 2,
      leafX + leafSize * 1.5 + swayOffset, 
      leafY
    );
    
    this.context.quadraticCurveTo(
      leafX + leafSize + swayOffset / 2, 
      leafY + leafSize / 2,
      leafX, 
      leafY
    );
    
    // Fill with slightly darker green than the stem
    this.context.fillStyle = this.darkenColor(this.stemColor, 10);
    this.context.fill();
    this.context.closePath();
  }
  
  /**
   * Helper function to darken a color
   * @param {string} color - The hex color to darken
   * @param {number} percent - Amount to darken by (0-100)
   * @returns {string} Darkened hex color
   */
  darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }
  
  /**
   * Create a random tulip flower
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} minX - Minimum X position
   * @param {number} maxX - Maximum X position
   * @param {number} groundY - Ground Y position
   * @returns {TulipFlower} A new randomly positioned tulip
   */
  static createRandom(context, minX, maxX, groundY) {
    const x = minX + Math.random() * (maxX - minX);
    const y = groundY - 35; // Place slightly above ground
    
    return new TulipFlower(context, x, y);
  }
}

export default TulipFlower;