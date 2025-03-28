/**
 * CharacterAnimator.js - Handles character animations separately from rendering
 * Manages animation state, timing, and calculations
 * Updated to support simultaneous animations for multiple actions
 */
import GameEvents from '../../events/GameEvents.js';
import { CHARACTER_EVENTS } from '../../events/EventTypes.js';

class CharacterAnimator {
  /**
   * Create a new character animator
   * @param {Character} character - The character to animate
   */
  constructor(character) {
    this.character = character;
    
    // Walking animation properties
    this.walkCycle = 0;
    this.walkSpeed = character.config.walkSpeed || 0.1;
    this.swingAmplitude = Math.PI / 6; // 30° swing amplitude
    this.legSwing = 0;
    this.armSwing = 0;
    
    // Jump animation properties
    this.jumpVelocity = 0;
    this.gravity = 0.4;
    this.initialY = character.y;
    this.jumpBlendFactor = 0; // For blending jump with walk animations
    
    // Attack animation properties (for attacker)
    this.isAttacking = false;
    this.attackFrame = 0;
    this.attackDuration = 40; // How long the attack animation plays
    this.attackCooldown = 0;
    this.maxCooldown = 120; // 2 seconds at 60fps
    
    // Character identification (for event data)
    this.characterType = character.constructor.name.toLowerCase();
    
    // Register event listeners if this is a main character (stickfigure)
    if (this.characterType === 'stickfigure') {
      this.registerEventListeners();
    }
  }
  
  /**
   * Register event listeners for character animations
   */
  registerEventListeners() {
    // Listen for movement events
    GameEvents.on(CHARACTER_EVENTS.MOVE_START, () => {
      if (!this.character.isWalking) {
        this.character.isWalking = true;
      }
    });
    
    GameEvents.on(CHARACTER_EVENTS.MOVE_STOP, () => {
      if (this.character.isWalking) {
        this.character.isWalking = false;
      }
    });
    
    // Listen for jump events
    GameEvents.on(CHARACTER_EVENTS.JUMP_START, () => {
      this.startJump();
    });
  }
  
  /**
   * Clean up event listeners
   */
  cleanup() {
    // In a real implementation, we would keep references to listeners
    // and remove them specifically, but this is a simplified example
  }
  
  /**
   * Update all animations for the character
   * Now supports simultaneous walking and jumping
   */
  update() {
    // Update walking animation if walking is active
    if (this.character.isWalking) {
      this.updateWalkAnimation();
    } else {
      // Gradually reduce swing when not walking
      this.legSwing *= 0.8;
      this.armSwing *= 0.8;
    }
    
    // Update jump animation if jumping is active
    if (this.character.isJumping) {
      this.updateJumpAnimation();
    }
    
    // Update attack animation if applicable
    if (this.isAttacking) {
      this.updateAttackAnimation();
    } else if (this.attackCooldown > 0) {
      this.attackCooldown--;
      
      // Emit cooldown update event periodically
      if (this.attackCooldown % 5 === 0) {
        GameEvents.emitCharacter(CHARACTER_EVENTS.COOLDOWN_UPDATE, {
          cooldownPercent: this.getCooldownPercentage(),
          characterType: this.characterType
        });
      }
    }
  }
  
  /**
   * Update the walking animation
   * Now stores swing values for blending with jumping
   */
  updateWalkAnimation() {
    this.walkCycle += this.walkSpeed;
    
    // Calculate swing values for limbs
    this.legSwing = Math.sin(this.walkCycle) * this.swingAmplitude;
    this.armSwing = Math.sin(this.walkCycle) * (this.swingAmplitude * 2);
    
    // Emit animation frame event
    GameEvents.emitCharacter(CHARACTER_EVENTS.ANIMATION_FRAME, {
      type: 'walk',
      progress: this.walkCycle,
      characterType: this.characterType
    });
  }
  
