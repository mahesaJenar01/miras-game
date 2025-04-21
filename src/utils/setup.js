/**
 * setup.js - Sets up canvas and creates modular scene and characters
 * Updated to use the event system and dynamic canvas sizing
 */
import { createSceneConfig, updateConfigForResize } from '../scene/config.js';
import Scene from '../scene/Scene.js';
import StickFigure from '../components/character/StickFigure.js';
import GameEvents from '../events/GameEvents.js';
import { GAME_EVENTS } from '../events/EventTypes.js';

// Get canvas and context
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Set canvas size to fill the entire window
const setCanvasSize = () => {
  // Get window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Set canvas to exact window size
  canvas.width = windowWidth;
  canvas.height = windowHeight;
  
  // Optional: maintain aspect ratio if needed
  const aspectRatio = 16 / 9; // Example 16:9 aspect ratio
  
  if (windowWidth / windowHeight > aspectRatio) {
    // Window is wider than the aspect ratio
    canvas.width = windowHeight * aspectRatio;
    canvas.height = windowHeight;
  } else {
    // Window is taller than the aspect ratio
    canvas.width = windowWidth;
    canvas.height = windowWidth / aspectRatio;
  }
  
  // Ensure canvas is centered
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
};

// Initial canvas setup
setCanvasSize();

// Recalculate canvas size on window resize
window.addEventListener('resize', () => {
  setCanvasSize();
  
  // Emit resize event for game components
  GameEvents.emitGame(GAME_EVENTS.RESIZE, {
    width: canvas.width,
    height: canvas.height,
    radius: Math.min(canvas.width, canvas.height) * 0.05 // Proportional radius
  });
});

// Create configuration for components using dimensions
const createConfiguration = () => {
  // Create scene configuration
  const sceneConfig = createSceneConfig(canvas.width, canvas.height);
  
  // Character configuration (stickfigure)
  const stickfigureConfig = {
    x: 10 + (canvas.height * 0.05),
    y: canvas.height * 0.475,
    color: "#FF69B4", // Hot pink for a girly look
    tickness: 3,
    radius: Math.min(canvas.width, canvas.height) * 0.05
  };
  
  return {
    scene: sceneConfig,
    stickfigure: stickfigureConfig
  };
};

// Initialize configuration
let configuration = createConfiguration();

// Factory functions for creating components
const createScene = () => {
  return new Scene(context, canvas, configuration.scene);
};

const createStickfigure = () => {
  const { x, y, color, tickness, radius } = configuration.stickfigure;
  return new StickFigure(context, x, y, color, tickness, radius);
};

// Create game components using the factory functions
let scene = createScene();
let stickfigure = createStickfigure();

// Debounce function to prevent multiple rapid resize events
const debounce = (func, wait) => {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
};

// Update components when the window is resized
const resizeCanvas = () => {
  // Store previous worldOffset if game exists
  const previousWorldOffset = window.game ? window.game.worldOffset : 0;
  const wasWalking = window.game ? window.game.isWalking : false;
  
  // Resize canvas through the already defined setCanvasSize function
  setCanvasSize();
  
  // Update configuration based on new dimensions
  configuration = createConfiguration();
  
  // Emit resize event before creating new components
  GameEvents.emitGame(GAME_EVENTS.RESIZE, {
    width: canvas.width,
    height: canvas.height,
    config: configuration,
    radius: configuration.stickfigure.radius
  });
  
  // Recreate components with updated configuration
  scene = createScene();
  stickfigure = createStickfigure();
  
  // Update the game instance if it exists
  if (window.game) {
    window.game.setComponents({
      scene,
      stickfigure
    });
    
    // Restore the worldOffset to maintain scroll position
    window.game.worldOffset = previousWorldOffset;
    
    // Emit world update event with restored offset
    GameEvents.emitGame(GAME_EVENTS.WORLD_UPDATE, {
      worldOffset: previousWorldOffset
    });
    
    // Restore walking state
    if (wasWalking) {
      window.game.isWalking = true;
      if (window.game.components.stickfigure) {
        window.game.components.stickfigure.isWalking = true;
      }
    }
    
    // Restart the game with updated components
    window.game.restart();
  }
};

// Use debounced version for the resize event
window.addEventListener("resize", debounce(resizeCanvas, 250));

// Export for use in other modules
export { 
  canvas, 
  context, 
  scene, 
  stickfigure,
  configuration
};