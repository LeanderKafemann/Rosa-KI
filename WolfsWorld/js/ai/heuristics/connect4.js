
/**
 * Connect-4-spezifische Heuristiken.
 * Erweitert die HeuristicsLibrary.
 * @fileoverview
 */

HeuristicsLibrary.connect4 = {
    /**
     * Main evaluation function for Connect 4.
     */
    evaluate: (game, player) => {
        // 1. Terminal Check
        if (game.winner === player) return 100000;
        if (game.winner !== NONE && game.winner !== DRAW) return -100000;
        if (game.winner === DRAW) return 0; // Draw

        let score = 0;
        const opponent = player === PLAYER1 ? PLAYER2 : PLAYER1;

        // 2. Center Control
        const centerCol = Math.floor(game.cols / 2);
        for (let r = 0; r < game.rows; r++) {
            for (let c = 0; c < game.cols; c++) {
                const idx = r * game.cols + c;
                if (game.grid[idx] === player) {
                    const dist = Math.abs(c - centerCol);
                    score += (centerCol - dist + 1) * 3; // Increased weight
                } else if (game.grid[idx] === opponent) {
                    const dist = Math.abs(c - centerCol);
                    score -= (centerCol - dist + 1) * 3;
                }
            }
        }

        // 3. Lines
        score += HeuristicsLibrary.connect4.evaluateLines(game, player);
        return score;
    },

    evaluateLines: (game, player) => {
        let score = 0;
        const curr = player;
        const opp = player === PLAYER1 ? PLAYER2 : PLAYER1;

        // Helper
        const evaluateWindow = (cells) => {
            let myCount = 0;
            let oppCount = 0;
            let emptyCount = 0;

            for(const cell of cells) {
                if (cell === curr) myCount++;
                else if (cell === opp) oppCount++;
                else emptyCount++;
            }

            if (myCount === 4) return 10000; 
            if (myCount === 3 && emptyCount === 1) return 100;
            if (myCount === 2 && emptyCount === 2) return 10;

            if (oppCount === 3 && emptyCount === 1) return -90; 
            if (oppCount === 2 && emptyCount === 2) return -5; 
            
            return 0;
        };

        // Reuse loop logic from before, just wrapped in object
        // Horizontal
        for (let r = 0; r < game.rows; r++) {
            for (let c = 0; c < game.cols - 3; c++) {
                const window = [];
                for (let i = 0; i < 4; i++) window.push(game.grid[r * game.cols + c + i]);
                score += evaluateWindow(window);
            }
        }

        // Vertical
        for (let c = 0; c < game.cols; c++) {
            for (let r = 0; r < game.rows - 3; r++) {
                const window = [];
                for (let i = 0; i < 4; i++) window.push(game.grid[(r + i) * game.cols + c]);
                score += evaluateWindow(window);
            }
        }

        // Diagonal \
        for (let r = 0; r < game.rows - 3; r++) {
            for (let c = 0; c < game.cols - 3; c++) {
                const window = [];
                for (let i = 0; i < 4; i++) window.push(game.grid[(r + i) * game.cols + c + i]);
                score += evaluateWindow(window);
            }
        }

        // Diagonal /
        for (let r = 0; r < game.rows - 3; r++) {
            for (let c = 0; c < game.cols; c++) {
                if (c - 3 < 0) continue;
                const window = [];
                for (let i = 0; i < 4; i++) window.push(game.grid[(r + i) * game.cols + (c - i)]);
                score += evaluateWindow(window);
            }
        }

        return score;
    },

    evaluate3D: (game, player) => {
        if (game.winner === player) return 100000;
        if (game.winner !== NONE && game.winner !== DRAW) return -100000;
        if (game.winner === DRAW) return 0;

        let score = 0;
        const s = game.size;

        for (let idx = 0; idx < game.grid.length; idx++) {
            const cell = game.grid[idx];
            if (cell === NONE) continue;
            const x = idx % s;
            const z = Math.floor((idx / s)) % s;
            const y = Math.floor(idx / (s*s));
            
            const dist = Math.abs(x - 1.5) + Math.abs(y - 1.5) + Math.abs(z - 1.5);
            const val = (5 - dist) * 2; 
            
            if (cell === player) score += val;
            else score -= val;
        }

        const directions = [
            [1,0,0], [0,1,0], [0,0,1],
            [1,1,0], [1,-1,0], [1,0,1], [1,0,-1], [0,1,1], [0,-1,1],
            [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1]
        ];

        const opponent = player === PLAYER1 ? PLAYER2 : PLAYER1;
        for (let x=0; x<s; x++) {
            for (let y=0; y<s; y++) {
                for (let z=0; z<s; z++) {
                    for (const [dx, dy, dz] of directions) {
                        const ex = x + 3*dx, ey = y + 3*dy, ez = z + 3*dz;
                        if (ex >= 0 && ex < s && ey >= 0 && ey < s && ez >= 0 && ez < s) {
                            let myCount = 0;
                            let oppCount = 0;
                            let emptyCount = 0;
                            for (let k=0; k<4; k++) {
                                const idx = game.getIdx(x + k*dx, y + k*dy, z + k*dz);
                                const val = game.grid[idx];
                                if (val === player) myCount++;
                                else if (val === opponent) oppCount++;
                                else emptyCount++;
                            }
                            if (myCount === 3 && emptyCount === 1) score += 100;
                            if (oppCount === 3 && emptyCount === 1) score -= 90;
                        }
                    }
                }
            }
        }
        return score;
    }
};
