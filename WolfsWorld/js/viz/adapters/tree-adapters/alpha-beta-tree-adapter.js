/**
 * @fileoverview Alpha-Beta Tree Adapter - Visualisierung mit Pruning
 * 
 * Extends MinimaxTreeAdapter mit Alpha-Beta Pruning Features:
 * - Pruned-Node Visualisierung und Tracking
 * - Alpha/Beta Threshold Anzeige
 * - Performance-Verbesserungen durch Cut-Off-Highlighting
 * 
 * @class AlphaBetaTreeAdapter
 * @extends MinimaxTreeAdapter
 * @author Alexander Wolf
 * @version 2.3
 */

class AlphaBetaTreeAdapter extends MinimaxTreeAdapter {
    /**
     * Konstruktor mit lokalem Cache für Strict-Marker-Updates.
     * @param {HTMLIFrameElement} iframeElement
     */
    constructor(iframeElement) {
        super(iframeElement);
        this._strictNextByParent = new Map();
    }

    /**
     * @returns {boolean}
     */
    _isStrictOrderEnabled() {
        const flags = typeof MINIMAX_VIZ_CONSTANTS !== 'undefined' ? MINIMAX_VIZ_CONSTANTS.FLAGS || {} : {};
        return flags.ENFORCE_ALPHABETA_EVAL_ORDER === true;
    }

    /**
     * Liefert den nächsten offenen Kindknoten eines Elternknotens.
     * @param {Object} parent
     * @returns {number|null}
     */
    _getNextOpenChild(parent) {
        if (!parent || !Array.isArray(parent.children)) return null;
        const nextChild = parent.children.find((childId) => {
            const child = this.treeStructure.get(childId);
            return child && child.status !== 'EVALUATED' && child.status !== 'PRUNED';
        });
        return nextChild !== undefined ? nextChild : null;
    }

    /**
     * Synchronisiert strikte Evaluationsreihenfolge pro Elternknoten.
     * - Nur der nächste offene Kindknoten bleibt READY.
     * - Andere offene READY-Kinder werden auf WAIT gesetzt.
     * - Der nächste offene Kindknoten erhält Marker `NEXT_TO_EVALUATE`.
     * @param {number} parentId
     */
    _syncStrictOrderingForParent(parentId) {
        if (!this._isStrictOrderEnabled()) return;

        const parent = this.treeStructure.get(parentId);
        if (!parent || !Array.isArray(parent.children) || parent.children.length === 0) return;

        const nextChildId = this._getNextOpenChild(parent);
        const previousNextChildId = this._strictNextByParent.has(parentId)
            ? this._strictNextByParent.get(parentId)
            : null;
        this._strictNextByParent.set(parentId, nextChildId);

        parent.children.forEach((childId) => {
            this.commands.push({
                action: 'UPDATE_NODE',
                id: childId,
                removeStatus: 'NEXT_TO_EVALUATE',
            });
        });

        if (nextChildId === null) return;

        // Recompute natural status for selected child first.
        // This prevents strict deadlocks where a formerly READY child
        // was demoted to WAIT and never promoted back.
        super.checkNodeStatus(nextChildId);

        const selectedChild = this.treeStructure.get(nextChildId);

        parent.children.forEach((childId) => {
            const child = this.treeStructure.get(childId);
            if (!child) return;
            if (child.status === 'EVALUATED' || child.status === 'PRUNED') return;

            if (childId === nextChildId) {
                if (selectedChild && selectedChild.status === 'READY') {
                    this.commands.push({
                        action: 'UPDATE_NODE',
                        id: childId,
                        addStatus: 'NEXT_TO_EVALUATE',
                    });
                }
                return;
            }

            if (child.status === 'READY') {
                NodeStatusManager.setNodeStatus(childId, 'WAIT', [], this.treeStructure, this.commands);
            }
        });

        if (previousNextChildId !== nextChildId) {
            this._debugAB('strict-next-child', { parentId, nextChildId });
        }
    }

