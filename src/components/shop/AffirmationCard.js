/**
 * AffirmationCard.js - Represents an affirmation card in the shop
 * Contains a sweet message for the girlfriend
 * Updated to include price display and purchase functionality
 */
class AffirmationCard {
  /**
   * Create a new affirmation card
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Card width
   * @param {number} height - Card height
   * @param {string} message - Affirmation message
   * @param {string} color - Card color
   * @param {number} price - Card price in flowers
   */
  constructor(context, x, y, width, height, message, color = "#F8E1EC", price = 100) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.message = message;
    this.color = color;
    this.price = price;
    this.isSelected = false;
    this.isRevealed = false;
    this.animationProgress = 0;
    this.cornerRadius = 10;
    this.targetX = x; // For animation
    this.targetY = y; // For animation
    this.hoverScale = 1; // For hover effect
    this.isHovered = false;
  }
  
  /**
   * Draw the card
   */
  draw() {
    const { context, x, y, width, height, cornerRadius } = this;
    
    // Save context state
    context.save();
    
    // Apply scale animation if selected - use consistent scale for all states
    if (this.isSelected) {
      // Use a fixed scale of 1.1 regardless of animation progress
      // This ensures card size is consistent across all states
      const scale = 1.1;
      context.translate(x + width/2, y + height/2);
      context.scale(scale, scale);
      context.translate(-(x + width/2), -(y + height/2));
    } else if (this.isHovered) {
      // Apply hover effect
      const scale = this.hoverScale;
      context.translate(x + width/2, y + height/2);
      context.scale(scale, scale);
      context.translate(-(x + width/2), -(y + height/2));
    }
    
    // Draw card background
    context.beginPath();
    this.roundRect(context, x, y, width, height, cornerRadius);
    context.fillStyle = this.color;
    context.fill();
    
    // Add a subtle border
    context.strokeStyle = this.darkenColor(this.color, 30);
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    
    // If the card is revealed, show the message
    if (this.isRevealed) {
      this.drawMessage();
    } else {
      // Otherwise, draw a decorative back
      this.drawCardBack();
    }

    // Always draw the price tag (unless revealed)
    if (!this.isRevealed) {
      this.drawPriceTag();
    }
    
    // Restore context state
    context.restore();
  }
  
  /**
   * Draw the card back (decorative elements)
   */
  drawCardBack() {
    const { context, x, y, width, height } = this;
    
    // Draw a heart in the center
    const heartSize = Math.min(width, height) * 0.3;
    const heartX = x + width/2;
    const heartY = y + height/2;
    
    // Draw heart shape
    context.beginPath();
    
    // Top left curve
    context.moveTo(heartX, heartY + heartSize * 0.3);
    context.bezierCurveTo(
      heartX - heartSize * 0.5, heartY - heartSize * 0.3, 
      heartX - heartSize, heartY + heartSize * 0.3, 
      heartX, heartY + heartSize
    );
    
    // Top right curve
    context.bezierCurveTo(
      heartX + heartSize, heartY + heartSize * 0.3, 
      heartX + heartSize * 0.5, heartY - heartSize * 0.3, 
      heartX, heartY + heartSize * 0.3
    );
    
    context.fillStyle = this.darkenColor(this.color, 40);
    context.fill();
    context.closePath();
    
    // Draw a question mark
    context.font = `bold ${Math.min(width, height) * 0.5}px Arial`;
    context.fillStyle = this.lightenColor(this.color, 40);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText("?", heartX, heartY);
  }
  
  /**
   * Draw the affirmation message
   */
  drawMessage() {
    const { context, x, y, width, height, message } = this;
    
    // Set text properties
    context.font = `bold ${Math.min(width * 0.07, 18)}px Arial`;
    context.fillStyle = "#333";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Word wrap the message to fit the card
    const words = message.split(' ');
    const lineHeight = Math.min(width * 0.08, 20);
    const maxWidth = width * 0.8;
    
    let line = '';
    let lines = [];
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    
    lines.push(line);
    
    // Draw each line
    const startY = y + height/2 - (lines.length * lineHeight)/2;
    
    lines.forEach((line, index) => {
      context.fillText(line, x + width/2, startY + index * lineHeight);
    });
  }

  /**
   * Draw the price tag
   */
  drawPriceTag() {
    const { context, x, y, width, height, price } = this;
    
    // Make tag width adjust based on price digits
    const priceDigits = price.toString().length;
    const tagWidth = Math.min(width * 0.8, Math.max(120, 80 + (priceDigits * 10)));
    const tagHeight = Math.min(height * 0.15, 40);
    const tagX = x + (width - tagWidth) / 2;
    const tagY = y + height - tagHeight - 15; // 15px from bottom for better visibility
    
    // Add a slight drop shadow for the tag
    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    context.shadowBlur = 5;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    // Draw tag background with gradient that matches card color
    context.beginPath();
    this.roundRect(context, tagX, tagY, tagWidth, tagHeight, tagHeight / 2);
    
    // Create a gradient in the same color family as the card but darker
    const baseColor = this.darkenColor(this.color, 40);
    const gradient = context.createLinearGradient(tagX, tagY, tagX, tagY + tagHeight);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, this.darkenColor(baseColor, 20));
    
    context.fillStyle = gradient;
    context.fill();
    
    // Add a subtle border
    context.strokeStyle = this.darkenColor(this.color, 60);
    context.lineWidth = 1.5;
    context.stroke();
    context.closePath();
    
    context.restore(); // End shadow effect
    
    // Draw price text
    context.font = `bold ${Math.min(tagHeight * 0.6, 16)}px Arial`;
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw custom flower icon
    this.drawPriceFlower(tagX + tagWidth * 0.25, tagY + tagHeight/2, tagHeight * 0.5);
    
    // Draw price with improved spacing
    context.fillText(`${price}`, tagX + tagWidth * 0.55, tagY + tagHeight / 2);
  }
  
  /**
   * Draw a custom flower icon for the price tag
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} size - Icon size
   */
  drawPriceFlower(x, y, size) {
    const context = this.context;
    const petalCount = 5;
    
    // Draw flower petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * size * 0.4;
      const petalY = y + Math.sin(angle) * size * 0.4;
      
      context.beginPath();
      context.arc(petalX, petalY, size * 0.35, 0, Math.PI * 2);
      context.fillStyle = '#FF9AA2'; // Light pink petals
      context.fill();
      context.closePath();
    }
    
    // Draw flower center
    context.beginPath();
    context.arc(x, y, size * 0.25, 0, Math.PI * 2);
    context.fillStyle = '#FFEB3B'; // Yellow center
    context.fill();
    context.closePath();
  }
  
  /**
   * Check if a point is inside the card
   * @param {number} pointX - X coordinate to check
   * @param {number} pointY - Y coordinate to check
   * @returns {boolean} True if point is inside
   */
  contains(pointX, pointY) {
    return (
      pointX >= this.x &&
      pointX <= this.x + this.width &&
      pointY >= this.y &&
      pointY <= this.y + this.height
    );
  }
  
  /**
   * Select this card
   */
  select() {
    this.isSelected = true;
    this.animationProgress = 0;
    
    // Start animation
    this.startAnimation();
  }
  
  /**
   * Reveal the card message
   */
  reveal() {
    this.isRevealed = true;
  }
  
  /**
   * Start selection animation
   */
  startAnimation() {
    this.animationProgress = 0;
    this.animate();
  }
  
  /**
   * Animate the card selection
   */
  animate() {
    if (this.animationProgress < 1) {
      this.animationProgress += 0.05;
      
      if (this.animationProgress >= 1) {
        this.animationProgress = 1;
        // We no longer automatically reveal the message after animation completes
        // The reveal will only happen after purchase
      } else {
        // Continue animation
        requestAnimationFrame(() => this.animate());
      }
    }
  }
  
  /**
   * Set hover state
   * @param {boolean} isHovered - Whether card is being hovered over
   */
  setHovered(isHovered) {
    this.isHovered = isHovered;
    
    // Animate hover scale
    if (isHovered) {
      this.hoverScale = 1.05; // Scale up by 5%
    } else {
      this.hoverScale = 1.0; // Reset scale
    }
  }
  
  /**
   * Move the card to a new position with animation
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   */
  moveTo(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }
  
  /**
   * Update card position for animation
   */
  update() {
    // Animate position if there's a target
    if (this.x !== this.targetX || this.y !== this.targetY) {
      this.x += (this.targetX - this.x) * 0.2;
      this.y += (this.targetY - this.y) * 0.2;
      
      // Snap to target if close enough
      if (Math.abs(this.x - this.targetX) < 0.5) this.x = this.targetX;
      if (Math.abs(this.y - this.targetY) < 0.5) this.y = this.targetY;
    }
  }
  
  /**
   * Helper method to round rectangle corners
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  
  /**
   * Darken a color for effects
   * @param {string} color - Hex color string
   * @param {number} percent - Amount to darken
   * @returns {string} Darkened hex color
   */
  darkenColor(color, percent) {
    // Convert hex to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    // Darken
    r = Math.max(0, r - percent);
    g = Math.max(0, g - percent);
    b = Math.max(0, b - percent);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * Lighten a color for effects
   * @param {string} color - Hex color string
   * @param {number} percent - Amount to lighten
   * @returns {string} Lightened hex color
   */
  lightenColor(color, percent) {
    // Convert hex to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    // Lighten
    r = Math.min(255, r + percent);
    g = Math.min(255, g + percent);
    b = Math.min(255, b + percent);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

export default AffirmationCard;