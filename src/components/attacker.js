// Class representing the heroic attacker that appears when the attack button is pressed
class Attacker {
    constructor(context, stickfigure) {
      this.context = context;
      this.stickfigure = stickfigure;
      this.isAttacking = false;
      this.attackCooldown = 0;
      this.maxCooldown = 120; // 2 seconds at 60fps
      this.attackRange = 150; // Attack range in pixels
      this.attackDuration = 40; // How long the attack animation plays
      this.currentAttackFrame = 0;
      
      // Size relative to the main stickfigure
      this.sizeMultiplier = 1.5;
      
      // Colors for the heroic attacker
      this.color = "#3A86FF"; // Strong blue for a heroic look
      this.swordColor = "#FF10F0"; // Bright pink/magenta for a flashy sword (matching the main stick figure's color theme)
      this.glowColor = "rgba(58, 134, 255, 0.3)"; // Semi-transparent version of main color
      
      // Heroic features
      this.hasShield = true; // Add a shield for extra protection
      this.hasCape = true;   // Add a cape for a heroic look
      
      // Sword properties
      this.swordLength = stickfigure.radius * 2.5;
      this.swordWidth = 4;
      
      // Position offset (will appear in front of the main character)
      this.xOffset = stickfigure.radius * 3; // Positioned to the right of the main character
      this.yOffset = 0;
    }
    
    // Start the attack if not on cooldown
    startAttack() {
      if (this.attackCooldown <= 0 && !this.isAttacking) {
        this.isAttacking = true;
        this.currentAttackFrame = 0;
        return true;
      }
      return false;
    }
    
    // Update the attacker state
    update() {
      // Update cooldown timer
      if (this.attackCooldown > 0) {
        this.attackCooldown--;
      }
      
      // Update attack animation
      if (this.isAttacking) {
        this.currentAttackFrame++;
        
        // End attack when animation is complete
        if (this.currentAttackFrame >= this.attackDuration) {
          this.isAttacking = false;
          this.attackCooldown = this.maxCooldown;
        }
      }
    }
    
    // Draw the attacker
    draw() {
      if (!this.isAttacking) return;
      
      // Calculate animation progress (0 to 1)
      const animProgress = this.currentAttackFrame / this.attackDuration;
      const appearProgress = animProgress < 0.3 ? animProgress / 0.3 : 1;
      const attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : (animProgress >= 0.7 ? 1 : 0);
      const disappearProgress = animProgress > 0.7 ? (animProgress - 0.7) / 0.3 : 0;
      
      // Calculate position with dynamic movement during attack
      let forwardStep = 0;
      if (attackProgress > 0) {
        // Move forward during attack and then back
        if (attackProgress < 0.5) {
          forwardStep = attackProgress * 2 * (this.stickfigure.radius * 2);
        } else {
          forwardStep = (1 - attackProgress) * 2 * (this.stickfigure.radius * 2);
        }
      }
      
      const x = this.stickfigure.x + this.xOffset + forwardStep;
      const y = this.stickfigure.y + this.yOffset;
      
      // Calculate scaled dimensions
      const radius = this.stickfigure.radius * this.sizeMultiplier * appearProgress * (1 - disappearProgress);
      const bodyLength = this.stickfigure.bodyLength * this.sizeMultiplier;
      const handsRatio = this.stickfigure.handsRatio;
      const handsLength = this.stickfigure.handsLength * this.sizeMultiplier;
      const legsRatio = this.stickfigure.legsRatio;
      const legLength = this.stickfigure.legLength * this.sizeMultiplier;
      
      // Calculate heroic glow based on animation stage
      const glowRadius = radius * 1.5 * (attackProgress * 0.7 + 0.3);
      
      // Save context state
      this.context.save();
      
      // Apply slight transparency for the whole attacker
      this.context.globalAlpha = appearProgress * (1 - disappearProgress);
      
      // Draw heroic glow
      const gradient = this.context.createRadialGradient(
        x, y, radius * 0.5,
        x, y, glowRadius
      );
      gradient.addColorStop(0, this.glowColor);
      gradient.addColorStop(1, "rgba(58, 134, 255, 0)");
      
      this.context.beginPath();
      this.context.arc(x, y, glowRadius, 0, Math.PI * 2);
      this.context.fillStyle = gradient;
      this.context.fill();
      this.context.closePath();
      
      // Draw cape if enabled
      if (this.hasCape) {
        const capeWidth = radius * 2;
        const capeLength = bodyLength * 1.2;
        
        // Cape waves based on the attack animation
        const waveAmplitude = radius * 0.3 * (1 + attackProgress * 2);
        const waveFrequency = 3 + attackProgress * 2;
        
        this.context.beginPath();
        this.context.moveTo(x, y + radius * 0.5);
        
        // Draw a wavy cape
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const capeY = y + radius * 0.5 + t * capeLength;
          const waveOffset = Math.sin(t * waveFrequency * Math.PI + animProgress * 10) * waveAmplitude;
          const capeX = x - capeWidth / 2 + waveOffset;
          
          this.context.lineTo(capeX, capeY);
        }
        
        for (let i = 20; i >= 0; i--) {
          const t = i / 20;
          const capeY = y + radius * 0.5 + t * capeLength;
          const waveOffset = Math.sin(t * waveFrequency * Math.PI + animProgress * 10 + Math.PI) * waveAmplitude;
          const capeX = x + capeWidth / 2 + waveOffset;
          
          this.context.lineTo(capeX, capeY);
        }
        
        // Close the path back to the starting point
        this.context.lineTo(x, y + radius * 0.5);
        
        // Fill with a gradient
        const capeGradient = this.context.createLinearGradient(
          x, y + radius * 0.5,
          x, y + radius * 0.5 + capeLength
        );
        capeGradient.addColorStop(0, "#3A86FF"); // Match the hero color at the top
        capeGradient.addColorStop(1, "#1D43FF"); // Darker blue at the bottom
        
        this.context.fillStyle = capeGradient;
        this.context.fill();
        this.context.closePath();
      }
      
