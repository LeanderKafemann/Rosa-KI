/* --- FILE: js/games/tictactoe/regular-controller.js --- */
/**
 * @fileoverview Controller für 3x3 Tic-Tac-Toe
 * 
 * Extends BaseGameController mit regularem 3x3 Board-Support.
 * Verwaltet Spielstatus, Benutzer-Input und Rendering für klassisches TTT.
 * 
 * @class RegularGameController
 * @extends BaseGameController
 */
class RegularGameController extends BaseGameController {
    /**
     * Erstellt einen neuen Regular Controller.
     * @constructor
     */
    constructor() {
        super('regular', 'gameCanvas');
    }

    /**
     * Erzeugt ein neues Regular Board.
     * @returns {TTTRegularBoard} Ein neues 3x3 Tic-Tac-Toe Board
     */
    createGame() {
        return new TTTRegularBoard();
    }

    /**
     * Setzt das Spiel zurück und konfiguriert Canvas-Größe.
     * @override
     * @returns {void}
     */
    reset() {
        console.log('🔄 RegularGameController.reset() wird aufgerufen');
        console.log('   - Canvas vor Resize:', this.canvas?.width, 'x', this.canvas?.height);
        
        if (!this.canvas) {
            console.error('❌ KRITISCHER FEHLER: Canvas ist null!');
            return;
        }
        
        // ✅ Canvas-Größe für Regular anpassen
        this.canvas.width = 400;
        this.canvas.height = 400;
        console.log('✅ Canvas resized zu 400x400');
        
        super.reset();
    }

    /**
     * Zeichnet das Regular TTT Board auf Canvas.
     * @override
     * @returns {void}
     */
    drawGame() {
        console.log('🎨 drawGame() - Zeichne Regular TTT Board');
        console.log('   - Canvas:', this.canvas.width, 'x', this.canvas.height);
        console.log('   - game.grid:', this.game.grid);
        console.log('   - game.winner:', this.game.winner);
        TTTRenderer.drawRegular(this.canvas, this.game);
        console.log('✅ Zeichnen abgeschlossen');
    }

    /**
     * Konvertiert Mauskoordinaten zu Board-Move-Index.
     * @param {number} mx - Maus X-Koordinate
     * @param {number} my - Maus Y-Koordinate
     * @returns {number|null} Move als 0-8 Index oder null wenn invalid
     */
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
        console.log('🤖 RegularGameController.createAIAgent() aufgerufen mit type:', type);
        
        try {
            if (type === 'random') {
                const agent = new RandomAgent();
                console.log('✅ RandomAgent erstellt');
                return agent;
            } else if (type === 'rulebased') {
                console.log('   - Versuche createStrategyTree...');
                const tree = createStrategyTree('regular');
                console.log('   - StrategyTree erstellt', tree);
                const agent = new RuleBasedAgent(tree);
                console.log('✅ RuleBasedAgent erstellt');
                return agent;
            } else if (type === 'minimax') {
                console.log('   - HeuristicsLibrary:', typeof HeuristicsLibrary);
                console.log('   - HeuristicsLibrary.regularTTT:', typeof HeuristicsLibrary?.regularTTT);
                const agent = new MinimaxAgent({
                    name: "Minimax God",
                    maxDepth: 9,
                    useAlphaBeta: true,
                    heuristicFn: HeuristicsLibrary.regularTTT
                });
                console.log('✅ MinimaxAgent erstellt');
                return agent;
            }
            
            console.warn('⚠️ Unbekannter Agent-Typ:', type);
            return null;
        } catch (error) {
            console.error(`❌ FEHLER beim Erstellen des ${type} Agents:`, error);
            console.error('   Stack:', error.stack);
            return null;
        }
    }
}