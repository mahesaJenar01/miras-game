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
    
    // Event history for debugging
    this.eventHistory = [];
    this.maxHistoryLength = 100;
    this.isRecordingHistory = false;
  }
  
  /**
   * Enable or disable event history recording for debugging
   * @param {boolean} enabled - Whether to record event history
   * @param {number} maxLength - Maximum number of events to keep in history
   */
  setHistoryRecording(enabled, maxLength = 100) {
    this.isRecordingHistory = enabled;
    this.maxHistoryLength = maxLength;
    
    if (!enabled) {
      this.clearHistory();
    }
  }
  
  /**
   * Clear the event history
   */
  clearHistory() {
    this.eventHistory = [];
  }
  
  /**
   * Get the event history
   * @returns {Array} The event history
   */
  getHistory() {
    return [...this.eventHistory];
  }
  
  /**
   * Override emit to record history
   * @param {string} eventType - The type of event to emit
   * @param {any} data - Optional data to pass to listeners
   * @returns {boolean} True if the event had listeners, false otherwise
   */
  emit(eventType, data) {
    // Check for undefined event type
    if (!eventType) {
      console.warn('[GameEvents] Attempted to emit undefined event type', data);
      // Provide a default event type to avoid errors
      eventType = 'unknown:event';
    }
    
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
      console.warn('[GameEvents] Attempted to emit game event with undefined type', data);
      return false;
    }
    
    // Check if the event type is valid, but still emit even if it's not registered
    // This prevents errors when adding new event types
    if (!Object.values(this.types.GAME_EVENTS).includes(eventType)) {
      console.warn(`[GameEvents] '${eventType}' is not a registered game event type`);
    }
    return this.emit(eventType, data);
  }  
  
  /**
   * Emit a character event
   * @param {string} eventType - The character event type from CHARACTER_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitCharacter(eventType, data) {
    if (!Object.values(this.types.CHARACTER_EVENTS).includes(eventType)) {
      console.warn(`[GameEvents] '${eventType}' is not a registered character event type`);
    }
    return this.emit(eventType, data);
  }
  
  /**
   * Emit an input event
   * @param {string} eventType - The input event type from INPUT_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitInput(eventType, data) {
    if (!Object.values(this.types.INPUT_EVENTS).includes(eventType)) {
      console.warn(`[GameEvents] '${eventType}' is not a registered input event type`);
    }
    return this.emit(eventType, data);
  }
  
  /**
   * Emit a scene event
   * @param {string} eventType - The scene event type from SCENE_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitScene(eventType, data) {
    if (!Object.values(this.types.SCENE_EVENTS).includes(eventType)) {
      console.warn(`[GameEvents] '${eventType}' is not a registered scene event type`);
    }
    return this.emit(eventType, data);
  }
  
  /**
   * Emit a UI event
   * @param {string} eventType - The UI event type from UI_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitUI(eventType, data) {
    if (!Object.values(this.types.UI_EVENTS).includes(eventType)) {
      console.warn(`[GameEvents] '${eventType}' is not a registered UI event type`);
    }
    return this.emit(eventType, data);
  }
  
  /**
   * Emit an audio event
   * @param {string} eventType - The audio event type from AUDIO_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitAudio(eventType, data) {
    if (!Object.values(this.types.AUDIO_EVENTS).includes(eventType)) {
      console.warn(`[GameEvents] '${eventType}' is not a registered audio event type`);
    }
    return this.emit(eventType, data);
  }
  
  /**
   * Emit a collectible event
   * @param {string} eventType - The collectible event type from COLLECTIBLE_EVENTS
   * @param {any} data - Optional data to pass to listeners
   */
  emitCollectible(eventType, data) {
    if (!Object.values(this.types.COLLECTIBLE_EVENTS).includes(eventType)) {
      console.warn(`[GameEvents] '${eventType}' is not a registered collectible event type`);
    }
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