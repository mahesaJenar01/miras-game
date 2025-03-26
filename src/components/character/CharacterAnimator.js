/**
 * CharacterAnimator.js - Handles character animations separately from rendering
 * Manages animation state, timing, and calculations
 */
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
    
    // Jump animation properties
    this.jumpVelocity = 0;
    this.gravity = 0.4;
    this.initialY = character.y;
    
    // Attack animation properties (for attacker)
    this.isAttacking = false;
    this.attackFrame = 0;
    this.attackDuration = 40; // How long the attack animation plays
    this.attackCooldown = 0;
    this.maxCooldown = 120; // 2 seconds at 60fps
  }
  
  /**
   * Update all animations for the character
   */
  update() {
    // Update walking animation
    if (this.character.isWalking) {
      this.updateWalkAnimation();
    }
    
    // Update jump animation
    if (this.character.isJumping) {
      this.updateJumpAnimation();
    }
    
    // Update attack animation if applicable
    if (this.isAttacking) {
      this.updateAttackAnimation();
    } else if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
  }
  
  /**
   * Update the walking animation
   */
  updateWalkAnimation() {
    this.walkCycle += this.walkSpeed;
    
    // Calculate swing values for limbs
    const legSwing = Math.sin(this.walkCycle) * this.swingAmplitude;
    const armSwing = Math.sin(this.walkCycle) * (this.swingAmplitude * 2);
    
    // Set the swing values on the limbs
    if (this.character.leftHand && this.character.rightHand) {
      this.character.leftHand.swing = armSwing;
      this.character.rightHand.swing = armSwing;
    }
    
    if (this.character.leftLeg && this.character.rightLeg) {
      this.character.leftLeg.swing = legSwing;
      this.character.rightLeg.swing = legSwing;
    }
  }
  
  /**
   * Update the jump animation
   */
  updateJumpAnimation() {
    // Apply physics
    this.character.y -= this.jumpVelocity;
    this.jumpVelocity -= this.gravity;
    
    // Check if character has landed
    if (this.character.y >= this.initialY) {
      this.character.y = this.initialY;
      this.character.isJumping = false;
      this.jumpVelocity = 0;
    }
  }
  
  /**
   * Start a jump if not already jumping
   */
  startJump() {
    if (!this.character.isJumping) {
      this.character.isJumping = true;
      this.jumpVelocity = 10; // Initial upward velocity
      this.initialY = this.character.y;
    }
  }
  
  /**
   * Update the attack animation
   */
  updateAttackAnimation() {
    // Increase attack frame
    this.attackFrame++;
    
    // Calculate animation progress (0 to 1)
    const animProgress = this.attackFrame / this.attackDuration;
    
    // Check if attack animation is complete
    if (this.attackFrame >= this.attackDuration) {
      this.isAttacking = false;
      this.attackCooldown = this.maxCooldown;
      this.attackFrame = 0;
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
   */
  reset() {
    this.walkCycle = 0;
    this.jumpVelocity = 0;
    this.isAttacking = false;
    this.attackFrame = 0;
    
    // Don't reset cooldown to allow for attack timing to persist
  }
}

export default CharacterAnimator;