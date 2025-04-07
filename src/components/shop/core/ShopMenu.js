/**
 * ShopMenu.js - Core coordinator for the shop interface
 * Improved version with card refreshing and empty state handling
 */
import ShopCardDisplay from '../ui/ShopCardDisplay.js';
import ShopHeader from '../ui/ShopHeader.js';
import ShopPurchaseButton from '../ui/ShopPurchaseButton.js';
import ShopCloseButton from '../ui/ShopCloseButton.js';
import ShopLayoutManager from '../utils/ShopLayoutManager.js';
import ShopAnimator from '../utils/ShopAnimator.js';
import { SHOP_EVENTS } from '../../../events/EventTypes.js';
import GameEvents from '../../../events/GameEvents.js'

class ShopMenu {
  /**
   * Create a new shop menu
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {string[]} messages - Available affirmation messages
   * @param {number} currentPrice - Current card price
   */
  constructor(context, canvas, messages = [], currentPrice = 100) {
    this.context = context;
    this.canvas = canvas;
    this.currentPrice = currentPrice;
    
    // State flags
    this.isOpen = false;
    this.showingPurchaseUI = false;
    
    // Create layout manager to handle positioning
    this.layoutManager = new ShopLayoutManager(canvas);
    
    // Create animator to handle transitions
    this.animator = new ShopAnimator();
    
    // Create shop components
    this.header = new ShopHeader(context, this.layoutManager);
    this.cardDisplay = new ShopCardDisplay(context, this.layoutManager);
    this.purchaseButton = new ShopPurchaseButton(context, this.layoutManager);
    this.closeButton = new ShopCloseButton(context, this.layoutManager);
    
    // Initialize with content
    this.updateCards(messages, currentPrice);
  }
  
  /**
   * Update cards with new messages and price
   * @param {string[]} messages - New affirmation messages
   * @param {number} currentPrice - Current card price
   */
  updateCards(messages, currentPrice) {
    this.currentPrice = currentPrice;
    
    // Check if we have any messages available
    if (!messages || messages.length === 0) {
      // If no messages, show empty state
      this.showEmptyState();
      return;
    }
    
    // Initialize card display with messages
    this.cardDisplay.setCards(messages, currentPrice);
    
    // Update components that need the price
    this.header.setPrice(currentPrice);
    this.purchaseButton.setPrice(currentPrice);
    
    // Reset UI state
    this.showingPurchaseUI = false;
    
    // Update layout
    this.layoutManager.updateLayout();
  }
  
  /**
   * Show empty state when no cards are available
   */
  showEmptyState() {
    // Clear cards
    this.cardDisplay.clearCards();
    
    // Update header to show empty state
    this.header.setState('empty');
    
    // Hide purchase UI
    this.showingPurchaseUI = false;
    this.purchaseButton.hide();
  }
  
  /**
   * Open the shop menu with animation
   */
  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      
      // Reset UI state
      this.showingPurchaseUI = false;
      this.cardDisplay.clearSelection();
      
      // Start the opening animation
      this.animator.startOpenAnimation();
      
      // Update layout for current canvas size
      this.layoutManager.updateLayout();
      
