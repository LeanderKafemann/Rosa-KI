/**
 * @fileoverview Minimax Tree Adapter - Visualisierung des Minimax Algorithmus
 * 
 * Extends BaseTreeAdapter mit Minimax-spezifischen Features:
 * - Value-basierte Node-Färbung (Min/Max-Nodes)
 * - Best-Move Tracking und Visualisierung
 * - Performance-Statistiken (visited nodes, iterations)
 * 
 * @class MinimaxTreeAdapter
 * @author Alexander Wolf  
 * @version 2.3
 */
class MinimaxTreeAdapter extends BaseTreeAdapter {
    /**
     * @param {HTMLIFrameElement} iframeElement
     */
    constructor(iframeElement) {
        super(iframeElement);
        this.stats = {
            nodesVisited: 0,
            nodesPruned: 0,
            evaluatedNodes: 0,
        };
        this.constants = this._resolveConstants();
    }

    /**
     * Lädt zentrale Konstanten mit robusten Fallbacks.
     * @returns {Object}
     */
    _resolveConstants() {
        const game = typeof GAME_CONSTANTS !== 'undefined' ? GAME_CONSTANTS : {};
        const viz = typeof MINIMAX_VIZ_CONSTANTS !== 'undefined' ? MINIMAX_VIZ_CONSTANTS : {};
        const flags = viz.FLAGS || {};
        const values = viz.VALUES || {};
        const tree = viz.TREE || {};
        const colors = viz.COLORS || {};

        return {
            winnerNone: game.NONE !== undefined ? game.NONE : 0,
            winnerDraw: game.DRAW !== undefined ? game.DRAW : 3,
            player1: game.PLAYER1 !== undefined ? game.PLAYER1 : 1,
            player2: game.PLAYER2 !== undefined ? game.PLAYER2 : 2,

            valueWin: values.WIN !== undefined ? values.WIN : 1,
            valueLoss: values.LOSS !== undefined ? values.LOSS : -1,
            valueDraw: values.DRAW !== undefined ? values.DRAW : 0,

            rootDepth: tree.ROOT_DEPTH !== undefined ? tree.ROOT_DEPTH : 0,
            edgeWidth: tree.HIGHLIGHT_EDGE_WIDTH !== undefined ? tree.HIGHLIGHT_EDGE_WIDTH : 4,

            enableTreeExpansionMinimax: flags.ENABLE_TREE_EXPANSION_MINIMAX !== false,
            debugMinimaxAdapter: flags.DEBUG_MINIMAX_ADAPTER === true,

            rootPlayer1Color: colors.ROOT_PLAYER_1 || '#3498db',
            rootPlayer2Color: colors.ROOT_PLAYER_2 || '#e74c3c',
            edgePositiveColor: colors.EDGE_POSITIVE || '#2730ae',
            edgeNegativeColor: colors.EDGE_NEGATIVE || '#c0392b',
            edgeNeutralColor: colors.EDGE_NEUTRAL || '#a4ae1c',
            edgePrunedColor: colors.EDGE_PRUNED || '#7f8c8d',
        };
    }

    /**
     * Einheitlicher Debug-Logger.
     * @param {string} message
     * @param {Object} [payload]
     */
    _debugLog(message, payload) {
        const hasDebugConfig = typeof window !== 'undefined' && window.DebugConfig && window.DEBUG_DOMAINS;
        const allowByCentralConfig = hasDebugConfig
            ? window.DebugConfig.shouldLog(window.DEBUG_DOMAINS.MINIMAX, 'debug')
            : false;

        if (!this.constants.debugMinimaxAdapter && !allowByCentralConfig) return;

        const debugApi = typeof window !== 'undefined' ? window.DebugConfig : null;
        if (payload !== undefined) {
            if (debugApi && typeof debugApi.log === 'function' && window.DEBUG_DOMAINS) {
                debugApi.log(window.DEBUG_DOMAINS.MINIMAX, 'debug', `[MinimaxTreeAdapter] ${message}`, payload);
            } else {
                console.log(`[MinimaxTreeAdapter] ${message}`, payload);
            }
            return;
        }
        if (debugApi && typeof debugApi.log === 'function' && window.DEBUG_DOMAINS) {
            debugApi.log(window.DEBUG_DOMAINS.MINIMAX, 'debug', `[MinimaxTreeAdapter] ${message}`);
            return;
        }
        console.log(`[MinimaxTreeAdapter] ${message}`);
    }

    /**
     * Meldet aktuelle Statistik an den UI-Host.
     */
    _notifyStatsChanged() {
        if (typeof this.onStatsChanged !== 'function') return;
        this.onStatsChanged({ ...this.stats });
    }

    /**
     * Prüft, ob ein Zustand terminal ist.
     * @param {GameState} state
     * @returns {boolean}
     */
    _isTerminalState(state) {
        if (!state) return false;
        return state.winner !== this.constants.winnerNone || state.getAllValidMoves().length === 0;
    }

