/**
 * @fileoverview Controller für das Springerproblem.
 * Steuert Interaktionen, KI-Lösung und Unterbrechung.
 */

const Game = {
    /**
     * Das aktuelle Spielbrett.
     * @type {KnightBoard|null}
     */
    board: null,
    /**
     * Canvas-Element für Rendering.
     * @type {HTMLCanvasElement|null}
     */
    canvas: null,
    
    /**
     * Läuft der Solver gerade?
     * @type {boolean}
     */
    isSolving: false,
    /**
     * Wurde Stopp angefordert?
     * @type {boolean}
     */
    stopRequested: false,
    
    /**
     * Callbacks für Integration (z.B. Tree Viz)
     */
    onMoveCallback: null,
    onUndoCallback: null,
    onResetCallback: null,
    
    init() {
        this.canvas = document.getElementById('boardCanvas');
        if (this.canvas) {
            // Maus und Touch Events (nur wenn nicht von Visualisierung überschrieben)
            this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        }
        
        const sizeSelect = document.getElementById('sizeSelect');
        const chkShowMoves = document.getElementById('chkShowMoves');
        const chkShowWarnsdorf = document.getElementById('chkShowWarnsdorf');
        
        if (sizeSelect) sizeSelect.onchange = () => this.reset();
        if (chkShowMoves) chkShowMoves.onchange = () => this.draw();
        if (chkShowWarnsdorf) chkShowWarnsdorf.onchange = () => this.draw();

        this.reset();
    },

    /**
     * Resettet das Spiel und stoppt laufende KI-Prozesse.
     */
    reset() {
        // Falls KI läuft: Stoppen!
        if (this.isSolving) {
            this.stopRequested = true;
        }

        const sizeSelect = document.getElementById('sizeSelect');
        const sizeVal = sizeSelect ? sizeSelect.value : '6';
        const size = parseInt(sizeVal);
        
        this.board = new KnightBoard(size);
        
        // Canvas Größe an Container anpassen oder fix lassen
        if (this.canvas) {
            this.canvas.width = 600; 
            this.canvas.height = 600;
        }
        
        // KI-Counter zurücksetzen
        const aiStats = document.getElementById('aiStats');
        if (aiStats) aiStats.innerText = 'KI Knoten: 0';
        
        this.updateUI();
        this.draw();
        
        // Callback aufrufen
        if (this.onResetCallback) {
            this.onResetCallback();
        }
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
        // Wenn kein Startfeld definiert ist, setze den Springer automatisch unten links
        if (!this.board.currentPos) {
            const startRow = this.board.size - 1;  // Unten
            const startCol = 0;                     // Links
            this.board.move(startRow, startCol);
            this.draw();
        }
        
        if (this.board.won) return;

        // Status setzen
        this.isSolving = true;
        this.stopRequested = false;
        this.updateUI();

        // Warnsdorf-Checkbox prüfen
        const useWarnsdorf = document.getElementById('chkShowWarnsdorf').checked;

        // Engine konfigurieren
        const engine = new SearchEngine({
            strategy: 'DFS', 
            maxDepth: 2000,
            checkDuplicates: true, // Zyklen vermeiden
            
            // Warnsdorf-Heuristik: Wähle Feld mit wenigsten Nachfolgern (nur wenn aktiviert)
            sortSuccessors: useWarnsdorf ? (nodeA, nodeB) => {
                const degA = nodeA.state.getPossibleMoves().length;
                const degB = nodeB.state.getPossibleMoves().length;
                return degA - degB;
            } : null,
            
            // Callback pro Schritt (für Animation & Abbruch)
            onStep: async (state, openListSize, nodesVisited) => {
                // 1. Abbruch prüfen
                if (this.stopRequested) {
                    return 'STOP'; // Signal an SearchEngine
                }

                // 2. Counter aktualisieren
                document.getElementById('aiStats').innerText = `KI Knoten: ${nodesVisited}`;

                // 3. Zeichnen
                const sliderValue = parseInt(document.getElementById('solveSpeed').value);
                // Invertierte Logik: 0 = schnell, 200 = langsam
                const delay = 200 - sliderValue;
                
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
            // Check if user clicked the previous square (undo move)
            if (this.board.isUndoMove(row, col)) {
                this.undo();
                return;
            }
            
            if (this.board.move(row, col)) {
                this.draw();
                this.updateUI();
                
                // Callback aufrufen
                if (this.onMoveCallback) {
                    this.onMoveCallback(row, col);
                }
                
                if (this.board.won) setTimeout(() => alert("Gewonnen!"), 100);
            }
        }
    },

    undo() {
        if (this.isSolving) return;
        this.board.undo();
        this.draw();
        this.updateUI();
        
        // Callback aufrufen
        if (this.onUndoCallback) {
            this.onUndoCallback();
        }
    },

    updateUI() {
        const statsEl = document.getElementById('stats');
        if (statsEl) {
            const max = this.board.size * this.board.size;
            statsEl.innerText = `Züge: ${this.board.moveCount} / ${max}`;
        }
        
        // Button Text und Style ändern
        const btn = document.getElementById('solveBtn');
        if (btn) {
            if (this.isSolving) {
                btn.innerText = "⏹ Stoppen";
                btn.className = "viz-btn btn-danger"; // Rot
            } else {
                btn.innerText = "⚡ Automatisch Lösen";
                btn.className = "viz-btn btn-action"; // Blau/Grün
            }
        }
    },

    draw() {
        if (!this.canvas || !this.board) return;
        
        const chkShowMoves = document.getElementById('chkShowMoves');
        const chkShowWarnsdorf = document.getElementById('chkShowWarnsdorf');
        
        const showMoves = chkShowMoves ? chkShowMoves.checked : false;
        const showWarnsdorf = chkShowWarnsdorf ? chkShowWarnsdorf.checked : false;
        
        KnightRenderer.draw(this.canvas, this.board, { 
            showPossibleMoves: showMoves,
            showWarnsdorf: showWarnsdorf, 
            highContrast: false 
        });
    }
};

window.onload = () => Game.init();