/**
 * ButtonInputHandler - Centralizes all input handling for buttons
 * Manages mouse, touch, and keyboard interactions using the event system
 * Updated to support simultaneous button presses
 */
import GameEvents from '../events/GameEvents.js';
import { INPUT_EVENTS } from '../events/EventTypes.js';

/**
 * ButtonInputHandler - Centralized input handling for buttons
 * Modified to check game state before processing inputs
 */
export default class ButtonInputHandler {
    /**
     * Create a new button input handler
     * @param {ButtonSystem} buttonSystem - Reference to the button system
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {Object} buttons - Object containing all button instances
     */
    constructor(buttonSystem, canvas, buttons) {
      this.buttonSystem = buttonSystem;
      this.canvas = canvas;
      this.buttons = buttons;
      
      // Track active touch/mouse points for multi-input
      this.activePointers = new Map();
      
      // Track keyboard states
      this.activeKeys = new Set();
      
      // Bind event handlers to preserve 'this' context
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    
    /**
     * Initialize all event listeners
     */
    initialize() {
      // Mouse events
      this.canvas.addEventListener("mousedown", this.handleMouseDown);
      window.addEventListener("mouseup", this.handleMouseUp);
      this.canvas.addEventListener("mousemove", this.handleMouseMove);
      
      // Touch events
      this.canvas.addEventListener("touchstart", this.handleTouchStart, { passive: false });
      window.addEventListener("touchend", this.handleTouchEnd);
      window.addEventListener("touchcancel", this.handleTouchEnd);
      this.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });
      
