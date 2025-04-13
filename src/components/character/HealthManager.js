/**
 * HealthManager.js - Manages character health using flower icons
 * Handles health display, damage, healing, and game over state
 */
import GameEvents from '../../events/GameEvents.js';
import { CHARACTER_EVENTS, GAME_EVENTS, UI_EVENTS, ENEMY_EVENTS, SHOP_EVENTS, COLLECTION_EVENTS } from '../../events/EventTypes.js';

class HealthManager {
  /**
   * Create a new health manager
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    
    // Health configuration
    this.maxHealth = 5;
    this.currentHealth = this.maxHealth;
    this.isAlive = true;
    
    // Position and size information
    this.x = 0;
    this.y = 0;
    this.flowerSize = 25;
    this.spacing = 10;
    this.padding = 10;
    
    // Display properties
    this.flowerColor = "#FF5555"; // Red flower color
    this.emptyFlowerColor = "#AAAAAA"; // Grey for empty flowers
    this.stemColor = "#4CAF50"; // Green stem
    
    // Game state tracking
    this.lastCheckpoint = 0; // Last worldOffset checkpoint
    this.checkpointInterval = 500; // Distance between checkpoints
    this.gameOverVisible = false;
    
    // Animation properties
    this.damageAnimationTimer = 0;
    this.damageAnimationDuration = 30; // frames
    
    // Track if shop or collection menu is open
    this.isMenuOpen = false;
    this.menuOpacity = 0.3; // Opacity to use when a menu is open
    
    this._isRestartingFromEvent = false;

    // Register event listeners
    this.registerEventListeners();
    
    // Initial position update
    this.updatePosition();
    
    // Load saved checkpoint if available
    this.loadSavedState();
  }
  
  /**
   * Register event listeners for health-related events
   */
  registerEventListeners() {
    // Listen for enemy collisions
    GameEvents.on(CHARACTER_EVENTS.POSITION_CHANGE, (data) => {
      if (data.character === 'stickfigure' && this.isAlive) {
        this.checkEnemyCollisions(data.x, data.y);
      }
    });
    
    // Listen for enemy defeated events to heal
    GameEvents.on(ENEMY_EVENTS.ENEMY_DEFEATED, (data) => {
      if (this.isAlive && this.currentHealth < this.maxHealth) {
        this.heal(1);
      }
    });
    
    // Listen for world updates to set checkpoints
    GameEvents.on(GAME_EVENTS.WORLD_UPDATE, (data) => {
      if (data.worldOffset !== undefined && this.isAlive) {
        this.updateCheckpoint(data.worldOffset);
      }
    });
    
    // Listen for game resize events
    GameEvents.on(GAME_EVENTS.RESIZE, () => {
      this.updatePosition();
    });
    
    // Listen for restart events
    GameEvents.on(GAME_EVENTS.RESTART, () => {
        // Add a guard to prevent recursion
        if (!this._isRestartingFromEvent) {
          this._isRestartingFromEvent = true;
          this.restart();
          this._isRestartingFromEvent = false;
        }
    });
    
    // Listen for shop open/close events
    GameEvents.on(SHOP_EVENTS.OPEN, () => {
      this.isMenuOpen = true;
    });
    
    GameEvents.on(SHOP_EVENTS.CLOSE, () => {
      this.isMenuOpen = false;
    });
    
    // Listen for collection open/close events
    GameEvents.on(COLLECTION_EVENTS.OPEN, () => {
      this.isMenuOpen = true;
    });
    
    GameEvents.on(COLLECTION_EVENTS.CLOSE, () => {
      this.isMenuOpen = false;
    });
    
    // Listen for attack hits on enemies
    GameEvents.on(CHARACTER_EVENTS.ATTACK_HIT, () => {
      // Save state when player attacks successfully
      this.saveState();
    });
  }
  
  /**
   * Update the health display position
   */
  updatePosition() {
    // Position in the top-right corner
    this.x = this.canvas.width - this.padding - (this.maxHealth * (this.flowerSize + this.spacing));
    this.y = this.padding * 2; // Place below any other UI elements
  }
  
