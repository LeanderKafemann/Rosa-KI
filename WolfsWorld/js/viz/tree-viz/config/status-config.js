/**
 * StatusConfig - Centralized Status & Style Configuration Manager
 * 
 * CONSOLIDATED VERSION - Single unified configuration for all status types
 * Provides centralized management of all status types, their visual properties,
 * and global rendering effects. Applications can override defaults for game-specific customization.
 * 
 * IMPORTANT: This file must be loaded BEFORE tree-engine.js
 * 
 * Features:
 * - Single consolidated configuration with all properties (11 base types + 5 special types)
 * - Priority system for node rendering order
 * - Complete style configurations (colors, borders, glows, dashes)
 * - Global rendering effect toggles
 * - Runtime override API for game-specific customization
 * - Lazy initialization and deep-clone safety
 * - Backward-compatible API (getStatusTypes(), getStyleConfig())
 * - New unified override API (setConfigDefaults())
 */

// Global effect configuration - controls all rendering effects
const STYLE_CONFIG_GLOBAL = {
  enableGlowEffects: false,
  enableDashEffects: true,
  enableShadowEffects: true,
  shadowBlur: 15,
  glowBlur: 20
};

/**
 * CONSOLIDATED DEFAULT CONFIGURATION
 * Combines priority, visual styling, and rendering flags in one place.
 * 
 * Base Status Types (11):
 *   ACTIVE, SOLUTION, WIN, LOSS, DEAD_END, DRAW, DUPLICATE, PRUNED, NONE,
 *   ACTIVE_DEAD_END, ACTIVE_WIN
 * 
 * Special Status Types (5):
 *   BEST, PREVIEW_NODE, BOARD_WON, BOARD_NORMAL, DEFAULT
 */
const DEFAULT_STATUS_CONFIG = {
  // ========== BASE STATUS TYPES (11) ==========
  
  ACTIVE: {
    priority: 100,
    color: '#f1c40f', border: '#f1c40f', width: 4,
    glow: '#ffed4e', enableGlow: true, dash: [], enableDash: false
  },
  
  SOLUTION: {
    priority: 90,
    color: '#2ecc71', border: '#27ae60', width: 4,
    glow: '#27ae60', enableGlow: true, dash: [], enableDash: false
  },
  
  WIN: {
    priority: 80,
    color: '#2ecc71', border: '#27ae60', width: 4,
    glow: '#27ae60', enableGlow: true, dash: [], enableDash: false
  },
  
  LOSS: {
    priority: 80,
    color: '#e74c3c', border: '#c0392b', width: 4,
    glow: '#c0392b', enableGlow: true, dash: [], enableDash: false
  },
  
  DEAD_END: {
    priority: 70,
    color: '#ffcccc', border: '#e74c3c', width: 3,
    glow: '#e74c3c', enableGlow: true, dash: [], enableDash: false
  },
  
  DRAW: {
    priority: 60,
    color: '#d1d119', border: '#c3dd19', width: 3,
    glow: null, enableGlow: false, dash: [], enableDash: false
  },
  
  DUPLICATE: {
    priority: 50,
    color: '#ecf0f1', border: '#ff8c00', width: 3,
    glow: null, enableGlow: false, dash: [], enableDash: false
  },
  
  PRUNED: {
    priority: 40,
    color: '#f2f2f2', border: '#000000', width: 2,
    glow: null, enableGlow: false, dash: [5, 5], enableDash: true
  },
  
  NONE: {
    priority: 0,
    color: '#bdc3c7', border: '#7f8c8d', width: 1,
    glow: null, enableGlow: false, dash: [], enableDash: false
  },
  
  ACTIVE_DEAD_END: {
    priority: 110,
    color: '#ffd6d6', border: '#e7b73c', width: 4,
    glow: '#e74c3c', enableGlow: true, dash: [], enableDash: false
  },
  
  ACTIVE_WIN: {
    priority: 110,
    color: '#d6ffd6', border: '#27ae60', width: 4,
    glow: '#27ae60', enableGlow: true, dash: [], enableDash: false
  },
  
  // ========== SPECIAL STATUS TYPES (5) ==========
  
  BEST: {
    priority: 95,
    color: '#d4edda', border: '#28a745', width: 4,
    glow: '#28a745', enableGlow: true, dash: [], enableDash: false
  },
  
  PREVIEW_NODE: {
    priority: 5,
    color: null, border: '#333', width: 2,
    glow: null, enableGlow: false, dash: [4, 4], enableDash: false
  },
  
  BOARD_WON: {
    priority: 85,
    color: '#ffffff', border: '#4caf50', width: 4,
    glow: '#4caf50', enableGlow: true, dash: [], enableDash: false
  },
  
  BOARD_NORMAL: {
    priority: 10,
    color: '#ffffff', border: '#333', width: 2,
    glow: null, enableGlow: false, dash: [], enableDash: false
  },
  
  // ========== INTERACTIVE EVALUATION STATUSES ==========
  
  // Custom Minimax Winners (Blue/Red perspective)
  WIN_BLUE: {
    priority: 92,
    color: '#3498db', border: '#2980b9', width: 4,
    glow: '#3498db', enableGlow: true, dash: [], enableDash: false
  },

  WIN_RED: {
    priority: 92,
    color: '#e74c3c', border: '#c0392b', width: 4,
    glow: '#e74c3c', enableGlow: true, dash: [], enableDash: false
  },

  WAIT: {
    priority: 30,
    color: '#ecf0f1', border: 'transparent', width: 0,
    glow: null, enableGlow: false, dash: [], enableDash: false
  },

  READY: {
    priority: 30,
    color: '#ffffff', border: '#20ca42', width: 3,
    glow: '#e67e22', enableGlow: true, dash: [], enableDash: false
  },

  NEXT_TO_EVALUATE: {
    priority: 99,
    color: '#ffffff', border: '#8e44ad', width: 4,
    glow: '#8e44ad', enableGlow: true, dash: [3, 3], enableDash: true
  },

  EVALUATED: {
    priority: 40,
    color: '#ffffff', border: '#2c3e50', width: 3,
    glow: null, enableGlow: false, dash: [], enableDash: false
  },
  
  DEFAULT: {
    priority: 1,
    color: '#bdc3c7', border: '#333', width: 2,
    glow: null, enableGlow: false, dash: [], enableDash: false
  }
};

