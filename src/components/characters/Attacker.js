import Component from '../base/Component.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import AnimationUtils from '../../utils/AnimationUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * Attacker component - heroic helper that appears during attacks
 * @extends Component
 */
class Attacker extends Component {
  /**
   * Create a new Attacker component
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {Object} config.stickfigure - Reference to the main stickfigure
   * @param {number} config.sizeMultiplier - Size multiplier relative to stickfigure
   * @param {number} config.xOffset - X offset from stickfigure
   * @param {number} config.yOffset - Y offset from stickfigure
   * @param {number} config.attackDuration - Attack animation duration in frames
   * @param {number} config.maxCooldown - Cooldown time between attacks in frames
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the attacker
   */
  initialize() {
    const { config } = this;
    
    // Reference to the main character
    this.stickfigure = config.stickfigure;
    
    // Attack state
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.maxCooldown = config.maxCooldown || 120; // 2 seconds at 60fps
    this.attackRange = config.attackRange || 150; // Attack range in pixels
    this.attackDuration = config.attackDuration || 40; // Duration in frames
    this.currentAttackFrame = 0;
    
    // Size and position relative to stickfigure
    this.sizeMultiplier = config.sizeMultiplier || 1.5;
    this.xOffset = config.xOffset || (this.stickfigure.radius * 3);
    this.yOffset = config.yOffset || 0;
    
    // Appearance
    this.color = config.color || ColorPalette.attacker.main;
    this.swordColor = config.swordColor || ColorPalette.attacker.sword;
    this.glowColor = config.glowColor || ColorPalette.attacker.glow;
    
    // Features
    this.hasShield = config.hasShield !== undefined ? config.hasShield : true;
    this.hasCape = config.hasCape !== undefined ? config.hasCape : true;
    
    // Sword properties
    this.swordLength = config.swordLength || (this.stickfigure.radius * 2.5);
    this.swordWidth = config.swordWidth || 4;
    
    // Thickness
    this.thickness = config.thickness || (this.stickfigure.thickness + 1);
  }

  /**
   * Start an attack
   * @returns {boolean} True if attack started successfully
   */
  startAttack() {
    if (this.attackCooldown <= 0 && !this.isAttacking) {
      this.isAttacking = true;
      this.currentAttackFrame = 0;
      return true;
    }
    return false;
  }

  /**
   * Update attacker state
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    // Scale time values by deltaTime for framerate independence
    const timeScale = deltaTime / 16.67; // 16.67ms is ~60fps
    
    // Update cooldown timer
    if (this.attackCooldown > 0) {
      this.attackCooldown -= timeScale;
    }
    
    // Update attack animation
    if (this.isAttacking) {
      this.currentAttackFrame += timeScale;
      
      // End attack when animation is complete
      if (this.currentAttackFrame >= this.attackDuration) {
        this.isAttacking = false;
        this.attackCooldown = this.maxCooldown;
      }
    }
    
    // Call super to update any children
    super.update(deltaTime);
  }

  /**
   * Draw the attacker
   */
  draw() {
    if (!this.isAttacking) return;
    
    const { context, stickfigure } = this;
    
    // Calculate animation progress (0 to 1)
    const animProgress = this.currentAttackFrame / this.attackDuration;
    const appearProgress = animProgress < 0.3 ? animProgress / 0.3 : 1;
    const attackProgress = animProgress > 0.2 && animProgress < 0.7 ? 
                          (animProgress - 0.2) / 0.5 : 
                          (animProgress >= 0.7 ? 1 : 0);
    const disappearProgress = animProgress > 0.7 ? (animProgress - 0.7) / 0.3 : 0;
    
    // Calculate position with dynamic movement during attack
    let forwardStep = 0;
    if (attackProgress > 0) {
      // Move forward during attack and then back
      if (attackProgress < 0.5) {
        forwardStep = attackProgress * 2 * (stickfigure.radius * 2);
      } else {
        forwardStep = (1 - attackProgress) * 2 * (stickfigure.radius * 2);
      }
    }
    
    const x = stickfigure.x + this.xOffset + forwardStep;
    const y = stickfigure.y + this.yOffset;
    
    // Calculate scaled dimensions
    const radius = stickfigure.radius * this.sizeMultiplier * appearProgress * (1 - disappearProgress);
    const bodyLength = stickfigure.bodyLength * this.sizeMultiplier;
    const handsRatio = stickfigure.handsRatio;
    const handsLength = stickfigure.handsLength * this.sizeMultiplier;
    const legsRatio = stickfigure.legsRatio;
    const legLength = stickfigure.legLength * this.sizeMultiplier;
    
    // Save context state
    context.save();
    
    // Apply slight transparency for the whole attacker
    context.globalAlpha = appearProgress * (1 - disappearProgress);
    
    // Draw heroic parts
    this.drawGlow(x, y, radius, attackProgress);
    
    if (this.hasCape) {
      this.drawCape(x, y, radius, bodyLength, animProgress, attackProgress);
    }
    
    // Draw body parts
    this.drawHead(x, y, radius);
    this.drawBody(x, y, radius, bodyLength);
    this.drawLegs(x, y, radius, bodyLength, legsRatio, legLength);
    
    // Draw arms and equipment
    this.drawShieldArm(x, y, radius, bodyLength, handsRatio, handsLength, attackProgress);
    this.drawSwordArm(x, y, radius, bodyLength, handsRatio, handsLength, attackProgress);
    
    // Restore context state
    context.restore();
    
    // Call super to draw any children
    super.draw();
  }
  
