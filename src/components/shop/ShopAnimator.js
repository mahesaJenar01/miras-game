/**
 * ShopAnimator.js - Manages animations for the shop
 * Centralizes animation state and timing
 */
class ShopAnimator {
    /**
     * Create a new shop animator
     */
    constructor() {
      // Animation state
      this.animating = false;
      this.animationType = null; // 'open', 'card_select', etc.
      
      // Animation progress (0-1)
      this.progress = 0;
      
      // Animation timing
      this.animationSpeed = 0.05; // Progress increment per frame
      this.animationDuration = 20; // Frames at 60fps
    }
    
    /**
     * Start opening animation
     */
    startOpenAnimation() {
      this.animating = true;
      this.animationType = 'open';
      this.progress = 0;
    }
    
    /**
     * Start card selection animation
     */
    startCardSelectAnimation() {
      this.animating = true;
      this.animationType = 'card_select';
      this.progress = 0;
    }
    
    /**
     * Start purchase animation
     * @param {string} result - Animation result ('success' or 'failure')
     */
    startPurchaseAnimation(result) {
      this.animating = true;
      this.animationType = `purchase_${result}`;
      this.progress = 0;
      
      // Set duration based on result
      this.animationDuration = result === 'success' ? 45 : 60;
    }
    
    /**
     * Check if animations are currently running
     * @returns {boolean} True if animating
     */
    isAnimating() {
      return this.animating;
    }
    
    /**
     * Get the current animation progress
     * @returns {number} Animation progress (0-1)
     */
    getProgress() {
      return this.progress;
    }
    
    /**
     * Get the current animation type
     * @returns {string|null} Animation type or null if not animating
     */
    getAnimationType() {
      return this.animating ? this.animationType : null;
    }
    
    /**
     * Update animation state
     */
    update() {
      if (this.animating) {
        // Increment progress
        this.progress += this.animationSpeed;
        
        // Check if animation is complete
        if (this.progress >= 1) {
          this.progress = 1;
          this.animating = false;
        }
      }
    }
    
    /**
     * Reset the animator to its initial state
     */
    reset() {
      this.animating = false;
      this.animationType = null;
      this.progress = 0;
    }
  }
  
  export default ShopAnimator;