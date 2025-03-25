/**
 * Base Component class that all game components should extend
 * Provides common interface and functionality for all components
 */
class Component {
    /**
     * Create a new component
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {Object} config - Configuration options for the component
     */
    constructor(context, config = {}) {
      this.context = context;
      this.config = config;
      this.isActive = true;
      this.children = [];
      this.initialize();
    }
  
    /**
     * Initialize the component (to be overridden by subclasses)
     */
    initialize() {
      // Override in subclass
    }
  
    /**
     * Add a child component
     * @param {Component} child - The child component to add
     * @returns {Component} The added child component
     */
    addChild(child) {
      this.children.push(child);
      return child;
    }
  
    /**
     * Remove a child component
     * @param {Component} child - The child component to remove
     * @returns {boolean} True if the child was removed
     */
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
        return true;
      }
      return false;
    }
  
    /**
     * Update component state (to be overridden by subclasses)
     * @param {number} deltaTime - Time elapsed since last update in ms
     */
    update(deltaTime) {
      if (!this.isActive) return;
      
      // Update all children
      for (const child of this.children) {
        child.update(deltaTime);
      }
    }
  
    /**
     * Draw the component (to be overridden by subclasses)
     */
    draw() {
      if (!this.isActive) return;
      
      // Draw all children
      for (const child of this.children) {
        child.draw();
      }
    }
  
    /**
     * Reset the component to its initial state
     */
    reset() {
      // Override in subclass
      
      // Reset all children
      for (const child of this.children) {
        child.reset();
      }
    }
  
    /**
     * Destroy the component and clean up resources
     */
    destroy() {
      this.isActive = false;
      
      // Destroy all children
      for (const child of this.children) {
        child.destroy();
      }
      
      this.children = [];
    }
  }
  
  export default Component;