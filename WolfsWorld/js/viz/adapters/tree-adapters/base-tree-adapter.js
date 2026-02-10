/**
 * @fileoverview Base Tree Adapter - Basisklasse für Tree-Visualisierungs-Adapter
 * 
 * Enthält gemeinsame Infrastruktur für:
 * - IFrame-Kommunikation (postMessage)
 * - State Management (NodeMap, Commands)
 * - Grundlegende Tree-Erstellung (createNode)
 * - Handshake & Reset
 * 
 * @class BaseTreeAdapter
 * @version 1.0
 */
class BaseTreeAdapter {
    /**
     * @param {HTMLIFrameElement} iframeElement 
     */
    constructor(iframeElement) {
        this.iframe = iframeElement;
        this.nodeIdCounter = 0;
        this.nodeMap = new Map();
        this.ready = false;
        this.commands = [];
        
        // State
        this.currentGameState = null;
        this.currentConfig = null;
        this.nodeStates = new Map(); // id -> GameState
        this.treeStructure = new Map(); // id -> { parentId, childrenIds[], status, value, ... }
        this.rootPlayer = null; 

        // Message Listener
        this._messageListener = (event) => {
            if (!event.data) return;
            this.handleMessage(event.data);
        };
        window.addEventListener('message', this._messageListener);

        this.startHandshake();
    }

    destroy() {
        if (this._messageListener) {
            window.removeEventListener('message', this._messageListener);
            this._messageListener = null;
        }
    }

    /**
     * Verarbeitet eingehende Nachrichten vom Visualizer
     * @param {Object} data 
     */
    handleMessage(data) {
        if (data.type === 'TREE_READY') {
            this.onTreeReady();
        }
        else if (data.type === 'NODE_EXPANSION_REQUEST') {
            this.handleExpansionRequest(data.nodeId);
        }
        else if (data.type === 'NODE_CLICKED') {
            this.handleNodeClick(data.nodeId);
        }
    }

    startHandshake() {
        // Simple retry/timeout logic can be added here if needed
        setTimeout(() => { this.ready = true; }, 500);
    }
    
    onTreeReady() {
        this.ready = true;
        // Default impl: do nothing or send config
    }

    sendCommand(command) {
        if (!this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage({ type: 'TREE_COMMAND', command }, '*');
    }

    flushCommands() {
        if (this.commands.length > 0) {
            this.sendCommand({ action: 'BATCH', commands: this.commands });
            this.commands = [];
        }
    }

    getBoardKey(board) {
        return board.getStateKey ? board.getStateKey() : JSON.stringify(board.grid || board);
    }
    
    reset() {
        this.nodeIdCounter = 0;
        this.nodeMap.clear();
        this.treeStructure.clear();
        this.nodeStates.clear();
        this.commands = [];
        this.sendCommand({ action: 'CLEAR' });
        
        // Config senden via Template Method
        const config = this.getInitialConfig();
        if (config) {
            this.sendCommand({ 
                action: 'UPDATE_CONFIG', 
                config: config 
            });
        }
    }

    /**
     * Liefert Initiale Config (überschreibbar)
     */
    getInitialConfig() {
        return {};
    }

    /**
     * Erstellt einen Basis-Knoten und registriert ihn.
     * @param {GameState} state
     * @param {number|null} parentId 
     * @param {Object} metadata 
     * @param {string} status 
     */
    createNode(state, parentId, metadata, status = 'WAIT') {
        const nodeId = this.nodeIdCounter++;
        const stateKey = this.getBoardKey(state);
        this.nodeMap.set(stateKey, nodeId);
        
        const command = {
            action: 'ADD_NODE',
            id: nodeId,
            label: "", 
            boardData: {
                grid: [...(state.grid || state)], 
                currentPlayer: state.currentPlayer,
                size: state.size || 3,
                winner: state.winner
            },
            boardType: 'minimax', // Default
            metadata: { ...metadata },
            status: status
        };
        
        if (parentId !== null) command.parentId = parentId;
        
        this.commands.push(command);
        return nodeId;
    }

    handleExpansionRequest(nodeId) {
        if (this.nodeStates.has(nodeId)) {
             this.expandNodeChildren(nodeId, this.nodeStates.get(nodeId));
        }
        this.flushCommands();
    }

    // Abstract/Empty methods to be implemented by subclasses
    expandNodeChildren(nodeId, state) {}
    handleNodeClick(nodeId) {}
}
