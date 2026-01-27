/* --- FILE: js/games/tictactoe/3d-controller.js --- */
/**
 * @fileoverview Controller für 3D Tic-Tac-Toe.
 * Verwaltet User Input, KI-Turns und Rendering.
 */
const ThreeDController = {
    game: null, 
    canvas: null, 
    isoCanvas: null, 
    axis: 'z', 
    size: 3, 
    isProcessing: false,

    /** Initialisiert das Spiel. */
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.isoCanvas = document.getElementById('isoCanvas');
        this.canvas.addEventListener('mousedown', (e) => this.click(e));
        
        // KI Dropdowns überwachen
        document.getElementById('p1Type').onchange = () => this.checkTurn();
        document.getElementById('p2Type').onchange = () => this.checkTurn();
        this.reset();
    },

    /** Ändert die Brettgröße (3 oder 4). */
    setSize(s) {
        this.size = s;
        document.querySelectorAll('.size-btn').forEach(b => {
            b.classList.remove('active');
            if(b.innerText.includes(s)) b.classList.add('active');
        });
        this.reset();
    },

    /** Ändert die Ansichtsachse. */
    setAxis(a) {
        this.axis = a;
        document.querySelectorAll('.view-btn').forEach(b => {
            b.classList.remove('active');
            // Einfacher String-Check für Button-Highlighting
            if(b.innerText.toLowerCase().includes(a === 'z' ? 'oben' : a === 'y' ? 'vorne' : 'seite')) b.classList.add('active');
        });
        this.draw();
    },

    /** Resettet das Spiel. */
    reset() {
        this.game = new TTT3DBoard(this.size);
        this.isProcessing = false;
        this.updateUI(); 
        this.draw(); 
        this.checkTurn();
    },

    /** Prüft, ob eine KI am Zug ist. */
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
                // KI Instanzieren
                let agent;
                if (current === 'random') {
                    agent = new RandomAgent();
                } else if (current === 'rulebased') {
                    agent = new RuleBasedAgent(createStrategyTree('3d'));
                } else if (current === 'minimax') {
                    // 3D ist sehr komplex (Branching Factor hoch). 
                    // Tiefe muss stark begrenzt sein (2-3), sonst hängt der Browser.
                    // Da wir keine spezielle 3D-Heuristik haben, nutzen wir winLoss,
                    // was bei geringer Tiefe "kurzsichtig" ist, aber besser als Random.
                    agent = new MinimaxAgent({ 
                        name: "Minimax 3D",
                        maxDepth: 2, 
                        useAlphaBeta: true,
                        // Optional: Hier könnte man eine Heuristik injecten, die Linien zählt
                        heuristicFn: HeuristicsLibrary.winLoss 
                    });
                }
                
                const action = agent ? agent.getAction(this.game) : null;
                
                if(action) this.game.makeMove(action.move);
                
                this.isProcessing = false;
                this.draw(); 
                this.checkTurn();
            }, speed);
        }
    },

    /** Verarbeitet Klicks auf das Canvas. */
    click(e) {
        if(this.isProcessing || this.game.winner) return;
        // --- INPUT SCALING FIX ---
        const rect = this.canvas.getBoundingClientRect();
        // Verhältnis Canvas-Pixel zu Display-Pixel
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        // Mausposition im Canvas-Koordinatensystem
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        // Layout-Konstanten (identisch zum Renderer)
        const w = this.canvas.width, h = this.canvas.height, s = this.size;
        const pad = 20;
        const availW = w - (pad*2);
        const availH = h - (pad*2);
        const boxSize = Math.min(availW / s, availH);
        const gap = boxSize * 0.1;
        const boardS = boxSize - gap;
        // Effektive Brettgröße
        const startX = (w - s*boxSize)/2 + gap/2;
        const startY = (h - boardS)/2 + 10;

        // Hit-Testing: Welches Slice (k)?
        for(let k=0; k<s; k++) {
            const ox = startX + k*boxSize;
            // Prüfen ob Klick im Bereich dieses Boards liegt
            if(mx >= ox && mx <= ox+boardS && my >= startY && my <= startY+boardS) {
                // Zeile und Spalte berechnen
                const c = Math.floor((mx-ox)/(boardS/s));
                const r = Math.floor((my-startY)/(boardS/s));
                
                // Mapping auf 3D Koordinaten
                let x,y,z;
                if(this.axis==='z') { z=k; y=r; x=c; }
                else if(this.axis==='y') { y=k; x=c; z=(s-1)-r; }
                else { x=k; y=c; z=(s-1)-r; }

                // Index berechnen
                const idx = z*(s*s) + y*s + x;
                // Zug ausführen
                if(this.game.makeMove(idx)) { 
                    this.draw();
                    this.checkTurn(); 
                }
                break;
            }
        }
    },

    updateUI() {
        const stats = document.getElementById('statusText');
        if(this.game.winner) stats.innerText = "SIEG: " + (this.game.winner===1?"BLAU":"ROT");
        else stats.innerText = (this.game.currentPlayer===1?"BLAU":"ROT") + " ist dran";
    },
    
    draw() {
        TTTRenderer.draw3DSlices(this.canvas, this.game, this.axis);
        TTTRenderer.drawIsoView(this.isoCanvas, this.game);
    }
};
window.onload = () => ThreeDController.init();