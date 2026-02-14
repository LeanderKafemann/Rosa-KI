/* --- FILE: js/games/tictactoe/3d-controller.js --- */
/**
 * @fileoverview Controller für 3D Tic-Tac-Toe (3x3x3)
 * 
 * Extends BaseGameController mit 3D Board-Support und Multi-View Rendering.
 * Verwaltet Slice-Views (XY-Ebenen) und isometrische Projektion.
 * 
 * @class ThreeDGameController
 * @extends BaseGameController
 */
class ThreeDGameController extends BaseGameController {
    constructor() {
        super('3d', 'gameCanvas');
        this.isoCanvas = null;
        this.axis = 'z';
        this.size = 3;
    }

    init() {
        this.isoCanvas = document.getElementById('isoCanvas');
        super.init();
    }

    createGame() {
        return new TTT3DBoard(this.size);
    }

    drawGame() {
        TTTRenderer.draw3DSlices(this.canvas, this.game, this.axis);
        TTTRenderer.drawIsoView(this.isoCanvas, this.game);
    }

    setSize(s) {
        this.size = s;
        document.querySelectorAll('.size-btn').forEach(b => {
            b.classList.remove('active');
            if (b.innerText.includes(s)) b.classList.add('active');
        });
        this.reset();
    }

    reset() {
        // ✅ Canvas-Größe für 3D anpassen
        this.canvas.width = 400;
        this.canvas.height = 250; // Rechteckig für Slices
        if (this.isoCanvas) {
            this.isoCanvas.width = 250;
            this.isoCanvas.height = 250;
        }
        super.reset();
    }

    setAxis(a) {
        this.axis = a;
        document.querySelectorAll('.view-btn').forEach(b => {
            b.classList.remove('active');
            if (b.innerText.toLowerCase().includes(
                a === 'z' ? 'oben' : a === 'y' ? 'vorne' : 'seite'
            )) b.classList.add('active');
        });
        this.drawGame();
    }

    coordsToMove(mx, my) {
        const w = this.canvas.width, h = this.canvas.height, s = this.size;
        const pad = 20;
        const availW = w - (pad * 2);
        const availH = h - (pad * 2);
        const boxSize = Math.min(availW / s, availH);
        const gap = boxSize * 0.1;
        const boardS = boxSize - gap;
        const startX = (w - s * boxSize) / 2 + gap / 2;
        const startY = (h - boardS) / 2 + 10;

        for (let k = 0; k < s; k++) {
            const ox = startX + k * boxSize;
            if (mx >= ox && mx <= ox + boardS && my >= startY && my <= startY + boardS) {
                const c = Math.floor((mx - ox) / (boardS / s));
                const r = Math.floor((my - startY) / (boardS / s));

                let x, y, z;
                if (this.axis === 'z') { z = k; y = r; x = c; }
                else if (this.axis === 'y') { y = k; x = c; z = (s - 1) - r; }
                else { x = k; y = c; z = (s - 1) - r; }

                return z * (s * s) + y * s + x;
            }
        }
        return null;
    }

    createAIAgent(type) {
        if (type === 'random') {
            return new RandomAgent();
        } else if (type === 'rulebased') {
            return new RuleBasedAgent(createStrategyTree('3d'));
        } else if (type === 'minimax') {
            return new MinimaxAgent({
                name: "Minimax 3D",
                maxDepth: 3,
                useAlphaBeta: true,
                heuristicFn: HeuristicsLibrary.threeDTTT
            });
        }
        return null;
    }
}