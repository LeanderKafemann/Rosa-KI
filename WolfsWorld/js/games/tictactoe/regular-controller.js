/* --- FILE: js/games/tictactoe/regular-controller.js --- */
/** * @fileoverview Controller für 3x3 Tic-Tac-Toe.
 */
const RegularController = {
    game: null, canvas: null, isProcessing: false,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        document.getElementById('p1Type').onchange = () => this.checkTurn();
        document.getElementById('p2Type').onchange = () => this.checkTurn();
        
        // Füge Minimax Optionen zum UI hinzu falls noch nicht im HTML hardcoded
        // (Optional, hier gehen wir davon aus, dass das HTML Dropdown bereits "minimax" enthält 
        // oder wir es dynamisch handhaben könnten. Der User hat "im Menu auswählbar" gefordert, 
        // das impliziert meist HTML Änderungen, aber ich mache den Controller robust dafür).
        
        this.reset();
    },

    reset() {
        this.game = new TTTRegularBoard();
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
            const sliderValue = parseInt(document.getElementById('aiSpeed').value);
            // Invertierte Logik: 0 = schnell, 2000 = langsam
            const speed = 2000 - sliderValue;
            setTimeout(() => {
                // KI Zug
                let agent;
                if (current === 'random') {
                    agent = new RandomAgent();
                } else if (current === 'rulebased') {
                    agent = new RuleBasedAgent(createStrategyTree('regular'));
                } else if (current === 'minimax') {
                    // Regular TTT ist klein genug für volle Tiefe (9)
                    agent = new MinimaxAgent({ 
                        name: "Minimax God",
                        maxDepth: 9, 
                        useAlphaBeta: true,
                        heuristicFn: HeuristicsLibrary.regularTTT 
                    });
                }

                const action = agent ? agent.getAction(this.game) : null;
                
                if(action) this.game.makeMove(action.move);
                
                this.isProcessing = false;
                this.draw(); this.checkTurn();
            }, speed);
        }
    },

    handleClick(e) {
        if(this.isProcessing || this.game.winner) return;
        const rect = this.canvas.getBoundingClientRect();
        // Scaling berücksichtigen
        const scale = this.canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scale;
        const y = (e.clientY - rect.top) * scale;
        const s = this.canvas.width / 3;
        const c = Math.floor(x/s), r = Math.floor(y/s);
        if(c>=0 && c<3 && r>=0 && r<3) {
            if(this.game.makeMove(r*3+c)) { 
                this.draw();
                this.checkTurn(); 
            }
        }
    },

    updateUI() {
        const stats = document.getElementById('statusText');
        if(this.game.winner) stats.innerText = "SIEG: " + (this.game.winner===1?"BLAU":"ROT");
        else if(this.game.getAllValidMoves().length===0) stats.innerText = "REMIS";
        else stats.innerText = (this.game.currentPlayer===1?"BLAU":"ROT") + " ist dran";
    },
    
    draw() { TTTRenderer.drawRegular(this.canvas, this.game); }
};
window.onload = () => RegularController.init();