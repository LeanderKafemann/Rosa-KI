/**
 * @fileoverview Alpha-Beta Tree Adapter - Visualisierung mit Pruning
 * 
 * Basiert auf MinimaxTreeAdapter, fügt Alpha-Beta Pruning hinzu.
 * - Interactive Pruning: Wenn ein Knoten bewertet wird, der einen Cutoff verursacht,
 *   werden verleibende Geschwister automatisch PRUNED.
 * 
 * @class AlphaBetaTreeAdapter
 * @version 1.0
 */
class AlphaBetaTreeAdapter {
    constructor(iframeElement) {
        this.iframe = iframeElement;
        this.nodeIdCounter = 0;
        this.nodeMap = new Map();
        this.ready = false;
        this.commands = [];
        
        // State management
        this.currentGameState = null;
        this.currentConfig = null;
        this.nodeStates = new Map(); 
        
        // Structure: id -> { parentId, childrenIds[], status, value, alpha, beta, depth, isMaximizing }
        this.treeStructure = new Map(); 
        
        window.addEventListener('message', (event) => {
            if (!event.data) return;
            if (event.data.type === 'TREE_READY') {
                this.ready = true;
            }
            else if (event.data.type === 'NODE_EXPANSION_REQUEST') {
                this.handleExpansionRequest(event.data.nodeId);
            }
            else if (event.data.type === 'NODE_CLICKED') {
                this.handleNodeClick(event.data.nodeId);
            }
        });
        
        this.startHandshake();
    }

    startHandshake() {
        setTimeout(() => { this.ready = true; }, 500);
    }
    
