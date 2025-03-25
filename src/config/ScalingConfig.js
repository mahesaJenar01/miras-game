/**
 * Centralized scaling system for responsive game components
 */
class ScalingConfig {
    /**
     * Create a new scaling configuration
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    constructor(canvasWidth, canvasHeight) {
      this.updateDimensions(canvasWidth, canvasHeight);
    }
  
    /**
     * Update dimensions when canvas is resized
     * @param {number} canvasWidth - New canvas width
     * @param {number} canvasHeight - New canvas height
     */
    updateDimensions(canvasWidth, canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      
      // Base reference sizes (for a 1920x1080 canvas)
      this.baseWidth = 1920;
      this.baseHeight = 1080;
      
      // Calculate scale factors
      this.scaleX = canvasWidth / this.baseWidth;
      this.scaleY = canvasHeight / this.baseHeight;
      this.scale = Math.min(this.scaleX, this.scaleY); // Use the smaller scale to maintain proportions
      
      // Recalculate all component dimensions
      this.calculateDimensions();
    }
  
    /**
     * Calculate component dimensions based on current canvas size
     */
    calculateDimensions() {
      // Sky dimensions
      this.sky = {
        width: this.canvasWidth,
        height: this.canvasHeight
      };
      
      // Ground dimensions
      this.ground = {
        y: this.canvasHeight * 0.8,
        height: this.canvasHeight * 0.2,
        width: this.canvasWidth,
        grassHeight: this.canvasHeight * 0.06, // 30% of ground height
        dirtHeight: this.canvasHeight * 0.14   // 70% of ground height
      };
      
      // Sun dimensions
      this.sun = {
        x: this.canvasWidth * 0.75,
        y: this.canvasHeight * 0.2,
        radius: this.canvasHeight * 0.06,
        glowRadius: this.canvasHeight * 0.09, // 1.5x radius
        rayCount: 12,
        rayLength: this.canvasHeight * 0.042  // 0.7x radius
      };
      
      // Cloud dimensions and positions
      this.clouds = [
        { 
          x: this.canvasWidth * 0.1, 
          y: this.canvasHeight * 0.15, 
          size: this.canvasHeight * 0.03, 
          speed: 0.1 * this.scale 
        },
        { 
          x: this.canvasWidth * 0.3, 
          y: this.canvasHeight * 0.25, 
          size: this.canvasHeight * 0.04, 
          speed: 0.05 * this.scale 
        },
        { 
          x: this.canvasWidth * 0.6, 
          y: this.canvasHeight * 0.1, 
          size: this.canvasHeight * 0.035,
          speed: 0.07 * this.scale 
        },
        { 
          x: this.canvasWidth * 0.8, 
          y: this.canvasHeight * 0.3, 
          size: this.canvasHeight * 0.025,
          speed: 0.12 * this.scale 
        }
      ];
      
      // Stickfigure dimensions
      const stickfigureRadius = this.canvasHeight * 0.05;
      this.stickfigure = {
        x: 10 + stickfigureRadius,
        y: this.canvasHeight * 0.575,
        radius: stickfigureRadius,
        thickness: Math.max(2, 3 * this.scale),
        bodyLength: stickfigureRadius * 2.5,
        handsLength: stickfigureRadius,
        legLength: stickfigureRadius * 1.5,
        handsRatio: 0.2, // Position ratio along body
        legsRatio: 1,    // Position ratio along body
        jumpHeight: stickfigureRadius * 8,
        gravity: 0.5 * this.scale,
        initialJumpVelocity: 10 * this.scale
      };
      
      // Attacker dimensions (relative to stickfigure)
      this.attacker = {
        sizeMultiplier: 1.5,
        xOffset: stickfigureRadius * 3,
        yOffset: 0,
        swordLength: stickfigureRadius * 2.5,
        swordWidth: 4 * this.scale,
        attackRange: 150 * this.scale,
        attackDuration: 40, // frames
        maxCooldown: 120,   // frames (2 seconds at 60fps)
        hasShield: true,
        hasCape: true,
        thickness: Math.max(2, (3 + 1) * this.scale) // Stickfigure thickness + 1
      };
      
      // Button dimensions
      const buttonHeight = Math.min(this.ground.dirtHeight * 0.7, this.canvasHeight * 0.08);
      this.buttons = {
        height: buttonHeight,
        width: buttonHeight * 2,
        cornerRadius: Math.max(4, buttonHeight * 0.2),
        fontSize: `bold ${Math.max(10, Math.min(20, buttonHeight * 0.4))}px Arial`,
        sideGap: Math.max(10, this.canvasWidth * 0.02),
        buttonGap: Math.max(5, this.canvasWidth * 0.01)
      };
    }
  
    /**
     * Scale a value based on the canvas scale
     * @param {number} value - Original value designed for base dimensions
     * @returns {number} Scaled value
     */
    scaleValue(value) {
      return value * this.scale;
    }
  
    /**
     * Scale a position based on the canvas dimensions
     * @param {number} x - X position ratio (0-1)
     * @param {number} y - Y position ratio (0-1)
     * @returns {Object} Scaled {x, y} position
     */
    scalePosition(x, y) {
      return {
        x: this.canvasWidth * x,
        y: this.canvasHeight * y
      };
    }
  }
  
  export default ScalingConfig;