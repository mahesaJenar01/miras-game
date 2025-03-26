/**
 * ParticleSystem.js - Reusable particle effect system
 * Creates and manages particles for various visual effects
 */
class Particle {
    /**
     * Create a new particle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Particle size
     * @param {string} color - Particle color with alpha
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {number} life - Life duration in frames
     */
    constructor(x, y, size, color, vx, vy, life) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.vx = vx;
      this.vy = vy;
      this.life = life;
      this.maxLife = life;
      this.active = true;
    }
    
    /**
     * Update particle position and life
     */
    update() {
      // Update position
      this.x += this.vx;
      this.y += this.vy;
      
      // Decrease life
      this.life--;
      
      // Deactivate if life is depleted
      if (this.life <= 0) {
        this.active = false;
      }
    }
    
    /**
     * Draw the particle
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     */
    draw(context) {
      // Calculate opacity based on remaining life
      const opacity = this.life / this.maxLife;
      
      // Extract RGB from color and create new color with calculated opacity
      let color = this.color;
      if (this.color.startsWith('rgba')) {
        // Replace opacity in existing rgba
        color = this.color.replace(/[\d.]+\)$/, `${opacity})`);
      } else if (this.color.startsWith('rgb')) {
        // Convert rgb to rgba
        color = this.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
      } else {
        // For hex or named colors, use a default rgba
        color = `rgba(255, 255, 255, ${opacity})`;
      }
      
      // Draw the particle
      context.beginPath();
      context.arc(this.x, this.y, this.size * opacity, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
      context.closePath();
    }
  }
  
  class ParticleSystem {
    /**
     * Create a new particle system
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     */
    constructor(context) {
      this.context = context;
      this.particles = [];
      this.config = {
        minSize: 1,
        maxSize: 5,
        minSpeed: 0.5,
        maxSpeed: 2,
        minLife: 10,
        maxLife: 30,
        color: 'rgba(255, 255, 255, 0.8)'
      };
    }
    
    /**
     * Configure the particle system
     * @param {Object} config - Configuration object
     */
    configure(config) {
      Object.assign(this.config, config);
      return this;
    }
    
    /**
     * Create a burst of particles
     * @param {number} x - Origin X position
     * @param {number} y - Origin Y position
     * @param {number} count - Number of particles to create
     * @param {Object} options - Optional override configuration
     */
    burst(x, y, count, options = {}) {
      // Merge default config with options
      const config = { ...this.config, ...options };
      
      for (let i = 0; i < count; i++) {
        // Random angle
        const angle = Math.random() * Math.PI * 2;
        
        // Random speed
        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        
        // Calculate velocity components
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        // Random size
        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        
        // Random life
        const life = config.minLife + Math.random() * (config.maxLife - config.minLife);
        
        // Create and add particle
        const particle = new Particle(x, y, size, config.color, vx, vy, life);
        this.particles.push(particle);
      }
      
      return this;
    }
    
    /**
     * Create a directional spray of particles
     * @param {number} x - Origin X position
     * @param {number} y - Origin Y position
     * @param {number} count - Number of particles to create
     * @param {number} angle - Base angle in radians
     * @param {number} spread - Angle spread in radians
     * @param {Object} options - Optional override configuration
     */
    spray(x, y, count, angle, spread, options = {}) {
      // Merge default config with options
      const config = { ...this.config, ...options };
      
      for (let i = 0; i < count; i++) {
        // Calculate angle within spread
        const particleAngle = angle - (spread / 2) + Math.random() * spread;
        
        // Random speed
        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        
        // Calculate velocity components
        const vx = Math.cos(particleAngle) * speed;
        const vy = Math.sin(particleAngle) * speed;
        
        // Random size
        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        
        // Random life
        const life = config.minLife + Math.random() * (config.maxLife - config.minLife);
        
        // Create and add particle
        const particle = new Particle(x, y, size, config.color, vx, vy, life);
        this.particles.push(particle);
      }
      
      return this;
    }
    
    /**
     * Create a trail of particles along a line
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} endX - Ending X position
     * @param {number} endY - Ending Y position
     * @param {number} count - Number of particles to create
     * @param {Object} options - Optional override configuration
     */
    trail(startX, startY, endX, endY, count, options = {}) {
      // Merge default config with options
      const config = { ...this.config, ...options };
      
      for (let i = 0; i < count; i++) {
        // Position along the line
        const t = i / count;
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t;
        
        // Random offset
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDistance = Math.random() * config.maxSize;
        const offsetX = x + Math.cos(offsetAngle) * offsetDistance;
        const offsetY = y + Math.sin(offsetAngle) * offsetDistance;
        
        // Random speed (slower for trail effect)
        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        
        // Random direction (subtle)
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed * 0.5;
        const vy = Math.sin(angle) * speed * 0.5;
        
        // Random size
        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        
        // Random life (shorter for trail effect)
        const life = config.minLife + Math.random() * (config.maxLife - config.minLife) * 0.7;
        
        // Create and add particle
        const particle = new Particle(offsetX, offsetY, size, config.color, vx, vy, life);
        this.particles.push(particle);
      }
      
      return this;
    }
    
    /**
     * Update all particles
     */
    update() {
      // Update each particle
      this.particles.forEach(particle => {
        if (particle.active) {
          particle.update();
        }
      });
      
      // Remove inactive particles
      this.particles = this.particles.filter(particle => particle.active);
      
      return this;
    }
    
    /**
     * Draw all particles
     */
    draw() {
      // Draw each particle
      this.particles.forEach(particle => {
        if (particle.active) {
          particle.draw(this.context);
        }
      });
      
      return this;
    }
    
    /**
     * Clear all particles
     */
    clear() {
      this.particles = [];
      return this;
    }
    
    /**
     * Get the count of active particles
     * @returns {number} Number of active particles
     */
    getCount() {
      return this.particles.length;
    }
  }
  
  export default ParticleSystem;