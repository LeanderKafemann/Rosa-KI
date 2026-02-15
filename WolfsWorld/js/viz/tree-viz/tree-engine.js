/**
 * @fileoverview TreeVizEngine v3.0 - Generisches Suchbaum-Visualisierungs-System mit modularer Architektur
 * 
 * Orchestriert mehrere spezialisierte Module für Baum-Visualisierung:
 * - TreeRenderer: Canvas-Rendering (Kanten, Knoten, Labels)
 * - TreeLayoutEngine: Knoten-Positionierung und Auto-Layout
 * - TreeInteractionEngine: Zoom, Pan, Click-Detection
 * - TreeFeaturesEngine: Dead-End Detection, Active Node Tracking, Status Management
 * 
 * Status-Konfiguration wird zentral in status-config.js definiert.
 * Diese Datei nutzt StatusConfig.getStatusTypes() zur Runtime.
 * 
 * @author Alexander Wolf
 * @version 3.0
 */

class TreeVizEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Data Structures
        this.nodes = new Map();
        this.edges = [];
        this.highlights = new Map();

        // Status Definition - Loaded from centralized StatusConfig
        // IMPORTANT: status-config.js MUST be loaded before tree-engine.js
        // Applications can override defaults via StatusConfig.setStatusDefaults()
        // or StatusConfig.setStyleDefaults()
        this.STATUS_TYPES = StatusConfig.getStatusTypes();

        // Configuration
        this.config = {
            nodeRadius: options.nodeRadius || 40,
            levelHeight: options.levelHeight || 120,
            horizontalSpacing: options.horizontalSpacing || 100,
            fontSize: options.fontSize || 12,
            fontFamily: options.fontFamily || 'Arial, sans-serif',
            autoFitZoom: options.autoFitZoom || false,
            showOverlay: options.showOverlay !== undefined ? options.showOverlay : true,
            enableActiveNodeTracking: options.enableActiveNodeTracking !== undefined ? options.enableActiveNodeTracking : true,
            activeNodeTargetX: options.activeNodeTargetX !== undefined ? options.activeNodeTargetX : 0.5,
            activeNodeTargetY: options.activeNodeTargetY !== undefined ? options.activeNodeTargetY : 0.5,
            activeNodeTrackingSmooth: options.activeNodeTrackingSmooth !== undefined ? options.activeNodeTrackingSmooth : true,
            activeNodeTrackingDuration: options.activeNodeTrackingDuration || 300,
            enableTreeExpansion: options.enableTreeExpansion !== undefined ? options.enableTreeExpansion : false,
            ...options
        };

        // Viewport viewport and zoom/pan transformation
        this.viewport = {
            scale: 1.0,
            offsetX: 0,
            offsetY: 50,
            minScale: 0.1,
            maxScale: 3.0
        };

        // Active Node Tracking
        this.activeNodeTracking = {
            nodeId: null,
            animating: false,
            animationStart: null,
            animationDuration: this.config.activeNodeTrackingDuration,
            lastOffsetX: 0,
            lastOffsetY: 50,
            paused: false  // Pause during pan/zoom interactions
        };

        this.init();
    }

    /**
     * Initialisiert Engine, Canvas, PostMessage, Interaction
     */
    init() {
        this.setupCanvas();
        this.setupPostMessage();
        this.setupInteraction();
        this.startRenderLoop();
        this.render();
    }

    /**
     * Setup Canvas und Resize-Handler
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            if (this.nodes.size > 0) {
                this.render();
            }
        });
    }

    /**
     * Setup postMessage Listener für externe Commands
     */
    setupPostMessage() {
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TREE_COMMAND') {
                this.executeCommand(event.data.command);
            }
        });

        // Signal readiness
        window.parent.postMessage({ type: 'TREE_READY' }, '*');
    }

    /**
     * Setup Interaction (delegiert an TreeInteractionEngine)
     */
    setupInteraction() {
        // Wheel Zoom (with active node tracking pause)
        TreeInteractionEngine.setupWheelZoom(
            this.canvas,
            this.viewport,
            this.activeNodeTracking,
            () => this.render()
        );

        // Mouse Drag Pan (with active node tracking pause)
        TreeInteractionEngine.setupMouseDrag(
            this.canvas,
            this.viewport,
            this.activeNodeTracking,
            () => this.render()
        );

        // Node Click Detection
        TreeInteractionEngine.setupNodeClick(
            this.canvas,
            (canvasX, canvasY) => TreeInteractionEngine.getNodeAtCanvasPoint(canvasX, canvasY, this.nodes, this.viewport, this.config),
            (node) => this.handleNodeClick(node)
        );

        // Touch Gestures (with active node tracking pause)
        TreeInteractionEngine.setupTouchGestures(
            this.canvas,
            this.viewport,
            this.activeNodeTracking,
            () => this.render()
        );
    }

    /**
     * Render Loop für Animationen
     */
    startRenderLoop() {
        const loop = () => {
            if (this.activeNodeTracking.animating) {
                this.render();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /**
     * Handle Node Click - emit postMessage or expand/fold node
     */
    handleNodeClick(node) {
        // Check for expansion indicator click (disabled only if enableTreeExpansion === false)
        if (this.config.enableTreeExpansion !== false) {
            const isExpandable = NodeExpansionEngine && NodeExpansionEngine.isExpandable(node);
            const isCollapsed = NodeExpansionEngine && NodeExpansionEngine.isCollapsed(node);
            const hitExpansion = node._hitExpansionIndicator;
            
            // Wenn auf Expansion-Symbol geklickt
            if (isExpandable && hitExpansion) {
                window.parent.postMessage({
                    type: 'NODE_FOCUSED',
                    nodeId: node.id,
                    boardData: node.boardData
                }, '*');

                if (this.config.enableActiveNodeTracking) {
                    TreeFeaturesEngine.setActiveNode(node.id, this.nodes, this.activeNodeTracking);
                }

                if (isCollapsed) {
                    // Expand
                    this.expandNode({ nodeId: node.id });
                    return;
                } else {
                    // Fold
                    this.foldNode({ nodeId: node.id });
                    return;
                }
            }
        }
        
        window.parent.postMessage({
            type: 'NODE_CLICKED',
            nodeId: node.id,
            boardData: node.boardData
        }, '*');

        // Set as active
        if (this.config.enableActiveNodeTracking) {
            TreeFeaturesEngine.setActiveNode(node.id, this.nodes, this.activeNodeTracking);
            this.render();
        }
    }

    // ========================================
    // COMMAND EXECUTION
    // ========================================

    executeCommand(commandObj) {
        const { action } = commandObj;

        switch (action) {
            case 'ADD_NODE':
                this.addNode(commandObj);
                this.layoutTree();
                break;
            case 'DELETE_NODE':
                this.deleteNode(commandObj.id);
                this.layoutTree();
                break;
            case 'ANIMATE_SORT':
                this.animateSort(commandObj.nodeIds, commandObj.duration || 800);
                break;
            case 'UPDATE_NODE':
                this.updateNode(commandObj);
                break;
            case 'SET_STATUS':
                this.setStatus(commandObj);
                break;
            case 'HIGHLIGHT_EDGE':
                this.highlightEdge(commandObj);
                break;
            case 'CLEAR':
                this.clear();
                break;
            case 'SET_FOCUS':
                this.setFocus(commandObj);
                break;
            case 'BATCH':
                this.executeBatch(commandObj.commands);
                return;
            case 'UPDATE_CONFIG':
                // Update engine configuration
                if (commandObj.config) {
                    Object.assign(this.config, commandObj.config);
                }
                break;
            case 'RESET_VIEW':
                this.resetView();
                break;
            case 'CHECK_READY':
                window.parent.postMessage({ type: 'TREE_READY' }, '*');
                break;
            case 'CHECK_AND_MARK_DEAD_END':
                TreeFeaturesEngine.checkAndMarkDeadEnd(commandObj.id, this.nodes);
                break;
            case 'MARK_EXPANDABLE':
                this.markExpandable(commandObj);
                break;
            case 'EXPAND_NODE':
                this.expandNode(commandObj);
                return; // Don't render yet, wait for parent to add children
            case 'FOLD_NODE':
                this.foldNode(commandObj);
                return;
            default:
                // Unknown command
        }
        this.render();
    }

    /**
     * Fügt einen neuen Knoten hinzu
     */
    addNode(cmd) {
        const { id, parentId, label, edgeLabel, color, value, position, boardData, boardType, status, metadata, labelColor } = cmd;

        const node = {
            id,
            parentId: parentId !== undefined ? parentId : null,
            label: label || '',
            labelColor: labelColor || '#000',
            color: color || '#4a90e2',
            value: value !== undefined ? value : null,
            boardData: boardData || null,
            boardType: boardType || null,
            metadata: metadata || null,
            status: new Set(),
            x: 0,
            y: 0,
            radius: this.config.nodeRadius,
            children: [],
            collapsed: false,
            hasUnexploredChildren: false
        };

        if (status) {
            if (Array.isArray(status)) {
                status.forEach(s => node.status.add(s));
            } else {
                node.status.add(status);
            }
        }

        this.nodes.set(id, node);

        if (parentId !== null && parentId !== undefined) {
            const parent = this.nodes.get(parentId);
            if (parent) {
                parent.children.push(id);
                this.edges.push({
                    from: parentId,
                    to: id,
                    label: edgeLabel || '',
                    color: '#95a5a6',
                    width: 2,
                    highlighted: false
                });
            }
        }
    }

    /**
     * Updates an existing node with new command data and refreshes its state.
     * @param {Object} cmd - Command object containing node update information
     */
    updateNode(cmd) {
        const node = this.nodes.get(cmd.id);
        if (!node) return;

        const props = cmd.data || cmd;

        if (props.label !== undefined) node.label = props.label;
        if (props.labelColor !== undefined) node.labelColor = props.labelColor;
        if (props.color !== undefined) node.color = props.color;
        if (props.value !== undefined) node.value = props.value;
        if (props.metadata !== undefined) node.metadata = props.metadata;
        if (props.boardData !== undefined) node.boardData = props.boardData;

        if (props.position) {
            node.x = props.position.x;
            node.y = props.position.y;
        }

        if (!node.status) node.status = new Set();

        if (props.status) {
            node.status = new Set(Array.isArray(props.status) ? props.status : [props.status]);
        }

        if (props.addStatus) {
            const addList = Array.isArray(props.addStatus) ? props.addStatus : [props.addStatus];
            addList.forEach(s => {
                if (s === 'ACTIVE') {
                    TreeFeaturesEngine.setActiveNode(node.id, this.nodes, this.activeNodeTracking);
                } else {
                    node.status.add(s);
                }
            });
        }

        if (props.removeStatus) {
            const remList = Array.isArray(props.removeStatus) ? props.removeStatus : [props.removeStatus];
            remList.forEach(s => node.status.delete(s));
        }

        // Update Active Node Tracking
        if (this.config.enableActiveNodeTracking && node.status.has('ACTIVE')) {
            this.activeNodeTracking.nodeId = node.id;
        }
    }

    /**
     * Removes a node from the tree and cleans up all related references.
     * @param {string} nodeId - The ID of the node to delete
     */
    deleteNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        // Rekursiv alle Kinder löschen
        if (node.children && node.children.length > 0) {
            const childrenCopy = [...node.children];
            childrenCopy.forEach(childId => this.deleteNode(childId));
        }

        // Edges entfernen (zu diesem Knoten oder von diesem Knoten)
        this.edges = this.edges.filter(e => e.from !== nodeId && e.to !== nodeId);

        // Knoten aus Parent-Kinder-List entfernen
        if (node.parentId !== null) {
            const parent = this.nodes.get(node.parentId);
            if (parent && parent.children) {
                parent.children = parent.children.filter(id => id !== nodeId);
            }
        }

        // Knoten löschen
        this.nodes.delete(nodeId);
    }

    /**
     * Animates the reordering of nodes over a specified duration.
     * @param {string[]} nodeIds - Array of node IDs in their new order
     * @param {number} [duration=800] - Animation duration in milliseconds
     */
    animateSort(nodeIds, duration = 800) {
        if (!nodeIds || nodeIds.length === 0) return;

        const startTime = performance.now();
        const startPositions = new Map();
        
        // Speichere Startpositionen
        nodeIds.forEach(nodeId => {
            const node = this.nodes.get(nodeId);
            if (node) {
                startPositions.set(nodeId, { x: node.x, y: node.y });
            }
        });

        // Berechne neue Positionen (re-layout)
        this.layoutTree();

        // Animiere die Bewegung
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-in-out)
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : -1 + (4 - 2 * progress) * progress;

            nodeIds.forEach(nodeId => {
                const node = this.nodes.get(nodeId);
                if (!node) return;

                const startPos = startPositions.get(nodeId);
                if (!startPos) return;

                // Interpoliere Position
                node.x = startPos.x + (node.x - startPos.x) * easeProgress;
                node.y = startPos.y + (node.y - startPos.y) * easeProgress;
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation fertig
                this.render();
            }
            
            this.render();
        };

        requestAnimationFrame(animate);
    }

    /**
     * Setzt Node Status
     */
    setStatus(cmd) {
        const node = this.nodes.get(cmd.id);
        if (!node) return;

        if (!node.status) node.status = new Set();

        const isActive = cmd.active !== false;
        if (isActive) {
            node.status.add(cmd.status);
        } else {
            node.status.delete(cmd.status);
        }
    }

    /**
     * Hebt eine Kante hervor
     */
    highlightEdge(data) {
        const edge = this.edges.find(e => e.from === data.from && e.to === data.to);
        if (edge) {
            edge.highlighted = true;
            edge.color = data.color || '#ff9800';
            edge.width = data.width || 4;
        }
    }

    /**
     * Löscht alles
     */
    clear() {
        this.nodes.clear();
        this.edges = [];
        this.highlights.clear();
    }

    /**
     * Fokussiert einen Knoten
     */
    setFocus(data) {
        const node = this.nodes.get(data.id);
        if (!node) return;

        this.viewport.offsetX = this.canvas.width / 2 - node.x * this.viewport.scale;
        this.viewport.offsetY = this.canvas.height / 2 - node.y * this.viewport.scale;
    }

    /**
     * Markiert einen Knoten als expandierbar (hat unentdeckte Kinder).
     * @param {Object} data - {id: nodeId}
     */
    markExpandable(data) {
        const node = this.nodes.get(data.id);
        if (!node) return;
        
        NodeExpansionEngine.markAsExpandable(node);
    }

    /**
     * Expandiert einen Knoten und sendet Request an Parent für Kinder-Generierung.
     * @param {Object} data - {nodeId: nodeId}
     */
    expandNode(data) {
        if (this.config.enableTreeExpansion === false) return;
        
        const node = this.nodes.get(data.nodeId);
        if (!node) return;
        
        if (!NodeExpansionEngine.isExpandable(node)) return;
        
        // Store current viewport state AND disable autoFitZoom
        this._expansionViewportState = {
            scale: this.viewport.scale,
            offsetX: this.viewport.offsetX,
            offsetY: this.viewport.offsetY,
            autoFitZoom: this.config.autoFitZoom
        };
        this.config.autoFitZoom = false;
        
        // Expand node
        NodeExpansionEngine.expand(node);
        
        // Only request children if they are unexplored
        if (node.hasUnexploredChildren) {
            node.hasUnexploredChildren = false;
            
            // Send request to parent to generate children
            window.parent.postMessage({
                type: 'NODE_EXPANSION_REQUEST',
                nodeId: node.id
            }, '*');
        } else {
            // Just layout and render if children already exist
            this.layoutTree();
        }
        
        // Re-render to show expansion indicator changed
        this.render();
    }

    /**
     * Faltet einen Knoten ein (versteckt Kinder).
     * @param {Object} data - {nodeId: nodeId}
     */
    foldNode(data) {
        if (this.config.enableTreeExpansion === false) return;
        
        const node = this.nodes.get(data.nodeId);
        if (!node) return;
        
        if (!NodeExpansionEngine.isExpandable(node)) return;
        
        // Store current viewport state
        const savedViewport = {
            scale: this.viewport.scale,
            offsetX: this.viewport.offsetX,
            offsetY: this.viewport.offsetY
        };
        
        // Fold node
        NodeExpansionEngine.collapse(node);
        
        // Restore viewport after layout
        this.layoutTree();
        this.viewport.scale = savedViewport.scale;
        this.viewport.offsetX = savedViewport.offsetX;
        this.viewport.offsetY = savedViewport.offsetY;
        
        // Re-render
        this.render();
    }

    /**
     * Batch Command Execution
     */
    executeBatch(commands) {
        if (!Array.isArray(commands)) return;

        const updateCommands = [];
        commands.forEach(cmd => {
            switch (cmd.action) {
                case 'ADD_NODE':
                    this.addNode(cmd);
                    break;
                case 'HIGHLIGHT_EDGE':
                    this.highlightEdge(cmd);
                    break;
                case 'UPDATE_NODE':
                    updateCommands.push(cmd);
                    break;
                case 'MARK_EXPANDABLE':
                    this.markExpandable(cmd);
                    break;
            }
        });

        this.layoutTree();
        updateCommands.forEach(cmd => this.updateNode(cmd));

        if (this.config.autoFitZoom) {
            this.fitTreeToView();
        }

        // Restore viewport state if expansion was in progress
        if (this._expansionViewportState) {
            this.viewport.scale = this._expansionViewportState.scale;
            this.viewport.offsetX = this._expansionViewportState.offsetX;
            this.viewport.offsetY = this._expansionViewportState.offsetY;
            this.config.autoFitZoom = this._expansionViewportState.autoFitZoom;
            this._expansionViewportState = null;
        }

        const loadingOverlay = document.getElementById('loading');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }

        this.render();
    }

    /**
     * Reset View
     */
    resetView() {
        this.viewport.scale = 1.0;
        this.viewport.offsetX = 0;
        this.viewport.offsetY = 50;
    }

    /**
     * Auto-fit tree to view
     */
    fitTreeToView() {
        if (this.nodes.size === 0) return;

        const zoomData = TreeLayoutEngine.calculateAutoFitZoom(
            this.nodes,
            this.canvas,
            this.viewport
        );

        this.viewport.scale = zoomData.scale;
        this.viewport.offsetX = zoomData.offsetX;
        this.viewport.offsetY = zoomData.offsetY;
    }

    // ========================================
    // LAYOUT
    // ========================================

    /**
     * Layoutet den ganzen Baum
     */
    layoutTree() {
        if (this.nodes.size === 0) return;

        const root = Array.from(this.nodes.values()).find(n =>
            !n.parentId || n.parentId === null
        );

        if (root) {
            this.assignCoordinates(root, this.canvas.width / 2, 80);
        }
    }

    /**
     * Assigns coordinates recursively
     */
    assignCoordinates(nodeOrId, x, y) {
        const node = typeof nodeOrId === 'number' ? this.nodes.get(nodeOrId) : nodeOrId;
        if (!node) return;

        node.x = x;
        node.y = y;

        // Stop recursion if node is collapsed
        if (node.collapsed) return;

        const children = Array.from(this.nodes.values()).filter(n => n.parentId === node.id);
        if (children.length > 0) {
            const subtreeWidth = TreeLayoutEngine.calculateSubtreeWidth(node.id, this.nodes, this.config);
            let currentX = x - (subtreeWidth / 2);

            children.forEach(child => {
                const childWidth = TreeLayoutEngine.calculateSubtreeWidth(child.id, this.nodes, this.config);
                this.assignCoordinates(child.id, currentX + childWidth / 2, y + this.config.levelHeight);
                currentX += childWidth;
            });
        }
    }

    // ========================================
    // RENDERING
    // ========================================

    /**
     * Main Render Method
     */
    render() {
        // Update Active Node Tracking
        if (this.config.enableActiveNodeTracking && this.activeNodeTracking.nodeId) {
            TreeFeaturesEngine.updateActiveNodePosition(
                this.activeNodeTracking,
                this.nodes,
                this.viewport,
                this.canvas,
                this.config
            );
        }

        // Clear Canvas
        TreeRenderer.clear(this.ctx, this.canvas.width, this.canvas.height);

        // Save Context
        this.ctx.save();

        // Apply Viewport Transform (once, for all tree drawing)
        this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
        this.ctx.scale(this.viewport.scale, this.viewport.scale);

        // Draw Level Indicators (Max/Min/Grid) - BEHIND tree
        if (TreeRenderer.renderLevelIndicators) {
            // Calculate current max depth from nodes
            let maxDepth = 0;
            this.nodes.forEach(n => {
                if (n.metadata && n.metadata.depth > maxDepth) maxDepth = n.metadata.depth;
            });
            this.config.currentMaxDepth = maxDepth;
            
            TreeRenderer.renderLevelIndicators(this.ctx, this.config, 0, this.viewport);
        }

        // Determine visible nodes (for Folding/Expansion)
        let nodesToRender = this.nodes;
        let edgesToRender = this.edges;

        if (this.config.enableTreeExpansion !== false && typeof NodeExpansionEngine !== 'undefined') {
            const rootNode = Array.from(this.nodes.values()).find(n => n.parentId === null);
            if (rootNode) {
                const visibleNodeIds = NodeExpansionEngine.getVisibleNodes(this.nodes, rootNode.id);
                
                // Filter nodes
                nodesToRender = new Map([...this.nodes].filter(([id, n]) => visibleNodeIds.has(id)));
                
                // Filter edges (only if both nodes are visible)
                edgesToRender = this.edges.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));
            }
        }

        // Render using modules (viewport transform already applied!)
        TreeRenderer.renderEdges(this.ctx, edgesToRender, nodesToRender);
        TreeRenderer.renderNodes(
            this.ctx,
            nodesToRender,
            this.STATUS_TYPES,
            (node) => TreeFeaturesEngine.getNodeStyle(node, this.STATUS_TYPES, this.config),
            this.viewport.scale,
            this.config  // Pass config for board render style options
        );

        // Restore Context (BEFORE drawing overlay - overlay must be in screen space!)
        this.ctx.restore();

        // Draw Overlay (after context restore - draws in screen space)
        TreeRenderer.renderOverlay(this.ctx, this.viewport.scale, this.config, this.nodes);
    }
}

