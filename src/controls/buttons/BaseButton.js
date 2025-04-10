/**
 * BaseButton - Base class for all canvas buttons
 * Handles common button properties and methods
 */
export default class BaseButton {
    /**
     * Create a new button
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {string} color - Button color
     * @param {string} hoverColor - Button hover color
     * @param {string} text - Button text
     */
    constructor(x = 0, y = 0, width = 100, height = 50, color = "#B5EAD7", hoverColor = "#9EDAC4", text = "Button") {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.hoverColor = hoverColor;
      this.text = text;
      this.isHovered = false;
      this.isPressed = false;
      this.cornerRadius = Math.max(4, height * 0.2);
      this.textColor = "#333";
      this.font = `bold ${Math.max(10, Math.min(20, height * 0.4))}px Arial`;
      this.decorations = this.generateDecorations();
      
      // Add isDisabled property to ALL buttons
      this.isDisabled = false;
    }
    
    /**
     * Generate decorative elements for the button
     * @returns {Array} Array of decoration objects
     */
    generateDecorations() {
      const decorations = [];
      
      // Size scaled to button height with min/max constraints
      const decorSize = Math.max(4, Math.min(10, this.height * 0.15));
      
      // Add small decorative flower in the corner
      decorations.push({
        type: 'flower',
        x: this.width * 0.85,
        y: this.height * 0.25,
        size: decorSize,
        color: this.getComplementaryColor(this.color)
      });
      
      return decorations;
    }
    
    /**
     * Get a complementary color for decorations
     * @param {string} color - The base color
     * @returns {string} A complementary color
     */
    getComplementaryColor(color) {
      // Simple way to get a complementary color - using predetermined pairs
      const colorMap = {
        "#B5EAD7": "#FF9AA2", // Mint green -> Light pink
        "#C7CEEA": "#FFDAC1", // Light blue -> Light peach
        "#FFDAC1": "#C7CEEA", // Light peach -> Light blue
        "#FFB7B2": "#B5EAD7"  // Pastel pink -> Mint green
      };
      
      return colorMap[color] || "#FF9AA2"; // Default to light pink if no match
    }
    
    /**
     * Check if a point is inside the button
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean} True if point is inside button and button is not disabled
     */
    contains(x, y) {
      // First check if button is disabled - NEVER register clicks on disabled buttons
      if (this.isDisabled) {
        return false;
      }
      
      // Then do the normal bounds check
      return (
        x >= this.x &&
        x <= this.x + this.width &&
        y >= this.y &&
        y <= this.y + this.height
      );
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
     * Get current text color based on state
     * @returns {string} Current text color
     */
    getCurrentTextColor() {
      if (this.isDisabled) {
        return "#666666";
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
    
    /**
     * Update button position and size
     * @param {number} x - New X position
     * @param {number} y - New Y position
     * @param {number} width - New width (optional)
     * @param {number} height - New height (optional)
     */
    updatePosition(x, y, width = null, height = null) {
      this.x = x;
      this.y = y;
      
      if (width !== null) {
        this.width = width;
      }
      
      if (height !== null) {
        this.height = height;
        this.cornerRadius = Math.max(4, height * 0.2);
        this.font = `bold ${Math.max(10, Math.min(20, height * 0.4))}px Arial`;
        
        // Regenerate decorations when size changes
        this.decorations = this.generateDecorations();
      }
    }
    
    /**
     * Set button hover state
     * @param {boolean} isHovered - Whether button is hovered
     */
    setHovered(isHovered) {
      this.isHovered = isHovered;
    }
    
    /**
     * Set button pressed state
     * @param {boolean} isPressed - Whether button is pressed
     */
    setPressed(isPressed) {
      this.isPressed = isPressed;
    }
  }