      // Emit shop open event
      GameEvents.emit(SHOP_EVENTS.OPEN, {
        time: Date.now(),
        price: this.currentPrice
      });
    }
  }
  
  /**
   * Close the shop menu
   */
  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.showingPurchaseUI = false;
      
      // Emit shop close event
      GameEvents.emit(SHOP_EVENTS.CLOSE, {
        time: Date.now()
      });
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Update the layout manager
    this.layoutManager.updateLayout();
    
    // Notify components about resize
    this.header.handleResize();
    this.cardDisplay.handleResize();
    this.purchaseButton.handleResize();
    this.closeButton.handleResize();
  }
  
  /**
   * Handle click events
   * @param {number} x - Click X position
   * @param {number} y - Click Y position
   * @returns {boolean} True if the click was handled
   */
  handleClick(x, y) {
    if (!this.isOpen) return false;
    
    // Check if close button was clicked
    if (this.closeButton.isClicked(x, y)) {
      this.close();
      return true;
    }
    
    // If purchase UI is showing, check purchase button
    if (this.showingPurchaseUI && this.purchaseButton.isClicked(x, y)) {
      this.attemptPurchase();
      return true;
    }
    
    // Handle card display clicks, which may change selection
    const cardDisplayResult = this.cardDisplay.handleClick(x, y);
    
    // If a card was selected, update purchase UI
    if (cardDisplayResult.action === 'selected') {
      this.showingPurchaseUI = true;
      this.purchaseButton.show();
      
      // Update header to show purchase prompt
      this.header.setState('purchase_prompt');
      
      // Emit card select event
      GameEvents.emit(SHOP_EVENTS.CARD_SELECT, {
        cardIndex: cardDisplayResult.cardIndex,
        message: cardDisplayResult.message
      });
      
      return true;
    } else if (cardDisplayResult.action === 'deselected') {
      // Card was deselected, hide purchase UI
      this.showingPurchaseUI = false;
      this.purchaseButton.hide();
      
      // Update header to show selection prompt
      this.header.setState('selection_prompt');
      
      return true;
    }
    
    return true; // Consume click even if nothing specific was hit
  }
  
  /**
   * Handle mouse move events for hover effects
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   */
  handleMouseMove(x, y) {
    if (!this.isOpen) return;
    
    // Update hover states in components
    this.cardDisplay.handleMouseMove(x, y);
    this.purchaseButton.handleMouseMove(x, y);
    this.closeButton.handleMouseMove(x, y);
  }
  
  /**
   * Show purchase option for a selected card
   * @param {number} cardIndex - Index of the selected card
   * @param {number} price - Current price of the card
   */
  showPurchaseOption(cardIndex, price) {
    if (cardIndex >= 0) {
      this.showingPurchaseUI = true;
      this.currentPrice = price;
      
      // Select the card in the card display
      this.cardDisplay.selectCard(cardIndex);
      
      // Update the purchase button
      this.purchaseButton.setPrice(price);
      this.purchaseButton.show();
      
      // Update header to prompt purchase
      this.header.setState('purchase_prompt');
    }
  }
  
  /**
   * Attempt to purchase the selected card
   */
  attemptPurchase() {
    const selectedCardInfo = this.cardDisplay.getSelectedCardInfo();
    
    if (selectedCardInfo) {
      // Emit purchase attempt event
      GameEvents.emit(SHOP_EVENTS.CARD_PURCHASE_ATTEMPT, {
        cardIndex: selectedCardInfo.index,
        price: this.currentPrice
      });
    }
  }
  
  /**
   * Handle successful purchase
   * @param {number} cardIndex - Index of the purchased card
   * @param {number} newPrice - New price for next card
   */
  handlePurchaseSuccess(cardIndex, newPrice) {
    // Update the price
    this.currentPrice = newPrice;
    
    // Reveal the card message
    this.cardDisplay.revealCard(cardIndex);
    
    // Show success animation on purchase button
    this.purchaseButton.setState('success');
    
    // Update header message
    this.header.setState('purchase_success');
    
    // Hide purchase UI after a delay
    setTimeout(() => {
      this.purchaseButton.setState('normal');
      this.showingPurchaseUI = false;
    }, 750);
  }
  
  /**
   * Handle failed purchase (not enough flowers)
   * @param {number} cardIndex - Index of the card
   * @param {number} balance - Current flower balance
   * @param {number} price - Card price
   */
  handlePurchaseFailure(cardIndex, balance, price) {
    // Show failure animation on purchase button
    this.purchaseButton.setState('failure');
    
    // Update header to show failure message
    this.header.setState('purchase_failure');
    
    // Reset button state after animation
    setTimeout(() => {
      this.purchaseButton.setState('normal');
    }, 1000);
    
    // Keep purchase UI open
    this.showingPurchaseUI = true;
  }
  
  /**
   * Update the shop menu state
   */
  update() {
    if (!this.isOpen && !this.animator.isAnimating()) return;
    
    // Update animator
    this.animator.update();
    
    // Update components
    this.cardDisplay.update();
    this.purchaseButton.update();
  }
  
  /**
   * Draw the shop menu
   */
  draw() {
    if (!this.isOpen && !this.animator.isAnimating()) return;
    
    // Save context state
    this.context.save();
    
    // Get current animation progress from animator
    const animProgress = this.animator.getProgress();
    
    // Draw background with animation progress
    this.drawBackground(animProgress);
    
    // Draw components
    this.header.draw(animProgress);
    this.cardDisplay.draw(animProgress);
    this.closeButton.draw(animProgress);
    
    // Draw purchase button if visible
    if (this.showingPurchaseUI) {
      this.purchaseButton.draw(animProgress);
    }
    
    // Restore context state
    this.context.restore();
  }
  
  /**
   * Draw the semi-transparent background
   * @param {number} animProgress - Animation progress (0-1)
   */
  drawBackground(animProgress) {
    const { context, canvas } = this;
    
    // Calculate alpha based on animation progress
    const alpha = this.animator.isAnimating() ? animProgress * 0.7 : 0.7;
    
    // Draw overlay
    context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export default ShopMenu;