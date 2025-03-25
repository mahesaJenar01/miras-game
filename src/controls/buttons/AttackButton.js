import BaseButton from './BaseButton.js';

/**
 * AttackButton - Button for triggering attacks
 * Includes cooldown visualization
 */
export default class AttackButton extends BaseButton {
  /**
   * Create a new attack button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Button width
   * @param {number} height - Button height
   */
  constructor(x = 0, y = 0, width = 100, height = 50) {
    super(x, y, width, height, "#FFDAC1", "#FFCBAA", "Attack");
    this.cooldownPercent = 0;
    this.isAttacking = false;
  }
  
  /**
   * Generate decorative elements for the attack button
   * @returns {Array} Array of decoration objects
   */
  generateDecorations() {
    const decorations = super.generateDecorations();
    
    // Add special attack button decoration - small star
    decorations.push({
      type: 'star',
      x: this.width * 0.2,
      y: this.height * 0.5,
      size: this.height * 0.2
    });
    
    return decorations;
  }
  
  /**
   * Set cooldown percentage (0 to 1)
   * @param {number} percent - Cooldown percentage
   */
  setCooldown(percent) {
    this.cooldownPercent = Math.max(0, Math.min(1, percent));
  }
  
  /**
   * Set attacking state for visual feedback
   * @param {boolean} isAttacking - Whether button is in attacking state
   */
  setAttacking(isAttacking) {
    this.isAttacking = isAttacking;
    
    // Auto-reset after a short time
    if (isAttacking) {
      setTimeout(() => {
        this.isAttacking = false;
      }, 300);
    }
  }
}