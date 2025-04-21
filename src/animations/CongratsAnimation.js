/**
 * CongratsAnimation.js - Animated text display for game ending
 * Shows words one by one with styling effects
 * Modified to clear localStorage after animation completes
 */
class CongratsAnimation {
  /**
   * Create a new congratulations animation
   * @param {CanvasRenderingContext2D} context - The canvas rendering context
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    
    // Messages to display word by word
    this.messages = [
      "Congratulations! You collected all the affirmation cards",
      "I hope this little adventure brought you joy",
      "Just like you bring joy to my life every day",
      "Happy birthday, panjang umur, sehat selalu ya!",
      "I love you, Mira!"
    ];
    
    // Animation properties
    this.currentMessageIndex = 0;
    this.currentWordIndex = 0;
    this.words = [];
    this.displayedWords = [];
    this.animationTimer = 0;
    this.wordDelay = 40; // Frames between words
    this.messageDelay = 80; // Extra frames between messages
    this.isComplete = false;
    this.hasCleanedData = false;
    
    // Text properties
    this.fontBaseSize = 0; // Will be calculated based on canvas size
    this.lineHeight = 0; // Will be calculated based on font size
    this.maxWidth = 0; // Will be calculated based on canvas width
    
    // Colors - pastel palette
    this.colors = [
      '#FF9AA2', // Pastel red
      '#FFB7B2', // Pastel salmon
      '#FFDAC1', // Pastel orange
      '#E2F0CB', // Pastel light green
      '#B5EAD7', // Pastel mint
      '#C7CEEA', // Pastel blue
      '#F7C8E0'  // Pastel pink
    ];
    
    // Calculate initial text properties based on canvas size
    this.updateTextProperties();
    
    // Prepare first message
    this.prepareNextMessage();
  }
  
  /**
   * Update text properties when canvas size changes
   */
  updateTextProperties() {
    // Calculate font size based on canvas dimensions (responsive)
    this.fontBaseSize = Math.max(16, Math.min(32, this.canvas.width * 0.04));
    this.lineHeight = this.fontBaseSize * 1.5;
    this.maxWidth = this.canvas.width * 0.8; // 80% of canvas width
  }
  
  /**
   * Prepare the next message for word-by-word animation
   */
  prepareNextMessage() {
    if (this.currentMessageIndex < this.messages.length) {
      // Split current message into words
      this.words = this.messages[this.currentMessageIndex].split(' ');
      this.currentWordIndex = 0;
      this.animationTimer = 0;
    } else {
      // All messages complete
      this.isComplete = true;
      
      // Set a timeout to clear localStorage 5 seconds after completion
      if (!this.hasCleanedData) {
        this.hasCleanedData = true;
        console.log("Animation complete. Will clear localStorage in 5 seconds...");
        
        setTimeout(() => {
          this.clearAllGameData();
        }, 5000);
      }
    }
  }
  
  /**
   * Clear all game-related data from localStorage
   * This ensures the game starts fresh next time
   */
  clearAllGameData() {
    try {
      // Clear all game-related localStorage items
      localStorage.removeItem('mirasGame_flowerCount');
      localStorage.removeItem('mirasGame_healthState');
      localStorage.removeItem('shopState');
      
      // Add any other game-specific localStorage keys here
      
      console.log("All game data has been cleared. Game will start fresh next time.");
      
      // Optional: Reload the page after a brief delay to restart the game
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error clearing game data:", error);
    }
  }
  
  /**
   * Update the animation state
   */
  update() {
    if (this.isComplete) {
      // Continue drawing even when complete to show the reset message
      return;
    }
    
    this.animationTimer++;
    
    // Time to show the next word
    const delay = this.currentWordIndex === 0 ? this.messageDelay : this.wordDelay;
    
    if (this.animationTimer >= delay) {
      this.animationTimer = 0;
      
      // Add the next word to displayed words
      if (this.currentWordIndex < this.words.length) {
        this.displayedWords.push({
          text: this.words[this.currentWordIndex],
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          size: this.fontBaseSize * (0.8 + Math.random() * 0.4), // Random size variation
          angle: (Math.random() * 0.2 - 0.1), // Random slight angle
          offsetY: (Math.random() * 10 - 5) // Small random vertical offset
        });
        
        this.currentWordIndex++;
      } 
      // Move to next message when current message is complete
      else {
        this.currentMessageIndex++;
        this.prepareNextMessage();
      }
    }
  }
  
