/**
 * @fileoverview KnightsTourNodeRenderer - Spezialisierter Renderer für Knights-Tour Boards in Tree-Nodes
 * 
 * Rendert Schachbrett-Boards in Baum-Knoten mit zwei visuellen Stilen:
 * - "classic": Echtes Schachbrett mit schwarzen Zahlen und roter Umrandung (original)
 * - "modern": Grüne besuchte Felder mit optimiertem Styling
 * 
 * Wird von TreeRenderer.renderNode() aufgerufen, wenn boardData vorhanden ist.
 * 
 * @author Alexander Wolf
 * @version 1.0
 */
var KnightsTourNodeRenderer = {
    /**
     * Rendert ein Knights-Tour Board mit wählbarem Style
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} board - KnightBoard object
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @param {number} size - Size of board in pixels
     * @param {number} scale - Viewport scale
     * @param {string} style - "classic" oder "modern" (default: "classic")
     */
    render(ctx, board, centerX, centerY, size, scale, style = "classic") {
        if (!board || !board.grid || !board.size) return;

        if (style === "classic") {
            this.renderClassic(ctx, board, centerX, centerY, size, scale);
        } else if (style === "modern") {
            this.renderModern(ctx, board, centerX, centerY, size, scale);
        }
    },

    /**
     * CLASSIC STYLE: Echtes Schachbrett mit schwarzen Zahlen
     * - Schwarze/Braune Felder (authentisches Schachbrett-Muster)
     * - Schwarze Zahlen auf Feldern
     */
    renderClassic(ctx, board, centerX, centerY, size, scale) {
        if (!board || !board.grid || !board.size) return;

        const boardSize = board.size;
        const cellSize = size / boardSize;
        const startX = centerX - size / 2;
        const startY = centerY - size / 2;

        ctx.save();

        // Draw classic chessboard (OHNE Feldergrenzen, nur Farben)
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const x = startX + c * cellSize;
                const y = startY + r * cellSize;
                const val = board.grid[r][c];

                // Checkerboard pattern (original colors)
                if ((r + c) % 2 === 0) {
                    ctx.fillStyle = '#f0d9b5';  // Light square
                } else {
                    ctx.fillStyle = '#b58863';  // Dark square
                }
                ctx.fillRect(x, y, cellSize, cellSize);

                // Move number (if visited) - BLACK TEXT
                if (val > 0) {
                    ctx.fillStyle = '#000';
                    ctx.font = `bold ${Math.max(8, cellSize * 0.4)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val, x + cellSize / 2, y + cellSize / 2);
                }
            }
        }

        // Highlight current knight position with RED BORDER
        // Support both board.position and board.currentPos (for compatibility)
        const pos = board.position || board.currentPos;
        if (pos) {
            const r = pos.r;
            const c = pos.c;
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;
            
            ctx.strokeStyle = '#e74c3c';  // Red border
            ctx.lineWidth = Math.max(2, cellSize * 0.15);
            ctx.strokeRect(x, y, cellSize, cellSize);
        }

        ctx.restore();
    },

    /**
     * MODERN STYLE: Farbige Visualisierung mit grünen Feldern
     */
    renderModern(ctx, board, centerX, centerY, size, scale) {
        if (!board || !board.grid || !board.size) return;

        const boardSize = board.size;
        const cellSize = size / boardSize;
        const startX = centerX - size / 2;
        const startY = centerY - size / 2;

        ctx.save();

        // Draw board with color coding
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const x = startX + c * cellSize;
                const y = startY + r * cellSize;
                const val = board.grid[r][c];

                // Color based on visit status
                if (val > 0) {
                    ctx.fillStyle = '#2ecc71';  // Green: visited
                } else {
                    ctx.fillStyle = '#ecf0f1';  // Light gray: not visited
                }
                ctx.fillRect(x, y, cellSize, cellSize);

                // Move number
                if (val > 0) {
                    ctx.fillStyle = '#000';
                    ctx.font = `bold ${Math.max(8, cellSize * 0.4)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val, x + cellSize / 2, y + cellSize / 2);
                }
            }
        }

        // Highlight current position
        const pos = board.position || board.currentPos;
        if (pos) {
            const r = pos.r;
            const c = pos.c;
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;
            
            ctx.strokeStyle = '#e74c3c';  // Red border
            ctx.lineWidth = Math.max(2, cellSize * 0.15);
            ctx.strokeRect(x, y, cellSize, cellSize);
        }

        ctx.restore();
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.KnightsTourNodeRenderer = KnightsTourNodeRenderer;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KnightsTourNodeRenderer;
}
