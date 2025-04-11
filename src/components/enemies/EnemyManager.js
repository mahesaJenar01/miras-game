/**
 * EnemyManager.js - Manages creation, tracking, and updating of enemies
 * Central coordinator for all enemy-related functionality
 */
import Snake from './types/Snake.js';
import Tiger from './types/Tiger.js';
import Bird from './types/Bird.js';
import GameEvents from '../../events/GameEvents.js';
import { GAME_EVENTS, CHARACTER_EVENTS, ENEMY_EVENTS, AUDIO_EVENTS } from '../../events/EventTypes.js';

class EnemyManager {
  /**
   * Create a new enemy manager
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    this.enemies = [];
    this.hasInitialized = false;
    
    // Reference dimensions for consistent spawning
    this.referenceWidth = 1920;
    this.referenceHeight = 1080;
    
    // Spawn configurations
    this.spawnDistanceMin = 800; // Minimum distance ahead to spawn
    this.spawnDistanceMax = 1200; // Maximum distance ahead to spawn
    this.enemyTypes = ['snake', 'tiger', 'bird'];
    this.typeDistributions = {
      snake: 0.5,   // 50% chance of spawning a snake
      tiger: 0.3,   // 30% chance of spawning a tiger
      bird: 0.2     // 20% chance of spawning a bird
    };
    
    // Spawn timing
    this.spawnTimer = 0;
    this.baseSpawnInterval = 180; // About 3 seconds at 60fps
    this.spawnInterval = this.baseSpawnInterval;
    this.minSpawnInterval = 90; // 1.5 seconds minimum between spawns
    
    // Track active enemy count by type
    this.activeEnemiesByType = {
      snake: 0,
      tiger: 0,
      bird: 0
    };
    
    // Maximum enemies of each type on screen at once
    this.maxEnemiesByType = {
      snake: 3,
      tiger: 2,
      bird: 2
    };

    this.rewardAmounts = {
      snake: 7,   // Snake gives 7 collectibles
      tiger: 5,   // Tiger gives 5 collectibles
      bird: 9     // Bird gives 9 collectibles
    };  

    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Register event listeners for enemy management
   */
  registerEventListeners() {
    // Listen for world updates to spawn enemies and remove off-screen ones
    GameEvents.on(GAME_EVENTS.WORLD_UPDATE, (data) => {
      if (data.worldOffset !== undefined) {
        this.handleWorldUpdate(data.worldOffset);
      }
    });
    
    // Listen for game start to initialize enemies
    GameEvents.on(GAME_EVENTS.START, () => {
      if (!this.hasInitialized) {
        this.initializeEnemies();
        this.hasInitialized = true;
      }
    });
    
    // Listen for game resize to adjust enemy positions
    GameEvents.on(GAME_EVENTS.RESIZE, () => {
      this.handleResize();
    });
    
    // Listen for attack hits to check for enemy damage
    GameEvents.on(CHARACTER_EVENTS.ATTACK_HIT, (data) => {
      if (data.hitbox) {
        this.checkAttackHits(data.hitbox, data.attacker);
      }
    });
  }
  
  /**
   * Initialize with a few enemies at game start
   */
  initializeEnemies() {
    this.enemies = [];
    
    // Add initial enemies at various distances
    this.spawnEnemy('snake', 1000);
    this.spawnEnemy('tiger', 1500);
    this.spawnEnemy('bird', 1200);
  }
  
  /**
   * Handle world updates (player moving forward)
   * @param {number} worldOffset - Current world offset value
   */
  handleWorldUpdate(worldOffset) {
    // Increment spawn timer
    this.spawnTimer++;
    
    // Spawn new enemies periodically
    if (this.spawnTimer >= this.spawnInterval) {
      // Determine enemy type based on distribution and current counts
      const enemyType = this.selectEnemyType();
      
      // Spawn ahead of player
      if (enemyType) {
        const spawnDistance = worldOffset + 
                            this.spawnDistanceMin + 
                            Math.random() * (this.spawnDistanceMax - this.spawnDistanceMin);
        
        this.spawnEnemy(enemyType, spawnDistance);
        this.spawnTimer = 0;
        
        // Gradually reduce spawn interval as game progresses (with a minimum)
        this.spawnInterval = Math.max(this.minSpawnInterval, this.spawnInterval - 1);
      }
    }
    
    // Remove enemies that are far behind the player
    this.removeOffscreenEnemies(worldOffset);
    
    // Update all enemies with the current world offset
    this.updateEnemies(worldOffset);
  }
  
