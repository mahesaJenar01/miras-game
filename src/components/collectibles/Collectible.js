/**
 * Collectible.js - Base class for all collectible items
 * Defines common properties and methods for all collectible types
 */
import GameEvents from '../../events/GameEvents.js';
import { COLLECTIBLE_EVENTS } from '../../events/EventTypes.js';

class Collectible {
  /**
   * Create a new collectible
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - X position in world coordinates
   * @param {number} y - Y position in world coordinates
   * @param {number} width - Width of the collectible hitbox
   * @param {number} height - Height of the collectible hitbox
   */
  constructor(context, x, y, width, height) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Collection state
    this.isActive = true;
    this.isCollected = false;
    this.collectionAnimationProgress = 0;
    this.collectionAnimationDuration = 30; // frames
    
    // Values
    this.value = 1; // Default value for a collectible
    
    // Hitbox for collision detection (can be adjusted for different shapes)
    this.hitbox = {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }
  
/**
 * Check if this collectible collides with a character
 * @param {Character} character - The character to check collision with
 * @returns {boolean} True if collision detected
 */
checkCollision(character) {
    if (!this.isActive || this.isCollected) return false;
    
    // Simpler collision detection with logging
    // Get character position and size
    const characterX = character.x;
    const characterY = character.y;
    const characterRadius = character.config.radius * 1.5; // Make hitbox more generous
    
    // Calculate distance between centers
    const dx = this.x - characterX;
    const dy = this.y - characterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Consider collision if distance is less than sum of radii
    // Using a more generous collision distance
    const collision = distance < (characterRadius + Math.max(this.width, this.height) / 2);
    
    if (collision) {
      console.log('Collision detected!', {
        collectible: { x: this.x, y: this.y },
        character: { x: characterX, y: characterY },
        distance: distance,
        threshold: (characterRadius + Math.max(this.width, this.height) / 2)
      });
    }
    
    return collision;
  }
  
/**
 * Collect this item and start collection animation
 */
    collect() {
        if (!this.isActive || this.isCollected) return;
        
        this.isCollected = true;
        this.collectionAnimationProgress = 0;
        
        // Use emit() instead of emitCollectible()
        GameEvents.emit(COLLECTIBLE_EVENTS.COLLECTIBLE_COLLECTED, {
        collectible: this,
        type: this.constructor.name,
        value: this.value,
        x: this.x,
        y: this.y
        });
    }  
  
  /**
   * Update the collectible state
   * @returns {boolean} True if the collectible is still active
   */
  update() {
    // Update collection animation if collected
    if (this.isCollected) {
      this.collectionAnimationProgress++;
      
      // Deactivate once animation completes
      if (this.collectionAnimationProgress >= this.collectionAnimationDuration) {
        this.isActive = false;
      }
    }
    
    // Update hitbox position
    this.updateHitbox();
    
    return this.isActive;
  }
  
  /**
   * Update the collision hitbox position
   */
    updateHitbox() {
        this.hitbox = {
        x: this.x - this.width / 2,
        y: this.y - this.height / 2,
        width: this.width,
        height: this.height
        };
    }
  
  /**
   * Draw the collectible
   * @param {number} worldOffset - Current world offset for positioning
   */
  draw(worldOffset) {
    // Base class doesn't implement specific drawing
    // This should be implemented by subclasses
    
    // Debug drawing of the hitbox (can be enabled for debugging)
    if (window.location.search.includes('debug=true')) {
      this.drawHitbox(worldOffset);
    }
  }
  
  /**
   * Draw the hitbox for debugging
   * @param {number} worldOffset - Current world offset for positioning
   */
  drawHitbox(worldOffset) {
    const screenX = this.hitbox.x - worldOffset;
    
    this.context.save();
    // Use a highly visible color for hitboxes
    this.context.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    this.context.lineWidth = 2;
    this.context.strokeRect(
      screenX,
      this.hitbox.y,
      this.hitbox.width,
      this.hitbox.height
    );
    
    // Add dot at center for reference
    this.context.fillStyle = 'red';
    this.context.beginPath();
    this.context.arc(this.x - worldOffset, this.y, 3, 0, Math.PI * 2);
    this.context.fill();
    
    this.context.restore();
  }  
  
  /**
   * Check if this collectible is visible in the viewport
   * @param {number} worldOffset - Current world offset
   * @param {number} canvasWidth - Width of the canvas
   * @returns {boolean} True if the collectible is visible
   */
  isVisible(worldOffset, canvasWidth) {
    const screenX = this.x - worldOffset;
    return screenX + this.width > 0 && screenX - this.width < canvasWidth;
  }
}

export default Collectible;