    sendCommand(command) {
        if (!this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage({ type: 'TREE_COMMAND', command }, '*');
    }

    getBoardKey(board) {
        return board.getStateKey ? board.getStateKey() : JSON.stringify(board.grid || board);
    }

    async visualizeSearch(gameState, config) {
        console.log('AlphaBetaAdapter: Start', config);
        this.currentGameState = gameState;
        this.currentConfig = config;
        this.reset();
        
        // Root Node: Alpha = -Inf, Beta = +Inf
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
    
    flushCommands() {
        if (this.commands.length > 0) {
            this.sendCommand({ action: 'BATCH', commands: this.commands });
            this.commands = [];
        }
    }



    createNode(board, parentId, metadata) {
        const nodeId = this.nodeIdCounter++;
        const stateKey = this.getBoardKey(board);
        this.nodeMap.set(stateKey, nodeId);
        
        const command = {
            action: 'ADD_NODE',
            id: nodeId,
            label: "", // Initially empty
            boardData: {
                grid: [...board.grid],
                currentPlayer: board.currentPlayer,
                size: board.size || 3,
                winner: board.winner
            },
            boardType: 'minimax',
            metadata: { ...metadata },
            status: 'WAIT'
        };
        
        if (parentId !== null) command.parentId = parentId;
        
        this.commands.push(command);
        return nodeId;
    }

    /**
     * Expandiert Node und gibt Kindern aktuelle Alpha/Beta Fenster.
     */
    expandNodeChildren(nodeId, state) {
        if (state.winner !== 0) return; 

        const parentData = this.treeStructure.get(nodeId);
        // Calculate current effective alpha/beta for NEW children
        // (Though in Expand-Then-Evaluate, this is just the inherited values)
        const currentAlpha = parentData ? parentData.alpha : -Infinity;
        const currentBeta = parentData ? parentData.beta : Infinity;

        const validMoves = state.getAllValidMoves();
        const currentDepth = parentData ? parentData.depth : 0;
        const isMaximizing = (currentDepth % 2 === 0);
        const childIsMax = !isMaximizing;
        
        for (const move of validMoves) {
            const childState = state.clone();
            childState.makeMove(move);
            
            const childId = this.createNode(childState, nodeId, {
                depth: currentDepth + 1,
                isMaximizing: childIsMax,
                inheritedAlpha: currentAlpha,
                inheritedBeta: currentBeta
            });
            
            this.nodeStates.set(childId, childState);
            
            const childStruct = {
                parentId: nodeId,
                children: [],
                status: 'WAIT',
                value: null,
                depth: currentDepth + 1,
                isMaximizing: childIsMax,
                isTerminal: (childState.winner !== 0 || childState.getAllValidMoves().length === 0),
                alpha: currentAlpha, 
                beta: currentBeta
            };
            this.treeStructure.set(childId, childStruct);
            
            if (parentData) parentData.children.push(childId);
            
            if (!childStruct.isTerminal) {
                this.commands.push({ action: 'MARK_EXPANDABLE', id: childId });
            }
            
            this.checkNodeStatus(childId);
        }
        
        this.checkNodeStatus(nodeId);
    }

    /**
     * Ready logic: Leaf (Terminal) or All Children Evaluated/Pruned
     */
    checkNodeStatus(nodeId) {
        const data = this.treeStructure.get(nodeId);
        if (!data) return;
        if (data.status === 'EVALUATED' || data.status === 'PRUNED') return;
        
        let newStatus = 'WAIT';
        const state = this.nodeStates.get(nodeId);
        const isTerminal = state && (state.winner !== 0 || state.getAllValidMoves().length === 0);
        
        // 1. Leaf
        if (data.children.length === 0) {
            if (isTerminal) newStatus = 'READY';
            else newStatus = 'WAIT';
        } 
        // 2. Inner Node
        else {
            // Include PRUNED in "done" check
            const allChildrenDone = data.children.every(childId => {
                const child = this.treeStructure.get(childId);
                return child && (child.status === 'EVALUATED' || child.status === 'PRUNED');
            });
            
            if (allChildrenDone) newStatus = 'READY';
            else newStatus = 'WAIT';
        }
        
        if (newStatus !== data.status) {
            NodeStatusManager.setNodeStatus(nodeId, newStatus, [], this.treeStructure, this.commands);
        }
    }

    handleNodeClick(nodeId) {
        const data = this.treeStructure.get(nodeId);
        if (data && data.status === 'READY') {
            this.evaluateNode(nodeId);
        }
    }

    /**
     * Evaluation + Pruning Logic
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
            if (state.winner === 1) { value = 1; labelText = "Win (+1)"; statusesToAdd.push('WIN_BLUE'); }
            else if (state.winner === 2) { value = -1; labelText = "Lose (-1)"; statusesToAdd.push('WIN_RED'); }
            else if (state.winner === 3) { value = 0; labelText = "Remis (0)"; statusesToAdd.push('DRAW'); }
            else { value = 0; labelText = "0"; }
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

            if (value === 1) statusesToAdd.push('WIN_BLUE');
            else if (value === -1) statusesToAdd.push('WIN_RED');
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
                if (sib && sib.status !== 'EVALUATED' && sib.status !== 'PRUNED') {
                     sib.value = null; 
                     NodeStatusManager.setNodeStatus(childId, 'PRUNED', [], this.treeStructure, this.commands);
                }
            });
        }
    }

    handleExpansionRequest(nodeId) {
        if (this.nodeStates.has(nodeId)) {
             this.expandNodeChildren(nodeId, this.nodeStates.get(nodeId));
        }
        this.flushCommands();
    }
    
    reset() {
        this.nodeIdCounter = 0;
        this.nodeMap.clear();
        this.treeStructure.clear();
        this.nodeStates.clear();
        this.commands = [];
        this.sendCommand({ action: 'CLEAR' });
        this.sendCommand({ 
            action: 'UPDATE_CONFIG', 
            config: { 
                showLevelIndicators: true,
                levelIndicatorType: 'minimax',
                rootPlayerColor: '#e74c3c', opponentColor: '#3498db'
            } 
        });
    }
}
