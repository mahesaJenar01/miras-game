function main() {
    // Global variables for scene movement
    let worldOffset = 0;
    const gameSpeed = 1.3;
    
    function animate() {
        requestAnimationFrame(animate);

        // Clear the entire canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw static elements (sky and sun remain fixed or use a smaller parallax)
        sky.draw();
        sun.draw();

        // Draw clouds (they update themselves with their own speed)
        for (const cloud of clouds) {
            cloud.draw();
        }

        // Draw moving elements (ground) with a translation to simulate the world moving
        context.save();
        context.translate(0, 0);
        ground.draw(worldOffset);
        context.restore();

        // Draw the stickfigure on top so it remains static on screen
        stickfigure.draw();

        // Update the world offset to move the scene
        worldOffset += gameSpeed;
    }
    
    animate();
};

main();