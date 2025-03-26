/**
 * Cape.js - A heroic cape accessory for the Attacker
 * Draws a dynamic flowing cape with wave animations
 */
class Cape {
    /**
     * Create a new cape accessory
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     * @param {Character} character - The character wearing the cape
     */
    constructor(context, character) {
      this.context = context;
      this.character = character;
      
      // Cape properties
      this.color = character.config.color; // Same color as character
      this.gradientEndColor = "#1D43FF"; // Darker blue at the bottom
      this.waveFrequency = 3; // Base frequency of wave pattern
      this.waveAmplitude = character.config.radius * 0.3; // Base amplitude of wave
      this.time = 0; // For animation
    }
    
    /**
     * Draw the cape with flowing animation
     */
    draw() {
      // Get character properties
      const { x, y, config } = this.character;
      const radius = config.radius;
      
      // Calculate cape dimensions
      const capeWidth = radius * 2;
      const capeLength = config.bodyLength * 1.2;
      
      // Get animation progress from attacker if available
      let attackProgress = 0;
      if (this.character.animator && this.character.animator.isAttacking) {
        const animProgress = this.character.animator.attackFrame / this.character.animator.attackDuration;
        attackProgress = animProgress > 0.2 && animProgress < 0.7 ? (animProgress - 0.2) / 0.5 : (animProgress >= 0.7 ? 1 : 0);
      }
      
      // Update time for wave animation
      this.time += 0.1;
      
      // Cape waves based on the attack animation and time
      const waveAmplitude = this.waveAmplitude * (1 + attackProgress * 2);
      const waveFrequency = this.waveFrequency + attackProgress * 2;
      
      // Save context state
      this.context.save();
      
      // Begin drawing cape
      this.context.beginPath();
      this.context.moveTo(x, y + radius * 0.5);
      
      // Draw a wavy cape
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const capeY = y + radius * 0.5 + t * capeLength;
        const waveOffset = Math.sin(t * waveFrequency * Math.PI + this.time) * waveAmplitude;
        const capeX = x - capeWidth / 2 + waveOffset;
        
        this.context.lineTo(capeX, capeY);
      }
      
      for (let i = 20; i >= 0; i--) {
        const t = i / 20;
        const capeY = y + radius * 0.5 + t * capeLength;
        const waveOffset = Math.sin(t * waveFrequency * Math.PI + this.time + Math.PI) * waveAmplitude;
        const capeX = x + capeWidth / 2 + waveOffset;
        
        this.context.lineTo(capeX, capeY);
      }
      
      // Close the path back to the starting point
      this.context.lineTo(x, y + radius * 0.5);
      
      // Fill with a gradient
      const capeGradient = this.context.createLinearGradient(
        x, y + radius * 0.5,
        x, y + radius * 0.5 + capeLength
      );
      capeGradient.addColorStop(0, this.color); // Match the hero color at the top
      capeGradient.addColorStop(1, this.gradientEndColor); // Darker blue at the bottom
      
      this.context.fillStyle = capeGradient;
      this.context.fill();
      this.context.closePath();
      
      // Restore context state
      this.context.restore();
    }
    
    /**
     * Update cape animation properties
     */
    update() {
      // Increment time for wave animation
      this.time += 0.1;
    }
    
    /**
     * Update position if character moves
     * No explicit update needed as we calculate position based on character in draw()
     */
    updatePosition() {
      // Position is calculated dynamically in draw method
    }
    
    /**
     * Configure cape properties
     * @param {Object} config - Configuration object
     */
    configure(config = {}) {
      if (config.color !== undefined) this.color = config.color;
      if (config.gradientEndColor !== undefined) this.gradientEndColor = config.gradientEndColor;
      if (config.waveFrequency !== undefined) this.waveFrequency = config.waveFrequency;
      if (config.waveAmplitude !== undefined) this.waveAmplitude = config.waveAmplitude;
    }
  }
  
  export default Cape;