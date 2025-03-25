import BaseButton from './BaseButton.js';

/**
 * MoveButton - Button for triggering movement
 */
export default class MoveButton extends BaseButton {
  /**
   * Create a new move button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Button width
   * @param {number} height - Button height
   */
  constructor(x = 0, y = 0, width = 100, height = 50) {
    super(x, y, width, height, "#B5EAD7", "#9EDAC4", "Move");
  }
  
  /**
   * Generate decorative elements for the move button
   * @returns {Array} Array of decoration objects
   */
  generateDecorations() {
    const decorations = super.generateDecorations();
    
    // Add special move button decoration - small arrow
    decorations.push({
      type: 'arrow',
      x: this.width * 0.2,
      y: this.height * 0.5
    });
    
    return decorations;
  }
}