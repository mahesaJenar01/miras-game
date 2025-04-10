/**
 * Snake.js - Implementation of snake enemy type
 * Slithers along the ground with a wave-like movement pattern
 */
import BaseEnemy from '../BaseEnemy.js';

class Snake extends BaseEnemy {
  /**
   * Create a new snake enemy
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {number} x - Initial X position in world coordinates
   * @param {number} y - Initial Y position
   * @param {Object} config - Configuration object
   */
  constructor(context, canvas, x, y, config = {}) {
    // Snake-specific defaults
    const snakeConfig = {
      width: 40,
      height: 15,
      speed: 1.2,
      color: '#5D8233', // Green
      health: 30,
      damage: 10,
      maxFrames: 3,
      amplitude: 5,
      frequency: 0.15,
      ...config
    };
    
    super(context, canvas, x, y, snakeConfig);
    
    // Override base type
    this.type = 'snake';
    
    // Snake-specific properties
    this.bodySegments = [];
    this.segmentCount = 8; // Number of body segments
    this.segmentSpacing = 5; // Spacing between segments
    this.slitherAmplitude = 8; // Amplitude of slithering motion
    this.slitherFrequency = 0.1; // Frequency of slithering motion
    
    // Initialize body segments
    this.initializeBodySegments();
  }
  
  /**
   * Initialize snake body segments
   */
  initializeBodySegments() {
    this.bodySegments = [];
    
    // Create segments with decreasing size
    for (let i = 0; i < this.segmentCount; i++) {
      const segmentSize = this.width - (i * (this.width / (this.segmentCount * 1.5)));
      this.bodySegments.push({
        x: this.x - (i * this.segmentSpacing),
        y: this.y,
        width: Math.max(segmentSize, this.width / 3),
        height: this.height - (i * (this.height / (this.segmentCount * 2)))
      });
    }
  }
  
  /**
   * Update snake movement
   * Overrides base class to add slithering motion
   */
  updateMovement() {
    // Update head position with base movement
    this.x += this.speed * this.direction;
    
    // Calculate slithering Y offset
    this.yOffset = Math.sin(this.time * this.slitherFrequency) * this.slitherAmplitude;
    
    // Update body segments with delay to create slithering effect
    for (let i = 0; i < this.bodySegments.length; i++) {
      const segment = this.bodySegments[i];
      
      // Create a wave effect through the body
      const delay = i * 0.3;
      const segmentTime = this.time - delay;
      
      // Update segment positions with delay
      segment.x = this.x - (i * this.segmentSpacing) - (i * 2);
      
      // Apply sine wave to create slithering movement
      segment.y = this.y + Math.sin(segmentTime * this.slitherFrequency) * this.slitherAmplitude;
    }
  }
  
  /**
   * Draw the snake
   * Overrides base class to render snake body
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
    
    // Draw body segments from tail to head
    for (let i = this.bodySegments.length - 1; i >= 0; i--) {
      const segment = this.bodySegments[i];
      const segmentScreenX = segment.x - worldOffset;
      
      // Set color with gradient for body
      const gradient = this.context.createLinearGradient(
        segmentScreenX,
        segment.y - segment.height/2,
        segmentScreenX,
        segment.y + segment.height/2
      );
      
      // Create gradient with lighter top and darker bottom
      gradient.addColorStop(0, '#7EA451'); // Lighter green for top
      gradient.addColorStop(1, '#3D5922'); // Darker green for bottom
      
      // Draw segment
      this.context.beginPath();
      this.context.fillStyle = gradient;
      
      // Use rounded rectangle for segments
      this.roundRect(
        this.context,
        segmentScreenX,
        segment.y,
        segment.width,
        segment.height,
        segment.height / 2
      );
      
      this.context.fill();
      this.context.closePath();
    }
    
    // Draw head
    this.context.beginPath();
    this.context.fillStyle = '#5D8233'; // Slightly different green for head
    
    // Use rounded rectangle for head with more pronounced rounding
    this.roundRect(
      this.context,
      screenX,
      screenY,
      this.width,
      this.height,
      this.height / 2
    );
    
    this.context.fill();
    this.context.closePath();
    
    // Draw eyes
    const eyeSize = this.height * 0.3;
    const eyeY = screenY + this.height * 0.3;
    
    // Left eye
    this.context.beginPath();
    this.context.fillStyle = 'black';
    this.context.arc(
      screenX + this.width * 0.25,
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
      screenX + this.width * 0.75,
      eyeY,
      eyeSize,
      0,
      Math.PI * 2
    );
    this.context.fill();
    this.context.closePath();
    
    // Draw tongue occasionally
    if (Math.sin(this.time * 2) > 0.7) {
      this.context.beginPath();
      this.context.strokeStyle = '#FF3355';
      this.context.lineWidth = 2;
      
      // Forked tongue
      const tongueStartX = screenX + this.width;
      const tongueStartY = screenY + this.height * 0.5;
      const tongueLength = this.width * 0.6;
      const forkLength = tongueLength * 0.3;
      
      // Draw main tongue line
      this.context.moveTo(tongueStartX, tongueStartY);
      this.context.lineTo(tongueStartX + tongueLength - forkLength, tongueStartY);
      
      // Draw fork
      this.context.lineTo(tongueStartX + tongueLength, tongueStartY - forkLength/2);
      this.context.moveTo(tongueStartX + tongueLength - forkLength, tongueStartY);
      this.context.lineTo(tongueStartX + tongueLength, tongueStartY + forkLength/2);
      
      this.context.stroke();
      this.context.closePath();
    }
    
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

export default Snake;