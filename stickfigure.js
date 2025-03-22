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
    
    draw() {
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.tickness;
      this.context.stroke();
      this.context.closePath();
    }
  }
  
  class Body extends BaseStickfigure {
    constructor(context, x, y, color, tickness, length = 50) {
      super(context, x, y, color, tickness);
      this.length = length;
    }
    
    draw() {
      this.context.beginPath();
      this.context.moveTo(this.x, this.y);
      this.context.lineTo(this.x, this.y + this.length);
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
    draw() {
      this.context.beginPath();
      this.context.moveTo(this.x, this.y);
      if (this.isLeft) {
        this.context.lineTo(this.x - this.length * 0.75, this.y + this.length);
      } else {
        this.context.lineTo(this.x + this.length * 0.75, this.y + this.length);
      }
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.tickness;
      this.context.stroke();
      this.context.closePath();
    }
    
    // Animated drawing using a swing value (e.g. armSwing)
    walkingAnimation(armSwing) {
      const angle = Math.PI / 2 + armSwing;
      const endX = this.isLeft
        ? this.x - Math.cos(angle) * this.length
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
    draw() {
      this.context.beginPath();
      this.context.moveTo(this.x, this.y);
      if (this.isLeft) {
        this.context.lineTo(this.x - this.length * 0.5, this.y + this.length);
      } else {
        this.context.lineTo(this.x + this.length * 0.5, this.y + this.length);
      }
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.tickness;
      this.context.stroke();
      this.context.closePath();
    }
    
    // Animated drawing using a swing value (e.g. legSwing)
    walkingAnimation(legSwing) {
      const angle = Math.PI / 2 + legSwing;
      const endX = this.isLeft
        ? this.x - Math.cos(angle) * this.length
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
  
      // Define the vertical positions for shoulders (arms) and hips (legs)
      this.handsPosition = this.y + this.bodyLength * 0.6;
      this.legsPosition = this.y + this.bodyLength * 1.4;
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
      let legSwing, armSwing;
      if (this.isWalking) {
        this.walkCycle += this.walkSpeed;
        legSwing = Math.sin(this.walkCycle) * this.swingAmplitude;
        armSwing = Math.sin(this.walkCycle) * (this.swingAmplitude * 0.8);
      } else {
        legSwing = 0;
        armSwing = 0;
      }
  
      // Draw head
      const head = new Head(this.context, this.x, this.y, this.color, this.tickness, this.radius);
      head.draw();
  
      // Draw body
      const body = new Body(this.context, this.x, this.y + this.radius, this.color, this.tickness, this.bodyLength);
      body.draw();
  
      // Draw arms
      const leftHand = new Hand(this.context, this.x, this.handsPosition, this.color, this.tickness, true, this.handsLength);
      const rightHand = new Hand(this.context, this.x, this.handsPosition, this.color, this.tickness, false, this.handsLength);
      if (this.isWalking) {
        leftHand.walkingAnimation(armSwing);
        rightHand.walkingAnimation(armSwing);
      } else {
        leftHand.draw();
        rightHand.draw();
      }
  
      // Draw legs
      const leftLeg = new Leg(this.context, this.x, this.legsPosition, this.color, this.tickness, true, this.legLength);
      const rightLeg = new Leg(this.context, this.x, this.legsPosition, this.color, this.tickness, false, this.legLength);
      if (this.isWalking) {
        leftLeg.walkingAnimation(legSwing);
        rightLeg.walkingAnimation(legSwing);
      } else {
        leftLeg.draw();
        rightLeg.draw();
      }
    }
  }  