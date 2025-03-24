class BaseStickfigure {
  constructor(context, x, y, color, tickness) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.context = context;
    this.tickness = tickness;
  }
}

class Head extends BaseStickfigure {
  constructor(context, x, y, color, tickness, radius) {
    super(context, x, y, color, tickness);
    this.radius = radius;
  }
  
  draw(hasFeminineFeatures = false) {
    // Draw basic head
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
    
    // Draw feminine features if enabled
    if (hasFeminineFeatures) {
      // Draw simple hair (small curves around the top of the head)
      this.context.beginPath();
      
      // Left side hair
      this.context.moveTo(this.x - this.radius * 0.8, this.y + this.radius * 0.2);
      this.context.bezierCurveTo(
        this.x - this.radius * 1.2, this.y - this.radius * 0.4,
        this.x - this.radius * 0.8, this.y - this.radius * 1.2,
        this.x - this.radius * 0.3, this.y - this.radius * 0.8
      );
      
      // Middle hair
      this.context.moveTo(this.x, this.y - this.radius);
      this.context.bezierCurveTo(
        this.x - this.radius * 0.2, this.y - this.radius * 1.3,
        this.x + this.radius * 0.2, this.y - this.radius * 1.3,
        this.x, this.y - this.radius
      );
      
      // Right side hair
      this.context.moveTo(this.x + this.radius * 0.3, this.y - this.radius * 0.8);
      this.context.bezierCurveTo(
        this.x + this.radius * 0.8, this.y - this.radius * 1.2,
        this.x + this.radius * 1.2, this.y - this.radius * 0.4,
        this.x + this.radius * 0.8, this.y + this.radius * 0.2
      );
      
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.tickness * 0.8;
      this.context.stroke();
      this.context.closePath();
      
      // Draw a small bow
      const bowX = this.x + this.radius * 0.7;
      const bowY = this.y - this.radius * 0.5;
      const bowSize = this.radius * 0.4;
      
      // Draw bow center
      this.context.beginPath();
      this.context.arc(bowX, bowY, bowSize * 0.3, 0, Math.PI * 2);
      this.context.fillStyle = this.color;
      this.context.fill();
      this.context.closePath();
      
      // Draw bow left loop
      this.context.beginPath();
      this.context.ellipse(
        bowX - bowSize * 0.6, bowY,
        bowSize * 0.7, bowSize * 0.5,
        Math.PI * 0.2, 0, Math.PI * 2
      );
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.tickness * 0.8;
      this.context.stroke();
      this.context.closePath();
      
      // Draw bow right loop
      this.context.beginPath();
      this.context.ellipse(
        bowX + bowSize * 0.6, bowY,
        bowSize * 0.7, bowSize * 0.5,
        -Math.PI * 0.2, 0, Math.PI * 2
      );
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.tickness * 0.8;
      this.context.stroke();
      this.context.closePath();
      
      // Draw bow ribbons
      this.context.beginPath();
      // Left ribbon
      this.context.moveTo(bowX - bowSize * 0.3, bowY + bowSize * 0.2);
      this.context.quadraticCurveTo(
        bowX - bowSize * 0.7, bowY + bowSize * 0.7,
        bowX - bowSize * 0.5, bowY + bowSize
      );
      
      // Right ribbon
      this.context.moveTo(bowX + bowSize * 0.3, bowY + bowSize * 0.2);
      this.context.quadraticCurveTo(
        bowX + bowSize * 0.7, bowY + bowSize * 0.7,
        bowX + bowSize * 0.5, bowY + bowSize
      );
      
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.tickness * 0.8;
      this.context.stroke();
      this.context.closePath();
    }
  }
}

class Body extends BaseStickfigure {
  constructor(context, x, y, color, tickness, length = 50) {
    super(context, x, y, color, tickness);
    this.length = length;
  }
  
  draw(hasFeminineFeatures = false) {
    this.context.beginPath();
    
    if (hasFeminineFeatures) {
      // Draw a slightly curved body for a more feminine silhouette
      const controlX = this.x - this.length * 0.07; // Slight curve for feminine figure
      const controlY = this.y + this.length * 0.5;
      
      this.context.moveTo(this.x, this.y);
      this.context.quadraticCurveTo(
        controlX, controlY,
        this.x, this.y + this.length
      );
    } else {
      // Draw straight body
      this.context.moveTo(this.x, this.y);
      this.context.lineTo(this.x, this.y + this.length);
    }
    
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
  }
}

