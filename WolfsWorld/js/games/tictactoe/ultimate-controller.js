/* --- FILE: js/games/tictactoe/ultimate-controller.js --- */
/** * @fileoverview Controller für Ultimate Tic-Tac-Toe.
 */
const UltimateController = {
    game: null, canvas: null, isProcessing: false,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.addEventListener('mousedown', (e) => this.click(e));
        document.getElementById('p1Type').onchange = () => this.checkTurn();
        document.getElementById('p2Type').onchange = () => this.checkTurn();
        this.reset();
    },

    reset() {
        this.game = new UltimateBoard();
        this.isProcessing = false;
        this.updateUI(); this.draw(); this.checkTurn();
    },

    checkTurn() {
        if(this.game.winner || this.game.getAllValidMoves().length===0) return this.updateUI();
        const p1 = document.getElementById('p1Type').value;
        const p2 = document.getElementById('p2Type').value;
        const current = (this.game.currentPlayer === 1) ? p1 : p2;
        this.updateUI();
        if (current !== 'human') {
            this.isProcessing = true;
            const speed = document.getElementById('aiSpeed').value;
            setTimeout(() => {
                let agent;
                if (current === 'random') {
                    agent = new RandomAgent();
                } else if (current === 'rulebased') {
                    agent = new RuleBasedAgent(createStrategyTree('ultimate'));
                } else if (current === 'minimax') {
                    // Ultimate: Nutze "Smart" Heuristik
                    // Tiefe 4 ist meist ein guter Kompromiss aus Zeit und Spielstärke
                    agent = new MinimaxAgent({
                        name: "Smart Minimax",
                        maxDepth: 4,
                        useAlphaBeta: true,
                        heuristicFn: HeuristicsLibrary.ultimateTTT
                    });
                }

                const action = agent ? agent.getAction(this.game) : null;
                // Ultimate Move: {big, small}
                if(action) this.game.makeMove(action.move.big, action.move.small);
                
                this.isProcessing = false;
                this.draw(); this.checkTurn();
            }, speed);
        }
    },

    click(e) {
        if(this.isProcessing || this.game.winner) return;
        const rect = this.canvas.getBoundingClientRect();
        
        // Scaling
        const scale = this.canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scale;
        const y = (e.clientY - rect.top) * scale;
        const bigS = this.canvas.width/3, smallS = bigS/3;
        
        const bX = Math.floor(x/bigS), bY = Math.floor(y/bigS);
        const sX = Math.floor((x%bigS)/smallS), sY = Math.floor((y%bigS)/smallS);
        
        if(bX>=0 && bX<3 && bY>=0 && bY<3) {
            // makeMove validiert, ob der Zug im erlaubten Board ist
            if(this.game.makeMove(bY*3+bX, sY*3+sX)) { 
                this.draw();
                this.checkTurn(); 
            }
        }
    },

    updateUI() {
        const stats = document.getElementById('statusText');
        if(this.game.winner) stats.innerText = "SIEG: " + (this.game.winner===1?"BLAU":"ROT");
        else stats.innerText = (this.game.currentPlayer===1?"BLAU":"ROT") + " ist dran";
    },
    
    draw() { TTTRenderer.drawUltimate(this.canvas, this.game); }
};
window.onload = () => UltimateController.init();