/**
 * Event System for communication between components
 * Implements a simple publish-subscribe pattern
 */
class EventSystem {
    constructor() {
      this.events = {};
    }
  
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to be executed
     * @returns {Object} Subscription object with unsubscribe method
     */
    subscribe(eventName, callback) {
      // Create event array if it doesn't exist
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      
      // Add callback to event array
      this.events[eventName].push(callback);
      
      // Return subscription object with unsubscribe method
      return {
        unsubscribe: () => {
          this.events[eventName] = this.events[eventName].filter(
            cb => cb !== callback
          );
          
          // Clean up empty event arrays
          if (this.events[eventName].length === 0) {
            delete this.events[eventName];
          }
        }
      };
    }
  
    /**
     * Publish an event
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to callbacks
     */
    publish(eventName, data) {
      // If event doesn't exist, do nothing
      if (!this.events[eventName]) {
        return;
      }
      
      // Call all callbacks with data
      this.events[eventName].forEach(callback => {
        callback(data);
      });
    }
  
    /**
     * Check if an event has subscribers
     * @param {string} eventName - Name of the event
     * @returns {boolean} True if event has subscribers
     */
    hasSubscribers(eventName) {
      return this.events[eventName] && this.events[eventName].length > 0;
    }
  
    /**
     * Get all events with subscribers
     * @returns {string[]} Array of event names
     */
    getActiveEvents() {
      return Object.keys(this.events);
    }
  
    /**
     * Clear all subscriptions for an event
     * @param {string} eventName - Name of the event
     */
    clearEvent(eventName) {
      delete this.events[eventName];
    }
  
    /**
     * Clear all subscriptions
     */
    clearAllEvents() {
      this.events = {};
    }
  }
  
  // Create a singleton instance
  const eventSystem = new EventSystem();
  
  export default eventSystem;