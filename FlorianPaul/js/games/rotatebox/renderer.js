/**
 * @fileoverview Renderer und Animations-Logik für RotateBox.
 */

const COLORS = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#bdc3c7', '#34495e', '#f39c12'];

/**
 * Zeichnet das Board auf den Canvas.
 * @param {RotateBoard} board - Das Spielbrett.
 * @param {HTMLCanvasElement} canvas - Das Canvas-Element.
 * @param {CanvasRenderingContext2D} ctx - Der Kontext.
 */
function drawRotateBoard(board, canvas, ctx) {
    if (!board || !board.grid) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 40; 
    const maxDim = Math.max(board.rows, board.cols);
    
    if (maxDim === 0) return;

    const bs = (canvas.width - padding) / maxDim; 
    const ox = (canvas.width - (board.cols * bs)) / 2;
    const oy = (canvas.height - (board.rows * bs)) / 2;

    for (let r = 0; r < board.rows; r++) {
        for (let c = 0; c < board.cols; c++) {
            const v = board.grid[r][c];
            const x = ox + c * bs;
            const y = oy + r * bs;
            
            if (v === -2) { 
                ctx.fillStyle = '#2c3e50'; 
                ctx.fillRect(x, y, bs, bs); 
            } else if (v === -3) { 
                ctx.fillStyle = '#ecf0f1'; 
                ctx.fillRect(x, y, bs, bs);
                ctx.strokeStyle = '#e74c3c'; 
                ctx.lineWidth = 2; 
                ctx.strokeRect(x+2, y+2, bs-4, bs-4);
            } else if (v >= 0) {
                // Animation Offset beachten
                const off = (board.fallOffsets && board.fallOffsets[v]) ? board.fallOffsets[v] : 0;
                ctx.fillStyle = COLORS[v % COLORS.length];
                ctx.fillRect(x + 1, y - (off * bs) + 1, bs - 2, bs - 2);
            }
        }
    }
}

/**
 * Animiert das Fallen der Blöcke.
 * @param {RotateBoard} board 
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} speed - Dummy parameter, Geschwindigkeit ist hardcoded.
 * @param {function} renderCallback - Callback zum Neuzeichnen nach jedem Frame.
 * @returns {Promise<void>}
 */
async function animateRelax(board, canvas, ctx, speed, renderCallback) {
    board.isFalling = true;
    let changed = true;
    while (changed) {
        changed = false;
        let toFall = new Set();
        // Identifizieren
        for (let r = 0; r < board.rows; r++) {
            for (let c = 0; c < board.cols; c++) {
                const id = board.grid[r][c];
                if (id >= 0 && !toFall.has(id) && board.canFall(id)) toFall.add(id);
            }
        }
        // Animieren
        if (toFall.size > 0) {
            changed = true;
            // Logik update
            toFall.forEach(id => board.moveDown(id));
            
            // Visuelle Interpolation
            await new Promise(res => {
                let off = 1.0;
                function frame() {
                    off -= 0.15;
                    toFall.forEach(id => board.fallOffsets[id] = off);
                    renderCallback();
                    if (off > 0) requestAnimationFrame(frame);
                    else { 
                        toFall.forEach(id => delete board.fallOffsets[id]); 
                        res(); 
                    }
                }
                frame();
            });
        }
    }
    board.isFalling = false;
}