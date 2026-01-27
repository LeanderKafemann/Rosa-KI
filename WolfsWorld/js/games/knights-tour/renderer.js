/**
 * @fileoverview Renderer für das Springerproblem.
 * Zeichnet das Brett mit einem verbesserten Farbschema.
 */

const KnightRenderer = {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {KnightBoard} board 
     * @param {Object} config 
     */
    draw(canvas, board, config = {}) {
        const ctx = canvas.getContext('2d');
        const size = board.size;
        const showMoves = config.showPossibleMoves || false;
        const showWarnsdorf = config.showWarnsdorf || false;
        
        // --- NEUES FARBSCHEMA ---
        const COLORS = {
            bg: '#ffffff',
            cellEven: '#ecf0f1', // Helles Grau
            cellOdd:  '#bdc3c7', // Dunkleres Grau
            visited:  '#2ecc71', // Grün (angenehm)
            visitedText: '#ffffff',
            current:  '#e67e22', // Orange für den Springer
            possible: 'rgba(52, 152, 219, 0.6)', // Blau transparent
            warnsdorfText: '#3498db', // Blau für Zahlen
            coord:    '#7f8c8d'
        };

        // Layout
        const paddingLeft = 30;
        const paddingBottom = 30;
        const availWidth = canvas.width - paddingLeft;
        const availHeight = canvas.height - paddingBottom;
        const cellSize = Math.min(availWidth, availHeight) / size;

        // Reset
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. Koordinaten (A-H, 1-8)
        ctx.fillStyle = COLORS.coord;
        ctx.font = "12px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for(let i=0; i<size; i++) {
            // Buchstaben unten
            const char = String.fromCharCode(65 + i); 
            ctx.fillText(char, paddingLeft + i * cellSize + cellSize/2, canvas.height - (paddingBottom / 2));
            // Zahlen links
            const num = size - i; 
            ctx.fillText(num, paddingLeft / 2, i * cellSize + cellSize/2);
        }

        // Canvas verschieben für das Grid
        ctx.save();
        ctx.translate(paddingLeft, 0);

        // 2. Gitter & Zellen zeichnen
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const x = c * cellSize;
                const y = r * cellSize;
                const val = board.grid[r][c];

                // Grundfarbe (Schachbrett)
                if ((r + c) % 2 === 0) ctx.fillStyle = COLORS.cellEven;
                else ctx.fillStyle = COLORS.cellOdd;
                ctx.fillRect(x, y, cellSize, cellSize);

                // Besuchte Felder
                if (val > 0) {
                    // Verblassen alter Züge leicht, damit der Pfad sichtbar ist?
                    // Nein, lieber klarer Kontrast.
                    ctx.fillStyle = COLORS.visited;
                    // Mache es etwas kleiner als die Zelle für schöneren Look
                    const pad = 2;
                    ctx.fillRect(x + pad, y + pad, cellSize - pad*2, cellSize - pad*2);
                    
                    // Zugnummer
                    ctx.fillStyle = COLORS.visitedText;
                    ctx.font = `bold ${cellSize * 0.4}px sans-serif`;
                    ctx.fillText(val, x + cellSize/2, y + cellSize/2);
                }
            }
        }

        // 3. Mögliche Züge (Vorschau)
        if (showMoves && !board.won && !config.hideHints) {
            const moves = board.getPossibleMoves();
            
            if (showWarnsdorf) {
                // Zeige Warnsdorf-Zahlen statt Punkte
                moves.forEach(m => {
                    const cx = m.c * cellSize + cellSize/2;
                    const cy = m.r * cellSize + cellSize/2;
                    const degree = board.getDegree(m.r, m.c);
                    
                    ctx.fillStyle = COLORS.warnsdorfText;
                    ctx.font = `bold ${cellSize * 0.35}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(degree, cx, cy);
                });
            } else {
                // Zeige blaue Punkte
                moves.forEach(m => {
                    const cx = m.c * cellSize + cellSize/2;
                    const cy = m.r * cellSize + cellSize/2;
                    
                    ctx.beginPath();
                    ctx.fillStyle = COLORS.possible;
                    ctx.arc(cx, cy, cellSize * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        }

        // 4. Springer (Aktuelle Position)
        if (board.currentPos) {
            const { r, c } = board.currentPos;
            const x = c * cellSize;
            const y = r * cellSize;

            // Highlight Box
            ctx.fillStyle = COLORS.current;
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Springer Icon
            ctx.fillStyle = "white";
            ctx.font = `${cellSize * 0.7}px serif`;
            ctx.fillText("♞", x + cellSize/2, y + cellSize/2 + 2);
        }

        ctx.restore();
    }
};