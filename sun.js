class Sun {
    constructor(context, x, y, radius) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.glowRadius = radius * 1.5;
        this.color = "#FFD166"; // Warm yellow
        this.glowColor = "rgba(255, 209, 102, 0.3)"; // Transparent version of the sun color
        this.rays = 12; // Number of sun rays
        this.rayLength = radius * 0.7;
        this.time = 0;
    }

    update() {
        this.time += 0.01;
    }

    draw() {
        this.update();
        
        // Draw sun glow
        const gradient = this.context.createRadialGradient(
            this.x, this.y, this.radius * 0.5,
            this.x, this.y, this.glowRadius
        );
        gradient.addColorStop(0, this.glowColor);
        gradient.addColorStop(1, "rgba(255, 209, 102, 0)");
        
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.glowRadius, 0, Math.PI * 2);
        this.context.fillStyle = gradient;
        this.context.fill();
        this.context.closePath();
        
        // Draw sun rays
        this.context.save();
        this.context.translate(this.x, this.y);
        this.context.rotate(this.time);
        
        for (let i = 0; i < this.rays; i++) {
            const angle = (i / this.rays) * Math.PI * 2;
            const innerRadius = this.radius * 1.1;
            const outerRadius = this.radius * 1.1 + this.rayLength;
            
            this.context.beginPath();
            this.context.moveTo(
                innerRadius * Math.cos(angle), 
                innerRadius * Math.sin(angle)
            );
            this.context.lineTo(
                outerRadius * Math.cos(angle), 
                outerRadius * Math.sin(angle)
            );
            this.context.strokeStyle = this.color;
            this.context.lineWidth = 3;
            this.context.stroke();
            this.context.closePath();
        }
        
        this.context.restore();
        
        // Draw sun body
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.context.fillStyle = this.color;
        this.context.fill();
        this.context.closePath();
    }
}
