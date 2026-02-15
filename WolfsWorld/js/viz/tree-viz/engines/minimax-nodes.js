/**
 * @fileoverview MinimaxNodeRenderer - Spezialisierter Renderer für Minimax/TicTacToe in Knoten
 * 
 * Rendert TicTacToe-Boards in Baum-Knoten mit Minimax-Metadaten:
 * - 3x3 Grid mit X/O Symbolen
 * - Minimax-Werte (Value, Alpha, Beta)
 * - Spezielle Markierungen für Best-Move und Pruned-Nodes
 * 
 * Wird von TreeRenderer.renderNode() aufgerufen, wenn boardType === 'minimax'.
 * 
 * @author Alexander Wolf
 * @version 1.0
 */

/**
 * MinimaxNodeRenderer - Rendert TicTacToe Board + Minimax-Werte in Knoten.
 * @namespace
 */
var MinimaxNodeRenderer = {
    /**
     * Rendert ein TicTacToe Board mit Minimax-Metadaten.
     * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
     * @param {Object} board - Board-Daten {grid, currentPlayer, size}.
     * @param {number} centerX - Zentrum X-Koordinate.
     * @param {number} centerY - Zentrum Y-Koordinate.
     * @param {number} size - Größe des Boards in Pixeln.
     * @param {number} scale - Viewport-Skalierung.
     * @param {Object} metadata - Minimax-Metadaten {value, alpha, beta, depth, isMaximizing}.
     */
    render(ctx, board, centerX, centerY, size, scale, metadata = {}) {
        if (!board || !board.grid) return;

        const boardSize = board.size || 3;
        const cellSize = size / boardSize;
        const startX = centerX - size / 2;
        const startY = centerY - size / 2;

        ctx.save();

        // Draw grid background
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(startX, startY, size, size);

        // Draw grid lines
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = Math.max(0.5, 2 / scale);
        
        for (let i = 1; i < boardSize; i++) {
            // Vertical lines
            const x = startX + i * cellSize;
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, startY + size);
            ctx.stroke();
            
            // Horizontal lines
            const y = startY + i * cellSize;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + size, y);
            ctx.stroke();
        }

        // Draw border
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = Math.max(0.5, 3 / scale);
        ctx.strokeRect(startX, startY, size, size);

        // Draw X and O symbols
        ctx.lineWidth = Math.max(1, 3 / scale);
        const symbolPadding = cellSize * 0.2;

        // Bestimme ob das letzte Symbol gehighlightet werden soll
        // (das ist das Symbol, das in diesem Knoten gesetzt wurde)
        const isLeafOrLastMove = !metadata || !metadata.hasChildren;

        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const index = r * boardSize + c;
                const value = board.grid[index];
                
                if (value === 0) continue;

                const x = startX + c * cellSize;
                const y = startY + r * cellSize;
                const cx = x + cellSize / 2;
                const cy = y + cellSize / 2;

                // Bestimme ob dieses Symbol das letzte ist
                // (einfache Heuristik: das zuletzt gesetzte Symbol in einem Leaf)
                const isLastSymbol = isLeafOrLastMove && index === board.grid.lastIndexOf(value);

                if (value === 1) {
                    // Draw O (blue) - Spieler 1
                    // Helleres Blau für letzten Zug
                    ctx.strokeStyle = isLastSymbol ? '#5dade2' : '#3498db';
                    ctx.lineWidth = isLastSymbol ? Math.max(2, 4 / scale) : Math.max(1, 3 / scale);
                    ctx.beginPath();
                    ctx.arc(cx, cy, cellSize / 2 - symbolPadding, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (value === 2) {
                    // Draw X (red) - Spieler 2
                    // Helleres Rot für letzten Zug
                    ctx.strokeStyle = isLastSymbol ? '#f5b7b1' : '#e74c3c';
                    ctx.lineWidth = isLastSymbol ? Math.max(2, 4 / scale) : Math.max(1, 3 / scale);
                    ctx.beginPath();
                    ctx.moveTo(x + symbolPadding, y + symbolPadding);
                    ctx.lineTo(x + cellSize - symbolPadding, y + cellSize - symbolPadding);
                    ctx.moveTo(x + cellSize - symbolPadding, y + symbolPadding);
                    ctx.lineTo(x + symbolPadding, y + cellSize - symbolPadding);
                    ctx.stroke();
                }
            }
        }

        // Draw minimax metadata (value, alpha, beta)
        if (metadata) {
            this.drawMetadata(ctx, centerX, centerY, size, metadata, scale);
        }

        ctx.restore();
    },

    /**
     * Zeichnet Minimax-Metadaten unterhalb des Boards.
     * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
     * @param {number} centerX - Zentrum X.
     * @param {number} centerY - Zentrum Y.
     * @param {number} size - Board-Größe.
     * @param {Object} metadata - Metadaten.
     * @param {number} scale - Viewport-Skalierung.
     */
    drawMetadata(ctx, centerX, centerY, size, metadata, scale) {
        const fontSize = Math.max(8, 12 / scale);
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textY = centerY + size / 2 + 5;
        
        // Value (einheitlich wie Minimax ohne ABP: Min/Max statt generischem V)
        if (metadata.value !== null && metadata.value !== undefined) {
            const rolePrefix = metadata.isMaximizing === true
                ? 'Max'
                : metadata.isMaximizing === false
                    ? 'Min'
                    : 'V';
            ctx.fillStyle = '#2c3e50';
            ctx.fillText(`${rolePrefix}: ${metadata.value.toFixed(2)}`, centerX, textY);
        }
        
        // Alpha/Beta (nur bei Alpha-Beta Algorithmus)
        if (metadata.alpha !== undefined && metadata.beta !== undefined) {
            const alphaBetaY = textY + fontSize + 2;
            ctx.fillStyle = '#7f8c8d';
            ctx.font = `${fontSize * 0.95}px monospace`;
            const alphaValue = metadata.alpha === -Infinity ? '-∞' : metadata.alpha.toFixed(1);
            const betaValue = metadata.beta === Infinity ? '∞' : metadata.beta.toFixed(1);
            ctx.fillText(`α:${alphaValue}|β:${betaValue}`, centerX, alphaBetaY);
        }

        // MIN/MAX Überschrift bewusst entfernt (redundant zu Level-Visualisierung)
    }
};

// Export for compatibility with tree-engine.js
if (typeof window !== 'undefined') {
    window.MinimaxNodeRenderer = MinimaxNodeRenderer;
}
