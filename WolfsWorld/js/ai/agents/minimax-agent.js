/* --- FILE: js/ai/agents/minimax-agent.js --- */
/**
 * @fileoverview
 * Agent für Minimax-Algorithmus mit Alpha-Beta Pruning.
 * Berechnet optimale Züge durch baumartige Spielzustandssimulation.
 */

/**
 * Agent, der Minimax nutzt.
 * @class MinimaxAgent
 * @extends Agent
 */
class MinimaxAgent extends Agent {
    /**
     * Erstellt einen neuen Minimax-Agenten.
     * @param {Object} config - Konfigurationsobjekt.
     * @param {string} [config.name="Minimax"] - Name des Agenten.
     * @param {number} [config.maxDepth=3] - Suchtiefe.
     * @param {boolean} [config.useAlphaBeta=true] - Ob Alpha-Beta genutzt werden soll.
     * @param {function} [config.heuristicFn] - Bewertungsfunktion. Falls null, wird winLoss genutzt.
     */
    constructor(config = {}) {
        super(config.name || "Minimax KI");
        
        /**
         * Maximale Suchtiefe.
         * @type {number}
         */
        this.maxDepth = config.maxDepth || 3;

        /**
         * Flag für Alpha-Beta Pruning.
         * @type {boolean}
         */
        this.useAlphaBeta = config.useAlphaBeta !== false;
        
        /**
         * Die Bewertungsfunktion.
         * @type {function(GameState, number): number}
         */
        this.heuristicFn = config.heuristicFn || HeuristicsLibrary.winLoss;
        
        /**
         * Die verwendete Minimax-Engine.
         * @type {MinimaxEngine}
         */
        this.engine = new MinimaxEngine({
            heuristicFn: this.heuristicFn,
            maxDepth: this.maxDepth,
            useAlphaBeta: this.useAlphaBeta,
            captureTrace: false // Im Spielbetrieb brauchen wir kein Trace
        });
    }

    /**
     * Berechnet den besten Zug.
     * @param {GameState} gameState - Der aktuelle Spielzustand.
     * @returns {Object|null} Der berechnete Zug mit Begründung.
     */
    getAction(gameState) {
        // Safety: Wenn Spiel schon vorbei, null
        if (gameState.winner !== 0) return null;
        if (gameState.getAllValidMoves().length === 0) return null;

        // Engine starten
        const result = this.engine.findBestMove(gameState);
        
        if (result.move === null) {
            // Fallback (sollte bei korrekter Engine nicht passieren, außer Spiel ist voll)
            return null;
        }

        return {
            move: result.move,
            reason: `Score: ${result.score} (Tiefe ${this.maxDepth})`
        };
    }
}