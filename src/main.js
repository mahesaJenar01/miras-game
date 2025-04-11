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
import EnemyManager from './components/enemies/EnemyManager.js';
import HitEffectSystem from './components/enemies/HitEffectSystem.js';
import HealthManager from './components/character/HealthManager.js';

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
    
    // Fixed absolute speed in pixels per frame (no longer dependent on window size)
    this.gameSpeed = 5; // pixels per frame
    
    // Store reference game size for scaling calculations
    this.referenceWidth = 1920; // Reference width for responsive scaling
    this.referenceHeight = 1080; // Reference height for responsive scaling
    
    // Game state
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
    
    // Create the enemy manager
    this.enemyManager = new EnemyManager(context, canvas);
  
    // Create the hit effect system for visual feedback
    this.hitEffectSystem = new HitEffectSystem(context);

    // Create the health manager
    this.healthManager = new HealthManager(context, canvas);

    this._isRestartingFromEvent = false;

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

    GameEvents.on(GAME_EVENTS.GAME_OVER, (data) => {
      if (data.worldOffset !== undefined) {
        this.handleGameOver(data.worldOffset);
      }
    });
    
    // Listen for restart events
    GameEvents.on(GAME_EVENTS.RESTART, () => {
      this.handleRestart();
    });    
  }

  /**
   * Handle game over state
   * @param {number} checkpointOffset - World offset to restart from
   */
  handleGameOver(checkpointOffset) {
    // Stop walking
    this.isWalking = false;
    
    // Update state for stickfigure and ensure it stays stopped
    if (this.components.stickfigure) {
      this.components.stickfigure.isWalking = false;
      
      // Add this to make sure stickfigure won't start moving again
      this.components.stickfigure.canMove = false;
    }
    
    // Emit stop event to ensure consistency
    GameEvents.emitCharacter(CHARACTER_EVENTS.MOVE_STOP, {
      direction: 'right'
    });
    
    // Make sure attacker is also stopped
    if (this.attacker) {
      this.attacker.isAttacking = false;
    }
  }

  /**
   * Handle game restart
   */
  handleRestart() {
    console.log("Game restart triggered"); // Debug log
    
    // Guard against recursive restart
    if (this._isRestartingFromEvent) return;
    this._isRestartingFromEvent = true;
    
    try {
      // Get checkpoint from health manager
      const checkpointOffset = this.healthManager ? this.healthManager.lastCheckpoint : 0;
      
      // Reset world to checkpoint
      this.worldOffset = checkpointOffset;
      
      // Reset the character position properly
      if (this.components.stickfigure) {
        // Calculate proper ground Y position
        const groundLevel = this.canvas.height * 0.8;
        const characterHeight = this.components.stickfigure.config.radius * 5;
        
        // Reset position, jumping state and physics
        this.components.stickfigure.y = groundLevel - characterHeight;
        this.components.stickfigure.isJumping = false;
        this.components.stickfigure.jumpVelocity = 0;
        this.components.stickfigure.initialY = this.components.stickfigure.y;
        this.components.stickfigure.canMove = true;
      }
      
      // Reset health
      if (this.healthManager) {
        this.healthManager.currentHealth = this.healthManager.maxHealth;
        this.healthManager.isAlive = true;
        this.healthManager.gameOverVisible = false;
      }
      
      // Force UI update
      GameEvents.emitGame(GAME_EVENTS.RESTART_COMPLETE, {
        worldOffset: checkpointOffset,
        success: true
      });
      
      // Ensure buttons are enabled
      if (this.buttonSystem) {
        this.buttonSystem.handleGameOver(false);
      }
    } catch (error) {
      console.error("Error during game restart:", error);
    } finally {
      this._isRestartingFromEvent = false;
    }
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
    
    // Get the alive state once to use consistently throughout
    const isAlive = !this.healthManager || this.healthManager.getAliveState();

    // Update and draw the scene with current world offset
    scene.update(this.worldOffset);
    scene.draw(this.worldOffset);

    // Only update stickfigure movement if alive
    if (stickfigure.update && isAlive) {
      stickfigure.update();
    }
    
    // Only update jump physics if alive
    if (stickfigure.updateJump && isAlive) {
      stickfigure.updateJump();
    }
    
    // Always draw the stickfigure (even when dead)
    stickfigure.draw();
    
    // Update and draw enemies
    if (this.enemyManager) {
      // Only process collisions if alive
      const checkCollisions = isAlive;
      this.enemyManager.updateEnemies(this.worldOffset, checkCollisions);
      this.enemyManager.draw(this.worldOffset);
    }    
    
    // Update and draw the attacker
    if (this.attacker && isAlive) {
      this.attacker.update();
      
      // Get attack hitbox and check for hits if attacking
      const attackHitbox = this.attacker.getAttackHitbox(this.worldOffset);
      if (attackHitbox && this.enemyManager) {
        this.enemyManager.checkAttackHits(attackHitbox, this.attacker);
      }
      
      // Draw the attacker
      this.attacker.draw();
    }
    
    // Always update and draw visual effects
    if (this.hitEffectSystem) {
      this.hitEffectSystem.update();
      this.hitEffectSystem.draw();
    }
    
    // Always update and draw collectibles
    if (this.collectibleManager) {
      this.collectibleManager.update();
      this.collectibleManager.draw(this.worldOffset);
    }

    // Update world offset ONLY if the stickfigure is walking AND alive
    if (this.isWalking && isAlive) {
      const prevOffset = this.worldOffset;
      
      // Use a constant pixel increment for consistent speed
      this.worldOffset += this.gameSpeed;
      
      // Emit world update event if the offset changed
      if (prevOffset !== this.worldOffset) {
        GameEvents.emitGame(GAME_EVENTS.WORLD_UPDATE, {
          worldOffset: this.worldOffset,
          change: this.gameSpeed
        });
      }
    }    

    // Always draw buttons
    this.buttonSystem.draw();
    
    // Always update and draw UI elements
    if (this.collectibleDisplay) {
      this.collectibleDisplay.update();
      this.collectibleDisplay.draw();
    }
    
    if (this.shopManager) {
      this.shopManager.update();
      this.shopManager.draw();
    }

    // Always update and draw health manager
    if (this.healthManager) {
      this.healthManager.update();
      this.healthManager.draw();
    }    
}

  getScaleFactor() {
    // Calculate scale factor between current size and reference size
    const widthScale = this.canvas.width / this.referenceWidth;
    const heightScale = this.canvas.height / this.referenceHeight;
    
    // Use the smaller scale to ensure everything fits
    return Math.min(widthScale, heightScale);
  }
  
  // Method to convert world units to screen pixels
  worldToScreen(worldX) {
    const scaleFactor = this.getScaleFactor();
    return worldX * scaleFactor;
  }

  // Method to convert screen pixels to world units
  screenToWorld(screenX) {
    const scaleFactor = this.getScaleFactor();
    return screenX / scaleFactor;
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
    
    // ADDED: Check health state and update buttons accordingly
    setTimeout(() => {
      if (this.healthManager && !this.healthManager.isAlive) {
        this.buttonSystem.handleGameOver(true);
      }
    }, 200);
    
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
    
    // Reset enemy manager to initialize with new enemies
    if (this.enemyManager) {
      this.enemyManager.reset();
    }
    
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
    
    // Clean up enemy manager
    if (this.enemyManager) {
      this.enemyManager.reset();
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