/**
 * StickFigure.js - Implementation of the main feminine character
 * Extends the base Character class with specific configurations
 * Updated to use the event system and support simultaneous actions
 */
import Character from './base/Character.js';
import CharacterAnimator from './CharacterAnimator.js';
import Skirt from './accessories/Skirt.js';
import GameEvents from '../../events/GameEvents.js';
import { CHARACTER_EVENTS, GAME_EVENTS } from '../../events/EventTypes.js';

class StickFigure extends Character {
  /**
   * Create a new stick figure character (girlfriend)
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} color - Character color
   * @param {number} tickness - Line thickness
   * @param {number} radius - Head radius
   */
  constructor(context, x, y, color = "#FF69B4", tickness = 3, radius = 10) {
    // Create configuration for feminine character
    const config = {
      color: color,
      tickness: tickness,
      scale: 1,
      radius: radius,
      bodyLength: radius * 2.5,
      handsLength: radius,
      legLength: radius * 1.5,
      hasFeminineFeatures: true,
      handsRatio: 0.2,
      legsRatio: 1,
      walkSpeed: 0.1
    };
    
    // Call base class constructor with feminine configuration
    super(context, x, y, config);
    
    // Create animator
    this.animator = new CharacterAnimator(this);
    
    // Add skirt accessory
    this.addSkirt();
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners for character behavior
   */
  registerEventListeners() {
    // Listen for move events - now preserves other states
    GameEvents.on(CHARACTER_EVENTS.MOVE_START, (data) => {
      this.isWalking = true;
      
      // Emit combined state event if also jumping
      if (this.isJumping) {
        GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
          character: 'stickfigure',
          x: this.x,
          y: this.y,
          state: 'walking_jumping',
          isWalking: true,
          isJumping: true
        });
      }
    });
    
    GameEvents.on(CHARACTER_EVENTS.MOVE_STOP, (data) => {
      this.isWalking = false;
      
      // Emit state update when walking stops but jumping continues
      if (this.isJumping) {
        GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
          character: 'stickfigure',
          x: this.x,
          y: this.y,
          state: 'jumping',
          isWalking: false,
          isJumping: true
        });
      }
    });
    
    // Listen for jump events - now preserves walking state
    GameEvents.on(CHARACTER_EVENTS.JUMP_START, (data) => {
      this.startJump();
      
      // State change events are emitted in startJump() method
    });
    
    // Listen for game resize events
    GameEvents.on(GAME_EVENTS.RESIZE, (data) => {
      const { width, height, radius } = data;
      if (radius) {
        this.resize(radius);
      }
    });
  }
  
  /**
   * Clean up event listeners when the character is destroyed
   */
  cleanup() {
    // In a real implementation, we would keep references to listeners
    // and remove them specifically, but this is a simplified example
  }
  
  /**
   * Add the skirt accessory
   */
  addSkirt() {
    const skirt = new Skirt(this.context, this);
    this.addAccessory(skirt);
  }
  
  /**
   * Update the character state each frame
   */
  update() {
    const prevX = this.x;
    const prevY = this.y;
    
    // Update animator to handle all animations
    this.animator.update();
    
    // Update part positions after any animations
    this.updatePartPositions();
    
    // Emit position change event if position changed
    if (prevX !== this.x || prevY !== this.y) {
      // Determine combined state for event
      let state = 'standing';
      if (this.isWalking && this.isJumping) {
        state = 'walking_jumping';
      } else if (this.isWalking) {
        state = 'walking';
      } else if (this.isJumping) {
        state = 'jumping';
      }
      
      GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
        character: 'stickfigure',
        x: this.x,
        y: this.y,
        state: state,
        isWalking: this.isWalking,
        isJumping: this.isJumping
      });
    }
  }
  
  /**
   * Override draw method to use animator's calculated values
   */
  draw() {
    // Update positions of all parts
    this.updatePartPositions();
    
    // Draw head
    this.head.draw();
    
    // Draw body
    this.body.draw();
    
    // Draw limbs with animation
    // Now uses combined state information from animator
    const legSwing = this.animator.getLegSwing();
    const armSwing = this.animator.getArmSwing();
    
    if (this.isWalking || this.animator.needsLimbAnimation()) {
      this.leftHand.drawAnimated(armSwing);
      this.rightHand.drawAnimated(armSwing);
      this.leftLeg.drawAnimated(legSwing);
      this.rightLeg.drawAnimated(legSwing);
    } else {
      this.leftHand.draw();
      this.rightHand.draw();
      this.leftLeg.draw();
      this.rightLeg.draw();
    }
    
    // Draw all accessories
    this.accessories.forEach(accessory => {
      if (accessory.draw) {
        accessory.draw();
      }
    });
  }
  
  /**
   * Start a jump using the animator - now preserves walking state
   */
  startJump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.animator.startJump();
      
      // Determine combined state for event
      const state = this.isWalking ? 'walking_jumping' : 'jumping';
      
      // Emit jump start event
      GameEvents.emitCharacter(CHARACTER_EVENTS.JUMP_START, {
        character: 'stickfigure',
        x: this.x,
        y: this.y,
        state: state,
        isWalking: this.isWalking,
        isJumping: true
      });
    }
  }
  
  /**
   * Update jump animation using the animator - maintains walking if active
   */
  updateJump() {
    if (this.isJumping) {
      const prevY = this.y;
      
      this.animator.updateJumpAnimation();
      this.updatePartPositions();
      
      // Emit position change event if position changed
      if (prevY !== this.y) {
        // Determine combined state for event
        const state = this.isWalking ? 'walking_jumping' : 'jumping';
        
        GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
          character: 'stickfigure',
          x: this.x,
          y: this.y,
          state: state,
          isWalking: this.isWalking,
          isJumping: true
        });
      }
    }
  }
  
  /**
   * Handle resize or other configuration changes
   * @param {number} radius - New head radius
   */
  resize(radius) {
    this.updateConfig({
      radius: radius,
      bodyLength: radius * 2.5,
      handsLength: radius,
      legLength: radius * 1.5
    });
    
    // Emit event for other components that need to be aware of size changes
    GameEvents.emitCharacter(CHARACTER_EVENTS.ANIMATION_START, {
      type: 'resize',
      radius: radius,
      characterType: 'stickfigure'
    });
  }
}

export default StickFigure;