/**
 * ShopMenu.js - Renders and manages the shop menu interface
 * Displays affirmation cards that can be selected
 * Updated to fix text overlap when a card is selected
 */
import AffirmationCard from './AffirmationCard.js';
import GameEvents from '../../events/GameEvents.js';
import { SHOP_EVENTS } from '../../events/EventTypes.js';

class ShopMenu {
  /**
   * Create a new shop menu
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    this.isOpen = false;
    this.cards = [];
    this.selectedCard = null;
    this.closeButton = {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      cornerRadius: 20
    };
    
    // Animation properties
    this.openAnimation = 0;
    this.isAnimating = false;
    
    // Create affirmation cards with messages - will be positioned later
    this.createCards([
      "You are strong, beautiful, and capable of achieving anything you set your mind to.",
      "Every day with you is a blessing. Your smile lights up my world.",
      "You're not just my girlfriend, you're my best friend and my greatest adventure."
    ]);
  }
  
  /**
   * Create affirmation cards with the provided messages
   * @param {string[]} messages - Affirmation messages for cards
   */
  createCards(messages) {
    this.cards = [];
    
    // Calculate card size based on canvas dimensions for better responsiveness
    // Make cards smaller on smaller screens
    const cardWidth = Math.min(this.canvas.width * 0.25, 200);
    const cardHeight = Math.min(this.canvas.height * 0.4, 300);
    const cardColors = ["#FFB7B2", "#F8E1EC", "#E3D1F4"];
    
    // Card positions will be set in updateCardPositions
    messages.forEach((message, index) => {
      this.cards.push(new AffirmationCard(
        this.context,
        0, 0, // Placeholder positions, will be updated
        cardWidth,
        cardHeight,
        message,
        cardColors[index % cardColors.length]
      ));
    });
    
    // Update card positions
    this.updateCardPositions();
  }
  
  /**
   * Update card positions based on canvas size
   * Ensures proper spacing and prevents overlap
   */
  updateCardPositions() {
    const { width, height } = this.canvas;
    
    // Dynamically calculate card spacing based on canvas width
    const cardCount = this.cards.length;
    let cardSpacing = width * 0.05;
    
    // Calculate total width needed
    let totalWidth = this.cards.reduce((sum, card) => sum + card.width, 0) + 
                    cardSpacing * (cardCount - 1);
    
    // If total width is too large for the canvas, reduce spacing and/or card width
    if (totalWidth > width * 0.9) {
      // First try reducing spacing
      cardSpacing = Math.max(10, width * 0.02);
      totalWidth = this.cards.reduce((sum, card) => sum + card.width, 0) + 
                  cardSpacing * (cardCount - 1);
      
      // If still too large, reduce card width
      if (totalWidth > width * 0.9) {
        const newCardWidth = (width * 0.9 - cardSpacing * (cardCount - 1)) / cardCount;
        this.cards.forEach(card => {
          card.width = newCardWidth;
          // Maintain aspect ratio
          card.height = newCardWidth * 1.5;
        });
        
        totalWidth = this.cards.reduce((sum, card) => sum + card.width, 0) + 
                    cardSpacing * (cardCount - 1);
      }
    }
    
    // Center the cards horizontally
    const startX = (width - totalWidth) / 2;
    
    // Calculate a safer vertical position - position cards further down
    // to leave more space for title and subtitle
    const titleAreaHeight = height * 0.22; // Reserve 22% of height for title and subtitle
    const centerY = titleAreaHeight + (height - titleAreaHeight) * 0.4; // Position in top part of remaining space
    
    // Position cards
    let currentX = startX;
    
    this.cards.forEach(card => {
      card.x = currentX;
      card.y = centerY - card.height / 2;
      card.targetX = card.x;
      card.targetY = card.y;
      currentX += card.width + cardSpacing;
    });
    
    // Update close button position
    this.closeButton.x = width - this.closeButton.width - 20;
    this.closeButton.y = 20;
  }
  
  /**
   * Open the shop menu with animation
   */
  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      this.isAnimating = true;
      this.openAnimation = 0;
      this.selectedCard = null;
      
      // Reset cards to initial state
      this.cards.forEach(card => {
        card.isSelected = false;
        card.isRevealed = false;
      });
      
      // Update card positions
      this.updateCardPositions();
      
      // Emit shop open event - use emit directly to avoid UI event type warning
      GameEvents.emit(SHOP_EVENTS.OPEN, {
        time: Date.now()
      });
      
