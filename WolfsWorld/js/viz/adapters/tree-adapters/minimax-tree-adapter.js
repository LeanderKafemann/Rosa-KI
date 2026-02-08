/**
 * @fileoverview Minimax Tree Adapter - Visualisierung des Minimax Algorithmus
 * 
 * Konvertiert Minimax-Suchbaum in TreeVizEngine-Kommandos.
 * Unterstützt verschiedene Algorithmus-Varianten:
 * - Standard Minimax (vollständige Exploration)
 * - Alpha-Beta Pruning (mit Pruning-Markierungen)
 * - Tiefenbegrenzung (mit Heuristik-Bewertung)
 * - Interactive Evaluation Mode: Manuelles Bewerten durch Klicken
 * 
 * Status-Management: Nutzt zentrale NodeStatusManager Klasse
 * (siehe: /viz/tree-viz/utils/node-status-manager.js)
 * 
 * @class MinimaxTreeAdapter
 * @author Alexander Wolf
 * @version 2.0
 */
class MinimaxTreeAdapter {
    /**
     * Erstellt einen neuen Minimax Tree Adapter.
     * @param {HTMLIFrameElement} iframeElement - Das iframe-Element mit der TreeVizEngine.
     */
    constructor(iframeElement) {
        this.iframe = iframeElement;
        this.nodeIdCounter = 0;
        this.nodeMap = new Map();
        this.ready = false;
        this.commands = [];
        this.stats = { nodesVisited: 0, nodesPruned: 0 }; // Removed maxDepth stat
        
        // State management
        this.currentGameState = null;
        this.currentConfig = null;
        this.nodeStates = new Map(); // id -> GameState
        this.rootPlayer = null; // Speichert welcher Spieler am Root startet (für relative Bewertung)
        
        // Structure for Interactive Mode
        this.treeStructure = new Map(); // id -> { parentId, childrenIds[], status, value }
        
        // Listen for messages
        window.addEventListener('message', (event) => {
            if (!event.data) return;
            
            if (event.data.type === 'TREE_READY') {
                this.ready = true;
                if (this.checkInterval) clearInterval(this.checkInterval);
                // Enable tree expansion for Minimax (important for exploring large search trees)
                this.sendCommand({
                    action: 'UPDATE_CONFIG',
                    config: { enableTreeExpansion: true }
                });
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
        if (this.checkInterval) clearInterval(this.checkInterval);
        setTimeout(() => { this.ready = true; }, 500);
    }
    
    sendCommand(command) {
        if (!this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage({ type: 'TREE_COMMAND', command }, '*');
    }

    getBoardKey(board) {
        return board.getStateKey ? board.getStateKey() : JSON.stringify(board.grid || board);
    }

    /**
     * Startet die Visualisierung (Aufbauphase).
     */
    async visualizeSearch(gameState, config) {
        this.currentGameState = gameState;
        this.currentConfig = config;
        
        // Speichere den Root-Spieler für relative Bewertung
        // currentPlayer kann 1 (Blue) oder 2 (Red) sein
        this.rootPlayer = gameState.currentPlayer;
        
        this.reset();
        
        // Initialsierung
        this.commands = [];
        
        // Root Node erstellen
        const rootId = this.createNode(gameState, null, {
            depth: 0,
            isMaximizing: true,
            value: null
        });
        
        this.nodeStates.set(rootId, gameState);
        this.treeStructure.set(rootId, { 
            parentId: null, 
            children: [], 
            status: 'WAIT',
            value: null, 
            depth: 0,
            isMaximizing: true 
        });
        
        // Erste Ebene expandieren
        this.expandNodeChildren(rootId, gameState);
        
        // Update Root Status
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



    /**
     * Erstellt und registriert einen Knoten.
     */
    createNode(board, parentId, metadata) {
        const nodeId = this.nodeIdCounter++;
        const stateKey = this.getBoardKey(board);
        this.nodeMap.set(stateKey, nodeId);
        
        // SIMPLIFIED: Keine Beschriftung bei creation ("f = ???" weg)
        let label = "";
        
        // SIMPLIFIED: Initial immer WAIT
        const status = 'WAIT';
        
        const command = {
            action: 'ADD_NODE',
            id: nodeId,
            label: label,
            boardData: {
                grid: [...board.grid], // Copy grid
                currentPlayer: board.currentPlayer,
                size: board.size || 3,
                winner: board.winner
            },
            boardType: 'minimax',
            metadata: { ...metadata },
            status: status
        };
        
        if (parentId !== null) command.parentId = parentId;
        
        this.commands.push(command);
        return nodeId;
    }

    /**
     * Expandiert Kinder eines Knotens.
     * SIMPLIFIED: Removes maxDepth logic entirely.
     */
    expandNodeChildren(nodeId, state) {
        if (state.winner !== 0) return; // Terminal
        
        const validMoves = state.getAllValidMoves();
        const currentData = this.treeStructure.get(nodeId);
        const currentDepth = currentData ? currentData.depth : 0;
        
        const isMaximizing = (currentDepth % 2 === 0); // Root (0) is MAX
        const childIsMax = !isMaximizing;
        
        for (const move of validMoves) {
            const childState = state.clone();
            childState.makeMove(move);
            
            const childId = this.createNode(childState, nodeId, {
                depth: currentDepth + 1,
                isMaximizing: childIsMax,
                move: move,
                value: null
            });
            
            this.nodeStates.set(childId, childState);
            
            // Update Structure
            const childStruct = {
                parentId: nodeId,
                children: [],
                status: 'WAIT',
                value: null,
                depth: currentDepth + 1,
                isMaximizing: childIsMax,
                isTerminal: (childState.winner !== 0 || childState.getAllValidMoves().length === 0)
            };
            this.treeStructure.set(childId, childStruct);
            
            // Add to parent
            if (currentData) currentData.children.push(childId);
            
            // Mark expandable if not terminal
            if (!childStruct.isTerminal) {
                this.commands.push({ action: 'MARK_EXPANDABLE', id: childId });
            }
            
            // Check status immediately
            this.checkNodeStatus(childId);
        }
        
        // Re-check parent status now that it has children
        this.checkNodeStatus(nodeId);
    }

    /**
     * Prüft und aktualisiert den Status eines Knotens.
     */
    checkNodeStatus(nodeId) {
        const data = this.treeStructure.get(nodeId);
        if (!data) return;
        
        if (data.status === 'EVALUATED') return;
        
        let newStatus = 'WAIT';
        const state = this.nodeStates.get(nodeId);
        const isTerminal = state && (state.winner !== 0 || state.getAllValidMoves().length === 0);
        
        // 1. Leaf Node (no children expanded or terminal)
        if (data.children.length === 0) {
            // "Prüfe ob Blattknoten... zurückbekommst, ob Spiel beendet ist"
            if (isTerminal) {
                newStatus = 'READY';
                // Node is terminal - ready for evaluation
                // Note: The visual border color (Blue/Red/Yellow) is applied when status becomes EVALUATED
                // after clicking, OR we can apply it here status-based if config supports it.
                // Standard: READY is orange. Click -> WIN_BLUE/WIN_RED.
            } else {
                newStatus = 'WAIT';
                // Non-terminal node - waiting for expansion
            }
        } 
        // 2. Inner Node
        else {
            // "Wenn alle Kindknoten bewertet sind -> Status Ready"
            const allChildrenEvaluated = data.children.every(childId => {
                const child = this.treeStructure.get(childId);
                return child && child.status === 'EVALUATED';
            });
            
            if (allChildrenEvaluated) {
                newStatus = 'READY';
                // All children evaluated - ready for backpropagation
            } else {
                newStatus = 'WAIT';
                // Still waiting for children to be evaluated
            }
        }
        
        if (newStatus !== data.status) {
            NodeStatusManager.setNodeStatus(nodeId, newStatus, [], this.treeStructure, this.commands);
        }
    }

    handleNodeClick(nodeId) {
        const data = this.treeStructure.get(nodeId);
        if (!data) return;
        
        // Node clicked in interactive mode
        
        // "Wenn ein Knoten mit Status Ready angeklickt wird: bewerte ihn"
        if (data.status === 'READY') {
            this.commands = []; // Reset commands
            NodeStatusManager.setNodeStatus(nodeId, 'ACTIVE', [], this.treeStructure, this.commands);
            this.flushCommands();
            this.evaluateNode(nodeId);
        }
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
        
        // Evaluate node and propagate values upward
        
        // CASE 1: Leaf Node (Terminal)
        if (data.children.length === 0) {
            // Bewertung RELATIV zum Root-Spieler, nicht absolut zu Blau/Rot
            if (state.winner === this.rootPlayer) {
                // Root-Spieler gewinnt → +1
                value = 1;
                const playerName = this.rootPlayer === 1 ? 'Blue' : 'Red';
                labelText = `${playerName} Win = +1`;
                // Visuelle Status hängt davon ab, welche Farbe Root-Spieler ist
                if (this.rootPlayer === 1) {
                    statusesToAdd.push('WIN_BLUE');
                } else {
                    statusesToAdd.push('WIN_RED');
                }
            } else if (state.winner !== 3 && state.winner !== null && state.winner !== undefined) {
                // Gegner gewinnt → -1
                value = -1;
                const playerName = this.rootPlayer === 1 ? 'Red' : 'Blue';
                labelText = `${playerName} Wins = -1`;
                // Visuelle Status für Gegner
                if (this.rootPlayer === 1) {
                    statusesToAdd.push('WIN_RED');
                } else {
                    statusesToAdd.push('WIN_BLUE');
                }
            } else if (state.winner === 3) {
                // Draw
                value = 0;
                labelText = "Remis = 0";
                statusesToAdd.push('DRAW');
            } else {
                // Technically shouldn't happen for READY leaves in this logic unless logic gap
                value = 0;
                labelText = "Val = 0";
            }
        } 
        // CASE 2: Inner Node
        else {
            const childValues = data.children.map(cid => {
                const child = this.treeStructure.get(cid);
                return child.value !== undefined && child.value !== null ? child.value : 0;
            });
            
            if (data.isMaximizing) {
                value = Math.max(...childValues);
                const sign = value > 0 ? '+' : value < 0 ? '-' : '';
                labelText = `Max = ${sign}${value}`;
            } else {
                value = Math.min(...childValues);
                const sign = value > 0 ? '+' : value < 0 ? '-' : '';
                labelText = `Min = ${sign}${value}`;
            }
            
            // Visualisierung des besten Pfades
            data.children.forEach(childId => {
                const childData = this.treeStructure.get(childId);
                if (childData && childData.value === value) {
                    let edgeColor = value > 0 ? '#2730ae' : value < 0 ? '#c0392b' : '#a4ae1c';
                    this.commands.push({
                        action: 'HIGHLIGHT_EDGE',
                        from: nodeId,
                        to: childId,
                        color: edgeColor,
                        width: 4
                    });
                }
            });

             // Apply board color for winning positions (propagation) - RELATIV zu Root-Spieler
            if (value === 1) {
                // Guter Wert für Root-Spieler (Maximierer)
                if (this.rootPlayer === 1) {
                    statusesToAdd.push('WIN_BLUE');
                } else {
                    statusesToAdd.push('WIN_RED');
                }
            } else if (value === -1) {
                // Schlechter Wert für Root-Spieler (Gegner gewinnt)
                if (this.rootPlayer === 1) {
                    statusesToAdd.push('WIN_RED');
                } else {
                    statusesToAdd.push('WIN_BLUE');
                }
            } else {
                statusesToAdd.push('DRAW');
            }
        }
        
        // Save value
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
        
        // "Wenn ein neuer Knoten bewertet wurde, prüfe den Status des Elternknotens"
        if (data.parentId !== null) {
            this.checkNodeStatus(data.parentId);
        }
        
        this.flushCommands();
    }

    handleExpansionRequest(nodeId) {
        // Handle node expansion request from visualization
        this.commands = [];
        const data = this.treeStructure.get(nodeId);
        
        // Only expand if we have state
        if (this.nodeStates.has(nodeId)) {
            // Force expansion completely ignored, simpler logic
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
        
        // Config wieder senden
        this.sendCommand({ 
            action: 'UPDATE_CONFIG', 
            config: { 
                showLevelIndicators: true,
                levelIndicatorType: 'minimax',
                rootPlayerColor: '#e74c3c',    
                opponentColor: '#3498db'       
            } 
        });
    }
}