/**
 * ============================================================================
 * TREE NAVIGATION UTILITIES (Universal)
 * 
 * Generic functions for navigating through tree structures.
 * These are independent of the TreeVizEngine class and work with any tree
 * that has a nodeParentMap structure.
 * ============================================================================
 */

/**
 * Finds the path from any node to the root node.
 * @param {number} nodeId - Starting node
 * @param {Map} nodeParentMap - Map where key=childId, value=parentId
 * @returns {number[]} Path from nodeId to root: [nodeId, parent, grandparent, ..., root]
 */
function findPathToRoot(nodeId, nodeParentMap) {
    const path = [nodeId];
    let current = nodeId;
    
    while (nodeParentMap.has(current)) {
        current = nodeParentMap.get(current);
        path.push(current);
    }
    
    return path;
}

/**
 * Finds the Lowest Common Ancestor (LCA) of two nodes.
 * @param {number} nodeA - First node
 * @param {number} nodeB - Second node
 * @param {Map} nodeParentMap - Tree structure map
 * @returns {object} { lca: nodeId, stepsFromA: number, stepsFromB: number }
 */
function findLowestCommonAncestor(nodeA, nodeB, nodeParentMap) {
    const pathA = findPathToRoot(nodeA, nodeParentMap);
    const pathB = findPathToRoot(nodeB, nodeParentMap);
    
    // Convert paths to Sets for quick lookup
    const setA = new Set(pathA);
    
    // Find first common node in pathB
    for (let i = 0; i < pathB.length; i++) {
        if (setA.has(pathB[i])) {
            const lca = pathB[i];
            const stepsFromA = pathA.indexOf(lca);
            const stepsFromB = i;
            
            return {
                lca: lca,
                stepsFromA: stepsFromA,
                stepsFromB: stepsFromB
            };
        }
    }
    
    return null; // Should never happen if tree is valid
}

