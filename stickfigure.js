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
    }

    draw() {
        // Update the walk cycle for dynamic animation
        this.walkCycle += 0.1;
        const swingAmplitude = Math.PI / 12; // 15 degrees swing
        const armSwing = Math.sin(this.walkCycle) * swingAmplitude;
        const legSwing = -Math.sin(this.walkCycle) * swingAmplitude; // opposite phase for legs

        // Draw head (static)
        const head = new Head(this.context, this.x, this.y, this.color, this.tickness, this.radius);
        head.draw();

        // Draw body (static)
        const body = new Body(this.context, this.x, this.y + this.radius, this.color, this.tickness, this.bodyLength);
        body.draw();

        // Draw left arm dynamically
        // Base angle: 225° (5π/4) with added swing
        const leftArmBaseAngle = 5 * Math.PI / 4;
        const leftArmAngle = leftArmBaseAngle + armSwing;
        const leftArmEndX = this.x + Math.cos(leftArmAngle) * this.handsLength;
        const leftArmEndY = this.handsPosition + Math.sin(leftArmAngle) * this.handsLength;
        this.context.beginPath();
        this.context.moveTo(this.x, this.handsPosition);
        this.context.lineTo(leftArmEndX, leftArmEndY);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();

        // Draw right arm dynamically
        // Base angle: 315° (7π/4) with subtracted swing
        const rightArmBaseAngle = 7 * Math.PI / 4;
        const rightArmAngle = rightArmBaseAngle - armSwing;
        const rightArmEndX = this.x + Math.cos(rightArmAngle) * this.handsLength;
        const rightArmEndY = this.handsPosition + Math.sin(rightArmAngle) * this.handsLength;
        this.context.beginPath();
        this.context.moveTo(this.x, this.handsPosition);
        this.context.lineTo(rightArmEndX, rightArmEndY);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();

        // Draw left leg dynamically
        // Base angle: 225° (5π/4) with subtracted leg swing
        const leftLegBaseAngle = 5 * Math.PI / 4;
        const leftLegAngle = leftLegBaseAngle - legSwing;
        const leftLegEndX = this.x + Math.cos(leftLegAngle) * this.legLength;
        const leftLegEndY = this.legsPosition + Math.sin(leftLegAngle) * this.legLength;
        this.context.beginPath();
        this.context.moveTo(this.x, this.legsPosition);
        this.context.lineTo(leftLegEndX, leftLegEndY);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.tickness;
        this.context.stroke();
        this.context.closePath();

        // Draw right leg dynamically
        // Base angle: 315° (7π/4) with added leg swing
        const rightLegBaseAngle = 7 * Math.PI / 4;
        const rightLegAngle = rightLegBaseAngle + legSwing;
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