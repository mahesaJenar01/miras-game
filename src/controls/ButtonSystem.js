/**
 * ButtonSystem - Central coordinator for all button-related functionality
 * Manages button creation, positioning, and actions using the event system
 * Updated to include collection button and navigation arrows
 * Added support for restart button and game over state
 */
import ButtonRenderer from './ButtonRenderer.js';
import ButtonInputHandler from './ButtonInputHandler.js';
import MoveButton from './buttons/MoveButton.js';
import JumpButton from './buttons/JumpButton.js';
import AttackButton from './buttons/AttackButton.js';
import ShopButton from './buttons/ShopButton.js';
import CollectionButton from './buttons/CollectionButton.js';
import ArrowButton from './buttons/ArrowButton.js';
import RestartButton from './buttons/RestartButton.js';
import GameEvents from '../events/GameEvents.js';
import { INPUT_EVENTS, CHARACTER_EVENTS, UI_EVENTS, GAME_EVENTS } from '../events/EventTypes.js';

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
    
    // Store collectible display info for coordination
    this.collectibleDisplayInfo = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      padding: 10
    };
    
    // Create button instances (without positions initially)
    this.buttons = this.createButtons();
    
    // Track button active states
    this.activeButtons = new Set();
    
    // Track buttons that should only be visible in specific states
    this.contextualButtons = ['leftArrow', 'rightArrow'];
    
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
          } else if (buttonKey === 'restart') {
            // Use a try-catch to ensure restart is handled properly
      try {
        // Explicitly set the restart button to pressed state for visual feedback
        this.buttons.restart.setPressed(true);
        
        // Add a small delay before emitting the restart event
        // This helps prevent event recursion issues
        setTimeout(() => {
          // Emit game restart event
          GameEvents.emitGame(GAME_EVENTS.RESTART, {
            time: Date.now()
          });
          
          // Release the button after the event is processed
          this.buttons.restart.setPressed(false);
        }, 100);
      } catch (error) {
        // Make sure to release the button even if there's an error
        this.buttons.restart.setPressed(false);
      }
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
    
    // Listen for collectible display updates to coordinate positioning
    GameEvents.on(UI_EVENTS.UPDATE, (data) => {
      if (data.type === 'collectible_display_updated' || data.type === 'collectible_display_ready') {
        // Store collectible display info for positioning coordination
        if (data.width) this.collectibleDisplayInfo.width = data.width;
        if (data.height) this.collectibleDisplayInfo.height = data.height;
        if (data.x !== undefined) this.collectibleDisplayInfo.x = data.x;
        if (data.y !== undefined) this.collectibleDisplayInfo.y = data.y;
        if (data.padding !== undefined) this.collectibleDisplayInfo.padding = data.padding;
        
        // Update button positions to maintain proper layout
        this.updateButtonPositions();
      } else if (data.type === 'game_over') {
        this.handleGameOver(!data.isAlive);
      } else if (data.type === 'game_restart') {
        this.handleGameOver(!data.isAlive);
      }
    });
    
    // Listen for collection open/close events to toggle arrow buttons
    GameEvents.on('collection:open', () => {
      this.showContextualButtons(true);
    });
    
    GameEvents.on('collection:close', () => {
      this.showContextualButtons(false);
    });
    
    // Listen for game over events
    GameEvents.on(GAME_EVENTS.GAME_OVER, (data) => {
      this.handleGameOver(true);
    });
    
    // Listen for restart events
    GameEvents.on(GAME_EVENTS.RESTART_COMPLETE, () => {
      this.handleGameOver(false);
    });
  }

  /**
   * Handle game over state
   * @param {boolean} isGameOver - Whether the game is over
   */
  handleGameOver(isGameOver) {
    // Show/hide restart button based on game over state
    if (this.buttons.restart) {
      // Make sure to set visibility
      this.buttons.restart.setVisible(isGameOver);
      
      // Update position to make sure it's centered and visible
      if (isGameOver) {
        const canvas = this.canvas;
        const restartBtnWidth = Math.min(200, canvas.width * 0.3);
        const restartBtnHeight = Math.min(60, canvas.height * 0.08);
        
        // Position in center of screen where it's clearly visible
        this.buttons.restart.updatePosition(
          (canvas.width - restartBtnWidth) / 2,
          (canvas.height / 2) + 50, // Position below "You Lose" text
          restartBtnWidth,
          restartBtnHeight
        );
      }
    }
    
    // IMPORTANT: Disable all non-restart buttons explicitly
    Object.entries(this.buttons).forEach(([key, button]) => {
      if (key !== 'restart') {
        // Ensure the isDisabled property exists on all buttons
        if (button.isDisabled !== undefined) {
          button.isDisabled = isGameOver;
        } else {
          // If the property doesn't exist, add it
          button.isDisabled = isGameOver;
        }
      }
    });
  }  
  
  /**
   * Toggle visibility of contextual buttons
   * @param {boolean} visible - Whether buttons should be visible
   */
  showContextualButtons(visible) {
    this.contextualButtonsVisible = visible;
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
      attack: new AttackButton(),
      shop: new ShopButton(),
      collection: new CollectionButton(),
      leftArrow: new ArrowButton(0, 0, 50, 50, 'left'),
      rightArrow: new ArrowButton(0, 0, 50, 50, 'right'),
      restart: new RestartButton() // Add restart button
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
    
    // Set default visibility for contextual buttons
    this.contextualButtonsVisible = false;
    
    // Pass navigation buttons to ShopManager if it exists
    if (this.game && this.game.shopManager) {
      this.game.shopManager.setNavigationButtons(
        this.buttons.leftArrow,
        this.buttons.rightArrow
      );
    }
  }
  
  /**
   * Update positions of all buttons based on canvas dimensions and collectible display
   */
  updateButtonPositions() {
    // Add this flag to prevent infinite loops
    if (this._isUpdatingPositions) return;
    this._isUpdatingPositions = true;

    const canvas = this.canvas;
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    
    // Calculate ground positioning based on current canvas dimensions
    const groundY = canvasHeight * 0.7;
    const groundHeight = canvasHeight * 0.3;
    const grassHeight = groundHeight * 0.3; // top portion of the ground (grass)
    const dirtHeight = groundHeight * 0.7;  // remaining (dirt)
    
    // Calculate the vertical center of the dirt area
    const dirtCenterY = groundY + grassHeight + (dirtHeight / 2);
    
    // Define button dimensions relative to canvas size for better responsiveness
    const btnHeight = Math.min(dirtHeight * 0.9, canvasHeight * 0.1); // button height with max constraint
    const btnWidth = btnHeight * 2.2;     // width is set to twice the height
    
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
    
    // Position collectible-related UI at the top
    const padding = this.collectibleDisplayInfo.padding || 10;
    const displayWidth = this.collectibleDisplayInfo.width || 100;
    const displayHeight = this.collectibleDisplayInfo.height || 40;
    
    // Position shop button to the right of collectible display
    this.buttons.shop.updatePosition(
      displayWidth + padding * 2, // Position after the collectible display with padding
      padding, // Same Y position as collectible display
      displayHeight * 2, // Width that's proportional to the display height
      displayHeight // Exactly match the collectible display height
    );
    
    // Position collection button after shop button
    this.buttons.collection.updatePosition(
      displayWidth + padding * 2 + displayHeight * 2 + padding, // After shop button
      padding, // Same Y position
      displayHeight * 2, // Same width as shop button
      displayHeight // Same height
    );
    
    // Position arrow buttons for collection navigation - centered vertically
    const arrowSize = btnHeight * 0.8;
    const arrowY = canvasHeight / 2 - arrowSize / 2;
    
    this.buttons.leftArrow.updatePosition(
      sideGap, // Left edge with gap
      arrowY,
      arrowSize,
      arrowSize
    );
    
    this.buttons.rightArrow.updatePosition(
      canvasWidth - sideGap - arrowSize, // Right edge with gap
      arrowY,
      arrowSize,
      arrowSize
    );
    
    let restartBtnWidth= 0;
    let restartBtnHeight= 0;
    
    // Position restart button at center of screen
    if (this.buttons.restart) {
      restartBtnWidth = Math.min(200, canvasWidth * 0.3);
      restartBtnHeight = Math.min(60, canvasHeight * 0.08);
      
      this.buttons.restart.updatePosition(
        (canvasWidth - restartBtnWidth) / 2,
        dirtCenterY + canvasHeight * 0.1, // Below other buttons
        restartBtnWidth,
        restartBtnHeight
      );
    }
    
    // Emit UI update event
    GameEvents.emitUI(UI_EVENTS.UPDATE, {
      type: 'button_positions',
      buttons: {
        move: { x: this.buttons.move.x, y: this.buttons.move.y, width: btnWidth, height: btnHeight },
        jump: { x: this.buttons.jump.x, y: this.buttons.jump.y, width: btnWidth, height: btnHeight },
        attack: { x: this.buttons.attack.x, y: this.buttons.attack.y, width: btnWidth, height: btnHeight },
        shop: { x: this.buttons.shop.x, y: this.buttons.shop.y, width: displayHeight * 2, height: displayHeight },
        collection: { x: this.buttons.collection.x, y: this.buttons.collection.y, width: displayHeight * 2, height: displayHeight },
        leftArrow: { x: this.buttons.leftArrow.x, y: this.buttons.leftArrow.y, width: arrowSize, height: arrowSize },
        rightArrow: { x: this.buttons.rightArrow.x, y: this.buttons.rightArrow.y, width: arrowSize, height: arrowSize },
        restart: { x: this.buttons.restart.x, y: this.buttons.restart.y, width: restartBtnWidth, height: restartBtnHeight }
      }
    });
    
    // Reset the update flag to allow future updates
    this._isUpdatingPositions = false;
  }
  
  /**
   * Draw all buttons
   */
  draw() {
    // Filter buttons to draw based on context and visibility
    Object.entries(this.buttons).forEach(([key, button]) => {
      // Skip contextual buttons if not visible
      if (this.contextualButtons.includes(key) && !this.contextualButtonsVisible) {
        return;
      }
      
      // Skip restart button if not visible
      if (key === 'restart' && !button.visible) {
        return;
      }
      
      // Draw the button
      this.renderer.drawButton(button);
    });
    
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