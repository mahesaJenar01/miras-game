document.addEventListener("DOMContentLoaded", () => {
  const jumpBtn = document.getElementById("jump-btn");

  if (jumpBtn) {
      // Use arrow functions for event handlers
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
});