    /**
     * Expandiert Kinder eines geprunten Knotens rein zur Visualisierung.
     * Die erzeugten Kinder bleiben PRUNED und sind nicht bewertbar.
     * @param {number} nodeId
     * @param {GameState} state
     */
    _expandPrunedNodeChildren(nodeId, state) {
        if (this._isTerminalState(state)) return;

        const currentData = this.treeStructure.get(nodeId);
        if (!currentData) return;

        const validMoves = state.getAllValidMoves();
        const orderedMoves = this._orderMoves(validMoves, state, currentData);

        for (const move of orderedMoves) {
            const childState = state.clone();
            childState.makeMove(move);

            const metadata = this._createChildMetadata(nodeId, childState, move, currentData);
            const childId = this.createNode(childState, nodeId, metadata, 'PRUNED');

            this.nodeStates.set(childId, childState);

            const childStruct = this._createChildStructure(childId, nodeId, childState, currentData);
            childStruct.status = 'PRUNED';
            this.treeStructure.set(childId, childStruct);

            currentData.children.push(childId);

            NodeStatusManager.setNodeStatus(childId, 'PRUNED', [], this.treeStructure, this.commands);

            if (!childStruct.isTerminal) {
                this.commands.push({ action: 'MARK_EXPANDABLE', id: childId });
            }
        }
    }

    /**
     * Schätzt die Anzahl potenziell prunbarer Knoten eines Teilbaums.
     * Nutzt vorhandene Utility-Funktion, inkl. Option für Blattknoten-Zählung.
     * @param {number} nodeId
     * @param {boolean} [leafOnly=false]
     * @returns {number}
     */
    _estimatePotentialSubtreeSize(nodeId, leafOnly = false) {
        const state = this.nodeStates.get(nodeId);
        if (!state) return 0;

        if (typeof window === 'undefined' || !window.TreeAnalysisUtils || typeof window.TreeAnalysisUtils.countPossibleNodesFromState !== 'function') {
            return 1;
        }

        return window.TreeAnalysisUtils.countPossibleNodesFromState(
            state,
            (candidateState) => this._isTerminalState(candidateState),
            {
                leafOnly,
                includeStart: true,
            }
        );
    }

    /**
     * Zählt bereits evaluierte Knoten im aktuell materialisierten Teilbaum.
     * @param {number} nodeId
     * @param {boolean} [leafOnly=false]
     * @returns {number}
     */
    _countEvaluatedStoredNodes(nodeId, leafOnly = false) {
        if (typeof window === 'undefined' || !window.TreeAnalysisUtils || typeof window.TreeAnalysisUtils.countStoredSubtreeNodes !== 'function') {
            return 0;
        }

        return window.TreeAnalysisUtils.countStoredSubtreeNodes(this.treeStructure, nodeId, {
            leafOnly,
            includeStart: true,
            filter: (node) => node.status === 'EVALUATED',
        });
    }

    /**
     * Ermittelt neue Pruning-Knotenanzahl auf Basis des vollständigen Potenzial-Teilbaums.
     * @param {number} nodeId
     * @returns {number}
     */
    _estimateNewlyPrunedCount(nodeId) {
        const potentialAll = this._estimatePotentialSubtreeSize(nodeId, false);
        const evaluatedAll = this._countEvaluatedStoredNodes(nodeId, false);

        if (potentialAll <= 0) return 0;

        return Math.max(1, potentialAll - evaluatedAll);
    }

    /**
     * Erweitert Knoten; geprunte Knoten werden visualisierend erweitert.
     * @param {number} nodeId
     * @param {GameState} state
     */
    expandNodeChildren(nodeId, state) {
        const data = this.treeStructure.get(nodeId);
        if (!data) return;

        if (data.status === 'PRUNED') {
            this._expandPrunedNodeChildren(nodeId, state);
            this.checkNodeStatus(nodeId);
            return;
        }

        super.expandNodeChildren(nodeId, state);
    }

