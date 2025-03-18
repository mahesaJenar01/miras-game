document.addEventListener("DOMContentLoaded", () => {
    const moveBtn = document.getElementById("move-btn");
  
    if (moveBtn) {
      // When the button is pressed (mouse or touch), start walking.
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
  
      // When the button is released, stop walking.
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
  });
  