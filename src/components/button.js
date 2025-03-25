// Base Button class for all canvas buttons
class BaseButton {
    constructor(context, x, y, width, height, color, hoverColor, text) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.hoverColor = hoverColor;
      this.text = text;
      this.isHovered = false;
      this.isPressed = false;
      this.cornerRadius = Math.max(4, height * 0.2); // Rounded corners scaled to button size
      this.textColor = "#333";
      this.font = `bold ${Math.max(10, Math.min(20, height * 0.4))}px Arial`; // Responsive font size
      this.glowEffectRadius = Math.max(3, height * 0.1);
      this.decorations = this.generateDecorations();
    }
    
    // Generate decorative elements for the button
    generateDecorations() {
      const decorations = [];
      
      // Size scaled to button height with min/max constraints
      const decorSize = Math.max(4, Math.min(10, this.height * 0.15));
      
      // Add small decorative flower in the corner
      decorations.push({
        type: 'flower',
        x: this.width * 0.85,
        y: this.height * 0.25,
        size: decorSize,
        color: this.getComplementaryColor(this.color)
      });
      
      return decorations;
    }
    
    // Get a complementary color for decorations
    getComplementaryColor(color) {
      // Simple way to get a complementary color - we'll just use predetermined pairs
      const colorMap = {
        "#B5EAD7": "#FF9AA2", // Mint green -> Light pink
        "#C7CEEA": "#FFDAC1", // Light blue -> Light peach
        "#FFDAC1": "#C7CEEA", // Light peach -> Light blue
        "#FFB7B2": "#B5EAD7"  // Pastel pink -> Mint green
      };
      
      return colorMap[color] || "#FF9AA2"; // Default to light pink if no match
    }
    
    // Update button position
    updatePosition(x, y) {
      this.x = x;
      this.y = y;
    }
    
    // Set button state
    setHovered(isHovered) {
      this.isHovered = isHovered;
    }
    
    setPressed(isPressed) {
      this.isPressed = isPressed;
    }
    
    // Draw a decorative flower
    drawFlower(x, y, size, color) {
      const context = this.context;
      const petalCount = 5;
      
      // Draw petals
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const petalX = x + Math.cos(angle) * size;
        const petalY = y + Math.sin(angle) * size;
        
        context.beginPath();
        context.arc(petalX, petalY, size * 0.7, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.closePath();
      }
      
      // Draw center
      context.beginPath();
      context.arc(x, y, size * 0.5, 0, Math.PI * 2);
      context.fillStyle = "#FFEB85"; // Yellow center
      context.fill();
      context.closePath();
    }
    
    // Draw the basic button
    draw() {
      const { context, x, y, width, height, cornerRadius } = this;
      
      // Determine current color based on state
      let currentColor = this.color;
      if (this.isPressed) {
        // Darker when pressed, like in the CSS
        currentColor = this.darkenColor(this.color, 30);
      } else if (this.isHovered) {
        currentColor = this.hoverColor;
      }
      
      // Create gradient like in the game's ground elements
      const gradient = context.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, currentColor);
      gradient.addColorStop(1, this.darkenColor(currentColor, 10));
      
      // Draw button shadow
      context.beginPath();
      this.roundRect(context, x + 2, y + 2, width, height, cornerRadius);
      context.fillStyle = "rgba(0, 0, 0, 0.2)";
      context.fill();
      context.closePath();
      
      // Draw button body
      context.beginPath();
      this.roundRect(context, x, y, width, height, cornerRadius);
      context.fillStyle = gradient;
      context.fill();
      
      // Add subtle border
      context.strokeStyle = this.darkenColor(currentColor, 15);
      context.lineWidth = 1;
      context.stroke();
      context.closePath();
      
      // Draw decorations
      this.decorations.forEach(decoration => {
        if (decoration.type === 'flower') {
          this.drawFlower(
            x + decoration.x, 
            y + decoration.y,
            decoration.size,
            decoration.color
          );
        }
      });
      
      // Draw button text
      context.font = this.font;
      context.fillStyle = this.textColor;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(this.text, x + width / 2, y + height / 2);
      
      // Add glow effect when hovered
      if (this.isHovered && !this.isPressed) {
        const scale = 1.03;
        const glowX = x - (width * (scale - 1) / 2);
        const glowY = y - (height * (scale - 1) / 2);
        const glowWidth = width * scale;
        const glowHeight = height * scale;
        
        context.beginPath();
        this.roundRect(context, glowX, glowY, glowWidth, glowHeight, cornerRadius + 2);
        context.strokeStyle = this.hoverColor;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
      }
    }
    
    // Helper function to draw rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    
    // Helper function to darken a color for effects
    darkenColor(color, percent) {
      // Convert hex to RGB
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      // Darken
      r = Math.max(0, r - percent);
      g = Math.max(0, g - percent);
      b = Math.max(0, b - percent);
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  
  // Move Button class
  class MoveButton extends BaseButton {
    constructor(context, x, y, width, height) {
      super(context, x, y, width, height, "#B5EAD7", "#9EDAC4", "Move");
      
      // Add special move button decoration - small arrow
      this.decorations.push({
        type: 'arrow',
        x: this.width * 0.2,
        y: this.height * 0.5
      });
    }
    
    draw() {
      super.draw();
      
      // Draw the arrow decoration
      const arrowDecoration = this.decorations.find(d => d.type === 'arrow');
      if (arrowDecoration) {
        const { x: arrowX, y: arrowY } = arrowDecoration;
        const arrowSize = this.height * 0.25;
        
        this.context.beginPath();
        this.context.moveTo(this.x + arrowX - arrowSize, this.y + arrowY);
        this.context.lineTo(this.x + arrowX, this.y + arrowY - arrowSize / 2);
        this.context.lineTo(this.x + arrowX, this.y + arrowY + arrowSize / 2);
        this.context.closePath();
        this.context.fillStyle = this.textColor;
        this.context.fill();
      }
    }
  }
  
  // Jump Button class
  class JumpButton extends BaseButton {
    constructor(context, x, y, width, height) {
      super(context, x, y, width, height, "#C7CEEA", "#B1BAE4", "Jump");
      
      // Add special jump button decoration - small upward arrow
      this.decorations.push({
        type: 'upArrow',
        x: this.width * 0.2,
        y: this.height * 0.5
      });
    }
    
    draw() {
      super.draw();
      
      // Draw the up arrow decoration
      const arrowDecoration = this.decorations.find(d => d.type === 'upArrow');
      if (arrowDecoration) {
        const { x: arrowX, y: arrowY } = arrowDecoration;
        const arrowSize = this.height * 0.25;
        
        this.context.beginPath();
        this.context.moveTo(this.x + arrowX, this.y + arrowY - arrowSize);
        this.context.lineTo(this.x + arrowX - arrowSize / 2, this.y + arrowY);
        this.context.lineTo(this.x + arrowX + arrowSize / 2, this.y + arrowY);
        this.context.closePath();
        this.context.fillStyle = this.textColor;
        this.context.fill();
      }
    }
  }
  
  // Attack Button class with cooldown visualization
  class AttackButton extends BaseButton {
    constructor(context, x, y, width, height) {
      super(context, x, y, width, height, "#FFDAC1", "#FFCBAA", "Attack");
      this.cooldownPercent = 0;
      
      // Add special attack button decoration - small star
      this.decorations.push({
        type: 'star',
        x: this.width * 0.2,
        y: this.height * 0.5,
        size: this.height * 0.2
      });
    }
    
    // Set cooldown percentage (0 to 1)
    setCooldown(percent) {
      this.cooldownPercent = Math.max(0, Math.min(1, percent));
    }
    
    // Draw a star decoration
    drawStar(x, y, size) {
      const context = this.context;
      const points = 5;
      const outerRadius = size;
      const innerRadius = size / 2;
      
      context.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (points * 2)) * Math.PI * 2;
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        
        if (i === 0) {
          context.moveTo(pointX, pointY);
        } else {
          context.lineTo(pointX, pointY);
        }
      }
      context.closePath();
      
      context.fillStyle = "#FF10F0"; // Match the sword color from attacker.js
      context.fill();
    }
    
    draw() {
      super.draw();
      
      // Draw the star decoration
      const starDecoration = this.decorations.find(d => d.type === 'star');
      if (starDecoration) {
        this.drawStar(
          this.x + starDecoration.x,
          this.y + starDecoration.y,
          starDecoration.size
        );
      }
      
      // Draw cooldown overlay if in cooldown
      if (this.cooldownPercent > 0) {
        const { x, y, width, height, cornerRadius } = this;
        
        // Draw semi-transparent overlay from bottom to top based on cooldown
        this.context.beginPath();
        this.roundRect(
          this.context, 
          x, 
          y + height * (1 - this.cooldownPercent), 
          width, 
          height * this.cooldownPercent,
          // Only use rounded corners at the bottom when cooldown is ending
          this.cooldownPercent < 0.5 ? cornerRadius : 0
        );
        this.context.fillStyle = "rgba(0, 0, 0, 0.3)";
        this.context.fill();
        this.context.closePath();
      }
      
      // Add special glow effect when the button is in "attacking" state
      if (this.isPressed && this.cooldownPercent === 0) {
        const { x, y, width, height, cornerRadius } = this;
        
        // Add pink glow effect
        this.context.beginPath();
        this.roundRect(this.context, x - 5, y - 5, width + 10, height + 10, cornerRadius + 5);
        this.context.strokeStyle = "#FF10F0"; // Bright pink during attack
        this.context.lineWidth = 3;
        this.context.stroke();
        this.context.closePath();
        
        // Add second glow layer
        this.context.beginPath();
        this.roundRect(this.context, x - 10, y - 10, width + 20, height + 20, cornerRadius + 10);
        this.context.strokeStyle = "rgba(255, 16, 240, 0.5)"; // Semi-transparent pink
        this.context.lineWidth = 2;
        this.context.stroke();
        this.context.closePath();
      }
    }
  }
  
  // Button Manager class to handle all buttons
  class ButtonManager {
    constructor(context, canvas) {
      this.context = context;
      this.canvas = canvas;
      this.buttons = {
        move: null,
        jump: null,
        attack: null
      };
      
      // Calculate button positions
      this.updateButtonPositions();
    }
    
    updateButtonPositions() {
      const canvas = this.canvas;
      const canvasHeight = canvas.height;
      const canvasWidth = canvas.width;
      
      // Calculate ground positioning based on current canvas dimensions
      const groundY = canvasHeight * 0.8;
      const groundHeight = canvasHeight * 0.2;
      const grassHeight = groundHeight * 0.3; // top portion of the ground (grass)
      const dirtHeight = groundHeight * 0.7;  // remaining (dirt)
      
      // Calculate the vertical center of the dirt area
      const dirtCenterY = groundY + grassHeight + (dirtHeight / 2);
      
      // Define button dimensions relative to canvas size for better responsiveness
      const btnHeight = Math.min(dirtHeight * 0.7, canvasHeight * 0.08); // button height with max constraint
      const btnWidth = btnHeight * 2;     // width is set to twice the height
      
      // Define horizontal gaps that scale with canvas size
      const sideGap = Math.max(10, canvasWidth * 0.02);     // gap from canvas left/right edges (minimum 10px)
      const buttonGap = Math.max(5, canvasWidth * 0.01);   // gap between Attack and Jump buttons (minimum 5px)
      
      // Create buttons if they don't exist or update their positions
      if (!this.buttons.move) {
        this.buttons.move = new MoveButton(
          this.context,
          sideGap,
          dirtCenterY - btnHeight / 2,
          btnWidth,
          btnHeight
        );
      } else {
        this.buttons.move.updatePosition(
          sideGap,
          dirtCenterY - btnHeight / 2
        );
      }
      
      if (!this.buttons.jump) {
        this.buttons.jump = new JumpButton(
          this.context,
          canvasWidth - sideGap - btnWidth,
          dirtCenterY - btnHeight / 2,
          btnWidth,
          btnHeight
        );
      } else {
        this.buttons.jump.updatePosition(
          canvasWidth - sideGap - btnWidth,
          dirtCenterY - btnHeight / 2
        );
      }
      
      if (!this.buttons.attack) {
        this.buttons.attack = new AttackButton(
          this.context,
          canvasWidth - sideGap - btnWidth - buttonGap - btnWidth,
          dirtCenterY - btnHeight / 2,
          btnWidth,
          btnHeight
        );
      } else {
        this.buttons.attack.updatePosition(
          canvasWidth - sideGap - btnWidth - buttonGap - btnWidth,
          dirtCenterY - btnHeight / 2
        );
      }
    }
    
    draw() {
      // Draw all buttons
      Object.values(this.buttons).forEach(button => {
        if (button) button.draw();
      });
    }
    
    // Update cooldown for attack button
    updateAttackCooldown(percent) {
      if (this.buttons.attack) {
        this.buttons.attack.setCooldown(percent);
      }
    }
  }
  
  export { ButtonManager, BaseButton, MoveButton, JumpButton, AttackButton };