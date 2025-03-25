/**
 * Utility class for physics-related functions
 */
class PhysicsUtils {
    /**
     * Apply gravity to a velocity
     * @param {number} velocity - Current vertical velocity
     * @param {number} gravity - Gravity strength
     * @param {number} deltaTime - Time elapsed since last frame in ms
     * @returns {number} Updated velocity
     */
    static applyGravity(velocity, gravity, deltaTime) {
      // Scale by deltaTime for framerate independence (assuming 60fps as baseline)
      const timeScale = deltaTime / 16.67; // 16.67ms is roughly 60fps
      return velocity + gravity * timeScale;
    }
  
    /**
     * Update position based on velocity
     * @param {number} position - Current position
     * @param {number} velocity - Current velocity
     * @param {number} deltaTime - Time elapsed since last frame in ms
     * @returns {number} Updated position
     */
    static updatePosition(position, velocity, deltaTime) {
      const timeScale = deltaTime / 16.67;
      return position + velocity * timeScale;
    }
  
    /**
     * Calculate jump velocity based on desired jump height and gravity
     * @param {number} jumpHeight - Target jump height in pixels
     * @param {number} gravity - Gravity strength
     * @returns {number} Initial velocity needed to reach the jump height
     */
    static calculateJumpVelocity(jumpHeight, gravity) {
      // Using physics formula: v = sqrt(2 * g * h)
      return Math.sqrt(2 * gravity * jumpHeight);
    }
  
    /**
     * Apply drag (air resistance) to velocity
     * @param {number} velocity - Current velocity
     * @param {number} dragCoefficient - Drag coefficient (0-1)
     * @param {number} deltaTime - Time elapsed since last frame in ms
     * @returns {number} Updated velocity
     */
    static applyDrag(velocity, dragCoefficient, deltaTime) {
      const timeScale = deltaTime / 16.67;
      return velocity * Math.pow(1 - dragCoefficient, timeScale);
    }
  
    /**
     * Check if an object is on the ground
     * @param {number} position - Current Y position
     * @param {number} groundLevel - Ground Y level
     * @param {number} threshold - Distance threshold
     * @returns {boolean} True if on ground
     */
    static isOnGround(position, groundLevel, threshold = 0.1) {
      return position >= groundLevel - threshold;
    }
  
    /**
     * Apply bounce when hitting a surface
     * @param {number} velocity - Current velocity
     * @param {number} bounceFactor - Bounce coefficient (0-1)
     * @returns {number} Bounced velocity
     */
    static bounce(velocity, bounceFactor) {
      return -velocity * bounceFactor;
    }
  
    /**
     * Calculate distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance
     */
    static distance(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    }
  
    /**
     * Check if two circles are colliding
     * @param {number} x1 - First circle center X
     * @param {number} y1 - First circle center Y
     * @param {number} r1 - First circle radius
     * @param {number} x2 - Second circle center X
     * @param {number} y2 - Second circle center Y
     * @param {number} r2 - Second circle radius
     * @returns {boolean} True if colliding
     */
    static circleCollision(x1, y1, r1, x2, y2, r2) {
      const dist = this.distance(x1, y1, x2, y2);
      return dist < r1 + r2;
    }
  
    /**
     * Check if a point is inside a rectangle
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @param {number} rx - Rectangle top-left X
     * @param {number} ry - Rectangle top-left Y
     * @param {number} rw - Rectangle width
     * @param {number} rh - Rectangle height
     * @returns {boolean} True if point is inside rectangle
     */
    static pointInRect(px, py, rx, ry, rw, rh) {
      return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
  
    /**
     * Check if two rectangles are colliding
     * @param {number} x1 - First rectangle X
     * @param {number} y1 - First rectangle Y
     * @param {number} w1 - First rectangle width
     * @param {number} h1 - First rectangle height
     * @param {number} x2 - Second rectangle X
     * @param {number} y2 - Second rectangle Y
     * @param {number} w2 - Second rectangle width
     * @param {number} h2 - Second rectangle height
     * @returns {boolean} True if colliding
     */
    static rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
      return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
  }
  
  export default PhysicsUtils;