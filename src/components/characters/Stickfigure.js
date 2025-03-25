import Character from './Character.js';
import Head from './parts/Head.js';
import Body from './parts/Body.js';
import Limb from './parts/Limb.js';
import DrawingUtils from '../../utils/DrawingUtils.js';
import AnimationUtils from '../../utils/AnimationUtils.js';
import ColorPalette from '../../config/ColorPalette.js';

/**
 * Stickfigure character component
 * @extends Character
 */
class Stickfigure extends Character {
  /**
   * Create a new Stickfigure
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} config - Configuration options
   * @param {number} config.x - X position
   * @param {number} config.y - Y position
   * @param {string} config.color - Character color
   * @param {number} config.thickness - Line thickness
   * @param {number} config.radius - Head radius
   * @param {boolean} config.hasFeminineFeatures - Whether to use feminine styling
   */
  constructor(context, config) {
    super(context, config);
  }

  /**
   * Initialize the stickfigure
   */
  initialize() {
    super.initialize();
    
    const { config } = this;
    
    this.radius = config.radius || 10;
    this.bodyLength = this.radius * 2.5;
    
    // Ratios for positioning body parts
    this.handsRatio = config.handsRatio || 0.2; // hands at 20% of body length from top
    this.legsRatio = config.legsRatio || 1;    // legs at 100% of body length from top
    
    // Limb dimensions
    this.handsLength = config.handsLength || this.radius;
    this.legLength = config.legLength || this.radius * 1.5;
    
    // Walking animation parameters
    this.swingAmplitude = Math.PI / 6; // 30° swing amplitude
    
    // Set feminine features
    this.hasFeminineFeatures = config.hasFeminineFeatures !== undefined ? 
                               config.hasFeminineFeatures : true;
    
    // Create body parts
    this.createBodyParts();
  }
  
  /**
   * Create all body parts as child components
   */
  createBodyParts() {
    const { context, x, y, color, thickness, radius, bodyLength, hasFeminineFeatures } = this;
    
    // Create head
    this.head = this.addChild(new Head(context, {
      x,
      y,
      color,
      thickness,
      radius,
      hasFeminineFeatures
    }));
    
    // Create body
    this.body = this.addChild(new Body(context, {
      x,
      y: y + radius, // body starts at bottom of head
      color,
      thickness,
      length: bodyLength,
      hasFeminineFeatures
    }));
    
    // Calculate positions for limbs
    const handsPosition = y + radius + (bodyLength * this.handsRatio);
    const legsPosition = y + radius + (bodyLength * this.legsRatio);
    
    // Create hands
    this.leftHand = this.addChild(new Limb(context, {
      x,
      y: handsPosition,
      color,
      thickness,
      length: this.handsLength,
      isLeft: true,
      type: 'hand',
      hasFeminineFeatures
    }));
    
    this.rightHand = this.addChild(new Limb(context, {
      x,
      y: handsPosition,
      color,
      thickness,
      length: this.handsLength,
      isLeft: false,
      type: 'hand',
      hasFeminineFeatures
    }));
    
    // Create legs
    this.leftLeg = this.addChild(new Limb(context, {
      x,
      y: legsPosition,
      color,
      thickness,
      length: this.legLength,
      isLeft: true,
      type: 'leg',
      hasFeminineFeatures
    }));
    
    this.rightLeg = this.addChild(new Limb(context, {
      x,
      y: legsPosition,
      color,
      thickness,
      length: this.legLength,
      isLeft: false,
      type: 'leg',
      hasFeminineFeatures
    }));
  }

  /**
   * Update stickfigure state
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    // Calculate limb swing values based on walking state
    if (this.isWalking) {
      // Calculate swing based on walk cycle
      const legSwing = Math.sin(this.walkCycle) * this.swingAmplitude;
      const armSwing = Math.sin(this.walkCycle) * (this.swingAmplitude * 0.8);
      
      // Update limb animation values
      this.leftLeg.setSwingValue(legSwing);
      this.rightLeg.setSwingValue(-legSwing);
      this.leftHand.setSwingValue(armSwing);
      this.rightHand.setSwingValue(-armSwing);
    } else {
      // Reset limb animation values
      this.leftLeg.setSwingValue(undefined);
      this.rightLeg.setSwingValue(undefined);
      this.leftHand.setSwingValue(undefined);
      this.rightHand.setSwingValue(undefined);
    }
  }

  /**
   * Draw the stickfigure
   */
  draw() {
    // Draw skirt if feminine features are enabled
    if (this.hasFeminineFeatures) {
      this.drawSkirt();
    }
    
    // Super.draw() will draw all child components (head, body, limbs)
    super.draw();
  }
  
