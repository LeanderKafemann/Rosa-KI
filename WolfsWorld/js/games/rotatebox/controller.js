/**
 * Controller RotateBox.
 * @fileoverview 
 */
const RotateController = {
    currentBoard: null,
    optimalPath: [],
    isOffPath: false,
    isAnimating: false,
    canvas: null,
    ctx: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        document.getElementById('boardSelect').onchange = () => this.reset();
        document.getElementById('resetBtn').onclick = () => this.reset();
        document.getElementById('solveBtn').onclick = () => this.runAISolver();
        
        const animBtn = document.getElementById('animateBtn');
        if (animBtn) animBtn.onclick = () => this.playSolution();

        window.addEventListener('keydown', (e) => {
            if (["ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
            if (e.key === 'ArrowLeft') this.handleMove(false);
            if (e.key === 'ArrowRight') this.handleMove(true);
        });

        this.reset();
    },

    reset() {
        const selector = document.getElementById('boardSelect');
        this.currentBoard = new RotateBoard(selector.value);
        this.optimalPath = []; 
        this.isOffPath = false;
        this.isAnimating = false;
      
        document.getElementById('winMessage').classList.add('hidden');
        document.getElementById('aiOutput').classList.add('hidden');
        document.getElementById('pathWarning').classList.add('hidden');
        document.getElementById('solutionPath').innerHTML = '';
        
        document.getElementById('solveBtn').disabled = false;
        document.getElementById('solveBtn').innerText = "KI Lösung suchen 🧠";
        
        this.updateStats();
        this.render();
    },

    async handleMove(isRight) {
        if (!this.currentBoard || this.currentBoard.won || this.isAnimating) return;
        
        const moveChar = isRight ? 'R' : 'L';
        this.currentBoard.rotate(isRight);

        // Pfad-Check
        if (this.optimalPath.length > 0 && !this.isOffPath) {
            // moves ist 1-basiert, Array ist 0-basiert
            if (moveChar !== this.optimalPath[this.currentBoard.moves - 1]) {
                this.isOffPath = true;
                document.getElementById('pathWarning').classList.remove('hidden');
            }
        }

        // --- HIGHLIGHTING LOGIK ---
        this.updatePathHighlighting();

        const useAnimation = document.getElementById('animateToggle').checked;
        if (useAnimation) {
            this.isAnimating = true;
            await animateRelax(this.currentBoard, this.canvas, this.ctx, 0.15, () => this.render());
            this.isAnimating = false;
        } else {
            this.currentBoard.relaxBoardSync(); 
            this.render();
        }
        
        if (this.currentBoard.won) {
            document.getElementById('winMessage').classList.remove('hidden');
        }
        this.updateStats();
        this.render();
    },

    updatePathHighlighting() {
        // 1. Alle entfernen
        document.querySelectorAll('.step-badge').forEach(el => el.classList.remove('active'));
        
        // 2. Aktuellen finden
        // Wir suchen das Badge mit der ID "step-X", wobei X der aktuelle Move-Count ist.
        // Bsp: Nach 1. Zug (moves=1) soll Badge "step-1" leuchten.
        const currentMove = this.currentBoard.moves;
        const activeBadge = document.getElementById(`step-${currentMove}`);
        
        if (activeBadge) {
            activeBadge.classList.add('active');
            // Auto-Scroll, damit das Badge sichtbar bleibt
            activeBadge.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    },

    render() {
        if (!this.currentBoard) return;
        drawRotateBoard(this.currentBoard, this.canvas, this.ctx);
    },
    
    updateStats() {
        document.getElementById('moveCount').innerText = this.currentBoard.moves;
    },

    async runAISolver() {
        const btn = document.getElementById('solveBtn');
        btn.disabled = true;
        btn.innerText = "Rechne...";
        
        const simBoard = this.currentBoard.clone(); 
        const result = await solveBFS(simBoard);
        
        if (result) {
            this.optimalPath = result.path;
            
            document.getElementById('aiOutput').classList.remove('hidden');
            document.getElementById('stat-depth').innerText = result.path.length;
            document.getElementById('stat-nodes').innerText = result.nodes;
            
            const pathDiv = document.getElementById('solutionPath');
            pathDiv.innerHTML = '';
            
            // Badges rendern
            // Start-Offset: Falls User schon 5 Züge gemacht hat, beginnt der Pfad bei Schritt 6.
            const startMove = this.currentBoard.moves;
            
            result.path.forEach((dir, i) => {
                const span = document.createElement('span');
                span.className = 'step-badge';
                // ID generieren: step-(Start + Index + 1)
                span.id = `step-${startMove + i + 1}`;
                span.innerText = dir;
                pathDiv.appendChild(span);
            });
            
            this.isOffPath = false;
            document.getElementById('pathWarning').classList.add('hidden');
            btn.innerText = "Lösung anzeigen";
        } else {
            alert("Keine Lösung gefunden!");
            btn.innerText = "Nichts gefunden";
        }
        
        btn.disabled = false;
    },

    async playSolution() {
        if (this.optimalPath.length === 0 || this.isAnimating) return;
        
        this.reset();
        await new Promise(r => setTimeout(r, 200));
        await this.runAISolver(); 
        
        for (const move of this.optimalPath) {
            if(this.currentBoard.won) break;
            await this.handleMove(move === 'R');
            await new Promise(r => setTimeout(r, 250));
        }
    }
};

window.onload = () => RotateController.init();