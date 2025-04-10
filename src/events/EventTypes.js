/**
 * EventTypes.js - Constants for all event types
 * Categorized by domain to ensure consistency and prevent typos
 * Updated to include Enemy events
 */

/**
 * Game-level events
 */
export const GAME_EVENTS = {
  // Game lifecycle events
  INITIALIZE: 'game:initialize',
  START: 'game:start',
  STOP: 'game:stop',
  PAUSE: 'game:pause',
  RESUME: 'game:resume',
  
  // Game state events
  RESIZE: 'game:resize',
  WORLD_UPDATE: 'game:world_update',
  SCORE_CHANGE: 'game:score_change',
  LEVEL_COMPLETE: 'game:level_complete'
};

/**
 * Character-related events
 */
export const CHARACTER_EVENTS = {
  // Movement events
  MOVE_START: 'character:move_start',
  MOVE_STOP: 'character:move_stop',
  POSITION_CHANGE: 'character:position_change',
  
  // Action events
  JUMP_START: 'character:jump_start',
  JUMP_PEAK: 'character:jump_peak',
  JUMP_END: 'character:jump_end',
  
  // Attack events
  ATTACK_START: 'character:attack_start',
  ATTACK_HIT: 'character:attack_hit',
  ATTACK_END: 'character:attack_end',
  COOLDOWN_START: 'character:cooldown_start',
  COOLDOWN_UPDATE: 'character:cooldown_update',
  COOLDOWN_END: 'character:cooldown_end',
  
  // Animation events
  ANIMATION_START: 'character:animation_start',
  ANIMATION_FRAME: 'character:animation_frame',
  ANIMATION_END: 'character:animation_end',

  GAME_OVER: 'game:game_over',
  RESTART: 'game:restart',
  RESTART_COMPLETE: 'game:restart_complete',

  HEALTH_CHANGE: 'character:health_change',
};

/**
 * Input-related events
 */
export const INPUT_EVENTS = {
  // Keyboard events
  KEY_DOWN: 'input:key_down',
  KEY_UP: 'input:key_up',
  
  // Mouse events
  MOUSE_DOWN: 'input:mouse_down',
  MOUSE_UP: 'input:mouse_up',
  MOUSE_MOVE: 'input:mouse_move',
  
  // Touch events
  TOUCH_START: 'input:touch_start',
  TOUCH_END: 'input:touch_end',
  TOUCH_MOVE: 'input:touch_move',
  
  // Button events (higher level than raw input)
  BUTTON_PRESS: 'input:button_press',
  BUTTON_RELEASE: 'input:button_release',
  BUTTON_HOVER: 'input:button_hover'
};

/**
 * Scene-related events
 */
export const SCENE_EVENTS = {
  // Scene changes
  BACKGROUND_CHANGE: 'scene:background_change',
  SCENERY_UPDATE: 'scene:scenery_update',
  PARALLAX_UPDATE: 'scene:parallax_update',
  
  // Weather and time events
  WEATHER_CHANGE: 'scene:weather_change',
  TIME_CHANGE: 'scene:time_change',
  
  // Special effect events
  EFFECT_START: 'scene:effect_start',
  EFFECT_END: 'scene:effect_end'
};

/**
 * UI-related events
 */
export const UI_EVENTS = {
  // General UI events
  SHOW: 'ui:show',
  HIDE: 'ui:hide',
  UPDATE: 'ui:update',
  
  // Button-specific UI events (complementary to input events)
  BUTTON_STATE_CHANGE: 'ui:button_state_change',
  BUTTON_COOLDOWN_UPDATE: 'ui:button_cooldown_update',
  
  // Shop-related UI events (moved from SHOP_EVENTS)
  SHOP_OPEN: 'ui:shop_open',
  SHOP_CLOSE: 'ui:shop_close',
  SHOP_CARD_SELECT: 'ui:shop_card_select',
  SHOP_CARD_REVEAL: 'ui:shop_card_reveal'
};

/**
 * Audio-related events
 */
export const AUDIO_EVENTS = {
  PLAY_SOUND: 'audio:play_sound',
  STOP_SOUND: 'audio:stop_sound',
  CHANGE_VOLUME: 'audio:change_volume',
  PLAY_MUSIC: 'audio:play_music',
  STOP_MUSIC: 'audio:stop_music'
};

/**
 * Collectible-related events
 */
export const COLLECTIBLE_EVENTS = {
  // Collectible lifecycle
  SPAWN: 'collectible:spawn',
  COLLECT: 'collectible:collect',
  
  // Count and UI updates
  COUNT_UPDATE: 'collectible:count_update',
  
  // Audio cues for collection
  COLLECT_SOUND: 'collectible:collect_sound'
};

/**
 * Shop-related events
 * These are globally accessible events specific to the shop system
 */
export const SHOP_EVENTS = {
  OPEN: 'shop:open',
  CLOSE: 'shop:close',
  CARD_SELECT: 'shop:card_select',
  CARD_REVEAL: 'shop:card_reveal',
  CARD_PURCHASE_ATTEMPT: 'shop:card_purchase_attempt',
  CARD_PURCHASE_SUCCESS: 'shop:card_purchase_success',
  CARD_PURCHASE_FAILURE: 'shop:card_purchase_failure'
};

/**
 * Collection-related events
 * Events for the card collection viewer
 */
export const COLLECTION_EVENTS = {
  OPEN: 'collection:open',
  CLOSE: 'collection:close',
  PAGE_CHANGE: 'collection:page_change',
  CARD_VIEW: 'collection:card_view'
};

/**
 * Enemy-related events
 * Events for enemy spawning, attacks, and animations
 */
export const ENEMY_EVENTS = {
  // Enemy lifecycle
  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_HIT: 'enemy:hit',
  ENEMY_DEFEATED: 'enemy:defeated',
  
  // Enemy animation events
  ENEMY_ANIMATION: 'enemy:animation_frame',
  ENEMY_SPECIAL_ANIMATION: 'enemy:special_animation',
  
  // Enemy attack events
  ENEMY_ATTACK_START: 'enemy:attack_start',
  ENEMY_ATTACK_HIT: 'enemy:attack_hit',
  ENEMY_ATTACK_END: 'enemy:attack_end',
  
  // Enemy count updates
  ENEMY_COUNT_UPDATE: 'enemy:count_update'
};