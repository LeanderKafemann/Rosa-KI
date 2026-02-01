/**
 * Generisches Suchbaum-Visualisierungs-System.
 * Unterstützt postMessage-basierte Kommandos, Zoom, Pan und Touch-Interaktion.
 * @class
 * @author GitHub Copilot
 * @version 2.3
 */
class TreeVizEngine {
    /**
     * Erstellt eine neue TreeVizEngine Instanz.
     * @param {HTMLCanvasElement} canvas
     * Das Canvas-Element für das Rendering.
     * @param {Object} options
     * Konfigurations-Optionen.
     */
    constructor(canvas, options = {}) {
        console.log('TreeVizEngine: Constructor called');
        /**
         * Das Canvas-Element.
         * @type {HTMLCanvasElement}
         */
        this.canvas = canvas;
        
        /**
         * Der 2D-Rendering-Kontext.
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = canvas.getContext('2d');
        
        /**
         * Map aller Knoten im Baum.
         * @type {Map<number, Object>}
         */
        this.nodes = new Map();
        
        /**
         * Array aller Kanten im Baum.
         * @type {Array<Object>}
         */
        this.edges = [];
        
        /**
         * Map der Highlight-Styles für Knoten.
         * @type {Map<number, Object>}
         */
        this.highlights = new Map();
        
        // Layout configuration
        this.config = {
            nodeRadius: options.nodeRadius || 40,
            levelHeight: options.levelHeight || 120,
            horizontalSpacing: options.horizontalSpacing || 100,
            fontSize: options.fontSize || 12,
            fontFamily: options.fontFamily || 'Arial, sans-serif',
            autoFitZoom: options.autoFitZoom || false,
            showOverlay: options.showOverlay !== undefined ? options.showOverlay : true,
            ...options
        };
        
        // Zoom & Pan state
        this.viewport = {
            scale: 1.0,
            offsetX: 0,
            offsetY: 50,
            minScale: 0.1,
            maxScale: 3.0
        };
        
        // Interaction state
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        
        this.init();
    }
    
    /**
     * Initialisiert die Engine (Canvas, PostMessage, Interaktion).
     */
    init() {
        this.setupCanvas();
        this.setupPostMessage();
        this.setupInteraction();
        this.render();
    }
    