    /**
     * Sortiert Züge optional in günstiger AB-Reihenfolge.
     * Aktuell mit generischer Heuristik + TTT-3x3-Spezialfall (Center -> Ecken -> Kanten).
     * @param {Array} validMoves
     * @param {GameState} state
     * @returns {Array}
     */
    _orderMoves(validMoves, state) {
        const flags = typeof MINIMAX_VIZ_CONSTANTS !== 'undefined' ? MINIMAX_VIZ_CONSTANTS.FLAGS || {} : {};
        if (flags.USE_ALPHABETA_MOVE_ORDERING !== true) return validMoves;

        const sortedMoves = [...validMoves];

        const isRegularTTT =
            state &&
            Array.isArray(state.grid) &&
            state.grid.length === GAME_CONSTANTS.TTT_BOARD_SIZE;

        if (isRegularTTT) {
            const corners = new Set(GAME_CONSTANTS.TTT_CORNERS);
            const centerIndex = GAME_CONSTANTS.TTT_CENTER_INDEX;

            sortedMoves.sort((a, b) => {
                const rank = (move) => {
                    if (move === centerIndex) return 0;
                    if (corners.has(move)) return 1;
                    return 2;
                };
                const rankA = rank(a);
                const rankB = rank(b);
                if (rankA !== rankB) return rankA - rankB;
                return a - b;
            });
        }

        this._debugAB('move-ordering', {
            before: validMoves,
            after: sortedMoves,
        });

        return sortedMoves;
    }

    /**
     * Debug Logging für Alpha-Beta.
     * @param {string} message
     * @param {Object} [payload]
     */
    _debugAB(message, payload) {
        const flags = typeof MINIMAX_VIZ_CONSTANTS !== 'undefined' ? MINIMAX_VIZ_CONSTANTS.FLAGS || {} : {};
        const hasDebugConfig = typeof window !== 'undefined' && window.DebugConfig && window.DEBUG_DOMAINS;
        const allowByCentralConfig = hasDebugConfig
            ? window.DebugConfig.shouldLog(window.DEBUG_DOMAINS.ABPRUNING, 'debug')
            : false;

        if (flags.DEBUG_ALPHABETA_ADAPTER !== true && !allowByCentralConfig) return;

        const debugApi = typeof window !== 'undefined' ? window.DebugConfig : null;
        if (payload !== undefined) {
            if (debugApi && typeof debugApi.log === 'function' && window.DEBUG_DOMAINS) {
                debugApi.log(window.DEBUG_DOMAINS.ABPRUNING, 'debug', `[AlphaBetaTreeAdapter] ${message}`, payload);
            } else {
                console.log(`[AlphaBetaTreeAdapter] ${message}`, payload);
            }
            return;
        }
        if (debugApi && typeof debugApi.log === 'function' && window.DEBUG_DOMAINS) {
            debugApi.log(window.DEBUG_DOMAINS.ABPRUNING, 'debug', `[AlphaBetaTreeAdapter] ${message}`);
            return;
        }
        console.log(`[AlphaBetaTreeAdapter] ${message}`);
    }

    /**
     * Kritischer Logger (warn/error) für AB-Kontext.
     * @param {'warn'|'error'|'critical'} level
     * @param {string} message
     * @param {Object} [payload]
     */
    _logCritical(level, message, payload) {
        const hasDebugConfig = typeof window !== 'undefined' && window.DebugConfig && window.DEBUG_DOMAINS;
        const allow = hasDebugConfig
            ? window.DebugConfig.shouldLog(window.DEBUG_DOMAINS.ABPRUNING, level)
            : true;

        if (!allow) return;
        const debugApi = typeof window !== 'undefined' ? window.DebugConfig : null;
        if (debugApi && typeof debugApi.log === 'function' && window.DEBUG_DOMAINS) {
            debugApi.log(window.DEBUG_DOMAINS.ABPRUNING, level, message, ...(payload !== undefined ? [payload] : []));
            return;
        }

        if (level === 'warn') {
            payload !== undefined ? console.warn(message, payload) : console.warn(message);
            return;
        }
        payload !== undefined ? console.error(message, payload) : console.error(message);
    }

