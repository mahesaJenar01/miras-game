/**
 * CollectibleDisplay.js - Displays the collected items count
 * Creates and updates a UI element for showing the current score
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
    this.coinColor = '#FFD700';
    this.coinSize = 15;
    
    // Position in the top-right corner
    this.x = canvas.width - this.displayWidth - this.padding;
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
    // Update position to stay in top-right corner
    this.x = canvasWidth - this.displayWidth - this.padding;
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
    
    // Draw coin icon
    const coinX = x + this.coinSize;
    const coinY = y + displayHeight / 2;
    
    // Draw coin
    context.beginPath();
    context.arc(coinX, coinY, this.coinSize, 0, Math.PI * 2);
    context.fillStyle = this.coinColor;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#B8860B'; // Dark goldenrod
    context.stroke();
    context.closePath();
    
    // Draw dollar sign
    context.beginPath();
    context.font = `bold ${this.coinSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#B8860B';
    context.fillText('$', coinX, coinY);
    context.closePath();
    
    // Draw count text
    context.font = 'bold 18px Arial';
    context.fillStyle = this.textColor;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    const countText = `× ${this.count}`;
    context.fillText(countText, x + this.coinSize * 2 + 5, y + displayHeight / 2);
    
    // Restore context state
    context.restore();
  }
}

export default CollectibleDisplay;