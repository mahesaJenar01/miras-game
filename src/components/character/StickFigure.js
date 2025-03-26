/**
 * StickFigure.js - Implementation of the main feminine character
 * Extends the base Character class with specific configurations
 * Updated to use the event system
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
    // Listen for move events
    GameEvents.on(CHARACTER_EVENTS.MOVE_START, (data) => {
      this.isWalking = true;
    });
    
    GameEvents.on(CHARACTER_EVENTS.MOVE_STOP, (data) => {
      this.isWalking = false;
    });
    
    // Listen for jump events
    GameEvents.on(CHARACTER_EVENTS.JUMP_START, (data) => {
      this.startJump();
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
      GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
        character: 'stickfigure',
        x: this.x,
        y: this.y,
        state: this.isJumping ? 'jumping' : (this.isWalking ? 'walking' : 'standing')
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
    
    // Draw limbs with animation if walking
    if (this.isWalking) {
      this.leftHand.drawAnimated(this.leftHand.swing || 0);
      this.rightHand.drawAnimated(this.rightHand.swing || 0);
      this.leftLeg.drawAnimated(this.leftLeg.swing || 0);
      this.rightLeg.drawAnimated(this.rightLeg.swing || 0);
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
   * Start a jump using the animator
   */
  startJump() {
    if (!this.isJumping) {
      this.animator.startJump();
      
      // Emit jump start event
      GameEvents.emitCharacter(CHARACTER_EVENTS.JUMP_START, {
        character: 'stickfigure',
        x: this.x,
        y: this.y
      });
    }
  }
  
  /**
   * Update jump animation using the animator
   */
  updateJump() {
    if (this.isJumping) {
      const prevY = this.y;
      
      this.animator.updateJumpAnimation();
      this.updatePartPositions();
      
      // Emit position change event if position changed
      if (prevY !== this.y) {
        GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
          character: 'stickfigure',
          x: this.x,
          y: this.y,
          state: 'jumping'
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