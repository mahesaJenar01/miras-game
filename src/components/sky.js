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
        const { context, width, height, colors } = this;
        const gradient = context.createLinearGradient(0, 0, 0, height * 0.8);
        
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(0.5, colors.middle);
        gradient.addColorStop(1, colors.bottom);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height * 0.8);
    }
}

export default Sky;