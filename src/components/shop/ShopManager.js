/**
 * ShopManager.js - Manages shop functionality and coordinates between components
 * Fixed version with proper card access and error handling
 */
import ShopMenu from './core/ShopMenu.js';
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
    
    // Pricing configuration
    this.basePrice = 100; // Initial card price
    this.currentPrice = this.basePrice;
    this.priceIncreaseMin = 0.4; // 40% minimum increase
    this.priceIncreaseMax = 0.5; // 50% maximum increase
    
    // Previous canvas dimensions for resize handling
    this.previousWidth = canvas.width;
    this.previousHeight = canvas.height;
    
    // Purchase state tracking
    this.purchasedCards = [];
    this.lastAttemptedPurchase = null;
    
    // Resize handling
    this.resizeDebounceTimer = null;
    this.resizeDebounceDelay = 100; // ms
    
    // Affirmation messages
    this.allAffirmations = [
      "You are strong, beautiful, and capable of achieving anything you set your mind to.",
      "Every day with you is a blessing. Your smile lights up my world.",
      "You're not just my girlfriend, you're my best friend and my greatest adventure.",
      "Your kindness and compassion make the world a better place. I'm so lucky to have you.",
      "In a universe full of stars, you shine the brightest to me.",
      "Your laugh is my favorite sound, and your happiness is my greatest goal."
    ];
    
    // Create shop menu
    this.shopMenu = new ShopMenu(
      context, 
      canvas, 
      this.getAvailableAffirmations(), 
      this.currentPrice
    );
    
    // Register event listeners
    this.registerEventListeners();
    
    // Load saved state if available
    this.loadSavedState();
  }
  
  /**
   * Register event listeners for shop interactions
   */
  registerEventListeners() {
    // Shop button events
    GameEvents.on(INPUT_EVENTS.BUTTON_PRESS, (data) => {
      if (data.buttonKey === 'shop') {
        this.openShop();
      }
    });
    
    // Mouse events for shop menu interactions
    GameEvents.on(INPUT_EVENTS.MOUSE_DOWN, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleClick(data.x, data.y);
      }
    });
    
    GameEvents.on(INPUT_EVENTS.MOUSE_MOVE, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleMouseMove(data.x, data.y);
      }
    });
    
    // Touch events for mobile support
    GameEvents.on(INPUT_EVENTS.TOUCH_START, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleClick(data.x, data.y);
      }
    });
    
    // Game resize handling with debounce
    GameEvents.on(GAME_EVENTS.RESIZE, (data) => {
      this.handleResize();
    });
    
    // Shop-specific events
    GameEvents.on(SHOP_EVENTS.CARD_SELECT, (data) => {
      this.handleCardSelect(data);
    });
    
    GameEvents.on(SHOP_EVENTS.CARD_PURCHASE_ATTEMPT, (data) => {
      this.attemptPurchaseCard(data);
    });
    
    // Listen for shop close events to potentially save state
    GameEvents.on(SHOP_EVENTS.CLOSE, () => {
      this.saveState();
    });
  }
  
  /**
   * Handle resize events with debouncing to prevent layout thrashing
   */
  handleResize() {
    // Clear any existing timeout
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    
    // Set a debounce timer to avoid excessive updates during resize
    this.resizeDebounceTimer = setTimeout(() => {
      // Check if dimensions actually changed
      if (this.canvas.width !== this.previousWidth || 
          this.canvas.height !== this.previousHeight) {
        
        // Store new dimensions
        this.previousWidth = this.canvas.width;
        this.previousHeight = this.canvas.height;
        
        // Update shop menu layout
        if (this.shopMenu) {
          this.shopMenu.handleResize();
        }
      }
      
      this.resizeDebounceTimer = null;
    }, this.resizeDebounceDelay);
  }
  
  /**
   * Load saved state from localStorage
   */
  loadSavedState() {
    try {
      const savedState = localStorage.getItem('shopState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Restore saved price with validation
        if (state.currentPrice && typeof state.currentPrice === 'number' && state.currentPrice >= this.basePrice) {
          this.currentPrice = state.currentPrice;
        }
        
        // Restore purchased cards with validation
        if (state.purchasedCards && Array.isArray(state.purchasedCards)) {
          // Validate each card is a string that exists in allAffirmations
          this.purchasedCards = state.purchasedCards.filter(
            card => typeof card === 'string' && this.allAffirmations.includes(card)
          );
        }
        
        // Update the shop menu with current price and available cards
        this.shopMenu.updateCards(this.getAvailableAffirmations(), this.currentPrice);
      }
    } catch (e) {
      console.error('Error loading saved shop state:', e);
      // Reset to defaults on error
      this.currentPrice = this.basePrice;
      this.purchasedCards = [];
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
    // If all cards have been purchased, make them all available again
    if (this.purchasedCards.length >= this.allAffirmations.length) {
      return [...this.allAffirmations]; // Return a copy of all affirmations
    }
    
    // Filter out purchased messages
    return this.allAffirmations.filter(message => !this.purchasedCards.includes(message));
  }
  
  /**
   * Open the shop menu
   */
  openShop() {
    // Ensure we have the latest available cards
    const availableAffirmations = this.getAvailableAffirmations();
    
    // Only update if shop menu exists
    if (this.shopMenu) {
      // Update the shop menu with current price and available cards
      this.shopMenu.updateCards(availableAffirmations, this.currentPrice);
      this.shopMenu.open();
    }
  }
  
  /**
   * Close the shop menu
   */
  closeShop() {
    if (this.shopMenu) {
      this.shopMenu.close();
      this.saveState(); // Save state when closing
    }
  }
  
  /**
   * Handle card selection
   * @param {Object} data - Card selection data
   */
  handleCardSelect(data) {
    // When a card is selected, show the purchase option
    if (this.shopMenu) {
      this.shopMenu.showPurchaseOption(data.cardIndex, this.currentPrice);
    }
  }
  
  /**
   * Attempt to purchase a selected card
   * @param {Object} data - Purchase attempt data
   */
  attemptPurchaseCard(data) {
    // Store the card index that the user is attempting to purchase
    this.lastAttemptedPurchase = data.cardIndex;
    
    // Get current flower count
    let flowerCount = this.getPlayerFlowerCount();
    
    // Check if shop menu and card display exist
    if (!this.shopMenu || !this.shopMenu.cardDisplay) {
      console.error("Shop menu or card display not initialized");
      return;
    }
    
    // Check if the card index is valid
    if (!this.shopMenu.cardDisplay.cards || 
        data.cardIndex < 0 || 
        data.cardIndex >= this.shopMenu.cardDisplay.cards.length) {
      console.error("Invalid card index in purchase attempt");
      return;
    }
    
    // Get the card that was selected
    const selectedCard = this.shopMenu.cardDisplay.cards[data.cardIndex];
    
    // Check if user has enough flowers
    if (flowerCount >= this.currentPrice) {
      // Process successful purchase
      this.processPurchase(selectedCard);
    } else {
      // Handle insufficient funds
      this.handleInsufficientFunds(flowerCount);
    }
  }
  
  /**
   * Get the player's current flower count
   * @returns {number} Current flower count
   */
  getPlayerFlowerCount() {
    let flowerCount = 0;
    const collectibleManager = window.game ? window.game.collectibleManager : null;
    
    if (collectibleManager) {
      flowerCount = collectibleManager.getCollectedCount();
    }
    
    return flowerCount;
  }
  
  /**
   * Process a successful card purchase
   * @param {AffirmationCard} selectedCard - The card being purchased
   */
  processPurchase(selectedCard) {
    // Subtract flowers from player's balance
    const collectibleManager = window.game ? window.game.collectibleManager : null;
    
    if (collectibleManager) {
      // Subtract the price from the collected count
      collectibleManager.collected -= this.currentPrice;
      
      // Emit count update event
      collectibleManager.emitCountUpdate();
    }
    
    // Mark card as purchased and reveal the message
    if (selectedCard && selectedCard.message) {
      // Avoid duplicate entries
      if (!this.purchasedCards.includes(selectedCard.message)) {
        this.purchasedCards.push(selectedCard.message);
      }
      
      // Reveal the card using the proper method
      this.shopMenu.cardDisplay.revealCard(this.lastAttemptedPurchase);
    }
    
    // Calculate the next price with random increase
    const increaseRate = this.priceIncreaseMin + 
                         Math.random() * (this.priceIncreaseMax - this.priceIncreaseMin);
    this.currentPrice = Math.ceil(this.currentPrice * (1 + increaseRate));
    
    // Save state
    this.saveState();
    
    // Notify the shop menu that purchase was successful
    if (this.shopMenu) {
      this.shopMenu.handlePurchaseSuccess(this.lastAttemptedPurchase, this.currentPrice);
    }
    
    // Emit purchase success event
    GameEvents.emit(SHOP_EVENTS.CARD_PURCHASE_SUCCESS, {
      cardIndex: this.lastAttemptedPurchase,
      price: this.currentPrice,
      message: selectedCard ? selectedCard.message : null
    });
  }
  
  /**
   * Handle case where player has insufficient funds
   * @param {number} flowerCount - Current flower balance
   */
  handleInsufficientFunds(flowerCount) {
    // Notify the shop menu that purchase failed
    if (this.shopMenu) {
      this.shopMenu.handlePurchaseFailure(
        this.lastAttemptedPurchase, 
        flowerCount, 
        this.currentPrice
      );
    }
    
    // Emit purchase failure event
    GameEvents.emit(SHOP_EVENTS.CARD_PURCHASE_FAILURE, {
      cardIndex: this.lastAttemptedPurchase,
      price: this.currentPrice,
      balance: flowerCount
    });
  }
  
  /**
   * Update the shop components
   */
  update() {
    // Check for canvas size changes
    if (this.canvas.width !== this.previousWidth || 
        this.canvas.height !== this.previousHeight) {
      this.handleResize();
    }
    
    // Update shop menu state
    if (this.shopMenu) {
      this.shopMenu.update();
    }
  }
  
  /**
   * Draw the shop components
   */
  draw() {
    if (this.shopMenu) {
      this.shopMenu.draw();
    }
  }
  
  /**
   * Clean up event listeners and resources
   */
  cleanup() {
    // Clear any pending resize debounce timer
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = null;
    }
    
    // Save state before cleanup
    this.saveState();
    
    // This method could be expanded to remove specific event listeners in a full implementation
  }
}

export default ShopManager;