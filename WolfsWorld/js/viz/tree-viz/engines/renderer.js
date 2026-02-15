/**
 * @fileoverview TreeRenderer - Canvas-Rendering Modul für Bäume
 * 
 * Zentrale Rendering-Engine für alle visuellen Baum-Elemente:
 * - renderEdges(): Verbindungslinien zwischen Knoten
 * - renderNode(): Einzelne Knoten mit Status-Styling
 * - renderLabel(): Node-Labels mit Font-Metriken
 * - renderOverlay(): Debug-Overlay mit Viewport-Informationen
 * 
 * Unterstützt spezialisierte Board-Renderer:
 * - KnightsTourNodeRenderer (für Knights-Tour Boards)
 * - RotateBoxNodeRenderer (für RotateBox Boards)
 * 
 * @author Alexander Wolf
 * @version 2.0
 */
var TreeRenderer = {
    /**
     * Referenzen zu spezialisierten Renderern (optional)
     * Können externe Dateien laden oder null sein
     */
    knightsTourRenderer: typeof KnightsTourNodeRenderer !== 'undefined' ? KnightsTourNodeRenderer : null,
    rotateBoxRenderer: typeof RotateBoxNodeRenderer !== 'undefined' ? RotateBoxNodeRenderer : null,
    minimaxRenderer: typeof MinimaxNodeRenderer !== 'undefined' ? MinimaxNodeRenderer : null,
    
    // Safe getters for global STYLE_CONFIG and STYLE_CONFIG_GLOBAL
    // These are defined in status-config.js and must be loaded first
    getStyleConfig() {
        if (typeof window !== 'undefined' && window.STYLE_CONFIG) {
            return window.STYLE_CONFIG;
        }
        if (typeof StatusConfig !== 'undefined' && StatusConfig.getStyleConfig) {
            return StatusConfig.getStyleConfig();
        }
        return {};
    },

    getStyleConfigGlobal() {
        if (typeof window !== 'undefined' && window.STYLE_CONFIG_GLOBAL) {
            return window.STYLE_CONFIG_GLOBAL;
        }
        if (typeof StatusConfig !== 'undefined' && StatusConfig.STYLE_CONFIG_GLOBAL) {
            return StatusConfig.STYLE_CONFIG_GLOBAL;
        }
        return {};
    },

    /**
     * Rendert alle Kanten des Baums
     * WICHTIG: Viewport-Transformationen müssen bereits vom Aufrufer angewendet sein!
     * @param {CanvasRenderingContext2D} ctx - bereits mit Viewport-Transform
     * @param {Array} edges - Array von { from, to, label }
     * @param {Map} nodes - Map von nodeId → node
     */
    renderEdges(ctx, edges, nodes) {
        for (const edge of edges) {
            const fromNode = nodes.get(edge.from);
            const toNode = nodes.get(edge.to);
            
            if (!fromNode || !toNode) continue;

            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const len = Math.sqrt((dx * dx) + (dy * dy));
            if (len === 0) continue;

            const ux = dx / len;
            const uy = dy / len;
            const nodeGap = Math.max((fromNode.radius || 15), (toNode.radius || 15)) + 6;

            const startX = fromNode.x + (ux * nodeGap);
            const startY = fromNode.y + (uy * nodeGap);
            const endX = toNode.x - (ux * nodeGap);
            const endY = toNode.y - (uy * nodeGap);

            const isHighlighted = edge.highlighted === true;
            ctx.strokeStyle = edge.color || (isHighlighted ? '#888' : 'rgba(136, 136, 136, 0.55)');
            ctx.lineWidth = isHighlighted ? (edge.width || 2) : 1.25;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Edge label
            if (edge.label) {
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(midX - 15, midY - 10, 30, 20);
                
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(edge.label, midX, midY);
            }
        }
    },

    /**
     * Rendert alle Knoten des Baums (mit Board-Support!)
     * WICHTIG: Viewport-Transformationen müssen bereits vom Aufrufer angewendet sein!
     * @param {CanvasRenderingContext2D} ctx - bereits mit Viewport-Transform
     * @param {Map} nodes - Map von nodeId → node
     * @param {Object} statusTypes - Status-Definitionen
     * @param {Function} getNodeStyle - Funktion zum Abrufen des Node-Stils
     * @param {number} scale - Viewport scale für Line-Width Berechnung
     * @param {Object} config - Config mit Board-Render-Optionen (optional)
     */
    renderNodes(ctx, nodes, statusTypes, getNodeStyle, scale = 1, config = {}) {
        // Sortiere Knoten nach Priorität (höher = zuletzt = oben)
        const sortedNodes = Array.from(nodes.values()).sort((a, b) => {
            const getPriority = (node) => {
                if (node.status) {
                    const priorities = Array.from(node.status).map(s => statusTypes[s]?.priority || 0);
                    return Math.max(...priorities, 0);
                }
                return 0;
            };
            return getPriority(a) - getPriority(b);
        });

        for (const node of sortedNodes) {
            const style = getNodeStyle(node);
            const radius = node.radius || 15;

            // FIX: Check if node has boardData (Knights-Tour or RotateBox board)
            if (node.boardData) {
                this.renderBoardNode(ctx, node, style, radius, scale, config);
            } else {
                // Regular circle node
                // Glow effect - nutze zentrale STYLE_CONFIG_GLOBAL Einstellung
                const STYLE_CONFIG_GLOBAL = this.getStyleConfigGlobal();
                if (style.glowColor) {
                    ctx.shadowBlur = (typeof STYLE_CONFIG_GLOBAL !== 'undefined' ? STYLE_CONFIG_GLOBAL.shadowBlur : 15) / scale;
                    ctx.shadowColor = style.glowColor;
                } else {
                    ctx.shadowBlur = 0;
                }

                // Knoten zeichnen
                ctx.fillStyle = style.fillColor || '#ddd';
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                ctx.fill();

                // Rand zeichnen
                if (style.borderDash && style.borderDash.length > 0) {
                    ctx.setLineDash(style.borderDash);
                } else {
                    ctx.setLineDash([]);
                }
                
                ctx.strokeStyle = style.borderColor || '#888';
                ctx.lineWidth = (style.borderWidth || 2) / scale;
                ctx.stroke();
                ctx.setLineDash([]);

                // Label
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000';
                ctx.font = `${12 / scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.label || node.id, node.x, node.y);
            }
            
            // Draw expansion indicator if node is expandable (disabled only if enableTreeExpansion === false)
            if (typeof NodeExpansionEngine !== 'undefined' && NodeExpansionEngine.isExpandable(node)) {
                // Skip only if explicitly disabled
                if (!config || config.enableTreeExpansion !== false) {
                    NodeExpansionEngine.drawExpansionIndicator(ctx, node, scale);
                }
            }
        }
    },

    /**
     * Rendert einen Knoten mit Board-Daten (Knights-Tour oder RotateBox)
     * Nutzt spezialisierte Renderer wenn verfügbar
     * WICHTIG: Nutzt zentrale STYLE_CONFIG für Board-Zustände (BOARD_WON, BOARD_NORMAL)
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} node - Node mit boardData
     * @param {Object} style - Node style (bereits aus STYLE_CONFIG)
     * @param {number} radius - Node radius
     * @param {number} scale - Viewport scale
     * @param {Object} config - Config mit boardRenderStyle Einstellungen (optional)
     */
    renderBoardNode(ctx, node, style, radius, scale, config = {}) {
        const board = node.boardData;
        const size = radius * 2;
        const halfSize = size / 2;

        // Wähle Board-Style aus STYLE_CONFIG basierend auf board.won
        const STYLE_CONFIG = this.getStyleConfig();
        let boardStyle = style;
        if (board.won) {
            // Nutze zentrale BOARD_WON Definition statt lokale Hardcodes
            boardStyle = TreeFeaturesEngine._convertStyleToRenderFormat(STYLE_CONFIG.BOARD_WON, config);
        } else if (!style.fillColor) {
            // Falls kein Style vom Node selbst, nutze BOARD_NORMAL
            boardStyle = TreeFeaturesEngine._convertStyleToRenderFormat(STYLE_CONFIG.BOARD_NORMAL, config);
        }

        // Glow effect - nutze zentrale STYLE_CONFIG_GLOBAL Einstellung
        const STYLE_CONFIG_GLOBAL = this.getStyleConfigGlobal();
        if (boardStyle.glowColor) {
            ctx.shadowBlur = (typeof STYLE_CONFIG_GLOBAL !== 'undefined' ? STYLE_CONFIG_GLOBAL.glowBlur : 20) / scale;
            ctx.shadowColor = boardStyle.glowColor;
        } else {
            ctx.shadowBlur = 0;
        }

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(node.x - halfSize, node.y - halfSize, size, size);

        // Detect board type and render using appropriate renderer
        // WICHTIG: Reihenfolge der Checks ist kritisch!
        // 1. Explicit boardType check (am spezifischsten)
        // 2. Knights-Tour (hat board.size)
        // 3. RotateBox (hat board.rows/cols)
        if (node.boardType === 'minimax') {
            // Minimax/TicTacToe board (explizit markiert)
            if (typeof MinimaxNodeRenderer !== 'undefined') {
                MinimaxNodeRenderer.render(ctx, board, node.x, node.y, size, scale, node.metadata);
            }
        } else if (board.size !== undefined && board.grid && Array.isArray(board.grid[0])) {
            // Knights-Tour board (hat size + 2D grid array)
            if (typeof KnightsTourNodeRenderer !== 'undefined') {
                KnightsTourNodeRenderer.render(ctx, board, node.x, node.y, size, scale, 'classic');
            }
        } else if (board.rows !== undefined && board.cols !== undefined) {
            // RotateBox board (has rows/cols)
            if (typeof RotateBoxNodeRenderer !== 'undefined') {
                RotateBoxNodeRenderer.render(ctx, board, node.x, node.y, size, scale);
            }
        }

        // Apply styling (border, glow) - AUS ZENTRALER STYLE_CONFIG
        ctx.strokeStyle = boardStyle.borderColor || '#333';
        ctx.lineWidth = (boardStyle.borderWidth || 2) / scale;
        ctx.setLineDash(boardStyle.borderDash || []);
        ctx.strokeRect(node.x - halfSize, node.y - halfSize, size, size);
        ctx.setLineDash([]);

        ctx.shadowBlur = 0;
        
        // Draw Label below the board (if present)
        // Für Minimax-Boards werden Label nicht gezeichnet, da Metadaten (V, α, β)
        // bereits unterhalb gerendert werden und sonst überlagern.
        const shouldShowLabel = !node.boardData;

        if (node.label && node.label !== node.id && shouldShowLabel) {
             // Check if this is a placeholder label that should only show when READY
             const isPlaceholderLabel = node.label.includes('f = ???') || node.label.includes('?');
             const hasReadyStatus = node.status && node.status.has('READY');
             
             // Only draw placeholder labels if node is READY, but always draw evaluation results
             const shouldDrawLabel = !isPlaceholderLabel || hasReadyStatus;
             
             if (shouldDrawLabel) {
                ctx.fillStyle = '#000';
                 // Fixed font size in world space so it shrinks when zooming out (nodes get small)
                 ctx.font = '10px Arial';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'top';
                 
                 // Position relative to bottom of board + padding
                 const labelY = node.y + halfSize + 5;
                 
                 // Split by newline to handle potential multi-line labels
                 const lines = String(node.label).split('\n');
                 lines.forEach((line, i) => {
                     ctx.fillText(line, node.x, labelY + (i * 12));
                 });
             }
        }
    },

    /**
     * Rendert Overlay-Informationen (Zoom-Level, Debug-Info, etc.)
     * WICHTIG: Muss NACH ctx.restore() aufgerufen werden, da es im Screen-Space zeichnet!
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} scale - Zoom-Level vom Viewport
     * @param {Object} config - { showOverlay, maxDepth, levelLabels }
     * @param {Map} nodes - Map für zusätzliche Stats
     */
    renderOverlay(ctx, scale, config, nodes) {
        // Draw Level Indicators (Max/Min) if enabled
        // These are drawn "behind" typical UI overlay but "above" background
        // However, since we are in screen space here, we need to be careful.
        // Actually, dotted lines should be in world space (move with tree), 
        // labels on the left should be in screen space (fixed X) but World Y?
        
        // This function is called in SCREEN SPACE (after restore).
        // To draw level lines that move with the tree, we should have done it in render().
        // BUT, the requirements say "An der Seite links vom Baum sollen Max und Min geschrieben sein (overlay?)".
        // "Overlay" suggests fixed position on screen.
        
        // Let's draw standard Overlay UI first
        if (config.showOverlay) {
            // Zoom indicator
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(10, 10, 120, 30);
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Zoom: ${(scale * 100).toFixed(0)}%`, 20, 18);

            // Node count
            if (nodes && nodes.size > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(10, 50, 120, 30);
                ctx.fillStyle = '#fff';
                ctx.fillText(`Nodes: ${nodes.size}`, 20, 58);
            }
        }
    },

    /**
     * Draws level indicators (Min/Max labels and dotted lines).
     * THIS MUST BE CALLED WITHIN THE TRANSFORMED CONTEXT (World Space)
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} config - { levelHeight, maxDepth, rootPlayerColor, opponentColor }
     * @param {number} treeTopY - Y position of root node (usually 0)
     * @param {Object} viewport - For calculating screen-fixed labels
     */
    renderLevelIndicators(ctx, config, treeTopY = 0, viewport) {
        if (!config.showLevelIndicators) return;

        const maxDepth = config.currentMaxDepth || 0;
        const levelHeight = config.levelHeight || 120;
        
        // Colors
        const maxColor = config.rootPlayerColor || '#e74c3c'; // Red (Max/Root)
        const minColor = config.opponentColor || '#3498db';   // Blue (Min/Opponent)
        
        // Define visible area in world space to draw lines
        // We want lines to span the whole visible width
        const visibleLeft = -viewport.offsetX / viewport.scale;
        const visibleRight = (ctx.canvas.width - viewport.offsetX) / viewport.scale;
        
        // Draw lines and labels
        ctx.save();
        
        for (let d = 0; d <= maxDepth; d++) {
            const y = treeTopY + ((d+0.7) * levelHeight);
            
            // Draw dotted line between levels (except before root)
            if (d > 0) {
                const lineY = y - (levelHeight / 2); // Line in the middle of the level
                
                ctx.beginPath();
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.moveTo(visibleLeft, lineY);
                ctx.lineTo(visibleRight, lineY);
                ctx.stroke();
                ctx.setLineDash([]); // Reset dash
                
                // Draw Labels (Max / Min) - only for lines between levels
                // d=1 -> MAX, d=2 -> MIN, d=3 -> MAX, etc.
                const isMax = (d % 2 === 1);
                const label = isMax ? 'MAX' : 'MIN';
                const color = isMax ? maxColor : minColor;
                
                // Position label above the line
                const labelX = (10 - viewport.offsetX) / viewport.scale; // 10px from edge
                const labelY = lineY - 5; // Position closer to root, just above the line

                ctx.fillStyle = color;
                // Use scale-invariant font size
                ctx.font = `bold ${16 / viewport.scale}px Arial`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                ctx.fillText(label, labelX, labelY);
            }
        }
        
        ctx.restore();
    },

    /**
     * Clear canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width
     * @param {number} height
     */
    clear(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.TreeRenderer = TreeRenderer;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreeRenderer;
}
