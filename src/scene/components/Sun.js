/**
 * Sun.js - Handles the sun with glow and rays
 */
class Sun {
    /**
     * Create a new sun
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Sun radius
     */
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
        this.time = 0; // For animation
    }

    /**
     * Update sun animation
     */
    update() {
        this.time += 0.01;
    }

    /**
     * Draw the sun with glow and rays
     */
    draw() {
        const { context, x, y, radius, glowRadius, glowColor, color, rays, rayLength, time } = this;
        
        // Draw sun glow
        const gradient = context.createRadialGradient(
            x, y, radius * 0.5,
            x, y, glowRadius
        );
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, "rgba(255, 209, 102, 0)");
        
        context.beginPath();
        context.arc(x, y, glowRadius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
        context.closePath();
        
        // Draw sun rays
        context.save();
        context.translate(x, y);
        context.rotate(time);
        
        for (let i = 0; i < rays; i++) {
            const angle = (i / rays) * Math.PI * 2;
            const innerRadius = radius * 1.1;
            const outerRadius = radius * 1.1 + rayLength;
            
            context.beginPath();
            context.moveTo(
                innerRadius * Math.cos(angle), 
                innerRadius * Math.sin(angle)
            );
            context.lineTo(
                outerRadius * Math.cos(angle), 
                outerRadius * Math.sin(angle)
            );
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.stroke();
            context.closePath();
        }
        
        context.restore();
        
        // Draw sun body
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    }
    
    /**
     * Update sun position and size
     * @param {number} x - New X position
     * @param {number} y - New Y position
     * @param {number} radius - New radius
     */
    updatePosition(x, y, radius) {
        this.x = x;
        this.y = y;
        if (radius) {
            this.radius = radius;
            this.glowRadius = radius * 1.5;
            this.rayLength = radius * 0.7;
        }
    }
}

export default Sun;