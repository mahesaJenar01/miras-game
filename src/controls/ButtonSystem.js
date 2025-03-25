import ButtonRenderer from './ButtonRenderer.js';
import ButtonInputHandler from './ButtonInputHandler.js';
import MoveButton from './buttons/MoveButton.js';
import JumpButton from './buttons/JumpButton.js';
import AttackButton from './buttons/AttackButton.js';
import eventSystem from '../utils/EventSystem.js';
import ColorPalette from '../config/ColorPalette.js';

/**
 * ButtonSystem - Central coordinator for all button-related functionality
 * Manages button creation, positioning, and actions
 */
class ButtonSystem {
  /**
   * Create a new button system
   * @param {Game} game - Reference to the main Game instance
   * @param {HTMLCanvasElement} canvas - The game canvas
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   */
  constructor(game, canvas, context) {
    this.game = game;
    this.canvas = canvas;
    this.context = context;
    
    // Create button instances (without positions initially)
    this.buttons = this.createButtons();
    
    // Initialize the renderer
    this.renderer = new ButtonRenderer(context, this.buttons);
    
    // Initialize the input handler
    this.inputHandler = new ButtonInputHandler(this, canvas, this.buttons);
    
    // Setup the system
    this.setupSystem();
  }
  
  /**
   * Create all button instances
   * @returns {Object} Object containing all button instances
   */
  createButtons() {
    const buttonColors = ColorPalette.buttons;
    
    return {
      move: new MoveButton(0, 0, 100, 50, buttonColors.move.primary, buttonColors.move.hover),
      jump: new JumpButton(0, 0, 100, 50, buttonColors.jump.primary, buttonColors.jump.hover),
      attack: new AttackButton(0, 0, 100, 50, buttonColors.attack.primary, buttonColors.attack.hover)
    };
  }
  
  /**
   * Set up the button system
   */
  setupSystem() {
    // Initialize positions
    this.updateButtonPositions();
    
    // Start input handling
    this.inputHandler.initialize();
  }
  
  /**
   * Update positions of all buttons based on canvas dimensions
   */
  updateButtonPositions() {
    const canvas = this.canvas;
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    
    // Calculate ground positioning based on current canvas dimensions
    const groundY = canvasHeight * 0.8;
    const groundHeight = canvasHeight * 0.2;
    const grassHeight = groundHeight * 0.3; // top portion of the ground (grass)
    const dirtHeight = groundHeight * 0.7;  // remaining (dirt)
    
    // Calculate the vertical center of the dirt area
    const dirtCenterY = groundY + grassHeight + (dirtHeight / 2);
    
    // Define button dimensions relative to canvas size for better responsiveness
    const btnHeight = Math.min(dirtHeight * 0.7, canvasHeight * 0.08); // button height with max constraint
    const btnWidth = btnHeight * 2;     // width is set to twice the height
    
    // Define horizontal gaps that scale with canvas size
    const sideGap = Math.max(10, canvasWidth * 0.02);     // gap from canvas left/right edges (minimum 10px)
    const buttonGap = Math.max(5, canvasWidth * 0.01);   // gap between Attack and Jump buttons (minimum 5px)
    
    // Update Move button position
    this.buttons.move.updatePosition(
      sideGap,
      dirtCenterY - btnHeight / 2,
      btnWidth,
      btnHeight
    );
    
    // Update Jump button position
    this.buttons.jump.updatePosition(
      canvasWidth - sideGap - btnWidth,
      dirtCenterY - btnHeight / 2,
      btnWidth,
      btnHeight
    );
    
    // Update Attack button position
    this.buttons.attack.updatePosition(
      canvasWidth - sideGap - btnWidth - buttonGap - btnWidth,
      dirtCenterY - btnHeight / 2,
      btnWidth,
      btnHeight
    );
  }
  
  /**
   * Draw all buttons
   */
  draw() {
    this.renderer.draw();
    
    // Update attack cooldown indicator if needed
    if (this.game && this.game.attacker) {
      const cooldownPercent = this.game.attacker.getCooldownPercentage();
      if (cooldownPercent > 0) {
        this.buttons.attack.setCooldown(cooldownPercent);
      }
    }
  }
  
  /**
   * Trigger the move action
   * @param {boolean} isActive - Whether movement should be active
   */
  triggerMove(isActive) {
    eventSystem.publish('move', isActive);
  }
  
  /**
   * Trigger the jump action
   */
  triggerJump() {
    eventSystem.publish('jump');
  }
  
  /**
   * Trigger the attack action
   */
  triggerAttack() {
    eventSystem.publish('attack');
    
    // Visual feedback for attack button
    this.buttons.attack.setAttacking(true);
  }
  
  /**
   * Clean up resources when system is destroyed
   */
  destroy() {
    // Clean up input handler
    if (this.inputHandler) {
      this.inputHandler.cleanup();
    }
    
    // Clear references
    this.game = null;
    this.canvas = null;
    this.context = null;
    this.buttons = null;
    this.renderer = null;
    this.inputHandler = null;
  }
}

export default ButtonSystem;