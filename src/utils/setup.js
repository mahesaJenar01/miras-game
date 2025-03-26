/**
 * setup.js - Sets up canvas and creates modular scene and characters
 * Updated to use the event system
 */
import { createSceneConfig, updateConfigForResize } from '../scene/config.js';
import Scene from '../scene/Scene.js';
import StickFigure from '../components/character/StickFigure.js';
import GameEvents from '../events/GameEvents.js';
import { GAME_EVENTS } from '../events/EventTypes.js';

// Get canvas and context
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Set canvas size based on window dimensions
const setCanvasSize = () => {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
};

// Initial canvas setup
setCanvasSize();

// Create configuration for components using dimensions
const createConfiguration = () => {
  // Create scene configuration
  const sceneConfig = createSceneConfig(canvas.width, canvas.height);
  
  // Character configuration (stickfigure)
  const stickfigureConfig = {
    x: 10 + (canvas.height * 0.05),
    y: canvas.height * 0.575,
    color: "#FF69B4", // Hot pink for a girly look
    tickness: 3,
    radius: canvas.height * 0.05
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
  
  // Resize canvas
  setCanvasSize();
  
  // Update configuration based on new dimensions
  configuration = {
    scene: updateConfigForResize(configuration.scene, canvas.width, canvas.height),
    stickfigure: {
      x: 10 + (canvas.height * 0.05),
      y: canvas.height * 0.575,
      color: "#FF69B4",
      tickness: 3,
      radius: canvas.height * 0.05
    }
  };
  
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