  /**
   * Update the checkpoint based on worldOffset
   * @param {number} worldOffset - Current world offset
   */
  updateCheckpoint(worldOffset) {
    // Set checkpoint at regular intervals
    const newCheckpoint = Math.floor(worldOffset / this.checkpointInterval) * this.checkpointInterval;
    
    if (newCheckpoint > this.lastCheckpoint) {
      this.lastCheckpoint = newCheckpoint;
      this.saveState();
    }
  }
  
  /**
   * Check for collisions with enemies
   * @param {number} characterX - Character X position
   * @param {number} characterY - Character Y position
   */
  checkEnemyCollisions(characterX, characterY) {
    if (!this.isAlive || window.game.enemyManager === undefined) return;
    
    // Get enemies from the game
    const enemies = window.game.enemyManager.enemies;
    const worldOffset = window.game.worldOffset || 0;
    
    // Character hitbox - adjust based on stickfigure size
    const characterRadius = window.game.components.stickfigure.config.radius || 30;
    const characterHitbox = {
      x: characterX,
      y: characterY,
      width: characterRadius * 2,
      height: characterRadius * 5 // Full height of character
    };
    
    // Check collision with each active enemy
    enemies.forEach(enemy => {
      if (enemy && enemy.active) {
        // Get enemy position in screen coordinates
        const enemyScreenX = enemy.x - worldOffset;
        
        // Create enemy hitbox
        const enemyHitbox = {
          x: enemyScreenX,
          y: enemy.y,
          width: enemy.width,
          height: enemy.height
        };
        
        // Check collision
        if (this.checkBoxIntersection(
          characterHitbox.x, characterHitbox.y, characterHitbox.width, characterHitbox.height,
          enemyHitbox.x, enemyHitbox.y, enemyHitbox.width, enemyHitbox.height
        )) {
          // Take damage on collision
          this.takeDamage(1);
          
          // Push enemy slightly away to prevent multiple rapid collisions
          enemy.x += 100; // Push forward
        }
      }
    });
  }
  
  /**
   * Simple box intersection check (reused from EnemyManager)
   */
  checkBoxIntersection(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Add some padding for more forgiving hit detection
    const padding = 5;
    
    // Use proper bounding box check with padding
    return (
      x1 - padding < x2 + w2 &&
      x1 + w1 + padding > x2 &&
      y1 - padding < y2 + h2 &&
      y1 + h1 + padding > y2
    );
  }
  
  /**
   * Take damage and update health state
   * @param {number} amount - Amount of damage to take
   */
  takeDamage(amount) {
    // Skip if already dead or invulnerable during animation
    if (!this.isAlive || this.damageAnimationTimer > 0) return;
    
    // Reduce health
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    
    // Start damage animation
    this.damageAnimationTimer = this.damageAnimationDuration;
    
    // Check for death
    if (this.currentHealth <= 0) {
      this.setDeadState();
    }
    
    // Emit health change event
    GameEvents.emitCharacter(CHARACTER_EVENTS.HEALTH_CHANGE, {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      isAlive: this.isAlive
    });
    
    // Save health state to persist across page refreshes
    this.saveState();
  }
  
  /**
   * Heal and restore health
   * @param {number} amount - Amount of health to restore
   */
  heal(amount) {
    // Skip if already dead
    if (!this.isAlive) return;
    
    // Increase health up to max
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    
    // Emit health change event
    GameEvents.emitCharacter(CHARACTER_EVENTS.HEALTH_CHANGE, {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      isAlive: this.isAlive
    });
    
    // Save health state to persist across page refreshes
    this.saveState();
  }
  