    /**
     * Erzeugt ein Standard-Resultat für die UI.
     * @param {number} rootId
     * @returns {Object}
     */
    _buildResult(rootId) {
        const rootData = this.treeStructure.get(rootId);
        return {
            bestMove: null,
            bestValue: rootData ? rootData.value : null,
            nodesVisited: this.stats.nodesVisited,
            nodesPruned: this.stats.nodesPruned,
            evaluatedNodes: this.stats.evaluatedNodes,
        };
    }

    onTreeReady() {
        super.onTreeReady();
        if (this.checkInterval) clearInterval(this.checkInterval);
        // Enable tree expansion for Minimax
        this.sendCommand({
            action: 'UPDATE_CONFIG',
            config: { enableTreeExpansion: this.constants.enableTreeExpansionMinimax }
        });
    }

    /**
     * Startet die Visualisierung (Aufbauphase).
     */
    async visualizeSearch(gameState, config) {
        this.currentGameState = gameState;
        this.currentConfig = config;
        this.stats.nodesVisited = 0;
        this.stats.nodesPruned = 0;
        this.stats.evaluatedNodes = 0;
        this._notifyStatsChanged();
        
        // Speichere den Root-Spieler für relative Bewertung
        this.rootPlayer = gameState.currentPlayer;
        this._debugLog('visualizeSearch:start', {
            algorithm: config && config.algorithm,
            rootPlayer: this.rootPlayer,
            maxDepth: config && config.maxDepth,
        });
        
        this.reset();
        
        // Root Node erstellen
        const rootId = this.createNode(gameState, null, {
            depth: this.constants.rootDepth,
            isMaximizing: true,
            value: null
        });
        
        this.nodeStates.set(rootId, gameState);
        this.treeStructure.set(rootId, { 
            parentId: null, 
            children: [], 
            status: 'WAIT',
            value: null, 
            depth: this.constants.rootDepth,
            isMaximizing: true 
        });
        
        // Erste Ebene expandieren
        this.expandNodeChildren(rootId, gameState);
        
        // Update Root Status
        this.checkNodeStatus(rootId);
        
        this.flushCommands();
        
        this._debugLog('visualizeSearch:ready', { rootId });
        return this._buildResult(rootId);
    }

    getInitialConfig() {
        const isRootPlayer2 = this.rootPlayer === this.constants.player2;
        return { 
            showLevelIndicators: true,
            levelIndicatorType: 'minimax',
            rootPlayerColor: isRootPlayer2 ? this.constants.rootPlayer2Color : this.constants.rootPlayer1Color,
            opponentColor: isRootPlayer2 ? this.constants.rootPlayer1Color : this.constants.rootPlayer2Color,
            enableTreeExpansion: this.constants.enableTreeExpansionMinimax
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
            moveOrder: currentData.children.length,
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
            isTerminal: this._isTerminalState(childState),
            moveOrder: currentData.children.length
        };
    }

    /**
     * Optionales Move-Ordering für Visualisierung.
     * Kann in Subklassen überschrieben werden (z. B. Alpha-Beta).
     * @param {Array} validMoves
     * @param {GameState} state
     * @param {Object} currentData
     * @returns {Array}
     */
    _orderMoves(validMoves, state, currentData) {
        return validMoves;
    }

