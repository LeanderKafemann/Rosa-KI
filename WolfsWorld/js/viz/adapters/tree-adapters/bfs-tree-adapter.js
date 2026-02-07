/**
 * Adapter für Breitensuche (BFS) mit Suchbaum-Visualisierung.
 * Konvertiert Spielzustände in TreeVizEngine-Kommandos via postMessage.
 * @class
 * @author GitHub Copilot
 * @version 2.3
 */
class BFSTreeAdapter {
    /**
     * Erstellt einen neuen BFS Tree Adapter.
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
                console.log('BFSTreeAdapter: TreeVizEngine ready');
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
            // console.log('BFSTreeAdapter: Checking if engine is ready...');
            this.sendCommand({ action: 'CHECK_READY' });
        };
        
        // Immediate check
        check();
        
        // Periodic check
        this.checkInterval = setInterval(check, 200);
        
        // Stop checking after 10 seconds to avoid infinite polling if something is broken
        setTimeout(() => {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
                if (!this.ready) console.warn('BFSTreeAdapter: Giving up on handshake after 10s');
            }
        }, 10000);
    }
    
    /**
     * Baut einen BFS-Suchbaum bis zur angegebenen Tiefe auf.
     * @param {Object} initialState
     * Der initiale Spielzustand.
     * @param {number} maxDepth
     * Maximale Suchtiefe.
     * @param {Object} options
     * Zusätzliche Optionen (duplicates).
     * @returns {Object}
     * Statistiken über den generierten Baum.
     */
    async buildToDepth(initialState, maxDepth, options = {}) {
        // Build BFS tree to specified depth
        
        if (!this.ready) {
            console.warn('TreeVizEngine not ready yet. Attempting optimized send anyway...');
            // Fallthrough - do not return! Try to send anyway if iframe exists.
            if (!this.iframe || !this.iframe.contentWindow) {
                console.error('BFSTreeAdapter: Iframe contentWindow missing!');
                return;
            }
        }
        
        // Clear existing tree
        this.sendCommand({ action: 'CLEAR' });
        this.nodeIdCounter = 0;
        this.nodeMap.clear();
        
        // Configuration
        const markDuplicates = options.duplicates === true; // Wenn true, Duplikate MIT roter Kante zeigen
        const commands = [];
        
        // BFS queue: {state, nodeId, parentId, depth, move}
        const queue = [];
        const visited = new Map(); // stateKey -> nodeId für Duplikats-Erkennung
        
        // Add root node
        const rootId = this.nodeIdCounter++;
        const rootKey = initialState.getStateKey();
        this.nodeMap.set(rootKey, rootId);
        visited.set(rootKey, rootId); // Merke Root-State
        
        commands.push({
            action: 'ADD_NODE',
            id: rootId,
            parentId: null,
            label: '',
            color: '#4a90e2',
            boardData: initialState // Pass board object for visualization
        });
        
        queue.push({
            state: initialState,
            nodeId: rootId,
            parentId: null,
            depth: 0,
            move: null
        });
        
        // BFS expansion
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Stop if max depth reached
            if (current.depth >= maxDepth) {
                continue;
            }
            
            // Get child states
            const nextStates = current.state.getNextStates();
            
            nextStates.forEach(({ state: childState, move }) => {
                const childKey = childState.getStateKey();
                
                // Duplicate detection
                let isDuplicate = false;
                if (visited.has(childKey)) {
                    isDuplicate = true;
                    // If we are NOT marking duplicates (meaning we want a full tree visualization),
                    // we pretend it's not a duplicate so it gets expanded normally.
                    if (!markDuplicates) {
                        isDuplicate = false;
                    }
                }
                
                // Determine node settings
                let status = [];
                let shouldExpand = true;

                if (childState.isGoal && childState.isGoal()) {
                    status.push('WIN');
                    // Optional: Don't expand if goal reached? Depends on requirement.
                    // Usually we stop at goal in search, but for viz maybe show all?
                    // Let's keep expanding until maxDepth
                } else if (isDuplicate) {
                    status.push('DUPLICATE');
                    shouldExpand = false; // Stop at duplicate
                }
                
                // Create child node
                const childId = this.nodeIdCounter++;
                this.nodeMap.set(childKey, childId);
                
                // Only mark as visited if we are tracking duplicates
                // (or always track first visit to identify future duplicates)
                if (!visited.has(childKey)) {
                    visited.set(childKey, childId);
                }
                
                // Add node command
                commands.push({
                    action: 'ADD_NODE',
                    id: childId,
                    parentId: current.nodeId,
                    label: '',
                    edgeLabel: move || '',
                    status: status,
                    boardData: childState
                });

                // Add to queue if expanion is allowed
                if (shouldExpand) {
                    queue.push({
                        state: childState,
                        nodeId: childId,
                        parentId: current.nodeId,
                        depth: current.depth + 1,
                        move: move
                    });
                }
            });
        }
        
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
     * Hebt einen Pfad durch den Baum farblich hervor.
     * @param {Array<string>} statePath
     * Array von State-Keys die den Pfad bilden.
     */
    highlightPath(statePath) {
        if (!this.ready) return;
        
        const commands = [];
        
        // Remove existing highlights
        commands.push({
            command: 'REMOVE_HIGHLIGHT',
            data: {}
        });
        
        // Highlight each edge in the path
        for (let i = 0; i < statePath.length - 1; i++) {
            const fromKey = statePath[i];
            const toKey = statePath[i + 1];
            
            const fromId = this.nodeMap.get(fromKey);
            const toId = this.nodeMap.get(toKey);
            
            if (fromId !== undefined && toId !== undefined) {
                commands.push({
                    command: 'HIGHLIGHT_EDGE',
                    data: {
                        from: fromId,
                        to: toId,
                        color: '#ff9800',
                        width: 4
                    }
                });
                
                commands.push({
                    command: 'HIGHLIGHT_NODE',
                    data: {
                        id: toId,
                        color: '#ff9800',
                        style: 'glow'
                    }
                });
            }
        }
        
        this.sendCommand('BATCH', { commands });
    }
    
    /**
     * Fokussiert die Ansicht auf einen bestimmten Knoten.
     * @param {string} stateKey
     * State-Key des zu fokussierenden Knotens.
     */
    focusNode(stateKey) {
        const nodeId = this.nodeMap.get(stateKey);
        if (nodeId !== undefined) {
            this.sendCommand('SET_FOCUS', { id: nodeId });
        }
    }
    
    /**
     * Setzt die Ansicht auf die Standard-Position zurück.
     */
    resetView() {
        this.sendCommand('RESET_VIEW');
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
            duplicatesAllowed: true
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
    module.exports = BFSTreeAdapter;
}
