/**
 * Adapter für Tiefensuche (DFS) mit Suchbaum-Visualisierung.
 * Konvertiert Spielzustände in TreeVizEngine-Kommandos via postMessage.
 * Unterstützt Backtracking-Visualisierung.
 * @class
 * @author GitHub Copilot
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
                console.log('DFSTreeAdapter: TreeVizEngine ready for DFS');
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
        console.log('DFSTreeAdapter.buildToDepth called:', {
            initialState,
            maxDepth,
            options,
            ready: this.ready
        });
        
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
                
                // Determine color
                let color = '#4a90e2'; // default blue
                if (childState.isGoal && childState.isGoal()) {
                    color = '#2ecc71'; // green for goal
                } else if (isDuplicate) {
                    color = '#e74c3c'; // red for duplicate
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
                    color: color,
                    boardData: childState
                });
                
                if (isDuplicate && markDuplicates) {
                     commands.push({
                       action: 'HIGHLIGHT_NODE',
                       id: childId,
                       color: '#c0392b',
                       style: 'border'
                    });
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
        console.log(`DFSTreeAdapter: Sending ${commands.length} commands to engine`);
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
                
                let color = '#4a90e2';
                if (step.state.isGoal && step.state.isGoal()) {
                    color = '#4caf50';
                }
                
                this.sendCommand({
                    action: 'BATCH',
                    commands: [{
                        action: 'ADD_NODE',
                        id: childId,
                        parentId: parentId,
                        label: step.label || '',
                        color: color,
                        boardData: step.state
                    }, {
                        action: 'HIGHLIGHT_NODE',
                        id: childId,
                        color: '#ff9800',
                        style: 'glow'
                    }]
                });
                
                yield { type: 'VISIT', nodeId: childId, state: step.state };
            } else if (step.type === 'BACKTRACK') {
                // Highlight backtracking
                const nodeKey = step.state.getStateKey();
                const nodeId = this.nodeMap.get(nodeKey);
                
                this.sendCommand({
                    action: 'UPDATE_NODE',
                    id: nodeId,
                    color: '#e74c3c' // Red for dead end
                });
                
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
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DFSTreeAdapter;
}
