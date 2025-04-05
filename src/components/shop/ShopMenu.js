/**
 * ShopMenu.js - Renders and manages the shop menu interface
 * Updated to include card purchasing with flower currency
 */
import AffirmationCard from './AffirmationCard.js';
import GameEvents from '../../events/GameEvents.js';
import { SHOP_EVENTS } from '../../events/EventTypes.js';

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
    this.isOpen = false;
    this.cards = [];
    this.selectedCard = null;
    this.selectedCardIndex = -1;
    this.showingPurchaseUI = false;
    this.currentPrice = currentPrice;
    this.purchaseResult = null; // 'success', 'failure', or null
    this.resultMessageTimer = 0;
    
    this.closeButton = {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      cornerRadius: 20
    };
    
    // Initialize purchase button with a wider width to accommodate text
    this.purchaseButton = {
      x: 0,
      y: 0,
      width: 280, // Wider default button
      height: 60, // Slightly taller for better visibility
      cornerRadius: 15, // More rounded corners to match the game's style
      visible: false
    };
    
    // Animation properties
    this.openAnimation = 0;
    this.isAnimating = false;
    
    // Create affirmation cards with provided messages
    this.createCards(messages);
  }
  
  /**
   * Create affirmation cards with the provided messages
   * @param {string[]} messages - Affirmation messages for cards
   */
  createCards(messages) {
    this.cards = [];
    
    // If no messages provided, use default ones (but this should be avoided)
    if (!messages || messages.length === 0) {
      messages = [
        "You are strong, beautiful, and capable of achieving anything you set your mind to.",
        "Every day with you is a blessing. Your smile lights up my world.",
        "You're not just my girlfriend, you're my best friend and my greatest adventure."
      ];
    }
    
    // Only use up to 3 cards at a time (or fewer if fewer are available)
    const displayCount = Math.min(messages.length, 3);
    const displayMessages = this.getRandomMessages(messages, displayCount);
    
    // Calculate card size based on canvas dimensions for better responsiveness
    const cardWidth = Math.min(this.canvas.width * 0.25, 200);
    const cardHeight = Math.min(this.canvas.height * 0.4, 300);
    const cardColors = ["#FFB7B2", "#F8E1EC", "#E3D1F4"];
    
    // Card positions will be set in updateCardPositions
    displayMessages.forEach((message, index) => {
      this.cards.push(new AffirmationCard(
        this.context,
        0, 0, // Placeholder positions, will be updated
        cardWidth,
        cardHeight,
        message,
        cardColors[index % cardColors.length],
        this.currentPrice
      ));
    });
    
    // Update card positions
    this.updateCardPositions();
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
    
    // Select random messages until we have enough or run out
    while (selectedMessages.length < count && availableMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMessages.length);
      selectedMessages.push(availableMessages.splice(randomIndex, 1)[0]);
    }
    
    return selectedMessages;
  }
  
  /**
   * Update cards with new messages and price
   * @param {string[]} messages - New affirmation messages
   * @param {number} currentPrice - Current card price
   */
  updateCards(messages, currentPrice) {
    this.currentPrice = currentPrice;
    this.createCards(messages);
    this.selectedCard = null;
    this.selectedCardIndex = -1;
    this.showingPurchaseUI = false;
    this.purchaseResult = null;
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
      
      // Update price on each card
      card.price = this.currentPrice;
      
      currentX += card.width + cardSpacing;
    });
    
    // Update close button position
    this.closeButton.x = width - this.closeButton.width - 20;
    this.closeButton.y = 20;
    
    // Update purchase button position
    this.purchaseButton.x = (width - this.purchaseButton.width) / 2;
    this.purchaseButton.y = height * 0.75;
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
      this.selectedCardIndex = -1;
      this.showingPurchaseUI = false;
      this.purchaseButtonState = 'normal';
      this.resultMessageTimer = 0;
      
      // Reset cards to initial state
      this.cards.forEach(card => {
        card.isSelected = false;
        card.isRevealed = false;
        card.isHovered = false;
      });
      
      // Update card positions
      this.updateCardPositions();
      
      // Register for mouse move events to handle card hover effects
      this.registerMouseMoveListener();
      
      // Emit shop open event
      GameEvents.emit(SHOP_EVENTS.OPEN, {
        time: Date.now(),
        price: this.currentPrice
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
      this.selectedCardIndex = -1;
      this.showingPurchaseUI = false;
      
      // Remove mouse move listener when shop is closed
      this.removeMouseMoveListener();
      
      // Emit shop close event
      GameEvents.emit(SHOP_EVENTS.CLOSE, {
        time: Date.now()
      });
    }
  }
  
  /**
   * Register mouse move listener for hover effects
   */
  registerMouseMoveListener() {
    // Define the handler function
    this.mouseMoveHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleMouseMove(x, y);
    };
    
    // Add event listener
    this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
  }
  
  /**
   * Remove mouse move listener
   */
  removeMouseMoveListener() {
    if (this.mouseMoveHandler) {
      this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    }
  }
  
  /**
   * Close the shop menu
   */
  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.selectedCard = null;
      this.selectedCardIndex = -1;
      this.showingPurchaseUI = false;
      
      // Emit shop close event
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
    
    // Check if purchase button was clicked when visible
    if (this.showingPurchaseUI && this.isPurchaseButtonVisible() && this.isPointInPurchaseButton(x, y)) {
      this.attemptPurchase();
      return true;
    }
    
    // If a card is already selected but not in purchase UI mode, clicking anywhere should return to card selection
    if (this.selectedCard && !this.showingPurchaseUI) {
      // Reset the selected card
      this.selectedCard.isSelected = false;
      this.selectedCard.animationProgress = 0;
      this.selectedCard = null;
      this.selectedCardIndex = -1;
      
      // Reset cards to their original positions
      this.updateCardPositions();
      
      return true;
    }
    
    // If in purchase UI mode and the selected card is clicked again, hide purchase UI
    if (this.showingPurchaseUI && this.selectedCard) {
      if (this.selectedCard.contains(x, y)) {
        this.showingPurchaseUI = false;
        // Don't deselect the card but reset its animation state for consistent sizing
        if (this.selectedCard) {
          this.selectedCard.animationProgress = 1; // Keep it at full size
        }
        return true;
      }
    }
    
    // Check if a card was clicked
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      if (card.contains(x, y)) {
        // If we're already showing a card and purchase UI is hidden, reset to card selection first
        if (this.selectedCard && !this.showingPurchaseUI) {
          // Reset all cards
          this.cards.forEach(c => {
            c.isSelected = false;
            c.animationProgress = 0;
          });
          this.updateCardPositions();
          this.selectedCard = null;
        }
        
        this.selectCard(card, i);
        return true;
      }
    }
    
    // If clicked outside and a card is selected, return to card selection
    if (this.selectedCard) {
      // Reset the selected card
      this.selectedCard.isSelected = false;
      this.selectedCard.animationProgress = 0;
      this.selectedCard = null;
      this.selectedCardIndex = -1;
      
      // Reset cards to their original positions for selection
      this.updateCardPositions();
      
      // Reset purchase UI
      this.showingPurchaseUI = false;
      
      return true;
    }
    
    return true; // Consume the click even if nothing was hit, to prevent clicks passing through
  }
  
  /**
   * Handle mouse move events for hover effects
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   */
  handleMouseMove(x, y) {
    if (!this.isOpen || this.selectedCard) return;
    
    // Update hover states for cards
    this.cards.forEach(card => {
      const isHovering = card.contains(x, y);
      if (isHovering !== card.isHovered) {
        card.setHovered(isHovering);
      }
    });
    
    // Also check hover state for purchase button
    if (this.showingPurchaseUI && this.isPurchaseButtonVisible()) {
      this.purchaseButton.isHovered = this.isPointInPurchaseButton(x, y);
    } else {
      this.purchaseButton.isHovered = false;
    }
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
   * Check if a point is inside the purchase button
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @returns {boolean} True if point is inside the purchase button
   */
  isPointInPurchaseButton(x, y) {
    const btn = this.purchaseButton;
    return (
      x >= btn.x &&
      x <= btn.x + btn.width &&
      y >= btn.y &&
      y <= btn.y + btn.height
    );
  }
  
  /**
   * Select a card
   * @param {AffirmationCard} card - The card to select
   * @param {number} index - Index of the card
   */
  selectCard(card, index) {
    this.selectedCard = card;
    this.selectedCardIndex = index;
    
    // Move non-selected cards out of view
    const canvasWidth = this.canvas.width;
    this.cards.forEach((c, i) => {
      if (i !== index) {
        c.moveTo(canvasWidth + 100, c.y); // Move off-screen to the right
      }
    });
    
    // Calculate a safe vertical position for the selected card that doesn't overlap with the header
    const headerSpace = this.canvas.height * 0.18; // Increased space for header
    const cardY = headerSpace + (this.canvas.height - headerSpace - card.height) / 2;
    
    // Center the selected card horizontally and position it lower to avoid header text
    card.moveTo(
      (this.canvas.width - card.width) / 2,
      cardY
    );
    
    // Select card but use a fixed scale rather than animated progress
    card.isSelected = true;
    card.animationProgress = 1; // Set to full immediately for consistent size
    
    // Show purchase UI
    this.showingPurchaseUI = true;
    this.updatePurchaseButtonPosition();
    
    // Emit card select event
    GameEvents.emit(SHOP_EVENTS.CARD_SELECT, {
      cardIndex: index,
      message: card.message
    });
  }
  
  /**
   * Show purchase option for a selected card
   * @param {number} cardIndex - Index of the selected card
   * @param {number} price - Current price of the card
   */
  showPurchaseOption(cardIndex, price) {
    if (cardIndex >= 0 && cardIndex < this.cards.length) {
      this.showingPurchaseUI = true;
      this.currentPrice = price;
      
      // Update the price on the card
      this.cards[cardIndex].price = price;
      
      // Ensure selected card is centered
      if (this.selectedCard) {
        // Calculate a safe vertical position for the selected card that doesn't overlap with the header
        const headerSpace = this.canvas.height * 0.22; // More space to avoid header
        const cardY = headerSpace + (this.canvas.height - headerSpace - this.selectedCard.height) / 2 - 20; // Slightly higher
        
        // Center the selected card horizontally
        this.selectedCard.moveTo(
          (this.canvas.width - this.selectedCard.width) / 2,
          cardY
        );
      }
      
      // Position the purchase button properly
      this.updatePurchaseButtonPosition();
    }
  }
  
  /**
   * Update the purchase button position and size
   */
  updatePurchaseButtonPosition() {
    const { width, height } = this.canvas;
    
    // Make button wider to accommodate text - using dynamic width based on price
    // The longer the price text, the wider the button
    const priceTextLength = this.currentPrice.toString().length;
    // Calculate base width + extra space for digits
    this.purchaseButton.width = Math.max(250, 200 + (priceTextLength * 12));
    
    // Position below the card
    if (this.selectedCard) {
      this.purchaseButton.x = (width - this.purchaseButton.width) / 2;
      this.purchaseButton.y = this.selectedCard.y + this.selectedCard.height + 30;
    } else {
      // Default position if no card is selected
      this.purchaseButton.x = (width - this.purchaseButton.width) / 2;
      this.purchaseButton.y = height * 0.75;
    }
  }
  
  /**
   * Check if purchase button should be visible
   * @returns {boolean} True if purchase button should be visible
   */
  isPurchaseButtonVisible() {
    return this.showingPurchaseUI && this.selectedCard && this.selectedCardIndex >= 0;
  }
  
  /**
   * Attempt to purchase the selected card
   */
  attemptPurchase() {
    if (this.selectedCardIndex >= 0 && this.selectedCardIndex < this.cards.length) {
      // Emit purchase attempt event
      GameEvents.emit(SHOP_EVENTS.CARD_PURCHASE_ATTEMPT, {
        cardIndex: this.selectedCardIndex,
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
    this.currentPrice = newPrice;
    
    // Reveal the card message fully
    if (this.selectedCard) {
      this.selectedCard.reveal();
    }
    
    // Show brief success animation then hide purchase UI
    this.purchaseButtonState = 'success';
    this.resultMessageTimer = 45; // Just 0.75 seconds (45 frames at 60fps)
    
    // After brief timer, hide the purchase UI
    setTimeout(() => {
      this.purchaseButtonState = 'normal';
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
    // Just show rejection animation on the button
    this.purchaseButtonState = 'failure';
    this.resultMessageTimer = 60; // 1 second (60 frames at 60fps)
    
    // Reset button state after animation
    setTimeout(() => {
      this.purchaseButtonState = 'normal';
    }, 1000);
    
    // Keep purchase UI open
    this.showingPurchaseUI = true;
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
    
    // Update result animation timer
    if (this.resultMessageTimer > 0) {
      this.resultMessageTimer--;
    }
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
      if (this.showingPurchaseUI) {
        context.fillText(`Buy this card for ${this.currentPrice} flowers?`, canvas.width/2, subtitleY);
      } else {
        context.fillText('Choose another card or close to continue', canvas.width/2, subtitleY);
      }
    } else {
      // Display price information in subtitle
      const subtitle = `Select a card to reveal a special message (Cost: ${this.currentPrice} flowers)`;
      
      // Determine if screen is small or ultra-wide - adjust text positioning accordingly
      const isNarrow = canvas.width < 500 || canvas.width / canvas.height < 1.5;
      
      if (isNarrow) {
        // Split onto two lines for narrow/small screens
        context.fillText('Select a card', canvas.width/2, subtitleY);
        context.fillText(`(Cost: ${this.currentPrice} flowers)`, canvas.width/2, subtitleY + subtitleFontSize * 1.2);
      } else {
        context.fillText(subtitle, canvas.width/2, subtitleY);
      }
    }
    
    // We no longer show transaction result messages - just change button colors instead
    
    // Draw close button
    this.drawCloseButton();
    
    // Draw purchase button if visible
    if (this.isPurchaseButtonVisible()) {
      this.drawPurchaseButton();
    }
    
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
   * Draw the purchase button
   */
  drawPurchaseButton() {
    const { context } = this;
    const { x, y, width, height, cornerRadius } = this.purchaseButton;
    
    // Draw button background with gradient based on current state
    context.beginPath();
    this.roundRect(context, x, y, width, height, cornerRadius);
    
    // Create different gradient based on button state
    const gradient = context.createLinearGradient(x, y, x, y + height);
    
    if (this.purchaseButtonState === 'success') {
      // Success state - green gradient
      gradient.addColorStop(0, '#8FD16F'); // Light green
      gradient.addColorStop(1, '#4CAF50'); // Dark green
      context.strokeStyle = '#32a852'; // Green border
    } 
    else if (this.purchaseButtonState === 'failure') {
      // Failure state - red gradient (but no shake animation)
      gradient.addColorStop(0, '#FF7676'); // Light red
      gradient.addColorStop(1, '#FF5555'); // Dark red
      context.strokeStyle = '#FF0000'; // Red border
    } 
    else {
      // Normal state - pink/purple theme
      gradient.addColorStop(0, '#FF9AA2'); // Light pink
      gradient.addColorStop(1, '#E3D1F4'); // Soft lavender
      context.strokeStyle = '#FF69B4'; // Hot pink border
    }
    
    context.fillStyle = gradient;
    context.fill();
    
    // Add a subtle border
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    
    // Add a subtle shadow for depth
    context.beginPath();
    this.roundRect(context, x + 2, y + 2, width, height, cornerRadius);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fill();
    context.closePath();
    
    // Draw a small flower icon
    const flowerSize = height * 0.4;
    const flowerX = x + width * 0.2;
    const flowerY = y + height/2;
    this.drawFlowerIcon(flowerX, flowerY, flowerSize);
    
    // Draw button text with improved styling
    context.font = `bold ${Math.min(22, height * 0.4)}px Arial`;
    
    // Change text color based on state
    context.fillStyle = this.purchaseButtonState === 'failure' ? '#FFFFFF' : '#333333';
    
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`Purchase (${this.currentPrice} flowers)`, x + width/2, y + height/2);
  }
  
  /**
   * Draw a simple flower icon
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} size - Icon size
   */
  drawFlowerIcon(x, y, size) {
    const { context } = this;
    const petalCount = 5;
    
    // Draw flower petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * size * 0.5;
      const petalY = y + Math.sin(angle) * size * 0.5;
      
      context.beginPath();
      context.arc(petalX, petalY, size * 0.4, 0, Math.PI * 2);
      context.fillStyle = '#FF9AA2'; // Light pink petals
      context.fill();
      context.closePath();
    }
    
    // Draw flower center
    context.beginPath();
    context.arc(x, y, size * 0.3, 0, Math.PI * 2);
    context.fillStyle = '#FFEB3B'; // Yellow center
    context.fill();
    context.closePath();
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    this.updateCardPositions();
    this.updatePurchaseButtonPosition();
    
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
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
}

export default ShopMenu;