      // Start opening animation
      this.animateOpening();
    }
  }
  
  /**
   * Close the shop menu
   */
  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.selectedCard = null;
      
      // Emit shop close event - use emit directly to avoid UI event type warning
      GameEvents.emit(SHOP_EVENTS.CLOSE, {
        time: Date.now()
      });
    }
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
    if (this.isPointInCloseButton(x, y)) {
      this.close();
      return true;
    }
    
    // If a card is already selected, clicking anywhere else does nothing
    if (this.selectedCard) return true;
    
    // Check if a card was clicked
    for (const card of this.cards) {
      if (card.contains(x, y)) {
        this.selectCard(card);
        return true;
      }
    }
    
    return true; // Consume the click even if nothing was hit, to prevent clicks passing through
  }
  
  /**
   * Check if a point is inside the close button
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @returns {boolean} True if point is inside the close button
   */
  isPointInCloseButton(x, y) {
    const btn = this.closeButton;
    const dx = x - (btn.x + btn.width/2);
    const dy = y - (btn.y + btn.height/2);
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    return distance <= btn.width/2;
  }
  
  /**
   * Select a card
   * @param {AffirmationCard} card - The card to select
   */
  selectCard(card) {
    this.selectedCard = card;
    
    // Move non-selected cards out of view
    const canvasWidth = this.canvas.width;
    this.cards.forEach(c => {
      if (c !== card) {
        c.moveTo(canvasWidth + 100, c.y); // Move off-screen to the right
      }
    });
    
    // Calculate a safe vertical position for the selected card that doesn't overlap with the header
    // Reserve more space at the top (30% of canvas height) for title and subtitle
    const headerSpace = this.canvas.height * 0.1;
    const cardY = headerSpace + (this.canvas.height - headerSpace - card.height) / 2;
    
    // Center the selected card horizontally and position it lower to avoid header text
    card.moveTo(
      (this.canvas.width - card.width) / 2,
      cardY
    );
    
    // Select and animate the card
    card.select();
    
    // Emit card select event - use emit directly to avoid event type warning
    GameEvents.emit(SHOP_EVENTS.CARD_SELECT, {
      cardIndex: this.cards.indexOf(card),
      message: card.message
    });
  }
  
  /**
   * Animate the menu opening
   */
  animateOpening() {
    if (this.isAnimating) {
      this.openAnimation += 0.05;
      
      if (this.openAnimation >= 1) {
        this.openAnimation = 1;
        this.isAnimating = false;
      } else {
        requestAnimationFrame(() => this.animateOpening());
      }
    }
  }
  
  /**
   * Update the shop menu
   */
  update() {
    if (!this.isOpen) return;
    
    // Update cards
    this.cards.forEach(card => {
      card.update();
    });
  }
  
  /**
   * Draw the shop menu with improved text layout
   */
  draw() {
    if (!this.isOpen && !this.isAnimating) return;
    
    const { context, canvas } = this;
    
    // Save context state
    context.save();
    
    // Draw semi-transparent overlay with animation
    const alpha = this.isAnimating ? this.openAnimation * 0.7 : 0.7;
    context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate positioning based on canvas size
    const titleY = canvas.height * 0.12; // Move title higher
    
    // Draw shop title - responsive font size
    const titleFontSize = Math.min(32, Math.max(20, canvas.width * 0.04));
    context.font = `bold ${titleFontSize}px Arial`;
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Affirmation Shop', canvas.width/2, titleY);
    
    // Draw subtitle with improved spacing
    const subtitleFontSize = Math.min(18, Math.max(12, canvas.width * 0.025));
    const subtitleY = titleY + titleFontSize * 1.1; // Closer to title
    
    context.font = `${subtitleFontSize}px Arial`;
    
    // Check if there's a selected card
    if (this.selectedCard) {
      context.fillText('Choose another card or close to continue', canvas.width/2, subtitleY);
    } else {
      // Word wrap for subtitle if needed
      const subtitle = 'Pick a card to reveal a special message';
      
      // Determine if screen is small or ultra-wide - adjust text positioning accordingly
      const isNarrow = canvas.width < 500 || canvas.width / canvas.height < 1.5;
      
      if (isNarrow) {
        // Split onto two lines for narrow/small screens
        context.fillText('Pick a card', canvas.width/2, subtitleY);
        context.fillText('to reveal a special message', canvas.width/2, subtitleY + subtitleFontSize * 1.2);
      } else {
        context.fillText(subtitle, canvas.width/2, subtitleY);
      }
    }
    
    // Draw close button
    this.drawCloseButton();
    
    // Draw cards
    if (this.selectedCard) {
      // Draw only the selected card
      this.selectedCard.draw();
    } else {
      // Draw all cards with animation
      this.cards.forEach(card => {
        // Apply entrance animation
        if (this.isAnimating) {
          const cardIndex = this.cards.indexOf(card);
          const cardDelay = cardIndex * 0.1;
          const cardProgress = Math.max(0, Math.min(1, (this.openAnimation - cardDelay) * 2));
          
          if (cardProgress > 0) {
            context.globalAlpha = cardProgress;
            card.draw();
            context.globalAlpha = 1;
          }
        } else {
          card.draw();
        }
      });
    }
    
    // Restore context state
    context.restore();
  }
  
  /**
   * Draw the close button
   */
  drawCloseButton() {
    const { context } = this;
    const { x, y, width, height } = this.closeButton;
    
    // Draw button circle
    context.beginPath();
    context.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fill();
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    
    // Draw X
    const padding = width * 0.3;
    context.beginPath();
    context.moveTo(x + padding, y + padding);
    context.lineTo(x + width - padding, y + height - padding);
    context.moveTo(x + width - padding, y + padding);
    context.lineTo(x + padding, y + height - padding);
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 3;
    context.stroke();
    context.closePath();
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    this.updateCardPositions();
    
    // If a card is selected, reposition it to maintain proper spacing
    if (this.selectedCard) {
      // Calculate safe positioning for the selected card
      const headerSpace = this.canvas.height * 0.1;
      const cardY = headerSpace + (this.canvas.height - headerSpace - this.selectedCard.height) / 2;
      
      this.selectedCard.moveTo(
        (this.canvas.width - this.selectedCard.width) / 2,
        cardY
      );
    }
  }
}

export default ShopMenu;