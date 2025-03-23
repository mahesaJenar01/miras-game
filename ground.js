// New class to represent individual blades of grass
class GrassBlade {
  constructor(relativeX, controlX, controlY, endX, endY, strokeWidth, colorIndex) {
    this.relativeX = relativeX;
    this.controlX = controlX;
    this.controlY = controlY;
    this.endX = endX;
    this.endY = endY;
    this.strokeWidth = strokeWidth;
    this.colorIndex = colorIndex;
  }
  
  draw(context, xOffset, baseY, grassColors) {
    context.beginPath();
    context.moveTo(xOffset + this.relativeX, baseY);
    context.quadraticCurveTo(
      xOffset + this.controlX, this.controlY,
      xOffset + this.endX, this.endY
    );
    context.strokeStyle = grassColors[this.colorIndex];
    context.lineWidth = this.strokeWidth;
    context.stroke();
    context.closePath();
  }
}

// New class to represent a flower
class Flower {
  constructor(x, y, size, color) {
    this.x = x; // horizontal position (relative to the ground tile)
    this.y = y; // vertical offset for petals and center
    this.size = size;
    this.color = color;
  }
  
  draw(context, xOffset, baseY) {
    // Draw stem
    context.beginPath();
    context.moveTo(xOffset + this.x, baseY);
    context.lineTo(xOffset + this.x, baseY + this.size);
    context.strokeStyle = "#A9DE9F";
    context.lineWidth = 1;
    context.stroke();
    context.closePath();
    
    // Draw petals
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = xOffset + this.x + Math.cos(angle) * this.size;
      const petalY = baseY + this.y + Math.sin(angle) * this.size;
      context.beginPath();
      context.arc(petalX, petalY, this.size * 0.7, 0, Math.PI * 2);
      context.fillStyle = this.color;
      context.fill();
      context.closePath();
    }
    
    // Draw center
    context.beginPath();
    context.arc(xOffset + this.x, baseY + this.y, this.size * 0.5, 0, Math.PI * 2);
    context.fillStyle = "#FFEB85";
    context.fill();
    context.closePath();
  }
}

// New class to represent a butterfly
class Butterfly {
  constructor(x, y, size, wingColor, angle, speed, direction, flapSpeed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.wingColor = wingColor;
    this.angle = angle;
    this.speed = speed;
    this.direction = direction;
    this.flapSpeed = flapSpeed;
  }
  
  update(width) {
    // Update position based on direction and speed
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;
    
    // Occasionally change direction
    if (Math.random() < 0.01) {
      this.direction += (Math.random() - 0.5) * Math.PI / 4;
    }
    
    // Update wing flap angle
    this.angle += this.flapSpeed;
    
    // Keep the butterfly within bounds
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.y > 40) this.y = 40;
  }
  
  draw(context, xOffset, baseY) {
    context.save();
    // Adjust vertical position relative to the ground (subtracting 10 as in the original code)
    context.translate(xOffset + this.x, baseY - 10 + this.y);
    
    // Draw left wing
    const wingSpan = this.size * 2 * Math.abs(Math.sin(this.angle));
    context.beginPath();
    context.ellipse(-this.size * 0.5, 0, wingSpan, this.size, Math.PI * 0.25, 0, Math.PI * 2);
    context.fillStyle = this.wingColor;
    context.fill();
    context.closePath();
    
    // Draw right wing
    context.beginPath();
    context.ellipse(this.size * 0.5, 0, wingSpan, this.size, -Math.PI * 0.25, 0, Math.PI * 2);
    context.fillStyle = this.wingColor;
    context.fill();
    context.closePath();
    
    // Draw body
    context.beginPath();
    context.ellipse(0, 0, this.size * 0.2, this.size * 0.8, 0, 0, Math.PI * 2);
    context.fillStyle = "#333";
    context.fill();
    context.closePath();
    
    context.restore();
  }
}

// --- Existing Ground classes below ---

class BaseGround {
  constructor(context, x, y, height, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.context = context;
  }
}

class SubGround extends BaseGround {
  constructor(context, x, y, height, width, color) {
    super(context, x, y, height, width);
    this.color = color;
  }

  draw() {
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.width, this.height);
    this.context.closePath();
  }
}

class Ground extends BaseGround {
  constructor(context, x, y, height, width) {
    super(context, x, y, height, width);
    this.grassHeight = this.height * 0.3;
    this.dirtHeight = this.height - this.grassHeight;
    
    // Colors with a feminine touch
    this.grassColors = ["#A9DE9F", "#B9E4AA", "#C9EBB5"];
    this.dirtColors = ["#D9BFA9", "#E3CAB1", "#F0DDCA"];
    
    // Create GrassBlade objects for seamless tiling
    this.grasses = [];
    for (let i = 0; i < width; i += 10) {
      const grassDetailHeight = this.grassHeight * 0.2 + Math.random() * this.grassHeight * 0.3;
      const relativeX = i;
      const controlX = i + (Math.random() - 0.5) * 10;
      const controlY = this.y - grassDetailHeight * 0.7;
      const endX = i + (Math.random() - 0.5) * 5;
      const endY = this.y - grassDetailHeight;
      const strokeWidth = 1 + Math.random();
      const colorIndex = Math.floor(Math.random() * this.grassColors.length);
      this.grasses.push(new GrassBlade(relativeX, controlX, controlY, endX, endY, strokeWidth, colorIndex));
    }
    
    // Store flower colors separately for reuse
    this.flowerColors = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#F7C8E0"];
    
    // Keep track of the last tile indices we've generated decorations for
    this.lastTileIndex = -1;
    this.tileDecorations = new Map(); // Map to store decorations by tile index
  }
  