/**
 * StatusConfig Manager Object
 * 
 * API Methods:
 * - getStatusTypes() : object - Get current status types with only priority + visual properties
 * - getStyleConfig() : object - Get current style config with all properties including rendering flags
 * - setConfigDefaults(overrides) : void - NEW: Unified override method (replaces setStatusDefaults + setStyleDefaults)
 * - setStatusDefaults(overrides) : void - DEPRECATED: Use setConfigDefaults() instead
 * - setStyleDefaults(overrides) : void - DEPRECATED: Use setConfigDefaults() instead
 * - setStatusProperty(statusName, property, value) : void - Set single status property
 * - setStyleProperty(statusName, property, value) : void - Set single style property
 * - resetToDefaults() : void - Clear all overrides and reset to defaults
 * - getConfigSummary() : string - Get JSON summary of current configuration
 */
const StatusConfig = {
  _config: null,
  STYLE_CONFIG_GLOBAL,

  /**
   * Initialize configuration (lazy initialization)
   * Creates deep clone to prevent mutation of defaults
   */
  _init() {
    if (this._config === null) {
      this._config = JSON.parse(JSON.stringify(DEFAULT_STATUS_CONFIG));
    }
  },

  /**
   * NEW UNIFIED API: Override configuration
   * Merge overrides into the consolidated configuration
   * @param {Object} overrides - Config overrides (e.g., {WIN: {priority: 95, color: '#ff0000'}})
   */
  setConfigDefaults(overrides = {}) {
    this._init();
    for (const [statusName, configProps] of Object.entries(overrides)) {
      if (this._config[statusName]) {
        Object.assign(this._config[statusName], configProps);
      } else {
        this._config[statusName] = configProps;
      }
    }
  },

  /**
   * DEPRECATED: Override status type definitions
   * Use setConfigDefaults() instead
   * @param {Object} overrides - Status type overrides
   */
  setStatusDefaults(overrides = {}) {
    console.warn('StatusConfig.setStatusDefaults() is deprecated. Use setConfigDefaults() instead.');
    this.setConfigDefaults(overrides);
  },

  /**
   * DEPRECATED: Override style configurations
   * Use setConfigDefaults() instead
   * @param {Object} overrides - Style configuration overrides
   */
  setStyleDefaults(overrides = {}) {
    console.warn('StatusConfig.setStyleDefaults() is deprecated. Use setConfigDefaults() instead.');
    this.setConfigDefaults(overrides);
  },

  /**
   * Get current status types (with any overrides applied)
   * Returns only: {priority, color, glow, border, width} for each status
   * @returns {Object} Status types object filtered for priority-based rendering
   */
  getStatusTypes() {
    this._init();
    const filtered = {};
    for (const [statusName, config] of Object.entries(this._config)) {
      filtered[statusName] = {
        priority: config.priority,
        color: config.color,
        glow: config.glow,
        border: config.border,
        width: config.width
      };
    }
    return filtered;
  },

  /**
   * Get current style configuration (with any overrides applied)
   * Returns full configuration including rendering flags
   * @returns {Object} Complete style configuration object
   */
  getStyleConfig() {
    this._init();
    return JSON.parse(JSON.stringify(this._config));
  },

  /**
   * Set a single status property
   * @param {string} statusName - Name of the status (e.g., 'WIN', 'LOSS')
   * @param {string} property - Property name (e.g., 'color', 'priority', 'enableGlow')
   * @param {*} value - New value
   */
  setStatusProperty(statusName, property, value) {
    this._init();
    if (this._config[statusName]) {
      this._config[statusName][property] = value;
    }
  },

  /**
   * Set a single style property
   * @param {string} statusName - Name of the status
   * @param {string} property - Property name (e.g., 'color', 'border', 'glow', 'enableGlow')
   * @param {*} value - New value
   */
  setStyleProperty(statusName, property, value) {
    this._init();
    if (this._config[statusName]) {
      this._config[statusName][property] = value;
    } else {
      this._config[statusName] = { [property]: value };
    }
  },

  /**
   * Reset all configurations to defaults
   */
  resetToDefaults() {
    this._config = JSON.parse(JSON.stringify(DEFAULT_STATUS_CONFIG));
  },

  /**
   * Get JSON summary of current configuration
   * @returns {string} JSON formatted summary
   */
  getConfigSummary() {
    this._init();
    return JSON.stringify({
      statusTypes: Object.keys(this._config),
      properties: Object.keys(this._config.ACTIVE || {}),
      globalEffects: STYLE_CONFIG_GLOBAL
    }, null, 2);
  }
};

// Initialize config immediately
StatusConfig._init();

// Make globally available
if (typeof window !== 'undefined') {
  window.StatusConfig = StatusConfig;
  window.STYLE_CONFIG_GLOBAL = STYLE_CONFIG_GLOBAL;
  window.DEFAULT_STATUS_CONFIG = DEFAULT_STATUS_CONFIG;
}

// Export for Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StatusConfig,
    STYLE_CONFIG_GLOBAL,
    DEFAULT_STATUS_CONFIG
  };
}