class Hand extends BaseStickfigure {
  constructor(context, x, y, color, tickness, isLeft = true, length) {
    super(context, x, y, color, tickness);
    this.length = length;
    this.isLeft = isLeft;
  }
  
  // Static drawing (default hand position)
  draw(hasFeminineFeatures = false) {
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    
    if (hasFeminineFeatures) {
      // Slightly more graceful arm angles for feminine figure
      if (this.isLeft) {
        this.context.lineTo(this.x - this.length * 0.7, this.y + this.length * 0.9);
      } else {
        this.context.lineTo(this.x + this.length * 0.7, this.y + this.length * 0.9);
      }
    } else {
      if (this.isLeft) {
        this.context.lineTo(this.x - this.length * 0.75, this.y + this.length);
      } else {
        this.context.lineTo(this.x + this.length * 0.75, this.y + this.length);
      }
    }
    
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
  }
  
  // Animated drawing using a swing value (e.g. armSwing)
  walkingAnimation(armSwing, hasFeminineFeatures = false) {
    // Slightly more graceful swinging for feminine figure
    const angle = Math.PI / 2 + armSwing * (hasFeminineFeatures ? 0.9 : 1);
    const endX = this.isLeft
      ? this.x + Math.cos(angle) * this.length
      : this.x + Math.cos(angle) * this.length;
    const endY = this.y + Math.sin(angle) * this.length;
    
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    this.context.lineTo(endX, endY);
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
  }
}

class Leg extends BaseStickfigure {
  constructor(context, x, y, color, tickness, isLeft = true, length) {
    super(context, x, y, color, tickness);
    this.isLeft = isLeft;
    this.length = length;
  }
  
  // Static drawing (default leg position)
  draw(hasFeminineFeatures = false) {
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    
    if (hasFeminineFeatures) {
      // Slightly more graceful leg angles for feminine figure
      if (this.isLeft) {
        this.context.lineTo(this.x - this.length * 0.4, this.y + this.length);
      } else {
        this.context.lineTo(this.x + this.length * 0.4, this.y + this.length);
      }
    } else {
      if (this.isLeft) {
        this.context.lineTo(this.x - this.length * 0.5, this.y + this.length);
      } else {
        this.context.lineTo(this.x + this.length * 0.5, this.y + this.length);
      }
    }
    
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
  }
  
  // Animated drawing using a swing value (e.g. legSwing)
  walkingAnimation(legSwing, hasFeminineFeatures = false) {
    // Slightly more graceful swinging for feminine figure
    const angle = Math.PI / 2 + legSwing * (hasFeminineFeatures ? 0.85 : 1);
    const endX = this.isLeft
      ? this.x + Math.cos(angle) * this.length
      : this.x + Math.cos(angle) * this.length;
    const endY = this.y + Math.sin(angle) * this.length;
    
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    this.context.lineTo(endX, endY);
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness;
    this.context.stroke();
    this.context.closePath();
  }
}

class Stickfigure extends BaseStickfigure {
  constructor(context, x, y, color, tickness, radius) {
    super(context, x, y, color, tickness);
    this.radius = radius;
    this.bodyLength = this.radius * 2.5;

    // Store these as ratios rather than fixed positions
    this.handsRatio = 0.2; // hands at 60% of body length from top
    this.legsRatio = 1;  // legs at 140% of body length from top
    this.handsLength = this.radius;
    this.legLength = this.radius * 1.5;

    // Variables for walking animation
    this.walkCycle = 0;
    this.swingAmplitude = Math.PI / 6; // 30° swing amplitude
    this.walkSpeed = 0.1; // Animation speed

    // Control properties
    this.isWalking = false;

    // Jump-related properties
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.gravity = 0.5;
    this.initialY = y;
    
    // Feminine features flag
    this.hasFeminineFeatures = true; // Set to true to enable feminine styling
  }