  /**
   * Set the dead state and trigger game over
   */
  setDeadState() {
    // Only proceed if not already dead to prevent duplicate events
    if (this.isAlive) {
      this.isAlive = false;
      this.gameOverVisible = true;
      
      // Save final state for restart
      this.saveState();
      
      // Emit game over event - ensure this is a valid event type
      GameEvents.emitGame(GAME_EVENTS.GAME_OVER, {
        worldOffset: this.lastCheckpoint,
        message: "You Lose!"
      });
      
      // Directly disable all buttons through ButtonSystem if possible
      if (window.game && window.game.buttonSystem) {
        window.game.buttonSystem.handleGameOver(true);
      }
      
      // Also emit UI update to disable other buttons
      GameEvents.emitUI(UI_EVENTS.UPDATE, {
        type: 'game_over',
        isAlive: false
      });
      
      // Force stickfigure to stop all activity
      if (window.game && window.game.components && window.game.components.stickfigure) {
        const stickfigure = window.game.components.stickfigure;
        stickfigure.isWalking = false;
        stickfigure.isJumping = false;
        
        // Add a property to prevent further movement
        stickfigure.canMove = false;
      }
      
      // Make sure health manager state is correctly saved
      this.saveState();
    }
  }  
  
    /**
     * Check if game is in a state where input should be allowed
     * @returns {boolean} True if game is in a state where input should be processed
    */
    shouldProcessInput() {
        return this.isAlive;
    }
  
    /**
     * Restart the game from the last checkpoint with improved error handling
     */
    restart() {
    // Add a guard to prevent recursion
    if (this._isRestartingFromEvent) return;
    this._isRestartingFromEvent = true;
        
    try {
        // Restore health and state
        this.currentHealth = this.maxHealth;
        this.isAlive = true;
        this.gameOverVisible = false;
        this.damageAnimationTimer = 0;
        
        // Re-enable stickfigure movement
        if (window.game && window.game.components && window.game.components.stickfigure) {
        window.game.components.stickfigure.canMove = true;
        }
        
        // Enable all buttons by directly calling ButtonSystem
        if (window.game && window.game.buttonSystem) {
        window.game.buttonSystem.handleGameOver(false);
        }
        
        // Emit restart completion event
        GameEvents.emitGame(GAME_EVENTS.RESTART_COMPLETE, {
        worldOffset: this.lastCheckpoint,
        health: this.currentHealth,
        isAlive: true
        });
        
        // Also emit UI update to re-enable buttons
        GameEvents.emitUI(UI_EVENTS.UPDATE, {
        type: 'game_restart',
        isAlive: true
        });
        
        // Save the restarted state
        this.saveState();
    } finally {
        this._isRestartingFromEvent = false;
    }
  }      
  
  /**
   * Save checkpoint and health state
   */
  saveState() {
    const healthState = {
      checkpoint: this.lastCheckpoint,
      health: this.currentHealth,
      isAlive: this.isAlive
    };
    
    localStorage.setItem('mirasGame_healthState', JSON.stringify(healthState));
  }
  
  /**
   * Load saved checkpoint and health state
   */
  loadSavedState() {
    const savedState = localStorage.getItem('mirasGame_healthState');
      
    if (savedState) {
      const state = JSON.parse(savedState);
      
      // Only use valid values
      if (state.checkpoint !== undefined && state.checkpoint >= 0) {
        this.lastCheckpoint = state.checkpoint;
      }
      
      if (state.health !== undefined && state.health >= 0 && state.health <= this.maxHealth) {
        this.currentHealth = state.health;
      }
      
      if (state.isAlive !== undefined) {
        this.isAlive = state.isAlive;
        
        // If loading in dead state, show game over
        if (!this.isAlive) {
          this.gameOverVisible = true;
          
          // Emit game over event
          GameEvents.emitGame(GAME_EVENTS.GAME_OVER, {
            worldOffset: this.lastCheckpoint,
            message: "You Lose!"
          });
          
          // Also emit UI update to disable other buttons
          GameEvents.emitUI(UI_EVENTS.UPDATE, {
            type: 'game_over',
            isAlive: false
          });
          
          // ADDED: Use setTimeout to ensure button system is initialized
          setTimeout(() => {
            if (window.game && window.game.buttonSystem) {
              window.game.buttonSystem.handleGameOver(true);
            }
          }, 100);
        }
      }
    }
  }
  
