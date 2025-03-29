/**
 * CollectibleCounter.js - UI component for displaying collectible count
 * Shows the current number of collected items with a flower icon
 */
import GameEvents from '../../events/GameEvents.js';
import { COLLECTIBLE_EVENTS } from '../../events/EventTypes.js';

class CollectibleCounter {
  /**
   * Create a new collectible counter
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - X position on screen
   * @param {number} y - Y position on screen
   * @param {CollectibleManager} collectibleManager - Reference to the collectible manager
   */
  constructor(context, x, y, collectibleManager) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.collectibleManager = collectibleManager;
    
    // UI properties
    this.width = 120;
    this.height = 40;
    this.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    this.borderColor = '#F7C8E0'; // Light magenta
    this.textColor = '#333';
    this.font = '20px Arial';
    this.iconSize = 24;
    
    // Animation properties
    this.isAnimating = false;
    this.animationProgress = 0;
    this.animationDuration = 20; // frames
    this.animationScale = 1;
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners
   */
  registerEventListeners() {
    // Listen for count updates to trigger animation
    GameEvents.on(COLLECTIBLE_EVENTS.COLLECTIBLE_COUNT_UPDATED, (data) => {
      if (data.change > 0) {
        this.startAnimation();
      }
    });
  }
  
  
  /**
   * Clean up event listeners
   */
  cleanup() {
    // Clean up event listeners to prevent memory leaks
    GameEvents.off(COLLECTIBLE_EVENTS.COLLECTIBLE_COUNT_UPDATED, this.startAnimation);
  }
  
  /**
   * Start the counter animation
   */
  startAnimation() {
    this.isAnimating = true;
    this.animationProgress = 0;
  }
  
  /**
   * Update the animation state
   */
  updateAnimation() {
    if (this.isAnimating) {
      this.animationProgress++;
      
      // Calculate scale based on animation progress
      if (this.animationProgress < this.animationDuration / 2) {
        // Scale up in first half
        this.animationScale = 1 + (this.animationProgress / (this.animationDuration / 2)) * 0.3;
      } else {
        // Scale down in second half
        const normalizedProgress = (this.animationProgress - this.animationDuration / 2) / (this.animationDuration / 2);
        this.animationScale = 1.3 - normalizedProgress * 0.3;
      }
      
      // End animation
      if (this.animationProgress >= this.animationDuration) {
        this.isAnimating = false;
        this.animationScale = 1;
      }
    }
  }
  
  /**
   * Draw the counter with current count
   */
  draw() {
    // Update animation if active
    this.updateAnimation();
    
    // Get current count
    const count = this.collectibleManager.getCollectedCount();
    
    // Save context state
    this.context.save();
    
    // Draw background
    this.context.fillStyle = this.backgroundColor;
    this.context.strokeStyle = this.borderColor;
    this.context.lineWidth = 2;
    
    // Create rounded rectangle
    this.roundRect(
      this.context,
      this.x,
      this.y,
      this.width,
      this.height,
      10
    );
    
    this.context.fill();
    this.context.stroke();
    
    // Apply animation scale
    if (this.isAnimating) {
      this.context.translate(
        this.x + this.width / 2,
        this.y + this.height / 2
      );
      this.context.scale(this.animationScale, this.animationScale);
      this.context.translate(
        -(this.x + this.width / 2),
        -(this.y + this.height / 2)
      );
    }
    
    // Draw flower icon
    this.drawFlowerIcon(
      this.x + 15,
      this.y + this.height / 2,
      this.iconSize
    );
    
    // Draw count text
    this.context.font = this.font;
    this.context.fillStyle = this.textColor;
    this.context.textAlign = 'left';
    this.context.textBaseline = 'middle';
    this.context.fillText(
      `× ${count}`,
      this.x + 15 + this.iconSize + 5,
      this.y + this.height / 2
    );
    
    // Restore context state
    this.context.restore();
  }
  
  /**
   * Draw a flower icon for the counter
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Icon size
   */
  drawFlowerIcon(x, y, size) {
    const petalSize = size * 0.4;
    const centerSize = size * 0.3;
    
    // Draw petals
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * petalSize;
      const petalY = y + Math.sin(angle) * petalSize;
      
      this.context.beginPath();
      this.context.arc(petalX, petalY, petalSize, 0, Math.PI * 2);
      this.context.fillStyle = '#FF9AA2'; // Light pink
      this.context.fill();
      this.context.closePath();
    }
    
    // Draw center
    this.context.beginPath();
    this.context.arc(x, y, centerSize, 0, Math.PI * 2);
    this.context.fillStyle = '#FFEB85'; // Yellow center
    this.context.fill();
    this.context.closePath();
  }
  
  /**
   * Helper function to draw rounded rectangles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   */
  roundRect(ctx, x, y, width, height, radius) {
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
  }
}

export default CollectibleCounter;