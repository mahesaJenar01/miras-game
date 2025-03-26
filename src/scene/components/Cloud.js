/**
 * Cloud.js - Handles individual cloud with movement
 */
class Cloud {
    /**
     * Create a new cloud
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} x - Initial X position
     * @param {number} y - Y position
     * @param {number} size - Cloud size
     * @param {number} speed - Movement speed
     */
    constructor(context, x, y, size, speed = 0.1) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = "rgba(255, 255, 255, 0.8)";
    }

    /**
     * Update cloud position
     */
    update() {
        this.x += this.speed;
        
        // If cloud moves off screen, reset to the other side
        if (this.x > this.context.canvas.width + this.size * 2) {
            this.x = -this.size * 2;
        }
    }

    /**
     * Draw the cloud
     */
    draw() {
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
    
    /**
     * Update cloud properties
     * @param {number} x - New X position
     * @param {number} y - New Y position
     * @param {number} size - New size
     * @param {number} speed - New speed
     */
    updateProperties(x, y, size, speed) {
        if (x !== undefined) this.x = x;
        if (y !== undefined) this.y = y;
        if (size !== undefined) this.size = size;
        if (speed !== undefined) this.speed = speed;
    }
    
    /**
     * Check if cloud is visible on screen
     * @returns {boolean} True if cloud is visible
     */
    isVisible() {
        return (
            this.x + this.size * 2 >= 0 && 
            this.x - this.size * 2 <= this.context.canvas.width
        );
    }
}

export default Cloud;