import ButtonRenderer from './ButtonRenderer.js';
import ButtonInputHandler from './ButtonInputHandler.js';
import MoveButton from './buttons/MoveButton.js';
import JumpButton from './buttons/JumpButton.js';
import AttackButton from './buttons/AttackButton.js';
import GameEvents from '../events/GameEvents.js';
import { INPUT_EVENTS, CHARACTER_EVENTS, UI_EVENTS } from '../events/EventTypes.js';

/**
 * ButtonSystem - Central coordinator for all button-related functionality
 * Manages button creation, positioning, and actions using the event system
 * Updated to support simultaneous button actions
 */
export default class ButtonSystem {
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
    
    // Track button active states
    this.activeButtons = new Set();
    
    // Initialize the renderer
    this.renderer = new ButtonRenderer(context, this.buttons);
    
    // Initialize the input handler
    this.inputHandler = new ButtonInputHandler(this, canvas, this.buttons);
    
    // Setup the system
    this.setupSystem();
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners for button actions
   */
  registerEventListeners() {
    // Listen for button press events
    GameEvents.on(INPUT_EVENTS.BUTTON_PRESS, (data) => {
      const { buttonKey } = data;
      
      // Add button to active set
      this.activeButtons.add(buttonKey);
      
      // Trigger the appropriate action based on the button
      if (buttonKey === 'move') {
        this.handleMoveButtonPress();
      } else if (buttonKey === 'jump') {
        this.handleJumpButtonPress();
      } else if (buttonKey === 'attack') {
        this.handleAttackButtonPress();
      }
    });
    
    // Listen for button release events
    GameEvents.on(INPUT_EVENTS.BUTTON_RELEASE, (data) => {
      const { buttonKey } = data;
      
      // Remove button from active set
      this.activeButtons.delete(buttonKey);
      
      // Handle button release actions
      if (buttonKey === 'move') {
        this.handleMoveButtonRelease();
      }
      // Jump and attack don't need special release handling
    });
    
    // Listen for cooldown updates to reflect in the UI
    GameEvents.on(CHARACTER_EVENTS.COOLDOWN_UPDATE, (data) => {
      const { cooldownPercent } = data;
      this.buttons.attack.setCooldown(cooldownPercent);
      
      // Also emit a UI event for the button cooldown
      GameEvents.emitUI(UI_EVENTS.BUTTON_COOLDOWN_UPDATE, {
        buttonKey: 'attack',
        cooldownPercent
      });
    });
    
    // Listen for attack state changes to update visual feedback
    GameEvents.on(CHARACTER_EVENTS.ATTACK_START, () => {
      this.buttons.attack.setAttacking(true);
    });
    
    GameEvents.on(CHARACTER_EVENTS.ATTACK_END, () => {
      this.buttons.attack.setAttacking(false);
    });
  }
  
  /**
   * Handle move button press - now preserves other active states
   */
  handleMoveButtonPress() {
    // Emit character movement start event
    GameEvents.emitCharacter(CHARACTER_EVENTS.MOVE_START, {
      direction: 'right', // Since this game only moves right
      activeButtons: Array.from(this.activeButtons)
    });
  }
  
  /**
   * Handle move button release - now preserves other active states
   */
  handleMoveButtonRelease() {
    // Emit character movement stop event
    GameEvents.emitCharacter(CHARACTER_EVENTS.MOVE_STOP, {
      direction: 'right', // Since this game only moves right
      activeButtons: Array.from(this.activeButtons)
    });
  }
  
  /**
   * Handle jump button press - now works alongside other actions
   */
  handleJumpButtonPress() {
    // Emit character jump start event
    GameEvents.emitCharacter(CHARACTER_EVENTS.JUMP_START, {
      activeButtons: Array.from(this.activeButtons)
    });
  }
  
  /**
   * Handle attack button press - now works alongside other actions
   */
  handleAttackButtonPress() {
    // Emit character attack start event
    GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_START, {
      activeButtons: Array.from(this.activeButtons)
    });
  }
  
  /**
   * Create all button instances
   * @returns {Object} Object containing all button instances
   */
  createButtons() {
    return {
      move: new MoveButton(),
      jump: new JumpButton(),
      attack: new AttackButton()
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
    
    // Emit UI update event
    GameEvents.emitUI(UI_EVENTS.UPDATE, {
      type: 'button_positions',
      buttons: {
        move: { x: this.buttons.move.x, y: this.buttons.move.y, width: btnWidth, height: btnHeight },
        jump: { x: this.buttons.jump.x, y: this.buttons.jump.y, width: btnWidth, height: btnHeight },
        attack: { x: this.buttons.attack.x, y: this.buttons.attack.y, width: btnWidth, height: btnHeight }
      }
    });
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
        
        // Emit cooldown update event
        GameEvents.emitCharacter(CHARACTER_EVENTS.COOLDOWN_UPDATE, {
          cooldownPercent
        });
      }
    }
  }
  
  /**
   * Check if a specific button is currently active
   * @param {string} buttonKey - The button key to check
   * @returns {boolean} True if the button is active
   */
  isButtonActive(buttonKey) {
    return this.activeButtons.has(buttonKey);
  }
  
  /**
   * Get all currently active buttons
   * @returns {Array} Array of active button keys
   */
  getActiveButtons() {
    return Array.from(this.activeButtons);
  }
  
  /**
   * Legacy method to trigger move (now uses the event system)
   * @param {boolean} isActive - Whether movement should be active
   */
  triggerMove(isActive) {
    // For backward compatibility - emit events instead of direct calls
    if (isActive) {
      // Add to active buttons if not already there
      this.activeButtons.add('move');
      
      GameEvents.emitCharacter(CHARACTER_EVENTS.MOVE_START, {
        direction: 'right',
        activeButtons: Array.from(this.activeButtons)
      });
    } else {
      // Remove from active buttons
      this.activeButtons.delete('move');
      
      GameEvents.emitCharacter(CHARACTER_EVENTS.MOVE_STOP, {
        direction: 'right',
        activeButtons: Array.from(this.activeButtons)
      });
    }
  }
  
  /**
   * Legacy method to trigger jump (now uses the event system)
   */
  triggerJump() {
    // Add to active buttons (will be released automatically after jump ends)
    this.activeButtons.add('jump');
    
    // For backward compatibility - emit an event instead of direct call
    GameEvents.emitCharacter(CHARACTER_EVENTS.JUMP_START, {
      activeButtons: Array.from(this.activeButtons)
    });
  }
  
  /**
   * Legacy method to trigger attack (now uses the event system)
   */
  triggerAttack() {
    // Add to active buttons (will be released automatically after attack ends)
    this.activeButtons.add('attack');
    
    // For backward compatibility - emit an event instead of direct call
    GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_START, {
      activeButtons: Array.from(this.activeButtons)
    });
  }
  
  /**
   * Clean up all event listeners when the system is destroyed
   */
  cleanup() {
    // Clean up input handler
    this.inputHandler.cleanup();
    
    // Remove all event listeners from GameEvents
    // Note: In a real implementation, you would keep track of listeners and remove them specifically
    // This is a simplified example
  }
}