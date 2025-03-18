function updateButtonPositions() {
    const canvas = document.getElementById("canvas");
    const canvasRect = canvas.getBoundingClientRect();
    
    // Use the ground configuration defined in setup.js.
    // configuration.ground.y is set as canvas.offsetHeight * 0.8,
    // and configuration.ground.height as canvas.offsetHeight * 0.2.
    const groundY = configuration.ground.y; 
    const groundHeight = configuration.ground.height;
    const grassHeight = groundHeight * 0.3; // top portion of the ground (grass)
    const dirtHeight = groundHeight * 0.7;  // remaining (dirt)
    
    // Calculate the vertical center of the dirt area in canvas coordinates.
    const dirtCenterCanvasY = groundY + grassHeight + (dirtHeight / 2);
    // Convert to absolute screen coordinate:
    const dirtCenterScreenY = canvasRect.top + dirtCenterCanvasY;
    
    // Define button dimensions relative to dirtHeight
    const btnHeight = dirtHeight * 0.7; // button height is 80% of the dirt height
    const btnWidth = btnHeight * 2;      // width is set to twice the height
    
    // Define horizontal gaps (adjust as needed)
    const sideGap = 20;     // gap from canvas left/right edges
    const buttonGap = 10;   // gap between Attack and Jump buttons
    
    // Position the Move button on the left side of the canvas
    const moveBtn = document.getElementById("move-btn");
    moveBtn.style.left = (canvasRect.left + sideGap) + "px";
    moveBtn.style.top = (dirtCenterScreenY - btnHeight / 2) + "px";
    moveBtn.style.width = btnWidth + "px";
    moveBtn.style.height = btnHeight + "px";
    
    // Position the Jump button on the right side of the canvas
    const jumpBtn = document.getElementById("jump-btn");
    jumpBtn.style.left = (canvasRect.right - sideGap - btnWidth) + "px";
    jumpBtn.style.top = (dirtCenterScreenY - btnHeight / 2) + "px";
    jumpBtn.style.width = btnWidth + "px";
    jumpBtn.style.height = btnHeight + "px";
    
    // Position the Attack button immediately to the left of the Jump button,
    // with its own gap.
    const attackBtn = document.getElementById("attack-btn");
    attackBtn.style.left = (canvasRect.right - sideGap - btnWidth - buttonGap - btnWidth) + "px";
    attackBtn.style.top = (dirtCenterScreenY - btnHeight / 2) + "px";
    attackBtn.style.width = btnWidth + "px";
    attackBtn.style.height = btnHeight + "px";
  }
  
  // Update button positions initially and on window resize
  window.addEventListener("resize", updateButtonPositions);
  document.addEventListener("DOMContentLoaded", updateButtonPositions);
  