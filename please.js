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

    draw() {
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        if (this.isLeft) {
            this.context.lineTo(this.x - this.length, this.y + this.length);
        } else {
            this.context.lineTo(this.x + this.length, this.y + this.length);
        }
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

    draw() {
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        if (this.isLeft) {
            this.context.lineTo(this.x - this.length, this.y + this.length);
        } else {
            this.context.lineTo(this.x + this.length, this.y + this.length);
        }
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();
    }
}

// Enhanced Stickfigure with animated limb movement
class Stickfigure extends BaseStickfigure {
    constructor(context, x, y, color, tickness, radius) {
        super(context, x, y, color, tickness);
        this.radius = radius;
        this.bodyLength = this.radius * 2.5;
        this.handsPosition = this.y + (this.bodyLength * 0.6);
        this.legsPosition = this.y + (this.bodyLength * 1.4);
        this.handsLength = this.radius;
        this.legLength = this.radius * 1.5;
        this.walkCycle = 0;
        this.swingAmplitude = Math.PI / 6; // 30° swing - can be adjusted
        this.walkSpeed = 0.1; // Animation speed - can be adjusted
    }

    draw() {
        // Update the walk cycle for dynamic animation
        this.walkCycle += this.walkSpeed;
        const legSwing = Math.sin(this.walkCycle) * this.swingAmplitude;
        const armSwing = Math.sin(this.walkCycle) * (this.swingAmplitude * 0.8); // Arms swing slightly less than legs

        // Draw head (static)
        const head = new Head(this.context, this.x, this.y, this.color, this.tickness, this.radius);
        head.draw();

        // Draw body (static)
        const body = new Body(this.context, this.x, this.y + this.radius, this.color, this.tickness, this.bodyLength);
        body.draw();

        // --- Arms Animation ---
        // For proper walking animation, arms should swing opposite to legs
        // Arms are drawn from shoulders (slightly below head)
        
        // Draw left arm
        const leftArmAngle = Math.PI / 2 + armSwing; // Perpendicular to body minus swing
        const leftArmEndX = this.x - Math.cos(leftArmAngle) * this.handsLength;
        const leftArmEndY = this.handsPosition + Math.sin(leftArmAngle) * this.handsLength;
        
        this.context.beginPath();
        this.context.moveTo(this.x, this.handsPosition);
        this.context.lineTo(leftArmEndX, leftArmEndY);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();

        // Draw right arm
        const rightArmAngle = Math.PI / 2 + armSwing; // Perpendicular to body plus swing
        const rightArmEndX = this.x + Math.cos(rightArmAngle) * this.handsLength;
        const rightArmEndY = this.handsPosition + Math.sin(rightArmAngle) * this.handsLength;
        
        this.context.beginPath();
        this.context.moveTo(this.x, this.handsPosition);
        this.context.lineTo(rightArmEndX, rightArmEndY);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();

        // --- Legs Animation ---
        // For forward-facing walking animation, legs swing forward and backward
        
        // Draw left leg
        const leftLegAngle = Math.PI / 2 + legSwing; // Perpendicular to body minus swing
        const leftLegEndX = this.x - Math.cos(leftLegAngle) * this.legLength;
        const leftLegEndY = this.legsPosition + Math.sin(leftLegAngle) * this.legLength;
        
        this.context.beginPath();
        this.context.moveTo(this.x, this.legsPosition);
        this.context.lineTo(leftLegEndX, leftLegEndY);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();

        // Draw right leg
        const rightLegAngle = Math.PI / 2 + legSwing; // Perpendicular to body plus swing
        const rightLegEndX = this.x + Math.cos(rightLegAngle) * this.legLength;
        const rightLegEndY = this.legsPosition + Math.sin(rightLegAngle) * this.legLength;
        
        this.context.beginPath();
        this.context.moveTo(this.x, this.legsPosition);
        this.context.lineTo(rightLegEndX, rightLegEndY);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();
    }
}