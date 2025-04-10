/**
 * Tiger.js - Implementation of tiger enemy type
 * Runs along the ground with occasional pouncing animation
 */
import BaseEnemy from '../BaseEnemy.js';

class Tiger extends BaseEnemy {
  /**
   * Create a new tiger enemy
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {number} x - Initial X position in world coordinates
   * @param {number} y - Initial Y position
   * @param {Object} config - Configuration object
   */
  constructor(context, canvas, x, y, config = {}) {
    // Tiger-specific defaults
    const tigerConfig = {
      width: 60,
      height: 35,
      speed: 2.5,
      color: '#FF8C00', // Orange
      health: 60,
      damage: 20,
      maxFrames: 4,
      ...config
    };
    
    super(context, canvas, x, y, tigerConfig);
    
    // Override base type
    this.type = 'tiger';
    
    // Tiger-specific properties
    this.legPhase = 0;
    this.legSpeed = 0.2; // Speed of leg movement
    this.isPouncing = false;
    this.pounceTimer = 0;
    this.pounceInterval = 180; // Frames between pounces (3 seconds at 60fps)
    this.pounceHeight = 30; // Maximum height of pounce
    this.pounceProgress = 0; // 0 to 1 for pounce animation
    this.pounceDuration = 30; // Frames for pounce animation
    
    // Initialize with random pounce timer
    this.pounceTimer = Math.floor(Math.random() * this.pounceInterval);
    
    // Stripe properties
    this.stripes = [];
    this.generateStripes();
  }
  
  /**
   * Generate random tiger stripes
   */
  generateStripes() {
    // Number of stripes based on tiger width
    const stripeCount = Math.floor(this.width / 10);
    
    for (let i = 0; i < stripeCount; i++) {
      // Random position and size for each stripe
      this.stripes.push({
        x: this.width * (0.2 + (i * 0.6) / stripeCount), // Distribute along body
        width: 3 + Math.random() * 3,
        height: this.height * (0.7 + Math.random() * 0.3),
        angle: -0.2 + Math.random() * 0.4 // Slight random angle
      });
    }
  }
  
  /**
   * Update tiger movement
   * Overrides base class to add running and pouncing
   */
  updateMovement() {
    // Update leg animation phase
    this.legPhase += this.legSpeed;
    
    // Handle pouncing
    if (this.isPouncing) {
      // Update pounce progress
      this.pounceProgress += 1 / this.pounceDuration;
      
      if (this.pounceProgress >= 1) {
        // End of pounce
        this.isPouncing = false;
        this.pounceProgress = 0;
      }
      
      // Calculate pounce height using sine curve for smooth up and down
      const pounceY = Math.sin(this.pounceProgress * Math.PI) * this.pounceHeight;
      this.yOffset = -pounceY; // Negative because up is decreasing Y
      
      // Move faster during pounce
      this.x += this.speed * 1.5 * this.direction;
    } else {
      // Regular movement
      this.x += this.speed * this.direction;
      
      // Bobbing up and down slightly while running
      this.yOffset = Math.sin(this.legPhase * 2) * 3;
      
      // Update pounce timer
      this.pounceTimer++;
      
      // Start a new pounce
      if (this.pounceTimer >= this.pounceInterval) {
        this.isPouncing = true;
        this.pounceProgress = 0;
        this.pounceTimer = 0;
      }
    }
  }
  
