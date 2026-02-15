/**
 * @fileoverview Allgemeine Hilfsfunktionen zur Analyse von Baumstrukturen.
 *
 * Unterstützt zwei Zählvarianten:
 * - Alle Knoten eines Teilbaums
 * - Nur Blattknoten eines Teilbaums
 *
 * Zusätzlich kann ein möglicher Spielbaum direkt aus einem GameState gezählt werden,
 * ohne dass alle Knoten im Visualisierungsbaum materialisiert sein müssen.
 */

const TreeAnalysisUtils = {
    /**
     * Zählt Knoten in einer bereits vorhandenen Baumstruktur.
     * @param {Map<number, Object>} treeStructure
     * @param {number} startNodeId
     * @param {Object} [options]
     * @param {boolean} [options.leafOnly=false] - true: nur Blätter zählen
     * @param {boolean} [options.includeStart=true] - Startknoten mitzählen
     * @param {(node: Object) => boolean} [options.filter] - optionaler Filter
     * @returns {number}
     */
    countStoredSubtreeNodes(treeStructure, startNodeId, options = {}) {
        if (!treeStructure || !(treeStructure instanceof Map) || !treeStructure.has(startNodeId)) return 0;

        const leafOnly = options.leafOnly === true;
        const includeStart = options.includeStart !== false;
        const filter = typeof options.filter === 'function' ? options.filter : null;

        let count = 0;
        const stack = [{ id: startNodeId, depth: 0 }];

        while (stack.length > 0) {
            const current = stack.pop();
            const node = treeStructure.get(current.id);
            if (!node) continue;

            const children = Array.isArray(node.children) ? node.children : [];
            const isLeaf = children.length === 0;
            const passFilter = filter ? filter(node) : true;
            const shouldInclude = includeStart || current.depth > 0;

            if (shouldInclude && passFilter) {
                if (!leafOnly || isLeaf) {
                    count += 1;
                }
            }

            for (let index = 0; index < children.length; index += 1) {
                stack.push({ id: children[index], depth: current.depth + 1 });
            }
        }

        return count;
    },

    /**
     * Zählt die potenziellen Knoten eines Spielbaums ausgehend von einem Zustand.
     * @param {Object} rootState - Muss clone(), makeMove(), getAllValidMoves() unterstützen
     * @param {(state: Object) => boolean} isTerminalFn
     * @param {Object} [options]
     * @param {boolean} [options.leafOnly=false] - true: nur Blattknoten zählen
     * @param {boolean} [options.includeStart=true] - Startknoten mitzählen
     * @param {number} [options.maxDepth=Infinity] - optionale Begrenzung
     * @returns {number}
     */
    countPossibleNodesFromState(rootState, isTerminalFn, options = {}) {
        if (!rootState || typeof rootState.getAllValidMoves !== 'function') return 0;
        if (typeof isTerminalFn !== 'function') return 0;

        const leafOnly = options.leafOnly === true;
        const includeStart = options.includeStart !== false;
        const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : Infinity;

        const countRecursively = (state, depth, isRoot) => {
            const isTerminal = isTerminalFn(state) || depth >= maxDepth;
            if (isTerminal) {
                if (leafOnly) {
                    return includeStart || !isRoot ? 1 : 0;
                }
                return includeStart || !isRoot ? 1 : 0;
            }

            const moves = state.getAllValidMoves();
            const nodeContribution = (!leafOnly && (includeStart || !isRoot)) ? 1 : 0;
            let descendants = 0;

            for (let index = 0; index < moves.length; index += 1) {
                const move = moves[index];
                const child = state.clone();
                child.makeMove(move);
                descendants += countRecursively(child, depth + 1, false);
            }

            if (leafOnly) {
                return descendants;
            }

            return nodeContribution + descendants;
        };

        return countRecursively(rootState, 0, true);
    },
};

if (typeof window !== 'undefined') {
    window.TreeAnalysisUtils = TreeAnalysisUtils;
}