  /**
   * Select an enemy type based on distribution and current counts
   * @returns {string|null} Selected enemy type or null if all at max
   */
  selectEnemyType() {
    // Filter types that haven't reached their maximum
    const availableTypes = this.enemyTypes.filter(type => 
      this.activeEnemiesByType[type] < this.maxEnemiesByType[type]
    );
    
    if (availableTypes.length === 0) return null;
    
    // Calculate total distribution weight for available types
    let totalWeight = 0;
    const weights = {};
    
    availableTypes.forEach(type => {
      weights[type] = this.typeDistributions[type];
      totalWeight += weights[type];
    });
    
    // Normalize weights
    if (totalWeight > 0) {
      availableTypes.forEach(type => {
        weights[type] /= totalWeight;
      });
    }
    
    // Select a type based on weighted distribution
    const roll = Math.random();
    let cumulativeWeight = 0;
    
    for (const type of availableTypes) {
      cumulativeWeight += weights[type];
      if (roll <= cumulativeWeight) {
        return type;
      }
    }
    
    // Fallback - return first available type
    return availableTypes[0];
  }
  
  /**
   * Spawn a new enemy
   * @param {string} type - Enemy type ('snake', 'tiger', 'bird')
   * @param {number} xPos - X position to spawn at
   * @returns {BaseEnemy} The spawned enemy
   */
  spawnEnemy(type, xPos) {
    // Get appropriate Y position based on enemy type
    let yPos;
    const groundLevel = this.canvas.height * 0.8; // Same as in the scene
    
    switch (type) {
      case 'snake':
        yPos = groundLevel - 15; // Just above ground level
        break;
      case 'tiger':
        yPos = groundLevel - 30; // Taller than snake
        break;
      case 'bird':
        // Birds spawn at varying heights in the sky
        yPos = groundLevel * 0.3 + Math.random() * groundLevel * 0.3;
        break;
      default:
        yPos = groundLevel - 20;
    }
    
    // Create the enemy based on type
    let enemy;
    
    switch (type) {
      case 'snake':
        enemy = new Snake(this.context, this.canvas, xPos, yPos);
        break;
      case 'tiger':
        enemy = new Tiger(this.context, this.canvas, xPos, yPos);
        break;
      case 'bird':
        enemy = new Bird(this.context, this.canvas, xPos, yPos);
        break;
      default:
        console.warn(`Unknown enemy type: ${type}`);
        return null;
    }
    
    // Add to enemies array and update count
    this.enemies.push(enemy);
    this.activeEnemiesByType[type]++;
    
    // Return the created enemy
    return enemy;
  }
  