    /**
     * Liefert Initialwerte für Alpha/Beta.
     * @returns {{alpha:number,beta:number}}
     */
    _getInitialBounds() {
        const alpha = typeof AI_CONSTANTS !== 'undefined' && AI_CONSTANTS.ALPHA_INIT !== undefined
            ? AI_CONSTANTS.ALPHA_INIT
            : Number.NEGATIVE_INFINITY;
        const beta = typeof AI_CONSTANTS !== 'undefined' && AI_CONSTANTS.BETA_INIT !== undefined
            ? AI_CONSTANTS.BETA_INIT
            : Number.POSITIVE_INFINITY;
        return { alpha, beta };
    }

    onTreeReady() {
        super.onTreeReady();
        const flags = typeof MINIMAX_VIZ_CONSTANTS !== 'undefined' ? MINIMAX_VIZ_CONSTANTS.FLAGS || {} : {};
        this.sendCommand({
            action: 'UPDATE_CONFIG',
            config: {
                enableTreeExpansion: flags.ENABLE_TREE_EXPANSION_ALPHABETA === true,
            }
        });
    }

    async visualizeSearch(gameState, config) {
        this.currentGameState = gameState;
        this.currentConfig = config;
        this.rootPlayer = gameState.currentPlayer;
        this.stats.nodesVisited = 0;
        this.stats.nodesPruned = 0;
        this.stats.evaluatedNodes = 0;
        this._notifyStatsChanged();
        
        this.reset();
        const initial = this._getInitialBounds();
        
        // Root Node with Alpha/Beta
        const rootId = this.createNode(gameState, null, {
            depth: this.constants.rootDepth,
            isMaximizing: true,
            inheritedAlpha: initial.alpha,
            inheritedBeta: initial.beta,
            alpha: initial.alpha,
            beta: initial.beta,
        });
        
        this.nodeStates.set(rootId, gameState);
        this.treeStructure.set(rootId, { 
            parentId: null, 
            children: [], 
            status: 'WAIT',
            value: null, 
            depth: this.constants.rootDepth,
            isMaximizing: true,
            alpha: initial.alpha,
            beta: initial.beta,
            inheritedAlpha: initial.alpha,
            inheritedBeta: initial.beta,
        });
        
        this.expandNodeChildren(rootId, gameState);
        this.checkNodeStatus(rootId);
        this.flushCommands();
        this._debugAB('visualizeSearch:ready', { rootId, alpha: initial.alpha, beta: initial.beta });
        
        return this._buildResult(rootId);
    }

    getInitialConfig() {
        const config = super.getInitialConfig();
        const flags = typeof MINIMAX_VIZ_CONSTANTS !== 'undefined' ? MINIMAX_VIZ_CONSTANTS.FLAGS || {} : {};
        // Override for AlphaBeta
        config.enableTreeExpansion = flags.ENABLE_TREE_EXPANSION_ALPHABETA === true;
        return config;
    }

    /**
     * Override metadata creation to include Alpha/Beta from parent
     */
    _createChildMetadata(nodeId, childState, move, currentData) {
        // Calculate current effective alpha/beta for NEW children
        // (Inherit from parent)
        const initial = this._getInitialBounds();
        const currentAlpha = currentData ? currentData.alpha : initial.alpha;
        const currentBeta = currentData ? currentData.beta : initial.beta;

        return {
            depth: currentData.depth + 1,
            isMaximizing: !currentData.isMaximizing,
            inheritedAlpha: currentAlpha,
            inheritedBeta: currentBeta,
            alpha: currentAlpha,
            beta: currentBeta,
            move: move,
            moveOrder: currentData.children.length,
        };
    }