  /**
   * Update the jump animation
   * Now preserves walking state and blends with walking animation
   */
  updateJumpAnimation() {
    const prevY = this.character.y;
    
    // Apply physics
    this.character.y -= this.jumpVelocity;
    this.jumpVelocity -= this.gravity;
    
    // Update jump blend factor based on jump height
    this.jumpBlendFactor = Math.min(1, Math.abs(this.character.y - this.initialY) / 50);
    
    // Check if character is at the peak of the jump
    if (this.jumpVelocity <= 0 && this.jumpVelocity + this.gravity > 0) {
      // Emit jump peak event
      GameEvents.emitCharacter(CHARACTER_EVENTS.JUMP_PEAK, {
        y: this.character.y,
        characterType: this.characterType,
        isWalking: this.character.isWalking
      });
    }
    
    // Check if character has landed
    if (this.character.y >= this.initialY) {
      this.character.y = this.initialY;
      this.character.isJumping = false;
      this.jumpVelocity = 0;
      this.jumpBlendFactor = 0;
      
      // Emit jump end event
      GameEvents.emitCharacter(CHARACTER_EVENTS.JUMP_END, {
        characterType: this.characterType,
        isWalking: this.character.isWalking
      });
    }
    
    // Emit position change event
    if (prevY !== this.character.y) {
      // Determine combined state
      const state = this.character.isWalking ? 'walking_jumping' : 'jumping';
      
      GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
        character: this.characterType,
        x: this.character.x,
        y: this.character.y,
        state: state,
        isWalking: this.character.isWalking,
        isJumping: true
      });
    }
  }
  
  /**
   * Start a jump if not already jumping
   * Maintains walking state if active
   */
  startJump() {
    if (!this.character.isJumping) {
      this.character.isJumping = true;
      this.jumpVelocity = 10; // Initial upward velocity
      this.initialY = this.character.y;
      
      // Determine combined state
      const state = this.character.isWalking ? 'walking_jumping' : 'jumping';
      
      // Emit jump start event
      GameEvents.emitCharacter(CHARACTER_EVENTS.JUMP_START, {
        characterType: this.characterType,
        x: this.character.x,
        y: this.character.y,
        state: state,
        isWalking: this.character.isWalking
      });
    }
  }
  
  /**
   * Get the current leg swing value, blended with jump state if needed
   * @returns {number} Current leg swing value
   */
  getLegSwing() {
    // Apply jump influence to leg animation when jumping
    if (this.character.isJumping) {
      // Reduce leg swing during jump height based on jump blend factor
      return this.legSwing * (1 - this.jumpBlendFactor * 0.5);
    }
    return this.legSwing;
  }
  
  /**
   * Get the current arm swing value, blended with jump state if needed
   * @returns {number} Current arm swing value
   */
  getArmSwing() {
    // Apply jump influence to arm animation when jumping
    if (this.character.isJumping) {
      // Reduce arm swing during jump height
      return this.armSwing * (1 - this.jumpBlendFactor * 0.3);
    }
    return this.armSwing;
  }
  
  /**
   * Check if limb animation is needed even when not walking
   * @returns {boolean} Whether limb animation is needed
   */
  needsLimbAnimation() {
    // Animations are needed if jumping or attacking
    return this.character.isJumping || this.isAttacking;
  }
  
  /**
   * Update the attack animation
   */
  updateAttackAnimation() {
    const prevFrame = this.attackFrame;
    
    // Increase attack frame
    this.attackFrame++;
    
    // Calculate animation progress (0 to 1)
    const animProgress = this.attackFrame / this.attackDuration;
    
    // Emit animation frame event on significant changes
    if (Math.floor(prevFrame / 5) !== Math.floor(this.attackFrame / 5)) {
      GameEvents.emitCharacter(CHARACTER_EVENTS.ANIMATION_FRAME, {
        type: 'attack',
        progress: animProgress,
        frame: this.attackFrame,
        characterType: this.characterType
      });
    }
    
    // Check if attack animation is complete
    if (this.attackFrame >= this.attackDuration) {
      this.isAttacking = false;
      this.attackCooldown = this.maxCooldown;
      this.attackFrame = 0;
      
      // Emit attack end event
      GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_END, {
        characterType: this.characterType
      });
      
      // Also emit cooldown start event
      GameEvents.emitCharacter(CHARACTER_EVENTS.COOLDOWN_START, {
        duration: this.maxCooldown,
        cooldownPercent: 1.0,
        characterType: this.characterType
      });
    }
    
    // Return the animation progress for use by attacker/effects
    return animProgress;
  }
  
  /**
   * Start an attack if not on cooldown
   * @returns {boolean} Whether the attack was started
   */
  startAttack() {
    if (this.attackCooldown <= 0 && !this.isAttacking) {
      this.isAttacking = true;
      this.attackFrame = 0;
      
      // Emit attack start event
      GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_START, {
        characterType: this.characterType
      });
      
      // Also emit animation start event
      GameEvents.emitCharacter(CHARACTER_EVENTS.ANIMATION_START, {
        type: 'attack',
        duration: this.attackDuration,
        characterType: this.characterType
      });
      
      return true;
    }
    return false;
  }
  
  /**
   * Get cooldown percentage (for UI display)
   * @returns {number} Cooldown percentage (0-1)
   */
  getCooldownPercentage() {
    if (this.isAttacking) return 1.0;
    return this.attackCooldown / this.maxCooldown;
  }
  
  /**
   * Reset the animator state (for restarting animations)
   * Preserves independent animation states
   */
  reset() {
    this.walkCycle = 0;
    this.legSwing = 0;
    this.armSwing = 0;
    
    const wasAttacking = this.isAttacking;
    this.isAttacking = false;
    this.attackFrame = 0;
    
    // Only reset jump if actually jumping
    if (this.character.isJumping) {
      this.jumpVelocity = 0;
      this.character.isJumping = false;
      this.character.y = this.initialY;
      this.jumpBlendFactor = 0;
    }
    
    // Emit events if state changed
    if (wasAttacking) {
      GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_END, {
        characterType: this.characterType
      });
    }
    
    // Don't reset cooldown to allow for attack timing to persist
  }
}

export default CharacterAnimator;