/**
 * @fileoverview Heuristische Bewertungsfunktionen für verschiedene Spiele
 * Wird hauptsächlich für begrenzte Tiefensuche verwendet
 */

/**
 * Einfache Heuristik für TicTacToe
 * Zählt mögliche Gewinnlinien für beide Spieler
 * @param {Object} board - Spielbrett
 * @returns {number} - Bewertung zwischen -1 und 1
 */
function evaluateTicTacToe(board) {
    // Wenn Spiel bereits vorbei, echte Bewertung verwenden
    if (board.winner !== 0) {
        if (board.winner === 1) return 1;
        if (board.winner === 2) return -1;
        if (board.winner === 3) return 0; // Draw
    }
    
    // Sonst: Heuristik basierend auf möglichen Gewinnlinien
    const lines = [
        [0,1,2], [3,4,5], [6,7,8], // Horizontal
        [0,3,6], [1,4,7], [2,5,8], // Vertikal
        [0,4,8], [2,4,6]           // Diagonal
    ];
    
    let score = 0;
    
    for (const line of lines) {
        const [a, b, c] = line;
        const values = [board.grid[a], board.grid[b], board.grid[c]];
        
        // Spieler 1 Favoriten
        if (values.filter(v => v === 1).length === 2 && values.includes(0)) {
            score += 0.3;
        }
        // Spieler 2 Favoriten
        if (values.filter(v => v === 2).length === 2 && values.includes(0)) {
            score -= 0.3;
        }
    }
    
    return Math.max(-1, Math.min(1, score));
}

/**
 * Standard-Heuristik (Fallback)
 * @returns {number} - Immer 0
 */
function evaluateDefault() {
    return 0;
}
