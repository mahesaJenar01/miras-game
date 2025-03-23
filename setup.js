const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

function setCanvasSize() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
}

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
    x: 10 + (canvas.height * 0.05), // Use height directly instead of offsetHeight
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

// Factory functions for creating each component
function createSky(context, canvas) {
  return new Sky(context, canvas.width, canvas.height);
}

function createSun(context, canvas) {
  const { x, y, radius } = configuration.sun;
  return new Sun(context, x, y, radius);
}

function createClouds(context, canvas) {
  const cloudsArray = [];
  configuration.clouds.forEach(cloudConfig => {
    cloudsArray.push(new Cloud(context, cloudConfig.x, cloudConfig.y, cloudConfig.size, cloudConfig.speed));
  });
  return cloudsArray;
}

function createStickfigure(context, canvas) {
  const stickConfig = configuration.stickfigure;
  return new Stickfigure(
    context,
    stickConfig.x,
    stickConfig.y,
    stickConfig.color,
    stickConfig.tickness,
    stickConfig.radius
  );
}

function createGround(context, canvas) {
  const groundConfig = configuration.ground;
  return new Ground(
    context,
    groundConfig.x,
    groundConfig.y,
    groundConfig.height,
    groundConfig.width
  );
}

// Create game components using the factory functions
let sky = createSky(context, canvas);
let sun = createSun(context, canvas);
let clouds = createClouds(context, canvas);
let stickfigure = createStickfigure(context, canvas);
let ground = createGround(context, canvas);

// Debounce function to prevent multiple rapid resize events
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Update components when the window is resized
function resizeCanvas() {
  // Store previous worldOffset if game exists
  const previousWorldOffset = window.game ? window.game.worldOffset : 0;
  const wasWalking = window.game ? window.game.isWalking : false;
  
  setCanvasSize();
  
  // Update configuration values based on the new canvas size
  configuration.sky.width = canvas.width;
  configuration.sky.height = canvas.height;
  
  configuration.sun.x = canvas.width * 0.75;
  configuration.sun.y = canvas.height * 0.2;
  configuration.sun.radius = canvas.height * 0.06;
  
  configuration.clouds = [
    { x: canvas.width * 0.1, y: canvas.height * 0.15, size: canvas.height * 0.03, speed: 0.1 },
    { x: canvas.width * 0.3, y: canvas.height * 0.25, size: canvas.height * 0.04, speed: 0.05 },
    { x: canvas.width * 0.6, y: canvas.height * 0.1, size: canvas.height * 0.035, speed: 0.07 },
    { x: canvas.width * 0.8, y: canvas.height * 0.3, size: canvas.height * 0.025, speed: 0.12 }
  ];
  
  configuration.stickfigure.x = 10 + (canvas.height * 0.05);
  configuration.stickfigure.y = canvas.height * 0.575;
  configuration.stickfigure.radius = canvas.height * 0.05;
  
  configuration.ground.y = canvas.height * 0.8;
  configuration.ground.height = canvas.height * 0.2;
  configuration.ground.width = canvas.width;
  
  // Recreate components with updated configuration values
  sky = createSky(context, canvas);
  sun = createSun(context, canvas);
  clouds = createClouds(context, canvas);
  stickfigure = createStickfigure(context, canvas);
  ground = createGround(context, canvas);
  
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
  }
  
  // Update button positions after resizing
  if (typeof updateButtonPositions === 'function') {
    updateButtonPositions();
  }
}

// Use debounced version for the resize event
window.addEventListener("resize", debounce(resizeCanvas, 250));