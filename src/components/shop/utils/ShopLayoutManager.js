/**
 * ShopLayoutManager.js - Manages responsive layout for shop UI
 * Enhanced with better card positioning and resize handling
 */
class ShopLayoutManager {
  /**
   * Create a new shop layout manager
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    
    // Layout constants expressed as percentage of canvas dimensions
    this.constants = {
      // Header area
      headerHeightPercent: 0.18,
      titlePositionPercent: 0.10,
      subtitleOffsetPercent: 0.06,
      
      // Card area - modified for better responsiveness
      cardAreaHeightPercent: 0.55,
      cardHeightPercent: 0.40,
      cardWidthRatio: 0.7,  // Card width as ratio of height
      cardHorizontalSpacingPercent: 0.03,
      cardVerticalPositionPercent: 0.45, // Center cards vertically
      
      // Button dimensions
      purchaseButtonWidthPercent: 0.30,
      purchaseButtonHeightPercent: 0.08,
      purchaseButtonOffsetPercent: 0.05,
      closeButtonSizePercent: 0.05,
      closeButtonMargin: 20
    };
    
    // Cache for computed layout values
    this.cache = {};
    
    // Calculate initial layout
    this.updateLayout();
  }
  
  /**
   * Update the layout cache based on current canvas dimensions
   */
  updateLayout() {
    // Clear the cache
    this.cache = {};
    
    // Store current canvas dimensions
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    
    // Calculate and cache common values
    this.calculateCardDimensions();
    this.calculateHeaderValues();
    this.calculateButtonDimensions();
  }
  
  /**
   * Get canvas dimensions
   * @returns {Object} Canvas width and height
   */
  getCanvasDimensions() {
    return {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight
    };
  }
  
  /**
   * Get canvas width
   * @returns {number} Current canvas width
   */
  getCanvasWidth() {
    return this.canvasWidth;
  }
  
  /**
   * Get canvas height
   * @returns {number} Current canvas height
   */
  getCanvasHeight() {
    return this.canvasHeight;
  }
  
  /**
   * Calculate and cache card dimensions
   */
  calculateCardDimensions() {
    // Base calculations on the smaller dimension (height or width)
    const smallerDimension = Math.min(this.canvasWidth, this.canvasHeight);
    
    // Calculate card height based on smaller dimension for better consistency
    const cardHeight = smallerDimension * this.constants.cardHeightPercent;
    
    // Calculate card width based on height and ratio
    const cardWidth = cardHeight * this.constants.cardWidthRatio;
    
    // Cache the values
    this.cache.cardDimensions = {
      width: cardWidth,
      height: cardHeight
    };
  }
  
  /**
   * Get card dimensions for rendering
   * @returns {Object} Card width and height
   */
  getCardDimensions() {
    return this.cache.cardDimensions;
  }
  
  /**
   * Calculate and cache header-related values
   */
  calculateHeaderValues() {
    // Calculate title Y position
    const titleY = this.canvasHeight * this.constants.titlePositionPercent;
    
    // Calculate subtitle Y position
    const subtitleY = titleY + (this.canvasHeight * this.constants.subtitleOffsetPercent);
    
    // Calculate title font size - responsive with min/max
    const titleFontSize = Math.min(32, Math.max(20, this.canvasHeight * 0.04));
    
    // Calculate subtitle font size - responsive with min/max
    const subtitleFontSize = Math.min(18, Math.max(12, this.canvasHeight * 0.025));
    
    // Cache the values
    this.cache.headerPositions = { titleY, subtitleY };
    this.cache.headerFontSizes = { titleFontSize, subtitleFontSize };
  }
  
  /**
   * Get header positions for rendering
   * @returns {Object} Title and subtitle Y positions
   */
  getHeaderPositions() {
    return this.cache.headerPositions;
  }
  
  /**
   * Get header font sizes
   * @returns {Object} Title and subtitle font sizes
   */
  getHeaderFontSizes() {
    return this.cache.headerFontSizes;
  }
  
