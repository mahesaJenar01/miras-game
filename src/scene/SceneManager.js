/**
 * SceneManager.js - Manages all scene components
 * Handles drawing order, updates, and scene-wide effects
 * Updated to use the event system
 */
import GameEvents from '../events/GameEvents.js';
import { SCENE_EVENTS, GAME_EVENTS } from '../events/EventTypes.js';

class SceneManager {
    /**
     * Create a new SceneManager
     * @param {Scene} scene - Reference to parent Scene instance
     */
    constructor(scene) {
      this.scene = scene;
      this.context = scene.context;
      this.canvas = scene.canvas;
      
      // Active effects tracking
      this.activeEffects = new Map();
      
      // Register event listeners
      this.registerEventListeners();
    }
    
    /**
     * Register event listeners for scene management
     */
    registerEventListeners() {
      // Listen for scene-specific events
      GameEvents.on(SCENE_EVENTS.WEATHER_CHANGE, (data) => {
        const { weatherType, intensity } = data;
        this.applyWeatherEffect(weatherType, intensity);
      });
      
      GameEvents.on(SCENE_EVENTS.TIME_CHANGE, (data) => {
        const { timeOfDay } = data;
        this.applyTimeEffect(timeOfDay);
      });
      
      // Listen for effect end requests
      GameEvents.on(SCENE_EVENTS.EFFECT_END, (data) => {
        const { effect } = data;
        this.removeEffect(effect);
      });
    }
    
    /**
     * Clean up event listeners
     */
    cleanup() {
      // In a real implementation, we would keep references to listeners
      // and remove them specifically, but this is a simplified example
    }
    
    /**
     * Update all scene components
     * @param {number} worldOffset - The current world offset for parallax
     */
    update(worldOffset) {
      const { clouds } = this.scene;
      
      // Update clouds
      clouds.forEach(cloud => cloud.update());
      
      // Update sun
      this.scene.sun.update();
      
      // Update active effects
      this.updateEffects();
      
      // Emit scene update event
      GameEvents.emitScene(SCENE_EVENTS.SCENERY_UPDATE, {
        worldOffset
      });
    }
    
    /**
     * Update active scene effects
     */
    updateEffects() {
      // For each active effect, update its state
      this.activeEffects.forEach((effectData, effectType) => {
        if (effectData.update) {
          effectData.update();
        }
      });
    }
    
    /**
     * Draw all scene components in correct order
     * @param {number} worldOffset - The current world offset for parallax
     */
    draw(worldOffset) {
      // Draw background elements first
      this.drawBackground();
      
      // Draw midground elements
      this.drawMidground();
      
      // Draw ground with parallax
      this.drawGround(worldOffset);
      
      // Draw active effects
      this.drawEffects(worldOffset);
    }
    
    /**
     * Draw background elements (sky, sun)
     */
    drawBackground() {
      const { sky, sun } = this.scene;
      
      // Draw sky
      sky.draw();
      
      // Draw sun
      sun.draw();
    }
    
    /**
     * Draw midground elements (clouds)
     */
    drawMidground() {
      const { clouds } = this.scene;
      
      // Draw clouds
      clouds.forEach(cloud => cloud.draw());
    }
    
    /**
     * Draw ground with parallax effect
     * @param {number} worldOffset - The current world offset
     */
    drawGround(worldOffset) {
      const { ground } = this.scene;
      const { context } = this;
      
      // Save context state
      context.save();
      
      // Apply translation for ground (if needed)
      context.translate(0, 0);
      
      // Draw ground with the current world offset
      ground.draw(worldOffset);
      
      // Restore context state
      context.restore();
    }
    
    /**
     * Draw active scene effects
     * @param {number} worldOffset - The current world offset
     */
    drawEffects(worldOffset) {
      // For each active effect, draw it
      this.activeEffects.forEach((effectData, effectType) => {
        if (effectData.draw) {
          effectData.draw(worldOffset);
        }
      });
    }
    
