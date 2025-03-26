/**
 * EventEmitter.js - Core event handling system
 * Provides methods for registering, deregistering, and dispatching events
 */
class EventEmitter {
    /**
     * Create a new EventEmitter
     */
    constructor() {
      // Map of event types to arrays of listeners
      this.listeners = new Map();
      
      // Map to track one-time listeners
      this.onceListeners = new Map();
      
      // Debug mode flag
      this.debugMode = false;
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode should be enabled
     */
    setDebugMode(enabled) {
      this.debugMode = enabled;
    }
    
    /**
     * Register an event listener
     * @param {string} eventType - The type of event to listen for
     * @param {Function} listener - The callback function to execute
     * @returns {EventEmitter} This emitter instance for chaining
     */
    on(eventType, listener) {
      if (typeof listener !== 'function') {
        throw new Error('Event listener must be a function');
      }
      
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, []);
      }
      
      this.listeners.get(eventType).push(listener);
      
      if (this.debugMode) {
        console.log(`[EventEmitter] Registered listener for '${eventType}'`);
      }
      
      return this;
    }
    
    /**
     * Register a one-time event listener that will be removed after being called
     * @param {string} eventType - The type of event to listen for
     * @param {Function} listener - The callback function to execute
     * @returns {EventEmitter} This emitter instance for chaining
     */
    once(eventType, listener) {
      if (typeof listener !== 'function') {
        throw new Error('Event listener must be a function');
      }
      
      // Create a wrapper that will call the listener and remove it
      const onceWrapper = (data) => {
        // Call the original listener
        listener(data);
        
        // Remove the wrapper
        this.off(eventType, onceWrapper);
        
        // Remove from once tracking
        if (this.onceListeners.has(eventType)) {
          const listeners = this.onceListeners.get(eventType);
          const index = listeners.indexOf(listener);
          if (index !== -1) {
            listeners.splice(index, 1);
          }
          if (listeners.length === 0) {
            this.onceListeners.delete(eventType);
          }
        }
      };
      
      // Store the mapping to track the original listener
      if (!this.onceListeners.has(eventType)) {
        this.onceListeners.set(eventType, []);
      }
      this.onceListeners.get(eventType).push({ original: listener, wrapper: onceWrapper });
      
      // Register the wrapper
      return this.on(eventType, onceWrapper);
    }
    
    /**
     * Remove an event listener
     * @param {string} eventType - The type of event to remove the listener from
     * @param {Function} listener - The callback function to remove
     * @returns {EventEmitter} This emitter instance for chaining
     */
    off(eventType, listener) {
      if (!this.listeners.has(eventType)) {
        return this;
      }
      
      // Check if this is a regular listener
      const listeners = this.listeners.get(eventType);
      const index = listeners.indexOf(listener);
      
      if (index !== -1) {
        listeners.splice(index, 1);
        
        if (this.debugMode) {
          console.log(`[EventEmitter] Removed listener for '${eventType}'`);
        }
        
        // Clean up empty listener arrays
        if (listeners.length === 0) {
          this.listeners.delete(eventType);
        }
        
        return this;
      }
      
      // Check if this is an original function from a once listener
      if (this.onceListeners.has(eventType)) {
        const onceListeners = this.onceListeners.get(eventType);
        const onceIndex = onceListeners.findIndex(item => item.original === listener);
        
        if (onceIndex !== -1) {
          const wrapper = onceListeners[onceIndex].wrapper;
          onceListeners.splice(onceIndex, 1);
          
          // Also remove the wrapper from the main listeners
          const listenersList = this.listeners.get(eventType);
          const wrapperIndex = listenersList.indexOf(wrapper);
          if (wrapperIndex !== -1) {
            listenersList.splice(wrapperIndex, 1);
          }
          
          if (this.debugMode) {
            console.log(`[EventEmitter] Removed once listener for '${eventType}'`);
          }
          
          // Clean up empty arrays
          if (onceListeners.length === 0) {
            this.onceListeners.delete(eventType);
          }
          if (listenersList.length === 0) {
            this.listeners.delete(eventType);
          }
        }
      }
      
      return this;
    }
    
    /**
     * Remove all listeners for a specific event type
     * @param {string} eventType - The type of event to remove all listeners for
     * @returns {EventEmitter} This emitter instance for chaining
     */
    removeAllListeners(eventType) {
      if (eventType) {
        // Remove specific event type listeners
        this.listeners.delete(eventType);
        this.onceListeners.delete(eventType);
        
        if (this.debugMode) {
          console.log(`[EventEmitter] Removed all listeners for '${eventType}'`);
        }
      } else {
        // Remove all listeners for all event types
        this.listeners.clear();
        this.onceListeners.clear();
        
        if (this.debugMode) {
          console.log('[EventEmitter] Removed all listeners for all events');
        }
      }
      
      return this;
    }
    
    /**
     * Emit an event, executing all registered listeners
     * @param {string} eventType - The type of event to emit
     * @param {any} data - Optional data to pass to listeners
     * @returns {boolean} True if the event had listeners, false otherwise
     */
    emit(eventType, data) {
      const hasListeners = this.listeners.has(eventType);
      
      if (!hasListeners) {
        if (this.debugMode) {
          console.log(`[EventEmitter] Event '${eventType}' emitted but no listeners registered`);
        }
        return false;
      }
      
      if (this.debugMode) {
        console.log(`[EventEmitter] Emitting event '${eventType}'`, data);
      }
      
      // Create a copy of the listeners array to prevent issues if listeners are added/removed during emission
      const listeners = [...this.listeners.get(eventType)];
      
      // Execute each listener
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[EventEmitter] Error in listener for '${eventType}':`, error);
        }
      });
      
      return true;
    }
    
    /**
     * Get the number of listeners for a specific event type
     * @param {string} eventType - The type of event to count listeners for
     * @returns {number} The number of listeners
     */
    listenerCount(eventType) {
      if (!this.listeners.has(eventType)) {
        return 0;
      }
      
      return this.listeners.get(eventType).length;
    }
    
    /**
     * Get all registered event types
     * @returns {string[]} Array of event types
     */
    eventTypes() {
      return Array.from(this.listeners.keys());
    }
  }
  
  export default EventEmitter;