  getRandomFlowerColor() {
    return this.flowerColors[Math.floor(Math.random() * this.flowerColors.length)];
  }
  
  // Generate deterministic but varied elements for a specific tile
  generateTileDecorations(tileIndex) {
    // Use the tile index as a seed for pseudo-random generation
    const seed = tileIndex * 10000;
    
    // Simple function to get a seeded random number
    const seededRandom = (offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };
    
    const flowers = [];
    const flowerCount = Math.floor(this.width / 100);
    for (let i = 0; i < flowerCount; i++) {
      flowers.push(new Flower(
        seededRandom(i * 0.1) * this.width,
        seededRandom(i * 0.2) * (this.grassHeight * 0.8),
        3 + seededRandom(i * 0.3) * 4,
        this.flowerColors[Math.floor(seededRandom(i * 0.4) * this.flowerColors.length)]
      ));
    }
    
    const butterflies = [];
    const butterflyCount = Math.floor(this.width / 300);
    for (let i = 0; i < butterflyCount; i++) {
      butterflies.push(new Butterfly(
        seededRandom(i * 0.5) * this.width,
        seededRandom(i * 0.6) * 40,
        5 + seededRandom(i * 0.7) * 3,
        this.flowerColors[Math.floor(seededRandom(i * 0.8) * this.flowerColors.length)],
        seededRandom(i * 0.9) * Math.PI,
        0.05 + seededRandom(i + 1.0) * 0.05,
        seededRandom(i + 1.1) * Math.PI * 2,
        0.1 + seededRandom(i + 1.2) * 0.1
      ));
    }
    
    return { flowers, butterflies };
  }
  
  // Get or generate decorations for a specific tile
  getTileDecorations(tileIndex) {
    if (!this.tileDecorations.has(tileIndex)) {
      this.tileDecorations.set(tileIndex, this.generateTileDecorations(tileIndex));
      
      // Limit the cache size to prevent memory issues
      if (this.tileDecorations.size > 10) {
        // Remove the oldest entry (first key in the map)
        const firstKey = this.tileDecorations.keys().next().value;
        this.tileDecorations.delete(firstKey);
      }
    }
    
    return this.tileDecorations.get(tileIndex);
  }
  
  updateButterflies(tileIndex) {
    const decorations = this.getTileDecorations(tileIndex);
    for (const butterfly of decorations.butterflies) {
      butterfly.update(this.width);
    }
  }
  
  // Draw a single ground tile at the given x offset and tile index
  drawTile(xOffset, tileIndex) {
    // Draw grass with a gradient
    const grassGradient = this.context.createLinearGradient(xOffset, this.y, xOffset, this.y + this.grassHeight);
    grassGradient.addColorStop(0, this.grassColors[0]);
    grassGradient.addColorStop(1, this.grassColors[2]);
    this.context.beginPath();
    this.context.fillStyle = grassGradient;
    this.context.fillRect(xOffset, this.y, this.width, this.grassHeight);
    this.context.closePath();
    
    // Draw dirt with a gradient
    const dirtGradient = this.context.createLinearGradient(xOffset, this.y + this.grassHeight, xOffset, this.y + this.height);
    dirtGradient.addColorStop(0, this.dirtColors[0]);
    dirtGradient.addColorStop(1, this.dirtColors[2]);
    this.context.beginPath();
    this.context.fillStyle = dirtGradient;
    this.context.fillRect(xOffset, this.y + this.grassHeight, this.width, this.dirtHeight);
    this.context.closePath();
    
    // Draw static details using the new classes
    this.drawGrassDetails(xOffset);
    
    // Get decorations for this specific tile
    const decorations = this.getTileDecorations(tileIndex);
    this.drawFlowers(xOffset, decorations.flowers);
    this.drawButterflies(xOffset, decorations.butterflies);
  }
  
  drawGrassDetails(xOffset) {
    for (const grassBlade of this.grasses) {
      grassBlade.draw(this.context, xOffset, this.y, this.grassColors);
    }
  }
  
  drawFlowers(xOffset, flowers) {
    for (const flower of flowers) {
      flower.draw(this.context, xOffset, this.y);
    }
  }
  
  drawButterflies(xOffset, butterflies) {
    for (const butterfly of butterflies) {
      butterfly.draw(this.context, xOffset, this.y);
    }
  }
  
  // The main draw method accepts the current worldOffset to tile the ground seamlessly
  draw(worldOffset) {
    // Calculate the number of full tiles we've scrolled past
    const tilesPassed = Math.floor(worldOffset / this.width);
    
    // Calculate the tile offset using modulus so the tile repeats seamlessly
    const offset = worldOffset % this.width;
    
    // Update dynamic elements (like butterflies) for both visible tiles
    this.updateButterflies(tilesPassed);
    this.updateButterflies(tilesPassed + 1);
    
    // Draw the first tile at the adjusted x position with its correct tile index
    this.drawTile(this.x - offset, tilesPassed);
    
    // Draw a second tile if needed to cover the full canvas width
    if ((this.x - offset + this.width) < canvas.width) {
      this.drawTile(this.x - offset + this.width, tilesPassed + 1);
    }
  }
}