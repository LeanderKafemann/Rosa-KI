/**
 * Konfiguration für die Suchmaschine.
 * @typedef {Object} SearchConfig
 * @property {('BFS'|'DFS')} [strategy='BFS'] - 'BFS' (Breitensuche) oder 'DFS' (Tiefensuche).
 * @property {number} [maxDepth=1000] - Abbruch bei dieser Tiefe.
 * @property {boolean} [checkDuplicates=true] - Verhindert Zyklen durch Hash-Set.
 * @property {function(Object, Object): number} [sortSuccessors=null] - Heuristik zum Sortieren der Nachfolger (z.B. Warnsdorf).
 * @property {function(GameState, number): Promise<string>} [onStep=null] - Callback für jeden Schritt (Visualisierung). Rückgabe 'STOP' bricht ab.
 */

/**
 * Führt Suchalgorithmen auf Zustandsräumen aus.
 * @class SearchEngine
 */
class SearchEngine {
    /**
     * @param {SearchConfig} config 
     */
    constructor(config = {}) {
        this.strategy = config.strategy || 'BFS'; 
        this.maxDepth = config.maxDepth || 1000;
        this.checkDuplicates = config.checkDuplicates !== false;
        this.onStep = config.onStep || null;
        this.sortSuccessors = config.sortSuccessors || null;
    }

    /**
     * Startet die Suche nach einem Zielzustand.
     * @param {GameState} startState 
     * @returns {Promise<{success: boolean, path: Array, nodesVisited: number, stopped: boolean}>}
     */
    async solve(startState) {
        let openList = [];
        // Root Node
        let root = { state: startState, path: [], depth: 0 };
        openList.push(root);

        let visited = new Set();
        if (this.checkDuplicates && startState.getStateKey) {
            visited.add(startState.getStateKey());
        }

        let nodesVisited = 0;

        while (openList.length > 0) {
            // Strategie-Switch: DFS = pop (Stack), BFS = shift (Queue)
            let currentNode = (this.strategy === 'DFS') ? openList.pop() : openList.shift();
            nodesVisited++;

            // VISUALISIERUNG CALLBACK
            if (this.onStep) {
                // Wir warten auf den Callback (für Animationen)
                const result = await this.onStep(currentNode.state, openList.length);
                if (result === 'STOP') {
                    return { success: false, nodesVisited, stopped: true, path: [] };
                }
            }

            // ZIEL PRÜFUNG (Muss vom GameState implementiert sein: isGoal oder won)
            // Für KnightsTour nutzen wir isGoal(), für andere Board.won
            const reachedGoal = (typeof currentNode.state.isGoal === 'function') 
                                ? currentNode.state.isGoal() 
                                : currentNode.state.won;

            if (reachedGoal) {
                return { success: true, path: currentNode.path, nodesVisited, stopped: false };
            }

            if (currentNode.depth >= this.maxDepth) continue;

            // NACHFOLGER GENERIEREN
            // GameState muss getNextStates() implementieren -> liefert { move, state }
            // Falls GameState das nicht hat (z.B. einfaches Board), bräuchte man einen Adapter.
            // Wir gehen davon aus, dass die States (wie KnightBoard) das implementieren.
            if (typeof currentNode.state.getNextStates !== 'function') {
                 console.warn("State implementiert getNextStates nicht!");
                 continue;
            }

            const successors = currentNode.state.getNextStates();
            let childNodes = [];

            for (const item of successors) {
                if (this.checkDuplicates) {
                    const key = item.state.getStateKey();
                    if (visited.has(key)) continue;
                    visited.add(key);
                }

                childNodes.push({
                    state: item.state,
                    path: [...currentNode.path, item.move], 
                    depth: currentNode.depth + 1
                });
            }

            if (this.sortSuccessors) {
                childNodes.sort(this.sortSuccessors);
            }

            // Bei DFS drehen wir um, damit der "beste" (erste im Sort) oben auf dem Stack liegt
            if (this.strategy === 'DFS') {
                childNodes.reverse(); 
            }

            // Zur Liste hinzufügen
            for (let child of childNodes) {
                openList.push(child);
            }
        }

        return { success: false, nodesVisited, path: [], stopped: false };
    }
}