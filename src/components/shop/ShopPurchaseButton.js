/**
 * ShopPurchaseButton.js - Manages the purchase button in the shop
 * Handles button states, animations and interactions
 */
import ShopUiRenderer from './ShopUiRenderer.js';

class ShopPurchaseButton {
  /**
   * Create a new shop purchase button
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {ShopLayoutManager} layoutManager - The layout manager
   */
  constructor(context, layoutManager) {
    this.context = context;
    this.layoutManager = layoutManager;
    
    // Button properties
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.cornerRadius = 15;
    this.price = 100;
    this.visible = false;
    this.isHovered = false;
    
    // Button state and animation
    this.state = 'normal'; // 'normal', 'success', 'failure'
    this.stateTimer = 0;  // Timer for transitioning states
    
    // UI utilities
    this.renderer = new ShopUiRenderer(context);
  }
  
  /**
   * Set the current price
   * @param {number} price - The card price
   */
  setPrice(price) {
    this.price = price;
    
    // Update width based on price digits
    this.updateDimensions();
  }
  
  /**
   * Show the purchase button
   */
  show() {
    this.visible = true;
    this.updatePosition();
  }
  
  /**
   * Hide the purchase button
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * Set the button state
   * @param {string} state - Button state ('normal', 'success', 'failure')
   */
  setState(state) {
    this.state = state;
    
    // Reset state timer for animations
    if (state !== 'normal') {
      this.stateTimer = state === 'success' ? 45 : 60; // 45 frames for success, 60 for failure
    } else {
      this.stateTimer = 0;
    }
  }
  
  /**
   * Update button dimensions based on price and canvas size
   */
  updateDimensions() {
    const dimensions = this.layoutManager.getPurchaseButtonDimensions(this.price);
    this.width = dimensions.width;
    this.height = dimensions.height;
    this.cornerRadius = dimensions.cornerRadius;
  }
  
  /**
   * Update button position
   */
  updatePosition() {
    const position = this.layoutManager.getPurchaseButtonPosition();
    this.x = position.x;
    this.y = position.y;
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    this.updateDimensions();
    this.updatePosition();
  }
  
  /**
   * Handle mouse move events for hover effects
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   */
  handleMouseMove(x, y) {
    if (!this.visible) return;
    
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
    return this.visible && this.isPointInside(x, y);
  }
  
  /**
   * Helper to check if a point is inside the button
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @returns {boolean} True if point is inside
   */
  isPointInside(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
  
  /**
   * Update button state and animations
   */
  update() {
    // Update state timer for animations
    if (this.stateTimer > 0) {
      this.stateTimer--;
      
      // Transition back to normal state when timer expires
      if (this.stateTimer === 0 && this.state !== 'normal') {
        this.state = 'normal';
      }
    }
  }
  
  /**
   * Draw the purchase button
   * @param {number} animProgress - Animation progress (0-1)
   */
  draw(animProgress) {
    if (!this.visible) return;
    
    const { context } = this;
    const { x, y, width, height, cornerRadius } = this;
    
    // Apply fade-in animation
    const buttonAlpha = animProgress < 1 ? animProgress : 1;
    context.globalAlpha = buttonAlpha;
    
    // Draw button background with rounded corners
    context.beginPath();
    this.renderer.roundRect(context, x, y, width, height, cornerRadius);
    
    // Create gradient based on button state
    const gradient = context.createLinearGradient(x, y, x, y + height);
    
    switch (this.state) {
      case 'success':
        // Success state - green gradient
        gradient.addColorStop(0, '#8FD16F');
        gradient.addColorStop(1, '#4CAF50');
        context.strokeStyle = '#32a852';
        break;
        
      case 'failure':
        // Failure state - red gradient
        gradient.addColorStop(0, '#FF7676');
        gradient.addColorStop(1, '#FF5555');
        context.strokeStyle = '#FF0000';
        break;
        
      default:
        // Normal state - pink/purple theme
        gradient.addColorStop(0, this.isHovered ? '#FFA7AF' : '#FF9AA2');
        gradient.addColorStop(1, this.isHovered ? '#EBD9FC' : '#E3D1F4');
        context.strokeStyle = '#FF69B4';
    }
    
    context.fillStyle = gradient;
    context.fill();
    
    // Add border
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    
    // Add shadow for depth
    context.beginPath();
    this.renderer.roundRect(context, x + 2, y + 2, width, height, cornerRadius);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fill();
    context.closePath();
    
    // Calculate icon and text sizes proportionally
    const iconSize = Math.min(height * 0.5, width * 0.1);
    const textSize = Math.min(22, Math.max(16, height * 0.4));
    
    // Draw flower icon
    const flowerX = x + width * 0.2;
    const flowerY = y + height/2;
    this.drawFlowerIcon(flowerX, flowerY, iconSize);
    
    // Draw button text
    context.font = `bold ${textSize}px Arial`;
    context.fillStyle = this.state === 'failure' ? '#FFFFFF' : '#333333';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`Purchase (${this.price} flowers)`, x + width/2, y + height/2);
    
    // Reset alpha
    context.globalAlpha = 1;
  }
  
  /**
   * Draw flower icon for the button
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} size - Icon size
   */
  drawFlowerIcon(x, y, size) {
    const { context } = this;
    const petalCount = 5;
    
    // Draw petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * size * 0.5;
      const petalY = y + Math.sin(angle) * size * 0.5;
      
      context.beginPath();
      context.arc(petalX, petalY, size * 0.4, 0, Math.PI * 2);
      context.fillStyle = '#FF9AA2';
      context.fill();
      context.closePath();
    }
    
    // Draw center
    context.beginPath();
    context.arc(x, y, size * 0.3, 0, Math.PI * 2);
    context.fillStyle = '#FFEB3B';
    context.fill();
    context.closePath();
  }
}

export default ShopPurchaseButton;