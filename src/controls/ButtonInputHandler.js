/**
 * ButtonInputHandler - Centralizes all input handling for buttons
 * Manages mouse, touch, and keyboard interactions
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
      
      if (target) {
        target.button.setPressed(true);
        
        // Execute button-specific press action
        if (target.key === 'move') {
          this.buttonSystem.triggerMove(true);
        } else if (target.key === 'jump') {
          this.buttonSystem.triggerJump();
        } else if (target.key === 'attack') {
          this.buttonSystem.triggerAttack();
        }
      }
    }
    
    /**
     * Handle mouse up event
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseUp(e) {
      // For move button, we need to stop walking when released
      if (this.buttons.move.isPressed) {
        this.buttons.move.setPressed(false);
        this.buttonSystem.triggerMove(false);
      }
      
      // For other buttons, just update their visual state
      if (this.buttons.jump.isPressed) {
        this.buttons.jump.setPressed(false);
      }
      
      if (this.buttons.attack.isPressed) {
        this.buttons.attack.setPressed(false);
      }
    }
    
    /**
     * Handle mouse move event for hover effects
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      
      // Update hover state for all buttons
      Object.values(this.buttons).forEach(button => {
        button.setHovered(button.contains(x, y));
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
      
      if (target) {
        target.button.setPressed(true);
        
        // Execute button-specific press action
        if (target.key === 'move') {
          this.buttonSystem.triggerMove(true);
        } else if (target.key === 'jump') {
          this.buttonSystem.triggerJump();
        } else if (target.key === 'attack') {
          this.buttonSystem.triggerAttack();
        }
      }
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
      e.preventDefault(); // Prevent scrolling/zooming
      
      // For move button, we need to stop walking when released
      if (this.buttons.move.isPressed) {
        this.buttons.move.setPressed(false);
        this.buttonSystem.triggerMove(false);
      }
      
      // For other buttons, just update their visual state
      if (this.buttons.jump.isPressed) {
        this.buttons.jump.setPressed(false);
      }
      
      if (this.buttons.attack.isPressed) {
        this.buttons.attack.setPressed(false);
      }
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
      if (e.key === "ArrowRight") {
        this.buttons.move.setPressed(true);
        this.buttonSystem.triggerMove(true);
      } else if (e.key === "ArrowUp" || e.key === " ") {
        this.buttons.jump.setPressed(true);
        this.buttonSystem.triggerJump();
      } else if (e.key === "z" || e.key === "Z") {
        this.buttons.attack.setPressed(true);
        this.buttonSystem.triggerAttack();
      }
    }
    
    /**
     * Handle key up event
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
      if (e.key === "ArrowRight") {
        this.buttons.move.setPressed(false);
        this.buttonSystem.triggerMove(false);
      } else if (e.key === "ArrowUp" || e.key === " ") {
        this.buttons.jump.setPressed(false);
      } else if (e.key === "z" || e.key === "Z") {
        this.buttons.attack.setPressed(false);
      }
    }
  }