/**
 * BaseEnemy.js - Foundation class for all enemy types
 * Handles common enemy properties, rendering, and basic movement
 */
import GameEvents from '../../events/GameEvents.js';
import { GAME_EVENTS, CHARACTER_EVENTS } from '../../events/EventTypes.js';

class BaseEnemy {
  /**
   * Create a new enemy
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {number} x - Initial X position in world coordinates
   * @param {number} y - Initial Y position
   * @param {Object} config - Configuration object
   */
  constructor(context, canvas, x, y, config = {}) {
    this.context = context;
    this.canvas = canvas;
    this.x = x;
    this.y = y;

    // Base properties with defaults
    this.width = config.width || 40;
    this.height = config.height || 30;
    this.speed = config.speed || 1.5;
    this.color = config.color || '#8B0000'; // Default dark red
    this.active = true;
    this.health = config.health || 100;
    this.damage = config.damage || 10;
    this.type = 'enemy'; // Base type, to be overridden
    
    // Movement pattern
    this.movementPattern = config.movementPattern || 'linear';
    this.direction = config.direction || -1; // -1 = left, 1 = right
    this.amplitude = config.amplitude || 0; // For wave-like movement
    this.frequency = config.frequency || 0.02; // For wave-like movement
    this.time = 0;
    
    this.isHitFlashing = false;
    this.hitFlashTimer = 0;
    this.hitFlashDuration = 6;
    
    this.isDefeated = false;
    this.defeatProgress = 0;
    this.defeatDuration = 15;
    
    // Add this property for opacity
    this.opacity = 1;

    // Animation properties
    this.frameCount = 0;
    this.animationSpeed = config.animationSpeed || 0.1;
    this.animationFrame = 0;
    this.frameWidth = 0;
    this.frameHeight = 0;
    this.maxFrames = config.maxFrames || 1;
    
    // Initial offset for varied spawning
    this.yOffset = Math.random() * 10 - 5;
    
    // Visibility check
    this.isOnScreen = false;
  }
  
    /**
     * Override the update method to include hit and defeat animations
     * @param {number} worldOffset - Current world offset for parallax
     */
    update(worldOffset) {
        // Don't update if defeated and animation complete
        if (this.isDefeated && this.defeatProgress >= 1) return;
        
        // Base update logic
        // Increment time for animations and wave movement
        this.time += 0.1;
        this.frameCount++;
        
        // Update animation frame
        if (this.frameCount >= 1 / this.animationSpeed) {
        this.animationFrame = (this.animationFrame + 1) % this.maxFrames;
        this.frameCount = 0;
        }
        
        // Calculate on-screen position with world offset
        const screenX = this.x - worldOffset;
        
        // Check if enemy is visible on screen
        this.isOnScreen = (
        screenX > -this.width &&
        screenX < this.canvas.width + this.width
        );
        
        // Only update if on-screen or close to it (optimization)
        if (this.isOnScreen || Math.abs(screenX - this.canvas.width) < 300) {
        // Update movement if not defeated
        if (!this.isDefeated) {
            this.updateMovement();
        }
        
        // Update hit animation
        this.updateHitAnimation();
        
        // Update defeat animation if active
        if (this.isDefeated) {
            this.updateDefeatAnimation();
        }
        }
    }
  
  /**
   * Update enemy movement pattern
   * Individual enemy types will override this method
   */
  updateMovement() {
    // Base implementation - simple linear movement
    this.x += this.speed * this.direction;
    
    // Apply wave pattern if amplitude is set
    if (this.amplitude > 0) {
      this.yOffset = Math.sin(this.time * this.frequency) * this.amplitude;
    }
  }
  
    /**
     * Draw the enemy
     * Base implementation - individual enemy types will override this
     * @param {number} worldOffset - Current world offset for parallax
     */
    draw(worldOffset) {
    // Skip drawing if not active
    if (!this.active) {
        return;
    }
    
    // Calculate screen position
    const screenX = this.x - worldOffset;
    
    // Check if enemy is visible on screen
    this.isOnScreen = (
        screenX > -this.width &&
        screenX < this.canvas.width + this.width
    );
    
    // Only draw if on screen
    if (!this.isOnScreen) return;
    
    const screenY = this.y + this.yOffset;
    
    // Save context state
    this.context.save();
    
    // Draw placeholder rectangle
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.fillRect(screenX, screenY, this.width, this.height);
    this.context.closePath();
    
    // Restore context state
    this.context.restore();
    
    // Debug draw hitbox
    if (window.location.search.includes('debug=true')) {
        this.context.save();
        this.context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.context.lineWidth = 2;
        this.context.strokeRect(screenX, screenY, this.width, this.height);
        this.context.restore();
    }
    }
  