    /**
     * Apply special effects to the entire scene (weather, time of day, etc.)
     * @param {string} effect - Effect type
     * @param {Object} options - Effect parameters
     */
    applyEffect(effect, options = {}) {
      switch (effect) {
        case 'sunset':
          this.applySunsetEffect(options);
          break;
        case 'rain':
          this.applyRainEffect(options);
          break;
        case 'snow':
          this.applySnowEffect(options);
          break;
        case 'night':
          this.applyNightEffect(options);
          break;
        default:
          console.warn(`Unknown effect type: ${effect}`);
          break;
      }
      
      // Emit effect applied event
      GameEvents.emitScene(SCENE_EVENTS.EFFECT_START, {
        effect,
        options,
        status: 'applied'
      });
    }
    
    /**
     * Apply sunset coloring effect
     * @param {Object} options - Effect options
     */
    applySunsetEffect(options = {}) {
      const intensity = options.intensity || 1.0;
      
      // Update sky colors for sunset
      this.scene.sky.setColors({
        top: "#FF7F50",    // Coral
        middle: "#FF7F00", // Dark orange
        bottom: "#FFD700"  // Gold
      });
      
      // Store effect in active effects map
      this.activeEffects.set('sunset', {
        intensity,
        options,
        update: () => {
          // Can implement gradual changes here
        }
      });
    }
    
