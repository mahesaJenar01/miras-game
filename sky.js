class Sky {
    constructor(context, width, height) {
        this.context = context;
        this.width = width;
        this.height = height;
        // Sky gradient colors (soft pastel colors)
        this.colors = {
            top: "#C9D9FB", // Light blue
            middle: "#E3D1F4", // Soft lavender
            bottom: "#F8E1EC" // Light pink
        };
    }

    draw() {
        const gradient = this.context.createLinearGradient(0, 0, 0, this.height * 0.8);
        gradient.addColorStop(0, this.colors.top);
        gradient.addColorStop(0.5, this.colors.middle);
        gradient.addColorStop(1, this.colors.bottom);
        
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.width, this.height * 0.8);
    }
}
