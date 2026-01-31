/**
 * @fileoverview
 * Agent für zufällige Zugwahl (Random Agent).
 * Wählt aus allen gültigen Zügen einen zufällig aus.
 */

/**
 * Ein Agent, der zufällige gültige Züge macht.
 * Dient oft als Baseline für Vergleiche.
 * @class RandomAgent
 * @extends Agent
 */
class RandomAgent extends Agent {
    constructor() {
        super("Zufall");
    }

    /**
     * Wählt zufällig einen der gültigen Züge.
     * @param {GameState} gameState 
     * @returns {Object|null}
     */
    getAction(gameState) {
        const moves = gameState.getAllValidMoves();
        if (!moves || moves.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * moves.length);
        return {
            move: moves[randomIndex],
            reason: "Zufallswahl"
        };
    }
}