/**
 * Bird.js - Implementation of bird enemy type
 * Flies in the air with swooping dive attacks
 */
import BaseEnemy from '../BaseEnemy.js';

class Bird extends BaseEnemy {
  /**
   * Create a new bird enemy
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {number} x - Initial X position in world coordinates
   * @param {number} y - Initial Y position
   * @param {Object} config - Configuration object
   */
  constructor(context, canvas, x, y, config = {}) {
    // Bird-specific defaults
    const birdConfig = {
      width: 30,
      height: 20,
      speed: 3,
      color: '#4A6DE5', // Blue
      health: 20,
      damage: 15,
      maxFrames: 2,
      ...config
    };
    
    super(context, canvas, x, y, birdConfig);
    
    // Override base type
    this.type = 'bird';
    
    // Bird-specific properties
    this.wingSpan = this.width * 2.2;
    this.wingHeight = this.height * 0.7;
    this.flapSpeed = 0.2;
    this.flapAngle = 0;
    
    // Flight pattern
    this.isSwooping = false;
    this.swoopTimer = 0;
    this.swoopInterval = 150; // Frames between swoops (2.5 seconds at 60fps)
    this.swoopProgress = 0; // 0 to 1 for swoop animation
    this.swoopDuration = 45; // Frames for swoop animation
    this.swoopDepth = 150; // Maximum descent during swoop
    this.baseAltitude = y; // Original spawn height
    
    // Initialize with random swoop timer
    this.swoopTimer = Math.floor(Math.random() * this.swoopInterval);
    
    // Feather properties
    this.feathers = [];
    this.generateFeathers();
  }
  
  /**
   * Generate decorative feathers
   */
  generateFeathers() {
    // Number of feathers based on wing size
    const featherCount = 5;
    
    for (let i = 0; i < featherCount; i++) {
      // Generate wing feathers
      const angle = (i / featherCount) * Math.PI * 0.5;
      
      this.feathers.push({
        wing: 'left',
        length: this.width * (0.5 + (i / featherCount) * 0.5),
        angle: angle
      });
      
      this.feathers.push({
        wing: 'right',
        length: this.width * (0.5 + (i / featherCount) * 0.5),
        angle: angle
      });
    }
  }
  
  /**
   * Update bird movement
   * Overrides base class to add flying and swooping
   */
  updateMovement() {
    // Update wing flap animation
    this.flapAngle += this.flapSpeed;
    
    // Handle swooping
    if (this.isSwooping) {
      // Update swoop progress
      this.swoopProgress += 1 / this.swoopDuration;
      
      if (this.swoopProgress >= 1) {
        // End of swoop
        this.isSwooping = false;
        this.swoopProgress = 0;
      }
      
      // Calculate swoop curve using sine for down-and-up motion
      const swoopCurve = Math.sin(this.swoopProgress * Math.PI) * this.swoopDepth;
      this.y = this.baseAltitude + swoopCurve;
      
      // Move faster during swoop with a forward arc
      const speedMultiplier = 1 + Math.sin(this.swoopProgress * Math.PI) * 0.5;
      this.x += this.speed * speedMultiplier * this.direction;
    } else {
      // Regular flight
      this.x += this.speed * this.direction;
      
      // Gentle bobbing up and down while flying
      this.y = this.baseAltitude + Math.sin(this.time * 0.1) * 10;
      
      // Update swoop timer
      this.swoopTimer++;
      
      // Start a new swoop
      if (this.swoopTimer >= this.swoopInterval) {
        this.isSwooping = true;
        this.swoopProgress = 0;
        this.swoopTimer = 0;
      }
    }
  }
  
