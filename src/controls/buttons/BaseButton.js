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
     * @returns {boolean} True if point is inside button
     */
    contains(x, y) {
      return (
        x >= this.x &&
        x <= this.x + this.width &&
        y >= this.y &&
        y <= this.y + this.height
      );
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