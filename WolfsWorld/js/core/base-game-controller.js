/**
 * Basis-Controller für gitterbasierte Strategiespiele (TTT, Connect4, etc.).
 * 
 * Reduziert Code-Duplikation durch ein gemeinsames Template,
 * das von Regular TTT, 3D, Ultimate, Connect 4 und weiteren genutzt wird.
 * @fileoverview
 */

class BaseGameController {
    /**
     * Initialisiert den Controller.
     * Muss von der Subklasse aufgerufen werden.
     * @param {string} gameType - z.B. 'regular', 'connect4-3d'
     * @param {string} canvasId - HTML Canvas Element ID
     */
    constructor(gameType, canvasId) {
        console.log('🎮 BaseGameController.constructor() aufgerufen');
        console.log('   - gameType:', gameType);
        console.log('   - canvasId:', canvasId);
        
        this.gameType = gameType;
        this.canvas = document.getElementById(canvasId);
        
        console.log('   - Canvas gefunden?', this.canvas !== null);
        if (this.canvas) {
            console.log('   - Canvas Dimensionen:', this.canvas.width, 'x', this.canvas.height);
        } else {
            console.error('❌ FEHLER: Canvas nicht gefunden! ID:', canvasId);
        }
        
        this.game = null;
        this.adapter = null;
        this.isProcessing = false;
    }

    /**
     * Erstellt das Spiel (wird von Subklasse überschrieben).
     * @abstract
     * @returns {TTTRegularBoard|TTT3DBoard|UltimateBoard}
     */
    createGame() {
        throw new Error('createGame() muss von Subklasse implementiert werden');
    }

    /**
     * Zeichnet das Spiel (wird von Subklasse überschrieben).
     * @abstract
     */
    drawGame() {
        throw new Error('drawGame() muss von Subklasse implementiert werden');
    }

    /**
     * Konvertiert Canvas-Koordinaten zu einem Zug (wird von Subklasse überschrieben).
     * @abstract
     * @param {number} mx - Mouse X in Canvas-Koordinaten
     * @param {number} my - Mouse Y in Canvas-Koordinaten
     * @returns {number|object|null} Der Zug oder null
     */
    coordsToMove(mx, my) {
        throw new Error('coordsToMove() muss von Subklasse implementiert werden');
    }

