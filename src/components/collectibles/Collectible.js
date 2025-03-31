/**
 * Collectible.js - Represents a collectible item that can be picked up
 * Handles rendering, animation and collision detection for collectibles
 * Updated to use tulip flowers instead of coins/stars/gems
 */
class Collectible {
  /**
   * Create a new collectible
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Size of the collectible
   * @param {string} type - Type of collectible ('redtulip', 'pinktulip', 'goldentulip')
   * @param {number} value - Value of the collectible (score points)
   */
  constructor(context, x, y, size = 15, type = 'redtulip', value = 1) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = type;
    this.value = value;
    this.active = true;
    
    // Animation properties
    this.rotation = 0;
    this.rotationSpeed = 0.02;  // Slower rotation for flowers
    this.bobAmount = 5;
    this.bobSpeed = 0.03;
    this.time = Math.random() * Math.PI * 2; // Random start time for bobbing
    
    // Visual properties based on type
    this.setAppearance();
  }
  
  /**
   * Set visual properties based on collectible type
   */
  setAppearance() {
    switch(this.type) {
      case 'redtulip':
        this.petalColor = '#FF5555'; // Bright red
        this.stemColor = '#4CAF50'; // Green stem
        this.centerColor = '#FFEB3B'; // Yellow center
        this.glowColor = 'rgba(255, 85, 85, 0.3)'; // Semi-transparent red
        break;
      case 'pinktulip':
        this.petalColor = '#FF9AA2'; // Light pink
        this.stemColor = '#4CAF50'; // Green stem
        this.centerColor = '#FFEB3B'; // Yellow center
        this.glowColor = 'rgba(255, 154, 162, 0.3)'; // Semi-transparent pink
        break;
      case 'goldentulip':
        this.petalColor = '#FFD700'; // Gold
        this.stemColor = '#4CAF50'; // Green stem
        this.centerColor = '#FF9800'; // Orange center
        this.glowColor = 'rgba(255, 215, 0, 0.3)'; // Semi-transparent gold
        break;
      default:
        this.petalColor = '#FF5555'; // Default to red tulip
        this.stemColor = '#4CAF50';
        this.centerColor = '#FFEB3B';
        this.glowColor = 'rgba(255, 85, 85, 0.3)';
    }
  }
  
  /**
   * Update the collectible's animation
   */
  update() {
    // Update time for animations
    this.time += 0.1;
    
    // Rotate the collectible (slightly)
    this.rotation += this.rotationSpeed;
    
    // Make the collectible bob up and down
    this.bobOffset = Math.sin(this.time * this.bobSpeed) * this.bobAmount;
  }
  
  /**
   * Draw the collectible
   */
  draw() {
    if (!this.active) return;
    
    const { context, x, y, size } = this;
    
    // Save context state
    context.save();
    
    // Apply vertical bobbing
    const drawY = y + this.bobOffset;
    
    // Apply rotation
    context.translate(x, drawY);
    context.rotate(this.rotation);
    
    // Draw glow
    context.beginPath();
    context.arc(0, 0, size * 1.2, 0, Math.PI * 2);
    context.fillStyle = this.glowColor;
    context.fill();
    context.closePath();
    
    // Draw collectible based on type
    if (this.type === 'redtulip') {
      this.drawTulip(0, 0, size, this.petalColor);
    } else if (this.type === 'pinktulip') {
      this.drawTulip(0, 0, size, this.petalColor);
    } else if (this.type === 'goldentulip') {
      this.drawTulip(0, 0, size, this.petalColor);
    }
    
    // Restore context state
    context.restore();
  }
  
  /**
   * Draw a tulip flower
   * @param {number} x - X position (relative to the translated context)
   * @param {number} y - Y position (relative to the translated context)
   * @param {number} size - Size of the tulip
   * @param {string} color - Color of the petals
   */
  drawTulip(x, y, size, color) {
    const { context } = this;
    
    // Draw stem
    context.beginPath();
    context.moveTo(x, y + size * 0.8);
    context.lineTo(x, y + size * 1.6);
    context.strokeStyle = this.stemColor;
    context.lineWidth = size * 0.15;
    context.stroke();
    context.closePath();
    
    // Draw a leaf on the stem
    context.beginPath();
    context.moveTo(x, y + size);
    context.quadraticCurveTo(
      x + size * 0.6, y + size * 0.9,
      x + size * 0.7, y + size * 1.2
    );
    context.strokeStyle = this.stemColor;
    context.lineWidth = size * 0.1;
    context.stroke();
    context.closePath();
    
    // Draw tulip base (upside down heart shape)
    context.beginPath();
    context.moveTo(x, y + size * 0.6);
    
    // Left petal curve
    context.bezierCurveTo(
      x - size * 0.6, y + size * 0.2, 
      x - size * 0.6, y - size * 0.4, 
      x, y - size * 0.2
    );
    
    // Right petal curve
    context.bezierCurveTo(
      x + size * 0.6, y - size * 0.4, 
      x + size * 0.6, y + size * 0.2, 
      x, y + size * 0.6
    );
    
    context.fillStyle = color;
    context.fill();
    context.closePath();
    
    // Draw tulip center
    context.beginPath();
    context.arc(x, y, size * 0.2, 0, Math.PI * 2);
    context.fillStyle = this.centerColor;
    context.fill();
    context.closePath();
  }
  
  /**
   * Check if this collectible collides with a character
   * @param {number} characterX - Character X position
   * @param {number} characterY - Character Y position
   * @param {number} characterRadius - Character collision radius
   * @returns {boolean} True if collision occurs
   */
  checkCollision(characterX, characterY, characterRadius) {
    if (!this.active) return false;
    
    // Calculate distance between centers
    const dx = this.x - characterX;
    const dy = this.y - characterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if distance is less than sum of radii
    return distance < (this.size + characterRadius);
  }
  
  /**
   * Deactivate this collectible (when collected)
   */
  collect() {
    this.active = false;
  }
}

export default Collectible;