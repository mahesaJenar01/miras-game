/**
 * HitEffectSystem.js - Visual feedback for hits and defeats
 * Creates particles and animations for combat interactions
 */
import ParticleSystem from '../character/effects/ParticleSystem.js';
import GlowEffect from '../character/effects/GlowEffect.js';
import GameEvents from '../../events/GameEvents.js';
import { CHARACTER_EVENTS, ENEMY_EVENTS, AUDIO_EVENTS } from '../../events/EventTypes.js';

class HitEffectSystem {
  /**
   * Create a new hit effect system
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   */
  constructor(context) {
    this.context = context;
    
    // Create particle systems for different effects
    this.hitParticles = new ParticleSystem(context);
    this.defeatParticles = new ParticleSystem(context);
    
    // Create glow effect for highlights
    this.glowEffect = new GlowEffect(context);
    
    // Register event listeners
    this.registerEventListeners();
    
    // Effect configurations for different enemy types
    this.effectConfigs = {
      snake: {
        hitColor: '#5D8233', // Green
        defeatColor: '#7EA451', // Lighter green
        particleCount: 15
      },
      tiger: {
        hitColor: '#FF8C00', // Orange
        defeatColor: '#FFA500', // Brighter orange
        particleCount: 20
      },
      bird: {
        hitColor: '#4A6DE5', // Blue
        defeatColor: '#6A8DFF', // Lighter blue
        particleCount: 12
      },
      default: {
        hitColor: '#FF10F0', // Pink (sword color)
        defeatColor: '#FFFFFF', // White
        particleCount: 15
      }
    };
  }
  
  /**
   * Register event listeners for hit and defeat events
   */
  registerEventListeners() {
    // Listen for attack hit events
    GameEvents.on(CHARACTER_EVENTS.ATTACK_HIT, (data) => {
      if (data.hitbox && data.hitbox.swordTip) {
        this.createSwingEffect(data.hitbox.swordTip, data.progress || 0.5);
      }
    });
    
    // Listen for enemy hit events
    GameEvents.on(ENEMY_EVENTS.ENEMY_HIT, (data) => {
      if (data.x && data.y) {
        this.createHitEffect(data.x, data.y, data.type || 'default');
      }
    });
    
    // Listen for enemy defeat events
    GameEvents.on(ENEMY_EVENTS.ENEMY_DEFEATED, (data) => {
      if (data.x && data.y) {
        this.createDefeatEffect(data.x, data.y, data.type || 'default');
      }
    });
  }
  
  /**
   * Create a swing effect along the sword path
   * @param {Object} swordTip - Position {x, y} of sword tip
   * @param {number} progress - Attack animation progress (0-1)
   */
  createSwingEffect(swordTip, progress) {
    // Only create effects at key swing moments
    if (progress < 0.3 || progress > 0.7) return;
    
    // Configure for swing trail
    this.hitParticles.configure({
      minSize: 2,
      maxSize: 5,
      minLife: 5,
      maxLife: 15,
      color: 'rgba(255, 16, 240, 0.6)' // Semi-transparent pink
    });
    
    // Create trail particles along sword path
    this.hitParticles.trail(
      swordTip.x - 50, // Start position
      swordTip.y - 20,
      swordTip.x, // End position
      swordTip.y,
      8 // Number of particles
    );
  }
  
  /**
   * Create a hit effect at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} enemyType - Type of enemy that was hit
   */
  createHitEffect(x, y, enemyType) {
    // Get configuration for this enemy type
    const config = this.effectConfigs[enemyType] || this.effectConfigs.default;
    
    // Configure particles for hit effect
    this.hitParticles.configure({
      minSize: 3,
      maxSize: 8,
      minLife: 10,
      maxLife: 20,
      color: config.hitColor
    });
    
    // Create a burst of particles at hit location
    this.hitParticles.burst(
      x, y, 
      config.particleCount / 2, // Fewer particles for hit vs defeat
      {
        minSpeed: 1,
        maxSpeed: 3
      }
    );
    
    // Add glow effect at hit location
    this.glowEffect.configure({
      color: `rgba(255, 255, 255, 0.6)`,
      radius: 20,
      intensity: 0.7
    }).drawCircular(x, y);
  }
  
