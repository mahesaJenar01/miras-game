/**
 * CollectibleManager.js - Manages all collectible items in the game
 * Handles spawning, updating, collision detection, and collection
 * Updated to use tulip flowers instead of coins/stars/gems
 * Added localStorage support to persist collected flowers
 */
import Collectible from './Collectible.js';
import GameEvents from '../../events/GameEvents.js';
import { COLLECTIBLE_EVENTS, GAME_EVENTS, CHARACTER_EVENTS } from '../../events/EventTypes.js';

class CollectibleManager {
  /**
   * Create a new collectible manager
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    this.collectibles = [];
    this.collected = 0;
    this.typeDistribution = {
      redtulip: 0.7,  // 70% chance of spawning a red tulip (common)
      pinktulip: 0.2,  // 20% chance of spawning a pink tulip (uncommon)
      goldentulip: 0.1    // 10% chance of spawning a golden tulip (rare)
    };
    this.valueMap = {
      redtulip: 1,   // Red tulip is worth 1 point
      pinktulip: 5,  // Pink tulip is worth 5 points
      goldentulip: 10  // Golden tulip is worth 10 points
    };
    this.spawnTimer = 0;
    this.spawnInterval = 120; // frames between spawns (about 2 seconds at 60fps)
    
    // Register event listeners
    this.registerEventListeners();
    
    // Load previously saved flowers count from localStorage
    this.loadSavedFlowers();
  }
  
  /**
   * Register event listeners for collectible management
   */
  registerEventListeners() {
    // Listen for character position changes to check for collisions
    GameEvents.on(CHARACTER_EVENTS.POSITION_CHANGE, (data) => {
      if (data.character === 'stickfigure') {
        this.checkCollisions(data.x, data.y);
      }
    });
    
    // Listen for world updates to spawn collectibles in visible areas
    GameEvents.on(GAME_EVENTS.WORLD_UPDATE, (data) => {
      if (data.worldOffset !== undefined) {
        this.handleWorldUpdate(data.worldOffset);
      }
    });
    
    // Listen for game start to initialize collectibles
    GameEvents.on(GAME_EVENTS.START, () => {
      this.initializeCollectibles();
    });
    
    // Listen for game resize to adjust collectible positions
    GameEvents.on(GAME_EVENTS.RESIZE, () => {
      this.adjustCollectiblesForResize();
    });
  }
  
  /**
   * Initialize with a few collectibles at game start
   */
  initializeCollectibles() {
    // Clear any existing collectibles
    this.collectibles = [];
    
    // Add initial collectibles
    for (let i = 0; i < 5; i++) {
      this.spawnRandomCollectible();
    }
    
    // Emit initial count event
    this.emitCountUpdate();
  }
  
  /**
   * Load previously saved flowers count from localStorage
   */
  loadSavedFlowers() {
    try {
      // Try to get the saved flower count from localStorage
      const savedFlowers = localStorage.getItem('mirasGame_flowerCount');
      
      if (savedFlowers !== null) {
        // Parse the saved count as a number
        const count = parseInt(savedFlowers, 10);
        
        // Validate the count is a positive number
        if (!isNaN(count) && count >= 0) {
          this.collected = count;
          console.log(`Loaded ${count} flowers from localStorage`);
        }
      }
    } catch (e) {
      // Log any errors but continue with default count (0)
      console.error('Error loading saved flower count:', e);
    }
    
    // Emit count update with the loaded value
    this.emitCountUpdate();
  }
  
  /**
   * Save the current flowers count to localStorage
   */
  saveFlowersCount() {
    try {
      // Save the current count to localStorage
      localStorage.setItem('mirasGame_flowerCount', this.collected.toString());
    } catch (e) {
      // Log any errors but continue
      console.error('Error saving flower count:', e);
    }
  }
  
  /**
   * Handle world updates (player moving forward)
   * @param {number} worldOffset - Current world offset value
   */
  handleWorldUpdate(worldOffset) {
    // Increment spawn timer
    this.spawnTimer++;
    
    // Spawn new collectibles periodically
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnRandomCollectible(worldOffset + this.canvas.width);
      this.spawnTimer = 0;
      
      // Gradually reduce spawn interval as game progresses (min 60 frames)
      this.spawnInterval = Math.max(60, this.spawnInterval - 1);
    }
    
