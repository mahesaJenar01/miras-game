/**
 * ButtonInputHandler - Centralizes all input handling for buttons
 * Manages mouse, touch, and keyboard interactions using the event system
 * Updated to support simultaneous button presses
 */
import GameEvents from '../events/GameEvents.js';
import { INPUT_EVENTS } from '../events/EventTypes.js';

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
     * Clean up event listeners (call when destroying the system)
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
     * Handle mouse down event - now supports simultaneous button presses
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      const target = this.findTargetButton(x, y);
      
      // Add to active pointers with mouse ID
      if (target) {
        this.activePointers.set('mouse', { 
          target: target,
          x, 
          y 
        });
      }
      
      // Emit the general mouse down event
      GameEvents.emitInput(INPUT_EVENTS.MOUSE_DOWN, { 
        x, y, 
        originalEvent: e 
      });
      
      if (target) {
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
      
      // Process each touch point
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
        const target = this.findTargetButton(x, y);
        
        // Track this touch point if it hit a button
        if (target) {
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
        
        // Emit the general touch start event
        GameEvents.emitInput(INPUT_EVENTS.TOUCH_START, { 
          x, y, 
          identifier: touch.identifier,
          originalEvent: e 
        });
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
      
      // Add this key to the active keys set
      this.activeKeys.add(e.key);
      
      // Emit the general key down event
      GameEvents.emitInput(INPUT_EVENTS.KEY_DOWN, { 
        key: e.key, 
        keyCode: e.keyCode, 
        originalEvent: e 
      });
      
      // Map keys to buttons
      let buttonKey = null;
      
      if (e.key === "ArrowRight") {
        buttonKey = 'move';
      } else if (e.key === "ArrowUp" || e.key === " ") {
        buttonKey = 'jump';
      } else if (e.key === "z" || e.key === "Z") {
        buttonKey = 'attack';
      }
      
      if (buttonKey && this.buttons[buttonKey]) {
        // Set the button to pressed state
        this.buttons[buttonKey].setPressed(true);
        
        // Emit button-specific press event
        GameEvents.emitInput(INPUT_EVENTS.BUTTON_PRESS, {
          buttonKey,
          button: this.buttons[buttonKey],
          isKeyboard: true,
          key: e.key,
          originalEvent: e
        });
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
      
      // Map keys to buttons
      let buttonKey = null;
      
      if (e.key === "ArrowRight") {
        buttonKey = 'move';
      } else if (e.key === "ArrowUp" || e.key === " ") {
        buttonKey = 'jump';
      } else if (e.key === "z" || e.key === "Z") {
        buttonKey = 'attack';
      }
      
      if (buttonKey && this.buttons[buttonKey] && this.buttons[buttonKey].isPressed) {
        // Check if there's another key that could keep this button pressed
        let keepPressed = false;
        
        // Define groups of keys that map to the same button
        const buttonKeyMappings = {
          'move': ['ArrowRight'],
          'jump': ['ArrowUp', ' '],
          'attack': ['z', 'Z']
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