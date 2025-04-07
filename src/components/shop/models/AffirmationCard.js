/**
 * AffirmationCard.js - Represents an affirmation card in the shop
 * Enhanced with better scaling and positioning
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
    
    // State flags
    this.isSelected = false;
    this.isRevealed = false;
    this.isHovered = false;
    
    // Animation properties
    this.animationProgress = 0;
    this.hoverScale = 1;
    this.targetX = x;
    this.targetY = y;
    
    // Set scaling factor (default to 1)
    this.scale = 1;
    
    // Layout properties - store as ratios to maintain proportions
    this.layoutRatios = {
      cornerRadius: 0.06,     // Corner radius as ratio of card height
      tagWidthRatio: 0.8,     // Price tag width as ratio of card width
      tagHeightRatio: 0.12,   // Price tag height as ratio of card height
      tagBottomMargin: 0.06,  // Price tag bottom margin as ratio of card height
      heartSizeRatio: 0.28,   // Heart size as ratio of card height
      tulipSizeRatio: 0.12,   // Flower icon size as ratio of tag height
      questionMarkRatio: 0.4  // Question mark size as ratio of card height
    };
    
    // Store computed colors to avoid recalculation
    this.darkerColor = this.darkenColor(color, 30);
    this.lighterColor = this.lightenColor(color, 40);
  }
  
  /**
   * Draw the card with all its elements based on current state
   */
  draw() {
    const { context } = this;
    
    // Save context state
    context.save();
    
    // Apply scaling and transformations
    this.applyTransformations();
    
    // Draw the card base (background and border)
    this.drawCardBase();
    
    // Draw card content based on revealed state
    if (this.isRevealed) {
      this.drawMessage();
    } else {
      this.drawCardBack();
      this.drawPriceTag();
    }
    
    // Restore context state
    context.restore();
  }
  
  /**
   * Apply transformations based on card state
   */
  applyTransformations() {
    const { context, x, y, width, height, scale } = this;
    
    // Apply base scale and position
    context.translate(x + width/2, y + height/2);
    
    if (this.isSelected) {
      // Fixed scale of 1.1 for selected cards
      context.scale(1.1, 1.1);
    } else if (this.isHovered) {
      // Apply hover effect
      context.scale(this.hoverScale * scale, this.hoverScale * scale);
    } else {
      // Apply normal scaling
      context.scale(scale, scale);
    }
    
    // Move back to top-left as reference point
    context.translate(-(width/2), -(height/2));
  }
  
  /**
   * Draw the base card (background and border)
   */
  drawCardBase() {
    const { context, width, height, darkerColor, color } = this;
    
    // Calculate corner radius based on current card dimensions
    const cornerRadius = Math.min(width, height) * this.layoutRatios.cornerRadius;
    
    context.beginPath();
    this.roundRect(context, 0, 0, width, height, cornerRadius);
    context.fillStyle = color;
    context.fill();
    
    // Add a subtle border
    context.strokeStyle = darkerColor;
    context.lineWidth = Math.max(2, width * 0.01); // Ensure border is visible but proportional
    context.stroke();
    context.closePath();
  }
  
  /**
   * Draw the card back (when not revealed)
   */
  drawCardBack() {
    const { context, width, height, darkerColor, lighterColor } = this;
    
    // Draw a heart in the center with proportional sizing
    const heartSize = Math.min(width, height) * this.layoutRatios.heartSizeRatio;
    const heartX = width/2;
    const heartY = height/2;
    
    // Draw heart shape
    context.beginPath();
    context.moveTo(heartX, heartY + heartSize * 0.3);
    context.bezierCurveTo(
      heartX - heartSize * 0.5, heartY - heartSize * 0.3, 
      heartX - heartSize, heartY + heartSize * 0.3, 
      heartX, heartY + heartSize
    );
    context.bezierCurveTo(
      heartX + heartSize, heartY + heartSize * 0.3, 
      heartX + heartSize * 0.5, heartY - heartSize * 0.3, 
      heartX, heartY + heartSize * 0.3
    );
    context.fillStyle = darkerColor;
    context.fill();
    context.closePath();
    
    // Draw a question mark with proportional font size
    const questionMarkSize = Math.min(width, height) * this.layoutRatios.questionMarkRatio;
    context.font = `bold ${questionMarkSize}px Arial`;
    context.fillStyle = lighterColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText("?", heartX, heartY);
  }
  
  /**
   * Draw the affirmation message (when revealed)
   */
  drawMessage() {
    const { context, width, height, message } = this;
    
    // Calculate font size proportional to card dimensions
    const fontSize = Math.max(12, Math.min(width * 0.07, height * 0.05, 18));
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = "#333";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Define text area with margins
    const textMargin = width * 0.1;
    const textAreaWidth = width - (textMargin * 2);
    
    // Word wrap the message to fit the card
    const words = message.split(' ');
    const lineHeight = fontSize * 1.3; // Line height based on font size
    
    let line = '';
    let lines = [];
    
    // Build lines of text that fit within textAreaWidth
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = context.measureText(testLine);
      
      if (metrics.width > textAreaWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    
    // Add the final line
    lines.push(line);
    
    // Limit number of lines to fit in card
    const maxLines = Math.floor((height * 0.8) / lineHeight);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines - 1);
      lines.push("...");
    }
    
    // Draw each line of text, centered in the card
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2;
    
    lines.forEach((line, index) => {
      context.fillText(line.trim(), width/2, startY + index * lineHeight);
    });
  }
  
  /**
   * Draw the price tag at the bottom of the card
   */
  drawPriceTag() {
    const { context, width, height, price } = this;
    
    // Calculate tag dimensions based on card size and price digits
    const priceDigits = price.toString().length;
    const baseTagWidth = width * this.layoutRatios.tagWidthRatio;
    const tagWidth = Math.min(baseTagWidth, Math.max(width * 0.6, baseTagWidth + (priceDigits * width * 0.03)));
    const tagHeight = height * this.layoutRatios.tagHeightRatio;
    const tagX = (width - tagWidth) / 2;
    const tagY = height - tagHeight - (height * this.layoutRatios.tagBottomMargin);
    
    // Add drop shadow for depth
    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    context.shadowBlur = Math.max(3, height * 0.015);
    context.shadowOffsetX = Math.max(1, height * 0.007);
    context.shadowOffsetY = Math.max(1, height * 0.007);
    
    // Draw tag background with rounded corners
    const tagCornerRadius = Math.min(tagHeight / 2, width * 0.04);
    context.beginPath();
    this.roundRect(context, tagX, tagY, tagWidth, tagHeight, tagCornerRadius);
    
    // Create a gradient in the same color family
    const baseColor = this.darkenColor(this.color, 40);
    const gradient = context.createLinearGradient(tagX, tagY, tagX, tagY + tagHeight);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, this.darkenColor(baseColor, 20));
    
    context.fillStyle = gradient;
    context.fill();
    
    // Add a subtle border
    context.strokeStyle = this.darkenColor(this.color, 60);
    context.lineWidth = Math.max(1, width * 0.005);
    context.stroke();
    context.closePath();
    
    context.restore(); // End shadow effect
    
    // Calculate flower and text sizes based on tag dimensions
    const flowerSize = tagHeight * 0.6;
    const textSize = Math.min(tagHeight * 0.6, tagWidth * 0.15, 16);
    
    // Draw flower icon 
    this.drawPriceFlower(tagX + tagWidth * 0.25, tagY + tagHeight/2, flowerSize);
    
    // Draw price text
    context.font = `bold ${textSize}px Arial`;
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`${price}`, tagX + tagWidth * 0.55, tagY + tagHeight / 2);
  }
  
  /**
   * Draw a flower icon for the price tag
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} size - Icon size
   */
  drawPriceFlower(x, y, size) {
    const { context } = this;
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
    // Calculate the transformed card boundaries based on scale
    const centerX = this.x + this.width/2;
    const centerY = this.y + this.height/2;
    
    // Adjust scale based on hover/selection
    let effectiveScale = this.scale;
    if (this.isSelected) {
      effectiveScale *= 1.1;
    } else if (this.isHovered) {
      effectiveScale *= this.hoverScale;
    }
    
    // Calculate actual bounds with scaling
    const scaledWidth = this.width * effectiveScale;
    const scaledHeight = this.height * effectiveScale;
    const scaledX = centerX - scaledWidth/2;
    const scaledY = centerY - scaledHeight/2;
    
    return (
      pointX >= scaledX &&
      pointX <= scaledX + scaledWidth &&
      pointY >= scaledY &&
      pointY <= scaledY + scaledHeight
    );
  }
  
  /**
   * Select this card (for animation/UI)
   */
  select() {
    this.isSelected = true;
  }
  
  /**
   * Reveal the card message (after purchase)
   */
  reveal() {
    this.isRevealed = true;
  }
  
  /**
   * Set hover state and scale
   * @param {boolean} isHovered - Whether card is being hovered over
   */
  setHovered(isHovered) {
    this.isHovered = isHovered;
    this.hoverScale = isHovered ? 1.05 : 1.0;
  }
  
  /**
   * Set target position for smooth movement
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   */
  moveTo(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }
  
  /**
   * Update card position with smooth animation
   */
  update() {
    // Smooth movement toward target position
    if (this.x !== this.targetX || this.y !== this.targetY) {
      // Calculate movement speed based on distance
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Use proportional speed for smoother animation
      const speed = Math.max(0.1, Math.min(0.3, distance / 50));
      
      this.x += dx * speed;
      this.y += dy * speed;
      
      // Snap to target when very close to avoid tiny movements
      if (Math.abs(this.x - this.targetX) < 0.5) this.x = this.targetX;
      if (Math.abs(this.y - this.targetY) < 0.5) this.y = this.targetY;
    }
  }
  
  /**
   * Helper method to draw rounded rectangle corners
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   */
  roundRect(ctx, x, y, width, height, radius) {
    // Ensure radius isn't too large for the rectangle
    const safeRadius = Math.min(radius, Math.min(width, height) / 2);
    
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
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
    
    // Convert back to hex with padding
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
    
    // Convert back to hex with padding
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

export default AffirmationCard;