  /**
   * Remove enemies that are far behind the player
   * @param {number} worldOffset - Current world offset
   */
  removeOffscreenEnemies(worldOffset) {
    const removalThreshold = worldOffset - 500; // 500px behind player
    
    // Track count before filtering
    const countsBefore = { ...this.activeEnemiesByType };
    
    // Filter out inactive and offscreen enemies
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.isActive() || enemy.x < removalThreshold) {
        // Decrement count for this enemy type
        this.activeEnemiesByType[enemy.type]--;
        return false;
      }
      return true;
    });
    
    // Ensure counts don't go below zero (safeguard)
    Object.keys(this.activeEnemiesByType).forEach(type => {
      if (this.activeEnemiesByType[type] < 0) {
        this.activeEnemiesByType[type] = 0;
      }
    });
  }
  
    /**
     * Update all active enemies
     * @param {number} worldOffset - Current world offset
     */
    updateEnemies(worldOffset) {
        // Filter out inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy && enemy.active);
        
        // Update the remaining active enemies
        this.enemies.forEach(enemy => {
        try {
            enemy.update(worldOffset);
        } catch (error) {
            console.warn(`Error updating enemy:`, error);
        }
        });
        
        // Remove enemies that are far behind the player
        this.removeOffscreenEnemies(worldOffset);
    }
  
  /**
   * Check if any enemies are hit by an attack
   * Modified to add reward collectibles when enemies are defeated
   * @param {Object} hitbox - Attack hitbox data
   * @param {Object} attacker - Attacker information
   */
  /**
   * Check if any enemies are hit by an attack
   * Improved hit detection with more forgiving collision
   * @param {Object} hitbox - Attack hitbox data
   * @param {Object} attacker - Attacker information
   */
  checkAttackHits(hitbox, attacker) {
    // Safety check - ensure we have valid hitbox data
    if (!hitbox || typeof hitbox !== 'object') {
      console.warn('Invalid hitbox data provided to checkAttackHits');
      return;
    }
    
    let hitCount = 0;
    
    // Process each enemy for potential hits
    this.enemies.forEach((enemy, index) => {
      if (enemy && enemy.active) {
        // Get enemy position in screen coordinates for accurate hit detection
        const enemyScreenX = enemy.x - hitbox.worldOffset;
        
        // Increased hit detection sensitivity based on attacker's sensitivity
        const sensitivityMultiplier = attacker.getSwordSensitivity() || 1.0;
        
        // Expand hitbox and enemy hitbox based on sensitivity
        const expandedHitbox = {
          x: hitbox.x - 20 * sensitivityMultiplier,
          y: hitbox.y - 20 * sensitivityMultiplier,
          width: (hitbox.width || 0) + 40 * sensitivityMultiplier,
          height: (hitbox.height || 0) + 40 * sensitivityMultiplier
        };
        
        const expandedEnemyHitbox = {
          x: enemyScreenX - 10 * sensitivityMultiplier,
          y: enemy.y - 10 * sensitivityMultiplier,
          width: enemy.width + 20 * sensitivityMultiplier,
          height: enemy.height + 20 * sensitivityMultiplier
        };
        
        // Check for rectangle collision with expanded hitboxes
        const isHit = (
          expandedEnemyHitbox.x < expandedHitbox.x + expandedHitbox.width &&
          expandedEnemyHitbox.x + expandedEnemyHitbox.width > expandedHitbox.x &&
          expandedEnemyHitbox.y < expandedHitbox.y + expandedHitbox.height &&
          expandedEnemyHitbox.y + expandedEnemyHitbox.height > expandedHitbox.y
        );
        
        if (isHit) {
          hitCount++;
          
          // Apply immediate defeat
          enemy.active = false; // Directly set to inactive
          
          // Reduce active enemy count for this type
          this.activeEnemiesByType[enemy.type]--;
          
          // Ensure count doesn't go below zero
          if (this.activeEnemiesByType[enemy.type] < 0) {
            this.activeEnemiesByType[enemy.type] = 0;
          }
          
          // Add reward collectibles based on enemy type
          this.addRewardCollectibles(enemy.type);
          
          // Emit enemy defeated event
          GameEvents.emit(ENEMY_EVENTS.ENEMY_DEFEATED, {
            type: enemy.type,
            x: enemy.x,
            y: enemy.y
          });
        }
      }
    });
    
    // Emit attack result event if any enemies were hit
    if (hitCount > 0) {
      GameEvents.emit(CHARACTER_EVENTS.ATTACK_HIT, {
        hitCount,
        attacker,
        hitbox: hitbox // Include hitbox for more detailed tracking
      });
    }
  }

  /**
   * Add reward collectibles when an enemy is defeated
   * @param {string} enemyType - Type of enemy defeated
   */
  addRewardCollectibles(enemyType) {
    // Get the reward amount for this enemy type
    const rewardAmount = this.rewardAmounts[enemyType] || 0;
    
    // Skip if no reward
    if (rewardAmount <= 0) return;
    
    // Access the collectible manager through game instance
    const collectibleManager = window.game ? window.game.collectibleManager : null;
    
    if (collectibleManager) {
      // Add the reward amount to the collected count
      collectibleManager.collected += rewardAmount;
      
      // Save the updated flower count to localStorage
      collectibleManager.saveFlowersCount();
      
      // Emit count update event
      collectibleManager.emitCountUpdate();
      
    }
  }

  /**
   * Simple box intersection check with reduced padding
   * @param {number} x1 - First box X position
   * @param {number} y1 - First box Y position
   * @param {number} w1 - First box width
   * @param {number} h1 - First box height
   * @param {number} x2 - Second box X position
   * @param {number} y2 - Second box Y position
   * @param {number} w2 - Second box width
   * @param {number} h2 - Second box height
   * @returns {boolean} True if boxes intersect
   */
  checkBoxIntersection(x1, y1, w1, h1, x2, y2, w2, h2) {
    // FIXED: Reduced padding from 20 to 5 pixels for more accurate collision
    const padding = 5;
    
    // Use standard box collision check with minimal padding
    return (
      x1 - padding < x2 + w2 &&
      x1 + w1 + padding > x2 &&
      y1 - padding < y2 + h2 &&
      y1 + h1 + padding > y2
    );
  }

