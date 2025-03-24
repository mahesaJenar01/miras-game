class Cloud {
    constructor(context, x, y, size, speed = 0.1) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = "rgba(255, 255, 255, 0.8)";
    }

    update() {
        this.x += this.speed;
        
        // If cloud moves off screen, reset to the other side
        if (this.x > this.context.canvas.width + this.size * 2) {
            this.x = -this.size * 2;
        }
    }

    draw() {
        this.update();
        
        const { context, x, y, size, color } = this;
        
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.arc(x + size * 0.8, y - size * 0.2, size * 0.8, 0, Math.PI * 2);
        context.arc(x + size * 1.5, y, size * 0.9, 0, Math.PI * 2);
        context.arc(x + size * 0.7, y + size * 0.3, size * 0.75, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    }
}

export default Cloud;