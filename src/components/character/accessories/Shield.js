/**
 * Shield.js - A protective shield accessory for the Attacker
 * Draws a shield with heart emblem on the left arm
 */
class Shield {
    /**
     * Create a new shield accessory
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {Character} character - The character holding the shield
     */
    constructor(context, character) {
      this.context = context;
      this.character = character;
      
      // Shield properties
      this.backColor = "#2C5282"; // Darker blue for shield back
      this.frontColor = "#63B3ED"; // Lighter blue for shield front
      this.borderColor = "#1A365D"; // Very dark blue border
      this.emblemColor = "#FF10F0"; // Match the sword color (pink heart)
    }
    
    /**
     * Draw the shield on the left arm
     */
    draw() {
      // Get character properties and check left hand position
      const { x, y, config, leftHand } = this.character;
      
      if (!leftHand) return; // Don't draw if left hand doesn't exist
      
      // Get animation progress from attacker if available
      let attackProgress = 0;
      if (this.character.animator && this.character.animator.isAttacking) {
        const animProgress = this.character.animator.attackFrame / this.character.animator.attackDuration;
        attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : (animProgress >= 0.7 ? 1 : 0);
      }
      
      // Calculate left arm position
      const handsPosition = y + config.radius + (config.bodyLength * config.handsRatio);
      
      // Calculate shield arm angle based on attack state
      const shieldArmAngle = Math.PI * 0.6 - (attackProgress * Math.PI / 6);
      const leftArmLength = config.handsLength * 1.1;
      
      // Calculate left arm end position (where shield connects)
      const leftArmEndX = x - Math.cos(shieldArmAngle) * leftArmLength;
      const leftArmEndY = handsPosition + Math.sin(shieldArmAngle) * leftArmLength;
      
      // Calculate shield properties
      const shieldSize = config.radius * 1.6;
      const shieldAngle = shieldArmAngle - Math.PI * 0.1;
      
      // Calculate shield position relative to arm
      const shieldX = leftArmEndX - Math.cos(shieldAngle) * (shieldSize * 0.2);
      const shieldY = leftArmEndY + Math.sin(shieldAngle) * (shieldSize * 0.2);
      
      // Save context state
      this.context.save();
      
      // Draw shield backing
      this.context.beginPath();
      this.context.ellipse(
        shieldX, shieldY,
        shieldSize, shieldSize * 1.3,
        shieldAngle, 0, Math.PI * 2
      );
      this.context.fillStyle = this.backColor;
      this.context.fill();
      this.context.closePath();
      
      // Draw shield front with border
      this.context.beginPath();
      this.context.ellipse(
        shieldX, shieldY,
        shieldSize * 0.9, shieldSize * 1.2,
        shieldAngle, 0, Math.PI * 2
      );
      this.context.fillStyle = this.frontColor;
      this.context.fill();
      this.context.strokeStyle = this.borderColor;
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.closePath();
      
      // Draw shield emblem (a heart for the girlfriend)
      this.drawHeartEmblem(shieldX, shieldY, shieldSize * 0.5, shieldAngle);
      
      // Restore context state
      this.context.restore();
    }
    
    /**
     * Draw a heart emblem on the shield
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} size - Emblem size
     * @param {number} angle - Shield angle
     */
    drawHeartEmblem(x, y, size, angle) {
      // Save context state
      this.context.save();
      
      // Translate and rotate to draw heart aligned with shield
      this.context.translate(x, y);
      this.context.rotate(angle);
      
      // Draw heart shape
      this.context.beginPath();
      
      // Top left curve
      this.context.moveTo(0, size * 0.3);
      this.context.bezierCurveTo(
        -size * 0.5, -size * 0.3, 
        -size, size * 0.3, 
        0, size
      );
      
      // Top right curve
      this.context.bezierCurveTo(
        size, size * 0.3, 
        size * 0.5, -size * 0.3, 
        0, size * 0.3
      );
      
      this.context.fillStyle = this.emblemColor;
      this.context.fill();
      this.context.closePath();
      
      // Restore context state
      this.context.restore();
    }
    
    /**
     * Update position if character moves
     * No explicit update needed as we calculate position based on character in draw()
     */
    updatePosition() {
      // Position is calculated dynamically in draw method
    }
    
    /**
     * Configure shield properties
     * @param {Object} config - Configuration object
     */
    configure(config = {}) {
      if (config.backColor !== undefined) this.backColor = config.backColor;
      if (config.frontColor !== undefined) this.frontColor = config.frontColor;
      if (config.borderColor !== undefined) this.borderColor = config.borderColor;
      if (config.emblemColor !== undefined) this.emblemColor = config.emblemColor;
    }
  }
  
  export default Shield;