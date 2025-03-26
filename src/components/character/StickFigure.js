/**
 * StickFigure.js - Implementation of the main feminine character
 * Extends the base Character class with specific configurations
 */
import Character from './base/Character.js';
import CharacterAnimator from './CharacterAnimator.js';
import Skirt from './accessories/Skirt.js';

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
    // Update animator to handle all animations
    this.animator.update();
    
    // Update part positions after any animations
    this.updatePartPositions();
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
    this.animator.startJump();
  }
  
  /**
   * Update jump animation using the animator
   */
  updateJump() {
    if (this.isJumping) {
      this.animator.updateJumpAnimation();
      this.updatePartPositions();
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
  }
}

export default StickFigure;