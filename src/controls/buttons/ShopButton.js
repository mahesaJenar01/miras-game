/**
 * ShopButton.js - Button for opening the affirmation shop
 * Simplified with clearer decoration generation
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
}