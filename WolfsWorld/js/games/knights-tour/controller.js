/**
 * @fileoverview Controller für das Springerproblem.
 * Steuert Interaktionen, KI-Lösung und Unterbrechung.
 */

const Game = {
    /** @type {KnightBoard|null} */
    board: null,
    /** @type {HTMLCanvasElement|null} */
    canvas: null,
    
    /** @type {boolean} Läuft der Solver gerade? */
    isSolving: false,
    /** @type {boolean} Wurde Stopp angefordert? */
    stopRequested: false,
    
    init() {
        this.canvas = document.getElementById('boardCanvas');
        // Maus und Touch Events
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        
        document.getElementById('sizeSelect').onchange = () => this.reset();
        document.getElementById('chkShowMoves').onchange = () => this.draw();

        this.reset();
    },

    /**
     * Resettet das Spiel und stoppt laufende KI-Prozesse.
     */
    reset() {
        // Falls KI läuft: Stoppen!
        if (this.isSolving) {
            this.stopRequested = true;
            // Wir lassen der KI kurz Zeit zu stoppen, bevor wir das Board tauschen,
            // sonst zeichnet sie evtl. noch einmal auf das alte Board.
            // Aber: User will sofort Reset. 
            // Lösung: Wir tauschen das Board, die KI schreibt evtl. noch einen Frame ins Leere (egal).
        }

        const sizeVal = document.getElementById('sizeSelect').value;
        const size = parseInt(sizeVal);
        
        this.board = new KnightBoard(size);
        
        // Canvas Größe an Container anpassen oder fix lassen
        this.canvas.width = 600; 
        this.canvas.height = 600; 
        
        this.updateUI();
        this.draw();
    },

    /**
     * Wechselt zwischen "Lösen" und "Stoppen".
     */
    toggleSolver() {
        if (this.isSolving) {
            this.stopRequested = true;
            // UI wird im Loop aktualisiert
        } else {
            this.solveFast();
        }
    },

    /**
     * Startet die KI-Lösung.
     */
    async solveFast() {
        if (!this.board.currentPos) {
            alert("Bitte setze zuerst eine Startfigur auf das Brett!");
            return;
        }
        if (this.board.won) return;

        // Status setzen
        this.isSolving = true;
        this.stopRequested = false;
        this.updateUI();

        // Engine konfigurieren
        const engine = new SearchEngine({
            strategy: 'DFS', 
            maxDepth: 2000,
            checkDuplicates: true, // Zyklen vermeiden
            
            // Warnsdorf-Heuristik: Wähle Feld mit wenigsten Nachfolgern
            sortSuccessors: (nodeA, nodeB) => {
                const degA = nodeA.state.getPossibleMoves().length;
                const degB = nodeB.state.getPossibleMoves().length;
                return degA - degB;
            },
            
            // Callback pro Schritt (für Animation & Abbruch)
            onStep: async (state) => {
                // 1. Abbruch prüfen
                if (this.stopRequested) {
                    return 'STOP'; // Signal an SearchEngine
                }

                // 2. Zeichnen
                const delay = parseInt(document.getElementById('solveSpeed').value);
                
                // Um Performance zu sparen bei 0 Delay nicht jeden Frame zeichnen
                if (delay > 0 || Math.random() < 0.05) {
                    KnightRenderer.draw(this.canvas, state, { showPossibleMoves: false });
                    if (delay > 0) await new Promise(r => setTimeout(r, delay));
                }
            }
        });

        // Starten
        const result = await engine.solve(this.board);
        
        // Aufräumen
        this.isSolving = false;
        this.stopRequested = false;
        
        if (result.stopped) {
            // Wurde abgebrochen -> UI updaten, Board so lassen wie es ist
            this.updateUI();
            return; 
        }

        if (!result.success) {
            alert("Sackgasse! Keine Lösung von hier.");
            this.draw(); // Originalzustand zeichnen
        } else {
            // Lösung gefunden -> Auf echtes Board anwenden
            // (Die Visualisierung lief auf Kopien)
            // Wir "beamen" das Board in den Endzustand oder spielen schnell ab
            for (const move of result.path) {
                this.board.move(move.r, move.c);
            }
            this.draw();
            setTimeout(() => alert("Gelöst!"), 50);
        }
        this.updateUI();
    },

    handleInput(e) {
        // Eingabe sperren während KI läuft
        if (this.board.won || this.isSolving) return;

        const rect = this.canvas.getBoundingClientRect();
        // Skalierung beachten, falls CSS Canvas Größe ändert
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX; 
        const y = (e.clientY - rect.top) * scaleY; 
        
        const padding = 30; // Muss mit Renderer übereinstimmen
        const availableW = this.canvas.width - padding;
        const cellSize = availableW / this.board.size;

        // Klick im Padding (links)?
        if (x < padding) return;

        const col = Math.floor((x - padding) / cellSize);
        const row = Math.floor(y / cellSize);

        if (row >= 0 && row < this.board.size && col >= 0 && col < this.board.size) {
            if (this.board.move(row, col)) {
                this.draw();
                this.updateUI();
                if (this.board.won) setTimeout(() => alert("Gewonnen!"), 100);
            }
        }
    },

    undo() {
        if (this.isSolving) return;
        this.board.undo();
        this.draw();
        this.updateUI();
    },

    updateUI() {
        const max = this.board.size * this.board.size;
        document.getElementById('stats').innerText = `Züge: ${this.board.moveCount} / ${max}`;
        
        // Button Text und Style ändern
        const btn = document.getElementById('solveBtn');
        if (this.isSolving) {
            btn.innerText = "⏹ Stoppen";
            btn.className = "viz-btn btn-danger"; // Rot
        } else {
            btn.innerText = "⚡ Automatisch Lösen";
            btn.className = "viz-btn btn-action"; // Blau/Grün
        }
    },

    draw() {
        const showMoves = document.getElementById('chkShowMoves').checked;
        
        KnightRenderer.draw(this.canvas, this.board, { 
            showPossibleMoves: showMoves,
            showWarnsdorf: false, 
            highContrast: false 
        });
    }
};

window.onload = () => Game.init();