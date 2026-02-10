/* --- FILE: js/games/tictactoe/regular-controller.js --- */
/**
 * @fileoverview Controller für 3x3 Tic-Tac-Toe.
 * Nutzt die BaseGameController für standardisierte Logik.
 */
class RegularGameController extends BaseGameController {
    constructor() {
        super('regular', 'gameCanvas');
    }

    createGame() {
        return new TTTRegularBoard();
    }

    reset() {
        // ✅ Canvas-Größe für Regular anpassen
        this.canvas.width = 400;
        this.canvas.height = 400;
        super.reset();
    }

    drawGame() {
        TTTRenderer.drawRegular(this.canvas, this.game);
    }

    coordsToMove(mx, my) {
        const s = this.canvas.width / 3;
        const c = Math.floor(mx / s);
        const r = Math.floor(my / s);
        
        if (c >= 0 && c < 3 && r >= 0 && r < 3) {
            return r * 3 + c;
        }
        return null;
    }

    createAIAgent(type) {
        if (type === 'random') {
            return new RandomAgent();
        } else if (type === 'rulebased') {
            return new RuleBasedAgent(createStrategyTree('regular'));
        } else if (type === 'minimax') {
            return new MinimaxAgent({
                name: "Minimax God",
                maxDepth: 9,
                useAlphaBeta: true,
                heuristicFn: HeuristicsLibrary.regularTTT
            });
        }
        return null;
    }
}