  /**
   * Check if the enemy is hit by an attack
   * @param {Object} attackHitbox - Hitbox of the attack
   * @returns {boolean} True if hit
   */
  checkHit(attackHitbox) {
    // Basic rectangle collision check
    return (
      this.x < attackHitbox.x + attackHitbox.width &&
      this.x + this.width > attackHitbox.x &&
      this.y < attackHitbox.y + attackHitbox.height &&
      this.y + this.height > attackHitbox.y
    );
  }
  
  /**
     * Apply damage to the enemy
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} True if enemy is defeated
     */
    takeDamage(amount) {
    this.health -= amount;
    
    // Flash effect when taking damage
    this.startHitAnimation();
    
    // Return true if health drops to 0 or below
    return this.health <= 0;
    }

    /**
     * Start hit animation flash effect
     */
    startHitAnimation() {
    this.isHitFlashing = true;
    this.hitFlashTimer = 0;
    this.hitFlashDuration = 6; // Frames for the hit flash effect
    
    // Emit hit event for audio
    GameEvents.emit(ENEMY_EVENTS.ENEMY_HIT, {
        type: this.type,
        x: this.x,
        y: this.y,
        health: this.health
    });
    }

    /**
     * Update hit animation flash effect
     */
    updateHitAnimation() {
    if (this.isHitFlashing) {
        this.hitFlashTimer++;
        
        if (this.hitFlashTimer >= this.hitFlashDuration) {
        this.isHitFlashing = false;
        this.hitFlashTimer = 0;
        }
    }
    }
  
    /**
     * Deactivate this enemy (when defeated)
     * Add defeat animation and effects
     */
    defeat() {
        // Don't defeat again if already inactive
        if (!this.active) return;
        
        // Start defeat animation
        this.startDefeatAnimation();
        
        // Set to inactive after a short delay to show defeat animation
        setTimeout(() => {
        this.active = false;
        
        // Emit defeat completed event
        GameEvents.emit(ENEMY_EVENTS.ENEMY_DEFEATED, {
            type: this.type,
            x: this.x,
            y: this.y,
            completed: true
        });
        }, 300); // Animation duration in ms
    }
  
    /**
 * Start defeat animation
 */
startDefeatAnimation() {
    this.isDefeated = true;
    this.defeatProgress = 0;
    this.defeatDuration = 15; // Frames for defeat animation
    
    // Create a visual defeat effect based on enemy type
    this.createDefeatEffect();
  }
  
  /**
   * Update defeat animation
   */
  updateDefeatAnimation() {
    if (this.isDefeated) {
      // Progress the defeat animation
      this.defeatProgress += 1 / this.defeatDuration;
      
      if (this.defeatProgress >= 1) {
        this.defeatProgress = 1;
      }
      
      // Apply defeat animation effects (fade out, fall, etc.)
      this.opacity = 1 - this.defeatProgress;
      this.y += this.defeatProgress * 2; // Falling effect
      
      // Enemy type specific defeat effects
      if (this.type === 'snake') {
        this.width *= (1 - this.defeatProgress * 0.2);
      } else if (this.type === 'tiger') {
        this.yOffset += this.defeatProgress * 5;
      } else if (this.type === 'bird') {
        this.yOffset += this.defeatProgress * 8;
        this.x -= this.defeatProgress * 3; // Fall at an angle
      }
    }
  }
  
  /**
   * Create visual effects for defeat
   */
  createDefeatEffect() {
    // Enemy type specific defeat effects
    switch(this.type) {
      case 'snake':
        // Slither away effect
        this.defeatEffectType = 'slither_away';
        break;
      case 'tiger':
        // Fall over effect
        this.defeatEffectType = 'fall_over';
        break;
      case 'bird':
        // Fall from sky effect
        this.defeatEffectType = 'fall_from_sky';
        break;
      default:
        this.defeatEffectType = 'generic_defeat';
    }
  }

    /**
     * Check if this enemy is still active
     * @returns {boolean} True if enemy is active
     */
    isActive() {
        return this.active;
    }
}

export default BaseEnemy;