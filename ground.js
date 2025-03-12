class BaseGround{
    constructor(context, x, y, height, width){
        this.x= x;
        this.y= y;
        this.width= width;
        this.height= height;
        this.context= context;
    };
};

class SubGround extends BaseGround{
    constructor(context, x, y, height, width, color){
        super(context, x, y, height, width);
        this.color= color;
    }

    draw(){
        this.context.beginPath();
        this.context.fillStyle= this.color;
        this.context.fillRect(
            this.x, this.y, 
            this.width, this.height
        )
        this.context.closePath();
    };
}

class Ground extends BaseGround {
    constructor(context, x, y, height, width) {
        super(context, x, y, height, width);
        this.grassHeight = this.height * 0.3;
        this.dirtHeight = this.height - this.grassHeight;
        
        // Colors with a feminine touch
        this.grassColors = ["#A9DE9F", "#B9E4AA", "#C9EBB5"]; // Soft green variations
        this.dirtColors = ["#D9BFA9", "#E3CAB1", "#F0DDCA"]; // Soft earth tones
        
        // Flowers
        this.flowers = [];
        const flowerCount = Math.floor(width / 100);
        for (let i = 0; i < flowerCount; i++) {
            this.flowers.push({
                x: Math.random() * width,
                y: y + Math.random() * (this.grassHeight * 0.8),
                size: 3 + Math.random() * 4,
                color: this.getRandomFlowerColor()
            });
        }
        
        // Butterflies
        this.butterflies = [];
        const butterflyCount = Math.floor(width / 300);
        for (let i = 0; i < butterflyCount; i++) {
            this.butterflies.push({
                x: Math.random() * width,
                y: y - (10 + Math.random() * 40),
                size: 5 + Math.random() * 3,
                wingColor: this.getRandomFlowerColor(),
                angle: 0,
                speed: 0.05 + Math.random() * 0.05,
                direction: Math.random() * Math.PI * 2,
                flapSpeed: 0.1 + Math.random() * 0.1
            });
        }
    }
    
    getRandomFlowerColor() {
        const flowerColors = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#F7C8E0"];
        return flowerColors[Math.floor(Math.random() * flowerColors.length)];
    }
    
    updateButterflies() {
        for (const butterfly of this.butterflies) {
            // Update position
            butterfly.x += Math.cos(butterfly.direction) * butterfly.speed;
            butterfly.y += Math.sin(butterfly.direction) * butterfly.speed;
            
            // Change direction occasionally
            if (Math.random() < 0.01) {
                butterfly.direction += (Math.random() - 0.5) * Math.PI / 4;
            }
            
            // Update wing flap
            butterfly.angle += butterfly.flapSpeed;
            
            // Keep butterflies within bounds
            if (butterfly.x < 0) butterfly.x = this.width;
            if (butterfly.x > this.width) butterfly.x = 0;
            if (butterfly.y < this.y - 50) butterfly.y = this.y - 10;
            if (butterfly.y > this.y - 5) butterfly.y = this.y - 5;
        }
    }
    
    drawGrassDetails() {
        // Draw grass blades
        for (let i = 0; i < this.width; i += 10) {
            const grassHeight = this.grassHeight * 0.2 + Math.random() * this.grassHeight * 0.3;
            const colorIndex = Math.floor(Math.random() * this.grassColors.length);
            
            this.context.beginPath();
            this.context.moveTo(this.x + i, this.y);
            
            // Create curved grass blade
            const controlX = this.x + i + (Math.random() - 0.5) * 10;
            const controlY = this.y - grassHeight * 0.7;
            const endX = this.x + i + (Math.random() - 0.5) * 5;
            const endY = this.y - grassHeight;
            
            this.context.quadraticCurveTo(controlX, controlY, endX, endY);
            this.context.strokeStyle = this.grassColors[colorIndex];
            this.context.lineWidth = 1 + Math.random();
            this.context.stroke();
            this.context.closePath();
        }
    }
    
    drawFlowers() {
        for (const flower of this.flowers) {
            // Draw stem
            this.context.beginPath();
            this.context.moveTo(flower.x, this.y);
            this.context.lineTo(flower.x, flower.y + flower.size);
            this.context.strokeStyle = "#A9DE9F";
            this.context.lineWidth = 1;
            this.context.stroke();
            this.context.closePath();
            
            // Draw petals
            const petalCount = 5;
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2;
                const petalX = flower.x + Math.cos(angle) * flower.size;
                const petalY = flower.y + Math.sin(angle) * flower.size;
                
                this.context.beginPath();
                this.context.arc(petalX, petalY, flower.size * 0.7, 0, Math.PI * 2);
                this.context.fillStyle = flower.color;
                this.context.fill();
                this.context.closePath();
            }
            
            // Draw center
            this.context.beginPath();
            this.context.arc(flower.x, flower.y, flower.size * 0.5, 0, Math.PI * 2);
            this.context.fillStyle = "#FFEB85";
            this.context.fill();
            this.context.closePath();
        }
    }
    
    drawButterflies() {
        for (const butterfly of this.butterflies) {
            this.context.save();
            this.context.translate(butterfly.x, butterfly.y);
            
            // Draw wings
            const wingSpan = butterfly.size * 2 * Math.abs(Math.sin(butterfly.angle));
            
            // Left wing
            this.context.beginPath();
            this.context.ellipse(
                -butterfly.size * 0.5, 0,
                wingSpan, butterfly.size,
                Math.PI * 0.25, 0, Math.PI * 2
            );
            this.context.fillStyle = butterfly.wingColor;
            this.context.fill();
            this.context.closePath();
            
            // Right wing
            this.context.beginPath();
            this.context.ellipse(
                butterfly.size * 0.5, 0,
                wingSpan, butterfly.size,
                -Math.PI * 0.25, 0, Math.PI * 2
            );
            this.context.fillStyle = butterfly.wingColor;
            this.context.fill();
            this.context.closePath();
            
            // Body
            this.context.beginPath();
            this.context.ellipse(0, 0, butterfly.size * 0.2, butterfly.size * 0.8, 0, 0, Math.PI * 2);
            this.context.fillStyle = "#333";
            this.context.fill();
            this.context.closePath();
            
            this.context.restore();
        }
    }

    draw() {
        // Update animations
        this.updateButterflies();
        
        // Draw base grass with gradient
        const grassGradient = this.context.createLinearGradient(0, this.y, 0, this.y + this.grassHeight);
        grassGradient.addColorStop(0, this.grassColors[0]);
        grassGradient.addColorStop(1, this.grassColors[2]);
        
        this.context.beginPath();
        this.context.fillStyle = grassGradient;
        this.context.fillRect(
            this.x, this.y, 
            this.width, this.grassHeight
        );
        this.context.closePath();
        
        // Draw dirt with gradient
        const dirtGradient = this.context.createLinearGradient(0, this.y + this.grassHeight, 0, this.y + this.height);
        dirtGradient.addColorStop(0, this.dirtColors[0]);
        dirtGradient.addColorStop(1, this.dirtColors[2]);
        
        this.context.beginPath();
        this.context.fillStyle = dirtGradient;
        this.context.fillRect(
            this.x, this.y + this.grassHeight,
            this.width, this.dirtHeight
        );
        this.context.closePath();
        
        // Draw details
        this.drawGrassDetails();
        this.drawFlowers();
        this.drawButterflies();
    }
}