  /**
   * Draw a simple skirt
   */
  drawSkirt() {
    const { context, x, y, radius, thickness, bodyLength, color } = this;
    
    // Calculate skirt position (at the legs position)
    const legsPosition = y + radius + (bodyLength * this.legsRatio);
    const skirtTop = legsPosition - radius * 0.5;
    const skirtWidth = radius * 1.5;
    const skirtLength = radius * 1.2;
    
    context.beginPath();
    
    // Draw a simple A-line skirt
    context.moveTo(x - skirtWidth * 0.4, skirtTop);
    
    // Left side of skirt with a slight curve
    context.quadraticCurveTo(
      x - skirtWidth * 0.8, skirtTop + skirtLength * 0.5,
      x - skirtWidth, skirtTop + skirtLength
    );
    
    // Bottom of skirt with a slight curve
    context.quadraticCurveTo(
      x, skirtTop + skirtLength * 1.1,
      x + skirtWidth, skirtTop + skirtLength
    );
    
    // Right side of skirt with a slight curve
    context.quadraticCurveTo(
      x + skirtWidth * 0.8, skirtTop + skirtLength * 0.5,
      x + skirtWidth * 0.4, skirtTop
    );
    
    // Close the path
    context.closePath();
    
    // Fill with a semi-transparent version of the main color
    const skirtColor = DrawingUtils.withAlpha(color, 0.2);
    context.fillStyle = skirtColor;
    context.fill();
    
    // Add a border
    context.strokeStyle = color;
    context.lineWidth = thickness * 0.7;
    context.stroke();
  }
  
  /**
   * Update stickfigure properties
   * @param {number} x - New X position
   * @param {number} y - New Y position
   * @param {number} radius - New head radius
   * @param {number} thickness - New line thickness
   */
  updateProperties(x, y, radius, thickness) {
    // Update base properties
    super.updateProperties(x, y, thickness);
    
    this.radius = radius;
    this.bodyLength = radius * 2.5;
    this.handsLength = radius;
    this.legLength = radius * 1.5;
    
    // Calculate positions for body parts
    const handsPosition = y + radius + (this.bodyLength * this.handsRatio);
    const legsPosition = y + radius + (this.bodyLength * this.legsRatio);
    
    // Update each body part
    this.head.updateProperties(x, y, radius);
    this.body.updateProperties(x, y + radius, this.bodyLength);
    
    this.leftHand.updateProperties(x, handsPosition, this.handsLength);
    this.rightHand.updateProperties(x, handsPosition, this.handsLength);
    
    this.leftLeg.updateProperties(x, legsPosition, this.legLength);
    this.rightLeg.updateProperties(x, legsPosition, this.legLength);
    
    // Update appearance
    this.head.updateAppearance(this.color, this.thickness);
    this.body.updateAppearance(this.color, this.thickness);
    this.leftHand.updateAppearance(this.color, this.thickness);
    this.rightHand.updateAppearance(this.color, this.thickness);
    this.leftLeg.updateAppearance(this.color, this.thickness);
    this.rightLeg.updateAppearance(this.color, this.thickness);
  }
  
  /**
   * Toggle feminine features
   * @param {boolean} enabled - Whether feminine features should be enabled
   */
  setFeminineFeatures(enabled) {
    this.hasFeminineFeatures = enabled;
    
    // Update all parts
    this.head.setFeminineFeatures(enabled);
    this.body.setFeminineFeatures(enabled);
    this.leftHand.setFeminineFeatures(enabled);
    this.rightHand.setFeminineFeatures(enabled);
    this.leftLeg.setFeminineFeatures(enabled);
    this.rightLeg.setFeminineFeatures(enabled);
  }
}

export default Stickfigure;