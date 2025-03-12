class Cloud {
    constructor(context, x, y, size, speed) {
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
        
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.context.arc(this.x + this.size * 0.8, this.y - this.size * 0.2, this.size * 0.8, 0, Math.PI * 2);
        this.context.arc(this.x + this.size * 1.5, this.y, this.size * 0.9, 0, Math.PI * 2);
        this.context.arc(this.x + this.size * 0.7, this.y + this.size * 0.3, this.size * 0.75, 0, Math.PI * 2);
        this.context.fillStyle = this.color;
        this.context.fill();
        this.context.closePath();
    }
}
