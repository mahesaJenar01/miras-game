/**
 * EnemyAnimator.js - Manages animations for enemy entities
 * Separates animation logic from enemy movement and state handling
 */
import GameEvents from '../../../events/GameEvents.js';
import { ENEMY_EVENTS } from '../../../events/EventTypes.js';

class EnemyAnimator {
  /**
   * Create a new enemy animator
   * @param {BaseEnemy} enemy - The enemy to animate
   */
  constructor(enemy) {
    this.enemy = enemy;
    
    // Animation properties
    this.frameCount = 0;
    this.animationSpeed = enemy.animationSpeed || 0.1;
    this.currentFrame = 0;
    this.maxFrames = enemy.maxFrames || 1;
    
    // Hit animation properties
    this.isHit = false;
    this.hitFrameCounter = 0;
    this.hitAnimationDuration = 10; // 10 frames for hit flash
    
    // Death animation properties
    this.isDying = false;
    this.deathFrameCounter = 0;
    this.deathAnimationDuration = 30; // 30 frames for death animation
    
    // Special animations by enemy type
    this.specialAnimations = {};
    this.initializeSpecialAnimations();
  }
  
  /**
   * Initialize special animations based on enemy type
   */
  initializeSpecialAnimations() {
    switch (this.enemy.type) {
      case 'snake':
        this.specialAnimations = {
          slither: {
            progress: 0,
            speed: 0.05,
            amplitude: 8
          }
        };
        break;
      case 'tiger':
        this.specialAnimations = {
          run: {
            legPhase: 0,
            speed: 0.15
          },
          pounce: {
            active: false,
            progress: 0,
            duration: 30
          }
        };
        break;
      case 'bird':
        this.specialAnimations = {
          flap: {
            angle: 0,
            speed: 0.15,
            intensity: 1
          },
          swoop: {
            active: false,
            progress: 0,
            duration: 45
          }
        };
        break;
    }
  }
  
  /**
   * Update all animations
   */
  update() {
    // Update frame-based animation
    this.updateFrameAnimation();
    
    // Update hit animation if active
    if (this.isHit) {
      this.updateHitAnimation();
    }
    
    // Update death animation if active
    if (this.isDying) {
      this.updateDeathAnimation();
    }
    
    // Update special animations based on enemy type
    this.updateSpecialAnimations();
  }
  
  /**
   * Update frame-based animation
   */
  updateFrameAnimation() {
    this.frameCount++;
    
    // Update animation frame
    if (this.frameCount >= 1 / this.animationSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.maxFrames;
      this.frameCount = 0;
      
      // Emit animation frame event
      GameEvents.emit(ENEMY_EVENTS.ENEMY_ANIMATION, {
        type: this.enemy.type,
        frame: this.currentFrame,
        x: this.enemy.x,
        y: this.enemy.y
      });
    }
  }
  
  /**
   * Update hit animation
   */
  updateHitAnimation() {
    this.hitFrameCounter++;
    
    if (this.hitFrameCounter >= this.hitAnimationDuration) {
      this.isHit = false;
      this.hitFrameCounter = 0;
    }
  }
  
  /**
   * Update death animation
   * @returns {boolean} True if death animation is complete
   */
  updateDeathAnimation() {
    this.deathFrameCounter++;
    
    // Calculate progress (0 to 1)
    const progress = this.deathFrameCounter / this.deathAnimationDuration;
    
    // Apply death animation effects to enemy
    if (this.enemy) {
      // Fade out by reducing opacity
      this.enemy.opacity = 1 - progress;
      
      // Fall effect if appropriate for this enemy type
      if (this.enemy.type !== 'bird') { // Ground enemies fall down
        this.enemy.yOffset += 2;
      } else { // Birds fall at an angle
        this.enemy.yOffset += progress * 5;
        this.enemy.xOffset -= progress * 2;
      }
    }
    
    // Check if animation is complete
    if (this.deathFrameCounter >= this.deathAnimationDuration) {
      this.isDying = false;
      this.deathFrameCounter = 0;
      return true;
    }
    
    return false;
  }
  
