/**
 * ShopMenu.js - Renders and manages the shop menu interface
 * Displays affirmation cards that can be selected
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
    
    // Create affirmation cards with messages
    this.createCards([
      "You are strong, beautiful, and capable of achieving anything you set your mind to.",
      "Every day with you is a blessing. Your smile lights up my world.",
      "You're not just my girlfriend, you're my best friend and my greatest adventure."
    ]);
    
    // Animation properties
    this.openAnimation = 0;
    this.isAnimating = false;
  }
  
  /**
   * Create affirmation cards with the provided messages
   * @param {string[]} messages - Affirmation messages for cards
   */
  createCards(messages) {
    this.cards = [];
    
    // Default card properties
    const cardWidth = this.canvas.width * 0.25;
    const cardHeight = this.canvas.height * 0.4;
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
   */
  updateCardPositions() {
    const { width, height } = this.canvas;
    const cardSpacing = width * 0.05;
    const totalWidth = this.cards.reduce((sum, card) => sum + card.width, 0) 
                     + cardSpacing * (this.cards.length - 1);
    const startX = (width - totalWidth) / 2;
    
    let currentX = startX;
    const centerY = height * 0.4;
    
    this.cards.forEach(card => {
      card.x = currentX;
      card.y = centerY - card.height / 2;
      card.targetX = card.x; // Set initial target position
      card.targetY = card.y; // Set initial target position
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
      
      // Emit shop open event
      GameEvents.emitUI(SHOP_EVENTS.OPEN, {
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
      
      // Emit shop close event
      GameEvents.emitUI(SHOP_EVENTS.CLOSE, {
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
    
    // Center the selected card
    card.moveTo(
      (this.canvas.width - card.width) / 2,
      (this.canvas.height - card.height) / 2
    );
    
    // Select and animate the card
    card.select();
    
    // Emit card select event
    GameEvents.emitUI(SHOP_EVENTS.CARD_SELECT, {
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
   * Draw the shop menu
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
    
    // Draw shop title
    const titleY = canvas.height * 0.15;
    context.font = 'bold 32px Arial';
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Affirmation Shop', canvas.width/2, titleY);
    
    // Draw subtitle
    context.font = '18px Arial';
    context.fillText('Pick a card to reveal a special message', canvas.width/2, titleY + 40);
    
    // Draw close button
    this.drawCloseButton();
    
    // If a card is selected, make it centered and larger
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
  }
}

export default ShopMenu;