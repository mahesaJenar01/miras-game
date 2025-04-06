/**
 * ShopLayoutManager.js - Manages responsive layout for shop UI
 * Centralizes all positioning and sizing calculations for consistency
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
        
        // Card area
        cardAreaHeightPercent: 0.55,
        cardHeightPercent: 0.40,
        cardWidthRatio: 0.7,  // Card width as ratio of height
        cardHorizontalSpacingPercent: 0.03,
        
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
      // Calculate card height based on canvas height
      const cardHeight = this.canvasHeight * this.constants.cardHeightPercent;
      
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
      // Close button dimensions
      const closeButtonSize = Math.min(40, this.canvasWidth * this.constants.closeButtonSizePercent);
      const closeButtonX = this.canvasWidth - closeButtonSize - this.constants.closeButtonMargin;
      const closeButtonY = this.constants.closeButtonMargin;
      
      // Purchase button base dimensions
      const purchaseButtonHeight = this.canvasHeight * this.constants.purchaseButtonHeightPercent;
      const purchaseButtonWidth = this.canvasWidth * this.constants.purchaseButtonWidthPercent;
      
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
      const headerHeight = this.canvasHeight * this.constants.headerHeightPercent;
      const cardAreaHeight = this.canvasHeight * this.constants.cardAreaHeightPercent;
      
      // Position cards in the middle of the card area below header
      return headerHeight + (cardAreaHeight / 2);
    }
    
    /**
     * Get positions for multiple cards
     * @param {number} cardCount - Number of cards to position
     * @returns {Array} Array of x,y positions for each card
     */
    getCardPositions(cardCount) {
      if (cardCount === 0) return [];
      
      const { width: cardWidth, height: cardHeight } = this.getCardDimensions();
      const cardSpacing = this.canvasWidth * this.constants.cardHorizontalSpacingPercent;
      
      // Calculate total width of all cards plus spacing
      const totalWidth = (cardWidth * cardCount) + (cardSpacing * (cardCount - 1));
      
      // Scale down cards if they don't fit
      let scaleFactor = 1;
      if (totalWidth > this.canvasWidth * 0.9) {
        scaleFactor = (this.canvasWidth * 0.9) / totalWidth;
      }
      
      // Calculate final card width with scaling
      const finalCardWidth = cardWidth * scaleFactor;
      const finalTotalWidth = (finalCardWidth * cardCount) + (cardSpacing * (cardCount - 1));
      
      // Calculate starting X position to center all cards
      const startX = (this.canvasWidth - finalTotalWidth) / 2;
      
      // Calculate Y position for cards
      const centerY = this.getCardAreaVerticalCenter();
      const cardY = centerY - ((cardHeight * scaleFactor) / 2);
      
      // Create array of positions
      const positions = [];
      let currentX = startX;
      
      for (let i = 0; i < cardCount; i++) {
        positions.push({
          x: currentX,
          y: cardY
        });
        
        currentX += finalCardWidth + cardSpacing;
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
        y: centerY - (cardHeight / 2)
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