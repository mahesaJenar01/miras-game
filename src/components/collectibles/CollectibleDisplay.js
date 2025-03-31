/**
 * CollectibleDisplay.js - Displays the collected items count
 * Creates and updates a UI element for showing the current score
 * Updated to display in the top-left with tulip icon
 */
import GameEvents from '../../events/GameEvents.js';
import { COLLECTIBLE_EVENTS, GAME_EVENTS } from '../../events/EventTypes.js';

class CollectibleDisplay {
  /**
   * Create a new collectible display
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    this.count = 0;
    this.displayWidth = 100;
    this.displayHeight = 40;
    this.padding = 10;
    this.cornerRadius = 10;
    this.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.textColor = '#FFFFFF';
    this.tulipColor = '#FF5555'; // Red tulip color
    this.stemColor = '#4CAF50'; // Green stem
    this.tulipSize = 15;
    
    // Position in the top-left corner
    this.x = this.padding;
    this.y = this.padding;
    
    // Animation properties
    this.isAnimating = false;
    this.animationTime = 0;
    this.animationDuration = 30; // frames
    this.animationScale = 1;
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners for display updates
   */
  registerEventListeners() {
    // Listen for count updates
    GameEvents.on(COLLECTIBLE_EVENTS.COUNT_UPDATE, (data) => {
      this.updateCount(data.count);
    });
    
    // Listen for collect events to animate the display
    GameEvents.on(COLLECTIBLE_EVENTS.COLLECT, () => {
      this.startAnimation();
    });
    
    // Listen for game resize to update position
    GameEvents.on(GAME_EVENTS.RESIZE, (data) => {
      if (data.width) {
        this.handleResize(data.width);
      }
    });
  }
  
  /**
   * Update the displayed count
   * @param {number} count - New count value
   */
  updateCount(count) {
    this.count = count;
  }
  
  /**
   * Start the collection animation
   */
  startAnimation() {
    this.isAnimating = true;
    this.animationTime = 0;
  }
  
  /**
   * Handle canvas resize
   * @param {number} canvasWidth - New canvas width
   */
  handleResize(canvasWidth) {
    // Update position to stay in top-left corner
    this.x = this.padding;
  }
  
  /**
   * Update the display animation
   */
  update() {
    if (this.isAnimating) {
      this.animationTime++;
      
      // Calculate current animation scale
      if (this.animationTime < this.animationDuration / 2) {
        // Scale up during first half
        this.animationScale = 1 + (this.animationTime / (this.animationDuration / 2)) * 0.2;
      } else {
        // Scale down during second half
        const progress = (this.animationTime - this.animationDuration / 2) / (this.animationDuration / 2);
        this.animationScale = 1.2 - progress * 0.2;
      }
      
      // End animation when duration is reached
      if (this.animationTime >= this.animationDuration) {
        this.isAnimating = false;
        this.animationScale = 1;
      }
    }
  }
  
  /**
   * Draw the collectible display
   */
  draw() {
    const { context, x, y, displayWidth, displayHeight, cornerRadius } = this;
    
    // Save context state
    context.save();
    
    // Apply animation scale if active
    if (this.isAnimating) {
      context.translate(x + displayWidth / 2, y + displayHeight / 2);
      context.scale(this.animationScale, this.animationScale);
      context.translate(-(x + displayWidth / 2), -(y + displayHeight / 2));
    }
    
    // Draw rounded rectangle background
    context.beginPath();
    context.moveTo(x + cornerRadius, y);
    context.lineTo(x + displayWidth - cornerRadius, y);
    context.quadraticCurveTo(x + displayWidth, y, x + displayWidth, y + cornerRadius);
    context.lineTo(x + displayWidth, y + displayHeight - cornerRadius);
    context.quadraticCurveTo(x + displayWidth, y + displayHeight, x + displayWidth - cornerRadius, y + displayHeight);
    context.lineTo(x + cornerRadius, y + displayHeight);
    context.quadraticCurveTo(x, y + displayHeight, x, y + displayHeight - cornerRadius);
    context.lineTo(x, y + cornerRadius);
    context.quadraticCurveTo(x, y, x + cornerRadius, y);
    context.closePath();
    
    // Fill background
    context.fillStyle = this.backgroundColor;
    context.fill();
    
    // Draw tulip icon
    const tulipX = x + this.tulipSize;
    const tulipY = y + displayHeight / 2;
    
    // Draw the tulip
    this.drawTulipIcon(tulipX, tulipY, this.tulipSize);
    
    // Draw count text
    context.font = 'bold 18px Arial';
    context.fillStyle = this.textColor;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    const countText = `× ${this.count}`;
    context.fillText(countText, x + this.tulipSize * 2 + 5, y + displayHeight / 2);
    
    // Restore context state
    context.restore();
  }
  
  /**
   * Draw a simplified tulip icon
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} size - Icon size
   */
  drawTulipIcon(x, y, size) {
    const context = this.context;
    
    // Draw stem
    context.beginPath();
    context.moveTo(x, y + size * 0.2);
    context.lineTo(x, y + size * 0.7);
    context.strokeStyle = this.stemColor;
    context.lineWidth = size * 0.15;
    context.stroke();
    context.closePath();
    
    // Draw tulip flower (simplified for icon)
    context.beginPath();
    context.moveTo(x, y);
    
    // Left petal curve
    context.bezierCurveTo(
      x - size * 0.6, y - size * 0.3, 
      x - size * 0.6, y - size * 0.7, 
      x, y - size * 0.4
    );
    
    // Right petal curve
    context.bezierCurveTo(
      x + size * 0.6, y - size * 0.7, 
      x + size * 0.6, y - size * 0.3, 
      x, y
    );
    
    context.fillStyle = this.tulipColor;
    context.fill();
    context.closePath();
  }
}

export default CollectibleDisplay;