/* --- FILE: js/ai/montecarlo.js --- */
/**
 * Kern-Implementierung des Monte Carlo Tree Search (MCTS) Algorithmus.
 * Unabhängig vom Agenten, damit es auch für Visualisierungen genutzt werden kann.
 * @class
 */
class MonteCarloEngine {
    /**
     * Erstellt eine neue Engine-Instanz.
     * @param {Object} config - Konfigurationsobjekt.
     * @param {number} [config.iterations=1000] - Anzahl der Iterationen.
     * @param {boolean} [config.uniformSelection=false] - Ob alle verfügbaren Züge gleichmäßig ausgewählt werden sollen.
     * @param {boolean} [config.captureTrace=false] - Ob ein Log für Visualisierung erstellt werden soll.
     */
    constructor(config) {
        /**
         * Anzahl der Iterationen.
         * @type {number}
         */
        this.iterations = config.iterations || 1000;

        /**
         * Flag für gleichmäßige Auswahl der Züge.
         * @type {boolean}
         */
        this.uniformSelection = config.uniformSelection || false;

        /**
         * Flag, ob der Suchverlauf aufgezeichnet werden soll.
         * @type {boolean}
         */
        this.captureTrace = config.captureTrace || false;

        /**
         * Log für die Visualisierungsschritte.
         * @type {Array<Object>}
         */
        this.traceLog = [];
    }

    /**
     * Findet den besten Zug für den aktuellen Spieler.
     * @param {GameState} rootState - Der aktuelle Spielzustand.
     * @returns {{move: (Object|number|null), score: number, trace: Array<Object>}} Das Ergebnisobjekt.
     */
    findBestMove(rootState) {
        this.traceLog = [];
        const root = new this.Node(rootState.clone(), null, null, null);
        this.validMoves = state.getAllValidMoves();
        if (this.validMoves == []){
            return {move:null, score:-Infinity, trace:[]};
        }
        const moveTally = new Array(this.validMoves.length).fill(0);

        for (let i = 0; i < this.iterations; i++) {
            if (this.uniformSelection){
                let move = Math.floor(i/this.iterations*this.validMoves.length())
            } else {
                let move = Math.floor(Math.random*this.validMoves.length())
            }
            moveTally[move] += this._runIteration(root, this.validMoves[move]);
        }

        // Wähle den besten Zug basierend auf den meisten Besuchen
        let bestMove = null;
        let bestScore = -Infinity;
        for (i = 0; i++; i<moveTally.length) {
            if (moveTally[i] > bestScore){
                bestScore = moveTally[i];
                bestMove = this.validMoves[i];
            }
        }

        return {
            move: bestMove,
            score: bestScore,
            trace: this.traceLog
        };
    }

    /**
     * Führt eine Iteration des MCTS durch.
     * @private
     * @param {Node} root - Der Wurzelknoten.
     * @param {number} move - Welcher Zug getestet wird
     */
    _runIteration(root, move) {
        root.makeMove(move);
        while(not(isTerminal(root))){
            this.validMoves = root.getAllValidMoves();
            root.makeMove(this.validMoves[Math.floor(Math.random()*this.validMoves.length())])
        }
        let winner = root.winner();
        return winner;
    }

    /**
     * Selektiert einen Knoten basierend auf UCB1 oder gleichmäßiger Auswahl.
     * @private
     * @param {Node} node - Startknoten.
     * @returns {Node} Der ausgewählte Knoten.
     */
    _select(node) {
        while (!node.isTerminal() && node.isFullyExpanded()) {
            node = node.getBestChild(this.uniformSelection);
            if (this.captureTrace) {
                this.traceLog.push({ type: 'SELECT', nodeId: node.visits, move: node.move });
            }
        }
        return node;
    }

    /**
     * Simuliert ein zufälliges Spiel vom gegebenen Zustand.
     * @private
     * @param {GameState} state - Der Startzustand für die Simulation.
     * @returns {number} Der Gewinner (1, 2 oder 0 für Unentschieden).
     */
    _simulate(state) {
        let currentState = state;
        while (!this._isTerminal(currentState)) {
            let moves = currentState.getAllValidMoves();
            if (moves.length === 0) break;
            let randomMove = moves[Math.floor(Math.random() * moves.length)];
            currentState = currentState.clone();
            currentState.makeMove(randomMove);
        }
        return currentState.winner || 0;
    }

    /**
     * Prüft, ob ein Zustand terminal ist.
     * @private
     * @param {GameState} state - Der zu prüfende Zustand.
     * @returns {boolean} True, wenn terminal.
     */
    _isTerminal(state) {
        return (state.winner !== undefined && state.winner !== 0) || state.getAllValidMoves().length === 0;
    }

    /**
     * Propagiert die Ergebnisse zurück zum Wurzelknoten.
     * @private
     * @param {Node} node - Der Startknoten.
     * @param {number} winner - Der Gewinner der Simulation.
     */
    _backpropagate(node, winner) {
        while (node !== null) {
            node.visits++;
            if (node.playerWhoMoved === winner) {
                node.wins++;
            }
            if (this.captureTrace) {
                this.traceLog.push({ type: 'BACKPROP', nodeId: node.visits, winner: winner });
            }
            node = node.parent;
        }
    }

    /**
     * Private Node-Klasse für den MCTS-Baum.
     * @private
     * @class
     */
    Node = class {
        /**
         * Erstellt einen neuen Knoten.
         * @param {GameState} state - Der Spielzustand.
         * @param {Node|null} parent - Der Elternknoten.
         * @param {Object|number|null} move - Der Zug, der zu diesem Zustand führte.
         * @param {number|null} playerWhoMoved - Der Spieler, der den Zug gemacht hat.
         */
        constructor(state, parent, move, playerWhoMoved) {
            this.state = state;
            this.parent = parent;
            this.move = move;
            this.children = [];
            this.visits = 0;
            this.wins = 0;
            this.playerWhoMoved = playerWhoMoved;
            this.untriedMoves = state.getAllValidMoves().slice();
        }

        /**
         * Prüft, ob der Knoten vollständig expandiert ist.
         * @returns {boolean}
         */
        isFullyExpanded() {
            return this.untriedMoves.length === 0;
        }

        /**
         * Prüft, ob der Knoten terminal ist.
         * @returns {boolean}
         */
        isTerminal() {
            return (this.state.winner !== undefined && this.state.winner !== 0) || this.state.getAllValidMoves().length === 0;
        }
    };
}
