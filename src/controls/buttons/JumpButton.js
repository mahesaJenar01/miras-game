import BaseButton from './BaseButton.js';

/**
 * JumpButton - Button for triggering jumps
 */
export default class JumpButton extends BaseButton {
  /**
   * Create a new jump button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Button width
   * @param {number} height - Button height
   */
  constructor(x = 0, y = 0, width = 100, height = 50) {
    super(x, y, width, height, "#C7CEEA", "#B1BAE4", "Jump");
  }
  
  /**
   * Generate decorative elements for the jump button
   * @returns {Array} Array of decoration objects
   */
  generateDecorations() {
    const decorations = super.generateDecorations();
    
    // Add special jump button decoration - upward arrow
    decorations.push({
      type: 'upArrow',
      x: this.width * 0.2,
      y: this.height * 0.5
    });
    
    return decorations;
  }
}