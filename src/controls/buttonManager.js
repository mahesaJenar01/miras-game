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
  
  // Set up attack button events
  if (attackBtn) {
    const handleAttack = () => {
      if (window.game && window.game.attacker) {
        // Trigger the attack and provide visual feedback on the button
        if (window.game.attacker.startAttack()) {
          // Visual feedback for successful attack
          attackBtn.classList.add('attacking');
          
          // Remove the class after the attack animation completes
          setTimeout(() => {
            attackBtn.classList.remove('attacking');
          }, window.game.attacker.attackDuration * (1000 / 60)); // Convert frames to ms
        } else if (window.game.attacker.attackCooldown > 0) {
          // Visual feedback for cooldown
          attackBtn.classList.add('cooldown');
          setTimeout(() => {
            attackBtn.classList.remove('cooldown');
          }, 300);
        }
      }
    };
    
    // Trigger attack on mouse press
    attackBtn.addEventListener("mousedown", handleAttack);
    
    // Trigger attack on touch start (for mobile devices)
    attackBtn.addEventListener("touchstart", handleAttack);
  }
};

// Export the initialization function
export { initializeButtons };

// Jadi ceritanya attacker-nya itu akuuu, nah kamu si main stick figure itu, tapi character aku terlalu bagus dan kamu terlalu plain ya HAHAHA, kuy kita coba edit character kamu dari Claude juga!