/**
 * @fileoverview ZENTRALE Konstanten-Definitionen
 * Alle Dateien verwenden diese Konstanten von hier.
 * Keine Duplikate mehr in verschiedenen Dateien!
 * 
 * Struktur:
 * - GAME_CONSTANTS: Spieler, Status, Felder
 * - AI_CONSTANTS: Suchtiefen, Algorithmus-Parameter
 * - UI_CONSTANTS: Farben, Dimensionen
 */

// ===== SPIELER & STATUS KONSTANTEN =====
/**
 * Globale Spiel-Konstanten, die alle Spiele nutzen
 * @type {Object}
 */
const GAME_CONSTANTS = {
    // Spieler IDs
    PLAYER1: 1,          // Blau / Kreis
    PLAYER2: 2,          // Rot / Kreuz
    
    // Spiel-Status
    NONE: 0,             // Kein Gewinner / Spiel läuft
    DRAW: 3,             // Unentschieden
    
    // Feld-Status (hauptsächlich Tic-Tac-Toe)
    CELL_EMPTY: 0,
    INVALID_INDEX: -1,
    
    // Board-Größen (Tic-Tac-Toe)
    TTT_BOARD_SIZE: 9,
    TTT_GRID_WIDTH: 3,
    TTT_GRID_HEIGHT: 3,
    TTT_CENTER_INDEX: 4,
    TTT_CORNERS: [0, 2, 6, 8],
    TTT_WIN_CONDITIONS: [
        [0,1,2], [3,4,5], [6,7,8], // Horizontal
        [0,3,6], [1,4,7], [2,5,8], // Vertikal
        [0,4,8], [2,4,6]           // Diagonal
    ],
    
    // Board-Größen (Connect4)
    CONNECT4_ROWS: 6,
    CONNECT4_COLS: 7,
    CONNECT4_WIN_LENGTH: 4,
    
    // Board-Größen (3D)
    TTT_3D_DEFAULT_SIZE: 3,
    TTT_3D_MAX_SIZE: 5,
};

// ===== AI-ALGORITHMUS KONSTANTEN =====
/**
 * AI und Algorithmus-Parameter
 * @type {Object}
 */
const AI_CONSTANTS = {
    // Suchtiefe
    DEFAULT_MAX_DEPTH: 3,
    DEFAULT_SEARCH_DEPTH: 1000,
    MIN_DEPTH: 0,
    
    // Agent Typen
    AGENT_RANDOM: 'random',
    AGENT_RULEBASED: 'rulebased',
    AGENT_MINIMAX: 'minimax',
    
    // Alpha-Beta Pruning
    ALPHA_INIT: -Infinity,
    BETA_INIT: Infinity,
    
    // Transposition Table
    TRANSPOSITION_TABLE_MAX_SIZE: 100000,
};

// ===== UI & RENDERING KONSTANTEN =====
/**
 * UI-Constants für Rendering und Darstellung
 * @type {Object}
 */
const UI_CONSTANTS = {
    // Canvas Dimensionen
    CANVAS_WIDTH: 500,
    CANVAS_HEIGHT: 500,
    
    // Board Rendering
    BORDER_WIDTH: 6,
    LINE_CAP: 'round',
    BORDER_COLOR: '#2c3e50',
    
    // Farben für Spieler
    PLAYER1_COLOR: '#3498db',  // Blau (Kreis)
    PLAYER2_COLOR: '#e74c3c',  // Rot (Kreuz)
    BACKGROUND_COLOR: '#ecf0f1',
    HIGHLIGHT_COLOR: '#eafaed',
    
    // Text Rendering
    FONT_SIZE: 14,
    FONT_FAMILY: 'Arial, sans-serif',
};

// ===== DEBUG KONSTANTEN =====
/**
 * Debug-Flags für Fehlerdiagnose
 * @type {Object}
 */
const DEBUG_CONSTANTS = {
    LOG_INIT: true,           // Initialisierung loggen
    LOG_MOVES: false,          // Alle Züge loggen
    LOG_SCORING: false,        // Scoring Details loggen
    LOG_AI_DECISIONS: false,   // AI Entscheidungen loggen
};
