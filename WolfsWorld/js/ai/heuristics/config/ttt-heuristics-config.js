/**
 * @fileoverview Bewertungskonfiguration für Tic-Tac-Toe Heuristics
 * 
 * Diese Datei enthält alle anpassbaren Gewichtungen und Schwellwerte
 * für die TTT-Heuristik-Funktionen. Ein Benutzer kann hier die 
 * AI-Verhaltensweise beeinflussen ohne den eigentlichen Code zu ändern.
 * 
 * @file js/ai/heuristics/config/ttt-heuristics-config.js
 */

/**
 * Konfiguration für TTT Regular (3x3) Heuristik
 * @type {Object}
 */
const TTT_HEURISTICS_CONFIG = {
    // ===== REGULAR 3x3 =====
    regular: {
        // Terminal-Zustände
        win: 1000,              // Eigener Sieg
        loss: -1000,            // Gegner gewinnt
        draw: 0,                // Unentschieden
        
        // Open Line Bewertungen (2-in-Reihe = Gewinnchance)
        twoInLine: 10,          // Wir haben 2 in einer Reihe
        twoInLineOpponent: -10, // Gegner hat 2 in einer Reihe
        
        // Single Lines (1-in-Reihe = Potential)
        oneInLine: 1,           // Wir haben 1 in einer Reihe
        oneInLineOpponent: -1,  // Gegner hat 1 in einer Reihe
    },
    
    // ===== 3D (3x3x3) =====
    _3d: {
        // Terminal-Zustände
        win: 10000,             // Eigener Sieg
        loss: -10000,           // Gegner gewinnt
        draw: 0,                // Unentschieden
        
        // Open Line Bewertungen (gleiches System)
        twoInLine: 10,
        twoInLineOpponent: -10,
        oneInLine: 1,
        oneInLineOpponent: -1,
        
        // Kontrolle der Mitte (zentrale Position)
        centerBonus: 20,        // Wir kontrollieren die Mitte
        centerPenalty: -20,     // Gegner kontrolliert die Mitte
        
        // 3D-spezifisch: Raumkontrolle
        spatialControlWeight: 2, // Gewichtung der Raumzentralität
    },
    
    // ===== ULTIMATE (9x9 mit 3x3 Subboards) =====
    ultimate: {
        // Terminal-Zustände
        globalWin: 100000,      // Gesamtes Spiel gewonnen
        globalLoss: -100000,    // Gegner gewinnt das Spiel
        localWin: 1000,         // Lokales Board gewonnen
        localLoss: -1000,       // Gegner gewinnt lokales Board
        
        // Makro-Board Kontrolle
        macroWeight: 50,        // Gewichtung der Makro-Board Reihen
        
        // Lokale Board Bewertung
        localTwoInLine: 10,
        localTwoInLineOpponent: -10,
        
        // Board-Status
        boardWonBonus: 20,      // Bonuspunkte für bereits gewonnenes Board
        boardLostPenalty: -20,  // Strafpunkte für verloren gegangenes Board
    },
};

/**
 * Factory-Funktion um die richtige Konfiguration zu laden
 * @param {string} variant - 'regular', '3d', oder 'ultimate'
 * @returns {Object} Die Konfiguration für diesen Spieltyp
 */
function getTTTHeuristicsConfig(variant = 'regular') {
    const config = TTT_HEURISTICS_CONFIG[variant];
    if (!config) {
        console.warn(`⚠️ Unbekannte TTT-Variante: ${variant}. Fallback auf 'regular'.`);
        return TTT_HEURISTICS_CONFIG.regular;
    }
    return config;
}