  /**
   * Update special animations based on enemy type
   */
  updateSpecialAnimations() {
    switch (this.enemy.type) {
      case 'snake':
        this.updateSnakeAnimations();
        break;
      case 'tiger':
        this.updateTigerAnimations();
        break;
      case 'bird':
        this.updateBirdAnimations();
        break;
    }
  }
  
  /**
   * Update snake-specific animations
   */
  updateSnakeAnimations() {
    const slither = this.specialAnimations.slither;
    
    // Update slither progress
    slither.progress += slither.speed;
    
    // Apply slithering motion to enemy if it exists
    if (this.enemy) {
      this.enemy.slitherOffset = Math.sin(slither.progress) * slither.amplitude;
    }
  }
  
  /**
   * Update tiger-specific animations
   */
  updateTigerAnimations() {
    const run = this.specialAnimations.run;
    const pounce = this.specialAnimations.pounce;
    
    // Update running animation
    run.legPhase += run.speed;
    
    // Update pounce animation if active
    if (pounce.active) {
      pounce.progress += 1 / pounce.duration;
      
      if (pounce.progress >= 1) {
        pounce.active = false;
        pounce.progress = 0;
      }
    }
    
    // Apply animations to enemy if it exists
    if (this.enemy) {
      // Apply leg phase
      this.enemy.legPhase = run.legPhase;
      
      // Apply pounce effect
      if (pounce.active) {
        // Calculate pounce height using sine curve for smooth up and down
        const pounceHeight = Math.sin(pounce.progress * Math.PI) * 30;
        this.enemy.pounceHeight = pounceHeight;
      } else {
        this.enemy.pounceHeight = 0;
      }
    }
  }
  
  /**
   * Update bird-specific animations
   */
  updateBirdAnimations() {
    const flap = this.specialAnimations.flap;
    const swoop = this.specialAnimations.swoop;
    
    // Update flapping animation
    flap.angle += flap.speed;
    
    // Update swoop animation if active
    if (swoop.active) {
      swoop.progress += 1 / swoop.duration;
      
      if (swoop.progress >= 1) {
        swoop.active = false;
        swoop.progress = 0;
      }
    }
    
    // Apply animations to enemy if it exists
    if (this.enemy) {
      // Apply wing flap angle
      this.enemy.flapAngle = flap.angle;
      
      // Apply swoop effect
      if (swoop.active) {
        // Calculate swoop curve using sine for down-and-up motion
        const swoopDepth = Math.sin(swoop.progress * Math.PI) * 150;
        this.enemy.swoopDepth = swoopDepth;
      } else {
        this.enemy.swoopDepth = 0;
      }
    }
  }
  
  /**
   * Start hit animation
   */
  startHitAnimation() {
    this.isHit = true;
    this.hitFrameCounter = 0;
  }
  
  /**
   * Start death animation
   */
  startDeathAnimation() {
    this.isDying = true;
    this.deathFrameCounter = 0;
  }
  
  /**
   * Start a special animation
   * @param {string} animationName - Name of the special animation to start
   */
  startSpecialAnimation(animationName) {
    switch (this.enemy.type) {
      case 'tiger':
        if (animationName === 'pounce') {
          this.specialAnimations.pounce.active = true;
          this.specialAnimations.pounce.progress = 0;
        }
        break;
      case 'bird':
        if (animationName === 'swoop') {
          this.specialAnimations.swoop.active = true;
          this.specialAnimations.swoop.progress = 0;
        }
        break;
    }
  }
  
  /**
   * Get the current frame of animation
   * @returns {number} Current animation frame index
   */
  getCurrentFrame() {
    return this.currentFrame;
  }
  
  /**
   * Get the opacity value for rendering (for hit flash and death animation)
   * @returns {number} Opacity value (0-1)
   */
  getOpacity() {
    // Flash effect when hit
    if (this.isHit) {
      // Alternate between visible and invisible rapidly
      return (this.hitFrameCounter % 2 === 0) ? 1 : 0.3;
    }
    
    // Fade out when dying
    if (this.isDying) {
      return 1 - (this.deathFrameCounter / this.deathAnimationDuration);
    }
    
    // Default opacity
    return 1;
  }
}

export default EnemyAnimator;