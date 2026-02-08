/**
 * @fileoverview RotateBoxNodeRenderer - Spezialisierter Renderer für RotateBox Boards in Tree-Nodes
 * 
 * Rendert RotateBox-Puzzle-Boards in Baum-Knoten
 * Zeigt Blöcke mit Farben und fallOffsets-Animationen
 * 
 * Wird von TreeRenderer.renderBoardNode() aufgerufen, wenn boardData vorhanden ist.
 * 
 * @author Alexander Wolf
 * @version 2.0
 */
var RotateBoxNodeRenderer = {
    /**
     * Rendert ein RotateBox Board
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} board - RotateBoard object
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @param {number} size - Size of board in pixels
     * @param {number} scale - Viewport scale
     */
    render(ctx, board, centerX, centerY, size, scale) {
        if (!board || !board.grid || !board.rows || !board.cols) return;

        const COLORS = [
            '#e74c3c', '#2ecc71', '#f1c40f', '#3498db',
            '#e67e22', '#9b59b6', '#1abc9c', '#bdc3c7'
        ];

        const rows = board.rows;
        const cols = board.cols;
        const cellSize = Math.min(size / rows, size / cols);
        const boardWidth = cols * cellSize;
        const boardHeight = rows * cellSize;
        const startX = centerX - boardWidth / 2;
        const startY = centerY - boardHeight / 2;

        ctx.save();

        // Draw grid
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = startX + c * cellSize;
                const y = startY + r * cellSize;
                const v = board.grid[r][c];

                // Empty cell
                if (v === -2) {
                    ctx.fillStyle = '#2c3e50';
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
                // Goal cell
                else if (v === -3) {
                    ctx.fillStyle = '#ecf0f1';
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
                // Piece
                else if (v >= 0) {
                    const off = (board.fallOffsets && board.fallOffsets[v]) ? board.fallOffsets[v] : 0;
                    ctx.fillStyle = COLORS[v % COLORS.length];
                    ctx.fillRect(x + 1, y - (off * cellSize) + 1, cellSize - 2, cellSize - 2);
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
