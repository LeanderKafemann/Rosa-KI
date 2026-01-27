/* --- FILE: js/ai/heuristics.js --- */
/**
 * Sammlung von Heuristiken für verschiedene Spiele.
 * Eine Heuristik bewertet einen Spielzustand aus Sicht eines Spielers.
 * Rückgabewert: Positiv = Gut für Player, Negativ = Schlecht.
 * @namespace
 */
const HeuristicsLibrary = {

    /**
     * Standard Bewertung für Endliche Spiele (Sieg/Niederlage).
     * @param {GameState} gameState - Der zu bewertende Zustand.
     * @param {number} player - Der Spieler, aus dessen Sicht bewertet wird.
     * @returns {number} Score (-1000, 0, 1000).
     */
    winLoss: (gameState, player) => {
        if (gameState.winner === player) return 1000;
        if (gameState.winner !== 0 && gameState.winner !== 3) return -1000; // Gegner gewinnt
        return 0; // Remis oder offen
    },

    /**
     * Erweiterte Heuristik für Ultimate TTT.
     * Berücksichtigt makro-Board Siege und Materialvorteil.
     * @param {UltimateBoard} game - Das Ultimate Board.
     * @param {number} player - Der Spieler (1 oder 2).
     * @returns {number} Der berechnete Score.
     */
    ultimateTTT: (game, player) => {
        // 1. Check direkten Sieg (höchste Prio)
        if (game.winner === player) return 10000;
        if (game.winner !== 0 && game.winner !== 3) return -10000;

        let score = 0;
        const opponent = player === 1 ? 2 : 1;

        // 2. Makro-Board Bewertung
        for (let i = 0; i < 9; i++) {
            const macroVal = game.macroBoard[i];
            if (macroVal === player) score += 100;
            else if (macroVal === opponent) score -= 100;
            
            // 3. Wenn Board noch offen, bewerte die kleinen Felder
            if (macroVal === 0) {
                const subBoard = game.boards[i];
                // Simples Zählen: Eigene Steine vs Gegner Steine
                // (Zentrum etwas höher gewichtet in Logic eigentlich, hier vereinfacht)
                for (let k = 0; k < 9; k++) {
                    if (subBoard[k] === player) score += 1;
                    else if (subBoard[k] === opponent) score -= 1;
                }
            }
        }
        return score;
    }
};