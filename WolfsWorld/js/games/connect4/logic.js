
// Spieler- und Status-Konstanten
/**
 * Kein Gewinner / Spiel läuft
 * @constant {number}
 */
const NONE = 0;
/**
 * Spieler 1 (Blau/Kreis)
 * @constant {number}
 */
const PLAYER1 = 1;
/**
 * Spieler 2 (Rot/Kreuz)
 * @constant {number}
 */
const PLAYER2 = 2;
/**
 * Unentschieden
 * @constant {number}
 */
const DRAW = 3;
/**
 * Leeres Feld
 * @constant {number}
 */
const CELL_EMPTY = 0;
/**
 * Ungültiger Index
 * @constant {number}
 */
const INVALID_INDEX = -1;

/**
 * Spiellogik für Connect 4 und Connect 4 3D.
 * Implementiert die GameState-Interface-Konzepte.
 * @fileoverview
 */

class Connect4Base {
    constructor() {
        this.currentPlayer = PLAYER1;
        this.winner = NONE; // 0 = running, 1 = p1, 2 = p2, 3 = draw
    }

    switchPlayer() {
        this.currentPlayer = (this.currentPlayer === PLAYER1) ? PLAYER2 : PLAYER1;
    }
}

/**
 * Standard Connect 4 (6 rows, 7 columns default).
 * Grid is standard reading order or maybe row-major.
 * Let's use row-major for simplicity in drawing, but move logic is column-based.
 * Rows 0..5, Cols 0..6.
 * 0,0 is top-left usually for rendering, but for gravity bottom-up is easier?
 * Let's use 0 = top, 5 = bottom. Gravity fills 5 then 4...
 */
class Connect4Regular extends Connect4Base {
    constructor(rows = 6, cols = 7) {
        super();
        this.rows = rows;
        this.cols = cols;
        // 0 = empty, 1 = p1, 2 = p2
        this.grid = Array(rows * cols).fill(CELL_EMPTY);
    }

    /**
     * Returns valid moves (columns that are not full).
     * @returns {number[]} list of column indices (0..cols-1)
     */
    getAllValidMoves() {
        const moves = [];
        if (this.winner !== NONE) return moves;

        for (let c = 0; c < this.cols; c++) {
            // Check if top cell is empty
            if (this.grid[c] === CELL_EMPTY) {
                moves.push(c);
            }
        }
        return moves;
    }

    /**
     * Makes a move in the given column.
     * @param {number} col 
     * @returns {boolean}
     */
    makeMove(col) {
        if (this.winner !== NONE || col < 0 || col >= this.cols) return false;

        // Find lowest empty row in col
        // grid index = row * cols + col
        let foundRow = INVALID_INDEX;
        for (let r = this.rows - 1; r >= 0; r--) {
            const idx = r * this.cols + col;
            if (this.grid[idx] === CELL_EMPTY) {
                foundRow = r;
                break;
            }
        }

        if (foundRow === INVALID_INDEX) return false; // Column full

        this.grid[foundRow * this.cols + col] = this.currentPlayer;
        this.checkWin(foundRow, col);
        
        if (this.winner === NONE) {
            // Check draw (board full)
            if (!this.grid.includes(CELL_EMPTY)) {
                this.winner = DRAW;
            } else {
                this.switchPlayer();
            }
        }
        return true;
    }

    checkWin(lastR, lastC) {
        // Check directions around last placed piece
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal \
            [1, -1]  // Diagonal /
        ];

        const player = this.grid[lastR * this.cols + lastC];

        for (const [dr, dc] of directions) {
            let count = 1;
            
            // Positive direction
            for (let i = 1; i < 4; i++) {
                const r = lastR + dr * i;
                const c = lastC + dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) break;
                if (this.grid[r * this.cols + c] === player) count++;
                else break;
            }

            // Negative direction
            for (let i = 1; i < 4; i++) {
                const r = lastR - dr * i;
                const c = lastC - dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) break;
                if (this.grid[r * this.cols + c] === player) count++;
                else break;
            }

            if (count >= 4) {
                this.winner = player;
                return;
            }
        }
    }
    
    // For cloning if needed by Minimax (if not using adapter)
    clone() {
        const copy = new Connect4Regular(this.rows, this.cols);
        copy.grid = [...this.grid];
        copy.currentPlayer = this.currentPlayer;
        copy.winner = this.winner;
        return copy;
    }
}

/**
 * 3D Connect 4 (4x4x4).
 * Grid: 4 planes (z), each 4 rows (y), 4 cols (x).
 * Gravity applies along Y (vertical).
 * Players place checks on a pole (xz position).
 * Dimensions: X=4, Z=4 (Base), Y=4 (Height).
 */