    // Remove collectibles that are far behind the player (off-screen)
    this.removeOffscreenCollectibles(worldOffset);
  }
  
  /**
   * Spawn a random collectible
   * @param {number} xPos - X position to spawn at (defaults to random position ahead)
   */
  spawnRandomCollectible(xPos = null) {
    // Get canvas dimensions
    const { width, height } = this.canvas;
    
    // Determine spawn position
    const x = xPos !== null ? xPos : Math.random() * width * 1.5 + width;
    
    // Determine vertical position (in the middle third of the screen)
    const minY = height * 0.3;
    const maxY = height * 0.6;
    const y = minY + Math.random() * (maxY - minY);
    
    // Determine collectible type based on distribution
    const typeRoll = Math.random();
    let type = 'redtulip';
    let cumulativeProbability = 0;
    
    for (const [itemType, probability] of Object.entries(this.typeDistribution)) {
      cumulativeProbability += probability;
      if (typeRoll <= cumulativeProbability) {
        type = itemType;
        break;
      }
    }
    
    // Determine size based on type
    let size = 15; // Default size
    if (type === 'pinktulip') size = 18;
    else if (type === 'goldentulip') size = 20;
    
    // Create and add the collectible
    const collectible = new Collectible(
      this.context,
      x,
      y,
      size,
      type,
      this.valueMap[type]
    );
    
    this.collectibles.push(collectible);
    
    // Emit collectible spawn event
    GameEvents.emitCollectible(COLLECTIBLE_EVENTS.SPAWN, {
      type,
      x,
      y,
      size,
      value: this.valueMap[type]
    });
    
    return collectible;
  }
  
  /**
   * Remove collectibles that are off-screen
   * @param {number} worldOffset - Current world offset
   */
  removeOffscreenCollectibles(worldOffset) {
    // Remove collectibles that are too far behind the player
    const removalThreshold = worldOffset - this.canvas.width * 0.5;
    
    this.collectibles = this.collectibles.filter(collectible => {
      return collectible.active && collectible.x > removalThreshold;
    });
  }
  
  /**
   * Check for collisions between character and collectibles
   * @param {number} characterX - Character X position
   * @param {number} characterY - Character Y position
   * @param {number} characterRadius - Character collision radius (optional)
   */
  checkCollisions(characterX, characterY, characterRadius = 30) {
    // Adjust character X position for world offset
    const worldOffset = window.game ? window.game.worldOffset : 0;
    const adjustedCharacterX = characterX + worldOffset;
    
    // Check each active collectible for collision
    this.collectibles.forEach(collectible => {
      if (collectible.active && collectible.checkCollision(adjustedCharacterX, characterY, characterRadius)) {
        // Handle collection
        this.collectItem(collectible);
      }
    });
  }
  
  /**
   * Handle collection of an item
   * @param {Collectible} collectible - The collected item
   */
  collectItem(collectible) {
    // Mark as collected
    collectible.collect();
    
    // Increment collected count by value
    this.collected += collectible.value;
    
    // Save the updated count to localStorage
    this.saveFlowersCount();
    
    // Emit collect event
    GameEvents.emitCollectible(COLLECTIBLE_EVENTS.COLLECT, {
      type: collectible.type,
      x: collectible.x,
      y: collectible.y,
      value: collectible.value,
      totalCollected: this.collected
    });
    
    // Play sound effect via audio event system
    GameEvents.emitAudio(COLLECTIBLE_EVENTS.COLLECT_SOUND, {
      type: collectible.type
    });
    
    // Emit count update event
    this.emitCountUpdate();
  }
  
  /**
   * Emit an event with the current collected count
   */
  emitCountUpdate() {
    GameEvents.emitCollectible(COLLECTIBLE_EVENTS.COUNT_UPDATE, {
      count: this.collected
    });
  }
  
  /**
   * Adjust collectibles after canvas resize
   */
  adjustCollectiblesForResize() {
    // Get new dimensions
    const { height } = this.canvas;
    
    // Adjust vertical positions of collectibles to stay in the middle third
    const minY = height * 0.3;
    const maxY = height * 0.6;
    
    this.collectibles.forEach(collectible => {
      // Calculate a relative vertical position (0-1) based on screen height
      const relativeY = collectible.y / this.canvas.height;
      
      // Apply that relative position to the new height, but keep within bounds
      collectible.y = Math.max(minY, Math.min(maxY, relativeY * height));
    });
  }
  
  /**
   * Update all collectibles
   */
  update() {
    this.collectibles.forEach(collectible => {
      if (collectible.active) {
        collectible.update();
      }
    });
  }
  
  /**
   * Draw all collectibles
   * @param {number} worldOffset - Current world offset for parallax
   */
  draw(worldOffset) {
    this.collectibles.forEach(collectible => {
      if (collectible.active) {
        // Save original x position
        const originalX = collectible.x;
        
        // Adjust x position for world offset
        collectible.x -= worldOffset;
        
        // Draw the collectible
        collectible.draw();
        
        // Restore original x position for collision detection
        collectible.x = originalX;
      }
    });
  }
  
  /**
   * Get the current collected count
   * @returns {number} Current collected count
   */
  getCollectedCount() {
    return this.collected;
  }
  
  /**
   * Reset the manager (clear collectibles and reset count)
   * This method now has an optional parameter to preserve the collected count
   * @param {boolean} preserveCount - Whether to preserve the collected count
   */
  reset(preserveCount = true) {
    this.collectibles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 120;
    
    if (!preserveCount) {
      // Only reset the count if preserveCount is false
      this.collected = 0;
      // Also update the saved value in localStorage
      this.saveFlowersCount();
    }
    
    this.emitCountUpdate();
  }
}

export default CollectibleManager;