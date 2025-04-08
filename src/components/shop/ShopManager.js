/**
 * ShopManager.js - Manages shop functionality and coordinates between components
 * Enhanced with card collection viewing functionality
 */
import ShopMenu from './core/ShopMenu.js';
import CollectionMenu from './core/CollectionMenu.js';
import GameEvents from '../../events/GameEvents.js';
import { SHOP_EVENTS, INPUT_EVENTS, GAME_EVENTS, UI_EVENTS, COLLECTION_EVENTS } from '../../events/EventTypes.js';

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
    
    // Navigation button references
    this.leftArrowBtn = null;
    this.rightArrowBtn = null;
    
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
    
    // Create collection menu
    this.collectionMenu = new CollectionMenu(
      context,
      canvas,
      this.purchasedCards
    );
    
    // Register event listeners
    this.registerEventListeners();
    
    // Load saved state if available
    this.loadSavedState();

    // Initialize button states
    this.updateShopButtonState();
    this.updateCollectionButtonState();
  }
  
  /**
   * Register event listeners for shop interactions
   */
  registerEventListeners() {
    // Shop button events
    GameEvents.on(INPUT_EVENTS.BUTTON_PRESS, (data) => {
      if (data.buttonKey === 'shop') {
        this.openShop();
      } else if (data.buttonKey === 'collection') {
        this.openCollection();
      } else if (data.buttonKey === 'leftArrow') {
        this.handleLeftArrowPress();
      } else if (data.buttonKey === 'rightArrow') {
        this.handleRightArrowPress();
      }
    });
    
    // Mouse events for shop and collection menu interactions
    GameEvents.on(INPUT_EVENTS.MOUSE_DOWN, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleClick(data.x, data.y);
      } else if (this.collectionMenu.isOpen) {
        this.collectionMenu.handleClick(data.x, data.y);
      }
    });
    
    GameEvents.on(INPUT_EVENTS.MOUSE_MOVE, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleMouseMove(data.x, data.y);
      } else if (this.collectionMenu.isOpen) {
        this.collectionMenu.handleMouseMove(data.x, data.y);
      }
    });
    
    // Touch events for mobile support
    GameEvents.on(INPUT_EVENTS.TOUCH_START, (data) => {
      if (this.shopMenu.isOpen) {
        this.shopMenu.handleClick(data.x, data.y);
      } else if (this.collectionMenu.isOpen) {
        this.collectionMenu.handleClick(data.x, data.y);
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
    
    // Listen for shop and collection close events to potentially save state
    GameEvents.on(SHOP_EVENTS.CLOSE, () => {
      this.saveState();
    });
    
    GameEvents.on(COLLECTION_EVENTS.CLOSE, () => {
      this.saveState();
    });

    // Check button states periodically
    setInterval(() => {
      this.updateShopButtonState();
      this.updateCollectionButtonState();
    }, 2000); // Check every 2 seconds
  }
  
  /**
   * Set navigation button references
   * @param {ArrowButton} leftBtn - Left arrow button
   * @param {ArrowButton} rightBtn - Right arrow button
   */
  setNavigationButtons(leftBtn, rightBtn) {
    this.leftArrowBtn = leftBtn;
    this.rightArrowBtn = rightBtn;
    
    // Pass to collection menu
    this.collectionMenu.setNavigationButtons(leftBtn, rightBtn);
  }
  
  /**
   * Handle left arrow button press for collection navigation
   */
  handleLeftArrowPress() {
    if (this.collectionMenu.isOpen) {
      this.collectionMenu.prevPage();
    }
  }
  
  /**
   * Handle right arrow button press for collection navigation
   */
  handleRightArrowPress() {
    if (this.collectionMenu.isOpen) {
      this.collectionMenu.nextPage();
    }
  }
  
  /**
   * Update the shop button's enabled/disabled state
   */
  updateShopButtonState() {
    const hasAvailableCards = this.getAvailableAffirmations().length > 0;
    
    // Find the shop button in the game
    const shopButton = window.game && window.game.buttonSystem ? 
                       window.game.buttonSystem.buttons.shop : null;
    
    if (shopButton) {
      // Set disabled state on the button
      shopButton.isDisabled = !hasAvailableCards;
      
      // Emit UI update event for the button state
      GameEvents.emitUI(UI_EVENTS.BUTTON_STATE_CHANGE, {
        buttonKey: 'shop',
        isDisabled: !hasAvailableCards,
        reason: !hasAvailableCards ? 'no_cards_available' : null
      });
    }
  }
  
  /**
   * Update the collection button's enabled/disabled state
   */
  updateCollectionButtonState() {
    const hasCollectedCards = this.purchasedCards.length > 0;
    
    // Find the collection button in the game
    const collectionButton = window.game && window.game.buttonSystem ? 
                             window.game.buttonSystem.buttons.collection : null;
    
    if (collectionButton) {
      // Set disabled state on the button
      collectionButton.isDisabled = !hasCollectedCards;
      
      // Emit UI update event for the button state
      GameEvents.emitUI(UI_EVENTS.BUTTON_STATE_CHANGE, {
        buttonKey: 'collection',
        isDisabled: !hasCollectedCards,
        reason: !hasCollectedCards ? 'no_cards_collected' : null
      });
    }
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
        
        // Update collection menu layout
        if (this.collectionMenu) {
          this.collectionMenu.handleResize();
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
        
        // Update the collection menu with purchased cards
        this.collectionMenu.updateCollection(this.purchasedCards);
        
        // Update button states
        this.updateShopButtonState();
        this.updateCollectionButtonState();
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
      
      // Update button states when state is saved
      this.updateShopButtonState();
      this.updateCollectionButtonState();
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
    // Close collection menu if open
    if (this.collectionMenu.isOpen) {
      this.collectionMenu.close();
    }
    
    // Ensure we have the latest available cards
    const availableAffirmations = this.getAvailableAffirmations();
    
    // Only open if there are available cards
    if (availableAffirmations.length > 0 && this.shopMenu) {
      // Update the shop menu with current price and available cards
      this.shopMenu.updateCards(availableAffirmations, this.currentPrice);
      this.shopMenu.open();
    } else {
      // If no cards are available, emit notification event
      GameEvents.emitUI(UI_EVENTS.UPDATE, {
        type: 'notification',
        message: 'No more affirmation cards available!'
      });
    }
  }
  
  /**
   * Open the collection menu
   */
  openCollection() {
    // Close shop menu if open
    if (this.shopMenu.isOpen) {
      this.shopMenu.close();
    }
    
    // Only open if there are purchased cards
    if (this.purchasedCards.length > 0) {
      // Ensure collection menu has latest cards
      this.collectionMenu.updateCollection(this.purchasedCards);
      this.collectionMenu.open();
      
      // Ensure navigation buttons are visible when the collection is open
      if (this.leftArrowBtn && this.rightArrowBtn) {
        this.collectionMenu.setNavigationButtons(this.leftArrowBtn, this.rightArrowBtn);
      }
    } else {
      // If no cards collected, emit notification event
      GameEvents.emitUI(UI_EVENTS.UPDATE, {
        type: 'notification',
        message: 'You haven\'t purchased any cards yet!'
      });
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
   * Close the collection menu
   */
  closeCollection() {
    if (this.collectionMenu) {
      this.collectionMenu.close();
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
      
      // Save the updated flower count to localStorage
      collectibleManager.saveFlowersCount();
      
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
      
      // Update the collection menu
      this.collectionMenu.updateCollection(this.purchasedCards);
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
      
      // After a short delay, update the shop to show remaining cards
      setTimeout(() => {
        const availableAffirmations = this.getAvailableAffirmations();
        
        // If there are still cards available, refresh the shop
        if (availableAffirmations.length > 0) {
          this.shopMenu.updateCards(availableAffirmations, this.currentPrice);
        } else {
          // If no cards left, close the shop
          this.shopMenu.close();
        }
        
        // Update button states based on available cards
        this.updateShopButtonState();
        this.updateCollectionButtonState();
      }, 5000); // Wait 2 seconds after purchase to refresh cards
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
    
    // Update collection menu state
    if (this.collectionMenu) {
      this.collectionMenu.update();
    }
  }
  
  /**
   * Draw the shop components
   */
  draw() {
    // Draw shop menu if open
    if (this.shopMenu) {
      this.shopMenu.draw();
    }
    
    // Draw collection menu if open
    if (this.collectionMenu) {
      this.collectionMenu.draw();
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
    
    // Clean up shop menu
    if (this.shopMenu && this.shopMenu.cleanup) {
      this.shopMenu.cleanup();
    }
    
    // Clean up collection menu
    if (this.collectionMenu && this.collectionMenu.cleanup) {
      this.collectionMenu.cleanup();
    }
  }
}

export default ShopManager;