/* --- FILE: js/games/tictactoe/ultimate-controller.js --- */
/**
 * @fileoverview Controller für Ultimate Tic-Tac-Toe.
 * Nutzt die BaseGameController für standardisierte Logik.
 */
class UltimateGameController extends BaseGameController {
    constructor() {
        super('ultimate', 'gameCanvas');
    }

    createGame() {
        return new UltimateBoard();
    }

    reset() {
        // ✅ Canvas-Größe für Ultimate anpassen (größer für Details)
        this.canvas.width = 600;
        this.canvas.height = 600;
        super.reset();
    }

    drawGame() {
        TTTRenderer.drawUltimate(this.canvas, this.game);
    }

    coordsToMove(mx, my) {
        const bigS = this.canvas.width / 3;
        const smallS = bigS / 3;

        const bX = Math.floor(mx / bigS);
        const bY = Math.floor(my / bigS);
        const sX = Math.floor((mx % bigS) / smallS);
        const sY = Math.floor((my % bigS) / smallS);

        if (bX >= 0 && bX < 3 && bY >= 0 && bY < 3) {
            return { big: bY * 3 + bX, small: sY * 3 + sX };
        }
        return null;
    }

    createAIAgent(type) {
        if (type === 'random') {
            return new RandomAgent();
        } else if (type === 'rulebased') {
            return new RuleBasedAgent(createStrategyTree('ultimate'));
        } else if (type === 'minimax') {
            return new MinimaxAgent({
                name: "Smart Minimax",
                maxDepth: 4,
                useAlphaBeta: true,
                heuristicFn: HeuristicsLibrary.ultimateTTT
            });
        }
        return null;
    }
}

// ===== WICHTIG: Die alte draw() Methode wurde entfernt =====
// Sie wird jetzt über drawGame() aufgerufen, die in der Basisklasse definiert ist.

// Fallback für HTML-inline onclick="..."
const draw = () => UltimateController?.drawGame?.();