/**
 * Controller für Standard Connect 4.
 * @fileoverview
 */
class Connect4RegularController extends BaseGameController {
    constructor() {
        super('connect4-regular', 'gameCanvas');
    }

    createGame() {
        // Read cols/rows from UI if present, or default
        const rInput = document.getElementById('rowsInput');
        const cInput = document.getElementById('colsInput');
        
        const rows = rInput ? parseInt(rInput.value) : 6;
        const cols = cInput ? parseInt(cInput.value) : 7;
        
        return new Connect4Regular(rows, cols);
    }

    reset() {
        // Adjust canvas size for aspect ratio
        // We'll try to fit it into a box (e.g. 500x500 max) keeping aspect ratio
        const rInput = document.getElementById('rowsInput');
        const cInput = document.getElementById('colsInput');
        const rows = rInput ? parseInt(rInput.value) : 6;
        const cols = cInput ? parseInt(cInput.value) : 7;

        // Base size per cell = 60px?
        // Or fixed width
        const MAX_W = 600;
        const MAX_H = 500;
        
        // s * cols <= MAX_W  -> s <= MAX_W / cols
        // s * rows <= MAX_H  -> s <= MAX_H / rows
        const s = Math.min(MAX_W / cols, MAX_H / rows);
        
        this.canvas.width = s * cols;
        this.canvas.height = s * rows;

        super.reset();
    }

    drawGame() {
        Connect4Renderer.drawRegular(this.canvas, this.game);
    }

    coordsToMove(mx, my) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cols = this.game.cols;
        const rows = this.game.rows;
        
        const s = Math.min(w / cols, h / rows);
        const offsetX = (w - s * cols) / 2;
        const offsetY = (h - s * rows) / 2;

        const c = Math.floor((mx - offsetX) / s);
        const r = Math.floor((my - offsetY) / s);

        if (c >= 0 && c < cols && r >= 0 && r < rows) {
            // For Connect 4, we just need the column.
            // But we should check if they clicked inside the grid.
            return c;
        }
        return null;
    }

    createAIAgent(type) {
        if (type === 'random') {
            return new RandomAgent();
        } else if (type === 'rule_simple') {
            return new RuleBasedAgent(Connect4RulesLibrary.createTree('regular', 'simple'));
        } else if (type === 'rule_complex') {
            return new RuleBasedAgent(Connect4RulesLibrary.createTree('regular', 'complex'));
        } else if (type === 'minimax') {
            // Dynamic depth calculation based on board size
            // Larger board = more branching = less depth safe to search
            // 7 cols ~ 7 branching factor. 7^6 is huge.
            // 4 cols ~ 4^8 is manageable.
            const cols = this.game.cols;
            let depth = 5;
            if (cols <= 5) depth = 7;
            else if (cols <= 6) depth = 6;
            else if (cols <= 7) depth = 5;
            else depth = 4; // for 8+ cols

            return new MinimaxAgent({
                name: "Minimax C4",
                maxDepth: depth,
                useAlphaBeta: true,
                heuristicFn: HeuristicsLibrary.connect4.evaluate
            });
        }
        return new RandomAgent(); 
    }
}
