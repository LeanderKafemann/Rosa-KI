/* --- FILE: js/ai/minimax.js --- */
/**
 * Kern-Implementierung des Minimax Algorithmus mit Alpha-Beta Pruning.
 * Unabhängig vom Agenten, damit es auch für Visualisierungen genutzt werden kann.
 * @fileoverview
 * @class
 */
class MinimaxEngine {
    /**
     * Erstellt eine neue Engine-Instanz.
     * @param {Object} config - Konfigurationsobjekt.
     * @param {function(GameState, number): number} config.heuristicFn - Bewertungsfunktion.
     * @param {number} [config.maxDepth=3] - Maximale Suchtiefe.
     * @param {boolean} [config.useAlphaBeta=true] - Alpha-Beta Pruning aktivieren.
     * @param {boolean} [config.captureTrace=false] - Ob ein Log für Visualisierung erstellt werden soll.
     */
    constructor(config) {
        /**
         * Die Bewertungsfunktion zur Evaluierung von Blattknoten.
         * @type {function(GameState, number): number}
         */
        this.heuristicFn = config.heuristicFn || ((g, p) => 0);

        /**
         * Die maximale Suchtiefe.
         * @type {number}
         */
        this.maxDepth = config.maxDepth || 3;

        /**
         * Flag für Alpha-Beta Pruning.
         * @type {boolean}
         */
        this.useAlphaBeta = config.useAlphaBeta !== false; // Default true

        /**
         * Flag, ob der Suchverlauf aufgezeichnet werden soll.
         * @type {boolean}
         */
        this.captureTrace = config.captureTrace || false;
        
        // Stats
        /**
         * Zähler für die Anzahl der besuchten Knoten.
         * @type {number}
         */
        this.nodesVisited = 0;

        /**
         * Log für die Visualisierungsschritte.
         * @type {Array<Object>}
         */
        this.traceLog = []; 
    }

    /**
     * Findet den besten Zug für den aktuellen Spieler.
     * @param {GameState} rootState - Der aktuelle Spielzustand.
     * @returns {{move: (Object|number|null), score: number, nodesVisited: number, trace: Array<Object>}} Das Ergebnisobjekt.
     */
    findBestMove(rootState) {
        this.nodesVisited = 0;
        this.traceLog = [];
        const player = rootState.currentPlayer;
        
        // Initialer Aufruf
        // Alpha: Bestes Ergebnis für Max (initial -Unendlich)
        // Beta: Bestes Ergebnis für Min (initial +Unendlich)
        const result = this._minimax(
            rootState, 
            this.maxDepth, 
            -Infinity, 
            Infinity, 
            true, 
            player
        );

        return {
            move: result.move,
            score: result.score,
            nodesVisited: this.nodesVisited,
            trace: this.traceLog
        };
    }

    /**
     * Rekursive Minimax Funktion.
     * @private
     * @param {GameState} state - Aktueller Zustand.
     * @param {number} depth - Verbleibende Tiefe.
     * @param {number} alpha - Alpha-Wert (Max).
     * @param {number} beta - Beta-Wert (Min).
     * @param {boolean} isMaximizing - Ob wir maximieren.
     * @param {number} rootPlayer - Der Spieler, für den wir optimieren.
     * @returns {{score: number, move: (Object|number|null)}} Das beste Ergebnis für diesen Teilbaum.
     */
    _minimax(state, depth, alpha, beta, isMaximizing, rootPlayer) {
        this.nodesVisited++;
        const stateId = this.nodesVisited; // Pseudo ID für Trace
        
        // 1. Blatt-Prüfung (Sieg, Remis oder Max-Tiefe)
        // Prüfe auf Spielende: winner !== 0 oder keine gültigen Züge
        const hasValidMoves = state.getAllValidMoves && state.getAllValidMoves().length > 0;
        const isTerminal = (state.winner !== undefined && state.winner !== 0) || !hasValidMoves;
        
        if (depth === 0 || isTerminal) {
            const score = this.heuristicFn(state, rootPlayer);
            if (this.captureTrace) {
                this.traceLog.push({ type: 'LEAF', id: stateId, score: score, depth: this.maxDepth - depth });
            }
            return { score: score, move: null };
        }

        if (this.captureTrace) {
            this.traceLog.push({ type: 'NODE_OPEN', id: stateId, isMax: isMaximizing, depth: this.maxDepth - depth, alpha, beta });
        }

        const validMoves = state.getAllValidMoves();
        let bestMove = null;

        if (isMaximizing) {
            let maxEval = -Infinity;
            
            for (const move of validMoves) {
                const childState = state.clone();
                childState.makeMove(move);

                const evalResult = this._minimax(childState, depth - 1, alpha, beta, false, rootPlayer);
                
                if (evalResult.score > maxEval) {
                    maxEval = evalResult.score;
                    bestMove = move;
                }
                
                // Visualisierung Update nach Kind-Rückkehr
                if (this.captureTrace) {
                    this.traceLog.push({ type: 'UPDATE_VAL', id: stateId, score: maxEval, childScore: evalResult.score });
                }

                // Alpha-Beta
                if (this.useAlphaBeta) {
                    alpha = Math.max(alpha, evalResult.score);
                    if (beta <= alpha) {
                        if (this.captureTrace) this.traceLog.push({ type: 'PRUNE', id: stateId, reason: 'beta <= alpha' });
                        break; // Beta Cut-off
                    }
                }
            }
            
            if (this.captureTrace) {
                this.traceLog.push({ type: 'NODE_CLOSE', id: stateId, score: maxEval, move: bestMove });
            }
            return { score: maxEval, move: bestMove };

        } else { // Minimizing Player
            let minEval = Infinity;
            
            for (const move of validMoves) {
                const childState = state.clone();
                childState.makeMove(move);

                const evalResult = this._minimax(childState, depth - 1, alpha, beta, true, rootPlayer);
                
                if (evalResult.score < minEval) {
                    minEval = evalResult.score;
                    bestMove = move;
                }

                if (this.captureTrace) {
                    this.traceLog.push({ type: 'UPDATE_VAL', id: stateId, score: minEval, childScore: evalResult.score });
                }

                if (this.useAlphaBeta) {
                    beta = Math.min(beta, evalResult.score);
                    if (beta <= alpha) {
                        if (this.captureTrace) this.traceLog.push({ type: 'PRUNE', id: stateId, reason: 'beta <= alpha' });
                        break; // Alpha Cut-off
                    }
                }
            }
            
            if (this.captureTrace) {
                this.traceLog.push({ type: 'NODE_CLOSE', id: stateId, score: minEval, move: bestMove });
            }
            return { score: minEval, move: bestMove };
        }
    }
}