    /**
     * Apply rain weather effect
     * @param {Object} options - Effect options
     */
    applyRainEffect(options = {}) {
      const intensity = options.intensity || 1.0;
      
      // Configure rain effect settings
      const rainDrops = [];
      const dropCount = Math.floor(100 * intensity);
      
      // Create rain drop particles
      for (let i = 0; i < dropCount; i++) {
        rainDrops.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height * 0.8,
          length: 10 + Math.random() * 10,
          speed: 10 + Math.random() * 5
        });
      }
      
      // Store effect in active effects map
      this.activeEffects.set('rain', {
        rainDrops,
        intensity,
        options,
        update: () => {
          // Update rain drops
          rainDrops.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > this.canvas.height * 0.8) {
              drop.y = 0;
              drop.x = Math.random() * this.canvas.width;
            }
          });
        },
        draw: () => {
          // Draw rain drops
          const context = this.context;
          context.save();
          context.strokeStyle = 'rgba(180, 180, 255, 0.5)';
          context.lineWidth = 1;
          
          rainDrops.forEach(drop => {
            context.beginPath();
            context.moveTo(drop.x, drop.y);
            context.lineTo(drop.x, drop.y + drop.length);
            context.stroke();
            context.closePath();
          });
          
          context.restore();
        }
      });
    }
    
    /**
     * Apply snow weather effect
     * @param {Object} options - Effect options
     */
    applySnowEffect(options = {}) {
      const intensity = options.intensity || 1.0;
      
      // Configure snow effect settings
      const snowflakes = [];
      const flakeCount = Math.floor(50 * intensity);
      
      // Create snowflake particles
      for (let i = 0; i < flakeCount; i++) {
        snowflakes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height * 0.8,
          size: 1 + Math.random() * 3,
          speedX: Math.random() - 0.5,
          speedY: 1 + Math.random() * 2
        });
      }
      
      // Store effect in active effects map
      this.activeEffects.set('snow', {
        snowflakes,
        intensity,
        options,
        update: () => {
          // Update snowflakes
          snowflakes.forEach(flake => {
            flake.x += flake.speedX;
            flake.y += flake.speedY;
            
            // Reset snowflake when it goes off-screen
            if (flake.y > this.canvas.height * 0.8) {
              flake.y = 0;
              flake.x = Math.random() * this.canvas.width;
            }
            
            // Wrap horizontally
            if (flake.x < 0) flake.x = this.canvas.width;
            if (flake.x > this.canvas.width) flake.x = 0;
          });
        },
        draw: () => {
          // Draw snowflakes
          const context = this.context;
          context.save();
          context.fillStyle = 'rgba(255, 255, 255, 0.8)';
          
          snowflakes.forEach(flake => {
            context.beginPath();
            context.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            context.fill();
            context.closePath();
          });
          
          context.restore();
        }
      });
    }
    
    /**
     * Apply night time effect
     * @param {Object} options - Effect options
     */
    applyNightEffect(options = {}) {
      const intensity = options.intensity || 1.0;
      
      // Update sky colors for night
      this.scene.sky.setColors({
        top: "#000033",    // Dark blue
        middle: "#000066",  // Navy blue
        bottom: "#000099"  // Slightly lighter blue
      });
      
      // Store effect in active effects map
      this.activeEffects.set('night', {
        intensity,
        options,
        draw: (worldOffset) => {
          // Draw overlay with stars
          const context = this.context;
          context.save();
          
          // Draw semi-transparent overlay
          context.fillStyle = `rgba(0, 0, 30, ${0.5 * intensity})`;
          context.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.8);
          
          // Draw stars (fixed in world space, but positioned based on worldOffset)
          const starSeed = Math.floor(worldOffset / 100);
          const starCount = 100;
          
          context.fillStyle = 'rgba(255, 255, 255, 0.8)';
          
          for (let i = 0; i < starCount; i++) {
            // Use deterministic "random" based on seed and index
            const x = ((i * 17 + starSeed * 23) % this.canvas.width);
            const y = ((i * 13 + starSeed * 31) % (this.canvas.height * 0.7));
            const size = (((i * 7 + starSeed * 13) % 3) + 1) * 0.5;
            
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
            context.closePath();
          }
          
          context.restore();
        }
      });
      
      // Emit time change event
      GameEvents.emitScene(SCENE_EVENTS.TIME_CHANGE, {
        timeOfDay: 'night',
        intensity
      });
    }
    
    /**
     * Apply specific weather effect
     * @param {string} weatherType - Type of weather ('rain', 'snow', 'clear')
     * @param {number} intensity - Intensity of the effect (0.0 to 1.0)
     */
    applyWeatherEffect(weatherType, intensity = 1.0) {
      // Remove existing weather effects
      this.removeEffect('rain');
      this.removeEffect('snow');
      
      // Apply the new weather effect
      if (weatherType === 'rain') {
        this.applyRainEffect({ intensity });
      } else if (weatherType === 'snow') {
        this.applySnowEffect({ intensity });
      }
      
      // Emit weather change event
      GameEvents.emitScene(SCENE_EVENTS.WEATHER_CHANGE, {
        weatherType,
        intensity,
        status: 'applied'
      });
    }
    
    /**
     * Apply specific time of day effect
     * @param {string} timeOfDay - Time of day ('day', 'sunset', 'night')
     */
    applyTimeEffect(timeOfDay) {
      // Remove existing time effects
      this.removeEffect('sunset');
      this.removeEffect('night');
      
      // Apply the new time effect
      if (timeOfDay === 'sunset') {
        this.applySunsetEffect();
      } else if (timeOfDay === 'night') {
        this.applyNightEffect();
      } else {
        // Reset to default day colors
        this.scene.sky.setColors({
          top: "#C9D9FB",    // Light blue
          middle: "#E3D1F4",  // Soft lavender
          bottom: "#F8E1EC"   // Light pink
        });
      }
      
      // Emit time change event
      GameEvents.emitScene(SCENE_EVENTS.TIME_CHANGE, {
        timeOfDay,
        status: 'applied'
      });
    }
    
    /**
     * Remove a specific effect
     * @param {string} effect - The effect type to remove
     */
    removeEffect(effect) {
      if (this.activeEffects.has(effect)) {
        // Execute any cleanup associated with the effect
        const effectData = this.activeEffects.get(effect);
        if (effectData.cleanup) {
          effectData.cleanup();
        }
        
        // Remove from active effects
        this.activeEffects.delete(effect);
        
        // Emit effect end event
        GameEvents.emitScene(SCENE_EVENTS.EFFECT_END, {
          effect,
          status: 'removed'
        });
      }
    }
  }
  
  export default SceneManager;