  /**
   * Draw the bird
   * Overrides base class with bird-specific rendering
   * @param {number} worldOffset - Current world offset for parallax
   */
  draw(worldOffset) {
    // Only draw if on screen
    if (!this.isOnScreen) return;
    
    // Calculate screen position
    const screenX = this.x - worldOffset;
    const screenY = this.y;
    
    // Save context state
    this.context.save();
    
    // Draw bird body
    this.context.beginPath();
    
    // Use ellipse for body
    this.context.ellipse(
      screenX,
      screenY,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    );
    
    // Set body color based on swooping state
    if (this.isSwooping) {
      this.context.fillStyle = '#2A50C5'; // Darker blue when swooping
    } else {
      this.context.fillStyle = this.color;
    }
    
    this.context.fill();
    this.context.closePath();
    
    // Calculate wing positions based on flap animation
    const wingY = screenY;
    const leftWingTipX = screenX - this.wingSpan / 2;
    const rightWingTipX = screenX + this.wingSpan / 2;
    
    // Calculate wing angles
    const leftWingAngle = Math.sin(this.flapAngle) * Math.PI * 0.25;
    const rightWingAngle = -leftWingAngle;
    
    // Draw wings using feathers
    this.drawWings(screenX, wingY, leftWingAngle, rightWingAngle);
    
    // Draw head
    const headRadius = this.width * 0.3;
    const headX = screenX - this.width * 0.3;
    const headY = screenY - this.height * 0.1;
    
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.arc(headX, headY, headRadius, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();
    
    // Draw beak
    const beakLength = this.width * 0.4;
    const beakHeight = this.height * 0.15;
    const beakX = headX - headRadius;
    const beakY = headY;
    
    this.context.beginPath();
    this.context.fillStyle = '#FFA500'; // Orange beak
    this.context.moveTo(beakX, beakY - beakHeight / 2);
    this.context.lineTo(beakX - beakLength, beakY);
    this.context.lineTo(beakX, beakY + beakHeight / 2);
    this.context.closePath();
    this.context.fill();
    
    // Draw eye
    const eyeRadius = headRadius * 0.3;
    const eyeX = headX - headRadius * 0.3;
    const eyeY = headY - headRadius * 0.2;
    
    this.context.beginPath();
    this.context.fillStyle = 'black';
    this.context.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();
    
    // Draw tail
    const tailWidth = this.width * 0.2;
    const tailLength = this.width * 0.5;
    const tailX = screenX + this.width * 0.4;
    const tailY = screenY;
    
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.moveTo(tailX, tailY - tailWidth);
    this.context.lineTo(tailX + tailLength, tailY);
    this.context.lineTo(tailX, tailY + tailWidth);
    this.context.closePath();
    this.context.fill();
    
    // Restore context state
    this.context.restore();
  }
  
  /**
   * Draw bird wings with feathers
   * @param {number} centerX - Body center X
   * @param {number} centerY - Body center Y
   * @param {number} leftAngle - Left wing angle
   * @param {number} rightAngle - Right wing angle
   */
  drawWings(centerX, centerY, leftAngle, rightAngle) {
    // Draw left wing
    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.rotate(leftAngle);
    
    // Draw wing base
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.ellipse(
      -this.width * 0.4,
      0,
      this.wingSpan / 4,
      this.wingHeight / 2,
      Math.PI * 0.25,
      0,
      Math.PI * 2
    );
    this.context.fill();
    this.context.closePath();
    
    // Draw left wing feathers
    this.feathers.filter(f => f.wing === 'left').forEach(feather => {
      this.context.beginPath();
      const featherAngle = feather.angle - Math.PI * 0.25; // Adjust base angle
      const featherX = -this.width * 0.4 - Math.cos(featherAngle) * feather.length;
      const featherY = -Math.sin(featherAngle) * feather.length;
      
      this.context.moveTo(-this.width * 0.4, 0);
      this.context.lineTo(featherX, featherY);
      this.context.lineWidth = this.height * 0.15;
      this.context.strokeStyle = this.color;
      this.context.lineCap = 'round';
      this.context.stroke();
      this.context.closePath();
    });
    
    this.context.restore();
    
    // Draw right wing
    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.rotate(rightAngle);
    this.context.scale(-1, 1); // Flip horizontally
    
    // Draw wing base
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.ellipse(
      -this.width * 0.4,
      0,
      this.wingSpan / 4,
      this.wingHeight / 2,
      Math.PI * 0.25,
      0,
      Math.PI * 2
    );
    this.context.fill();
    this.context.closePath();
    
    // Draw right wing feathers
    this.feathers.filter(f => f.wing === 'right').forEach(feather => {
      this.context.beginPath();
      const featherAngle = feather.angle - Math.PI * 0.25; // Adjust base angle
      const featherX = -this.width * 0.4 - Math.cos(featherAngle) * feather.length;
      const featherY = -Math.sin(featherAngle) * feather.length;
      
      this.context.moveTo(-this.width * 0.4, 0);
      this.context.lineTo(featherX, featherY);
      this.context.lineWidth = this.height * 0.15;
      this.context.strokeStyle = this.color;
      this.context.lineCap = 'round';
      this.context.stroke();
      this.context.closePath();
    });
    
    this.context.restore();
  }
}

export default Bird;