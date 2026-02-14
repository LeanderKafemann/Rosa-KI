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

/**
 * Kein Gewinner / Spiel läuft
 * @constant {number}
 */
const WINNER_NONE = 0;
/**
 * Spieler Blau
 * @constant {number}
 */
const WINNER_BLUE = 1;
/**
 * Spieler Rot
 * @constant {number}
 */
const WINNER_RED = 2;
/**
 * Unentschieden
 * @constant {number}
 */
const WINNER_DRAW = 3;
/**
 * Gewinnbewertung
 * @constant {number}
 */
const VALUE_WIN = 1;
/**
 * Verlustbewertung
 * @constant {number}
 */
const VALUE_LOSS = -1;
/**
 * Bewertungswert für Unentschieden
 * @constant {number}
 */
const VALUE_DRAW = 0;

class AlphaBetaTreeAdapter extends MinimaxTreeAdapter {
    onTreeReady() {
        super.onTreeReady();
        this.sendCommand({
            action: 'UPDATE_CONFIG',
            config: { enableTreeExpansion: false }
        });
    }

    async visualizeSearch(gameState, config) {
        this.currentGameState = gameState;
        this.currentConfig = config;
        this.rootPlayer = gameState.currentPlayer;
        
        this.reset();
        
        // Root Node with Alpha/Beta
        const rootId = this.createNode(gameState, null, {
            depth: 0,
            isMaximizing: true,
            inheritedAlpha: -Infinity,
            inheritedBeta: Infinity
        });
        
        this.nodeStates.set(rootId, gameState);
        this.treeStructure.set(rootId, { 
            parentId: null, 
            children: [], 
            status: 'WAIT',
            value: null, 
            depth: 0,
            isMaximizing: true,
            alpha: -Infinity,
            beta: Infinity
        });
        
        this.expandNodeChildren(rootId, gameState);
        this.checkNodeStatus(rootId);
        this.flushCommands();
        
        return { bestMove: null };
    }

    getInitialConfig() {
        const config = super.getInitialConfig();
        // Override for AlphaBeta
        config.enableTreeExpansion = false;
        return config;
    }

    /**
     * Override metadata creation to include Alpha/Beta from parent
     */
    _createChildMetadata(nodeId, childState, move, currentData) {
        // Calculate current effective alpha/beta for NEW children
        // (Inherit from parent)
        const currentAlpha = currentData ? currentData.alpha : -Infinity;
        const currentBeta = currentData ? currentData.beta : Infinity;

        return {
            depth: currentData.depth + 1,
            isMaximizing: !currentData.isMaximizing,
            inheritedAlpha: currentAlpha,
            inheritedBeta: currentBeta
        };
    }

    _createChildStructure(childId, nodeId, childState, currentData) {
        const currentAlpha = currentData ? currentData.alpha : -Infinity;
        const currentBeta = currentData ? currentData.beta : Infinity;

        return {
            parentId: nodeId,
            children: [],
            status: 'WAIT',
            value: null,
            depth: currentData.depth + 1,
            isMaximizing: !currentData.isMaximizing,
            isTerminal: (childState.winner !== WINNER_NONE || childState.getAllValidMoves().length === 0),
            alpha: currentAlpha,
            beta: currentBeta
        };
    }

