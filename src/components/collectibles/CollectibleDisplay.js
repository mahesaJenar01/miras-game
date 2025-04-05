/**
 * CollectibleDisplay.js - Displays the collected items count
 * Updated with improved horizontal alignment with shop button
 */
import GameEvents from '../../events/GameEvents.js';
import { COLLECTIBLE_EVENTS, GAME_EVENTS, UI_EVENTS } from '../../events/EventTypes.js';

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
    
    // Default dimensions - will be updated when UI event is received
    this.displayWidth = 100;
    this.displayHeight = 40;
    this.padding = 10;
    this.cornerRadius = 10;
    
    // Visual properties
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
    
    // Emit an event to notify that this component is ready
    // This will help ButtonSystem know our dimensions
    setTimeout(() => {
      GameEvents.emitUI(UI_EVENTS.UPDATE, {
        type: 'collectible_display_ready',
        displayWidth: this.displayWidth,
        displayHeight: this.displayHeight,
        padding: this.padding,
        x: this.x,
        y: this.y
      });
    }, 0);    
  }
  
  /**
   * Register event listeners for display updates and to match button sizes
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
    
    // Listen for UI updates to match button dimensions
    GameEvents.on(UI_EVENTS.UPDATE, (data) => {
      if (data.type === 'button_positions' && data.buttons) {
        this.updateDimensions(data.buttons);
        // After updating dimensions, notify others of our new size
        GameEvents.emitUI(UI_EVENTS.UPDATE, {
          type: 'collectible_display_updated',
          x: this.x,
          y: this.y,
          width: this.displayWidth,
          height: this.displayHeight,
          padding: this.padding
        });
      }
    });
    
    // Listen for game resize to update position
    GameEvents.on(GAME_EVENTS.RESIZE, () => {
      this.handleResize();
    });
  }
  
  /**
   * Update dimensions to match other UI buttons
   * @param {Object} buttons - Button position and size information
   */
  updateDimensions(buttons) {
    // Add this flag to prevent infinite loops
    if (this._isUpdatingDimensions) return;
    this._isUpdatingDimensions = true;
    
    // Use the move button (or any other button) as reference
    const referenceButton = buttons.move || buttons.shop;
    
    if (referenceButton) {
      // Match the height of the button
      this.displayHeight = referenceButton.height;
      
      // Make width proportional but sufficient for content
      this.displayWidth = this.displayHeight * 2.5;
      
      // Update corner radius to match button style
      this.cornerRadius = this.displayHeight * 0.2;
      
      // Update tulip size proportional to the display height
      this.tulipSize = this.displayHeight * 0.4;
      
      // Always position at the top-left with padding
      this.x = this.padding;
      this.y = this.padding;
    }
    
    // Notify others of our new size after a short delay to prevent immediate circular updates
    setTimeout(() => {
      GameEvents.emitUI(UI_EVENTS.UPDATE, {
        type: 'collectible_display_updated',
        x: this.x,
        y: this.y,
        width: this.displayWidth,
        height: this.displayHeight,
        padding: this.padding
      });
      
      // Reset the update flag
      this._isUpdatingDimensions = false;
    }, 0);
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
   * Handle canvas resize - adjust display positioning
   */
  handleResize() {
    // Always position in top-left with padding
    this.x = this.padding;
    this.y = this.padding;
    
    // Notify others of position change after resize
    GameEvents.emitUI(UI_EVENTS.UPDATE, {
      type: 'collectible_display_updated',
      x: this.x,
      y: this.y,
      width: this.displayWidth,
      height: this.displayHeight,
      padding: this.padding
    });
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
   * Draw the collectible display with improved sizing and layout
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
    this.roundRect(context, x, y, displayWidth, displayHeight, cornerRadius);
    context.fillStyle = this.backgroundColor;
    context.fill();
    
    // Add subtle border for consistency with buttons
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 1;
    context.stroke();
    
    // Draw tulip icon - centered vertically
    const tulipX = x + displayHeight / 2;
    const tulipY = y + displayHeight / 2;
    
    // Draw the tulip
    this.drawTulipIcon(tulipX, tulipY, this.tulipSize);
    
    // Calculate appropriate font size based on display height
    const fontSize = Math.min(displayHeight * 0.5, 24);
    
    // Draw count text - positioned to avoid overlap with tulip
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = this.textColor;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    
    // Position text after the tulip with proper spacing
    const textX = x + displayHeight * 0.8;
    const countText = `× ${this.count}`;
    context.fillText(countText, textX, y + displayHeight / 2);
    
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
  
  /**
   * Helper function to draw rounded rectangles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width of rectangle
   * @param {number} height - Height of rectangle
   * @param {number} radius - Corner radius
   */
  roundRect(ctx, x, y, width, height, radius) {
    if (radius > height / 2) radius = height / 2;
    if (radius > width / 2) radius = width / 2;
    
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

export default CollectibleDisplay;