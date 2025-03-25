/**
 * Utility class for animation-related functions
 */
class AnimationUtils {
    /**
     * Linear interpolation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    static lerp(start, end, t) {
      return start + (end - start) * t;
    }
  
    /**
     * Ease in-out function
     * @param {number} t - Value between 0-1
     * @returns {number} Eased value
     */
    static easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  
    /**
     * Ease in function
     * @param {number} t - Value between 0-1
     * @returns {number} Eased value
     */
    static easeIn(t) {
      return t * t;
    }
  
    /**
     * Ease out function
     * @param {number} t - Value between 0-1
     * @returns {number} Eased value
     */
    static easeOut(t) {
      return t * (2 - t);
    }
  
    /**
     * Elastic ease out function
     * @param {number} t - Value between 0-1
     * @returns {number} Eased value
     */
    static elasticOut(t) {
      return Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1;
    }
  
    /**
     * Bounce ease out function
     * @param {number} t - Value between 0-1
     * @returns {number} Eased value
     */
    static bounceOut(t) {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        t -= 1.5 / 2.75;
        return 7.5625 * t * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        t -= 2.25 / 2.75;
        return 7.5625 * t * t + 0.9375;
      } else {
        t -= 2.625 / 2.75;
        return 7.5625 * t * t + 0.984375;
      }
    }
  
    /**
     * Create an animation cycle value that oscillates between 0 and 1
     * @param {number} time - Current time value (typically incremented each frame)
     * @param {number} speed - Speed of the cycle
     * @returns {number} Value between 0 and 1
     */
    static cycle(time, speed = 1) {
      return (Math.sin(time * speed) + 1) / 2;
    }
  
    /**
     * Create a ping-pong value that goes from 0 to 1 and back
     * @param {number} t - Value between 0-1
     * @returns {number} Ping-ponged value
     */
    static pingPong(t) {
      t = t % 1;
      return t < 0.5 ? t * 2 : 2 - t * 2;
    }
  
    /**
     * Get animation progress based on current and total frames
     * @param {number} currentFrame - Current frame number
     * @param {number} totalFrames - Total number of frames
     * @returns {number} Progress value between 0-1
     */
    static getProgress(currentFrame, totalFrames) {
      return Math.min(1, Math.max(0, currentFrame / totalFrames));
    }
  
    /**
     * Create a spring-like motion
     * @param {number} t - Value between 0-1
     * @param {number} bounces - Number of bounces
     * @param {number} elasticity - Elasticity factor
     * @returns {number} Spring value
     */
    static spring(t, bounces = 3, elasticity = 0.3) {
      return 1 - Math.cos(t * Math.PI * (bounces + 0.5)) * Math.exp(-elasticity * t);
    }
  
    /**
     * Map a value from one range to another
     * @param {number} value - Value to map
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    static map(value, inMin, inMax, outMin, outMax) {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
  
    /**
     * Creates a stepped value (like a progress bar)
     * @param {number} value - Current value
     * @param {number} steps - Number of steps
     * @returns {number} Stepped value
     */
    static step(value, steps) {
      return Math.floor(value * steps) / steps;
    }
  
    /**
     * Smoothly interpolate between current and target values
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @param {number} smoothing - Smoothing factor (0-1)
     * @param {number} deltaTime - Time elapsed since last frame
     * @returns {number} Smoothed value
     */
    static smooth(current, target, smoothing, deltaTime) {
      // Adjust smoothing for framerate independence
      const adjustedSmoothing = Math.pow(smoothing, deltaTime / 16.67);
      return current + (target - current) * (1 - adjustedSmoothing);
    }
  }
  
  export default AnimationUtils;