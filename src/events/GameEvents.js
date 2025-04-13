/**
 * GameEvents.js - Singleton event hub for game-wide event communication
 * Provides a central instance of EventEmitter with additional convenience methods
 */
import EventEmitter from './EventEmitter.js';
import * as EventTypes from './EventTypes.js';

class GameEventEmitter extends EventEmitter {
  /**
   * Create a new GameEventEmitter
   */
  constructor() {
    super();
    
    // Store event types for convenience
    this.types = EventTypes;
  }
  
  /**
   * Override emit to record history
   * @param {string} eventType - The type of event to emit
   * @param {any} data - Optional data to pass to listeners
   * @returns {boolean} True if the event had listeners, false otherwise
   */
  emit(eventType, data) {
    // Record event in history if enabled
    if (this.isRecordingHistory) {
      this.eventHistory.push({
        type: eventType,
        data: data,
        timestamp: Date.now()
      });
      
      // Trim history if it exceeds max length
      if (this.eventHistory.length > this.maxHistoryLength) {
        this.eventHistory.shift();
      }
    }
    
    // Call the parent emit method
    return super.emit(eventType, data);
  }  
  
  /**
   * Emit a game event
   * @param {string} eventType - The game event type from GAME_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitGame(eventType, data) {
    if (!eventType) {
      return false;
    }
    return this.emit(eventType, data);
  }  
  
  /**
   * Emit a character event
   * @param {string} eventType - The character event type from CHARACTER_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitCharacter(eventType, data) {
    return this.emit(eventType, data);
  }
  
  /**
   * Emit an input event
   * @param {string} eventType - The input event type from INPUT_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitInput(eventType, data) {
    return this.emit(eventType, data);
  }
  
  /**
   * Emit a scene event
   * @param {string} eventType - The scene event type from SCENE_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitScene(eventType, data) {
    return this.emit(eventType, data);
  }
  
  /**
   * Emit a UI event
   * @param {string} eventType - The UI event type from UI_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitUI(eventType, data) {
    return this.emit(eventType, data);
  }
  
  /**
   * Emit an audio event
   * @param {string} eventType - The audio event type from AUDIO_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitAudio(eventType, data) {
    return this.emit(eventType, data);
  }
  
  /**
   * Emit a collectible event
   * @param {string} eventType - The collectible event type from COLLECTIBLE_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitCollectible(eventType, data) {
    return this.emit(eventType, data);
  }
  
  /**
   * Subscribe to multiple events with a single listener
   * @param {string[]} eventTypes - Array of event types to listen for
   * @param {Function} listener - The callback function to execute
   * @returns {Function} A function that will remove all the event listeners
   */
  onMany(eventTypes, listener) {
    eventTypes.forEach(type => this.on(type, listener));
    
    // Return a function to remove all the listeners
    return () => {
      eventTypes.forEach(type => this.off(type, listener));
    };
  }
}

// Create the singleton instance
const GameEvents = new GameEventEmitter();

// Export the singleton
export default GameEvents;