  /**
   * Calculate and cache button dimensions
   */
  calculateButtonDimensions() {
    // Close button dimensions - scale with canvas but keep reasonable
    const closeButtonSize = Math.min(40, Math.max(20, this.canvasWidth * this.constants.closeButtonSizePercent));
    const closeButtonX = this.canvasWidth - closeButtonSize - this.constants.closeButtonMargin;
    const closeButtonY = this.constants.closeButtonMargin;
    
    // Purchase button base dimensions - scale with canvas
    const purchaseButtonHeight = Math.min(50, Math.max(30, this.canvasHeight * this.constants.purchaseButtonHeightPercent));
    const purchaseButtonWidth = Math.min(300, Math.max(150, this.canvasWidth * this.constants.purchaseButtonWidthPercent));
    
    // Cache the values
    this.cache.closeButton = {
      x: closeButtonX,
      y: closeButtonY,
      width: closeButtonSize,
      height: closeButtonSize
    };
    
    this.cache.purchaseButtonBase = {
      width: purchaseButtonWidth,
      height: purchaseButtonHeight,
      cornerRadius: purchaseButtonHeight * 0.25
    };
  }
  
  /**
   * Get the center position for cards in the card area
   * @returns {number} Y position for centering cards
   */
  getCardAreaVerticalCenter() {
    // Position cards at a consistent percentage of screen height
    return this.canvasHeight * this.constants.cardVerticalPositionPercent;
  }
  
  /**
   * Get positions for multiple cards
   * @param {number} cardCount - Number of cards to position
   * @returns {Array} Array of x,y positions for each card
   */
  getCardPositions(cardCount) {
    if (cardCount === 0) return [];
    
    const { width: cardWidth, height: cardHeight } = this.getCardDimensions();
    
    // Use a percentage of screen width for spacing, with minimum
    const cardSpacing = Math.max(10, this.canvasWidth * this.constants.cardHorizontalSpacingPercent);
    
    // Center the card group on screen
    const totalWidth = (cardWidth * cardCount) + (cardSpacing * (cardCount - 1));
    
    // Scale if needed to ensure cards fit on screen
    let scaleFactor = 1;
    const maxWidth = this.canvasWidth * 0.85; // Leave 15% margin
    
    if (totalWidth > maxWidth) {
      scaleFactor = maxWidth / totalWidth;
    }
    
    // Apply scaling
    const scaledCardWidth = cardWidth * scaleFactor;
    const scaledCardHeight = cardHeight * scaleFactor;
    const scaledSpacing = cardSpacing * scaleFactor;
    const scaledTotalWidth = (scaledCardWidth * cardCount) + (scaledSpacing * (cardCount - 1));
    
    // Center horizontally
    const startX = (this.canvasWidth - scaledTotalWidth) / 2;
    
    // Center cards vertically around the target position
    const centerY = this.getCardAreaVerticalCenter();
    const cardY = centerY - (scaledCardHeight / 2);
    
    // Create array of positions
    const positions = [];
    let currentX = startX;
    
    for (let i = 0; i < cardCount; i++) {
      positions.push({
        x: currentX,
        y: cardY,
        scale: scaleFactor // Include scale factor for rendering
      });
      
      currentX += scaledCardWidth + scaledSpacing;
    }
    
    return positions;
  }
  
  /**
   * Get position for a selected card (centered)
   * @returns {Object} X,Y position for the selected card
   */
  getSelectedCardPosition() {
    const { width: cardWidth, height: cardHeight } = this.getCardDimensions();
    const centerY = this.getCardAreaVerticalCenter();
    
    return {
      x: (this.canvasWidth - cardWidth) / 2,
      y: centerY - (cardHeight / 2),
      scale: 1 // No scaling for selected card
    };
  }
  
  /**
   * Get purchase button dimensions with price adjustment
   * @param {number} price - Current price (affects button width)
   * @returns {Object} Button dimensions
   */
  getPurchaseButtonDimensions(price) {
    const base = this.cache.purchaseButtonBase;
    
    // Adjust width based on price digit count
    const priceDigits = price.toString().length;
    const adjustedWidth = Math.max(base.width, base.width + (priceDigits - 3) * 15);
    
    return {
      width: adjustedWidth,
      height: base.height,
      cornerRadius: base.cornerRadius
    };
  }
  
  /**
   * Get purchase button position (below selected card)
   * @returns {Object} X,Y position for purchase button
   */
  getPurchaseButtonPosition() {
    const { width: cardWidth, height: cardHeight } = this.getCardDimensions();
    const buttonDimensions = this.cache.purchaseButtonBase;
    const selectedCardPos = this.getSelectedCardPosition();
    
    // Calculate button position centered below card
    return {
      x: (this.canvasWidth - buttonDimensions.width) / 2,
      y: selectedCardPos.y + cardHeight + (this.canvasHeight * this.constants.purchaseButtonOffsetPercent)
    };
  }
  
  /**
   * Get close button position and dimensions
   * @returns {Object} Close button position and size
   */
  getCloseButtonPosition() {
    return this.cache.closeButton;
  }
}

export default ShopLayoutManager;