  /**
   * Draw the hero's glow effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius
   * @param {number} attackProgress - Attack animation progress (0-1)
   */
  drawGlow(x, y, radius, attackProgress) {
    const { context, glowColor } = this;
    
    // Calculate heroic glow based on animation stage
    const glowRadius = radius * 1.5 * (attackProgress * 0.7 + 0.3);
    
    const gradient = DrawingUtils.createRadialGradient(
      context,
      x, y, radius * 0.5,
      x, y, glowRadius,
      [
        { offset: 0, color: glowColor },
        { offset: 1, color: 'rgba(58, 134, 255, 0)' }
      ]
    );
    
    DrawingUtils.circle(context, x, y, glowRadius, gradient);
  }
  
  /**
   * Draw the hero's cape
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius
   * @param {number} bodyLength - Body length
   * @param {number} animProgress - Overall animation progress (0-1)
   * @param {number} attackProgress - Attack animation progress (0-1)
   */
  drawCape(x, y, radius, bodyLength, animProgress, attackProgress) {
    const { context } = this;
    const capeColors = ColorPalette.attacker.cape;
    
    const capeWidth = radius * 2;
    const capeLength = bodyLength * 1.2;
    
    // Cape waves based on the attack animation
    const waveAmplitude = radius * 0.3 * (1 + attackProgress * 2);
    const waveFrequency = 3 + attackProgress * 2;
    
    context.beginPath();
    context.moveTo(x, y + radius * 0.5);
    
    // Draw a wavy cape
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const capeY = y + radius * 0.5 + t * capeLength;
      const waveOffset = Math.sin(t * waveFrequency * Math.PI + animProgress * 10) * waveAmplitude;
      const capeX = x - capeWidth / 2 + waveOffset;
      
      context.lineTo(capeX, capeY);
    }
    
    for (let i = 20; i >= 0; i--) {
      const t = i / 20;
      const capeY = y + radius * 0.5 + t * capeLength;
      const waveOffset = Math.sin(t * waveFrequency * Math.PI + animProgress * 10 + Math.PI) * waveAmplitude;
      const capeX = x + capeWidth / 2 + waveOffset;
      
      context.lineTo(capeX, capeY);
    }
    
    // Close the path back to the starting point
    context.lineTo(x, y + radius * 0.5);
    
    // Fill with a gradient
    const capeGradient = DrawingUtils.createLinearGradient(
      context,
      x, y + radius * 0.5,
      x, y + radius * 0.5 + capeLength,
      [
        { offset: 0, color: capeColors.top },
        { offset: 1, color: capeColors.bottom }
      ]
    );
    
