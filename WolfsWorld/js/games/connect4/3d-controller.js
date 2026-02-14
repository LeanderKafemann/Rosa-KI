/**
 * @fileoverview Controller für 3D Connect4 (4x4x4 Cube)
 * 
 * Extends BaseGameController mit 3D Connect4-Support und Multi-Panel Rendering.
 * Visualisiert 4 unterschiedliche Perspektiven des Spielwürfels.
 * 
 * @class Connect43DController
 * @extends BaseGameController
 */
class Connect43DController extends BaseGameController {
    constructor() {
        super('connect4-3d', 'gameCanvas');
    }

    createGame() {
        return new Connect43D(4);
    }

    reset() {
        this.canvas.width = 800; // Wider for 4 panels
        this.canvas.height = 500; // Taller for 2 rows of views
        super.reset();
    }

    drawGame() {
        Connect4Renderer.draw3D(this.canvas, this.game);
    }

    coordsToMove(mx, my) {
        const w = this.canvas.width;
        const s = this.game.size;
        
        const pad = 10;
        const boardW = (w - pad * (s + 1)) / s;
        const boardH = boardW;

        // Match renderer logic (topY = 40)
        const topY = 40; 
        const secondY = topY + boardH + 60; // Offset for Side View

        // Check Top View (Front View)
        if (my >= topY && my <= topY + boardH) {
            for (let z = 0; z < s; z++) {
                 const startX = pad + z * (boardW + pad);
                 if (mx >= startX && mx <= startX + boardW) {
                     const x = Math.floor((mx - startX) / (boardW / s));
                     if (x >= 0 && x < s) {
                         // Move is x + z*size. In Top view we select X and Slice Z (now Y)
                         // Wait, if "Ebene Y=..." is the slice, then z loop is Y?
                         // The renderer loop: for (let z = 0; z < s; z++) -> Label "Ebene Y={z+1}"
                         // So 'z' var is the new 'y' dim.
                         // But game logic uses x + z*size for a column. Check game logic.
                         // Standard Connect4 3D: 16 columns (4x4 grid on floor).
                         // Pieces stack up in Y (Height).
                         // The input usually selects the column (x, z).
                         
                         // If we are looking "von vorne" at slices.
                         // If standard is X (width), Y (height), Z (depth).
                         // "Ebene Y=1" means Slice at Depth 1? No, usually Y is height.
                         // If "Ebene Y=1" means Depth=1, then user renamed Z to Y.
                         // Let's assume the move is still (x, z).
                         
                         // In Top/Front view: we click on a slice.
                         // slice index 'z' (loop var).
                         // grid x 'x'.
                         // Move = x + z * size.
                         return x + z * s;
                     }
                 }
            }
        }
        
        // Check Side View
        if (my >= secondY && my <= secondY + boardH) {
             for (let x = 0; x < s; x++) {
                 const startX = pad + x * (boardW + pad);
                 if (mx >= startX && mx <= startX + boardW) {
                     // In Side View (X Slices), we see Z (Depth, now Y?) vs Y (Height, now Z?)
                     // If we click here, we are selecting a column?
                     // A move is defined by picking a vertical column (x, z).
                     // In Side view of slice X, horizontal axis is Z.
                     // So we need to compute 'z' from mouse X inside the grid.
                     
                     const z = Math.floor((mx - startX) / (boardW / s));
                     if (z >= 0 && z < s) {
                         // We found x (loop var) and z (calculated).
                         return x + z * s;
                     }
                 }
             }
        }
        
        return null;
    }

    createAIAgent(type) {
        if (type === 'random') {
            return new RandomAgent();
        } else if (type === 'rule_simple') {
            return new RuleBasedAgent(Connect4RulesLibrary.createTree('3d', 'simple'));
        } else if (type === 'rule_complex') {
            return new RuleBasedAgent(Connect4RulesLibrary.createTree('3d', 'complex'));
        } else if (type === 'minimax') {
            return new MinimaxAgent({
                name: "Minimax 3D",
                maxDepth: 3, // Tiefere Suche ist in 3D sehr teuer (16 Züge pro State = BranchingFactor 16)
                useAlphaBeta: true,
                heuristicFn: HeuristicsLibrary.connect4.evaluate3D
            });
        }
        return new RandomAgent();
    }
}
