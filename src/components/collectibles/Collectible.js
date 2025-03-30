/**
 * Collectible.js - Represents a collectible item that can be picked up
 * Handles rendering, animation and collision detection for collectibles
 */
class Collectible {
    /**
     * Create a new collectible
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size of the collectible
     * @param {string} type - Type of collectible ('coin', 'star', etc.)
     * @param {number} value - Value of the collectible (score points)
     */
    constructor(context, x, y, size = 15, type = 'coin', value = 1) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.size = size;
      this.type = type;
      this.value = value;
      this.active = true;
      
      // Animation properties
      this.rotation = 0;
      this.rotationSpeed = 0.05;
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
        case 'coin':
          this.color = '#FFD700'; // Gold
          this.outlineColor = '#B8860B'; // Dark goldenrod
          this.glowColor = 'rgba(255, 215, 0, 0.5)'; // Semi-transparent gold
          break;
        case 'star':
          this.color = '#FF9AA2'; // Light pink
          this.outlineColor = '#FF6B6B'; // Darker pink
          this.glowColor = 'rgba(255, 154, 162, 0.5)'; // Semi-transparent pink
          break;
        case 'gem':
          this.color = '#B5EAD7'; // Mint green
          this.outlineColor = '#82C9AF'; // Darker green
          this.glowColor = 'rgba(181, 234, 215, 0.5)'; // Semi-transparent green
          break;
        default:
          this.color = '#FFD700'; // Default to gold
          this.outlineColor = '#B8860B';
          this.glowColor = 'rgba(255, 215, 0, 0.5)';
      }
    }
    
    /**
     * Update the collectible's animation
     */
    update() {
      // Update time for animations
      this.time += 0.1;
      
      // Rotate the collectible
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
      if (this.type === 'coin') {
        this.drawCoin(0, 0, size);
      } else if (this.type === 'star') {
        this.drawStar(0, 0, size);
      } else if (this.type === 'gem') {
        this.drawGem(0, 0, size);
      }
      
      // Restore context state
      context.restore();
    }
    
    /**
     * Draw a coin collectible
     * @param {number} x - X position (relative to the translated context)
     * @param {number} y - Y position (relative to the translated context)
     * @param {number} size - Size of the coin
     */
    drawCoin(x, y, size) {
      const { context } = this;
      
      // Draw coin
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fillStyle = this.color;
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = this.outlineColor;
      context.stroke();
      context.closePath();
      
      // Draw dollar sign
      context.beginPath();
      context.font = `bold ${size}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = this.outlineColor;
      context.fillText('$', x, y);
      context.closePath();
    }
    
    /**
     * Draw a star collectible
     * @param {number} x - X position (relative to the translated context)
     * @param {number} y - Y position (relative to the translated context)
     * @param {number} size - Size of the star
     */
    drawStar(x, y, size) {
      const { context } = this;
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size / 2;
      
      context.beginPath();
      
      // Draw star shape
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2;
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        
        if (i === 0) {
          context.moveTo(pointX, pointY);
        } else {
          context.lineTo(pointX, pointY);
        }
      }
      
      context.closePath();
      context.fillStyle = this.color;
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = this.outlineColor;
      context.stroke();
    }
    
    /**
     * Draw a gem collectible
     * @param {number} x - X position (relative to the translated context)
     * @param {number} y - Y position (relative to the translated context)
     * @param {number} size - Size of the gem
     */
    drawGem(x, y, size) {
      const { context } = this;
      
      // Draw gem (simple diamond shape)
      context.beginPath();
      context.moveTo(x, y - size);
      context.lineTo(x + size, y);
      context.lineTo(x, y + size);
      context.lineTo(x - size, y);
      context.closePath();
      
      context.fillStyle = this.color;
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = this.outlineColor;
      context.stroke();
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