/**
 * RestartButton.js - Button for restarting the game after game over
 * Extends BaseButton with specific styling and behavior for restart functionality
 */
import BaseButton from './BaseButton.js';

export default class RestartButton extends BaseButton {
  /**
   * Create a new restart button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Button width
   * @param {number} height - Button height
   */
  constructor(x = 0, y = 0, width = 150, height = 60) {
    // Use bright green color scheme for restart
    super(x, y, width, height, "#4CAF50", "#66BB6A", "Restart");
    
    // Override inherited properties for more visibility
    this.textColor = "#FFFFFF";
    this.font = `bold ${Math.max(16, Math.min(24, height * 0.4))}px Arial`;
    this.cornerRadius = Math.max(8, height * 0.2);
    
    // Visibility flag - only show when game is over
    this.visible = false;
  }
  
  /**
   * Generate decorative elements for the restart button
   * @returns {Array} Array of decoration objects
   */
  generateDecorations() {
    const decorations = super.generateDecorations();
    
    // Add restart icon
    decorations.push({
      type: 'restart',
      x: this.width * 0.2,
      y: this.height * 0.5,
      size: this.height * 0.3
    });
    
    return decorations;
  }
  
  /**
   * Override contains method to handle visibility
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @returns {boolean} True if point is inside button and button is visible
   */
  contains(x, y) {
    // Only detect clicks when visible
    if (!this.visible) {
      return false;
    }
    
    // Use the base implementation for normal state
    return super.contains(x, y);
  }
  
  /**
   * Set button visibility
   * @param {boolean} visible - Whether button should be visible
   */
  setVisible(visible) {
    this.visible = visible;
  }
  
  /**
   * Get current button color based on state
   * @returns {string} Current button color
   */
  getCurrentColor() {
    if (this.isPressed) {
      // Darken normal color when pressed
      return this.darkenColor(this.color, 30);
    } else if (this.isHovered) {
      return this.hoverColor;
    }
    
    return this.color;
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