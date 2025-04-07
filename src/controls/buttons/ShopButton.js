/**
 * ShopButton.js - Button for opening the affirmation shop
 * Enhanced with disabled state support
 */
import BaseButton from './BaseButton.js';

export default class ShopButton extends BaseButton {
  /**
   * Create a new shop button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Button width
   * @param {number} height - Button height
   */
  constructor(x = 0, y = 0, width = 100, height = 50) {
    // Use a softer lavender color theme
    super(x, y, width, height, "#E3D1F4", "#D1B9E3", "Shop");
    
    // Add disabled state property
    this.isDisabled = false;
    this.disabledColor = "#A0A0A0"; // Gray color for disabled state
    this.disabledTextColor = "#666666";
  }
  
  /**
   * Generate decorative elements for the shop button
   * @returns {Array} Array of decoration objects
   */
  generateDecorations() {
    // Get base decorations from parent class
    const decorations = super.generateDecorations();
    
    // Add heart decoration specific to shop button
    decorations.push({
      type: 'heart',
      x: this.width * 0.2,  // Position at 20% from left
      y: this.height * 0.5, // Center vertically
      size: this.height * 0.2  // Size proportional to button height
    });
    
    return decorations;
  }
  
  /**
   * Override contains method to handle disabled state
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @returns {boolean} True if point is inside button and button is not disabled
   */
  contains(x, y) {
    // If disabled, never register as being clicked/hovered
    if (this.isDisabled) {
      return false;
    }
    
    // Use the base implementation for normal state
    return super.contains(x, y);
  }
  
  /**
   * Get current button color based on state
   * @returns {string} Current button color
   */
  getCurrentColor() {
    if (this.isDisabled) {
      return this.disabledColor;
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
   * Get current text color based on state
   * @returns {string} Current text color
   */
  getCurrentTextColor() {
    if (this.isDisabled) {
      return this.disabledTextColor;
    }
    
    return this.textColor;
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