  /**
   * Draw the animated text
   */
  draw() {
    if (this.displayedWords.length === 0 && !this.isComplete) return;
    
    const { context, canvas, lineHeight, maxWidth } = this;
    
    // Save context state
    context.save();
    
    // Clear the entire canvas with a black background
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate text layout
    const centerX = canvas.width / 2;
    const startY = canvas.height / 2 - ((this.messages.length * lineHeight) / 2);
    
    // Build lines of text from displayed words
    const lines = [];
    let currentLine = [];
    let currentLineWidth = 0;
    let currentMessageIndex = 0;
    let lineIndex = 0;
    
    // Group words into lines that fit within maxWidth
    this.displayedWords.forEach((word, index) => {
      // Check if we've moved to a new message
      const wordMessage = this.getMessageIndexForWord(index);
      if (wordMessage > currentMessageIndex) {
        // Add current line to lines
        if (currentLine.length > 0) {
          lines.push({
            words: [...currentLine],
            messageIndex: currentMessageIndex,
            lineIndex: lineIndex
          });
        }
        // Reset for new message
        currentLine = [];
        currentLineWidth = 0;
        currentMessageIndex = wordMessage;
        lineIndex = 0;
      }
      
      // Measure this word (with space)
      context.font = `${word.size}px Arial`;
      const wordWidth = context.measureText(word.text + ' ').width;
      
      // Check if adding this word exceeds the max width
      if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
        // Add current line to lines and start a new line
        lines.push({
          words: [...currentLine],
          messageIndex: currentMessageIndex,
          lineIndex: lineIndex
        });
        currentLine = [];
        currentLineWidth = 0;
        lineIndex++;
      }
      
      // Add word to current line
      currentLine.push(word);
      currentLineWidth += wordWidth;
    });
    
    // Add the last line if it has words
    if (currentLine.length > 0) {
      lines.push({
        words: [...currentLine],
        messageIndex: currentMessageIndex,
        lineIndex: lineIndex
      });
    }
    
    // Draw each line
    lines.forEach((line, lineNum) => {
      // Calculate Y position based on message index and line index within message
      const messageOffset = line.messageIndex * lineHeight * 1.5; // Extra space between messages
      const y = startY + messageOffset + (line.lineIndex * lineHeight);
      
      // Calculate total line width for centering
      let totalLineWidth = 0;
      line.words.forEach(word => {
        context.font = `${word.size}px Arial`;
        totalLineWidth += context.measureText(word.text + ' ').width;
      });
      
      // Draw each word in the line
      let xPos = centerX - (totalLineWidth / 2);
      line.words.forEach(word => {
        context.save();
        
        // Set font properties
        context.font = `${word.size}px Arial`;
        context.fillStyle = word.color;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        
        // Apply transformations for subtle animation
        context.translate(xPos, y + word.offsetY);
        context.rotate(word.angle);
        
        // Draw the word with a slight shadow for better readability
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.fillText(word.text, 0, 0);
        
        // Update x position for next word
        xPos += context.measureText(word.text + ' ').width;
        
        context.restore();
      });
    });
    
    // Restore context state
    context.restore();
  }
  
  /**
   * Determine which message a word belongs to
   * @param {number} wordIndex - Global index of the word
   * @returns {number} Message index
   */
  getMessageIndexForWord(wordIndex) {
    let wordCount = 0;
    let messageIndex = 0;
    
    while (messageIndex < this.messages.length) {
      const wordsInMessage = this.messages[messageIndex].split(' ').length;
      if (wordIndex < wordCount + wordsInMessage) {
        return messageIndex;
      }
      wordCount += wordsInMessage;
      messageIndex++;
    }
    
    return this.messages.length - 1;
  }
  
  /**
   * Check if animation is complete
   * @returns {boolean} True if animation is finished
   */
  isFinished() {
    return this.isComplete;
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    this.updateTextProperties();
  }
}

export default CongratsAnimation;