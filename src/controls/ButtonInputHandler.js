/**
 * ButtonInputHandler - Centralizes all input handling for buttons
 * Manages mouse, touch, and keyboard interactions using the event system
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
      
      // Bind event handlers to preserve 'this' context
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    
    /**
     * Initialize all event listeners
     */
    initialize() {
      // Mouse events
      this.canvas.addEventListener("mousedown", this.handleMouseDown);
      this.canvas.addEventListener("mouseup", this.handleMouseUp);
      this.canvas.addEventListener("mousemove", this.handleMouseMove);
      
      // Touch events
      this.canvas.addEventListener("touchstart", this.handleTouchStart);
      this.canvas.addEventListener("touchend", this.handleTouchEnd);
      
      // Keyboard events
      document.addEventListener("keydown", this.handleKeyDown);
      document.addEventListener("keyup", this.handleKeyUp);
    }
    
    /**
     * Clean up event listeners (call when destroying the system)
     */
    cleanup() {
      // Mouse events
      this.canvas.removeEventListener("mousedown", this.handleMouseDown);
      this.canvas.removeEventListener("mouseup", this.handleMouseUp);
      this.canvas.removeEventListener("mousemove", this.handleMouseMove);
      
      // Touch events
      this.canvas.removeEventListener("touchstart", this.handleTouchStart);
      this.canvas.removeEventListener("touchend", this.handleTouchEnd);
      
      // Keyboard events
      document.removeEventListener("keydown", this.handleKeyDown);
      document.removeEventListener("keyup", this.handleKeyUp);
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
     * Handle mouse down event
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      const target = this.findTargetButton(x, y);
      
      // Emit the general mouse down event
      GameEvents.emitInput(INPUT_EVENTS.MOUSE_DOWN, { x, y, originalEvent: e });
      
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
     * Handle mouse up event
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseUp(e) {
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      
      // Emit the general mouse up event
      GameEvents.emitInput(INPUT_EVENTS.MOUSE_UP, { x, y, originalEvent: e });
      
      // Check all buttons that might be pressed
      for (const [key, button] of Object.entries(this.buttons)) {
        if (button.isPressed) {
          button.setPressed(false);
          
          // Emit button-specific release event
          GameEvents.emitInput(INPUT_EVENTS.BUTTON_RELEASE, {
            buttonKey: key,
            button: button,
            x, y,
            originalEvent: e
          });
        }
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
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
      e.preventDefault(); // Prevent scrolling/zooming
      const touch = e.touches[0];
      const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
      const target = this.findTargetButton(x, y);
      
      // Emit the general touch start event
      GameEvents.emitInput(INPUT_EVENTS.TOUCH_START, { x, y, originalEvent: e });
      
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
     * Handle touch end event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
      e.preventDefault(); // Prevent scrolling/zooming
      
      // Emit the general touch end event
      GameEvents.emitInput(INPUT_EVENTS.TOUCH_END, { originalEvent: e });
      
      // Check all buttons that might be pressed
      for (const [key, button] of Object.entries(this.buttons)) {
        if (button.isPressed) {
          button.setPressed(false);
          
          // Emit button-specific release event
          GameEvents.emitInput(INPUT_EVENTS.BUTTON_RELEASE, {
            buttonKey: key,
            button: button,
            originalEvent: e
          });
        }
      }
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
      // Emit the general key down event
      GameEvents.emitInput(INPUT_EVENTS.KEY_DOWN, { 
        key: e.key, 
        keyCode: e.keyCode, 
        originalEvent: e 
      });
      
      // Emit specific button presses based on keys
      let buttonKey = null;
      
      if (e.key === "ArrowRight") {
        buttonKey = 'move';
      } else if (e.key === "ArrowUp" || e.key === " ") {
        buttonKey = 'jump';
      } else if (e.key === "z" || e.key === "Z") {
        buttonKey = 'attack';
      }
      
      if (buttonKey && this.buttons[buttonKey]) {
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
     * Handle key up event
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
      // Emit the general key up event
      GameEvents.emitInput(INPUT_EVENTS.KEY_UP, { 
        key: e.key, 
        keyCode: e.keyCode, 
        originalEvent: e 
      });
      
      // Emit specific button releases based on keys
      let buttonKey = null;
      
      if (e.key === "ArrowRight") {
        buttonKey = 'move';
      } else if (e.key === "ArrowUp" || e.key === " ") {
        buttonKey = 'jump';
      } else if (e.key === "z" || e.key === "Z") {
        buttonKey = 'attack';
      }
      
      if (buttonKey && this.buttons[buttonKey] && this.buttons[buttonKey].isPressed) {
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