  /**
   * Create a defeat effect at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} enemyType - Type of enemy that was defeated
   */
  createDefeatEffect(x, y, enemyType) {
    // Get configuration for this enemy type
    const config = this.effectConfigs[enemyType] || this.effectConfigs.default;
    
    // Configure particles for defeat effect
    this.defeatParticles.configure({
      minSize: 3,
      maxSize: 10,
      minLife: 20,
      maxLife: 40,
      color: config.defeatColor
    });
    
    // Create special effects based on enemy type
    switch (enemyType) {
      case 'snake':
        // Slithering away particles
        this.createSnakeDefeatEffect(x, y, config);
        break;
      case 'tiger':
        // Explosive burst for tiger
        this.createTigerDefeatEffect(x, y, config);
        break;
      case 'bird':
        // Feather explosion for bird
        this.createBirdDefeatEffect(x, y, config);
        break;
      default:
        // Generic burst
        this.defeatParticles.burst(x, y, config.particleCount);
    }
    
    // Add glow effect at defeat location
    this.glowEffect.configure({
      color: `rgba(255, 255, 255, 0.8)`,
      radius: 40,
      intensity: 0.9
    }).drawCircular(x, y);
  }
  
  /**
   * Create snake-specific defeat effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} config - Effect configuration
   */
  createSnakeDefeatEffect(x, y, config) {
    // Horizontal spray of particles to show slithering away
    this.defeatParticles.spray(
      x, y,
      config.particleCount,
      Math.PI, // Spray to the left
      Math.PI / 4, // Limited spread
      {
        minSpeed: 2,
        maxSpeed: 4
      }
    );
    
    // Add some circular particles for the impact
    this.defeatParticles.burst(
      x, y,
      config.particleCount / 2,
      {
        color: 'rgba(93, 130, 51, 0.7)' // Semi-transparent green
      }
    );
  }
  
  /**
   * Create tiger-specific defeat effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} config - Effect configuration
   */
  createTigerDefeatEffect(x, y, config) {
    // Explosion of particles in all directions
    this.defeatParticles.burst(
      x, y,
      config.particleCount * 1.5, // More particles for tiger
      {
        minSpeed: 3,
        maxSpeed: 6,
        color: config.defeatColor
      }
    );
    
    // Add some stripe-like particles
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 20;
      
      this.defeatParticles.burst(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        3, // Small number of particles per stripe
        {
          color: '#000000', // Black for tiger stripes
          minSize: 2,
          maxSize: 4
        }
      );
    }
  }
  
  /**
   * Create bird-specific defeat effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} config - Effect configuration
   */
  createBirdDefeatEffect(x, y, config) {
    // Feather-like particles floating down
    this.defeatParticles.configure({
      minSize: 2,
      maxSize: 5,
      minLife: 30,
      maxLife: 60, // Longer life for floating feathers
      color: config.defeatColor
    });
    
    // Create initial burst
    this.defeatParticles.burst(
      x, y,
      config.particleCount,
      {
        minSpeed: 1,
        maxSpeed: 3
      }
    );
    
    // Add falling feather effect with downward movement
    this.defeatParticles.spray(
      x, y,
      config.particleCount / 2,
      Math.PI / 2, // Downward
      Math.PI / 3, // Wider spread
      {
        minSpeed: 0.5,
        maxSpeed: 1.5
      }
    );
  }
  
  /**
   * Update all particle systems and effects
   * Fixed method to properly update particles
   */
  update() {
    if (this.hitParticles && typeof this.hitParticles.update === 'function') {
      this.hitParticles.update();
    }
    
    if (this.defeatParticles && typeof this.defeatParticles.update === 'function') {
      this.defeatParticles.update();
    }
  }
  
  /**
   * Draw all particle systems and effects
   * Fixed method to properly draw particles
   */
  draw() {
    if (this.hitParticles && typeof this.hitParticles.draw === 'function') {
      this.hitParticles.draw();
    }
    
    if (this.defeatParticles && typeof this.defeatParticles.draw === 'function') {
      this.defeatParticles.draw();
    }
  }
}

export default HitEffectSystem;