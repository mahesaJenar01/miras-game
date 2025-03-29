/**
 * CollectibleManager.js - Manages all collectible items
 * Handles generation, updating, and collision detection for collectibles
 */
import GameEvents from '../../events/GameEvents.js';
import { COLLECTIBLE_EVENTS } from '../../events/EventTypes.js';
import TulipFlower from './TulipFlower.js';

class CollectibleManager {
  /**
   * Create a new collectible manager
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {Ground} ground - Reference to the ground for positioning
   * @param {number} initialWorldOffset - Initial world offset
   */
  constructor(context, ground, initialWorldOffset = 0) {
    this.context = context;
    this.ground = ground;
    this.collectibles = [];
    this.collectedCount = 0;
    this.totalGenerated = 0;
    
    // Generation tracking
    this.generatedUpTo = initialWorldOffset;
    this.generationBatchSize = context.canvas.width * 2; // Generate 2 screens ahead
    this.flowersPerScreen = Math.floor(Math.random() * 3) + 2; // 2-4 flowers per screen
    
    // Generate initial collectibles
    this.generateCollectibles(initialWorldOffset);
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners
   */
  registerEventListeners() {
    // No specific event listeners needed for now
    // Could listen for game events like level changes if needed
  }
  
  /**
   * Clean up event listeners
   */
  cleanup() {
    // Clean up any registered event listeners
    // None for now, but could be added in the future
  }
  
  /**
   * Generate collectibles ahead of the current world position
   * @param {number} worldOffset - Current world offset
   */
  generateCollectibles(worldOffset) {
    // Only generate if we're getting close to the end of previously generated items
    if (this.generatedUpTo - worldOffset < this.context.canvas.width) {
      const startX = this.generatedUpTo;
      const endX = startX + this.generationBatchSize;
      const screenWidth = this.context.canvas.width;
      
      // Calculate how many screens we're generating for
      const screensToGenerate = this.generationBatchSize / screenWidth;
      const totalFlowers = Math.floor(this.flowersPerScreen * screensToGenerate);
      
      // Generate flowers
      for (let i = 0; i < totalFlowers; i++) {
        // Distribute flowers along the generation area
        const rangePerFlower = this.generationBatchSize / totalFlowers;
        const minX = startX + (i * rangePerFlower);
        const maxX = minX + rangePerFlower;
        
        // Get ground Y position for flower placement
        const groundY = this.ground ? this.ground.y : this.context.canvas.height * 0.8;
        
        // Create and add a new tulip flower
        const tulip = TulipFlower.createRandom(this.context, minX, maxX, groundY);
        this.collectibles.push(tulip);
        this.totalGenerated++;
      }
      
      // Update the generation boundary
      this.generatedUpTo = endX;
      
      // Randomize the number of flowers for the next batch
      this.flowersPerScreen = Math.floor(Math.random() * 3) + 2; // 2-4 flowers per screen
      
      // Emit event that collectibles were generated - FIX: Use emit() instead of emitCollectible()
      GameEvents.emit(COLLECTIBLE_EVENTS.COLLECTIBLE_GENERATED, {
        count: totalFlowers,
        totalGenerated: this.totalGenerated,
        worldOffset: worldOffset,
        range: { start: startX, end: endX }
      });
    }
  }
  
  /**
   * Update all collectibles and check for collisions
   * @param {number} worldOffset - Current world offset
   * @param {Character} character - The character to check collisions with
   */
  update(worldOffset, character) {
    // Generate more collectibles if needed
    this.generateCollectibles(worldOffset);
    
    // Store previous collected count for change detection
    const previousCount = this.collectedCount;
    
    if (!character) {
      console.error('Character is missing in CollectibleManager.update!');
    } else {
      console.log('Character position:', character.x, character.y);
    }
    
    // Update each collectible and check for collisions
    this.collectibles = this.collectibles.filter(collectible => {
      // Check if the collectible is visible or nearby
      if (this.isNearViewport(collectible, worldOffset)) {
        // Enhanced debug for collectibles
        console.log('Checking collectible:', {
          x: collectible.x, 
          y: collectible.y,
          screenX: collectible.x - worldOffset,
          isCollected: collectible.isCollected
        });
        
        // Check for collision if not already collected
        if (!collectible.isCollected && character) {
          if (collectible.checkCollision(character)) {
            // Log collection
            console.log('COLLECTING FLOWER!');
            collectible.collect();
            this.collectedCount += collectible.value;
          }
        }
        
        // Update and keep if still active
        return collectible.update();
      } else if (collectible.x < worldOffset - this.context.canvas.width) {
        // Remove if far behind the viewport
        return false;
      }
      // Keep if ahead of viewport
      return true;
    });
    
    // If count changed, emit event
    if (this.collectedCount !== previousCount) {
      console.log('Count updated:', this.collectedCount);
      GameEvents.emit(COLLECTIBLE_EVENTS.COLLECTIBLE_COUNT_UPDATED, {
        count: this.collectedCount,
        previousCount: previousCount,
        change: this.collectedCount - previousCount
      });
    }
  }  
  
  /**
   * Check if a collectible is near the viewport and should be updated
   * @param {Collectible} collectible - The collectible to check
   * @param {number} worldOffset - Current world offset
   * @returns {boolean} True if the collectible is near the viewport
   */
  isNearViewport(collectible, worldOffset) {
    const screenX = collectible.x - worldOffset;
    const screenWidth = this.context.canvas.width;
    
    // Update if within or slightly outside the viewport
    return screenX > -100 && screenX < screenWidth + 100;
  }
  
  /**
   * Draw all visible collectibles
   * @param {number} worldOffset - Current world offset
   */
  draw(worldOffset) {
    // Draw each collectible
    this.collectibles.forEach(collectible => {
      if (collectible.isVisible(worldOffset, this.context.canvas.width)) {
        collectible.draw(worldOffset);
      }
    });
  }
  
  /**
   * Get the current collected count
   * @returns {number} The number of collectibles collected
   */
  getCollectedCount() {
    return this.collectedCount;
  }
  
  /**
   * Reset the collected count (if needed for game restart)
   */
  resetCount() {
    const previousCount = this.collectedCount;
    this.collectedCount = 0;
    
    // Emit count updated event - FIX: Use emit() instead of emitCollectible()
    GameEvents.emit(COLLECTIBLE_EVENTS.COLLECTIBLE_COUNT_UPDATED, {
      count: 0,
      previousCount: previousCount,
      change: -previousCount
    });
  }
  
  /**
   * Clear all collectibles (if needed for game restart)
   */
  clearCollectibles() {
    this.collectibles = [];
    this.totalGenerated = 0;
    this.generatedUpTo = 0;
  }
}

export default CollectibleManager;