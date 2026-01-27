/* --- FILE: js/viz/minimax-adapter.js --- */
/**
 * Adapter, der Minimax-Abläufe für die Tree-Engine aufbereitet.
 * Erzeugt den initialen Baum und die Timeline der Ereignisse (Expansion, Bewertung).
 * @namespace
 */
const MinimaxAdapter = {
    /**
     * Erstellt den statischen Baum und die Trace-Daten.
     * @param {GameState} rootState - Der Startzustand.
     * @param {Object} options - Optionen (maxDepth, useAlphaBeta, heuristicFn).
     * @returns {{root: TreeNode, timeline: Array<Object>, idToNodeMap: Map<number, TreeNode>}} Daten für die Visualisierung.
     */
    generateVizData(rootState, options) {
        // 1. Engine mit Trace konfigurieren
        const engine = new MinimaxEngine({
            heuristicFn: options.heuristicFn || HeuristicsLibrary.winLoss,
            maxDepth: options.maxDepth || 2,
            useAlphaBeta: options.useAlphaBeta,
            captureTrace: true
        });

        // 2. Algorithmus ausführen, um Trace zu erhalten
        // Wir klonen rootState, um das Original nicht zu verändern
        const simState = rootState.clone();
        const result = engine.findBestMove(simState);

        // 3. Trace in Baum-Struktur umwandeln
        
        let rootNode = null;
        const nodeStack = [];
        const idToNodeMap = new Map();
        
        result.trace.forEach(step => {
            if (step.type === 'NODE_OPEN') {
                // Neuen Knoten erstellen
                const node = new TreeNode(step.id, { score: '?' }, step.depth);
                node.annotation = step.isMax ? "MAX" : "MIN";
                
                // Visuelle Flags
                node.isMax = step.isMax;
                node.tempScore = -Infinity; // Placeholder
                
                idToNodeMap.set(step.id, node);

                if (nodeStack.length > 0) {
                    const parent = nodeStack[nodeStack.length - 1];
                    parent.children.push(node);
                } else {
                    rootNode = node;
                }
                nodeStack.push(node);
            }
            else if (step.type === 'NODE_CLOSE') {
                nodeStack.pop();
            }
            else if (step.type === 'LEAF') {
                // Blattknoten erstellen
                if (nodeStack.length > 0) {
                    const parent = nodeStack[nodeStack.length - 1];
                    const leafNode = new TreeNode(step.id, { score: step.score }, parent.depth + 1);
                    leafNode.annotation = step.score.toString();
                    leafNode.isLeaf = true;
                    idToNodeMap.set(step.id, leafNode);
                    parent.children.push(leafNode);
                }
            }
        });

        return {
            root: rootNode,
            timeline: result.trace,
            idToNodeMap: idToNodeMap
        };
    },

    /**
     * Zeichnet einen Minimax-Knoten auf dem Canvas.
     * @param {CanvasRenderingContext2D} ctx - Canvas Context.
     * @param {Object} data - Daten des Knotens (Score).
     * @param {number} size - Größe des Knotens.
     * @param {Object} [nodeState] - Zusätzlicher State (z.B. isMax).
     */
    drawNode(ctx, data, size, nodeState) {
        const isMax = nodeState ? nodeState.isMax : false;
        
        // Hintergrund basierend auf Score
        if (typeof data.score === 'number') {
            if (data.score > 0) ctx.fillStyle = "#eafaf1"; // Grünlich
            else if (data.score < 0) ctx.fillStyle = "#fdedec"; // Rötlich
            else ctx.fillStyle = "#ffffff";
        } else {
            ctx.fillStyle = "#ffffff";
        }

        ctx.fillRect(0,0,size,size);
        
        // Inhalt
        ctx.fillStyle = "#2c3e50";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px monospace";
        
        const text = (data.score !== undefined) ? data.score : "?";
        ctx.fillText(text, size/2, size/2);

        // Typ Indikator
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "#7f8c8d";
        ctx.fillText(isMax ? "MAX" : "MIN", size/2, size - 5);
    }
};