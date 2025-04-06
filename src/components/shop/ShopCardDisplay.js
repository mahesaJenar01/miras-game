/**
 * ShopCardDisplay.js - Manages the card collection in the shop
 * Handles card creation, selection, positioning and animation
 */
import AffirmationCard from './AffirmationCard.js';
import ShopUiRenderer from './ShopUiRenderer.js';

class ShopCardDisplay {
  /**
   * Create a new shop card display
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {ShopLayoutManager} layoutManager - The layout manager
   */
  constructor(context, layoutManager) {
    this.context = context;
    this.layoutManager = layoutManager;
    
    // Card collection and state
    this.cards = [];
    this.selectedCard = null;
    this.selectedCardIndex = -1;
    
    // Card colors
    this.cardColors = ["#FFB7B2", "#F8E1EC", "#E3D1F4"];
    
    // UI utilities
    this.renderer = new ShopUiRenderer(context);
  }
  
  /**
   * Set cards with new messages
   * @param {string[]} messages - Affirmation messages for cards
   * @param {number} price - Current card price
   */
  setCards(messages, price) {
    // Clear existing cards
    this.cards = [];
    this.selectedCard = null;
    this.selectedCardIndex = -1;
    
    // Get up to 3 random messages
    const displayCount = Math.min(messages.length, 3);
    const displayMessages = this.getRandomMessages(messages, displayCount);
    
    // Get card dimensions from layout manager
    const cardDimensions = this.layoutManager.getCardDimensions();
    
    // Create card objects with initial positions
    displayMessages.forEach((message, index) => {
      const card = new AffirmationCard(
        this.context,
        0, 0, // Temporary positions
        cardDimensions.width,
        cardDimensions.height,
        message,
        this.cardColors[index % this.cardColors.length],
        price
      );
      
      this.cards.push(card);
    });
    
    // Update card positions
    this.updateCardPositions();
  }
  
  /**
   * Update card positions based on layout manager
   */
  updateCardPositions() {
    const positions = this.layoutManager.getCardPositions(this.cards.length);
    
    // Apply positions to cards
    this.cards.forEach((card, index) => {
      card.x = positions[index].x;
      card.y = positions[index].y;
      card.targetX = positions[index].x;
      card.targetY = positions[index].y;
    });
  }
  
  /**
   * Get random messages from the available pool
   * @param {string[]} messages - All available messages
   * @param {number} count - Number of messages to select
   * @returns {string[]} Randomly selected messages
   */
  getRandomMessages(messages, count) {
    // Clone the array to avoid modifying the original
    const availableMessages = [...messages];
    const selectedMessages = [];
    
    // Select random messages
    while (selectedMessages.length < count && availableMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMessages.length);
      selectedMessages.push(availableMessages.splice(randomIndex, 1)[0]);
    }
    
    return selectedMessages;
  }
  
  /**
   * Handle click events
   * @param {number} x - Click X position
   * @param {number} y - Click Y position
   * @returns {Object} Result object with action and optional card info
   */
  handleClick(x, y) {
    // If a card is already selected
    if (this.selectedCard) {
      // Check if click is on the selected card
      if (this.selectedCard.contains(x, y)) {
        // Just return the current selection
        return {
          action: 'none',
          cardIndex: this.selectedCardIndex
        };
      } else {
        // Clicked outside, deselect current card
        this.clearSelection();
        
        // Return deselection action
        return {
          action: 'deselected'
        };
      }
    }
    
    // Check if a card was clicked when none was selected
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      if (card.contains(x, y)) {
        // Select this card
        this.selectCard(i);
        
        // Return selection action
        return {
          action: 'selected',
          cardIndex: i,
          message: card.message
        };
      }
    }
    
    // No card was clicked
    return { action: 'none' };
  }
  
  /**
   * Handle mouse move events for hover effects
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   */
  handleMouseMove(x, y) {
    // Skip hover effects if a card is selected
    if (this.selectedCard) return;
    
    // Update hover states for all cards
    this.cards.forEach(card => {
      const isHovering = card.contains(x, y);
      if (isHovering !== card.isHovered) {
        card.setHovered(isHovering);
      }
    });
  }
  
  /**
   * Select a specific card
   * @param {number} index - Index of the card to select
   */
  selectCard(index) {
    // Validate index
    if (index < 0 || index >= this.cards.length) return;
    
    // Clear any previous selection
    this.clearSelection();
    
    // Set the new selection
    this.selectedCard = this.cards[index];
    this.selectedCardIndex = index;
    this.selectedCard.isSelected = true;
    
    // Move other cards off-screen
    const canvasWidth = this.layoutManager.getCanvasWidth();
    this.cards.forEach((card, i) => {
      if (i !== index) {
        card.moveTo(canvasWidth + 100, card.y);
      }
    });
    
    // Center the selected card
    const centerPosition = this.layoutManager.getSelectedCardPosition();
    this.selectedCard.moveTo(centerPosition.x, centerPosition.y);
  }
  
  /**
   * Clear the current card selection
   */
  clearSelection() {
    if (this.selectedCard) {
      this.selectedCard.isSelected = false;
      this.selectedCard = null;
      this.selectedCardIndex = -1;
      
      // Reset all cards to their normal positions
      this.updateCardPositions();
    }
  }
  
  /**
   * Reveal the message on a card (after purchase)
   * @param {number} index - Index of the card to reveal
   */
  revealCard(index) {
    if (index >= 0 && index < this.cards.length) {
      this.cards[index].reveal();
    }
  }
  
  /**
   * Get information about the currently selected card
   * @returns {Object|null} Selected card info or null if none selected
   */
  getSelectedCardInfo() {
    if (this.selectedCard && this.selectedCardIndex >= 0) {
      return {
        index: this.selectedCardIndex,
        message: this.selectedCard.message
      };
    }
    return null;
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    // Update card dimensions
    const cardDimensions = this.layoutManager.getCardDimensions();
    this.cards.forEach(card => {
      card.width = cardDimensions.width;
      card.height = cardDimensions.height;
    });
    
    // If a card is selected, center it properly
    if (this.selectedCard) {
      const centerPosition = this.layoutManager.getSelectedCardPosition();
      this.selectedCard.moveTo(centerPosition.x, centerPosition.y);
    } else {
      // Otherwise update all card positions
      this.updateCardPositions();
    }
  }
  
  /**
   * Update all cards (animations, etc.)
   */
  update() {
    // Update all cards
    this.cards.forEach(card => card.update());
  }
  
  /**
   * Draw all cards with animation
   * @param {number} animProgress - Animation progress (0-1)
   */
  draw(animProgress) {
    if (this.selectedCard) {
      // When a card is selected, only draw that one
      this.selectedCard.draw();
    } else {
      // Draw all cards with staggered entrance animation
      this.cards.forEach((card, index) => {
        // Calculate staggered animation progress
        const cardDelay = index * 0.1;
        const cardProgress = Math.max(0, Math.min(1, (animProgress - cardDelay) * 2));
        
        if (cardProgress > 0) {
          // Apply fade-in effect during animation
          if (animProgress < 1) {
            this.context.globalAlpha = cardProgress;
          }
          
          card.draw();
          
          // Reset alpha
          if (animProgress < 1) {
            this.context.globalAlpha = 1;
          }
        }
      });
    }
  }
}

export default ShopCardDisplay;