class Connect43D extends Connect4Base {
    constructor(size = 4) {
        super();
        this.size = size;
        // Flat array. Index = y * size*size + z * size + x
        // or x + z*size + y*size*size
        // Let's stick to standard: x, y, z.
        // We want gravity on Y. So we select X and Z.
        this.grid = Array(size * size * size).fill(CELL_EMPTY);
    }

    getIdx(x, y, z) {
        // y is height (0..3). 0 is bottom.
        return y * this.size * this.size + z * this.size + x;
    }

    getAllValidMoves() {
        const moves = []; // encoded as x + z * size usually?
        if (this.winner !== NONE) return moves;

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                // Check if top is empty (y=size-1)
                const topIdx = this.getIdx(x, this.size - 1, z);
                if (this.grid[topIdx] === CELL_EMPTY) {
                    moves.push(x + z * this.size); // Move ID
                }
            }
        }
        return moves;
    }

    makeMove(moveId) {
        if (this.winner !== NONE) return false;

        const x = moveId % this.size;
        const z = Math.floor(moveId / this.size);

        // Find first empty y from bottom (0)
        let foundY = INVALID_INDEX;
        for (let y = 0; y < this.size; y++) {
            const idx = this.getIdx(x, y, z);
            if (this.grid[idx] === CELL_EMPTY) {
                foundY = y;
                break;
            }
        }

        if (foundY === INVALID_INDEX) return false;

        const idx = this.getIdx(x, foundY, z);
        this.grid[idx] = this.currentPlayer;
        
        this.checkWin(x, foundY, z);

        if (this.winner === NONE) {
            if (!this.grid.includes(CELL_EMPTY)) this.winner = DRAW;
            else this.switchPlayer();
        }
        return true;
    }

    checkWin(lx, ly, lz) {
        // Need to check all 3D lines passing through lx, ly, lz.
        // Directions: (dx, dy, dz) in {-1, 0, 1}, excluding (0,0,0)
        // There are 13 unique directions (26 neighbors / 2).
        
        const player = this.grid[this.getIdx(lx, ly, lz)];
        
        // Iterate all 13 vectors
        const directions = [];
        for(let dx=-1; dx<=1; dx++) {
            for(let dy=-1; dy<=1; dy++) {
                for(let dz=-1; dz<=1; dz++) {
                    if (dx===0 && dy===0 && dz===0) continue;
                    // Only add if not already added (ignore negative partner)
                    // We can just iterate all and divide by 2 or be smart.
                    // simpler: iterate all, handled by the loop logic below naturally or just iterate positive hemisphere.
                    // Let's just list 13.
                    directions.push([dx, dy, dz]); 
                }
            }
        }

        // We only need unique lines.
        // Actually, just checking all directions is fine with the "negative/positive" loop used in regular C4.
        // But need to be careful not to double count.
        // The regular C4 implementation checks unique lines by picking 4 directions.
        // In 3D there are 13 lines.
        // Let's filter directions to unique lines (e.g. start with positive X, etc.)
        // Or just use the loop I wrote for Regular but generalized.
        
        // Unique axes:
        // 3 orthogonal (1,0,0), (0,1,0), (0,0,1)
        // 6 face diagonals (1,1,0), (1,-1,0), (1,0,1), (1,0,-1), (0,1,1), (0,1,-1)
        // 4 space diagonals (1,1,1), (1,1,-1), (1,-1,1), (1,-1,-1)
        // Total 13.

        const uniqueDirs = [
            [1,0,0], [0,1,0], [0,0,1],
            [1,1,0], [1,-1,0], [1,0,1], [1,0,-1], [0,1,1], [0,-1,1],
            [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1]
        ];

        for (const [dx, dy, dz] of uniqueDirs) {
             let count = 1;
             // Positive
             for(let i=1; i<4; i++) {
                 const x = lx + dx*i, y = ly + dy*i, z = lz + dz*i;
                 if(x<0||x>=this.size||y<0||y>=this.size||z<0||z>=this.size) break;
                 if(this.grid[this.getIdx(x,y,z)] === player) count++; else break;
             }
             // Negative
             for(let i=1; i<4; i++) {
                 const x = lx - dx*i, y = ly - dy*i, z = lz - dz*i;
                 if(x<0||x>=this.size||y<0||y>=this.size||z<0||z>=this.size) break;
                 if(this.grid[this.getIdx(x,y,z)] === player) count++; else break;
             }
             if (count >= 4) {
                 this.winner = player;
                 return;
             }
        }
    }

    clone() {
        const copy = new Connect43D(this.size);
        copy.grid = [...this.grid];
        copy.currentPlayer = this.currentPlayer;
        copy.winner = this.winner;
        return copy;
    }
}
