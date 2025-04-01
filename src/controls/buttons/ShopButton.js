/**
 * ShopButton.js - Button for opening the affirmation shop
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
    super(x, y, width, height, "#E3D1F4", "#D1B9E3", "Shop");
  }
  
  /**
   * Generate decorative elements for the shop button
   * @returns {Array} Array of decoration objects
   */
  generateDecorations() {
    const decorations = super.generateDecorations();
    
    // Add special shop button decoration - small heart
    decorations.push({
      type: 'heart',
      x: this.width * 0.2,
      y: this.height * 0.5,
      size: this.height * 0.2
    });
    
    return decorations;
  }
}