/**
 * config.js - Configuration for scene elements
 * Centralizes all scene-related settings
 */

/**
 * Create scene configuration based on canvas dimensions
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 * @returns {Object} Configuration object for Scene
 */
const createSceneConfig = (canvasWidth, canvasHeight) => {
    return {
      // Sky configuration
      sky: {
        width: canvasWidth,
        height: canvasHeight,
        colors: {
          top: "#C9D9FB",    // Light blue
          middle: "#E3D1F4",  // Soft lavender
          bottom: "#F8E1EC"   // Light pink
        }
      },
      
      // Sun configuration
      sun: {
        x: canvasWidth * 0.75,
        y: canvasHeight * 0.2,
        radius: canvasHeight * 0.06,
        color: "#FFD166",  // Warm yellow
        glowColor: "rgba(255, 209, 102, 0.3)"
      },
      
      // Cloud configuration
      clouds: [
        { 
          x: canvasWidth * 0.1, 
          y: canvasHeight * 0.15, 
          size: canvasHeight * 0.03, 
          speed: 0.1 
        },
        { 
          x: canvasWidth * 0.3, 
          y: canvasHeight * 0.25, 
          size: canvasHeight * 0.04, 
          speed: 0.05 
        },
        { 
          x: canvasWidth * 0.6, 
          y: canvasHeight * 0.1, 
          size: canvasHeight * 0.035, 
          speed: 0.07 
        },
        { 
          x: canvasWidth * 0.8, 
          y: canvasHeight * 0.3, 
          size: canvasHeight * 0.025, 
          speed: 0.12 
        }
      ],
      
      // Ground configuration
      ground: {
        x: 0,
        y: canvasHeight * 0.8,
        height: canvasHeight * 0.2,
        width: canvasWidth,
        grassColors: ["#A9DE9F", "#B9E4AA", "#C9EBB5"],
        dirtColors: ["#D9BFA9", "#E3CAB1", "#F0DDCA"],
        flowerColors: ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#F7C8E0"]
      },
      
      // Scenery configuration (overall settings)
      scenery: {
        parallaxStrength: 1.0,  // How strong the parallax effect is
        timeOfDay: "day",       // Could be "day", "sunset", "night"
        weather: "clear"        // Could be "clear", "cloudy", "rainy"
      }
    };
  };
  
  /**
   * Update configuration when canvas is resized
   * @param {Object} config - Current configuration
   * @param {number} canvasWidth - New canvas width
   * @param {number} canvasHeight - New canvas height
   * @returns {Object} Updated configuration
   */
  const updateConfigForResize = (config, canvasWidth, canvasHeight) => {
    // Create a new config with updated dimensions
    const newConfig = createSceneConfig(canvasWidth, canvasHeight);
    
    // Maintain certain settings from the previous config
    if (config) {
      // Keep scenery settings
      newConfig.scenery = { ...config.scenery };
      
      // Keep relative cloud speeds
      newConfig.clouds.forEach((cloud, i) => {
        if (config.clouds[i]) {
          cloud.speed = config.clouds[i].speed;
        }
      });
    }
    
    return newConfig;
  };
  
  export { 
    createSceneConfig,
    updateConfigForResize
  };