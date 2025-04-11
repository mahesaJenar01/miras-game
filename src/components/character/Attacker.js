/**
 * Attacker.js - Implementation of the heroic attacker character
 * Extends the base Character class with specific configurations
 * Updated to use the event system
 */
import Character from './base/Character.js';
import CharacterAnimator from './CharacterAnimator.js';
import GlowEffect from './effects/GlowEffect.js';
import ParticleSystem from './effects/ParticleSystem.js';
import Cape from './accessories/Cape.js';
import Shield from './accessories/Shield.js';
import Sword from './accessories/Sword.js';
import GameEvents from '../../events/GameEvents.js';
import { CHARACTER_EVENTS, GAME_EVENTS } from '../../events/EventTypes.js';

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
    
    // Add sword sensitivity control (1.0 is default, higher means greater range)
    this.swordSensitivity = 1.0;
    
    // Add accessories
    this.addAccessories();
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners for attacker behavior
   */
  registerEventListeners() {
    // Listen for character position updates to maintain relative position
    GameEvents.on(CHARACTER_EVENTS.POSITION_CHANGE, (data) => {
      if (data.character === 'stickfigure') {
        // Update position relative to main character
        this.updatePositionFromEvent(data.x, data.y);
      }
    });
    
    // Listen for attack commands
    GameEvents.on(CHARACTER_EVENTS.ATTACK_START, () => {
      this.startAttack();
    });
    
    // Listen for game resize events
    GameEvents.on(GAME_EVENTS.RESIZE, () => {
      // Update any size-dependent properties
      this.updateForResize();
    });
  }
  
  /**
   * Set sword sensitivity
   * @param {number} sensitivity - Sensitivity value (1.0 is standard, higher means greater range)
   */
  setSwordSensitivity(sensitivity) {
    // Ensure sensitivity is at least 0.5 and cap at a reasonable maximum of 3.0
    this.swordSensitivity = Math.max(0.5, Math.min(3.0, sensitivity));
  }

  /**
   * Get current sword sensitivity
   * @returns {number} Current sensitivity value
   */
  getSwordSensitivity() {
    return this.swordSensitivity;
  }

  /**
   * Clean up event listeners when the attacker is destroyed
   */
  cleanup() {
    // In a real implementation, we would keep references to listeners
    // and remove them specifically, but this is a simplified example
  }
  
  /**
   * Update position based on stickfigure position event
   * @param {number} stickfigureX - Main character X position
   * @param {number} stickfigureY - Main character Y position
   */
  updatePositionFromEvent(stickfigureX, stickfigureY) {
    this.x = stickfigureX + this.xOffset;
    this.y = stickfigureY + this.yOffset;
  }
  
  /**
   * Update any size-dependent properties after a resize
   */
  updateForResize() {
    // Recalculate attacker properties based on stickfigure
    this.xOffset = this.stickfigure.config.radius * 3;
    this.attackRange = this.stickfigure.config.radius * 15;
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
    const result = this.animator.startAttack();
    
    if (result) {
      // Emit attack start event with attacker info
      GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_START, {
        attacker: this,
        range: this.attackRange
      });
    }
    
    return result;
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
    const wasAttacking = this.isAttacking;
    this.isAttacking = this.animator.isAttacking;
    
    // Emit events on attack state changes
    if (!wasAttacking && this.isAttacking) {
      // Attack just started
      GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_START, {
        attacker: this,
        range: this.attackRange
      });
    } else if (wasAttacking && !this.isAttacking) {
      // Attack just ended
      GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_END, {
        attacker: this
      });
    }
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
      
      // Emit position update at key animation points
      if (attackProgress > 0 && attackProgress < 0.1) {
        GameEvents.emitCharacter(CHARACTER_EVENTS.POSITION_CHANGE, {
          character: 'attacker',
          x: this.x,
          y: this.y,
          state: 'attacking',
          progress: attackProgress
        });
      }
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
    
    // If attack just hit the peak, emit a hit event
    if (attackProgress > 0.49 && attackProgress < 0.51) {
      GameEvents.emitCharacter(CHARACTER_EVENTS.ATTACK_HIT, {
        attacker: this,
        x: this.x,
        y: this.y,
        hitbox: this.getAttackHitbox()
      });
    }
  }
  
  /**
   * Get the attack hitbox for collision detection
   * Improved with more realistic sword range and better positioning
   * @param {number} worldOffset - Current world offset
   * @returns {Object|null} Hitbox object or null if not attacking
   */
  getAttackHitbox(worldOffset) {
    if (!this.isAttacking) return null;
    
    // Only create hitbox during active attack phase
    const animProgress = this.animator.attackFrame / this.animator.attackDuration;
    if (animProgress < 0.2 || animProgress > 0.7) return null;
    
    // Calculate sword tip position for visual feedback
    const swordTipPosition = this.getSwordTipPosition();
    
    // Calculate base attack range
    const baseAttackRange = this.config.radius * 4;
    
    // Apply sensitivity multiplier to the attack range
    const attackRange = baseAttackRange * this.swordSensitivity;
    
    // Calculate sword angle based on attack progress
    const attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : 0;
    const swordAngle = Math.PI / 4 - (attackProgress * Math.PI / 2);
    
    // Create a hitbox scaled by sensitivity
    const hitboxWidth = attackRange;
    const hitboxHeight = this.config.radius * 2 * this.swordSensitivity;
    
    // Calculate hitbox center based on sword position
    const hitboxCenterX = this.x + (Math.cos(swordAngle) * this.config.radius * 3);
    const hitboxCenterY = this.y + (Math.sin(swordAngle) * this.config.radius * 3);
    
    return {
      x: hitboxCenterX,
      y: hitboxCenterY - (hitboxHeight / 2),
      width: hitboxWidth,
      height: hitboxHeight,
      worldOffset: worldOffset,
      strength: 1.0,
      sensitivity: this.swordSensitivity, // Include sensitivity for debugging
      swordTip: swordTipPosition
    };
  }  
  
  /**
   * Get the position of the sword tip for visual effects
   * @returns {Object} Position {x, y} of sword tip
   */
  getSwordTipPosition() {
    // Calculate based on animation frame
    const animProgress = this.animator.attackFrame / this.animator.attackDuration;
    const attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : (animProgress >= 0.7 ? 1 : 0);
    
    // Calculate sword angle based on attack progress
    const swordAngle = Math.PI / 4 - (attackProgress * Math.PI / 2);
    
    // Calculate sword length
    const swordLength = this.config.radius * 6;
    
    // Calculate sword tip position based on character position and sword angle
    const handsPosition = this.y + this.config.radius + (this.config.bodyLength * this.config.handsRatio);
    const armLength = this.config.handsLength * 1.2;
    
    // Calculate arm end position (where sword connects)
    const armEndX = this.x + Math.cos(swordAngle) * armLength;
    const armEndY = handsPosition + Math.sin(swordAngle) * armLength;
    
    // Calculate sword tip position
    const swordTipX = armEndX + Math.cos(swordAngle) * swordLength;
    const swordTipY = armEndY + Math.sin(swordAngle) * swordLength;
    
    return {
      x: swordTipX,
      y: swordTipY
    };
  }

  /**
   * Add this new method to create hit effects
   * @param {Object} hitPosition - Position {x, y} where hit occurred
   */
  createHitEffect(hitPosition) {
    // Use the particle system to create visual feedback
    if (this.particleSystem) {
      // Configure for sword hit effect
      this.particleSystem.configure({
        minSize: 2,
        maxSize: 6,
        minLife: 10,
        maxLife: 20,
        color: this.swordColor
      });
      
      // Create a burst of particles at hit location
      this.particleSystem.burst(
        hitPosition.x,
        hitPosition.y,
        15, // Number of particles
        {
          color: this.swordColor,
          minSize: 2,
          maxSize: 6
        }
      );
    }
    
    // Add glow effect at hit location
    if (this.glowEffect) {
      this.glowEffect.configure({
        color: `rgba(255, 16, 240, 0.7)`,
        radius: this.config.radius * 2,
        intensity: 0.8
      }).drawCircular(hitPosition.x, hitPosition.y);
    }
  }

  /**
   * Get cooldown percentage (for UI display)
   * @returns {number} Cooldown percentage (0-1)
   */
  getCooldownPercentage() {
    const cooldownPercentage = this.animator.getCooldownPercentage();
    
    // Emit cooldown update event
    GameEvents.emitCharacter(CHARACTER_EVENTS.COOLDOWN_UPDATE, {
      cooldownPercent: cooldownPercentage
    });
    
    return cooldownPercentage;
  }
}

export default Attacker;