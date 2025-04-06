/**
 * ShopHeader.js - Manages the title and subtitle elements in the shop
 * Handles different text states based on shop flow
 */
import ShopUiRenderer from '../utils/ShopUiRenderer.js';

class ShopHeader {
  /**
   * Create a new shop header
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {ShopLayoutManager} layoutManager - The layout manager
   */
  constructor(context, layoutManager) {
    this.context = context;
    this.layoutManager = layoutManager;
    this.price = 100; // Default price
    
    // Current display state
    this.state = 'selection_prompt'; // 'selection_prompt', 'purchase_prompt', etc.
    
    // UI utilities
    this.renderer = new ShopUiRenderer(context);
    
    // Cache for font sizes
    this.titleFontSize = 28;
    this.subtitleFontSize = 16;
  }
  
  /**
   * Set the current price
   * @param {number} price - The current card price
   */
  setPrice(price) {
    this.price = price;
  }
  
  /**
   * Set the header display state
   * @param {string} state - New header state ('selection_prompt', 'purchase_prompt', etc.)
   */
  setState(state) {
    this.state = state;
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    // Get updated font sizes from layout manager
    const { titleFontSize, subtitleFontSize } = this.layoutManager.getHeaderFontSizes();
    this.titleFontSize = titleFontSize;
    this.subtitleFontSize = subtitleFontSize;
  }
  
  /**
   * Draw the header
   * @param {number} animProgress - Animation progress (0-1)
   */
  draw(animProgress) {
    const { context } = this;
    const { canvasWidth, canvasHeight } = this.layoutManager.getCanvasDimensions();
    
    // Get header positions from layout manager
    const { titleY, subtitleY } = this.layoutManager.getHeaderPositions();
    
    // Apply fade-in animation to header text
    const textAlpha = animProgress < 1 ? animProgress : 1;
    
    // Draw title with animation
    context.globalAlpha = textAlpha;
    context.font = `bold ${this.titleFontSize}px Arial`;
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Affirmation Shop', canvasWidth/2, titleY);
    
    // Draw subtitle based on current state
    context.font = `${this.subtitleFontSize}px Arial`;
    
    // Determine subtitle text based on state
    let subtitleText = this.getSubtitleText();
    
    // Check if we need to split text for narrow screens
    const isNarrow = canvasWidth < 500;
    
    if (isNarrow && this.state === 'selection_prompt') {
      // Split subtitle into two lines on narrow screens
      context.fillText('Select a card', canvasWidth/2, subtitleY);
      context.fillText(`(Cost: ${this.price} flowers)`, canvasWidth/2, subtitleY + this.subtitleFontSize * 1.2);
    } else {
      // Single line for wider screens or other states
      context.fillText(subtitleText, canvasWidth/2, subtitleY);
    }
    
    // Reset alpha
    context.globalAlpha = 1;
  }
  
  /**
   * Get the subtitle text based on current state
   * @returns {string} The subtitle text
   */
  getSubtitleText() {
    switch (this.state) {
      case 'selection_prompt':
        return `Select a card to reveal a special message (Cost: ${this.price} flowers)`;
        
      case 'purchase_prompt':
        return `Buy this card for ${this.price} flowers?`;
        
      case 'purchase_success':
        return `Card purchased! Enjoy your special message.`;
        
      case 'purchase_failure':
        return `Not enough flowers to purchase this card.`;
        
      case 'viewing_card':
        return `Choose another card or close to continue`;
        
      default:
        return `Select a card to reveal a special message`;
    }
  }
}

export default ShopHeader;