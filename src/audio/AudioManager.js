/**
 * AudioManager.js - Simple audio system for game sound effects
 * Handles loading and playing sounds for various game events
 */
import GameEvents from '../events/GameEvents.js';
import { AUDIO_EVENTS, COLLECTIBLE_EVENTS } from '../events/EventTypes.js';

class AudioManager {
  /**
   * Create a new audio manager
   */
  constructor() {
    // Map of sound types to their audio elements
    this.sounds = new Map();
    
    // Initialize audio elements
    this.initAudio();
    
    // Register event listeners
    this.registerEventListeners();
  }
  
  /**
   * Initialize audio elements
   */
  initAudio() {
    // Create audio elements for different sound types
    this.createAudio('coin', 'coin.mp3');
    this.createAudio('star', 'star.mp3');
    this.createAudio('gem', 'gem.mp3');
    this.createAudio('jump', 'jump.mp3');
    this.createAudio('attack', 'attack.mp3');
  }
  
  /**
   * Create and preload an audio element
   * @param {string} id - Sound identifier
   * @param {string} src - Audio file source path
   */
  createAudio(id, src) {
    // For this implementation, we'll just create empty audio objects
    // In a real game, you would load actual audio files
    this.sounds.set(id, {
      play: () => console.log(`[AUDIO] Playing ${id} sound`),
      stop: () => console.log(`[AUDIO] Stopping ${id} sound`),
      volume: 1.0
    });
  }
  
  /**
   * Register event listeners for audio playback
   */
  registerEventListeners() {
    // Listen for collectible collection sound events
    GameEvents.on(COLLECTIBLE_EVENTS.COLLECT_SOUND, (data) => {
      this.playCollectSound(data.type);
    });
    
    // Listen for general audio playback events
    GameEvents.on(AUDIO_EVENTS.PLAY_SOUND, (data) => {
      this.playSound(data.id);
    });
    
    GameEvents.on(AUDIO_EVENTS.STOP_SOUND, (data) => {
      this.stopSound(data.id);
    });
    
    GameEvents.on(AUDIO_EVENTS.CHANGE_VOLUME, (data) => {
      this.setVolume(data.id, data.volume);
    });
  }
  
  /**
   * Play a sound when collecting an item
   * @param {string} type - Type of collectible ('coin', 'star', 'gem')
   */
  playCollectSound(type) {
    // Choose the appropriate sound based on collectible type
    let soundId = type;
    
    // Default to coin sound if type not found
    if (!this.sounds.has(soundId)) {
      soundId = 'coin';
    }
    
    // Play the sound
    this.playSound(soundId);
  }
  
  /**
   * Play a sound by ID
   * @param {string} id - Sound identifier
   */
  playSound(id) {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.play();
    } else {
      console.warn(`[AudioManager] Sound '${id}' not found`);
    }
  }
  
  /**
   * Stop a sound by ID
   * @param {string} id - Sound identifier
   */
  stopSound(id) {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.stop();
    }
  }
  
  /**
   * Set volume for a specific sound
   * @param {string} id - Sound identifier
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(id, volume) {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// Create and export singleton instance
const audioManager = new AudioManager();
export default audioManager;