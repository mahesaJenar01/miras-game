/**
 * CollectionMenu.js - Core coordinator for the card collection interface
 * Manages display, navigation, and interaction with purchased cards
 */
import ShopUiRenderer from '../utils/ShopUiRenderer.js';
import ShopLayoutManager from '../utils/ShopLayoutManager.js';
import ShopAnimator from '../utils/ShopAnimator.js';
import ShopCloseButton from '../ui/ShopCloseButton.js';
import AffirmationCard from '../models/AffirmationCard.js';
import { COLLECTION_EVENTS } from '../../../events/EventTypes.js';
import GameEvents from '../../../events/GameEvents.js';

class CollectionMenu {
  /**
   * Create a new collection menu
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {string[]} purchasedCards - Array of purchased card messages
   */
  constructor(context, canvas, purchasedCards = []) {
    this.context = context;
    this.canvas = canvas;
    this.purchasedCards = [...purchasedCards];
    
    // Track original canvas dimensions for resize detection
    this.originalWidth = canvas.width;
    this.originalHeight = canvas.height;
    
    // State flags
    this.isOpen = false;
    this.currentPage = 0;
    this.cardsPerPage = 3;
    
    // Create layout manager to handle positioning
    this.layoutManager = new ShopLayoutManager(canvas);
    
    // Create animator to handle transitions
    this.animator = new ShopAnimator();
    
    // Create collection components
    this.closeButton = new ShopCloseButton(context, this.layoutManager);
    
    // Collection of rendered card objects
    this.cardInstances = [];
    
    // Navigation properties
    this.leftArrowBtn = null;
    this.rightArrowBtn = null;
    
    // Set up resize handling with debouncing
    this.resizeTimeout = null;
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  }
  
  /**
   * Initialize card instances based on collection
   */
  initializeCards() {
    // Clear existing card instances
    this.cardInstances = [];
    
    // Create card objects for each purchased message
    const cardDimensions = this.layoutManager.getCardDimensions();
    
    // Card colors cycled for variety
    const cardColors = ["#FFB7B2", "#F8E1EC", "#E3D1F4"];
    
    this.purchasedCards.forEach((message, index) => {
      const card = new AffirmationCard(
        this.context,
        0, 0, // Temporary positions
        cardDimensions.width,
        cardDimensions.height,
        message,
        cardColors[index % cardColors.length],
        0 // Price set to 0 since already purchased
      );
      
      // All cards in collection are revealed
      card.reveal();
      
      this.cardInstances.push(card);
    });
    
    // Update card positions for current page
    this.updateCardPositions();
  }
  
  /**
   * Update card positions based on current page
   */
  updateCardPositions() {
    if (this.cardInstances.length === 0) return;
    
    // Calculate which cards to show on current page
    const startIndex = this.currentPage * this.cardsPerPage;
    const endIndex = Math.min(startIndex + this.cardsPerPage, this.cardInstances.length);
    const visibleCards = this.cardInstances.slice(startIndex, endIndex);
    
    // Get positions from layout manager
    const positions = this.layoutManager.getCardPositions(visibleCards.length);
    
    // Apply positions to visible cards
    visibleCards.forEach((card, index) => {
      if (index < positions.length) {
        card.x = positions[index].x;
        card.y = positions[index].y;
        card.targetX = positions[index].x;
        card.targetY = positions[index].y;
        
        // Apply scaling if provided by layout manager
        if (positions[index].scale !== undefined) {
          card.scale = positions[index].scale;
        }
      }
    });
    
    // Hide cards not on current page by moving them off-screen
    this.cardInstances.forEach((card, index) => {
      if (index < startIndex || index >= endIndex) {
        card.x = -1000;
        card.y = -1000;
        card.targetX = -1000;
        card.targetY = -1000;
      }
    });
    
    // Update navigation button states
    this.updateNavigationButtons();
  }
  
  /**
   * Set navigation buttons references
   * @param {ArrowButton} leftBtn - Left arrow button
   * @param {ArrowButton} rightBtn - Right arrow button
   */
  setNavigationButtons(leftBtn, rightBtn) {
    this.leftArrowBtn = leftBtn;
    this.rightArrowBtn = rightBtn;
    this.updateNavigationButtons();
  }
  
  /**
   * Update navigation button states based on current page
   */
  updateNavigationButtons() {
    if (!this.leftArrowBtn || !this.rightArrowBtn) return;
    
    // Disable left arrow on first page
    this.leftArrowBtn.isDisabled = this.currentPage === 0;
    
    // Disable right arrow on last page
    const totalPages = Math.ceil(this.cardInstances.length / this.cardsPerPage);
    this.rightArrowBtn.isDisabled = this.currentPage >= totalPages - 1;
  }
  
  /**
   * Open the collection menu with animation
   */
  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      
      // Initialize cards if not already done
      if (this.cardInstances.length === 0 && this.purchasedCards.length > 0) {
        this.initializeCards();
      }
      
      // Reset to first page when opening
      this.currentPage = 0;
      this.updateCardPositions();
      
      // Start the opening animation
      this.animator.startOpenAnimation();
      
      // Update layout for current canvas size
      this.layoutManager.updateLayout();
      
      // Ensure components are positioned correctly
      this.closeButton.handleResize();
      
