/**
 * Adapter für Tiefensuche (DFS) mit Suchbaum-Visualisierung.
 * Konvertiert Spielzustände in TreeVizEngine-Kommandos via postMessage.
 * Unterstützt Backtracking-Visualisierung.
 * @class
 * @author Alexander Wolf
 * @version 2.3
 */
class DFSTreeAdapter {
    /**
     * Erstellt einen neuen DFS Tree Adapter.
     * @param {HTMLIFrameElement} iframeElement
     * Das iframe-Element mit der TreeVizEngine.
     */
    constructor(iframeElement) {
        /**
         * Das iframe-Element mit der TreeVizEngine.
         * @type {HTMLIFrameElement}
         */
        this.iframe = iframeElement;
        
        /**
         * Zähler für eindeutige Node-IDs.
         * @type {number}
         */
        this.nodeIdCounter = 0;
        
        /**
         * Mapping von State-Keys zu Node-IDs.
         * @type {Map<string, number>}
         */
        this.nodeMap = new Map();
        
        /**
         * Aktuelle Suchtiefe.
         * @type {number}
         */
        this.currentDepth = 0;
        
        /**
         * Status, ob TreeVizEngine bereit ist.
         * @type {boolean}
         */
        this.ready = false;
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TREE_READY') {
                this.ready = true;
                // Explicitly disable tree expansion for DFS (full tree shown for path tracing)
                this.sendCommand({
                    action: 'UPDATE_CONFIG',
                    config: { enableTreeExpansion: false }
                });
                // Stop checking when ready
                if (this.checkInterval) {
                    clearInterval(this.checkInterval);
                    this.checkInterval = null;
                }
            }
        });

        // Start proactive handshake
        this.startHandshake();
    }

    /**
     * Initiiert den Handshake mit der TreeVizEngine.
     * Sendet CHECK_READY Kommandos bis eine Antwort empfangen wird.
     */
    startHandshake() {
        // Send CHECK_READY every 200ms until we get a response
        if (this.checkInterval) clearInterval(this.checkInterval);
        
        const check = () => {
            if (this.ready) return;
            this.sendCommand({ action: 'CHECK_READY' });
        };
        
        // Immediate check
        check();
        
        // Periodic check
        this.checkInterval = setInterval(check, 200);
        
        // Stop checking after 10 seconds
        setTimeout(() => {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
            }
        }, 10000);
    }
    
    /**
     * Baut einen DFS-Suchbaum bis zur angegebenen Tiefe auf.
     * @param {Object} initialState
     * Der initiale Spielzustand.
     * @param {number} maxDepth
     * Maximale Suchtiefe.
     * @param {Object} options
     * Zusätzliche Optionen (duplicates, backtracking).
     * @returns {Object}
     * Statistiken über den generierten Baum.
     */
    async buildToDepth(initialState, maxDepth, options = {}) {
        // Build DFS tree to specified depth
        
        if (!this.ready) {
            console.warn('TreeVizEngine not ready yet. Attempting optimized send anyway...');
             // Fallthrough - do not return! Try to send anyway if iframe exists.
            if (!this.iframe || !this.iframe.contentWindow) {
                console.error('DFSTreeAdapter: Iframe contentWindow missing!');
                return;
            }
        }
        
        // Clear existing tree
        this.sendCommand({ action: 'CLEAR' });
        this.nodeIdCounter = 0;
        this.nodeMap.clear();
        
        // Configuration
        const markDuplicates = options.duplicates === true;
        const showBacktracking = options.backtracking !== false; // Default true
        const commands = [];
        
        // Track visited states to detect duplicates
        const visited = new Map(); // stateKey -> nodeId
        
        // Add root node
        const rootId = this.nodeIdCounter++;
        const rootKey = initialState.getStateKey();
        this.nodeMap.set(rootKey, rootId);
        visited.set(rootKey, rootId);
        
        commands.push({
            action: 'ADD_NODE',
            id: rootId,
            parentId: null,
            label: '',
            color: '#4a90e2',
            boardData: initialState
        });
        
        // DFS recursive function
        const dfs = (state, nodeId, depth) => {
            // Stop if max depth reached
            if (depth >= maxDepth) {
                return;
            }
            
            // Get child states
            const nextStates = state.getNextStates();
            
            nextStates.forEach(({ state: childState, move }) => {
                const childKey = childState.getStateKey();
                
                // Duplicate handling
                let isDuplicate = false;
                if (visited.has(childKey)) {
                    isDuplicate = true;
                    if (!markDuplicates) {
                        isDuplicate = false; // Ignore duplicate status if we want full tree
                    }
                }
                
                // Create child node
                const childId = this.nodeIdCounter++;
                this.nodeMap.set(childKey, childId);
                
                // Determine status
                const status = [];
                if (childState.isGoal && childState.isGoal()) {
                    status.push('WIN');
                } else if (isDuplicate) {
                    status.push('DUPLICATE');
                }
                
                // Format move label
                let label = '';
                if (move && move.r !== undefined && move.c !== undefined) {
                    label = `(${move.r},${move.c})`;
                } else if (typeof move === 'string') {
                    label = move;
                }
                
                // Add node command
                commands.push({
                    action: 'ADD_NODE',
                    id: childId,
                    parentId: nodeId,
                    label: label,
                    edgeLabel: label,  // ← FIX: Add edge label (shows move on edge)
                    status: status,
                    boardData: childState
                });
                
                if (isDuplicate && markDuplicates) {
                    return; // Stop expansion at duplicate
                }

                // Mark visited (only if tracking duplicates)
                if (markDuplicates) {
                    visited.set(childKey, childId);
                }
                
                // Recursive DFS
                dfs(childState, childId, depth + 1);
            });
        };
        
        // Start DFS from root
        dfs(initialState, rootId, 0);
        
        // Send all commands as batch
        this.sendCommand({ action: 'BATCH', commands: commands });
        
        // Store stats
        this.currentDepth = maxDepth;
        this.stats = {
            totalNodes: this.nodeIdCounter,
            depth: maxDepth,
            duplicatesMarked: markDuplicates
        };
        
        return this.stats;
    }
    
    /**
     * Visualize a search with animated backtracking
     * @param {Object} initialState - Starting state
     * @param {Function} searchFn - Search function that yields steps
     * @param {Object} options - Options
     */
    async* visualizeSearch(initialState, searchFn, options = {}) {
        if (!this.ready) {
            console.warn('TreeVizEngine not ready yet');
            return;
        }
        
        // Clear existing tree
        this.sendCommand({ action: 'CLEAR' });
        this.nodeIdCounter = 0;
        this.nodeMap.clear();
        
        // Add root
        const rootId = this.nodeIdCounter++;
        const rootKey = initialState.getStateKey();
        this.nodeMap.set(rootKey, rootId);
        
        this.sendCommand({
            action: 'BATCH',
            commands: [{
                action: 'ADD_NODE',
                id: rootId,
                parentId: null,
                label: '',
                color: '#4a90e2',
                boardData: initialState
            }]
        });
        
        yield { type: 'ROOT', nodeId: rootId };
        
        // Run search and visualize steps
        for await (const step of searchFn(initialState)) {
            if (step.type === 'VISIT') {
                // New node visited
                const parentKey = step.parentState.getStateKey();
                const parentId = this.nodeMap.get(parentKey);
                
                const childId = this.nodeIdCounter++;
                const childKey = step.state.getStateKey();
                this.nodeMap.set(childKey, childId);
                
                const status = ['ACTIVE'];
                if (step.state.isGoal && step.state.isGoal()) {
                    status.push('WIN');
                }
                
                this.sendCommand({
                    action: 'BATCH',
                    commands: [{
                        action: 'ADD_NODE',
                        id: childId,
                        parentId: parentId,
                        label: step.label || '',
                        status: status,
                        boardData: step.state
                    }, {
                        action: 'SET_FOCUS',
                        id: childId
                    }]
                });
                
                yield { type: 'VISIT', nodeId: childId, state: step.state };
            } else if (step.type === 'BACKTRACK') {
                // Highlight backtracking
                const nodeKey = step.state.getStateKey();
                const nodeId = this.nodeMap.get(nodeKey);
                
                console.log(`[ADAPTER] BACKTRACK: nodeKey=${nodeKey}, nodeId=${nodeId}`);
                
                // Wenn wir einen BACKTRACK für diesen Knoten bekommen,
                // bedeutet das: ALLE seine Kinder wurden bereits als VISIT erzeugt!
                // Deshalb können wir jetzt überprüfen: Sind ALLE Kinder dieses Knotens DEAD_END?
                this.sendCommand({
                    action: 'BATCH',
                    commands: [{
                        action: 'UPDATE_NODE',
                        id: nodeId,
                        data: { 
                            removeStatus: 'ACTIVE',
                            addStatus: 'DEAD_END' 
                        }
                    }, {
                        action: 'SET_FOCUS',
                        id: nodeId
                    }, {
                        action: 'CHECK_AND_MARK_DEAD_END',
                        id: nodeId
                    }]
                });
                
                console.log(`[ADAPTER] Sent CHECK_AND_MARK_DEAD_END for nodeId=${nodeId}`);
                
                yield { type: 'BACKTRACK', nodeId: nodeId };
            }
        }
    }
    
    /**
     * Hebt einen Pfad durch den Baum farblich hervor.
     * @param {Array<string>} statePath
     * Array von State-Keys die den Pfad bilden.
     */
    highlightPath(statePath) {
        if (!this.ready) return;
        
        const commands = [];
        
        // Remove existing highlights
        commands.push({
            action: 'REMOVE_HIGHLIGHT'
        });
        
        // Highlight each edge in the path
        for (let i = 0; i < statePath.length - 1; i++) {
            const fromKey = statePath[i];
            const toKey = statePath[i + 1];
            
            const fromId = this.nodeMap.get(fromKey);
            const toId = this.nodeMap.get(toKey);
            
            if (fromId !== undefined && toId !== undefined) {
                commands.push({
                    action: 'HIGHLIGHT_EDGE',
                    fromId: fromId,
                    toId: toId,
                    color: '#ff9800',
                    width: 4
                });
                
                commands.push({
                    action: 'HIGHLIGHT_NODE',
                    id: toId,
                    color: '#ff9800',
                    style: 'glow'
                });
            }
        }
        
        this.sendCommand({ action: 'BATCH', commands: commands });
    }
    
    /**
     * Fokussiert die Ansicht auf einen bestimmten Knoten.
     * @param {string} stateKey
     * State-Key des zu fokussierenden Knotens.
     */
    focusNode(stateKey) {
        const nodeId = this.nodeMap.get(stateKey);
        if (nodeId !== undefined) {
            this.sendCommand({ action: 'SET_FOCUS', id: nodeId });
        }
    }
    
    /**
     * Setzt die Ansicht auf die Standard-Position zurück.
     */
    resetView() {
        this.sendCommand({ action: 'RESET_VIEW' });
    }
    
    /**
     * Gibt aktuelle Statistiken über den Suchbaum zurück.
     * @returns {Object}
     * Statistiken (totalNodes, depth, duplicatesMarked).
     */
    getStats() {
        return this.stats || {
            totalNodes: 0,
            depth: 0,
            duplicatesMarked: false
        };
    }
    
    /**
     * Send command to TreeVizEngine via postMessage
     * @private
     */
    sendCommand(commandObj) {
        if (!this.iframe || !this.iframe.contentWindow) {
            console.error('Iframe not available');
            return;
        }
        
        this.iframe.contentWindow.postMessage({
            type: 'TREE_COMMAND',
            command: commandObj
        }, '*');
    }
    
    /**
     * Get node count
     */
    getNodeCount() {
        return this.nodeIdCounter;
    }
    
    /**
     * UNIFIED NAVIGATION: Navigate to a tree node and update game state accordingly.
     * Works for both Warnsdorf and non-Warnsdorf modes.
     * 
     * CRITICAL FIX: currentNodeId ist eine globale Variable, die sich in createNode() ändert!
     * Der Adapter erhält sie als Parameter, aber das ist nur der INITIAL-Wert!
     * Solution: Wir nutzen einen Getter-Callback um den aktuellen Wert zu erhalten
     * 
     * @param {number} targetNodeId         - Ziel-Node im Baum
     * @param {Function} getCurrentNodeId   - Getter für aktuelle Node (weil sie sich ändert!)
     * @param {Map} nodeParentMap           - Baum-Struktur (WIRD GELESEN)
     * @param {Map} treeStructure           - Knoten-Details (WIRD GELESEN)
     * @param {Object} board                - Spielzustand (WIRD MODIFIZIERT)
     * @param {Function} handleBack         - Undo-Callback (mit Tree-Sync)
     * @param {Function} createNode         - Node-Erstell-Callback (ändert currentNodeId!)
     * @param {Function} generatePreviews   - Preview-Erstell-Callback
     * @param {Function} updateUI           - Render-Callback
     * @param {boolean} isWarnsdorf         - Spielmodus
     * 
     * @returns {Promise<boolean>} Success/failure of navigation
     */
    async navigateInGame(
        targetNodeId,
        getCurrentNodeId,
        nodeParentMap,
        treeStructure,
        board,
        handleBack,
        createNode,
        generatePreviews,
        updateUI,
        isWarnsdorf
    ) {
        const currentNodeId = getCurrentNodeId();
        console.log(`[navigateInGame] Starting: current=${currentNodeId}, target=${targetNodeId}`);
        
        // Use tree-engine's high-level abstraction
        const pathInfo = reconstructTreePath(currentNodeId, targetNodeId, nodeParentMap, treeStructure);
        
        if (!pathInfo.isValid) {
            console.error('[navigateInGame] Invalid path calculated', pathInfo);
            return false;
        }
        
        const { backwardSteps, forwardMoves, lca, isValid } = pathInfo;
        console.log(`[navigateInGame] Path: ${backwardSteps} back, ${forwardMoves.length} forward, LCA=${lca}`);
        
        try {
            // ========== PHASE 1: BACKWARD =========
            // Undo moves until we reach the LCA
            for (let i = 0; i < backwardSteps; i++) {
                console.log(`[navigateInGame] Backward step ${i+1}/${backwardSteps}`);
                handleBack(); // This updates both board and tree AND global currentNodeId
                updateUI(); // CRITICAL: Update board display after undo
                
                // Small delay to allow DOM updates
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log(`[navigateInGame] Backward complete, now at LCA=${lca}`);
            
            // ========== WARNSDORF SPECIAL HANDLING =========
            // After handleBack() in Warnsdorf mode, preview-nodes are deleted
            // We need to regenerate them for the LCA before moving forward
            if (isWarnsdorf && forwardMoves.length > 0) {
                console.log('[navigateInGame] Regenerating previews for LCA (Warnsdorf mode)');
                generatePreviews(lca); // Generate preview nodes at LCA
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // ========== PHASE 2: FORWARD =========
            // Move forward to the target
            // CRITICAL: After each createNode(), the global currentNodeId is updated.
            // We use getCurrentNodeId() GETTER to get the updated value!
            for (let i = 0; i < forwardMoves.length; i++) {
                const { r, c, moveKey } = forwardMoves[i];
                console.log(`[navigateInGame] Forward step ${i+1}/${forwardMoves.length}: (${r},${c})`);
                
                // Move on board
                const moveSuccess = board.move(r, c);
                if (!moveSuccess) {
                    console.error(`[navigateInGame] board.move(${r},${c}) failed!`);
                    console.error(`[navigateInGame] Board current position: (${board.currentPos.row},${board.currentPos.col})`);
                    return false;
                }
                
                // Get CURRENT value of currentNodeId (before createNode updates it)
                const parentNodeId = getCurrentNodeId();
                console.log(`[navigateInGame] Creating node: parent=${parentNodeId}, move=(${r},${c})`);
                
                // Create tree node for this move
                const edgeCoord = `(${r},${c})`;
                createNode(board, parentNodeId, null, edgeCoord);
                // NOTE: After createNode() returns, the global currentNodeId is updated!
                
                // CRITICAL: Update board display after EACH move
                updateUI();
                
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log('[navigateInGame] Navigation complete!');
            return true;
            
        } catch (error) {
            console.error('[navigateInGame] Exception during navigation:', error);
            return false;
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DFSTreeAdapter;
}
