/**
 * @fileoverview Renderer-Sammlung für alle Tic-Tac-Toe Varianten
 * 
 * Bietet spezialierte Render-Funktionen für die 3 TTT-Varianten:
 * - drawRegular: Klassisches 3x3 Board
 * - drawUltimate: 9x9 Board mit Makro/Mikro-Struktur  
 * - draw3DSlices: 3D Board als Schicht-Views
 * - drawIsoView: Isometrische 3D-Projektion
 * 
 * @namespace TTTRenderer
 * @author Alexander Wolf
 * @version 2.0
 */

const TTTRenderer = {
    /**
     * Prüft, ob Renderer-Debug ausgegeben werden soll.
     * @param {'debug'|'warn'|'error'|'critical'} level
     * @returns {boolean}
     */
    _shouldLog(level = 'debug') {
        if (typeof window === 'undefined' || !window.DebugConfig || !window.DEBUG_DOMAINS) {
            return level === 'error' || level === 'critical';
        }
        return window.DebugConfig.shouldLog(window.DEBUG_DOMAINS.TTT_RENDERER, level);
    },

    /**
     * Schreibt einen Debug-Logeintrag des Renderers.
     * @param {'debug'|'warn'|'error'|'critical'} level
     * @param {...any} args
     */
    _log(level, ...args) {
        if (!this._shouldLog(level)) return;
        if (level === 'warn') {
            console.warn(...args);
            return;
        }
        if (level === 'error' || level === 'critical') {
            console.error(...args);
            return;
        }
        console.log(...args);
    },
    
    /**
     * Zeichnet das klassische 3x3 Board.
     * @param {HTMLCanvasElement} canvas - Canvas-Element zum Zeichnen
     * @param {TTTRegularBoard} game - Spiel-Zustand mit Grid und Winner
     * @returns {void}
     */
    drawRegular(canvas, game) {
        this._log('debug', '🖌️ TTTRenderer.drawRegular() aufgerufen');
        this._log('debug', '   - Canvas:', canvas.width, 'x', canvas.height);
        this._log('debug', '   - game:', game);
        this._log('debug', '   - game.grid:', game?.grid);
        
        if (!canvas || !game) {
            this._log('error', '❌ FEH LER: Canvas oder game ist null/undefined!');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const s = w / 3;

        ctx.clearRect(0, 0, w, h);
        this._log('debug', '✅ Canvas gelöscht');
        
        // Gitterlinien
        ctx.strokeStyle = "#2c3e50"; 
        ctx.lineWidth = 6; 
        ctx.lineCap = "round";
        
        ctx.beginPath();
        ctx.moveTo(s, 10); ctx.lineTo(s, h-10); 
        ctx.moveTo(s*2, 10); ctx.lineTo(s*2, h-10);
        ctx.moveTo(10, s); ctx.lineTo(w-10, s); 
        ctx.moveTo(10, s*2); ctx.lineTo(w-10, s*2);
        ctx.stroke();
        this._log('debug', '✅ Gitterlinien gezeichnet');

        // Symbole
        for(let i=0; i<9; i++) {
            if(game.grid[i] === 0) continue;
            const cx = (i % 3) * s + s/2;
            const cy = Math.floor(i / 3) * s + s/2;
            this._log('debug', `   - Zeichne Symbol an Position ${i}: (${cx}, ${cy}) für Wert ${game.grid[i]}`);
            this._drawSymbol(ctx, cx, cy, s/3.5, game.grid[i]);
        }
        this._log('debug', '✅ Symbole gezeichnet');
    },

    /**
     * Zeichnet das Ultimate TTT Board (9x9 mit Makro/Mikro-Struktur).
     * @param {HTMLCanvasElement} canvas - Canvas-Element zum Zeichnen
     * @param {UltimateBoard} game - Ultimates Spiel mit macroBoard und grids Array
     * @returns {void}
     */
    drawUltimate(canvas, game) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const bigS = w / 3;
        const smallS = bigS / 3;

        ctx.clearRect(0, 0, w, h);

        // 1. Highlights: Wo darf gespielt werden?
        if (game.winner === 0) {
            if (game.nextBoardIdx !== -1) {
                // Bestimmtes Board highlighten
                const bx = (game.nextBoardIdx % 3) * bigS;
                const by = Math.floor(game.nextBoardIdx / 3) * bigS;
                ctx.fillStyle = "#eafaed"; // Hellgrün
                ctx.fillRect(bx, by, bigS, bigS);
            } else {
                // Freie Wahl -> Alles leicht grün
                ctx.fillStyle = "#eafaed"; 
                ctx.fillRect(0,0,w,h);
            }
        }

        // 2. Makro-Board Status (Farbige Hintergründe für gewonnene Boards)
        for (let i=0; i<9; i++) {
            const bx = (i%3)*bigS;
            const by = Math.floor(i/3)*bigS;
            
            if (game.macroBoard[i] !== 0) {
                const winner = game.macroBoard[i];
                
                // Hintergrundfarbe transparent
                if (winner === 1) ctx.fillStyle = "rgba(52, 152, 219, 0.15)"; // Blau
                else if (winner === 2) ctx.fillStyle = "rgba(231, 76, 60, 0.15)"; // Rot
                else ctx.fillStyle = "rgba(127, 140, 141, 0.2)"; // Grau/Remis
                
                ctx.fillRect(bx, by, bigS, bigS);
                
                // Großes Symbol darüber zeichnen (sehr transparent)
                ctx.save();
                ctx.globalAlpha = 0.3; 
                this._drawSymbol(ctx, bx+bigS/2, by+bigS/2, bigS/3, winner, 15);
                ctx.restore();
            }
        }

        // 3. Kleines Gitter (Dünn)
        ctx.lineWidth = 1; 
        ctx.strokeStyle = "#bdc3c7";
        ctx.beginPath();
        for (let i=1; i<9; i++) {
            if (i%3===0) continue; 
            ctx.moveTo(i*smallS, 0); ctx.lineTo(i*smallS, h);
            ctx.moveTo(0, i*smallS); ctx.lineTo(w, i*smallS);
        }
        ctx.stroke();

        // 4. Großes Gitter (Dick)
        ctx.lineWidth = 4; 
        ctx.strokeStyle = "#2c3e50";
        ctx.beginPath();
        for (let i=1; i<=2; i++) {
            ctx.moveTo(i*bigS, 0); ctx.lineTo(i*bigS, h);
            ctx.moveTo(0, i*bigS); ctx.lineTo(w, i*bigS);
        }
        ctx.stroke();

        // 5. Kleine Spielsteine
        for (let b=0; b<9; b++) {
            for (let s=0; s<9; s++) {
                if (game.boards[b][s] === 0) continue;
                const bx = (b%3)*bigS; 
                const by = Math.floor(b/3)*bigS;
                const sx = (s%3)*smallS; 
                const sy = Math.floor(s/3)*smallS;
                
                this._drawSymbol(ctx, bx+sx+smallS/2, by+sy+smallS/2, smallS/3, game.boards[b][s], 3);
            }
        }
    },

    /**
     * Zeichnet die 2D-Schnittebenen (Slices) für das 3D-Spiel.
     * @param {HTMLCanvasElement} canvas 
     * @param {TTT3DBoard} game 
     * @param {string} axis - 'x', 'y' oder 'z'.
     */
    draw3DSlices(canvas, game, axis) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const s = game.size; 

        ctx.clearRect(0,0,w,h);
        
        // Layout-Konstanten (Müssen mit Controller-Hit-Detection übereinstimmen!)
        const padding = 20;
        const availW = w - (padding*2);
        const availH = h - (padding*2);
        // Boxgröße so berechnen, dass s Boxen nebeneinander passen
        const boxSize = Math.min(availW / s, availH);
        const gap = boxSize * 0.1;
        const boardSize = boxSize - gap;
        
        const totalW = s * boxSize;
        const startX = (w - totalW) / 2 + gap/2;
        const startY = (h - boardSize) / 2 + 10;

        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";

        const sliceName = (axis === 'z') ? 'Z' : (axis === 'y') ? 'Y' : 'X';
        
        for (let k = 0; k < s; k++) {
            const ox = startX + k * boxSize;
            const oy = startY;

            // Label
            ctx.fillStyle = "#2c3e50"; 
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(`${sliceName}${k+1}`, ox + boardSize/2, oy - 15);

            // Hintergrund
            ctx.fillStyle = "#ecf0f1"; 
            ctx.fillRect(ox, oy, boardSize, boardSize);
            ctx.strokeStyle = "#bdc3c7"; 
            ctx.lineWidth = 2; 
            ctx.strokeRect(ox, oy, boardSize, boardSize);

            // Gitterlinien
            const cellS = boardSize / s;
            ctx.beginPath();
            for(let i=1; i<s; i++) {
                ctx.moveTo(ox + i*cellS, oy); ctx.lineTo(ox + i*cellS, oy + boardSize);
                ctx.moveTo(ox, oy + i*cellS); ctx.lineTo(ox + boardSize, oy + i*cellS);
            }
            ctx.stroke();

            // Inhalte
            for(let r=0; r<s; r++) { 
                for(let c=0; c<s; c++) { 
                    // Koordinaten Mapping
                    let x, y, z;
                    if (axis === 'z') { z = k; y = r; x = c; } 
                    else if (axis === 'y') { y = k; x = c; z = (s - 1) - r; } 
                    else { x = k; y = c; z = (s - 1) - r; }

                    const idx = z*(s*s) + y*s + x;
                    const val = game.grid[idx];

                    if (val !== 0) {
                        const cx = ox + c*cellS + cellS/2;
                        const cy = oy + r*cellS + cellS/2;
                        this._drawSymbol(ctx, cx, cy, cellS/3.5, val, 3);
                    }
                }
            }
        }
    },

    /**
     * Zeichnet die isometrische 3D Ansicht.
     * @param {HTMLCanvasElement} canvas 
     * @param {TTT3DBoard} game 
     */
    drawIsoView(canvas, game) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const s = game.size;

        ctx.clearRect(0,0,w,h);

        let boardSize = w * 0.55; 
        if (s === 4) boardSize = w * 0.45;

        const offX = boardSize * 0.2;
        const offY = -boardSize * 0.4;
        
        const startX = (w - (boardSize + (s-1)*offX))/2 + 20;
        const startY = h - 50;

        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "right"; 
        ctx.textBaseline = "middle";

        // Zeichnen von hinten (z=0) nach vorne (z=s-1)
        for (let z=0; z<s; z++) {
            const ox = startX + z * offX;
            const oy = startY + z * offY;

            // Transparenz für Tiefeneffekt
            ctx.save();
            // Hintere Ebenen transparenter
            ctx.globalAlpha = 0.4 + (0.6 * (z+1)/s);

            // Label
            ctx.fillStyle = "#7f8c8d";
            ctx.fillText(`z${z+1}`, ox - 10, oy + 20);

            // Ebene Boden
            ctx.fillStyle = "rgba(52, 152, 219, 0.05)"; 
            ctx.fillRect(ox, oy - boardSize, boardSize, boardSize);
            ctx.strokeStyle = "rgba(44, 62, 80, 0.2)"; 
            ctx.lineWidth = 1; 
            ctx.strokeRect(ox, oy - boardSize, boardSize, boardSize);

            // Gitterlinien
            const cellS = boardSize / s;
            ctx.beginPath();
            for(let i=1; i<s; i++) {
                ctx.moveTo(ox + i*cellS, oy); ctx.lineTo(ox + i*cellS, oy - boardSize);
                ctx.moveTo(ox, oy - i*cellS); ctx.lineTo(ox + boardSize, oy - i*cellS);
            }
            ctx.stroke();

            // Steine
            for(let y=0; y<s; y++) {
                for(let x=0; x<s; x++) {
                    const idx = z*(s*s) + y*s + x;
                    const val = game.grid[idx];
                    
                    if (val !== 0) {
                        const cx = ox + x*cellS + cellS/2;
                        const cy = (oy - boardSize) + y*cellS + cellS/2;
                        const r = cellS/3.5;

                        // Kleiner Schatten
                        ctx.fillStyle = "rgba(0,0,0,0.1)";
                        ctx.beginPath(); ctx.arc(cx+2, cy+2, r, 0, Math.PI*2); ctx.fill();

                        this._drawSymbol(ctx, cx, cy, r, val, 2);
                    }
                }
            }
            ctx.restore();
        }
    },

    /**
     * Interner Helfer: Zeichnet Kreis (1) oder Kreuz (2).
     */
    _drawSymbol(ctx, x, y, r, player, lw=5) {
        ctx.lineWidth = lw;
        if (player === 1) { // Blau
            ctx.strokeStyle = "#3498db"; 
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
        } else if (player === 2) { // Rot
            ctx.strokeStyle = "#e74c3c"; 
            ctx.beginPath(); 
            ctx.moveTo(x-r, y-r); ctx.lineTo(x+r, y+r);
            ctx.moveTo(x+r, y-r); ctx.lineTo(x-r, y+r); 
            ctx.stroke();
        }
    }
};