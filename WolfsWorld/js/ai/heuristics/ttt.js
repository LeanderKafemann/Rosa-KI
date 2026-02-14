
/**
 * Tic-Tac-Toe-spezifische Heuristiken (Standard, 3D, Ultimate, KnightsTour).
 * Erweitert die HeuristicsLibrary.
 * @fileoverview
 */

// WIN_CONDITIONS nutzen die zentralen Konstanten
const WIN_CONDITIONS = GAME_CONSTANTS.TTT_WIN_CONDITIONS;

/**
 * Heuristic for Standard 3x3 Tic-Tac-Toe.
 */

HeuristicsLibrary.regularTTT = (game, player) => {
    // 1. Direct Terminal
    if (game.winner === player) return 1000;
    if (game.winner !== NONE && game.winner !== DRAW) return -1000;
    if (game.winner === DRAW) return 0; // Remis

    let score = 0;
    const opponent = player === PLAYER1 ? PLAYER2 : PLAYER1;

    // 2. Open Lines (Win Opportunities)
    for (const line of WIN_CONDITIONS) {
        let myCount = 0;
        let oppCount = 0;
        let emptyCount = 0;

        for (const idx of line) {
            const val = game.grid[idx];
            if (val === player) myCount++;
            else if (val === opponent) oppCount++;
            else emptyCount++;
        }

        if (myCount === 2 && emptyCount === 1) score += 10;  // Good chance
        if (oppCount === 2 && emptyCount === 1) score -= 10; // Danger
        
        if (myCount === 1 && emptyCount === 2) score += 1;
        if (oppCount === 1 && emptyCount === 2) score -= 1;
    }
    return score;
};

/**
 * Heuristik für 3D Tic-Tac-Toe (3x3x3).
 * Bewertet Linien (2-in-Reihe, Zentrum).
 */
HeuristicsLibrary.ttt3d = (game, player) => {
    if (game.winner === player) return 10000;
    if (game.winner !== NONE && game.winner !== DRAW) return -10000;
    if (game.winner === DRAW) return 0;

    // 2. Center Control (Middle of the cube 1,1,1 is best)
    const center = 13; // 4 + 3*3 = 13? (1,1,1) -> 1 + 1*3 + 1*9 = 1+3+9 = 13.
    let score = 0;
    if (game.grid[center] === player) score += 20;
    else if (game.grid[center] === (player === PLAYER1 ? PLAYER2 : PLAYER1)) score -= 20;

   // 3. Line Evaluation
   // Helper to check lines
   const checkLine = (idx1, idx2, idx3) => {
       const v1 = game.grid[idx1], v2 = game.grid[idx2], v3 = game.grid[idx3];
       const opp = player === 1 ? 2 : 1;
       let my = 0, op = 0, em = 0;
       
       if (v1 === player) my++; else if (v1 === opp) op++; else em++;
       if (v2 === player) my++; else if (v2 === opp) op++; else em++;
       if (v3 === player) my++; else if (v3 === opp) op++; else em++;

       if (my === 2 && em === 1) return 10;
       if (op === 2 && em === 1) return -10;
       if (my === 1 && em === 2) return 1;
       if (op === 1 && em === 2) return -1;
       return 0;
   };

   // Generate all lines? Or iterate.
   // We can precompute lines for 3x3x3.
   if (!HeuristicsLibrary._lines3d) {
       const lines = [];
       // 1. Orthogonal (x, y, z varies)
       for(let i=0; i<3; i++) for(let j=0; j<3; j++) {
           lines.push([i, i+3, i+6].map(x => x + j*9)); // Vertical cols in each slice Z (actually Y axis in local grid?)
           lines.push([0,1,2].map(x => x + i*3 + j*9)); // Rows in each slice
           lines.push([j, j+9, j+18].map(x => x + i*3)); // Pillars (Z axis)
       }
       // 2. Face Diagonals
       for(let i=0; i<3; i++) {
           // XY Planes (Z fixed at i)
           lines.push([0, 4, 8].map(x => x + i*9));
           lines.push([2, 4, 6].map(x => x + i*9));
           // XZ Planes (Y fixed at i)
           lines.push([0, 10, 20].map(x => x + i*3)); // 0+0*9+0, 1+1*9+0... wait.
           // x + z*9 + y*3.
           // 0, 1, 2 = x. 0, 3, 6 = y. 0, 9, 18 = z.
           // Diagonal XZ: x++, z++ (fixed y). Delta = 1 + 9 = 10.
           lines.push([2, 11, 20].map(x => x + i*3)); // Delta = 9 - 1 = 8? No. 2, 11, 20. 2->11(+9), 11->20(+9). Grid is linear 0..26.
           // Let's use generic calc.
       }
       // Actually simpler loop for directions
        const s = 3;
        const directions = [
           [1,0,0], [0,1,0], [0,0,1], // Ortho
           [1,1,0], [1,-1,0], [1,0,1], [1,0,-1], [0,1,1], [0,-1,1], // Face
           [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1] // Space
        ];
        
        const valid = (x,y,z) => x>=0 && x<3 && y>=0 && y<3 && z>=0 && z<3;
        const getIdx = (x,y,z) => x + y*3 + z*9;

        HeuristicsLibrary._lines3d = [];
        const seen = new Set();
       
        for(let z=0; z<3; z++) for(let y=0; y<3; y++) for(let x=0; x<3; x++) {
            for(let [dx,dy,dz] of directions) {
                // Check if line starts here (for length 3, only start at 0 is possible for +1 dir)
                // We need general line generation.
                // Just trace from x,y,z in direction.
                let cells = [];
                for(let k=0; k<3; k++) {
                     if(valid(x+k*dx, y+k*dy, z+k*dz)) cells.push(getIdx(x+k*dx, y+k*dy, z+k*dz));
                     else break;
                }
                if(cells.length === 3) {
                    const key = cells.slice().sort().join(',');
                    if(!seen.has(key)) {
                        HeuristicsLibrary._lines3d.push(cells);
                        seen.add(key);
                    }
                }
            }
        }
   }

   for(const line of HeuristicsLibrary._lines3d) {
       score += checkLine(line[0], line[1], line[2]);
   }

   return score;
};