      // Draw head
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, Math.PI * 2);
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.stickfigure.tickness + 1;
      this.context.stroke();
      this.context.closePath();
      
      // Draw body
      this.context.beginPath();
      this.context.moveTo(x, y + radius);
      this.context.lineTo(x, y + radius + bodyLength);
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.stickfigure.tickness + 1;
      this.context.stroke();
      this.context.closePath();
      
      // Calculate positions for hands and legs
      const handsPosition = y + radius + (bodyLength * handsRatio);
      const legsPosition = y + radius + (bodyLength * legsRatio);
      
      // Draw legs
      // Left leg
      this.context.beginPath();
      this.context.moveTo(x, legsPosition);
      this.context.lineTo(x - legLength * 0.5, legsPosition + legLength);
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.stickfigure.tickness + 1;
      this.context.stroke();
      this.context.closePath();
      
      // Right leg
      this.context.beginPath();
      this.context.moveTo(x, legsPosition);
      this.context.lineTo(x + legLength * 0.5, legsPosition + legLength);
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.stickfigure.tickness + 1;
      this.context.stroke();
      this.context.closePath();
      
      // Draw left arm with shield
      const shieldArmAngle = Math.PI * 0.6 - (attackProgress * Math.PI / 6);
      const leftArmLength = handsLength * 1.1;
      
      const leftArmEndX = x - Math.cos(shieldArmAngle) * leftArmLength;
      const leftArmEndY = handsPosition + Math.sin(shieldArmAngle) * leftArmLength;
      
      // Left arm
      this.context.beginPath();
      this.context.moveTo(x, handsPosition);
      this.context.lineTo(leftArmEndX, leftArmEndY);
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.stickfigure.tickness + 1;
      this.context.stroke();
      this.context.closePath();
      
      // Draw shield if enabled
      if (this.hasShield) {
        const shieldSize = radius * 1.6;
        const shieldAngle = shieldArmAngle - Math.PI * 0.1;
        
        // Shield position
        const shieldX = leftArmEndX - Math.cos(shieldAngle) * (shieldSize * 0.2);
        const shieldY = leftArmEndY + Math.sin(shieldAngle) * (shieldSize * 0.2);
        
        // Draw shield backing
        this.context.beginPath();
        this.context.ellipse(
          shieldX, shieldY,
          shieldSize, shieldSize * 1.3,
          shieldAngle, 0, Math.PI * 2
        );
        this.context.fillStyle = "#2C5282"; // Darker blue for shield back
        this.context.fill();
        this.context.closePath();
        
        // Draw shield front with border
        this.context.beginPath();
        this.context.ellipse(
          shieldX, shieldY,
          shieldSize * 0.9, shieldSize * 1.2,
          shieldAngle, 0, Math.PI * 2
        );
        this.context.fillStyle = "#63B3ED"; // Lighter blue for shield front
        this.context.fill();
        this.context.strokeStyle = "#1A365D"; // Very dark blue border
        this.context.lineWidth = 2;
        this.context.stroke();
        this.context.closePath();
        
        // Draw shield emblem (a heart for your girlfriend)
        const emblumX = shieldX;
        const emblumY = shieldY;
        const emblumSize = shieldSize * 0.5;
        
        // Heart shape
        this.context.save();
        this.context.translate(emblumX, emblumY);
        this.context.rotate(shieldAngle);
        
        this.context.beginPath();
        // Top left curve
        this.context.moveTo(0, emblumSize * 0.3);
        this.context.bezierCurveTo(
          -emblumSize * 0.5, -emblumSize * 0.3, 
          -emblumSize, emblumSize * 0.3, 
          0, emblumSize
        );
        
        // Top right curve
        this.context.bezierCurveTo(
          emblumSize, emblumSize * 0.3, 
          emblumSize * 0.5, -emblumSize * 0.3, 
          0, emblumSize * 0.3
        );
        
        this.context.fillStyle = "#FF10F0"; // Match the sword color
        this.context.fill();
        this.context.closePath();
        
        this.context.restore();
      }
      
      // Draw right arm with sword (attack position based on animation)
      const swordAngle = Math.PI / 4 - (attackProgress * Math.PI / 2);
      const armLength = handsLength * 1.2;
      
      const armEndX = x + Math.cos(swordAngle) * armLength;
      const armEndY = handsPosition + Math.sin(swordAngle) * armLength;
      
      // Draw right arm
      this.context.beginPath();
      this.context.moveTo(x, handsPosition);
      this.context.lineTo(armEndX, armEndY);
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.stickfigure.tickness + 1;
      this.context.stroke();
      this.context.closePath();
      
      // Draw sword
      const swordStartX = armEndX;
      const swordStartY = armEndY;
      const swordEndX = swordStartX + Math.cos(swordAngle) * this.swordLength;
      const swordEndY = swordStartY + Math.sin(swordAngle) * this.swordLength;
      
      // Sword blade
      this.context.beginPath();
      this.context.moveTo(swordStartX, swordStartY);
      this.context.lineTo(swordEndX, swordEndY);
      this.context.strokeStyle = this.swordColor;
      this.context.lineWidth = this.swordWidth;
      this.context.stroke();
      this.context.closePath();
      
      // Sword hilt (crossguard)
      const crossguardAngle = swordAngle + Math.PI / 2;
      const crossguardLength = this.swordLength * 0.15;
      
      this.context.beginPath();
      this.context.moveTo(
        swordStartX + Math.cos(crossguardAngle) * crossguardLength,
        swordStartY + Math.sin(crossguardAngle) * crossguardLength
      );
      this.context.lineTo(
        swordStartX - Math.cos(crossguardAngle) * crossguardLength,
        swordStartY - Math.sin(crossguardAngle) * crossguardLength
      );
      this.context.strokeStyle = "#FFC300"; // Gold color for the hilt
      this.context.lineWidth = this.swordWidth * 0.8;
      this.context.stroke();
      this.context.closePath();
      
      // Draw sword glow effect during the attack phase
      if (attackProgress > 0) {
        const swordGlowOpacity = attackProgress * 0.7;
        this.context.beginPath();
        this.context.moveTo(swordStartX, swordStartY);
        this.context.lineTo(swordEndX, swordEndY);
        this.context.strokeStyle = `rgba(255, 16, 240, ${swordGlowOpacity})`;
        this.context.lineWidth = this.swordWidth * 3;
        this.context.lineCap = "round";
        this.context.stroke();
        this.context.closePath();
        
        // Add additional glow particles for dramatic effect
        if (attackProgress > 0.5) {
          this.drawSwordParticles(swordStartX, swordStartY, swordEndX, swordEndY, attackProgress);
        }
      }
      
      // Restore context state
      this.context.restore();
    }
    
    // Draw particle effects for the sword during attack
    drawSwordParticles(startX, startY, endX, endY, progress) {
      const particleCount = 5;
      const particleMaxRadius = this.swordWidth * 2;
      
      for (let i = 0; i < particleCount; i++) {
        // Position along the sword
        const t = i / particleCount;
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t;
        
        // Random offset
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDistance = Math.random() * this.swordWidth * 4 * progress;
        const particleX = x + Math.cos(offsetAngle) * offsetDistance;
        const particleY = y + Math.sin(offsetAngle) * offsetDistance;
        
        // Random size
        const radius = Math.random() * particleMaxRadius * progress;
        
        // Draw particle
        this.context.beginPath();
        this.context.arc(particleX, particleY, radius, 0, Math.PI * 2);
        this.context.fillStyle = `rgba(255, 16, 240, ${Math.random() * 0.7})`;
        this.context.fill();
        this.context.closePath();
      }
    }
    
    // Get the attack hitbox for collision detection (for future enemy implementation)
    getAttackHitbox() {
      if (!this.isAttacking || this.currentAttackFrame < this.attackDuration * 0.2 || this.currentAttackFrame > this.attackDuration * 0.7) {
        return null; // No hitbox if not in the active attack phase
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
    
    // Get cooldown percentage (for UI display)
    getCooldownPercentage() {
      if (this.isAttacking) return 1.0;
      return this.attackCooldown / this.maxCooldown;
    }
  }
  
  export default Attacker;