/**
 * Simple collision check for when enemy doesn't implement its own
 * @param {BaseEnemy} enemy - The enemy to check
 * @param {Object} hitbox - The attack hitbox
 * @returns {boolean} True if enemy is hit
 */
checkEnemyHit(enemy, hitbox) {
    // Calculate enemy hitbox in world coordinates
    const enemyHitbox = {
      x: enemy.x,
      y: enemy.y,
      width: enemy.width || 40,  // Default width if not specified
      height: enemy.height || 30  // Default height if not specified
    };
    
    // Expand hitbox slightly for more forgiving hit detection
    const expandedHitbox = {
      x: hitbox.x - 10,
      y: hitbox.y - 10,
      width: (hitbox.width || 0) + 20,
      height: (hitbox.height || 0) + 20
    };
    
    // Check for rectangle collision
    return (
      enemyHitbox.x < expandedHitbox.x + expandedHitbox.width &&
      enemyHitbox.x + enemyHitbox.width > expandedHitbox.x &&
      enemyHitbox.y < expandedHitbox.y + expandedHitbox.height &&
      enemyHitbox.y + enemyHitbox.height > expandedHitbox.y
    );
  }

    /**
     * Create a visual effect at the hitbox location for feedback
     * Simple implementation that uses game events for communication
     * @param {Object} hitbox - The attack hitbox
     */
    createHitEffect(hitbox) {
        // Safety check
        if (!hitbox) return;
        
        // Calculate hit position from hitbox center
        const hitX = hitbox.x + (hitbox.width || 0) / 2;
        const hitY = hitbox.y + (hitbox.height || 0) / 2;
        
        // Emit effect event for visual feedback
        GameEvents.emit(ENEMY_EVENTS.ENEMY_HIT, {
        x: hitX,
        y: hitY,
        intensity: 1.0
        });
        
        // Play hit sound if audio system available
        GameEvents.emitAudio(AUDIO_EVENTS.PLAY_SOUND, {
        id: 'attack_hit'
        });
    }
  
    /**
     * Create defeat effects when an enemy is hit
     * @param {BaseEnemy} enemy - The defeated enemy
     */
    createDefeatEffect(enemy) {
        // Safety check
        if (!enemy) return;
        
        // Create appropriate defeat effect based on enemy type
        const effectType = enemy.type === 'bird' ? 'feather_explosion' : 'defeat_burst';
        
        // Emit effect event for visual feedback
        GameEvents.emit(ENEMY_EVENTS.ENEMY_DEFEATED, {
        type: enemy.type,
        x: enemy.x,
        y: enemy.y,
        effectType: effectType
        });
        
        // Play defeat sound if audio system available
        GameEvents.emitAudio(AUDIO_EVENTS.PLAY_SOUND, {
        id: `${enemy.type}_defeat`
        });
    }

  /**
   * Handle resize events
   */
  handleResize() {
    // No specific resize handling needed for now
    // Enemies use relative positioning based on canvas dimensions
  }
  
    /**
     * Draw all active enemies
     * @param {number} worldOffset - Current world offset for parallax
     */
    draw(worldOffset) {
    
    // Filter out inactive enemies before drawing
    const activeEnemies = this.enemies.filter(enemy => enemy && enemy.active);
    
    // Draw only active enemies
    activeEnemies.forEach((enemy, index) => {
        try {
        enemy.draw(worldOffset);
        } catch (error) {
        console.warn(`Error drawing enemy ${index}:`, error);
        }
    });
    }
  
  /**
   * Get enemy count by type
   * @param {string} type - Enemy type (optional)
   * @returns {number|Object} Count for specified type or all counts
   */
  getEnemyCount(type) {
    if (type) {
      return this.activeEnemiesByType[type] || 0;
    }
    return { ...this.activeEnemiesByType };
  }
  
  /**
   * Reset the manager (clear enemies)
   */
  reset() {
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = this.baseSpawnInterval;
    this.hasInitialized = false;
    
    // Reset type counts
    Object.keys(this.activeEnemiesByType).forEach(type => {
      this.activeEnemiesByType[type] = 0;
    });
  }
}

export default EnemyManager;