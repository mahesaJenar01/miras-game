/**
 * Character.js - Base character class that composes all body parts
 * Handles overall character state, animation, and rendering
 */
import Head from './Head.js';
import Body from './Body.js';
import Limb from './Limb.js';

class Character {
  /**
   * Create a new character
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - Character X position
   * @param {number} y - Character Y position
   * @param {Object} config - Configuration object
   */
  constructor(context, x, y, config = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.config = this.initializeConfig(config);
    
    // Create body parts
    this.initializeParts();
    
    // Animation properties
    this.isWalking = false;
    this.walkCycle = 0;
    this.walkSpeed = config.walkSpeed || 0.1;
    this.swingAmplitude = Math.PI / 6; // 30° swing amplitude
    
    // Jump-related properties
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.gravity = 0.5;
    this.initialY = y;
    
    // Accessories array for specialized parts
    this.accessories = [];
  }
  
  /**
   * Initialize configuration with defaults
   * @param {Object} config - User configuration
   * @returns {Object} Complete configuration
   */
  initializeConfig(config) {
    return {
      color: config.color || "#000000",
      tickness: config.tickness || 2,
      scale: config.scale || 1,
      radius: config.radius || 10,
      bodyLength: config.bodyLength || this.calculateBodyLength(config.radius || 10),
      handsLength: config.handsLength || (config.radius || 10),
      legLength: config.legLength || (config.radius || 10) * 1.5,
      hasFeminineFeatures: config.hasFeminineFeatures || false,
      handsRatio: config.handsRatio || 0.2,
      legsRatio: config.legsRatio || 1,
      walkSpeed: config.walkSpeed || 0.1
    };
  }
  
  /**
   * Calculate body length based on head radius
   * @param {number} radius - Head radius
   * @returns {number} Body length
   */
  calculateBodyLength(radius) {
    return radius * 2.5;
  }
  
  /**
   * Initialize all body parts
   */
  initializeParts() {
    const config = this.config;
    
    // Create head
    this.head = new Head(this.context, this.x, this.y, {
      color: config.color,
      tickness: config.tickness,
      scale: config.scale,
      radius: config.radius,
      hasFeminineFeatures: config.hasFeminineFeatures
    });
    
    // Create body
    this.body = new Body(this.context, this.x, this.y + config.radius, {
      color: config.color,
      tickness: config.tickness,
      scale: config.scale,
      bodyLength: config.bodyLength,
      hasFeminineFeatures: config.hasFeminineFeatures
    });
    
    // Calculate positions for hands and legs
    const handsPosition = this.y + config.radius + (config.bodyLength * config.handsRatio);
    const legsPosition = this.y + config.radius + (config.bodyLength * config.legsRatio);
    
    // Create hands
    this.leftHand = new Limb(
      this.context, 
      this.x, 
      handsPosition, 
      {
        color: config.color,
        tickness: config.tickness,
        scale: config.scale,
        handsLength: config.handsLength,
        hasFeminineFeatures: config.hasFeminineFeatures
      },
      'hand',
      true
    );
    
    this.rightHand = new Limb(
      this.context, 
      this.x, 
      handsPosition, 
      {
        color: config.color,
        tickness: config.tickness,
        scale: config.scale,
        handsLength: config.handsLength,
        hasFeminineFeatures: config.hasFeminineFeatures
      },
      'hand',
      false
    );
    
    // Create legs
    this.leftLeg = new Limb(
      this.context, 
      this.x, 
      legsPosition, 
      {
        color: config.color,
        tickness: config.tickness,
        scale: config.scale,
        legLength: config.legLength,
        hasFeminineFeatures: config.hasFeminineFeatures
      },
      'leg',
      true
    );
    
    this.rightLeg = new Limb(
      this.context, 
      this.x, 
      legsPosition, 
      {
        color: config.color,
        tickness: config.tickness,
        scale: config.scale,
        legLength: config.legLength,
        hasFeminineFeatures: config.hasFeminineFeatures
      },
      'leg',
      false
    );
  }
  