    expandNodeChildren(nodeId, state) {
        const currentData = this.treeStructure.get(nodeId);
        if (!currentData) return;

        if (currentData.status === 'EVALUATED') {
            this._debugLog('expandNodeChildren:skip-non-expandable', {
                nodeId,
                status: currentData.status,
            });
            return;
        }

        if (this._isTerminalState(state)) return;
        
        const validMoves = state.getAllValidMoves();
        const orderedMoves = this._orderMoves(validMoves, state, currentData);
        this._debugLog('expandNodeChildren', { nodeId, validMovesCount: validMoves.length });
        
        for (const move of orderedMoves) {
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

    /**
     * Prüft und aktualisiert den Status eines Knotens.
     */
    checkNodeStatus(nodeId) {
        const data = this.treeStructure.get(nodeId);
        if (!data) return;
        
        if (data.status === 'EVALUATED' || data.status === 'PRUNED') return;
        
        let newStatus = 'WAIT';
        const state = this.nodeStates.get(nodeId);
        const isTerminal = this._isTerminalState(state);
        
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
            if (typeof this.onActiveNodeChanged === 'function') {
                this.onActiveNodeChanged(nodeId, data);
            }
            this.commands = []; // Reset commands
            NodeStatusManager.setNodeStatus(nodeId, 'ACTIVE', [], this.treeStructure, this.commands);
            this.flushCommands();
            this.evaluateNode(nodeId);
        }
    }

    /**
     * Bewertet einen terminalen Knoten relativ zum Root-Spieler.
     * @param {GameState} state
     * @returns {{value:number,labelText:string,statusesToAdd:string[]}}
     */
    _evaluateTerminalState(state) {
        const statusesToAdd = ['EVALUATED'];
        const opponent = this.rootPlayer === this.constants.player1 ? this.constants.player2 : this.constants.player1;

        if (state.winner === this.rootPlayer) {
            statusesToAdd.push(this.rootPlayer === this.constants.player1 ? 'WIN_BLUE' : 'WIN_RED');
            return {
                value: this.constants.valueWin,
                labelText: `Win = +${this.constants.valueWin}`,
                statusesToAdd,
            };
        }

        if (state.winner === opponent) {
            statusesToAdd.push(opponent === this.constants.player1 ? 'WIN_BLUE' : 'WIN_RED');
            return {
                value: this.constants.valueLoss,
                labelText: `Loss = ${this.constants.valueLoss}`,
                statusesToAdd,
            };
        }

        statusesToAdd.push('DRAW');
        return {
            value: this.constants.valueDraw,
            labelText: `Draw = ${this.constants.valueDraw}`,
            statusesToAdd,
        };
    }

    /**
     * Liefert zusätzliche Visualisierungs-Status anhand des Werts.
     * @param {number} value
     * @returns {string[]}
     */
    _getValueStatuses(value) {
        if (value === this.constants.valueWin) {
            return [this.rootPlayer === this.constants.player1 ? 'WIN_BLUE' : 'WIN_RED'];
        }
        if (value === this.constants.valueLoss) {
            return [this.rootPlayer === this.constants.player1 ? 'WIN_RED' : 'WIN_BLUE'];
        }
        return ['DRAW'];
    }

    /**
     * Liefert Kantenfarbe entsprechend Gewinnerfarbe (statt Vorzeichenfarbe).
     * @param {number} value
     * @returns {string}
     */
    _getEdgeColorForValue(value) {
        if (value === this.constants.valueWin) {
            return this.rootPlayer === this.constants.player1
                ? this.constants.rootPlayer1Color
                : this.constants.rootPlayer2Color;
        }

        if (value === this.constants.valueLoss) {
            return this.rootPlayer === this.constants.player1
                ? this.constants.rootPlayer2Color
                : this.constants.rootPlayer1Color;
        }

        return this.constants.edgeNeutralColor;
    }

    /**
     * Markiert Best-Edges eines Inner-Nodes.
     * @param {number} nodeId
     * @param {number} bestValue
     */
    _highlightBestEdges(nodeId, bestValue) {
        const data = this.treeStructure.get(nodeId);
        if (!data) return;

        data.children.forEach((childId) => {
            const childData = this.treeStructure.get(childId);
            if (!childData || childData.value !== bestValue) return;

            const edgeColor = this._getEdgeColorForValue(bestValue);

            this.commands.push({
                action: 'HIGHLIGHT_EDGE',
                from: nodeId,
                to: childId,
                color: edgeColor,
                width: this.constants.edgeWidth,
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
            this._debugLog('evaluateNode:missing-data', { nodeId });
            return;
        }
        
        this.commands = [];
        this.stats.nodesVisited += 1;
        this.stats.evaluatedNodes += 1;
        this._notifyStatsChanged();
        
        let value = 0;
        let labelText = "";
        let statusesToAdd = ['EVALUATED'];
        
        // Evaluate node and propagate values upward
        
        // CASE 1: Leaf Node (Terminal)
        if (data.children.length === 0) {
            const leafResult = this._evaluateTerminalState(state);
            value = leafResult.value;
            labelText = leafResult.labelText;
            statusesToAdd = leafResult.statusesToAdd;
        } 
        // CASE 2: Inner Node
        else {
            const childValues = data.children.map(cid => {
                const child = this.treeStructure.get(cid);
                return child && child.value !== undefined && child.value !== null
                    ? child.value
                    : this.constants.valueDraw;
            });
            
            if (data.isMaximizing) {
                value = Math.max(...childValues);
                const sign = value > 0 ? '+' : value < 0 ? '' : '';
                labelText = `Max = ${sign}${value}`;
            } else {
                value = Math.min(...childValues);
                const sign = value > 0 ? '+' : value < 0 ? '' : '';
                labelText = `Min = ${sign}${value}`;
            }
            
            this._highlightBestEdges(nodeId, value);
            statusesToAdd = ['EVALUATED', ...this._getValueStatuses(value)];
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
                metadata: {
                    depth: data.depth,
                    isMaximizing: data.isMaximizing,
                    moveOrder: data.moveOrder,
                    value: value,
                }
            }
        });
        
        // "Wenn ein neuer Knoten bewertet wurde, prüfe den Status des Elternknotens"
        if (data.parentId !== null) {
            this.checkNodeStatus(data.parentId);
        }

        this._debugLog('evaluateNode:done', {
            nodeId,
            value,
            status: data.status,
            parentId: data.parentId,
        });

        if (typeof this.onActiveNodeChanged === 'function') {
            this.onActiveNodeChanged(nodeId, data);
        }

        this._notifyStatsChanged();
        
        this.flushCommands();
    }
}