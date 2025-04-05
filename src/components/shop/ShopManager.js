/**
 * ShopManager.js - Manages shop functionality and coordinates between components
 * Updated to include trading mechanism for buying cards with flowers
 */
import ShopMenu from './ShopMenu.js';
import GameEvents from '../../events/GameEvents.js';
import { SHOP_EVENTS, INPUT_EVENTS, GAME_EVENTS, COLLECTIBLE_EVENTS } from '../../events/EventTypes.js';

class ShopManager {
  /**
   * Create a new shop manager
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    
    // Card pricing and purchase tracking
    this.basePrice = 100; // Initial card price (100 flowers)
    this.currentPrice = this.basePrice;
    this.priceIncreaseMin = 0.4; // 40% minimum increase
    this.priceIncreaseMax = 0.5; // 50% maximum increase
    
    // Track purchased cards to avoid showing them again
    this.purchasedCards = [];
    
    // Track if the user has attempted to buy a card they couldn't afford
    this.lastAttemptedPurchase = null;
    
    // All available affirmation messages (original 3 plus 3 new ones)
    this.allAffirmations = [
      "You are strong, beautiful, and capable of achieving anything you set your mind to.",
      "Every day with you is a blessing. Your smile lights up my world.",
      "You're not just my girlfriend, you're my best friend and my greatest adventure.",
      "Your kindness and compassion make the world a better place. I'm so lucky to have you.",
      "In a universe full of stars, you shine the brightest to me.",
      "Your laugh is my favorite sound, and your happiness is my greatest goal."
    ];
    
    // Create the shop menu with available affirmations
    this.shopMenu = new ShopMenu(context, canvas, this.getAvailableAffirmations(), this.currentPrice);
    
    // Register event listeners
    this.registerEventListeners();
    
    // Load saved state if available
    this.loadSavedState();
  }
  
  /**
   * Register event listeners for shop interactions
   */
  registerEventListeners() {
    // Listen for shop button presses
    GameEvents.on(INPUT_EVENTS.BUTTON_PRESS, (data) => {
      if (data.buttonKey === 'shop') {
        this.openShop();
      }
    });
    
    // Listen for mouse clicks to handle shop interactions
    GameEvents.on(INPUT_EVENTS.MOUSE_DOWN, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleClick(data.x, data.y);
      }
    });
    
    // Listen for mouse move events to handle hover effects
    GameEvents.on(INPUT_EVENTS.MOUSE_MOVE, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleMouseMove(data.x, data.y);
      }
    });
    
    // Listen for touch events for mobile
    GameEvents.on(INPUT_EVENTS.TOUCH_START, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleClick(data.x, data.y);
      }
    });
    
    // Listen for game resize to update positions
    GameEvents.on(GAME_EVENTS.RESIZE, () => {
      if (this.shopMenu) {
        this.shopMenu.handleResize();
      }
    });
    
    // Listen for card selection events
    GameEvents.on(SHOP_EVENTS.CARD_SELECT, (data) => {
      this.handleCardSelect(data);
    });
    
    // Listen for card purchase attempts
    GameEvents.on(SHOP_EVENTS.CARD_PURCHASE_ATTEMPT, (data) => {
      this.attemptPurchaseCard(data);
    });
  }
  
  /**
   * Load saved state from localStorage if available
   */
  loadSavedState() {
    try {
      const savedState = localStorage.getItem('shopState');
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.currentPrice) this.currentPrice = state.currentPrice;
        if (state.purchasedCards) this.purchasedCards = state.purchasedCards;
        
        // Update the shop menu with current price and available cards
        this.shopMenu.updateCards(this.getAvailableAffirmations(), this.currentPrice);
      }
    } catch (e) {
      console.error('Error loading saved shop state:', e);
    }
  }
  
  /**
   * Save current state to localStorage
   */
  saveState() {
    try {
      const state = {
        currentPrice: this.currentPrice,
        purchasedCards: this.purchasedCards
      };
      localStorage.setItem('shopState', JSON.stringify(state));
    } catch (e) {
      console.error('Error saving shop state:', e);
    }
  }
  
  /**
   * Get available affirmations (those that haven't been purchased)
   * @returns {string[]} Array of available affirmation messages
   */
  getAvailableAffirmations() {
    // Filter out purchased messages
    return this.allAffirmations.filter(message => !this.purchasedCards.includes(message));
  }
  
  /**
   * Open the shop menu
   */
  openShop() {
    // Update the shop menu with current price and available cards
    this.shopMenu.updateCards(this.getAvailableAffirmations(), this.currentPrice);
    this.shopMenu.open();
  }
  
  /**
   * Close the shop menu
   */
  closeShop() {
    this.shopMenu.close();
  }
  
  /**
   * Handle card selection
   * @param {Object} data - Card selection data
   */
  handleCardSelect(data) {
    // When a card is selected, show the purchase option
    this.shopMenu.showPurchaseOption(data.cardIndex, this.currentPrice);
  }
  
  /**
   * Attempt to purchase a selected card
   * @param {Object} data - Purchase attempt data
   */
  attemptPurchaseCard(data) {
    // Store the card index that the user is attempting to purchase
    this.lastAttemptedPurchase = data.cardIndex;
    
    // Get current flower count
    let flowerCount = 0;
    const collectibleManager = window.game ? window.game.collectibleManager : null;
    
    if (collectibleManager) {
      flowerCount = collectibleManager.getCollectedCount();
    }
    
    // Get the card that was selected
    const selectedCard = this.shopMenu.cards[data.cardIndex];
    
    // Check if user has enough flowers
    if (flowerCount >= this.currentPrice) {
      // User can afford the card
      
      // Subtract flowers
      if (collectibleManager) {
        // Create a temporary backup of the current count
        const previousCount = collectibleManager.collected;
        
        // Subtract the price from the collected count
        collectibleManager.collected -= this.currentPrice;
        
        // Emit count update event
        collectibleManager.emitCountUpdate();
        
        // Log the transaction
        console.log(`Purchased card for ${this.currentPrice} flowers. New balance: ${collectibleManager.collected}`);
      }
      
      // Mark card as purchased and reveal the message
      if (selectedCard && selectedCard.message) {
        this.purchasedCards.push(selectedCard.message);
        
        // Now reveal the message in the card since it's purchased
        selectedCard.reveal();
      }
      
      // Calculate the next price (40-50% increase)
      const increaseRate = this.priceIncreaseMin + 
        Math.random() * (this.priceIncreaseMax - this.priceIncreaseMin);
      
      const newPrice = Math.ceil(this.currentPrice * (1 + increaseRate));
      this.currentPrice = newPrice;
      
      // Save state
      this.saveState();
      
      // Notify the shop menu that purchase was successful
      this.shopMenu.handlePurchaseSuccess(data.cardIndex, this.currentPrice);
      
      // Emit purchase success event
      GameEvents.emit(SHOP_EVENTS.CARD_PURCHASE_SUCCESS, {
        cardIndex: data.cardIndex,
        price: this.currentPrice,
        message: selectedCard ? selectedCard.message : null
      });
    } else {
      // User cannot afford the card
      this.shopMenu.handlePurchaseFailure(data.cardIndex, flowerCount, this.currentPrice);
      
      // Emit purchase failure event
      GameEvents.emit(SHOP_EVENTS.CARD_PURCHASE_FAILURE, {
        cardIndex: data.cardIndex,
        price: this.currentPrice,
        balance: flowerCount
      });
    }
  }
  
  /**
   * Update the shop components
   */
  update() {
    this.shopMenu.update();
  }
  
  /**
   * Draw the shop components
   */
  draw() {
    this.shopMenu.draw();
  }
  
  /**
   * Clean up event listeners when the system is destroyed
   */
  cleanup() {
    // In a real implementation, you would keep track of listeners and remove them specifically
  }
}

export default ShopManager;