      // Emit collection open event
      GameEvents.emit(COLLECTION_EVENTS.OPEN, {
        time: Date.now(),
        cardCount: this.purchasedCards.length
      });
    }
  }
  
  /**
   * Close the collection menu
   */
  close() {
    if (this.isOpen) {
      this.isOpen = false;
      
      // Emit collection close event
      GameEvents.emit(COLLECTION_EVENTS.CLOSE, {
        time: Date.now()
      });
    }
  }
  
  /**
   * Navigate to the next page
   */
  nextPage() {
    const totalPages = Math.ceil(this.cardInstances.length / this.cardsPerPage);
    
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.updateCardPositions();
      
      // Emit page change event
      GameEvents.emit(COLLECTION_EVENTS.PAGE_CHANGE, {
        page: this.currentPage,
        totalPages: totalPages
      });
    }
  }
  
  /**
   * Navigate to the previous page
   */
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateCardPositions();
      
      // Emit page change event
      GameEvents.emit(COLLECTION_EVENTS.PAGE_CHANGE, {
        page: this.currentPage,
        totalPages: Math.ceil(this.cardInstances.length / this.cardsPerPage)
      });
    }
  }
  
  /**
   * Update the collection with new purchased cards
   * @param {string[]} purchasedCards - New array of purchased card messages
   */
  updateCollection(purchasedCards) {
    this.purchasedCards = [...purchasedCards];
    
    // Reinitialize cards
    this.initializeCards();
    
    // Reset to first page
    this.currentPage = 0;
    this.updateCardPositions();
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Check if canvas dimensions have actually changed
    if (this.canvas.width === this.originalWidth && 
        this.canvas.height === this.originalHeight) {
      return;
    }
    
    // Update stored dimensions
    this.originalWidth = this.canvas.width;
    this.originalHeight = this.canvas.height;
    
    // Clear any existing timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    // Set a debounce timer to avoid excessive updates
    this.resizeTimeout = setTimeout(() => {
      // Update the layout manager
      this.layoutManager.updateLayout();
      
      // Update card dimensions and positions
      if (this.cardInstances.length > 0) {
        const cardDimensions = this.layoutManager.getCardDimensions();
        
        this.cardInstances.forEach(card => {
          card.width = cardDimensions.width;
          card.height = cardDimensions.height;
        });
        
        this.updateCardPositions();
      }
      
      // Notify components about resize
      this.closeButton.handleResize();
      
      this.resizeTimeout = null;
    }, 150); // 150ms debounce
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
    
    // Let the navigation arrows be handled by their own event handlers
    // as they're managed by the ButtonSystem
    
    return true; // Consume click when menu is open
  }
  
  /**
   * Handle mouse move events for hover effects
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   */
  handleMouseMove(x, y) {
    if (!this.isOpen) return;
    
    // Update hover states in components
    this.closeButton.handleMouseMove(x, y);
    
    // Navigation buttons are handled by ButtonSystem
  }
  
  /**
   * Update the collection menu state
   */
  update() {
    if (!this.isOpen && !this.animator.isAnimating()) return;
    
    // Check for canvas size changes
    if (this.canvas.width !== this.originalWidth || 
        this.canvas.height !== this.originalHeight) {
      this.handleResize();
    }
    
    // Update animator
    this.animator.update();
    
    // Update cards
    this.cardInstances.forEach(card => card.update());
  }
  
  /**
   * Draw the collection menu
   */
  draw() {
    if (!this.isOpen && !this.animator.isAnimating()) return;
    
    // Save context state
    this.context.save();
    
    // Get current animation progress from animator
    const animProgress = this.animator.getProgress();
    
    // Draw background with animation progress
    this.drawBackground(animProgress);
    
    // Draw header
    this.drawHeader(animProgress);
    
    // Draw cards for current page
    this.drawCards(animProgress);
    
    // Draw close button
    this.closeButton.draw(animProgress);
    
    // Navigation buttons are drawn by ButtonSystem
    
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
  
  /**
   * Draw the header text
   * @param {number} animProgress - Animation progress (0-1)
   */
  drawHeader(animProgress) {
    const { context, canvas } = this;
    
    // Get header positions from layout manager
    const { titleY } = this.layoutManager.getHeaderPositions();
    const { titleFontSize } = this.layoutManager.getHeaderFontSizes();
    
    // Apply fade-in animation
    const textAlpha = animProgress < 1 ? animProgress : 1;
    
    // Draw title with animation
    context.globalAlpha = textAlpha;
    context.font = `bold ${titleFontSize}px Arial`;
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Your Affirmation Cards', canvas.width/2, titleY);
    
    // Draw page indicator
    const totalPages = Math.ceil(this.cardInstances.length / this.cardsPerPage);
    if (totalPages > 1) {
      context.font = `${titleFontSize * 0.6}px Arial`;
      context.fillText(`Page ${this.currentPage + 1} of ${totalPages}`, canvas.width/2, titleY + titleFontSize);
    }
    
    // Draw empty state message if no cards
    if (this.cardInstances.length === 0) {
      context.font = `${titleFontSize * 0.8}px Arial`;
      context.fillText('No cards purchased yet. Visit the shop!', canvas.width/2, canvas.height/2);
    }
    
    // Reset alpha
    context.globalAlpha = 1;
  }
  
  /**
   * Draw cards for the current page
   * @param {number} animProgress - Animation progress (0-1)
   */
  drawCards(animProgress) {
    if (this.cardInstances.length === 0) return;
    
    // Calculate which cards to show on current page
    const startIndex = this.currentPage * this.cardsPerPage;
    const endIndex = Math.min(startIndex + this.cardsPerPage, this.cardInstances.length);
    
    // Draw cards with staggered entrance animation
    for (let i = startIndex; i < endIndex; i++) {
      const card = this.cardInstances[i];
      const relativeIndex = i - startIndex;
      
      // Calculate staggered animation progress
      const cardDelay = relativeIndex * 0.1;
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
    }
  }
  
  /**
   * Get the number of pages
   * @returns {number} Total number of pages
   */
  getPageCount() {
    return Math.ceil(this.cardInstances.length / this.cardsPerPage);
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    // Remove resize event listener
    window.removeEventListener('resize', this.resizeHandler);
  }
}

export default CollectionMenu;