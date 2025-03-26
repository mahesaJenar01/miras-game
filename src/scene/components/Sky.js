/**
 * Sky.js - Handles the sky background with gradient
 */
class Sky {
    /**
     * Create a new sky
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    constructor(context, width, height) {
        this.context = context;
        this.width = width;
        this.height = height;
        
        // Sky gradient colors (soft pastel colors)
        this.colors = {
            top: "#C9D9FB",    // Light blue
            middle: "#E3D1F4",  // Soft lavender
            bottom: "#F8E1EC"   // Light pink
        };
    }

    /**
     * Draw the sky with gradient
     */
    draw() {
        const { context, width, height, colors } = this;
        const gradient = context.createLinearGradient(0, 0, 0, height * 0.8);
        
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(0.5, colors.middle);
        gradient.addColorStop(1, colors.bottom);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height * 0.8);
    }
    
    /**
     * Update sky dimensions when canvas is resized
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Change the sky colors (for time of day effects)
     * @param {Object} newColors - Object with top, middle, bottom colors
     */
    setColors(newColors) {
        Object.assign(this.colors, newColors);
    }
}

export default Sky;