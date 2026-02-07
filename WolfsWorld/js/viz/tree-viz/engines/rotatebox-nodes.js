/**
 * @fileoverview RotateBoxNodeRenderer - Spezialisierter Renderer für RotateBox Boards in Tree-Nodes
 * 
 * Rendert RotateBox-Puzzle-Boards in Baum-Knoten mit zwei visuellen Stilen:
 * - "grid": Vollflächig eingefärbte Quadrate für jede Zahl
 * - "compact": Nur Zahlen/Labels ohne Hintergrund
 * 
 * Wird von TreeRenderer.renderNode() aufgerufen, wenn boardData vorhanden ist.
 * 
 * @author Alexander Wolf
 * @version 1.0
 */

/**
 * RotateBoxNodeRenderer - Spezialisierter Renderer für RotateBox Boards in Tree-Nodes
 * Bietet zwei Render-Styles:
 * - "grid": Vollflächig eingefärbte Quadrate
 * - "compact": Nur Zahlen/Labels
 * 
 * @author Alexander Wolf
 * @version 1.0
 */
var RotateBoxNodeRenderer = {
    /**
     * Rendert ein RotateBox Board mit wählbarem Style
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} board - RotateBoard object
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @param {number} size - Size of board in pixels
     * @param {number} scale - Viewport scale
     * @param {string} style - "grid" oder "compact" (default: "grid")
     */
    render(ctx, board, centerX, centerY, size, scale, style = "grid") {
        if (!board || !board.grid || !board.rows || !board.cols) return;

        if (style === "grid") {
            this.renderGrid(ctx, board, centerX, centerY, size, scale);
        } else if (style === "compact") {
            this.renderCompact(ctx, board, centerX, centerY, size, scale);
        }
    },

    /**
     * GRID STYLE: Solid colored blocks for each cell
     * Shows state visually: empty, filled, correct, wrong
     */
    renderGrid(ctx, board, centerX, centerY, size, scale) {
        if (!board || !board.grid || !board.rows || !board.cols) return;

        const rows = board.rows;
        const cols = board.cols;
        const cellSize = size / Math.max(rows, cols);
        const startX = centerX - (cols * cellSize) / 2;
        const startY = centerY - (rows * cellSize) / 2;

        ctx.save();

        // Color map for different states
        const COLORS = {
            empty: '#ecf0f1',      // Light gray
            filled: '#3498db',     // Blue
            correct: '#2ecc71',    // Green
            wrong: '#e74c3c'       // Red
        };

        // Draw grid
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = startX + c * cellSize;
                const y = startY + r * cellSize;
                const cell = board.grid[r][c];

                // Determine color based on cell state
                let color = COLORS.empty;
                if (cell === 1) color = COLORS.filled;
                else if (cell === 2) color = COLORS.correct;
                else if (cell === 3) color = COLORS.wrong;

                // Draw filled rectangle (NO BORDERS)
                ctx.fillStyle = color;
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }

        ctx.restore();
    },

    /**
     * COMPACT STYLE: Minimal representation with numbers only
     */
    renderCompact(ctx, board, centerX, centerY, size, scale) {
        if (!board || !board.grid || !board.rows || !board.cols) return;

        const rows = board.rows;
        const cols = board.cols;
        const cellSize = size / Math.max(rows, cols);
        const startX = centerX - (cols * cellSize) / 2;
        const startY = centerY - (rows * cellSize) / 2;

        ctx.save();

        // Just draw numbers/symbols for each cell
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = startX + c * cellSize;
                const y = startY + r * cellSize;
                const cell = board.grid[r][c];

                // Light background
                ctx.fillStyle = '#ecf0f1';
                ctx.fillRect(x, y, cellSize, cellSize);

                // Draw symbol
                let symbol = '';
                if (cell === 1) symbol = '■';
                else if (cell === 2) symbol = '✓';
                else if (cell === 3) symbol = '✗';

                if (symbol) {
                    ctx.fillStyle = '#000';
                    ctx.font = `bold ${cellSize * 0.5}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(symbol, x + cellSize / 2, y + cellSize / 2);
                }
            }
        }

        ctx.restore();
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.RotateBoxNodeRenderer = RotateBoxNodeRenderer;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RotateBoxNodeRenderer;
}