  // Update jump physics each frame
  updateJump() {
    if (this.isJumping) {
      this.y -= this.jumpVelocity; // move stickfigure upward
      this.jumpVelocity -= this.gravity; // apply gravity

      // When stickfigure returns to (or passes) the initial Y position, stop jumping.
      if (this.y >= this.initialY) {
        this.y = this.initialY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }
  }

  // Initiate a jump
  startJump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = 10; // adjust this value to set the jump height
      this.initialY = this.y;
    }
  }

  draw() {
    // Calculate current positions for hands and legs based on current y position
    const handsPosition = this.y + this.radius + (this.bodyLength * this.handsRatio);
    const legsPosition = this.y + this.radius + (this.bodyLength * this.legsRatio);
    
    let legSwing, armSwing;
    if (this.isWalking) {
      this.walkCycle += this.walkSpeed;
      legSwing = Math.sin(this.walkCycle) * this.swingAmplitude;
      armSwing = Math.sin(this.walkCycle) * (this.swingAmplitude * 0.8);
    } else {
      legSwing = 0;
      armSwing = 0;
    }

    // Draw head with optional feminine features
    const head = new Head(this.context, this.x, this.y, this.color, this.tickness, this.radius);
    head.draw(this.hasFeminineFeatures);

    // Draw body with optional feminine features
    const body = new Body(this.context, this.x, this.y + this.radius, this.color, this.tickness, this.bodyLength);
    body.draw(this.hasFeminineFeatures);

    // Draw arms using the dynamically calculated handsPosition
    const leftHand = new Hand(this.context, this.x, handsPosition, this.color, this.tickness, true, this.handsLength);
    const rightHand = new Hand(this.context, this.x, handsPosition, this.color, this.tickness, false, this.handsLength);
    if (this.isWalking) {
      leftHand.walkingAnimation(armSwing, this.hasFeminineFeatures);
      rightHand.walkingAnimation(-armSwing, this.hasFeminineFeatures);
    } else {
      leftHand.draw(this.hasFeminineFeatures);
      rightHand.draw(this.hasFeminineFeatures);
    }

    // Draw legs using the dynamically calculated legsPosition
    const leftLeg = new Leg(this.context, this.x, legsPosition, this.color, this.tickness, true, this.legLength);
    const rightLeg = new Leg(this.context, this.x, legsPosition, this.color, this.tickness, false, this.legLength);
    if (this.isWalking) {
      leftLeg.walkingAnimation(legSwing, this.hasFeminineFeatures);
      rightLeg.walkingAnimation(-legSwing, this.hasFeminineFeatures);
    } else {
      leftLeg.draw(this.hasFeminineFeatures);
      rightLeg.draw(this.hasFeminineFeatures);
    }
    
    // If feminine features are enabled, draw a simple skirt
    if (this.hasFeminineFeatures) {
      this.drawSkirt(legsPosition);
    }
  }
  
  // Draw a simple skirt
  drawSkirt(legsPosition) {
    const skirtTop = legsPosition - this.radius * 0.5;
    const skirtWidth = this.radius * 1.5;
    const skirtLength = this.radius * 1.2;
    
    this.context.beginPath();
    
    // Draw a simple A-line skirt
    this.context.moveTo(this.x - skirtWidth * 0.4, skirtTop);
    
    // Left side of skirt with a slight curve
    this.context.quadraticCurveTo(
      this.x - skirtWidth * 0.8, skirtTop + skirtLength * 0.5,
      this.x - skirtWidth, skirtTop + skirtLength
    );
    
    // Bottom of skirt with a slight curve
    this.context.quadraticCurveTo(
      this.x, skirtTop + skirtLength * 1.1,
      this.x + skirtWidth, skirtTop + skirtLength
    );
    
    // Right side of skirt with a slight curve
    this.context.quadraticCurveTo(
      this.x + skirtWidth * 0.8, skirtTop + skirtLength * 0.5,
      this.x + skirtWidth * 0.4, skirtTop
    );
    
    // Close the path
    this.context.closePath();
    
    // Fill with a semi-transparent version of the main color
    const skirtColor = this.color;
    this.context.fillStyle = skirtColor + "33"; // Add 20% opacity
    this.context.fill();
    
    // Add a border
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.tickness * 0.7;
    this.context.stroke();
  }
}

export default Stickfigure;