    _createChildStructure(childId, nodeId, childState, currentData) {
        const initial = this._getInitialBounds();
        const currentAlpha = currentData ? currentData.alpha : initial.alpha;
        const currentBeta = currentData ? currentData.beta : initial.beta;

        return {
            parentId: nodeId,
            children: [],
            status: 'WAIT',
            value: null,
            depth: currentData.depth + 1,
            isMaximizing: !currentData.isMaximizing,
            isTerminal: this._isTerminalState(childState),
            alpha: currentAlpha,
            beta: currentBeta,
            inheritedAlpha: currentAlpha,
            inheritedBeta: currentBeta,
            moveOrder: currentData.children.length,
        };
    }

    /**
     * Erweiterte Statusprüfung mit Debug für READY-Übergänge.
     * @param {number} nodeId
     */
    checkNodeStatus(nodeId) {
        const data = this.treeStructure.get(nodeId);
        if (!data) return;

        const oldStatus = data.status;
        super.checkNodeStatus(nodeId);

        if (data.parentId !== null) {
            this._syncStrictOrderingForParent(data.parentId);
        }

        if (Array.isArray(data.children) && data.children.length > 0) {
            this._syncStrictOrderingForParent(nodeId);
        }

        const updated = this.treeStructure.get(nodeId);
        if (!updated || oldStatus === updated.status) return;

        if (updated.status === 'READY') {
            const childStatuses = updated.children.map((childId) => {
                const child = this.treeStructure.get(childId);
                return child ? child.status : 'UNKNOWN';
            });

            const evaluatedCount = childStatuses.filter((status) => status === 'EVALUATED').length;
            const prunedCount = childStatuses.filter((status) => status === 'PRUNED').length;

            this._debugAB('node-ready', {
                nodeId,
                oldStatus,
                newStatus: updated.status,
                childCount: updated.children.length,
                evaluatedCount,
                prunedCount,
                childStatuses,
            });
        }
    }

    /**
     * Optional: Prüft erzwungene Evaluationsreihenfolge.
     * @param {number} nodeId
     * @returns {boolean}
     */
    _isAllowedByOrder(nodeId) {
        if (!this._isStrictOrderEnabled()) return true;

        const data = this.treeStructure.get(nodeId);
        if (!data || data.parentId === null) return true;

        const parent = this.treeStructure.get(data.parentId);
        if (!parent) return true;

        const nextChild = this._getNextOpenChild(parent);

        if (nextChild === null) {
            return true;
        }

        const allowed = nextChild === nodeId;
        if (!allowed) {
            this._debugAB('order-blocked', { nodeId, expectedChild: nextChild });
            if (nextChild !== null) {
                this.commands.push({
                    action: 'UPDATE_NODE',
                    id: nextChild,
                    addStatus: 'NEXT_TO_EVALUATE',
                });
                this.flushCommands();
            }
        }
        return allowed;
    }

    /**
     * Rechnet Alpha/Beta eines Nodes aus seinen ausgewerteten Kindern neu.
     * @param {number} nodeId
     */
    _recomputeNodeBounds(nodeId) {
        const node = this.treeStructure.get(nodeId);
        if (!node) return;

        let alpha = node.inheritedAlpha;
        let beta = node.inheritedBeta;

        const evaluatedChildren = node.children
            .map((childId) => this.treeStructure.get(childId))
            .filter((child) => child && child.status === 'EVALUATED');

        if (node.isMaximizing && evaluatedChildren.length > 0) {
            const maxChild = Math.max(...evaluatedChildren.map((child) => child.value));
            alpha = Math.max(alpha, maxChild);
        }

        if (!node.isMaximizing && evaluatedChildren.length > 0) {
            const minChild = Math.min(...evaluatedChildren.map((child) => child.value));
            beta = Math.min(beta, minChild);
        }

        node.alpha = alpha;
        node.beta = beta;

        this._debugAB('bounds-recomputed', {
            nodeId,
            inheritedAlpha: node.inheritedAlpha,
            inheritedBeta: node.inheritedBeta,
            alpha,
            beta,
            evaluatedChildren: evaluatedChildren.length,
            isMaximizing: node.isMaximizing,
        });

        this.commands.push({
            action: 'UPDATE_NODE',
            id: nodeId,
            data: {
                metadata: {
                    depth: node.depth,
                    isMaximizing: node.isMaximizing,
                    moveOrder: node.moveOrder,
                    value: node.value,
                    alpha: node.alpha,
                    beta: node.beta,
                },
            },
        });

        // Bounds an noch nicht evaluierte Kinder weiterreichen,
        // damit AB-Anzeige und Cutoff-Logik konsistent bleiben.
        node.children.forEach((childId) => {
            const child = this.treeStructure.get(childId);
            if (!child || child.status === 'EVALUATED' || child.status === 'PRUNED') return;

            child.inheritedAlpha = node.alpha;
            child.inheritedBeta = node.beta;
            child.alpha = node.alpha;
            child.beta = node.beta;

            this.commands.push({
                action: 'UPDATE_NODE',
                id: childId,
                data: {
                    metadata: {
                        depth: child.depth,
                        isMaximizing: child.isMaximizing,
                        moveOrder: child.moveOrder,
                        value: child.value,
                        alpha: child.alpha,
                        beta: child.beta,
                    },
                },
            });
        });
    }

