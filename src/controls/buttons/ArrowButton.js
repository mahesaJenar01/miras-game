/**
 * ArrowButton.js - Navigation button for card collection
 * Extends BaseButton with arrow styling and direction support
 */
import BaseButton from './BaseButton.js';

export default class ArrowButton extends BaseButton {
  /**
   * Create a new arrow button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Button width
   * @param {number} height - Button height
   * @param {string} direction - Direction ('left' or 'right')
   */
  constructor(x = 0, y = 0, width = 50, height = 50, direction = 'right') {
    // Use much brighter colors for better visibility
    super(x, y, width, height, "#FF9AA2", "#FF7E86", "");
    
    // Store direction for rendering
    this.direction = direction; // 'left' or 'right'
    
    // Override inherited properties for circular shape
    this.cornerRadius = width / 2; // Make it fully rounded
  }
  
  /**
   * Generate decorative elements for the arrow button
   * @returns {Array} Array of decoration objects
   */
  generateDecorations() {
    // No decorations needed besides the arrow itself
    return [];
  }
  
  /**
   * Get current button color based on state
   * @returns {string} Current button color
   */
  getCurrentColor() {
    if (this.isDisabled) {
      return "#A0A0A0"; // Gray for disabled state
    }
    
    if (this.isPressed) {
      // Darken normal color when pressed
      return this.darkenColor(this.color, 30);
    } else if (this.isHovered) {
      return this.hoverColor;
    }
    
    return this.color;
  }
  
  /**
   * Draw arrow shape
   * @param {CanvasRenderingContext2D} context - The context to draw on
   */
  drawArrow(context) {
    const arrowSize = this.width * 0.25;
    
    // Draw arrow based on direction
    context.beginPath();
    
    if (this.direction === 'left') {
      // Left-pointing arrow
      context.moveTo(this.width * 0.6, this.height * 0.3);
      context.lineTo(this.width * 0.4, this.height * 0.5);
      context.lineTo(this.width * 0.6, this.height * 0.7);
    } else {
      // Right-pointing arrow
      context.moveTo(this.width * 0.4, this.height * 0.3);
      context.lineTo(this.width * 0.6, this.height * 0.5);
      context.lineTo(this.width * 0.4, this.height * 0.7);
    }
    
    context.strokeStyle = "#333333";
    context.lineWidth = Math.max(2, this.width * 0.06);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    context.closePath();
  }
  
  /**
   * Helper function to darken a color for effects
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
}