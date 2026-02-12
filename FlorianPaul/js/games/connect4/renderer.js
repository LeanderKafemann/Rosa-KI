/**
 * @fileoverview Renderer collection for Connect 4 variants.
 */

const Connect4Renderer = {
    
    /**
     * Draws standard Connect 4 board.
     * @param {HTMLCanvasElement} canvas 
     * @param {Connect4Regular} game 
     */
    drawRegular(canvas, game) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const cols = game.cols;
        const rows = game.rows;

        // Cell size
        const s = Math.min(w / cols, h / rows);
        const offsetX = (w - s * cols) / 2;
        const offsetY = (h - s * rows) / 2;

        ctx.clearRect(0, 0, w, h);
        
        // Background (Yellow board)
        ctx.fillStyle = "#f1c40f"; 
        ctx.fillRect(offsetX, offsetY, s * cols, s * rows);

        // Holes / Pieces
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cx = offsetX + c * s + s/2;
                const cy = offsetY + r * s + s/2;
                const rCell = s * 0.4;
                
                const idx = r * cols + c;
                const val = game.grid[idx];

                ctx.beginPath();
                ctx.arc(cx, cy, rCell, 0, Math.PI * 2);
                
                if (val === 0) {
                    ctx.fillStyle = "white"; // Empty hole
                } else if (val === 1) {
                    ctx.fillStyle = "#3498db"; // Player 1 (Blue)
                } else if (val === 2) {
                    ctx.fillStyle = "#e74c3c"; // Player 2 (Red)
                }
                ctx.fill();
                ctx.strokeStyle = "#d4ac0d"; // Darker yellow for outline
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    },

    /**
     * Draws standard 3D Connect 4 board (slices).
     * Includes Top View (Z-Slices) and Side View (X-Slices).
     * @param {HTMLCanvasElement} canvas 
     * @param {Connect43D} game 
     */
    draw3D(canvas, game) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const s = game.size; // 4

        ctx.clearRect(0,0,w,h);

        const pad = 10;
        
        // --- 1. Top View (Z Slices) ---
        // Arrange side by side: Z0 Z1 Z2 Z3
        
        // Width of one board
        const boardW = (w - pad * (s + 1)) / s;
        const boardH = boardW; // Square 4x4
        
        const topY = 40; // Margin for label

        // Draw Z Plans
        for (let z = 0; z < s; z++) {
            const startX = pad + z * (boardW + pad);

            // Label
            ctx.fillStyle = "#2c3e50";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Ebene Y=${z+1} (von vorne)`, startX + boardW/2, topY - 10);
            
            // Side Label (Z=1...Z=4) Left of the grid? 
            // The user asked "Label the rows left with Z=1...Z=4 both top and bottom".
            // Since top view is X-Y (technically X-Z in original, but now named Y), 
            // the rows within a grid are "Height".
            // It seems "Z" is now the depth slice? user says "Replace Z with Y".
            // If "Ebene Y=..." acts as the slice index.
            
            this.drawGrid(ctx, startX, topY, boardW, boardH, s);
            
            // Draw Pieces of Z-Slice
            for (let y = 0; y < s; y++) {
                const vizY = s - 1 - y; // Bottom y=0 is drawn at bottom
                // Row Label on the left of each board? Only needed for the first board or all?
                // "Beschrifte die Reihen links mit Z=1...Z=4"
                if (z === 0) {
                     ctx.fillStyle = "#333";
                     ctx.font = "12px sans-serif";
                     ctx.textAlign = "right";
                     // Rows inside the grid are Y coordinates (Height)
                     // If user wants Z=1..4 labeling rows, then they consider Height as Z?
                     // Confusing. Let's assume they mean Y=1..4 (Height).
                     // But bullet says "Ersetze Z durch Y".
                     // And "Row label left with Z=1..Z=4".
                     // This implies Height is Z. And Depth is Y.
                     ctx.fillText(`Z=${y+1}`, startX - 5, topY + vizY*(boardH/s) + (boardH/s)/2 + 4);
                }

                for (let x = 0; x < s; x++) {
                    const idx = game.getIdx(x, y, z);
                    const val = game.grid[idx];
                    this.drawPiece(ctx, startX, topY, boardW, s, x, vizY, val);
                }
            }
        }
        
        // --- 2. Side View (X Slices) ---
        // Display X-Slices below. X0 X1 X2 X3.
        // This shows Y vs Z for a fixed X. (Height vs Depth)
        // If Depth is Y now. And Height is Z.
        
        const secondY = topY + boardH + 60; // Offset
        
        for (let x = 0; x < s; x++) {
            const startX = pad + x * (boardW + pad);

            // Label
            ctx.fillStyle = "#2c3e50";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Seite X=${x+1} (von Seite)`, startX + boardW/2, secondY - 10);

            this.drawGrid(ctx, startX, secondY, boardW, boardH, s);

            for (let y = 0; y < s; y++) { // Height (Z according to row label instruction)
                 const vizY = s - 1 - y;
                 // Label rows again
                 if (x === 0) {
                     ctx.fillStyle = "#333";
                     ctx.font = "12px sans-serif";
                     ctx.textAlign = "right";
                     ctx.fillText(`Z=${y+1}`, startX - 5, secondY + vizY*(boardH/s) + (boardH/s)/2 + 4);
                 }

                 for (let z = 0; z < s; z++) { // Depth (Y according to slice instruction)
                     const idx = game.getIdx(x, y, z);
                     const val = game.grid[idx];
                     // In side view, x is fixed. We draw Z (Depth) on x-axis of grid?
                     // Standard Side View: columns are Z slices?
                     this.drawPiece(ctx, startX, secondY, boardW, s, z, vizY, val);
                 }
            }
        }
    },

    /** Helper to draw a generic 4x4 grid background */
    drawGrid(ctx, x, y, w, h, s) {
        // Background
        ctx.fillStyle = "#ecf0f1";
        ctx.fillRect(x, y, w, h);

        const cellS = w / s;

        // Grid lines
        ctx.strokeStyle = "#bdc3c7";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= s; i++) {
            // Verts
            ctx.moveTo(x + i * cellS, y);
            ctx.lineTo(x + i * cellS, y + h);
            // Horis
            ctx.moveTo(x, y + i * cellS);
            ctx.lineTo(x + w, y + i * cellS);
        }
        ctx.stroke();
    },

    /** Helper to draw a piece on the grid */
    drawPiece(ctx, bx, by, bw, s, gx, gy, val) {
        if (val === 0) return;
        
        const cellS = bw / s;
        const cx = bx + gx * cellS + cellS/2;
        const cy = by + gy * cellS + cellS/2;
        const r = cellS * 0.35;
        
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        // P1=Blue, P2=Red
        ctx.fillStyle = val === 1 ? "#3498db" : "#e74c3c";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.stroke();
    },

    /**
     * Helper to get click coordinates for 3D view.
     * Only reacts to clicks on the Top View (Z-Slices).
     * Returns {x, z} or null.
     */
    get3DClick(canvas, evt, game) {
        const rect = canvas.getBoundingClientRect();
        const mx = evt.clientX - rect.left;
        const my = evt.clientY - rect.top;
        
        const w = canvas.width;
        const s = game.size;
        const pad = 10;
        const boardW = (w - pad * (s + 1)) / s;
        // The top view starts at Y=40 (approx based on draw3D)
        const topY = 40;
        const boardH = boardW;

        if (my < topY || my > topY + boardH) return null;

        for (let z = 0; z < s; z++) {
             const startX = pad + z * (boardW + pad);
             if (mx >= startX && mx <= startX + boardW) {
                 // Found the Z plane
                 const x = Math.floor((mx - startX) / (boardW / s));
                 if (x >= 0 && x < s) {
                     return { x, z };
                 }
             }
        }
        return null;
    }
};
