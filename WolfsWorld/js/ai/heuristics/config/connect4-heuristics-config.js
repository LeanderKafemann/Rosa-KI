/**
 * @fileoverview Bewertungskonfiguration für Connect4 Heuristics
 * 
 * Diese Datei enthält alle anpassbaren Gewichtungen und Schwellwerte
 * für die Connect4-Heuristik-Funktionen. Ein Benutzer kann hier die 
 * AI-Verhaltensweise beeinflussen ohne den eigentlichen Code zu ändern.
 * 
 * Die Bewertung analysiert "Fenster" von 4 aufeinanderfolgenden Positionen
 * und bewertet sie basierend auf Anzahl eigener Steine, gegnerischer Steine
 * und leerer Felder.
 * 
 * @file js/ai/heuristics/config/connect4-heuristics-config.js
 */

/**
 * Konfiguration für Connect4 Heuristik
 * @type {Object}
 */
const CONNECT4_HEURISTICS_CONFIG = {
    // ===== REGULAR (6x7) =====
    regular: {
        // Terminal-Zustände (Fenster-Bewertung)
        fourInRow: 10000,           // Wir haben 4 in einer Reihe (Sieg!)
        threeInRow: 100,            // Wir haben 3 + 1 leeres Feld (Gewinnchance)
        twoInRow: 10,               // Wir haben 2 leere + 2 Steine (potential)
        
        // Gegner-Bewertung (defensive Bewertung)
        opponentThreeInRow: -90,    // Gegner hat 3 + 1 leer (BLOCKIEREN!)
        opponentTwoInRow: -5,       // Gegner hat 2 + 2 leer (defensiv)
        
        // Raumkontrolle: Zentrale Spalten sind wertvoll
        centerColumnWeight: 3,      // Multiplikator für Positionen in der Mitte
        centerColumnBonus: 20,      // Bonus für Stein in Mittenbereich
        
        // Draw-Bewertung
        draw: 0,                    // Unentschieden (neutral)
    },
    
    // ===== 3D (4x4x4 oder freie Größe) =====
    _3d: {
        // Terminal-Zustände
        fourInRow: 100000,          // Sieg im 3D Raum
        threeInRow: 1000,           // 3-in-Reihe im 3D (kritisch)
        twoInRow: 50,               // 2-in-Reihe im 3D
        
        // Gegner-Bewertung
        opponentThreeInRow: -1000,
        opponentTwoInRow: -50,
        
        // Raumkontrolle: Zentraler Würfel
        centerCubeWeight: 2.0,      // Distanz zum Zentrum (1,1,1)
        spatialFactor: 5,           // (max_distance - actual_distance) * spatialFactor
        
        // Draw
        draw: 0,
    },
};

/**
 * Window-Analyse Konfiguration
 * Fenster-Größe und wie sie bewertet werden
 * @type {Object}
 */
const CONNECT4_WINDOW_CONFIG = {
    // Fenster-Länge (für Connect N)
    windowLength: 4,
    
    // Richtungen für Fenster-Scan
    directions: [
        'horizontal',
        'vertical',
        'diagonal_right',   // \
        'diagonal_left',    // /
        'temporal'          // nur für 3D: Z-Achse
    ],
};

/**
 * Factory-Funktion um die richtige Konfiguration zu laden
 * @param {string} variant - 'regular' oder '3d'
 * @returns {Object} Die Konfiguration für diesen Spieltyp
 */
function getConnect4HeuristicsConfig(variant = 'regular') {
    const config = CONNECT4_HEURISTICS_CONFIG[variant];
    if (!config) {
        console.warn(`⚠️ Unbekannte Connect4-Variante: ${variant}. Fallback auf 'regular'.`);
        return CONNECT4_HEURISTICS_CONFIG.regular;
    }
    return config;
}
