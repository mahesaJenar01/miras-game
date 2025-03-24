import { updateButtonPositions } from './controls.js';

// Function to initialize all buttons
const initializeButtons = () => {
  const moveBtn = document.getElementById("move-btn");
  const jumpBtn = document.getElementById("jump-btn");
  const attackBtn = document.getElementById("attack-btn");
  
  // First make sure the buttons are properly positioned
  updateButtonPositions();
  
  // Make buttons visible after positioning them
  if (moveBtn) moveBtn.style.display = 'block';
  if (jumpBtn) jumpBtn.style.display = 'block';
  if (attackBtn) attackBtn.style.display = 'block';
  
  // Set up move button events
  if (moveBtn) {
    // When the button is pressed (mouse or touch), start walking
    moveBtn.addEventListener("mousedown", () => {
      if (window.game) {
        window.game.isWalking = true;
        window.game.components.stickfigure.isWalking = true;
      }
    });

    moveBtn.addEventListener("touchstart", () => {
      if (window.game) {
        window.game.isWalking = true;
        window.game.components.stickfigure.isWalking = true;
      }
    });

    // When the button is released, stop walking
    moveBtn.addEventListener("mouseup", () => {
      if (window.game) {
        window.game.isWalking = false;
        window.game.components.stickfigure.isWalking = false;
      }
    });

    moveBtn.addEventListener("touchend", () => {
      if (window.game) {
        window.game.isWalking = false;
        window.game.components.stickfigure.isWalking = false;
      }
    });
  }
  
  // Set up jump button events
  if (jumpBtn) {
    // Trigger jump on mouse press
    jumpBtn.addEventListener("mousedown", () => {
      if (window.game) {
        window.game.components.stickfigure.startJump();
      }
    });

    // Trigger jump on touch start (for mobile devices)
    jumpBtn.addEventListener("touchstart", () => {
      if (window.game) {
        window.game.components.stickfigure.startJump();
      }
    });
  }
  
  // Add logic for attack button if needed
  if (attackBtn) {
    attackBtn.addEventListener("mousedown", () => {
      console.log("Attack button pressed!");
      // Add attack functionality here
    });
    
    attackBtn.addEventListener("touchstart", () => {
      console.log("Attack button touched!");
      // Add attack functionality here
    });
  }
};

// Export the initialization function
export { initializeButtons };
