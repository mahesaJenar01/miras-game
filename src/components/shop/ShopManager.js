/**
 * ShopManager.js - Manages shop functionality and coordinates between components
 * Central coordinator for the shop system
 */
import ShopMenu from './ShopMenu.js';
import GameEvents from '../../events/GameEvents.js';
import { SHOP_EVENTS, INPUT_EVENTS, GAME_EVENTS } from '../../events/EventTypes.js';

class ShopManager {
  /**
   * Create a new shop manager
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    this.shopMenu = new ShopMenu(context, canvas);
    
    // Register event listeners
    this.registerEventListeners();
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
    
    // Listen for shop events directly
    GameEvents.on(SHOP_EVENTS.OPEN, () => {
      console.log("Shop opened");
    });
    
    GameEvents.on(SHOP_EVENTS.CLOSE, () => {
      console.log("Shop closed");
    });
    
    GameEvents.on(SHOP_EVENTS.CARD_SELECT, (data) => {
      console.log(`Card selected: ${data.cardIndex}`);
    });
  }
  
  /**
   * Open the shop menu
   */
  openShop() {
    this.shopMenu.open();
  }
  
  /**
   * Close the shop menu
   */
  closeShop() {
    this.shopMenu.close();
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