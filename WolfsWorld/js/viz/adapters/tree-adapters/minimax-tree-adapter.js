/**
 * @fileoverview Minimax Tree Adapter - Visualisierung des Minimax Algorithmus
 * ...
 */
class MinimaxTreeAdapter extends BaseTreeAdapter {
    constructor(iframeElement) {
        super(iframeElement);
        this.stats = { nodesVisited: 0, nodesPruned: 0 };
    }

    onTreeReady() {
        super.onTreeReady();
        if (this.checkInterval) clearInterval(this.checkInterval);
        // Enable tree expansion for Minimax
        this.sendCommand({
            action: 'UPDATE_CONFIG',
            config: { enableTreeExpansion: true }
        });
    }

    /**
     * Startet die Visualisierung (Aufbauphase).
     */
    async visualizeSearch(gameState, config) {
        this.currentGameState = gameState;
        this.currentConfig = config;
        
        // Speichere den Root-Spieler für relative Bewertung
        this.rootPlayer = gameState.currentPlayer;
        
        this.reset();
        
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

    getInitialConfig() {
        const isRootPlayerRed = this.rootPlayer === 2;
        return { 
            showLevelIndicators: true,
            levelIndicatorType: 'minimax',
            rootPlayerColor: isRootPlayerRed ? '#e74c3c' : '#3498db',    // Red or Blue
            opponentColor: isRootPlayerRed ? '#3498db' : '#e74c3c',       // Blue or Red
            enableTreeExpansion: true 
        };
    }

    /**
     * Helper to create child metadata. Can be overridden.
     */
    _createChildMetadata(nodeId, childState, move, currentData) {
        return {
            depth: currentData.depth + 1,
            isMaximizing: !currentData.isMaximizing,
            move: move,
            value: null
        };
    }
    
    /**
     * Helper to create additional tree structure data. Can be overridden.
     */
    _createChildStructure(childId, nodeId, childState, currentData) {
        return {
            parentId: nodeId,
            children: [],
            status: 'WAIT',
            value: null,
            depth: currentData.depth + 1,
            isMaximizing: !currentData.isMaximizing,
            isTerminal: (childState.winner !== 0 || childState.getAllValidMoves().length === 0)
        };
    }

    expandNodeChildren(nodeId, state) {
        if (state.winner !== 0) return; // Terminal
        
        const validMoves = state.getAllValidMoves();
        const currentData = this.treeStructure.get(nodeId);
        
        for (const move of validMoves) {
            const childState = state.clone();
            childState.makeMove(move);
            
            const metadata = this._createChildMetadata(nodeId, childState, move, currentData);
            const childId = this.createNode(childState, nodeId, metadata);
            
            this.nodeStates.set(childId, childState);
            
            // Update Structure
            const childStruct = this._createChildStructure(childId, nodeId, childState, currentData);
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
        
        this.checkNodeStatus(nodeId);
    }

    // checkNodeStatus, handleNodeClick, evaluateNode remain mostly the same 
    // but I need to make sure I don't delete them if they are not in the newString.
    // I will use replace_string_in_file for parts, but since I am changing the class heritage and 
    // removing methods, a full overwrite or large chunk replace is better.
    // However, createNode is now in Base, but Minimax had `status='WAIT'` and `label=""`. Base has those defaults too.
    
    // I will replace from "class MinimaxTreeAdapter" down to "expandNodeChildren" end.

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
                // Allow EVALUATED or PRUNED (needed for Alpha-Beta inheritance)
                return child && (child.status === 'EVALUATED' || child.status === 'PRUNED');
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
}