    /**
     * Konfiguriert das Canvas-Element und Resize-Handler.
     */
    setupCanvas() {
        // Set canvas to container size
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const oldWidth = this.canvas.width;
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            
            // Recalculate layout if tree exists
            if (this.nodes.size > 0) {
                this.layoutTree();
                this.render();
            }
        });
    }
    
    /**
     * Konfiguriert den postMessage-Listener für Kommandos.
     */
    setupPostMessage() {
        window.addEventListener('message', (event) => {
            // Uncomment for debugging
            // console.log('TreeVizEngine raw message:', event.data);
            
            if (event.data && event.data.type === 'TREE_COMMAND') {
                console.log('TreeVizEngine received command:', event.data.command);
                this.executeCommand(event.data.command);
            }
        });
        
        // Notify parent that we're ready
        console.log('TreeVizEngine: Sending TREE_READY to parent');
        window.parent.postMessage({ type: 'TREE_READY' }, '*');
        
        // Failsafe: Hide loading overlay after 2 seconds if no commands received
        // This ensures the user doesn't stare at "Initializing..." forever
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loading');
            if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
                console.warn('TreeVizEngine: Force hiding loading overlay (timeout)');
                loadingOverlay.classList.add('hidden');
                
                // Draw a placeholder or help text
                this.ctx.font = '16px Arial';
                this.ctx.fillStyle = '#666';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Ready. No tree data received yet.', this.canvas.width/2, this.canvas.height/2);
            }
        }, 2000);
    }
    
    /**
     * Konfiguriert Zoom-, Pan- und Touch-Interaktion.
     */
    setupInteraction() {
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Zoom factor
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(
                this.viewport.minScale,
                Math.min(this.viewport.maxScale, this.viewport.scale * zoomFactor)
            );
            
            // Zoom to mouse position
            const scaleRatio = newScale / this.viewport.scale;
            this.viewport.offsetX = mouseX - (mouseX - this.viewport.offsetX) * scaleRatio;
            this.viewport.offsetY = mouseY - (mouseY - this.viewport.offsetY) * scaleRatio;
            this.viewport.scale = newScale;
            
            this.render();
        });
        
        // Mouse drag pan
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            this.dragStart.x = e.clientX - rect.left - this.viewport.offsetX;
            this.dragStart.y = e.clientY - rect.top - this.viewport.offsetY;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (this.isDragging) {
                this.viewport.offsetX = mouseX - this.dragStart.x;
                this.viewport.offsetY = mouseY - this.dragStart.y;
                this.render();
            }
            
            this.lastMousePos = { x: mouseX, y: mouseY };
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });
        
        // Touch support for mobile
        this.setupTouchSupport();
        
        // Default cursor
        this.canvas.style.cursor = 'grab';
    }
    
    /**
     * Konfiguriert Touch-Gesten für mobile Geräte.
     */
    setupTouchSupport() {
        let lastTouchDistance = 0;
        let touchStartOffset = { x: 0, y: 0 };
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // Single touch = pan
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                touchStartOffset.x = touch.clientX - rect.left - this.viewport.offsetX;
                touchStartOffset.y = touch.clientY - rect.top - this.viewport.offsetY;
            } else if (e.touches.length === 2) {
                // Two fingers = pinch zoom
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1) {
                // Pan
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.viewport.offsetX = touch.clientX - rect.left - touchStartOffset.x;
                this.viewport.offsetY = touch.clientY - rect.top - touchStartOffset.y;
                this.render();
            } else if (e.touches.length === 2) {
                // Pinch zoom
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (lastTouchDistance > 0) {
                    const zoomFactor = distance / lastTouchDistance;
                    const newScale = Math.max(
                        this.viewport.minScale,
                        Math.min(this.viewport.maxScale, this.viewport.scale * zoomFactor)
                    );
                    this.viewport.scale = newScale;
                    this.render();
                }
                
                lastTouchDistance = distance;
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            lastTouchDistance = 0;
        });
    }
    
    // ========================================
    // Command Execution
    // ========================================
    
    /**
     * Führt ein empfangenes Kommando aus.
     * @param {Object} commandObj
     * Das Kommando-Objekt mit action und weiteren Parametern.
     */
    executeCommand(commandObj) {
        const { action } = commandObj;
        
        switch (action) {
            case 'ADD_NODE':
                this.addNode(commandObj);
                break;
            case 'UPDATE_NODE':
                this.updateNode(commandObj);
                break;
            case 'HIGHLIGHT_EDGE':
                this.highlightEdge(commandObj);
                break;
            case 'HIGHLIGHT_NODE':
                this.highlightNode(commandObj);
                break;
            case 'REMOVE_HIGHLIGHT':
                this.removeHighlight(commandObj);
                break;
            case 'CLEAR':
                this.clear();
                break;
            case 'SET_FOCUS':
                this.setFocus(commandObj);
                break;
            case 'BATCH':
                this.executeBatch(commandObj.commands);
                return; // Don't render, executeBatch handles it
            case 'RESET_VIEW':
                this.resetView();
                break;
            case 'CHECK_READY':
                console.log('TreeVizEngine: Responding to CHECK_READY');
                window.parent.postMessage({ type: 'TREE_READY' }, '*');
                break;
            default:
                console.warn('Unknown command:', action);
        }
        
        this.render();
    }
    
    /**
     * Fügt einen neuen Knoten zum Baum hinzu.
     * @param {Object} cmd
     * Kommando mit id, parentId, label, color, boardData.
     */
    addNode(cmd) {
        const { id, parentId, label, color, value, position, boardData } = cmd;
        
        // Create node
        const node = {
            id,
            parentId: parentId !== undefined ? parentId : null,
            label: label || '',
            color: color || '#4a90e2',
            value: value !== undefined ? value : null,
            boardData: boardData || null, // RotateBoard object for rendering
            x: 0,  // Will be set by layoutTree
            y: 0,
            radius: this.config.nodeRadius,
            children: []
        };
        
        this.nodes.set(id, node);
        
        // Add to parent's children array
        if (parentId !== null && parentId !== undefined) {
            const parent = this.nodes.get(parentId);
            if (parent) {
                parent.children.push(id);
                
                // Create edge
                this.edges.push({
                    from: parentId,
                    to: id,
                    color: '#95a5a6',
                    width: 2,
                    highlighted: false
                });
            }
        }
    }
    
    /**
     * Aktualisiert einen existierenden Knoten.
     * @param {Object} data
     * Daten mit id und zu ändernden Properties.
     */
    updateNode(data) {
        const node = this.nodes.get(data.id);
        if (!node) {
            console.warn('Node not found:', data.id);
            return;
        }
        
        if (data.label !== undefined) node.label = data.label;
        if (data.color !== undefined) node.color = data.color;
        if (data.value !== undefined) node.value = data.value;
        if (data.position) {
            node.x = data.position.x;
            node.y = data.position.y;
        }
    }
    
    /**
     * Hebt eine Kante farblich hervor.
     * @param {Object} data
     * Daten mit fromId, toId, color, width.
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
     * Hebt einen Knoten farblich hervor.
     * @param {Object} data
     * Daten mit id, color, style (glow/border/fill).
     */
    highlightNode(data) {
        this.highlights.set(data.id, {
            color: data.color || '#ff9800',
            style: data.style || 'glow' // glow, border, fill
        });
    }
    
    /**
     * Entfernt Highlights von Knoten.
     * @param {Object} data
     * Optional: id zum Entfernen eines spezifischen Highlights.
     */
    removeHighlight(data) {
        if (data.id) {
            this.highlights.delete(data.id);
        } else {
            // Remove all highlights
            this.highlights.clear();
        }
    }
    
    /**
     * Löscht den gesamten Baum.
     */
    clear() {
        this.nodes.clear();
        this.edges = [];
        this.highlights.clear();
    }
    
    /**
     * Fokussiert einen bestimmten Knoten.
     * @param {Object} data
     * Daten mit id des zu fokussierenden Knotens.
     */
    setFocus(data) {
        const node = this.nodes.get(data.id);
        if (!node) return;
        
        // Center view on node
        this.viewport.offsetX = this.canvas.width / 2 - node.x * this.viewport.scale;
        this.viewport.offsetY = this.canvas.height / 2 - node.y * this.viewport.scale;
    }
    
    /**
     * Führt mehrere Kommandos als Batch aus.
     * @param {Array<Object>} commands
     * Array von Kommando-Objekten.
     */
    executeBatch(commands) {
        if (!Array.isArray(commands)) {
            console.warn('BATCH expects commands array');
            return;
        }
        
        console.log(`TreeVizEngine: Executing batch with ${commands.length} commands`);
        
        // Execute all commands without rendering
        commands.forEach(cmd => {
            switch (cmd.action) {
                case 'ADD_NODE': 
                    this.addNode(cmd); 
                    break;
                case 'UPDATE_NODE': 
                    this.updateNode(cmd); 
                    break;
                case 'HIGHLIGHT_EDGE': 
                    this.highlightEdge(cmd); 
                    break;
                case 'HIGHLIGHT_NODE': 
                    this.highlightNode(cmd); 
                    break;
                case 'REMOVE_HIGHLIGHT': 
                    this.removeHighlight(cmd); 
                    break;
            }
        });
        
        // Calculate proper layout after all nodes are added
        this.layoutTree();
        
        // Auto-fit if enabled
        if (this.config.autoFitZoom) {
            this.fitTreeToView();
        }
        
        // Hide loading overlay if present
        const loadingOverlay = document.getElementById('loading');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        // Render once after all commands
        this.render();
    }
    
    /**
     * Setzt den Viewport auf Standard-Werte zurück.
     */
    resetView() {
        this.viewport.scale = 1.0;
        this.viewport.offsetX = 0;
        this.viewport.offsetY = 50;
    }
    
    /**
     * Passt Zoom und Pan an, um den gesamten Baum anzuzeigen.
     */
    fitTreeToView() {
        if (this.nodes.size === 0) return;
        
        // Calculate bounding box of all nodes
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        this.nodes.forEach(node => {
            const nodeSize = node.radius * 2;
            minX = Math.min(minX, node.x - nodeSize);
            maxX = Math.max(maxX, node.x + nodeSize);
            minY = Math.min(minY, node.y - nodeSize);
            maxY = Math.max(maxY, node.y + nodeSize);
        });
        
        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        
        // Calculate scale to fit
        const padding = 40; // Padding around tree
        const scaleX = (this.canvas.width - padding * 2) / treeWidth;
        const scaleY = (this.canvas.height - padding * 2) / treeHeight;
        const scale = Math.min(scaleX, scaleY, this.viewport.maxScale);
        
        // Calculate offset to center tree
        const treeCenterX = (minX + maxX) / 2;
        const treeCenterY = (minY + maxY) / 2;
        
        this.viewport.scale = scale;
        this.viewport.offsetX = this.canvas.width / 2 - treeCenterX * scale;
        this.viewport.offsetY = this.canvas.height / 2 - treeCenterY * scale;
        
        console.log(`Auto-fit: scale=${scale.toFixed(2)}, bounds=${treeWidth}x${treeHeight}`);
    }
    
    // ========================================
    // Layout Calculation
    // ========================================
    
    calculateNodePosition(id, parentId) {
        // Position will be calculated after all nodes are added
        // in the layout phase
        const level = this.getNodeLevel(id, parentId);
        const y = level * this.config.levelHeight + 80;
        const x = this.canvas.width / 2; // Default center, will be adjusted
        return { x, y };
    }
    
    /**
     * Calculate proper tree layout after all nodes are added
     * Uses subtree width calculation for balanced layout
     */
    layoutTree() {
        if (this.nodes.size === 0) return;
        
        // Find root node (no parent)
        const root = Array.from(this.nodes.values()).find(n => 
            n.parentId === null || n.parentId === undefined
        );
        
        if (!root) return;
        
        // Assign coordinates recursively
        this.assignCoordinates(root, this.canvas.width / 2, 80);
    }
    
    /**
     * Recursive coordinate assignment with balanced layout
     */
    assignCoordinates(nodeId, x, y) {
        const node = typeof nodeId === 'number' ? this.nodes.get(nodeId) : nodeId;
        if (!node) return;
        
        node.x = x;
        node.y = y;
        
        // Get children
        const children = Array.from(this.nodes.values()).filter(n => n.parentId === node.id);
        
        if (children.length > 0) {
            const subtreeWidth = this.calculateSubtreeWidth(node.id);
            let currentX = x - (subtreeWidth / 2);
            
            children.forEach(child => {
                const childWidth = this.calculateSubtreeWidth(child.id);
                // Position child in center of its allocated space
                this.assignCoordinates(child.id, currentX + childWidth / 2, y + this.config.levelHeight);
                currentX += childWidth;
            });
        }
    }
    
    /**
     * Calculate width of subtree for balanced layout
     */
    calculateSubtreeWidth(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return this.config.horizontalSpacing;
        
        const children = Array.from(this.nodes.values()).filter(n => n.parentId === node.id);
        
        if (children.length === 0) {
            return this.config.nodeRadius * 2 + this.config.horizontalSpacing;
        }
        
        return children.reduce((sum, child) => 
            sum + this.calculateSubtreeWidth(child.id), 0
        );
    }
    
    getNodeLevel(id, parentId) {
        if (parentId === null || parentId === undefined) return 0;
        
        const parent = this.nodes.get(parentId);
        if (!parent) return 0;
        
        return this.getNodeLevel(parent.id, parent.parentId) + 1;
    }
    
    countNodesAtLevel(level) {
        let count = 0;
        this.nodes.forEach(node => {
            if (this.getNodeLevel(node.id, node.parentId) === level) {
                count++;
            }
        });
        return count;
    }
    
    // ========================================
    // Rendering
    // ========================================
    
    /**
     * Rendert den gesamten Baum auf das Canvas.
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context
        this.ctx.save();
        
        // Apply viewport transformation
        this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
        this.ctx.scale(this.viewport.scale, this.viewport.scale);
        
        // Draw in order: edges -> nodes -> labels
        this.drawEdges();
        this.drawNodes();
        this.drawLabels();
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI overlay (zoom level, etc.)
        this.drawOverlay();
    }
    
    /**
     * Zeichnet alle Kanten des Baumes.
     */
    drawEdges() {
        this.edges.forEach(edge => {
            const fromNode = this.nodes.get(edge.from);
            const toNode = this.nodes.get(edge.to);
            
            if (!fromNode || !toNode) return;
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.x, fromNode.y);
            this.ctx.lineTo(toNode.x, toNode.y);
            this.ctx.strokeStyle = edge.color;
            this.ctx.lineWidth = edge.width / this.viewport.scale;
            this.ctx.stroke();
        });
    }
    
    /**
     * Zeichnet alle Knoten des Baumes.
     */
    drawNodes() {
        this.nodes.forEach(node => {
            // Check if highlighted
            const highlight = this.highlights.get(node.id);
            
            // If node has boardData, draw board instead of circle
            if (node.boardData) {
                this.drawBoardNode(node, highlight);
            } else {
                // Draw traditional circle node
                // Draw glow if highlighted
                if (highlight && highlight.style === 'glow') {
                    this.ctx.shadowBlur = 20 / this.viewport.scale;
                    this.ctx.shadowColor = highlight.color;
                }
                
                // Draw node circle
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = node.color;
                this.ctx.fill();
                
                // Draw border if highlighted
                if (highlight && highlight.style === 'border') {
                    this.ctx.strokeStyle = highlight.color;
                    this.ctx.lineWidth = 4 / this.viewport.scale;
                    this.ctx.stroke();
                } else {
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 2 / this.viewport.scale;
                    this.ctx.stroke();
                }
                
                // Reset shadow
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    /**
     * Zeichnet einen Knoten mit Spielbrett-Visualisierung.
     * @param {Object} node
     * Der Knoten mit boardData.
     * @param {Object} highlight
     * Optional: Highlight-Style für diesen Knoten.
     */
    drawBoardNode(node, highlight) {
        const board = node.boardData;
        const size = node.radius * 2; // Board size
        const COLORS = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#e67e22'];
        
        // Draw background square
        const halfSize = size / 2;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(
            node.x - halfSize, 
            node.y - halfSize, 
            size, 
            size
        );
        
        // Detect board type and draw accordingly
        if (board.size !== undefined) {
            // KnightBoard (Knights Tour)
            this.drawKnightBoard(board, node.x, node.y, size);
        } else if (board.rows !== undefined && board.cols !== undefined) {
            // RotateBoard or similar grid-based board
            this.drawGridBoard(board, node.x, node.y, size);
        }
        
        // Draw border
        this.ctx.strokeStyle = board.won ? '#4caf50' : '#333';
        this.ctx.lineWidth = board.won ? 4 / this.viewport.scale : 2 / this.viewport.scale;
        this.ctx.strokeRect(
            node.x - halfSize,
            node.y - halfSize,
            size,
            size
        );
        
        // Draw highlight if needed
        if (highlight) {
            if (highlight.style === 'glow') {
                this.ctx.shadowBlur = 20 / this.viewport.scale;
                this.ctx.shadowColor = highlight.color;
                this.ctx.strokeStyle = highlight.color;
                this.ctx.lineWidth = 4 / this.viewport.scale;
                this.ctx.strokeRect(
                    node.x - halfSize,
                    node.y - halfSize,
                    size,
                    size
                );
                this.ctx.shadowBlur = 0;
            } else if (highlight.style === 'border') {
                this.ctx.strokeStyle = highlight.color;
                this.ctx.lineWidth = 4 / this.viewport.scale;
                this.ctx.strokeRect(
                    node.x - halfSize,
                    node.y - halfSize,
                    size,
                    size
                );
            }
        }
    }
    
    /**
     * Zeichnet ein Springerproblem-Brett.
     * @param {Object} board
     * KnightBoard-Objekt.
     * @param {number} centerX
     * X-Koordinate der Mitte.
     * @param {number} centerY
     * Y-Koordinate der Mitte.
     * @param {number} size
     * Größe des Bretts in Pixeln.
     */
    drawKnightBoard(board, centerX, centerY, size) {
        const halfSize = size / 2;
        const bs = size / board.size; // block size
        const ox = centerX - halfSize;
        const oy = centerY - halfSize;
        
        // Draw chessboard pattern
        for (let r = 0; r < board.size; r++) {
            for (let c = 0; c < board.size; c++) {
                const x = ox + c * bs;
                const y = oy + r * bs;
                
                // Chessboard pattern
                const isLight = (r + c) % 2 === 0;
                this.ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
                this.ctx.fillRect(x, y, bs, bs);
                
                // Draw move number if visited
                const moveNum = board.grid[r][c];
                if (moveNum > 0) {
                    this.ctx.fillStyle = '#000';
                    this.ctx.font = `bold ${Math.max(8, bs * 0.4) / this.viewport.scale}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(moveNum.toString(), x + bs/2, y + bs/2);
                }
                
                // Highlight current position
                if (board.currentPos && board.currentPos.r === r && board.currentPos.c === c) {
                    this.ctx.strokeStyle = '#e74c3c';
                    this.ctx.lineWidth = 3 / this.viewport.scale;
                    this.ctx.strokeRect(x + 2, y + 2, bs - 4, bs - 4);
                }
            }
        }
    }
    
    /**
     * Zeichnet ein gitterbasiertes Brett (z.B. RotateBox).
     * @param {Object} board
     * Board-Objekt mit rows, cols, grid.
     * @param {number} centerX
     * X-Koordinate der Mitte.
     * @param {number} centerY
     * Y-Koordinate der Mitte.
     * @param {number} size
     * Größe des Bretts in Pixeln.
     */
    drawGridBoard(board, centerX, centerY, size) {
        const halfSize = size / 2;
        const COLORS = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#e67e22'];
        
        // Draw board content
        const maxDim = Math.max(board.rows, board.cols);
        if (maxDim > 0) {
            const bs = size / maxDim; // block size
            const ox = centerX - halfSize + (size - (board.cols * bs)) / 2;
            const oy = centerY - halfSize + (size - (board.rows * bs)) / 2;
            
            for (let r = 0; r < board.rows; r++) {
                for (let c = 0; c < board.cols; c++) {
                    const v = board.grid[r][c];
                    const x = ox + c * bs;
                    const y = oy + r * bs;
                    
                    if (v === -2) { // Wall
                        this.ctx.fillStyle = '#2c3e50';
                        this.ctx.fillRect(x, y, bs, bs);
                    } else if (v === -3) { // Goal
                        this.ctx.fillStyle = '#ecf0f1';
                        this.ctx.fillRect(x, y, bs, bs);
                        this.ctx.strokeStyle = '#e74c3c';
                        this.ctx.lineWidth = 2 / this.viewport.scale;
                        this.ctx.strokeRect(x + 1, y + 1, bs - 2, bs - 2);
                    } else if (v >= 0) { // Box
                        this.ctx.fillStyle = COLORS[v % COLORS.length];
                        this.ctx.fillRect(x + 1, y + 1, bs - 2, bs - 2);
                    }
                }
            }
        }
    }
    
    /**
     * Zeichnet alle Labels (Texte) auf den Kanten.
     */
    drawLabels() {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#333';
        // Fixed font size relative to world (scales with zoom)
        this.ctx.font = `bold ${14}px ${this.config.fontFamily}`;
        
        this.nodes.forEach(node => {
            // Draw move label on edge (between parent and child)
            if (node.label && node.parentId !== null) {
                const parent = this.nodes.get(node.parentId);
                if (parent) {
                    // Position: Mitte zwischen Parent und Child
                    const labelX = (parent.x + node.x) / 2;
                    const labelY = (parent.y + node.y) / 2;
                    
                    // Background for label
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                    const metrics = this.ctx.measureText(node.label);
                    // Constant padding in world space
                    const padding = 4;
                    this.ctx.fillRect(
                        labelX - metrics.width / 2 - padding,
                        labelY - 8,
                        metrics.width + padding * 2,
                        16
                    );
                    
                    // Label text
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.fillText(node.label, labelX, labelY);
                }
            }
            
            // Draw value/annotation if exists (for non-board nodes)
            if (!node.boardData && node.value !== null && node.value !== undefined) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.fillText(node.value.toString(), node.x, node.y + node.radius + 15);
            }
        });
    }
    
    drawOverlay() {
        if (!this.config.showOverlay) return;

        // Zoom indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(10, 10, 120, 30);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Zoom: ${(this.viewport.scale * 100).toFixed(0)}%`, 20, 18);
        
        // Instructions (only show if scale is 1.0)
        if (this.viewport.scale === 1.0 && this.viewport.offsetX === 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(this.canvas.width - 210, 10, 200, 60);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('🖱️ Scroll: Zoom', this.canvas.width - 200, 18);
            this.ctx.fillText('🖱️ Drag: Pan', this.canvas.width - 200, 36);
            this.ctx.fillText('📱 Pinch: Zoom', this.canvas.width - 200, 54);
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreeVizEngine;
}