    /**
     * Initialisiert den Controller (aufgerufen von onload).
     */
    init() {
        console.log('🎮 BaseGameController.init() - Initialisierung startet');
        console.log('🔍 Überprüfung der Konstanten:', { NONE, PLAYER1, PLAYER2, DRAW });
        
        this.canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));
        
        const p1Sel = document.getElementById('p1Type');
        const p2Sel = document.getElementById('p2Type');
        if (p1Sel) p1Sel.onchange = () => this.checkTurn();
        if (p2Sel) p2Sel.onchange = () => this.checkTurn();

        this.reset();
    }

    /**
     * Setzt das Spiel zurück.
     */
    reset() {
        console.log('🔄 BaseGameController.reset() wird aufgerufen');
        
        try {
            this.game = this.createGame();
            console.log('✅ Game-Objekt erstellt:', this.game);
            console.log('   - game.grid:', this.game.grid?.slice(0, 3), '...');
            console.log('   - game.winner:', this.game.winner);
            console.log('   - game.currentPlayer:', this.game.currentPlayer);
            console.log('   - game.getAllValidMoves:', typeof this.game.getAllValidMoves);
        } catch (error) {
            console.error('❌ FEHLER beim Erstellen des Game-Objekts:', error);
            console.error('   Stack:', error.stack);
            return;
        }
        
        try {
            this.adapter = new GameAdapter(this.game, this.gameType);
            console.log('✅ GameAdapter erstellt');
        } catch (error) {
            console.error('❌ FEHLER beim Erstellen des GameAdapter:', error);
            console.error('   Stack:', error.stack);
            return;
        }
        
        this.isProcessing = false;
        this.updateUI();
        
        try {
            this.drawGame();
        } catch (error) {
            console.error('❌ FEHLER beim drawGame():', error);
            console.error('   Stack:', error.stack);
        }
        
        try {
            this.checkTurn();
        } catch (error) {
            console.error('❌ FEHLER beim checkTurn():', error);
            console.error('   Stack:', error.stack);
        }
    }

    /**
     * Verarbeitet Klicks auf das Canvas.
     * @param {MouseEvent} e
     */
    handleCanvasClick(e) {
        if (this.isProcessing || this.adapter.isGameOver()) return;

        const rect = this.canvas.getBoundingClientRect();
        const scale = this.canvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scale;
        const my = (e.clientY - rect.top) * scale;

        const move = this.coordsToMove(mx, my);
        if (move !== null && move !== undefined) {
            if (this.adapter.makeMove(move)) {
                this.drawGame();
                this.checkTurn();
            }
        }
    }

    /**
     * Hauptlogik: Prüft, ob Spiel vorbei ist oder KI am Zug ist.
     */
    checkTurn() {
        const validMoves = this.adapter.getValidMoves();
        const hasWinner = this.adapter.isGameOver();
        const hasValidMoves = validMoves.length > 0;

        console.log(
            `📊 ${this.gameType} checkTurn: ` +
            `Player=${this.adapter.getCurrentPlayer()}, ` +
            `Winner=${this.adapter.getWinner()}, ` +
            `ValidMoves=${validMoves.length}`
        );

        if (hasWinner || !hasValidMoves) {
            console.log(`🏁 Game Over: Winner=${this.adapter.getWinner()}`);
            return this.updateUI();
        }

        this.updateUI();

        // KI-Check
        const p1Type = document.getElementById('p1Type')?.value || 'human';
        const p2Type = document.getElementById('p2Type')?.value || 'human';
        const currentType = this.adapter.getCurrentPlayer() === 1 ? p1Type : p2Type;

        if (currentType !== 'human') {
            this.isProcessing = true;
            const speed = this.getAISpeed();

            setTimeout(() => {
                try {
                    console.log(`🤖 Versuche AI ${currentType} zu erstellen...`);
                    const agent = this.createAIAgent(currentType);
                    if (agent) {
                        console.log('🤖 Agent erstellt, rufe getAction() auf...');
                        const action = agent.getAction(this.game);
                        console.log(`🤖 KI ${this.adapter.getCurrentPlayer()} Aktion:`, action);

                        if (action && action.move !== undefined && action.move !== null) {
                            console.log(`✅ Zug: ${JSON.stringify(action.move)}`);
                            this.adapter.makeMove(action.move);
                        } else {
                            console.warn('❌ KI findet keinen gültigen Zug!');
                        }
                    } else {
                        console.warn('⚠️ Agent war null!');
                    }
                } catch (error) {
                    console.error('❌ FEHLER im AI-Timeout:', error);
                    console.error('   Stack:', error.stack);
                } finally {
                    this.isProcessing = false;
                    this.drawGame();
                    this.checkTurn();
                }
            }, speed);
        }
    }

    /**
     * Erstellt den KI-Agenten (wird von Subklasse überschrieben).
     * @param {string} type - 'random', 'rulebased', oder 'minimax'
     * @returns {Agent|null}
     */
    createAIAgent(type) {
        throw new Error('createAIAgent() muss von Subklasse implementiert werden');
    }

    /**
     * Holt die KI-Geschwindigkeit aus dem Slider.
     * @returns {number} Verzögerung in ms
     */
    getAISpeed() {
        const slider = document.getElementById('aiSpeed');
        if (!slider) return 1000;
        const sliderValue = parseInt(slider.value);
        return 2000 - sliderValue; // Invertierte Logik: 0=schnell, 2000=langsam
    }

    /**
     * Aktualisiert die UI (Status-Text).
     */
    updateUI() {
        const statusEl = document.getElementById('statusText');
        if (!statusEl) return;

        if (this.adapter.isGameOver()) {
            const winner = this.adapter.getWinner();
            if (winner === 3) {
                statusEl.textContent = 'REMIS';
            } else {
                statusEl.textContent = `SIEG: ${winner === 1 ? 'BLAU' : 'ROT'}`;
            }
        } else if (this.adapter.getRemainingMoves() === 0) {
            statusEl.textContent = 'REMIS';
        } else {
            const player = this.adapter.getCurrentPlayer();
            statusEl.textContent = `${player === 1 ? 'BLAU' : 'ROT'} ist dran`;
        }
    }
}
