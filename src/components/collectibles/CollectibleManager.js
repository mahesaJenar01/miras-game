/**
 * CollectibleManager.js - Manages all collectible items in the game
 * Modified to provide consistent positioning regardless of window size
 * With height adjustment based on collectible value and improved collision detection
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
    this.hasInitialized = false; // Flag to track if we've initialized once
    
    // Reference width and height for consistent positioning
    this.referenceWidth = 1920;
    this.referenceHeight = 1080;
    
    // Character height references (as percentages of canvas height)
    this.characterHeightNormal = 0.5; // Character's head at normal standing position
    this.characterHeightJumping = 0.3; // Character's head at peak jump position
    
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
    
    // Define height ranges for each collectible type
    this.heightRanges = {
      redtulip: { min: 0.48, max: 0.55 },     // Mostly ground level, some requiring small jumps
      pinktulip: { min: 0.35, max: 0.48 },    // Mix of ground level and jump height
      goldentulip: { min: 0.28, max: 0.35 }   // Always requiring a jump to collect
    };
    
    this.spawnTimer = 0;
    this.spawnInterval = 120; // frames between spawns (about 2 seconds at 60fps)
    
    // Register event listeners
    this.registerEventListeners();
    
    // Load previously saved flowers count from localStorage
    this.loadSavedFlowers();
  }
  
  /**
   * Get current scale factor based on reference dimensions
   * @returns {number} The current scale factor
   */
  getScaleFactor() {
    const widthScale = this.canvas.width / this.referenceWidth;
    const heightScale = this.canvas.height / this.referenceHeight;
    return Math.min(widthScale, heightScale);
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
        
        // ADDED: Check for collisions during world updates (when walking)
        // This ensures collision detection while character is walking
        if (window.game && window.game.components && window.game.components.stickfigure) {
          const stickfigure = window.game.components.stickfigure;
          this.checkCollisions(stickfigure.x, stickfigure.y);
        }
      }
    });
    
    // Listen for game start to initialize collectibles
    GameEvents.on(GAME_EVENTS.START, () => {
      // Only initialize if we haven't already or have no collectibles
      if (!this.hasInitialized || this.collectibles.length === 0) {
        this.initializeCollectibles();
        this.hasInitialized = true;
      }
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
    
    // Add initial collectibles with varied positions
    this.spawnRandomCollectible(null, 'redtulip'); // Common red tulip
    this.spawnRandomCollectible(null, 'redtulip'); // Another red tulip
    this.spawnRandomCollectible(null, 'pinktulip'); // Medium value pink tulip
    this.spawnRandomCollectible(null, 'pinktulip'); // Another pink tulip
    this.spawnRandomCollectible(null, 'goldentulip'); // Rare golden tulip (requires jump)
    
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
   * Handle world updates (player moving forward)
   * @param {number} worldOffset - Current world offset value
   */
  handleWorldUpdate(worldOffset) {
    // Increment spawn timer
    this.spawnTimer++;
    
    // Spawn new collectibles periodically
    if (this.spawnTimer >= this.spawnInterval) {
      // Determine tulip type based on distribution with a weighted random
      let type = this.getRandomTulipType();
      
      // Spawn ahead of player with constant distance
      this.spawnRandomCollectible(worldOffset + this.referenceWidth, type);
      this.spawnTimer = 0;
      
      // Gradually reduce spawn interval as game progresses (min 60 frames)
      this.spawnInterval = Math.max(60, this.spawnInterval - 1);
    }
    
    // Remove collectibles that are far behind the player (off-screen)
    this.removeOffscreenCollectibles(worldOffset);
  }
  
  /**
   * Get a random tulip type based on the distribution
   * @returns {string} The tulip type
   */
  getRandomTulipType() {
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
    
    return type;
  }
  
  /**
   * Spawn a random collectible
   * @param {number} xPos - X position to spawn at (defaults to random position ahead)
   * @param {string} type - Specific tulip type to spawn (optional)
   */
  spawnRandomCollectible(xPos = null, type = null) {
    // If no type specified, get a random one based on distribution
    if (!type) {
      type = this.getRandomTulipType();
    }
    
    // Determine position with fixed distance ahead
    const x = xPos !== null ? xPos : Math.random() * this.referenceWidth * 1.5 + this.referenceWidth;
    
    // Get the height range for this tulip type
    const heightRange = this.heightRanges[type];
    
    // Calculate Y position based on tulip type's height range
    const minHeightPercent = heightRange.min;
    const maxHeightPercent = heightRange.max;
    
    // Get a random position within the appropriate height range
    const heightPercent = minHeightPercent + Math.random() * (maxHeightPercent - minHeightPercent);
    
    // Convert percentage to actual canvas Y position
    const y = this.canvas.height * heightPercent;
    
    // Store relative Y for consistent positioning on resize
    const relativeY = heightPercent;
    
    // INCREASED SIZE - Determine size based on type and scaled for current screen
    const scaleFactor = this.getScaleFactor();
    let size;
    
    if (type === 'redtulip') {
      size = 40 * scaleFactor;
    } else if (type === 'pinktulip') {
      size = 36 * scaleFactor;
    } else if (type === 'goldentulip') {
      size = 40 * scaleFactor;
    }
    
    // Create and add the collectible
    const collectible = new Collectible(
      this.context,
      x,
      y,
      size,
      type,
      this.valueMap[type]
    );
    
    // Store the relative position for proper resizing
    collectible.relativeY = relativeY;
    collectible.type = type; // Ensure type is stored on the collectible
    
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
    // Use a fixed absolute pixel value rather than screen-relative
    const removalThreshold = worldOffset - 1000; // Fixed 1000px behind
    
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
    
    // Scale the collision radius by the current scale factor
    const scaledRadius = characterRadius * this.getScaleFactor();
    
    // Get character dimensions - these are estimates based on stick figure proportions
    const headRadius = scaledRadius;
    const characterHeight = headRadius * 5; // Total height including head, body, legs
    
    // Create multiple collision points to check for the character's full height
    const collisionPoints = [
      { x: adjustedCharacterX, y: characterY }, // Head center
      { x: adjustedCharacterX, y: characterY + headRadius }, // Bottom of head/top of body
      { x: adjustedCharacterX, y: characterY + headRadius * 2 }, // Middle of body
      { x: adjustedCharacterX, y: characterY + headRadius * 3 }, // Bottom of body
      { x: adjustedCharacterX, y: characterY + headRadius * 5 }  // Bottom of legs
    ];
    
    // Check each active collectible for collision with any part of the character
    this.collectibles.forEach(collectible => {
      if (!collectible.active) return;
      
      // Check if any of the character points collide with this collectible
      let collision = false;
      
      for (const point of collisionPoints) {
        // Use a slightly smaller radius for body points compared to the head
        const pointRadius = point.y === characterY ? scaledRadius : scaledRadius * 0.7;
        
        // Calculate distance between this character point and the collectible
        const dx = collectible.x - point.x;
        const dy = collectible.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if distance is less than sum of radii (collision occurred)
        if (distance < collectible.size + pointRadius) {
          collision = true;
          break;
        }
      }
      
      // If collision detected, handle collection
      if (collision) {
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
   * Adjust collectibles after canvas resize
   */
  adjustCollectiblesForResize() {
    // Get new dimensions and scale factor
    const scaleFactor = this.getScaleFactor();
    
    // Adjust collectible sizes and vertical positions
    this.collectibles.forEach(collectible => {
      // Adjust size based on type and new scale
      if (collectible.type === 'redtulip') {
        collectible.size = 40 * scaleFactor;
      } else if (collectible.type === 'pinktulip') {
        collectible.size = 36 * scaleFactor;
      } else if (collectible.type === 'goldentulip') {
        collectible.size = 40 * scaleFactor;
      }
      
      // Use stored relative Y position to maintain consistent vertical positioning
      if (collectible.relativeY !== undefined) {
        collectible.y = collectible.relativeY * this.canvas.height;
      } else {
        // If no relative Y stored, calculate and store it now
        collectible.relativeY = collectible.y / this.canvas.height;
      }
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
    this.hasInitialized = false; // Reset initialization flag to allow reinitialization
    
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