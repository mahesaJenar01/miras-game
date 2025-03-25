import GameFactory from './GameFactory.js';

/**
 * Main initialization function
 */
function main() {
  // Create a game using GameFactory
  const game = GameFactory.createGame('canvas');
  
  // Expose the game instance globally for debugging and access from other modules
  window.game = game;
  
  // Start the game
  game.start();
  
  console.log('Game initialized with modular component structure!');
}

// Run main function when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export { main };