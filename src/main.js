/**
 * main.js - Main game entry point
 * Updated to use the event communication system
 */
import ButtonSystem from './controls/ButtonSystem.js';
import { canvas, context, scene, stickfigure } from './utils/setup.js';
import Attacker from './components/character/Attacker.js';
import GameEvents from './events/GameEvents.js';
import { GAME_EVENTS, CHARACTER_EVENTS } from './events/EventTypes.js';

class Game {
  /**
   * Creates a new Game instance.
   * @param {CanvasRenderingContext2D} context - The canvas rendering context.
   * @param {HTMLCanvasElement} canvas - The canvas element.
   * @param {Object} components - An object containing game components (scene, stickfigure).
   */
  constructor(context, canvas, components) {
    this.context = context;
    this.canvas = canvas;
    this.components = components; // { scene, stickfigure }
    this.worldOffset = 0;
    this.gameSpeed = 3.5;
    this.isWalking = false;
    this.animationFrameId = null;
    
    // Create the attacker instance
    this.attacker = new Attacker(context, components.stickfigure);
    
    // Create the button system
    this.buttonSystem = new ButtonSystem(this, canvas, context);
    
    // Register event listeners
    this.registerEventListeners();
    
    // Initialize debug mode for development
    this.initializeDebugMode();
  }
  
  /**
   * Register event listeners for game mechanics
   */
  registerEventListeners() {
    // Listen for character move events
    GameEvents.on(CHARACTER_EVENTS.MOVE_START, (data) => {
      this.isWalking = true;
    });
    
    GameEvents.on(CHARACTER_EVENTS.MOVE_STOP, (data) => {
      this.isWalking = false;
    });
    
    // Listen for resize events
    GameEvents.on(GAME_EVENTS.RESIZE, (data) => {
      // Button system will handle its own resize through this event
    });
    
    // Listen for world update events
    GameEvents.on(GAME_EVENTS.WORLD_UPDATE, (data) => {
      if (data.worldOffset !== undefined) {
        this.worldOffset = data.worldOffset;
      }
    });
  }
  
  /**
   * Initialize debug mode for the event system
   */
  initializeDebugMode() {
    // Check if debug mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug') === 'true';
    
    if (debug) {
      // Enable debug mode on the event system
      GameEvents.setDebugMode(true);
      
      // Enable event history recording
      GameEvents.setHistoryRecording(true, 100);
      
      // Add debug UI to the page
      this.addDebugUI();
      
      console.log('[GAME] Debug mode enabled');
    }
  }
  
  /**
   * Add debug UI elements to the page
   */
  addDebugUI() {
    // Create a simple debug panel
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.zIndex = '1000';
    debugPanel.style.maxHeight = '200px';
    debugPanel.style.overflow = 'auto';
    debugPanel.id = 'debug-panel';
    
    document.body.appendChild(debugPanel);
    
    // Update the debug panel periodically
    setInterval(() => {
      if (document.getElementById('debug-panel')) {
        // Get the last few events from history
        const history = GameEvents.getHistory().slice(-5);
        
        // Format and display them
        debugPanel.innerHTML = '<strong>Last 5 Events:</strong><br>' + 
          history.map(event => {
            const time = new Date(event.timestamp).toISOString().substr(11, 8);
            return `${time} - ${event.type}`;
          }).reverse().join('<br>');
      }
    }, 500);
  }

  /**
   * The main animation loop that clears the canvas, draws all components,
   * and updates the game state.
   */
  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const { scene, stickfigure } = this.components;

    // Update and draw the scene with current world offset
    scene.update(this.worldOffset);
    scene.draw(this.worldOffset);

    // Update stickfigure
    if (stickfigure.update) {
      stickfigure.update();
    }
    
    // Update jump physics for the stickfigure before drawing
    if (stickfigure.updateJump) {
      stickfigure.updateJump();
    }
    
    // Draw the stickfigure
    stickfigure.draw();
    
    // Update and draw the attacker (in front of the main character)
    if (this.attacker) {
      this.attacker.update();
      this.attacker.draw();
    }

    // Update world offset if the stickfigure is walking
    if (this.isWalking) {
      const prevOffset = this.worldOffset;
      this.worldOffset += this.gameSpeed;
      
      // Emit world update event if the offset changed
      if (prevOffset !== this.worldOffset) {
        GameEvents.emitGame(GAME_EVENTS.WORLD_UPDATE, {
          worldOffset: this.worldOffset,
          change: this.gameSpeed
        });
      }
    }

    // Draw buttons using the button system
    this.buttonSystem.draw();
  }

  /**
   * Starts the game by initiating the animation loop.
   */
  start() {
    // If there's already an animation frame running, cancel it first
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Emit game start event
    GameEvents.emitGame(GAME_EVENTS.START, {
      components: Object.keys(this.components)
    });
    
    this.animate();
  }
  
  /**
   * Stops the game animation loop.
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      
      // Emit game stop event
      GameEvents.emitGame(GAME_EVENTS.STOP, {
        worldOffset: this.worldOffset
      });
    }
  }
  
  /**
   * Update game components
   * @param {Object} components - New components object
   */
  setComponents(components) {
    this.components = components;
    
    // Emit component update event
    GameEvents.emitGame(GAME_EVENTS.INITIALIZE, {
      components: Object.keys(components)
    });
  }
  
  /**
   * Restarts the animation loop with current components.
   * Used after resizing to ensure we're using updated components.
   */
  restart() {
    this.stop();
    
    // Recreate the attacker when restarting to ensure it uses the updated stickfigure
    this.attacker = new Attacker(this.context, this.components.stickfigure);
    
    // Update button positions
    this.buttonSystem.updateButtonPositions();
    
    // Start the game again
    this.start();
  }
  
  /**
   * Clean up resources when the game is destroyed
   * Important for proper garbage collection and preventing memory leaks
   */
  cleanup() {
    // Stop the animation loop
    this.stop();
    
    // Clean up event listeners on systems
    if (this.buttonSystem) {
      this.buttonSystem.cleanup();
    }
    
    // Clean up event listeners on components
    if (this.components.scene) {
      this.components.scene.cleanup();
    }
    
    if (this.components.stickfigure) {
      this.components.stickfigure.cleanup();
    }
    
    if (this.attacker) {
      this.attacker.cleanup();
    }
    
    // Clean up debug UI if it exists
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.remove();
    }
  }
}

// The main function initializes the game.
const main = () => {
  // Enable event debugging if needed
  if (window.location.search.includes('debug=true')) {
    GameEvents.setDebugMode(true);
  }
  
  // Emit game initialization event
  GameEvents.emitGame(GAME_EVENTS.INITIALIZE, {
    canvas: {
      width: canvas.width,
      height: canvas.height
    }
  });
  
  // Initialize the game with modular scene
  const game = new Game(context, canvas, {
    scene,
    stickfigure
  });
  
  // Expose the game instance globally so that other scripts can access it
  window.game = game;
  
  // Start the game.
  game.start();
  
  // For debugging: expose GameEvents to window for console experimentation
  if (window.location.search.includes('debug=true')) {
    window.GameEvents = GameEvents;
  }
};

// Only run main() when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export default Game;