/**
 * ShopCloseButton.js - Manages the close button in the shop
 * Handles drawing and interaction for the shop close button
 */
import ShopUiRenderer from './ShopUiRenderer.js';

class ShopCloseButton {
  /**
   * Create a new shop close button
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {ShopLayoutManager} layoutManager - The layout manager
   */
  constructor(context, layoutManager) {
    this.context = context;
    this.layoutManager = layoutManager;
    
    // Button properties
    this.x = 0;
    this.y = 0;
    this.width = 40;
    this.height = 40;
    this.isHovered = false;
    
    // Update position
    this.updatePosition();
    
    // UI utilities
    this.renderer = new ShopUiRenderer(context);
  }
  
  /**
   * Update button position
   */
  updatePosition() {
    const position = this.layoutManager.getCloseButtonPosition();
    this.x = position.x;
    this.y = position.y;
    this.width = position.width;
    this.height = position.height;
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    this.updatePosition();
  }
  
  /**
   * Handle mouse move events for hover effects
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   */
  handleMouseMove(x, y) {
    // Update hover state
    this.isHovered = this.isPointInside(x, y);
  }
  
  /**
   * Check if a point is inside the button
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @returns {boolean} True if point is inside
   */
  isClicked(x, y) {
    return this.isPointInside(x, y);
  }
  
  /**
   * Helper to check if a point is inside the circular button
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @returns {boolean} True if point is inside
   */
  isPointInside(x, y) {
    const centerX = this.x + this.width/2;
    const centerY = this.y + this.height/2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    return distance <= this.width/2;
  }
  
  /**
   * Draw the close button
   * @param {number} animProgress - Animation progress (0-1)
   */
  draw(animProgress) {
    const { context } = this;
    const { x, y, width, height } = this;
    
    // Apply fade-in animation
    const buttonAlpha = animProgress < 1 ? animProgress : 1;
    context.globalAlpha = buttonAlpha;
    
    // Draw button circle
    context.beginPath();
    context.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
    
    // Apply hover effect
    const fillOpacity = this.isHovered ? 0.5 : 0.3;
    context.fillStyle = `rgba(255, 255, 255, ${fillOpacity})`;
    context.fill();
    
    // Add border
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    
    // Draw X
    const padding = width * (this.isHovered ? 0.25 : 0.3);
    const lineWidth = this.isHovered ? 3.5 : 3;
    
    context.beginPath();
    context.moveTo(x + padding, y + padding);
    context.lineTo(x + width - padding, y + height - padding);
    context.moveTo(x + width - padding, y + padding);
    context.lineTo(x + padding, y + height - padding);
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = lineWidth;
    context.stroke();
    context.closePath();
    
    // Reset alpha
    context.globalAlpha = 1;
  }
}

export default ShopCloseButton;