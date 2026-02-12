/* --- FILE: js/ai/agents/MonteCarlo-agent.js --- */
/**
 * Agent, der MonteCarlo nutzt.
 * @class MonteCarloAgent
 * @extends Agent
 */
class MonteCarloAgent extends Agent {
    /**
     * Erstellt einen neuen Monte-Carlo-Agenten.
     * @param {Object} config - Konfigurationsobjekt.
     * @param {string} [config.name="MonteCarlo"] - Name des Agenten.
     * @param {number} [config.iterations=1000] - Anzahl der Iterationen.
     * @param {number} [config.explorationConstant=1.414] - Explorationskonstante für UCB1.
     */
    constructor(config = {}) {
        super(config.name || "MonteCarlo KI");

        /**
         * Anzahl der Iterationen.
         * @type {number}
         */
        this.iterations = config.iterations || 1000;

        /**
         * Explorationskonstante für UCB1.
         * @type {number}
         */
        this.explorationConstant = config.explorationConstant || Math.sqrt(2);

        /**
         * Die verwendete MonteCarlo-Engine.
         * @type {MonteCarloEngine}
         */
        this.engine = new MonteCarloEngine({
            iterations: this.iterations,
            explorationConstant: this.explorationConstant,
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