    /**
     * Führt die Bewertung eines Knotens durch.
     */
    evaluateNode(nodeId) {
        const data = this.treeStructure.get(nodeId);
        const state = this.nodeStates.get(nodeId);
        if (!data || !state) {
            this._debugAB('evaluateNode:missing-data', { nodeId });
            return;
        }

        if (!this._isAllowedByOrder(nodeId)) {
            return;
        }

        this.commands = [];
        this.stats.nodesVisited += 1;
        this.stats.evaluatedNodes += 1;
        this._notifyStatsChanged();
        
        let value = 0;
        let labelText = "";
        let statusesToAdd = ['EVALUATED'];
        
        // --- CALCULATION ---
        if (data.children.length === 0) {
            const leafResult = this._evaluateTerminalState(state);
            value = leafResult.value;
            labelText = leafResult.labelText;
            statusesToAdd = leafResult.statusesToAdd;
        } else {
            // Inner Node Evaluation
            // We only look at EVALUATED children (ignore pruned/wait)
            const evaluatedChildren = data.children
                .map(cid => this.treeStructure.get(cid))
                .filter(c => c.status === 'EVALUATED'); // Only real values
            
            if (evaluatedChildren.length === 0) {
                 // Should not happen if logic is correct
                  this._logCritical('error', '[AlphaBetaTreeAdapter] evaluateNode: inner node has no evaluated children', { nodeId });
                 return;
            }

            const values = evaluatedChildren.map(c => c.value);
            
            if (data.isMaximizing) {
                value = Math.max(...values);
                labelText = `Max = ${value}`;
            } else {
                value = Math.min(...values);
                labelText = `Min = ${value}`;
            }
            
            // Highlight Best Edge
            data.children.forEach(childId => {
                const child = this.treeStructure.get(childId);
                if (child && child.status === 'EVALUATED' && child.value === value) {
                    const c = this._getEdgeColorForValue(value);
                    this.commands.push({
                        action: 'HIGHLIGHT_EDGE',
                        from: nodeId,
                        to: childId,
                        color: c,
                        width: this.constants.edgeWidth,
                    });
                }
            });

            statusesToAdd = ['EVALUATED', ...this._getValueStatuses(value)];
        }
        
        // Update data
        data.value = value;
        this._recomputeNodeBounds(nodeId);
        
        // Set status and add additional statuses
        NodeStatusManager.setNodeStatus(nodeId, 'EVALUATED', statusesToAdd, this.treeStructure, this.commands);
        
        // Update label and metadata
        this.commands.push({
            action: 'UPDATE_NODE',
            id: nodeId,
            data: {
                label: labelText,
                metadata: {
                    depth: data.depth,
                    isMaximizing: data.isMaximizing,
                    moveOrder: data.moveOrder,
                    value: value,
                    alpha: data.alpha,
                    beta: data.beta,
                }
            }
        });
        
        // --- PRUNING CHECK (Check Parent) ---
        if (data.parentId !== null) {
            this.checkParentPruning(data.parentId);
            this.checkNodeStatus(data.parentId); // Might become READY
        }

        this._debugAB('evaluateNode:done', {
            nodeId,
            value,
            alpha: data.alpha,
            beta: data.beta,
            parentId: data.parentId,
        });

        if (typeof this.onActiveNodeChanged === 'function') {
            this.onActiveNodeChanged(nodeId, data);
        }

        this._notifyStatsChanged();
        
        this.flushCommands();
    }