    context.fillStyle = capeGradient;
    context.fill();
    context.closePath();
  }
  
  /**
   * Draw the hero's head
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius
   */
  drawHead(x, y, radius) {
    const { context, color, thickness } = this;
    DrawingUtils.circle(context, x, y, radius, null, color, thickness);
  }
  
  /**
   * Draw the hero's body
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius
   * @param {number} bodyLength - Body length
   */
  drawBody(x, y, radius, bodyLength) {
    const { context, color, thickness } = this;
    
    DrawingUtils.line(
      context,
      x, y + radius,
      x, y + radius + bodyLength,
      color,
      thickness
    );
  }
  
  /**
   * Draw the hero's legs
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius
   * @param {number} bodyLength - Body length
   * @param {number} legsRatio - Position ratio for legs
   * @param {number} legLength - Leg length
   */
  drawLegs(x, y, radius, bodyLength, legsRatio, legLength) {
    const { context, color, thickness } = this;
    
    // Calculate leg position
    const legsPosition = y + radius + (bodyLength * legsRatio);
    
    // Draw left leg
    DrawingUtils.line(
      context,
      x, legsPosition,
      x - legLength * 0.5, legsPosition + legLength,
      color,
      thickness
    );
    
    // Draw right leg
    DrawingUtils.line(
      context,
      x, legsPosition,
      x + legLength * 0.5, legsPosition + legLength,
      color,
      thickness
    );
  }
  
  /**
   * Draw the hero's shield arm
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius
   * @param {number} bodyLength - Body length
   * @param {number} handsRatio - Position ratio for hands
   * @param {number} handsLength - Hand length
   * @param {number} attackProgress - Attack animation progress (0-1)
   */
  drawShieldArm(x, y, radius, bodyLength, handsRatio, handsLength, attackProgress) {
    const { context, color, thickness, hasShield } = this;
    
    // Calculate hand position
    const handsPosition = y + radius + (bodyLength * handsRatio);
    
    // Calculate shield arm angle
    const shieldArmAngle = Math.PI * 0.6 - (attackProgress * Math.PI / 6);
    const leftArmLength = handsLength * 1.1;
    
    // Calculate arm end position
    const leftArmEndX = x - Math.cos(shieldArmAngle) * leftArmLength;
    const leftArmEndY = handsPosition + Math.sin(shieldArmAngle) * leftArmLength;
    
    // Draw left arm
    DrawingUtils.line(
      context,
      x, handsPosition,
      leftArmEndX, leftArmEndY,
      color,
      thickness
    );
    
    // Draw shield if enabled
    if (hasShield) {
      this.drawShield(leftArmEndX, leftArmEndY, radius, shieldArmAngle);
    }
  }
  
  /**
   * Draw the hero's shield
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius (for scaling)
   * @param {number} angle - Shield angle
   */
  drawShield(x, y, radius, angle) {
    const { context } = this;
    const shieldColors = ColorPalette.attacker.shield;
    
    const shieldSize = radius * 1.6;
    const shieldAngle = angle - Math.PI * 0.1;
    
    // Shield position
    const shieldX = x - Math.cos(shieldAngle) * (shieldSize * 0.2);
    const shieldY = y + Math.sin(shieldAngle) * (shieldSize * 0.2);
    
    // Draw shield backing
    context.beginPath();
    context.ellipse(
      shieldX, shieldY,
      shieldSize, shieldSize * 1.3,
      shieldAngle, 0, Math.PI * 2
    );
    context.fillStyle = shieldColors.back;
    context.fill();
    context.closePath();
    
    // Draw shield front with border
    context.beginPath();
    context.ellipse(
      shieldX, shieldY,
      shieldSize * 0.9, shieldSize * 1.2,
      shieldAngle, 0, Math.PI * 2
    );
    context.fillStyle = shieldColors.front;
    context.fill();
    context.strokeStyle = shieldColors.border;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    
    // Draw shield emblem (a heart)
    this.drawShieldEmblem(shieldX, shieldY, shieldSize, shieldAngle);
  }
  
  /**
   * Draw the shield emblem
   * @param {number} x - Shield center X
   * @param {number} y - Shield center Y
   * @param {number} shieldSize - Shield size
   * @param {number} angle - Shield angle
   */
  drawShieldEmblem(x, y, shieldSize, angle) {
    const { context, swordColor } = this;
    const emblumSize = shieldSize * 0.5;
    
    // Heart shape
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    
    context.beginPath();
    // Top left curve
    context.moveTo(0, emblumSize * 0.3);
    context.bezierCurveTo(
      -emblumSize * 0.5, -emblumSize * 0.3, 
      -emblumSize, emblumSize * 0.3, 
      0, emblumSize
    );
    
    // Top right curve
    context.bezierCurveTo(
      emblumSize, emblumSize * 0.3, 
      emblumSize * 0.5, -emblumSize * 0.3, 
      0, emblumSize * 0.3
    );
    
    context.fillStyle = swordColor;
    context.fill();
    context.closePath();
    
    context.restore();
  }
  
  /**
   * Draw the hero's sword arm
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Head radius
   * @param {number} bodyLength - Body length
   * @param {number} handsRatio - Position ratio for hands
   * @param {number} handsLength - Hand length
   * @param {number} attackProgress - Attack animation progress (0-1)
   */
  drawSwordArm(x, y, radius, bodyLength, handsRatio, handsLength, attackProgress) {
    const { context, color, thickness } = this;
    
    // Calculate hand position
    const handsPosition = y + radius + (bodyLength * handsRatio);
    
    // Calculate sword angles
    const swordAngle = Math.PI / 4 - (attackProgress * Math.PI / 2);
    const armLength = handsLength * 1.2;
    
    // Calculate arm end position
    const armEndX = x + Math.cos(swordAngle) * armLength;
    const armEndY = handsPosition + Math.sin(swordAngle) * armLength;
    
    // Draw right arm
    DrawingUtils.line(
      context,
      x, handsPosition,
      armEndX, armEndY,
      color,
      thickness
    );
    
    // Draw sword
    this.drawSword(armEndX, armEndY, swordAngle, attackProgress);
  }
  
  /**
   * Draw the hero's sword
   * @param {number} x - Sword start X
   * @param {number} y - Sword start Y
   * @param {number} angle - Sword angle
   * @param {number} attackProgress - Attack animation progress (0-1)
   */
  drawSword(x, y, angle, attackProgress) {
    const { context, swordColor, swordLength, swordWidth } = this;
    
    // Calculate sword end position
    const swordEndX = x + Math.cos(angle) * swordLength;
    const swordEndY = y + Math.sin(angle) * swordLength;
    
    // Draw sword blade
    DrawingUtils.line(
      context,
      x, y,
      swordEndX, swordEndY,
      swordColor,
      swordWidth
    );
    
    // Draw sword hilt (crossguard)
    this.drawSwordHilt(x, y, angle);
    
    // Draw sword glow effect during the attack phase
    if (attackProgress > 0) {
      this.drawSwordGlow(x, y, swordEndX, swordEndY, attackProgress);
    }
  }
  
  /**
   * Draw the sword's hilt
   * @param {number} x - Hilt center X
   * @param {number} y - Hilt center Y
   * @param {number} angle - Sword angle
   */
  drawSwordHilt(x, y, angle) {
    const { context, swordLength, swordWidth } = this;
    
    const crossguardAngle = angle + Math.PI / 2;
    const crossguardLength = swordLength * 0.15;
    
    DrawingUtils.line(
      context,
      x + Math.cos(crossguardAngle) * crossguardLength,
      y + Math.sin(crossguardAngle) * crossguardLength,
      x - Math.cos(crossguardAngle) * crossguardLength,
      y - Math.sin(crossguardAngle) * crossguardLength,
      "#FFC300", // Gold color for the hilt
      swordWidth * 0.8
    );
  }
  
  /**
   * Draw the sword's glow effect
   * @param {number} startX - Sword start X
   * @param {number} startY - Sword start Y
   * @param {number} endX - Sword end X
   * @param {number} endY - Sword end Y
   * @param {number} attackProgress - Attack animation progress (0-1)
   */
  drawSwordGlow(startX, startY, endX, endY, attackProgress) {
    const { context, swordColor, swordWidth } = this;
    
    const swordGlowOpacity = attackProgress * 0.7;
    
    // Draw wide glow around sword
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.strokeStyle = `rgba(255, 16, 240, ${swordGlowOpacity})`;
    context.lineWidth = swordWidth * 3;
    context.lineCap = "round";
    context.stroke();
    context.closePath();
    
    // Add additional glow particles for dramatic effect
    if (attackProgress > 0.5) {
      this.drawSwordParticles(startX, startY, endX, endY, attackProgress);
    }
  }
  
  /**
   * Draw particle effects for the sword
   * @param {number} startX - Sword start X
   * @param {number} startY - Sword start Y
   * @param {number} endX - Sword end X
   * @param {number} endY - Sword end Y
   * @param {number} progress - Effect progress (0-1)
   */
  drawSwordParticles(startX, startY, endX, endY, progress) {
    const { context, swordWidth } = this;
    
    const particleCount = 5;
    const particleMaxRadius = swordWidth * 2;
    
    for (let i = 0; i < particleCount; i++) {
      // Position along the sword
      const t = i / particleCount;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      
      // Random offset
      const offsetAngle = Math.random() * Math.PI * 2;
      const offsetDistance = Math.random() * swordWidth * 4 * progress;
      const particleX = x + Math.cos(offsetAngle) * offsetDistance;
      const particleY = y + Math.sin(offsetAngle) * offsetDistance;
      
      // Random size
      const radius = Math.random() * particleMaxRadius * progress;
      
      // Draw particle
      DrawingUtils.circle(
        context, 
        particleX, 
        particleY, 
        radius, 
        `rgba(255, 16, 240, ${Math.random() * 0.7})`
      );
    }
  }
  
  /**
   * Get the attack hitbox for collision detection
   * @returns {Object|null} Hitbox object or null if not attacking
   */
  getAttackHitbox() {
    // No hitbox if not in the active attack phase
    if (!this.isAttacking || 
        this.currentAttackFrame < this.attackDuration * 0.2 || 
        this.currentAttackFrame > this.attackDuration * 0.7) {
      return null;
    }
    
    const x = this.stickfigure.x;
    const range = this.attackRange;
    
    return {
      x: x,
      y: this.stickfigure.y,
      width: range,
      height: this.stickfigure.bodyLength * 2
    };
  }
  
  /**
   * Get cooldown percentage (for UI display)
   * @returns {number} Cooldown percentage (0-1)
   */
  getCooldownPercentage() {
    if (this.isAttacking) return 1.0;
    return this.attackCooldown / this.maxCooldown;
  }
}

export default Attacker;