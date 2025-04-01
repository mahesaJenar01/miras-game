/**
 * AffirmationCard.js - Represents an affirmation card in the shop
 * Contains a sweet message for the girlfriend
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
     */
    constructor(context, x, y, width, height, message, color = "#F8E1EC") {
      this.context = context;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.message = message;
      this.color = color;
      this.isSelected = false;
      this.isRevealed = false;
      this.animationProgress = 0;
      this.cornerRadius = 10;
      this.targetX = x; // For animation
      this.targetY = y; // For animation
    }
    
    /**
     * Draw the card
     */
    draw() {
      const { context, x, y, width, height, cornerRadius } = this;
      
      // Save context state
      context.save();
      
      // Apply scale animation if selected
      if (this.isSelected) {
        const scale = 1 + (this.animationProgress * 0.2);
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
          // Reveal the message after animation completes
          this.reveal();
        } else {
          // Continue animation
          requestAnimationFrame(() => this.animate());
        }
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