    /**
     * Markiert einen gesamten Teilbaum rekursiv als PRUNED.
     * Bereits EVALUATED Knoten behalten ihren Status (Priorität: manuell evaluiert).
     * @param {number} nodeId
     * @param {number|null} parentId
     * @returns {number} Anzahl neu geprunter Knoten
     */
    _pruneSubtree(nodeId, parentId) {
        const node = this.treeStructure.get(nodeId);
        if (!node) return 0;

        if (node.status === 'EVALUATED') {
            return 0;
        }

        let prunedCount = 0;
        if (node.status !== 'PRUNED') {
            node.value = null;
            NodeStatusManager.setNodeStatus(nodeId, 'PRUNED', [], this.treeStructure, this.commands);
            prunedCount += 1;

            const flags = typeof MINIMAX_VIZ_CONSTANTS !== 'undefined' ? MINIMAX_VIZ_CONSTANTS.FLAGS || {} : {};
            if (flags.ENABLE_PRUNING_HIGHLIGHT !== false && parentId !== null) {
                this.commands.push({
                    action: 'HIGHLIGHT_EDGE',
                    from: parentId,
                    to: nodeId,
                    color: this.constants.edgePrunedColor,
                    width: this.constants.edgeWidth,
                });
            }
        }

        node.children.forEach((childId) => {
            prunedCount += this._pruneSubtree(childId, nodeId);
        });

        return prunedCount;
    }

    /**
     * Checks if the parent can prune its remaining children based on the new value.
     */
    checkParentPruning(parentId) {
        const parent = this.treeStructure.get(parentId);
        if (!parent) return;
        if (parent.status === 'EVALUATED') return; // Already done

        this._recomputeNodeBounds(parentId);

        const currentAlpha = parent.alpha;
        const currentBeta = parent.beta;
        
        // CHECK CUTOFF
        if (currentAlpha >= currentBeta) {
            this._debugAB('prune-triggered', {
                parentId,
                alpha: currentAlpha,
                beta: currentBeta,
            });

            let newlyPruned = 0;
            // Mark all remaining siblings recursively as PRUNED
            parent.children.forEach(childId => {
                const sib = this.treeStructure.get(childId);
                if (!sib || sib.status === 'EVALUATED' || sib.status === 'PRUNED') return;
                newlyPruned += this._estimateNewlyPrunedCount(childId);
                this._pruneSubtree(childId, parentId);
            });

            if (newlyPruned > 0) {
                this.stats.nodesPruned += newlyPruned;
                this._notifyStatsChanged();
            }

            this._syncStrictOrderingForParent(parentId);
        } else {
            this._debugAB('no-prune', {
                parentId,
                alpha: currentAlpha,
                beta: currentBeta,
                reason: 'alpha < beta',
            });
        }
    }

    /**
     * Klick-Verhalten: nur READY-Knoten dürfen evaluiert werden.
     * @param {number} nodeId
     */
    handleNodeClick(nodeId) {
        const data = this.treeStructure.get(nodeId);
        if (!data || data.status !== 'READY') return;

        if (typeof this.onActiveNodeChanged === 'function') {
            this.onActiveNodeChanged(nodeId, data);
        }

        this.commands = [];
        NodeStatusManager.setNodeStatus(nodeId, 'ACTIVE', [], this.treeStructure, this.commands);
        this.flushCommands();
        this.evaluateNode(nodeId);
    }
}
