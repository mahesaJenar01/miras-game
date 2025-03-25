import Component from '../base/Component.js';
import PhysicsUtils from '../../utils/PhysicsUtils.js';

/**
 * Base Character class for all character components
 * @extends Component
 */
class Character extends Component {
  /**
   * Create a new Character component
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {string} config.color - Character color
   * @param {number} config.thickness - Line thickness
   */
  constructor(context, config) {
    super(context, config);
    
    // Animation states
    this.isWalking = false;
    this.isJumping = false;
  }

  /**
   * Initialize the character
   */
  initialize() {
    const { config } = this;
    
    this.x = config.x;
    this.y = config.y;
    this.color = config.color;
    this.thickness = config.thickness || 2;
    
    // Physics properties
    this.initialY = this.y;
    this.jumpVelocity = 0;
    this.gravity = config.gravity || 0.5;
    this.jumpStrength = config.jumpStrength || 10;
    
    // Animation properties
    this.walkCycle = 0;
    this.walkSpeed = config.walkSpeed || 0.1;
  }

  /**
   * Update character state
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    // Scale animation speed by deltaTime for consistent speed
    const timeScale = deltaTime / 16.67; // 16.67ms is roughly 60fps
    
    // Update walking animation
    if (this.isWalking) {
      this.walkCycle += this.walkSpeed * timeScale;
    }
    
    // Update jump physics
    this.updateJump(deltaTime);
    
    // Call super to update any children
    super.update(deltaTime);
  }

  /**
   * Update jump physics
   * @param {number} deltaTime - Time elapsed since last update
   */
  updateJump(deltaTime) {
    if (this.isJumping) {
      // Apply gravity to velocity (scaled by deltaTime)
      this.jumpVelocity = PhysicsUtils.applyGravity(
        this.jumpVelocity, 
        this.gravity, 
        deltaTime
      );
      
      // Update position based on velocity
      this.y = PhysicsUtils.updatePosition(
        this.y, 
        -this.jumpVelocity, 
        deltaTime
      );
      
      // Check if character has landed
      if (this.y >= this.initialY) {
        this.y = this.initialY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }
  }

  /**
   * Start a jump
   */
  startJump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpStrength;
      this.initialY = this.y;
    }
  }

  /**
   * Draw the character (to be implemented by subclasses)
   */
  draw() {
    // Implement in subclass
    super.draw();
  }

  /**
   * Update character properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} thickness - New line thickness
   */
  updateProperties(x, y, thickness) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.initialY = y;
  }
  
  /**
   * Reset the character to its initial state
   */
  reset() {
    this.y = this.initialY;
    this.isJumping = false;
    this.isWalking = false;
    this.jumpVelocity = 0;
    this.walkCycle = 0;
    
    super.reset();
  }
}

export default Character;