  /**
   * Draw the character
   */
  draw() {
    // Update positions of all parts (in case character has moved)
    this.updatePartPositions();
    
    // Calculate animation values
    let legSwing = 0;
    let armSwing = 0;
    
    if (this.isWalking) {
      this.walkCycle += this.walkSpeed;
      legSwing = Math.sin(this.walkCycle) * this.swingAmplitude;
      armSwing = Math.sin(this.walkCycle) * (this.swingAmplitude * 0.8);
    }
    
    // Draw head
    this.head.draw();
    
    // Draw body
    this.body.draw();
    
    // Draw limbs with or without animation
    if (this.isWalking) {
      this.leftHand.drawAnimated(armSwing);
      this.rightHand.drawAnimated(-armSwing);
      this.leftLeg.drawAnimated(legSwing);
      this.rightLeg.drawAnimated(-legSwing);
    } else {
      this.leftHand.draw();
      this.rightHand.draw();
      this.leftLeg.draw();
      this.rightLeg.draw();
    }
    
    // Draw all accessories
    this.accessories.forEach(accessory => {
      if (accessory.draw) {
        accessory.draw();
      }
    });
  }
  
  /**
   * Update positions of all parts based on character position
   */
  updatePartPositions() {
    const config = this.config;
    
    // Update head position
    this.head.updatePosition(this.x, this.y);
    
    // Update body position
    this.body.updatePosition(this.x, this.y + config.radius);
    
    // Calculate positions for hands and legs
    const handsPosition = this.y + config.radius + (config.bodyLength * config.handsRatio);
    const legsPosition = this.y + config.radius + (config.bodyLength * config.legsRatio);
    
    // Update hands positions
    this.leftHand.updatePosition(this.x, handsPosition);
    this.rightHand.updatePosition(this.x, handsPosition);
    
    // Update legs positions
    this.leftLeg.updatePosition(this.x, legsPosition);
    this.rightLeg.updatePosition(this.x, legsPosition);
    
    // Update accessory positions
    this.accessories.forEach(accessory => {
      if (accessory.updatePosition) {
        accessory.updatePosition();
      }
    });
  }
  
  /**
   * Start a jump
   */
  startJump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = 10; // adjust this value to set the jump height
      this.initialY = this.y;
    }
  }
  
  /**
   * Update jump physics
   */
  updateJump() {
    if (this.isJumping) {
      this.y -= this.jumpVelocity; // move character upward
      this.jumpVelocity -= this.gravity; // apply gravity
      
      // When character returns to (or passes) the initial Y position, stop jumping
      if (this.y >= this.initialY) {
        this.y = this.initialY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
      
      // Update positions after movement
      this.updatePartPositions();
    }
  }
  
  /**
   * Add an accessory to the character
   * @param {Object} accessory - The accessory to add
   */
  addAccessory(accessory) {
    this.accessories.push(accessory);
  }
  
  /**
   * Remove an accessory from the character
   * @param {Object} accessory - The accessory to remove
   */
  removeAccessory(accessory) {
    const index = this.accessories.indexOf(accessory);
    if (index !== -1) {
      this.accessories.splice(index, 1);
    }
  }
  
  /**
   * Update character configuration
   * @param {Object} config - New configuration properties
   */
  updateConfig(config = {}) {
    // Update main config object
    Object.assign(this.config, config);
    
    // Update all parts
    if (this.head) this.head.updateConfig(config);
    if (this.body) this.body.updateConfig(config);
    if (this.leftHand) this.leftHand.updateConfig(config);
    if (this.rightHand) this.rightHand.updateConfig(config);
    if (this.leftLeg) this.leftLeg.updateConfig(config);
    if (this.rightLeg) this.rightLeg.updateConfig(config);
    
    // Update positions
    this.updatePartPositions();
  }
}

export default Character;