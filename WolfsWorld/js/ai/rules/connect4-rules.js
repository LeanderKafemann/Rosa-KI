/**
 * Regel-Definitionen für Connect 4 (Standard und 3D).
 * Implementiert "Simple" und "Complex" Strategien.
 * @fileoverview
 */

const Connect4RulesLibrary = {
    
    // --- UTILS ---
    utils: {
        /**
         * Checks if a move leads to a win for the specified player.
         * @param {Connect4Regular|Connect43D} game 
         * @param {number} move 
         * @param {number} player 
         */
        canWin: (game, move, player) => {
            const sim = game.clone();
            // Force player context if needed (usually makeMove auto-switches, so we set current)
            sim.currentPlayer = player; 
            sim.makeMove(move);
            return sim.winner === player;
        },

        /**
         * Checks if opponent can win on their NEXT turn if we make 'myMove'.
         * (Lookahead 1)
         */
        givesOpponentWin: (game, myMove, me) => {
            const sim = game.clone();
            sim.currentPlayer = me;
            sim.makeMove(myMove);
            
            if (sim.winner !== 0) return false; // Is a win for us (or draw)

            const opp = sim.currentPlayer; // Now opponent
            const oppMoves = sim.getAllValidMoves();
            
            for (let om of oppMoves) {
                const sim2 = sim.clone();
                sim2.makeMove(om);
                if (sim2.winner === opp) return true;
            }
            return false;
        }
    },

    // --- ATOMIC RULES (Regular) ---
    regular: {
        win: new AtomicRule("Siegzug", "Gewinne sofort wenn möglich", (game) => {
            for (let m of game.getAllValidMoves()) {
                if (Connect4RulesLibrary.utils.canWin(game, m, game.currentPlayer)) return m;
            }
            return null;
        }),

        block: new AtomicRule("Blocken", "Verhindere Sieg des Gegners", (game) => {
            const opp = game.currentPlayer === 1 ? 2 : 1;
            for (let m of game.getAllValidMoves()) {
                if (Connect4RulesLibrary.utils.canWin(game, m, opp)) return m;
            }
            return null;
        }),

        preferCenter: new AtomicRule("Zentrum", "Spiele in die mittlere Spalte", (game) => {
            const center = Math.floor(game.cols / 2);
            // Check if center is valid
            // In Connect 4 move is col index (0..6)
            // getAllValidMoves returns cols that are not full
            const moves = game.getAllValidMoves();
            if (moves.includes(center)) return center;
            return null;
        }),
        
        avoidBadMoves: new AtomicRule("Sicher spielen", "Vermeide Züge, die dem Gegner den Sieg schenken", (game) => {
            const moves = game.getAllValidMoves();
            // If we only have 1 move, we must take it (unless we want to resign, but let's play)
            if (moves.length === 1) return moves[0];

            const safeMoves = moves.filter(m => !Connect4RulesLibrary.utils.givesOpponentWin(game, m, game.currentPlayer));
            
            if (safeMoves.length > 0) {
                return safeMoves[Math.floor(Math.random() * safeMoves.length)];
            }
            return null; // Only bad moves left, tough luck
        })
    },

    // --- ATOMIC RULES (3D) ---
    // In 3D move is x + z*size.
    d3: {
        win: new AtomicRule("3D Sieg", "Gewinne 3D sofort", (game) => {
            for (let m of game.getAllValidMoves()) {
                if (Connect4RulesLibrary.utils.canWin(game, m, game.currentPlayer)) return m;
            }
            return null;
        }),

        block: new AtomicRule("3D Block", "Verhindere 3D Sieg", (game) => {
            const opp = game.currentPlayer === 1 ? 2 : 1;
            for (let m of game.getAllValidMoves()) {
                if (Connect4RulesLibrary.utils.canWin(game, m, opp)) return m;
            }
            return null;
        }),
        
        preferCenterPole: new AtomicRule("Zentrum-Säulen", "Spiele nahe der Mitte des Boards (XZ)", (game) => {
            const moves = game.getAllValidMoves();
            if (moves.length === 0) return null;
            
            // Calc distance to center (1.5, 1.5) for Size 4
            const s = game.size;
            const center = (s-1)/2;
            
            // Sort moves by distance to center
            moves.sort((a, b) => {
                const ax = a % s, az = Math.floor(a/s);
                const bx = b % s, bz = Math.floor(b/s);
                const da = Math.abs(ax-center) + Math.abs(az-center);
                const db = Math.abs(bx-center) + Math.abs(bz-center);
                return da - db;
            });
            
            // Pick one of the best 3
            const limit = Math.min(moves.length, 3);
            return moves[Math.floor(Math.random() * limit)];
        })
    },

    // --- TREE BUILDER ---
    createTree: (variant, level) => {
        // Use RuleGroup for a prioritized list of rules
        const root = new RuleGroup("Wurzel", "Priorisierte Liste");
        const rules = (variant === '3d') ? Connect4RulesLibrary.d3 : Connect4RulesLibrary.regular;

        if (level === 'simple') {
            // Simple: Win -> Block -> Random
            root.children = [
                rules.win,
                rules.block
            ];
            // Implicitly falls through to random if null (handled by agent or random fallback)
            // But wait, atomic rules return null if no move.
            // If the whole tree returns null, RuleBasedAgent might need a callback or return null.
            // RuleBasedAgent.getAction returns what tree.getDecision returns.
            // If tree returns null, agent returns null.
            // BaseGameController usually expects a move.
            // Note: My AtomicRules for 'win' and 'block' return null if no such move.
            // So I should add a fallback random move at the end of the group?
            
            // Adding a random fallback rule
            root.add(new AtomicRule("Zufall", "Fallback", (game) => {
                 const moves = game.getAllValidMoves();
                 return moves[Math.floor(Math.random() * moves.length)];
            }));

        } else {
            // Complex: Win -> Block -> Center -> Safe Moves
            root.children = [
                rules.win,
                rules.block,
                (variant === '3d') ? rules.preferCenterPole : rules.preferCenter,
                (variant === '3d') ? null : rules.avoidBadMoves 
            ].filter(r => r !== null);
            
             // Fallback for complex too (if safe moves fail or aren't strict)
            root.add(new AtomicRule("Zufall", "Fallback", (game) => {
                 const moves = game.getAllValidMoves();
                 return moves[Math.floor(Math.random() * moves.length)];
            }));
        }
        
        return new DecisionTree(
            `C4-${variant}-${level}`, 
            root
        );
    }
};