  /**
   * Update health animations
   */
  update() {
    // Update damage animation
    if (this.damageAnimationTimer > 0) {
      this.damageAnimationTimer--;
    }
  }
  
  /**
   * Draw health flowers
   */
  draw() {
    const { context, flowerSize, spacing } = this;
    
    // Save context state
    context.save();
    
    // Apply reduced opacity when a menu is open
    if (this.isMenuOpen) {
      context.globalAlpha = this.menuOpacity;
    }
    
    // Draw each flower
    for (let i = 0; i < this.maxHealth; i++) {
      const flowerX = this.x + i * (flowerSize + spacing);
      const flowerY = this.y;
      
      // Determine if this flower is filled or empty
      const isFilled = i < this.currentHealth;
      
      // Draw the flower
      this.drawFlower(flowerX, flowerY, flowerSize, isFilled);
    }
    
    // Reset opacity
    context.globalAlpha = 1.0;
    
    // Draw game over message if dead
    if (this.gameOverVisible) {
      this.drawGameOver();
    }
    
    // Draw damage animation
    if (this.damageAnimationTimer > 0) {
      this.drawDamageEffect();
    }
    
    // Restore context state
    context.restore();
  }
  
  /**
   * Draw a flower health icon
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Flower size
   * @param {boolean} isFilled - Whether the flower is filled (has health)
   */
  drawFlower(x, y, size, isFilled) {
    const { context } = this;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const petalSize = size * 0.4;
    
    // Draw stem
    context.beginPath();
    context.moveTo(centerX, centerY + petalSize);
    context.lineTo(centerX, centerY + size * 0.8);
    context.strokeStyle = this.stemColor;
    context.lineWidth = size * 0.1;
    context.stroke();
    context.closePath();
    
    // Draw petals
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = centerX + Math.cos(angle) * petalSize;
      const petalY = centerY + Math.sin(angle) * petalSize;
      
      context.beginPath();
      context.arc(petalX, petalY, petalSize * 0.7, 0, Math.PI * 2);
      context.fillStyle = isFilled ? this.flowerColor : this.emptyFlowerColor;
      context.fill();
      context.closePath();
    }
    
    // Draw center
    context.beginPath();
    context.arc(centerX, centerY, petalSize * 0.4, 0, Math.PI * 2);
    context.fillStyle = isFilled ? "#FFEB3B" : "#CCCCCC"; // Yellow for filled, gray for empty
    context.fill();
    context.closePath();
  }
  
  /**
   * Draw game over message
   */
  drawGameOver() {
    const { context, canvas } = this;
    
    // Create semi-transparent overlay
    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game over message
    context.font = "bold 48px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("You Lose!", canvas.width / 2, canvas.height / 2 - 50);
    
    // Note: Restart button is drawn by ButtonSystem
  }
  
  /**
   * Draw damage effect (red flash)
   */
  drawDamageEffect() {
    const { context, canvas, damageAnimationTimer, damageAnimationDuration } = this;
    
    // Calculate opacity based on animation progress
    const opacity = damageAnimationTimer / damageAnimationDuration * 0.3;
    
    // Draw red overlay
    context.fillStyle = `rgba(255, 0, 0, ${opacity})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  /**
   * Get current alive state
   * @returns {boolean} Whether the character is alive
   */
  getAliveState() {
    return this.isAlive;
  }
  
  /**
   * Get current health
   * @returns {number} Current health
   */
  getCurrentHealth() {
    return this.currentHealth;
  }
  
  /**
   * Reset the health manager
   */
  reset() {
    this.currentHealth = this.maxHealth;
    this.isAlive = true;
    this.gameOverVisible = false;
    this.damageAnimationTimer = 0;
    this.lastCheckpoint = 0;
    
    // Save the reset state
    this.saveState();
  }
}

export default HealthManager;