    /**
     * Führt die Bewertung eines Knotens durch.
     */
    evaluateNode(nodeId) {
        const data = this.treeStructure.get(nodeId);
        const state = this.nodeStates.get(nodeId);
        this.commands = [];
        
        let value = 0;
        let labelText = "";
        let statusesToAdd = ['EVALUATED'];
        
        // --- CALCULATION ---
        if (data.children.length === 0) {
            // Leaf Evaluation
            if (state.winner === WINNER_BLUE) { value = VALUE_WIN; labelText = `Win (+${VALUE_WIN})`; statusesToAdd.push('WIN_BLUE'); }
            else if (state.winner === WINNER_RED) { value = VALUE_LOSS; labelText = `Lose (${VALUE_LOSS})`; statusesToAdd.push('WIN_RED'); }
            else if (state.winner === WINNER_DRAW) { value = VALUE_DRAW; labelText = `Remis (${VALUE_DRAW})`; statusesToAdd.push('DRAW'); }
            else { value = VALUE_DRAW; labelText = `${VALUE_DRAW}`; }
        } else {
            // Inner Node Evaluation
            // We only look at EVALUATED children (ignore pruned/wait)
            const evaluatedChildren = data.children
                .map(cid => this.treeStructure.get(cid))
                .filter(c => c.status === 'EVALUATED'); // Only real values
            
            if (evaluatedChildren.length === 0) {
                 // Should not happen if logic is correct
                 console.error("Evaluate called on inner node with no evaluated children");
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
                    let c = value > 0 ? '#27ae60' : value < 0 ? '#c0392b' : '#95a5a6';
                    this.commands.push({ action: 'HIGHLIGHT_EDGE', from: nodeId, to: childId, color: c, width: 4 });
                }
            });

            if (value === VALUE_WIN) statusesToAdd.push('WIN_BLUE');
            else if (value === VALUE_LOSS) statusesToAdd.push('WIN_RED');
        }
        
        // Update data
        data.value = value;
        
        // Set status and add additional statuses
        NodeStatusManager.setNodeStatus(nodeId, 'EVALUATED', statusesToAdd, this.treeStructure, this.commands);
        
        // Update label and metadata
        this.commands.push({
            action: 'UPDATE_NODE',
            id: nodeId,
            data: {
                label: labelText,
                metadata: { value: value }
            }
        });
        
        // --- PRUNING CHECK (Check Parent) ---
        if (data.parentId !== null) {
            this.checkParentPruning(data.parentId);
            this.checkNodeStatus(data.parentId); // Might become READY
        }
        
        this.flushCommands();
    }

    /**
     * Checks if the parent can prune its remaining children based on the new value.
     */
    checkParentPruning(parentId) {
        const parent = this.treeStructure.get(parentId);
        if (!parent) return;
        if (parent.status === 'EVALUATED') return; // Already done
        
        // Re-calculate effective Alpha/Beta for parent based on Evaluated Siblings
        // AND inherited bounds from Grandparent
        
        let currentAlpha = parent.alpha; // Inherited alpha
        let currentBeta = parent.beta;   // Inherited beta
        
        // Look at all EVALUATED children of parent to tighten bounds
        const siblings = parent.children.map(cid => this.treeStructure.get(cid));
        const evaluatedSiblings = siblings.filter(s => s.status === 'EVALUATED');
        
        if (parent.isMaximizing) {
            // Parent is MAX. It wants to Maximize value.
            // It updates Alpha with max(children).
            // It also respects Inherited Alpha.
            if (evaluatedSiblings.length > 0) {
                const maxChild = Math.max(...evaluatedSiblings.map(s => s.value));
                currentAlpha = Math.max(currentAlpha, maxChild);
            }
        } else {
            // Parent is MIN. Matches Min(children).
            // Updates Beta.
            if (evaluatedSiblings.length > 0) {
                const minChild = Math.min(...evaluatedSiblings.map(s => s.value));
                currentBeta = Math.min(currentBeta, minChild);
            }
        }
        
        // CHECK CUTOFF
        if (currentAlpha >= currentBeta) {
            console.log(`[Pruning] Node ${parentId}: Alpha (${currentAlpha}) >= Beta (${currentBeta}). Pruning remaining children.`);
            
            // Mark all WAIT/READY siblings as PRUNED
            parent.children.forEach(childId => {
                const sib = this.treeStructure.get(childId);
                // Important: Prune even if not EVALUATED. 
                // Don't prune EVALUATED nodes (they are the proof).
                if (sib && sib.status !== 'EVALUATED' && sib.status !== 'PRUNED') {
                     sib.value = null; 
                     NodeStatusManager.setNodeStatus(childId, 'PRUNED', [], this.treeStructure, this.commands);
                }
            });
        }
    }
}