      // Keyboard events
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);
    }
    
    /**
     * Clean up event listeners
     */
    cleanup() {
      // Mouse events
      this.canvas.removeEventListener("mousedown", this.handleMouseDown);
      window.removeEventListener("mouseup", this.handleMouseUp);
      this.canvas.removeEventListener("mousemove", this.handleMouseMove);
      
      // Touch events
      this.canvas.removeEventListener("touchstart", this.handleTouchStart);
      window.removeEventListener("touchend", this.handleTouchEnd);
      window.removeEventListener("touchcancel", this.handleTouchEnd);
      this.canvas.removeEventListener("touchmove", this.handleTouchMove);
      
      // Keyboard events
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("keyup", this.handleKeyUp);
      
      // Clear tracked states
      this.activePointers.clear();
      this.activeKeys.clear();
    }
    
    /**
     * Check if game is alive/active (not in game over state or menu open)
     * @returns {boolean} True if game is active and inputs should be processed
     */
    isGameActive() {
      // Check if game exists and health manager is available
      const game = window.game;
      if (!game || !game.healthManager) {
        return true; // Default to true if we can't determine
      }
      
      // Check if the game is alive
      const isAlive = game.healthManager.getAliveState();
      
      // NEW CODE: Check if shop or collection menu is open
      const isMenuOpen = game.shopManager && 
                        ((game.shopManager.shopMenu && game.shopManager.shopMenu.isOpen) ||
                          (game.shopManager.collectionMenu && game.shopManager.collectionMenu.isOpen));
      
      // Game is only active if player is alive AND no menu is open
      return isAlive && !isMenuOpen;
    }
    
    /**
     * Convert client coordinates to canvas coordinates
     * @param {number} clientX - Client X coordinate
     * @param {number} clientY - Client Y coordinate
     * @returns {Object} Canvas coordinates {x, y}
     */
    getCanvasCoordinates(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }
    
    /**
     * Find which button was clicked/touched
     * @param {number} x - Canvas X coordinate
     * @param {number} y - Canvas Y coordinate
     * @returns {Object|null} Object with key and button reference, or null if no button found
     */
    findTargetButton(x, y) {
      for (const [key, button] of Object.entries(this.buttons)) {
        if (button.contains(x, y)) {
          return { key, button };
        }
      }
      return null;
    }
    
    /**
     * Handle mouse down event - strengthened game state checking
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
      // First check global game state
      const gameActive = this.isGameActive();
      
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      const target = this.findTargetButton(x, y);
      
      // Always emit the general mouse down event for UI components
      GameEvents.emitInput(INPUT_EVENTS.MOUSE_DOWN, { 
        x, y, 
        originalEvent: e,
        gameActive: gameActive // Add game state to event data
      });
      
      if (target) {
        // Check if this is the restart button or if game is active
        const isRestartButton = target.key === 'restart';
        
        // Only allow restart button when game is over, and only allow other buttons when game is active
        if ((isRestartButton && !gameActive) || (gameActive && !target.button.isDisabled)) {
          // Add to active pointers with mouse ID
          this.activePointers.set('mouse', { 
            target: target,
            x, y 
          });
          
          target.button.setPressed(true);
          
          // Emit button-specific press event
          GameEvents.emitInput(INPUT_EVENTS.BUTTON_PRESS, {
            buttonKey: target.key,
            button: target.button,
            x, y,
            originalEvent: e
          });
        }
      }
    }
    
    /**
     * Handle mouse up event - preserves other active inputs
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseUp(e) {
      // Get the previously tracked mouse target
      const trackedPointer = this.activePointers.get('mouse');
      let target = null;
      
      // Get current coordinates for the event data
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      
      // Emit the general mouse up event
      GameEvents.emitInput(INPUT_EVENTS.MOUSE_UP, { x, y, originalEvent: e });
      
      if (trackedPointer) {
        target = trackedPointer.target;
        
        // Only release the specific button that was pressed by this pointer
        if (target && target.button.isPressed) {
          target.button.setPressed(false);
          
          // Emit button-specific release event
          GameEvents.emitInput(INPUT_EVENTS.BUTTON_RELEASE, {
            buttonKey: target.key,
            button: target.button,
            x, y,
            originalEvent: e
          });
        }
        
        // Remove this pointer from tracking
        this.activePointers.delete('mouse');
      }
    }
    
    /**
     * Handle mouse move event for hover effects
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      
      // Emit the general mouse move event
      GameEvents.emitInput(INPUT_EVENTS.MOUSE_MOVE, { x, y, originalEvent: e });
      
      // Update hover state for all buttons and emit events for changes
      Object.entries(this.buttons).forEach(([key, button]) => {
        const isHovering = button.contains(x, y);
        
        // Only emit events if the hover state changes
        if (isHovering !== button.isHovered) {
          button.setHovered(isHovering);
          
          // Emit button hover event
          GameEvents.emitInput(INPUT_EVENTS.BUTTON_HOVER, {
            buttonKey: key,
            button: button,
            isHovered: isHovering,
            x, y,
            originalEvent: e
          });
        }
      });
    }
    
    /**
     * Handle touch start event - supports multi-touch for multiple buttons
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
      e.preventDefault(); // Prevent scrolling/zooming
      
      // First check global game state
      const gameActive = this.isGameActive();
      
      // Process each touch point
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
        const target = this.findTargetButton(x, y);
        
        // Emit the general touch start event
        GameEvents.emitInput(INPUT_EVENTS.TOUCH_START, { 
          x, y, 
          identifier: touch.identifier,
          originalEvent: e,
          gameActive: gameActive
        });
        
        if (target) {
          // Check if this is the restart button or if game is active
          const isRestartButton = target.key === 'restart';
          
          // Only allow restart button when game is over, and only allow other buttons when game is active
          if ((isRestartButton && !gameActive) || (gameActive && !target.button.isDisabled)) {
            // Track this touch point if it hit a button
            this.activePointers.set(touch.identifier, {
              target: target,
              x, y
            });
            
            target.button.setPressed(true);
            
            // Emit button-specific press event
            GameEvents.emitInput(INPUT_EVENTS.BUTTON_PRESS, {
              buttonKey: target.key,
              button: target.button,
              x, y,
              identifier: touch.identifier,
              originalEvent: e
            });
          }
        }
      }
    }
    
    /**
     * Handle touch move event - track changes in touch positions
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
      e.preventDefault(); // Prevent scrolling/zooming
      
      // Process each changed touch
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
        
        // Emit the general touch move event
        GameEvents.emitInput(INPUT_EVENTS.TOUCH_MOVE, { 
          x, y, 
          identifier: touch.identifier,
          originalEvent: e 
        });
        
        // Check if this touch was previously tracking a button
        const trackedTouch = this.activePointers.get(touch.identifier);
        if (trackedTouch && trackedTouch.target) {
          // Update the stored position
          trackedTouch.x = x;
          trackedTouch.y = y;
          
          // Check if touch moved outside the button
          const button = trackedTouch.target.button;
          if (button.isPressed && !button.contains(x, y)) {
            // Handle leaving button area - options:
            // 1. Release the button (uncomment below)
            // button.setPressed(false);
            // GameEvents.emitInput(INPUT_EVENTS.BUTTON_RELEASE, {...});
            
            // 2. Keep the button pressed (current behavior, nothing to do)
          }
        }
      }
    }
    
    /**
     * Handle touch end event - maintains other active touches
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
      e.preventDefault(); // Prevent default behavior
      
      // Process each ended touch
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
        
        // Emit the general touch end event
        GameEvents.emitInput(INPUT_EVENTS.TOUCH_END, { 
          identifier: touch.identifier,
          x, y,
          originalEvent: e 
        });
        
        // Check if this touch was previously tracking a button
        const trackedTouch = this.activePointers.get(touch.identifier);
        if (trackedTouch && trackedTouch.target) {
          const target = trackedTouch.target;
          
          // Only release the specific button that was pressed by this touch
          if (target.button.isPressed) {
            target.button.setPressed(false);
            
            // Emit button-specific release event
            GameEvents.emitInput(INPUT_EVENTS.BUTTON_RELEASE, {
              buttonKey: target.key,
              button: target.button,
              identifier: touch.identifier,
              x, y,
              originalEvent: e
            });
          }
          
          // Remove this touch from tracking
          this.activePointers.delete(touch.identifier);
        }
      }
    }
    
    /**
     * Handle key down event - supports multiple keys pressed at once
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
      // Skip repeated keydown events when key is held
      if (e.repeat) return;
      
      // First check global game state
      const gameActive = this.isGameActive();
      
      // Add this key to the active keys set
      this.activeKeys.add(e.key);
      
      // Emit the general key down event
      GameEvents.emitInput(INPUT_EVENTS.KEY_DOWN, { 
        key: e.key, 
        keyCode: e.keyCode, 
        originalEvent: e,
        gameActive: gameActive
      });
      
      // Map keys to buttons
      let buttonKey = null;
      
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        buttonKey = 'move';
      } else if (e.key === "ArrowUp" || e.key === " " || e.key === "w" || e.key === "W") {
        buttonKey = 'jump';
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        buttonKey = 'attack';
      } else if (e.key === "r" || e.key === "R") {
        buttonKey = 'restart'; // Add restart key binding
      }
      
      if (buttonKey && this.buttons[buttonKey]) {
        // Check if this is the restart button or if game is active
        const isRestartButton = buttonKey === 'restart';
        const button = this.buttons[buttonKey];
        
        // Only allow restart button when game is over, and only allow other buttons when game is active
        if ((isRestartButton && !gameActive) || (gameActive && !button.isDisabled)) {
          // Set the button to pressed state
          button.setPressed(true);
          
          // Emit button-specific press event
          GameEvents.emitInput(INPUT_EVENTS.BUTTON_PRESS, {
            buttonKey,
            button: button,
            isKeyboard: true,
            key: e.key,
            originalEvent: e
          });
        }
      }
    }
    
    /**
     * Handle key up event - maintains state of other pressed keys
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
      // Remove this key from the active keys set
      this.activeKeys.delete(e.key);
      
      // Emit the general key up event
      GameEvents.emitInput(INPUT_EVENTS.KEY_UP, { 
        key: e.key, 
        keyCode: e.keyCode, 
        originalEvent: e 
      });
      
      // Map keys to buttons - Updated mapping
      let buttonKey = null;
      
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        buttonKey = 'move';
      } else if (e.key === "ArrowUp" || e.key === " " || e.key === "w" || e.key === "W") {
        buttonKey = 'jump';
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        buttonKey = 'attack';
      } else if (e.key === "r" || e.key === "R") {
        buttonKey = 'restart'; // Add restart key binding
      }
      
      if (buttonKey && this.buttons[buttonKey] && this.buttons[buttonKey].isPressed) {
        // Check if there's another key that could keep this button pressed
        let keepPressed = false;
        
        // Define groups of keys that map to the same button
        const buttonKeyMappings = {
          'move': ['ArrowRight', 'd', 'D'],
          'jump': ['ArrowUp', ' ', 'w', 'W'],
          'attack': ['ArrowDown', 's', 'S'],
          'restart': ['r', 'R']
        };
        
        // If there's another key pressed that maps to this button, keep it pressed
        if (buttonKeyMappings[buttonKey]) {
          keepPressed = buttonKeyMappings[buttonKey].some(key => 
            key !== e.key && this.activeKeys.has(key)
          );
        }
        
        // Only release the button if no other key is keeping it pressed
        if (!keepPressed) {
          this.buttons[buttonKey].setPressed(false);
          
          // Emit button-specific release event
          GameEvents.emitInput(INPUT_EVENTS.BUTTON_RELEASE, {
            buttonKey,
            button: this.buttons[buttonKey],
            isKeyboard: true,
            key: e.key,
            originalEvent: e
          });
        }
      }
    }
  }