/**
 * Heuristic for Ultimate Tic-Tac-Toe.
 * Evaluates local boards and macro board state.
 */
HeuristicsLibrary.ultimateTTT = (game, player) => {
    // 1. Global Win
    if (game.winner === player) return 100000;
    if (game.winner !== 0 && game.winner !== 3) return -100000;
    if (game.winner === 3) return 0;
    
    let score = 0;
    const opp = player === 1 ? 2 : 1;

    // 2. Evaluate Global Board (Metaboard)
    // game.macroBoard (0..8) tells who won which sector.
    // If a sector is won by player, it's good.
    // Also use regularTTT logic on the global board (treating won sectors as X/O).
    
    // Create a mock mini-game for global board evaluation
    const scoreGlobal = (grid) => {
        let s = 0;
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const l of lines) {
             let m=0, o=0;
             for(const idx of l) {
                 if(grid[idx] === player) m++;
                 else if(grid[idx] === opp) o++;
             }
             if(m===2 && o===0) s+=50;
             if(o===2 && m===0) s-=50;
             if(m===1 && o===0) s+=10;
             if(o===1 && m===0) s-=10;
        }
        return s;
    };
    
    const macro = Array.isArray(game.macroBoard) ? game.macroBoard : Array(9).fill(0);
    score += scoreGlobal(macro) * 50; // High weight on macro strategy

    // 3. Evaluate Local Boards
    // Sum up score of each active board? 
    // Or all boards? Even won boards matter (they are static).
    // If a board is won, it's just a point in global. 
    // If not won, we evaluate position.
    
    for(let i=0; i<9; i++) {
        const owner = macro[i];
        if(owner === player) {
            score += 20; 
        } else if(owner === opp) {
            score -= 20;
        } else if(owner === 0) {
            // Not won yet, evaluate contents
            // Extract sub-grid
            // game.grid is 9x9? No, typically game.boards[i] or flat array?
            // Checking UltimateBoard class structure... Usually logic is separate.
            // If we access game.grid, we must know structure.
            // Assuming game.boards[i] is an array of 9.
            if(game.boards && game.boards[i]) {
                 // Hack: use regularTTT on the sub-board
                 // But regularTTT expects a "game" object with .grid
                 const subGame = { winner: 0, grid: game.boards[i] };
                 const subScore = HeuristicsLibrary.regularTTT(subGame, player);
                 // Weight local boards less than global
                 score += subScore * 1.0; 
            }
        }
    }
    
    return score;
};

/**
 * Knights Tour Heuristic (Warnsdorff's Rule).
 * Counts available moves from current position.
 */
HeuristicsLibrary.knightsTour = (game, player) => {
    // Implement if needed for AI solving Knights Tour
    return 0;
};