  /**
   * Draw the tiger
   * Overrides base class with tiger-specific rendering
   * @param {number} worldOffset - Current world offset for parallax
   */
  draw(worldOffset) {
    // Only draw if on screen
    if (!this.isOnScreen) return;
    
    // Calculate screen position
    const screenX = this.x - worldOffset;
    const screenY = this.y + this.yOffset;
    
    // Save context state
    this.context.save();
    
    // Draw tiger body
    this.context.beginPath();
    this.context.fillStyle = this.color;
    
    // Use rounded rectangle for body
    this.roundRect(
      this.context,
      screenX,
      screenY,
      this.width,
      this.height,
      10
    );
    
    this.context.fill();
    this.context.closePath();
    
    // Draw tiger stripes
    this.context.fillStyle = '#000000';
    this.stripes.forEach(stripe => {
      this.context.save();
      
      // Position at stripe center for rotation
      this.context.translate(screenX + stripe.x, screenY + this.height/2);
      this.context.rotate(stripe.angle);
      
      // Draw stripe
      this.context.fillRect(-stripe.width/2, -stripe.height/2, stripe.width, stripe.height);
      
      this.context.restore();
    });
    
    // Draw head
    const headWidth = this.width * 0.3;
    const headHeight = this.height * 1.1;
    const headX = screenX - headWidth * 0.7;
    const headY = screenY - headHeight * 0.1;
    
    this.context.beginPath();
    this.context.fillStyle = this.color;
    
    // Use rounded rectangle for head
    this.roundRect(
      this.context,
      headX,
      headY,
      headWidth,
      headHeight,
      10
    );
    
    this.context.fill();
    this.context.closePath();
    
    // Draw ears
    const earSize = headWidth * 0.5;
    
    // Left ear
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.moveTo(headX, headY);
    this.context.lineTo(headX - earSize * 0.5, headY - earSize);
    this.context.lineTo(headX + earSize * 0.5, headY - earSize * 0.5);
    this.context.closePath();
    this.context.fill();
    
    // Right ear
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.moveTo(headX + headWidth, headY);
    this.context.lineTo(headX + headWidth + earSize * 0.5, headY - earSize);
    this.context.lineTo(headX + headWidth - earSize * 0.5, headY - earSize * 0.5);
    this.context.closePath();
    this.context.fill();
    
    // Draw eyes
    const eyeSize = headWidth * 0.15;
    const eyeY = headY + headHeight * 0.25;
    
    // Left eye
    this.context.beginPath();
    this.context.fillStyle = 'black';
    this.context.arc(
      headX + headWidth * 0.3,
      eyeY,
      eyeSize,
      0,
      Math.PI * 2
    );
    this.context.fill();
    this.context.closePath();
    
    // Right eye
    this.context.beginPath();
    this.context.fillStyle = 'black';
    this.context.arc(
      headX + headWidth * 0.7,
      eyeY,
      eyeSize,
      0,
      Math.PI * 2
    );
    this.context.fill();
    this.context.closePath();
    
    // Draw legs with animation
    const legWidth = 8;
    const legHeight = this.height * 0.6;
    const legY = screenY + this.height;
    
    // Calculate leg positions based on phase
    const frontLegX = screenX + this.width * 0.2;
    const backLegX = screenX + this.width * 0.8;
    
    // Front legs
    const frontLegOffset = Math.sin(this.legPhase) * 10;
    
    // Front left leg
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.fillRect(
      frontLegX - frontLegOffset - legWidth/2,
      legY,
      legWidth,
      legHeight + frontLegOffset * 0.5
    );
    this.context.closePath();
    
    // Front right leg
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.fillRect(
      frontLegX + frontLegOffset - legWidth/2,
      legY,
      legWidth,
      legHeight - frontLegOffset * 0.5
    );
    this.context.closePath();
    
    // Back legs
    const backLegOffset = Math.sin(this.legPhase + Math.PI) * 10; // Opposite phase
    
    // Back left leg
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.fillRect(
      backLegX - backLegOffset - legWidth/2,
      legY,
      legWidth,
      legHeight + backLegOffset * 0.5
    );
    this.context.closePath();
    
    // Back right leg
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.fillRect(
      backLegX + backLegOffset - legWidth/2,
      legY,
      legWidth,
      legHeight - backLegOffset * 0.5
    );
    this.context.closePath();
    
    // Draw tail
    const tailWidth = 6;
    const tailLength = this.width * 0.6;
    const tailStartX = screenX + this.width;
    const tailStartY = screenY + this.height * 0.3;
    
    // Calculate tail curve based on movement
    const tailCurve = Math.sin(this.legPhase * 0.5) * 15;
    
    this.context.beginPath();
    this.context.strokeStyle = this.color;
    this.context.lineWidth = tailWidth;
    this.context.lineCap = 'round';
    
    // Draw curved tail
    this.context.beginPath();
    this.context.moveTo(tailStartX, tailStartY);
    this.context.quadraticCurveTo(
      tailStartX + tailLength * 0.5,
      tailStartY + tailCurve,
      tailStartX + tailLength,
      tailStartY + tailCurve * 2
    );
    this.context.stroke();
    this.context.closePath();
    
    // Restore context state
    this.context.restore();
  }
  
  /**
   * Helper method to draw rounded rectangles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   */
  roundRect(ctx, x, y, width, height, radius) {
    if (radius > height / 2) radius = height / 2;
    if (radius > width / 2) radius = width / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

export default Tiger;