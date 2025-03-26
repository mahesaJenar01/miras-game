/**
 * Attacker.js - Implementation of the heroic attacker character
 * Extends the base Character class with specific configurations
 */
import Character from './base/Character.js';
import CharacterAnimator from './CharacterAnimator.js';
import GlowEffect from './effects/GlowEffect.js';
import ParticleSystem from './effects/ParticleSystem.js';
import Cape from './accessories/Cape.js';
import Shield from './accessories/Shield.js';
import Sword from './accessories/Sword.js';

class Attacker extends Character {
  /**
   * Create a new attacker character
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {StickFigure} stickfigure - Reference to the main stickfigure
   */
  constructor(context, stickfigure) {
    // Size relative to the main stickfigure
    const sizeMultiplier = 1.5;
    
    // Configuration for heroic attacker
    const config = {
      color: "#3A86FF", // Strong blue for a heroic look
      tickness: stickfigure.tickness + 1,
      scale: sizeMultiplier,
      radius: stickfigure.config.radius,
      bodyLength: stickfigure.config.bodyLength,
      handsLength: stickfigure.config.handsLength,
      legLength: stickfigure.config.legLength,
      hasFeminineFeatures: false, // Masculine character
      handsRatio: stickfigure.config.handsRatio,
      legsRatio: stickfigure.config.legsRatio,
      walkSpeed: stickfigure.config.walkSpeed
    };
    
    // Position offset (will appear in front of the main character)
    const xOffset = stickfigure.x + stickfigure.config.radius * 3;
    const yOffset = stickfigure.y;
    
    // Call base class constructor
    super(context, xOffset, yOffset, config);
    
    // Store reference to main character
    this.stickfigure = stickfigure;
    
    // Create animator
    this.animator = new CharacterAnimator(this);
    
    // Additional attacker-specific properties
    this.isAttacking = false;
    this.attackRange = 150; // Attack range in pixels
    this.swordColor = "#FF10F0"; // Bright pink/magenta for sword
    this.glowColor = "rgba(58, 134, 255, 0.3)"; // Semi-transparent version of main color
    
    // Position offset values
    this.xOffset = stickfigure.config.radius * 3;
    this.yOffset = 0;
    
    // Create effects engines
    this.glowEffect = new GlowEffect(context);
    this.particleSystem = new ParticleSystem(context);
    
    // Add accessories
    this.addAccessories();
  }
  
  /**
   * Add all accessories for the attacker
   */
  addAccessories() {
    // Add cape
    const cape = new Cape(this.context, this);
    this.addAccessory(cape);
    
    // Add shield
    const shield = new Shield(this.context, this);
    this.addAccessory(shield);
    
    // Add sword
    const sword = new Sword(this.context, this);
    this.addAccessory(sword);
  }
  
  /**
   * Start the attack if not on cooldown
   * @returns {boolean} Whether the attack was started
   */
  startAttack() {
    return this.animator.startAttack();
  }
  
  /**
   * Update the attacker state
   */
  update() {
    // Update position to maintain relative position to stickfigure
    this.updatePosition();
    
    // Update animator
    this.animator.update();
    
    // Update particle system
    this.particleSystem.update();
    
    // Update attack state
    this.isAttacking = this.animator.isAttacking;
  }
  
  /**
   * Update attacker position to maintain offset from stickfigure
   */
  updatePosition() {
    // Stay at consistent offset from stickfigure
    this.x = this.stickfigure.x + this.xOffset;
    this.y = this.stickfigure.y + this.yOffset;
    
    // When attacking, temporarily modify position
    if (this.isAttacking) {
      const animProgress = this.animator.attackFrame / this.animator.attackDuration;
      const appearProgress = animProgress < 0.3 ? animProgress / 0.3 : 1;
      const attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : (animProgress >= 0.7 ? 1 : 0);
      const disappearProgress = animProgress > 0.7 ? (animProgress - 0.7) / 0.3 : 0;
      
      // Calculate position with dynamic movement during attack
      let forwardStep = 0;
      if (attackProgress > 0) {
        // Move forward during attack and then back
        if (attackProgress < 0.5) {
          forwardStep = attackProgress * 2 * (this.stickfigure.config.radius * 2);
        } else {
          forwardStep = (1 - attackProgress) * 2 * (this.stickfigure.config.radius * 2);
        }
      }
      
      // Apply forward movement
      this.x += forwardStep;
    }
  }
  
  /**
   * Draw the attacker with special effects
   */
  draw() {
    // Only draw when attacking
    if (!this.isAttacking) return;
    
    // Calculate animation progress
    const animProgress = this.animator.attackFrame / this.animator.attackDuration;
    const appearProgress = animProgress < 0.3 ? animProgress / 0.3 : 1;
    const attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : (animProgress >= 0.7 ? 1 : 0);
    const disappearProgress = animProgress > 0.7 ? (animProgress - 0.7) / 0.3 : 0;
    
    // Apply slight transparency for the whole attacker
    this.context.save();
    this.context.globalAlpha = appearProgress * (1 - disappearProgress);
    
    // Draw heroic glow
    const glowRadius = this.config.radius * 1.5 * this.config.scale * (attackProgress * 0.7 + 0.3);
    this.glowEffect.configure({
      color: this.glowColor,
      radius: glowRadius,
      intensity: appearProgress * (1 - disappearProgress)
    }).drawCircular(this.x, this.y);
    
    // Draw the base character parts
    this.head.draw();
    this.body.draw();
    this.leftHand.draw();
    this.rightHand.draw();
    this.leftLeg.draw();
    this.rightLeg.draw();
    
    // Draw all accessories
    this.accessories.forEach(accessory => {
      if (accessory.draw) {
        accessory.draw();
      }
    });
    
    this.context.restore();
  }
  
  /**
   * Get the attack hitbox for collision detection
   * @returns {Object|null} Hitbox object or null if not attacking
   */
  getAttackHitbox() {
    if (!this.isAttacking) return null;
    
    // Only create hitbox during active attack phase
    const animProgress = this.animator.attackFrame / this.animator.attackDuration;
    if (animProgress < 0.2 || animProgress > 0.7) return null;
    
    return {
      x: this.x,
      y: this.y,
      width: this.attackRange,
      height: this.config.bodyLength * 2
    };
  }
  
  /**
   * Get cooldown percentage (for UI display)
   * @returns {number} Cooldown percentage (0-1)
   */
  getCooldownPercentage() {
    return this.animator.getCooldownPercentage();
  }
}

export default Attacker;