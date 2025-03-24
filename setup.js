// ES6 version of setup.js
// Get canvas and context
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Set canvas size based on window dimensions
const setCanvasSize = () => {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
};

setCanvasSize();

// Configuration object holding layout and sizing data for each component
const configuration = {
  sky: {
    width: canvas.width,
    height: canvas.height
  },
  sun: {
    x: canvas.width * 0.75,
    y: canvas.height * 0.2,
    radius: canvas.height * 0.06
  },
  clouds: [
    { x: canvas.width * 0.1, y: canvas.height * 0.15, size: canvas.height * 0.03, speed: 0.1 },
    { x: canvas.width * 0.3, y: canvas.height * 0.25, size: canvas.height * 0.04, speed: 0.05 },
    { x: canvas.width * 0.6, y: canvas.height * 0.1, size: canvas.height * 0.035, speed: 0.07 },
    { x: canvas.width * 0.8, y: canvas.height * 0.3, size: canvas.height * 0.025, speed: 0.12 }
  ],
  stickfigure: {
    x: 10 + (canvas.height * 0.05),
    y: canvas.height * 0.575,
    color: "#FF69B4", // Hot pink for a girly look
    tickness: 3,
    radius: canvas.height * 0.05
  },
  ground: {
    x: 0,
    y: canvas.height * 0.8,
    height: canvas.height * 0.2,
    width: canvas.width
  }
};

// Factory functions for creating each component using ES6 imports
import Sky from './sky.js';
import Sun from './sun.js';
import Cloud from './cloud.js';
import Stickfigure from './stickfigure.js';
import Ground from './ground.js';

const createSky = () => new Sky(context, canvas.width, canvas.height);

const createSun = () => {
  const { x, y, radius } = configuration.sun;
  return new Sun(context, x, y, radius);
};

const createClouds = () => {
  return configuration.clouds.map(({ x, y, size, speed }) => 
    new Cloud(context, x, y, size, speed)
  );
};

const createStickfigure = () => {
  const { x, y, color, tickness, radius } = configuration.stickfigure;
  return new Stickfigure(context, x, y, color, tickness, radius);
};

const createGround = () => {
  const { x, y, height, width } = configuration.ground;
  return new Ground(context, x, y, height, width);
};

// Create game components using the factory functions
let sky = createSky();
let sun = createSun();
let clouds = createClouds();
let stickfigure = createStickfigure();
let ground = createGround();

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
  
  setCanvasSize();
  
  // Update configuration values based on the new canvas size
  Object.assign(configuration.sky, {
    width: canvas.width,
    height: canvas.height
  });
  
  Object.assign(configuration.sun, {
    x: canvas.width * 0.75,
    y: canvas.height * 0.2,
    radius: canvas.height * 0.06
  });
  
  configuration.clouds = [
    { x: canvas.width * 0.1, y: canvas.height * 0.15, size: canvas.height * 0.03, speed: 0.1 },
    { x: canvas.width * 0.3, y: canvas.height * 0.25, size: canvas.height * 0.04, speed: 0.05 },
    { x: canvas.width * 0.6, y: canvas.height * 0.1, size: canvas.height * 0.035, speed: 0.07 },
    { x: canvas.width * 0.8, y: canvas.height * 0.3, size: canvas.height * 0.025, speed: 0.12 }
  ];
  
  Object.assign(configuration.stickfigure, {
    x: 10 + (canvas.height * 0.05),
    y: canvas.height * 0.575,
    radius: canvas.height * 0.05
  });
  
  Object.assign(configuration.ground, {
    y: canvas.height * 0.8,
    height: canvas.height * 0.2,
    width: canvas.width
  });
  
  // Recreate components with updated configuration values
  sky = createSky();
  sun = createSun();
  clouds = createClouds();
  stickfigure = createStickfigure();
  ground = createGround();
  
  // Update the game instance if it exists
  if (window.game) {
    window.game.components = {
      sky,
      sun,
      clouds,
      ground,
      stickfigure
    };
    
    // Restore the worldOffset to maintain scroll position
    window.game.worldOffset = previousWorldOffset;
    
    // Restore walking state
    window.game.isWalking = wasWalking;
    if (window.game.components.stickfigure) {
      window.game.components.stickfigure.isWalking = wasWalking;
    }
    
    // Restart the game with updated components
    window.game.restart();
  }
  
  // Import and use updateButtonPositions after resizing
  import('./controls.js').then(module => {
    const { updateButtonPositions } = module;
    updateButtonPositions();
  });
};

// Use debounced version for the resize event
window.addEventListener("resize", debounce(resizeCanvas, 250));

// Export for use in other modules
export { 
  canvas, 
  context, 
  sky, 
  sun, 
  clouds, 
  ground, 
  stickfigure,
  configuration
};