/**
 * HIGH-LEVEL: Reconstructs complete navigation path between two nodes.
 * Combines LCA finding and move extraction into a single call.
 * 
 * @param {number} fromNodeId - Current node
 * @param {number} toNodeId - Target node
 * @param {Map} nodeParentMap - Parent map
 * @param {Map} treeStructure - Node structure with children Map
 * @returns {object} {
 *     backwardSteps: number,          // How many times to backtrack
 *     forwardMoves: [{ r, c }, ...],  // Board coordinates to move to
 *     lca: number,                    // Lowest common ancestor
 *     isValid: boolean                // Whether path is complete
 * }
 */
function reconstructTreePath(fromNodeId, toNodeId, nodeParentMap, treeStructure) {
    // Find LCA
    const lca_info = findLowestCommonAncestor(fromNodeId, toNodeId, nodeParentMap);
    if (!lca_info) {
        return { isValid: false };
    }
    
    const { lca, stepsFromA, stepsFromB } = lca_info;
    
    // Build forward path: LCA → toNodeId
    const pathToTarget = findPathToRoot(toNodeId, nodeParentMap);
    const lcaIndex = pathToTarget.indexOf(lca);
    
    if (lcaIndex === -1) {
        return { isValid: false };
    }
    
    // Take only from toNodeId to LCA (inclusive) and reverse
    const pathFromTargetToLCA = pathToTarget.slice(0, lcaIndex + 1);
    const reversedPath = pathFromTargetToLCA.reverse(); // [LCA, ..., parent, toNodeId]
    
    // Extract move coordinates (moveKeys) along the path
    const forwardMoves = [];
    for (let i = 1; i < reversedPath.length; i++) {
        const nodeId = reversedPath[i];
        const parentId = reversedPath[i - 1];
        const parentStruct = treeStructure.get(parentId);
        
        if (parentStruct) {
            // Find which child key corresponds to this nodeId
            for (const [moveKey, childId] of parentStruct.children.entries()) {
                if (childId === nodeId) {
                    const [r, c] = moveKey.split(',').map(Number);
                    forwardMoves.push({ r, c, moveKey });
                    break;
                }
            }
        }
    }
    
    return {
        backwardSteps: stepsFromA,
        forwardMoves: forwardMoves,
        lca: lca,
        isValid: forwardMoves.length === stepsFromB
    };
}

// Make globally available
if (typeof window !== 'undefined') {
    window.TreeVizEngine = TreeVizEngine;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreeVizEngine;
}
