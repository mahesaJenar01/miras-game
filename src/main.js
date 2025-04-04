/**
 * main.js - Main game entry point
 * Updated to use the event communication system and include collectibles
 */
import ButtonSystem from './controls/ButtonSystem.js';
import { canvas, context, scene, stickfigure } from './utils/setup.js';
import Attacker from './components/character/Attacker.js';
import GameEvents from './events/GameEvents.js';
import { GAME_EVENTS, CHARACTER_EVENTS } from './events/EventTypes.js';
import CollectibleManager from './components/collectibles/CollectibleManager.js';
import CollectibleDisplay from './components/collectibles/CollectibleDisplay.js';
import ShopManager from './components/shop/ShopManager.js';

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
    
    // Create the collectible manager
    this.collectibleManager = new CollectibleManager(context, canvas);
    
    // Create the collectible display
    this.collectibleDisplay = new CollectibleDisplay(context, canvas);
    
    // Create the shop manager
    this.shopManager = new ShopManager(context, canvas);
    
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
   * Positioned at the upper right corner of the canvas
   */
  addDebugUI() {
    // Create a simple debug panel
    const debugPanel = document.createElement('div');
    
    // Position the panel exactly at the upper right of the canvas
    const canvasRect = this.canvas.getBoundingClientRect();
    
    debugPanel.style.position = 'fixed';
    debugPanel.style.top = `${canvasRect.top + 10}px`;  // 10px from the top of canvas
    debugPanel.style.right = `${window.innerWidth - canvasRect.right + 10}px`;  // 10px from the right of canvas
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
    
    // Function to update debug panel position
    // Store reference to the function for cleanup
    this._updateDebugPanelPosition = () => {
      const panel = document.getElementById('debug-panel');
      if (panel) {
        const canvasRect = this.canvas.getBoundingClientRect();
        panel.style.top = `${canvasRect.top + 10}px`;
        panel.style.right = `${window.innerWidth - canvasRect.right + 10}px`;
      }
    };
    
    // Update position when window is resized
    window.addEventListener('resize', this._updateDebugPanelPosition);
    
    // Listen for game resize events to update position
    GameEvents.on(GAME_EVENTS.RESIZE, this._updateDebugPanelPosition);
    
    // Update the debug panel content and position periodically
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
        
        // Also update position in case canvas has moved
        this._updateDebugPanelPosition();
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
    
    // Update and draw collectibles
    if (this.collectibleManager) {
      this.collectibleManager.update();
      this.collectibleManager.draw(this.worldOffset);
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
    
    // Update and draw collectible display (score UI)
    if (this.collectibleDisplay) {
      this.collectibleDisplay.update();
      this.collectibleDisplay.draw();
    }
    
    // Update and draw shop manager
    if (this.shopManager) {
      this.shopManager.update();
      this.shopManager.draw();
    }
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
    
    // Clean up shop manager
    if (this.shopManager) {
      this.shopManager.cleanup();
    }
    
    // Clean up debug UI if it exists
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      // Remove the resize event listener if we have a reference to it
      if (this._updateDebugPanelPosition) {
        window.removeEventListener('resize', this._updateDebugPanelPosition);
        GameEvents.off(GAME_EVENTS.RESIZE, this._updateDebugPanelPosition);
      }
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