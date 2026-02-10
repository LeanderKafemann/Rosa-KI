/**
 * @fileoverview Basis-Definition für Heuristiken.
 * Stellt das HeuristicsLibrary Objekt bereit, in das sich Module einklinken können.
 */

// Globales Objekt für Heuristiken
const HeuristicsLibrary = {
    
    /**
     * Standard Bewertung für Endliche Spiele (Sieg/Niederlage).
     * @param {GameState} gameState 
     * @param {number} player 
     */
    winLoss: (gameState, player) => {
        if (gameState.winner === player) return 1000;
        if (gameState.winner !== 0 && gameState.winner !== 3) return -1000;
        return 0; // Remis oder offen
    }
};
