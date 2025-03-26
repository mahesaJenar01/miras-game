/**
 * Sword.js - A weapon accessory for the Attacker
 * Draws a sword with magical effects on the right arm
 */
import ParticleSystem from '../effects/ParticleSystem.js';
import GlowEffect from '../effects/GlowEffect.js';

class Sword {
  /**
   * Create a new sword accessory
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Character} character - The character holding the sword
   */
  constructor(context, character) {
    this.context = context;
    this.character = character;
    
    // Sword properties
    this.swordColor = "#FF10F0"; // Bright pink/magenta for sword
    this.hiltColor = "#FFC300"; // Gold color for the hilt
    this.swordWidth = 4;
    this.swordLength = character.config.radius * 2.5;
    
    // Effects engines
    this.glowEffect = new GlowEffect(context);
    this.particleSystem = new ParticleSystem(context);
    this.particleSystem.configure({
      minSize: 1,
      maxSize: 4,
      minLife: 5,
      maxLife: 15,
      color: this.swordColor
    });
  }
  
  /**
   * Draw the sword on the right arm
   */
  draw() {
    // Get character properties
    const { x, y, config, rightHand } = this.character;
    
    if (!rightHand) return; // Don't draw if right hand doesn't exist
    
    // Get animation progress from attacker if available
    let attackProgress = 0;
    let isAttacking = false;
    
    if (this.character.animator && this.character.animator.isAttacking) {
      isAttacking = true;
      const animProgress = this.character.animator.attackFrame / this.character.animator.attackDuration;
      attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : (animProgress >= 0.7 ? 1 : 0);
    }
    
    // Calculate hand position
    const handsPosition = y + config.radius + (config.bodyLength * config.handsRatio);
    
    // Calculate sword angle based on attack progress
    const swordAngle = Math.PI / 4 - (attackProgress * Math.PI / 2);
    const armLength = config.handsLength * 1.2;
    
    // Calculate arm end position (where sword connects)
    const armEndX = x + Math.cos(swordAngle) * armLength;
    const armEndY = handsPosition + Math.sin(swordAngle) * armLength;
    
    // Calculate sword end position
    const swordEndX = armEndX + Math.cos(swordAngle) * this.swordLength;
    const swordEndY = armEndY + Math.sin(swordAngle) * this.swordLength;
    
    // Save context state
    this.context.save();
    
    // Draw sword blade
    this.context.beginPath();
    this.context.moveTo(armEndX, armEndY);
    this.context.lineTo(swordEndX, swordEndY);
    this.context.strokeStyle = this.swordColor;
    this.context.lineWidth = this.swordWidth;
    this.context.stroke();
    this.context.closePath();
    
    // Draw sword hilt (crossguard)
    this.drawSwordHilt(armEndX, armEndY, swordAngle);
    
    // Draw sword glow and particles if attacking
    if (isAttacking && attackProgress > 0) {
      this.drawSwordEffects(armEndX, armEndY, swordEndX, swordEndY, attackProgress);
    }
    
    // Restore context state
    this.context.restore();
    
    // Update particle system
    this.particleSystem.update();
    this.particleSystem.draw();
  }
  
  /**
   * Draw the sword hilt
   * @param {number} x - Hilt X position
   * @param {number} y - Hilt Y position
   * @param {number} angle - Sword angle
   */
  drawSwordHilt(x, y, angle) {
    // Calculate crossguard angle (perpendicular to sword)
    const crossguardAngle = angle + Math.PI / 2;
    const crossguardLength = this.swordLength * 0.15;
    
    // Draw crossguard
    this.context.beginPath();
    this.context.moveTo(
      x + Math.cos(crossguardAngle) * crossguardLength,
      y + Math.sin(crossguardAngle) * crossguardLength
    );
    this.context.lineTo(
      x - Math.cos(crossguardAngle) * crossguardLength,
      y - Math.sin(crossguardAngle) * crossguardLength
    );
    this.context.strokeStyle = this.hiltColor;
    this.context.lineWidth = this.swordWidth * 0.8;
    this.context.stroke();
    this.context.closePath();
  }
  
  /**
   * Draw sword glow and particle effects
   * @param {number} startX - Sword start X position
   * @param {number} startY - Sword start Y position
   * @param {number} endX - Sword end X position
   * @param {number} endY - Sword end Y position
   * @param {number} attackProgress - Attack animation progress (0-1)
   */
  drawSwordEffects(startX, startY, endX, endY, attackProgress) {
    // Draw sword glow effect
    const swordGlowOpacity = attackProgress * 0.7;
    
    this.glowEffect.configure({
      color: `rgba(255, 16, 240, ${swordGlowOpacity})`,
      intensity: attackProgress
    }).drawSwing(startX, startY, endX, endY, this.swordWidth * 3);
    
    // Add additional glow particles for dramatic effect
    if (attackProgress > 0.5) {
      this.drawSwordParticles(startX, startY, endX, endY, attackProgress);
    }
  }
  
  /**
   * Draw particle effects for the sword during attack
   * @param {number} startX - Sword start X position
   * @param {number} startY - Sword start Y position
   * @param {number} endX - Sword end X position
   * @param {number} endY - Sword end Y position
   * @param {number} progress - Attack progress (0-1)
   */
  drawSwordParticles(startX, startY, endX, endY, progress) {
    // Generate particles along the sword
    this.particleSystem.trail(startX, startY, endX, endY, 5, {
      minSize: progress * 2,
      maxSize: progress * 4,
      color: `rgba(255, 16, 240, ${progress * 0.7})`
    });
  }
  
  /**
   * Update position if character moves
   * No explicit update needed as we calculate position based on character in draw()
   */
  updatePosition() {
    // Position is calculated dynamically in draw method
  }
  
  /**
   * Configure sword properties
   * @param {Object} config - Configuration object
   */
  configure(config = {}) {
    if (config.swordColor !== undefined) this.swordColor = config.swordColor;
    if (config.hiltColor !== undefined) this.hiltColor = config.hiltColor;
    if (config.swordWidth !== undefined) this.swordWidth = config.swordWidth;
    if (config.swordLength !== undefined) this.swordLength = config.swordLength;
  }
}

export default Sword;