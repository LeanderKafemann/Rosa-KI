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

    checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        
        // Level parameter
        const level = params.get('level');
        if (level !== null) {
            const selectInfo = document.getElementById('boardSelect');
            if (selectInfo && selectInfo.querySelector(`option[value="${level}"]`)) {
                selectInfo.value = level;
            }
        }

        // hide_ai: Versteckt KI-Lösen Button
        if (params.has('hide_ai') || params.get('hide_ai') === 'true') {
            const solveBtn = document.getElementById('solveBtn');
            if (solveBtn) solveBtn.style.display = 'none';
            const hr = document.querySelector('.stats-panel hr');
            if (hr) hr.style.display = 'none';
        }
        
        // hideControls: Versteckt gesamtes Menü
        if (params.has('hideControls') || params.get('hideControls') === 'true') {
            const menu = document.getElementById('menu');
            if (menu) menu.style.display = 'none';
        }
        
        // hideLevelSelect: Versteckt nur die Level-Auswahl
        if (params.has('hideLevelSelect') || params.get('hideLevelSelect') === 'true') {
            const boardSelect = document.getElementById('boardSelect');
            if (boardSelect) {
                const group = boardSelect.closest('.control-group');
                if (group) group.style.display = 'none';
            }
        }
        
        // hideReset: Versteckt Reset Button
        if (params.has('hideReset') || params.get('hideReset') === 'true') {
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) resetBtn.style.display = 'none';
        }
        
        // hideAnimation: Versteckt Animation Checkbox
        if (params.has('hideAnimation') || params.get('hideAnimation') === 'true') {
            const animToggle = document.getElementById('animateToggle');
            if (animToggle) {
                const group = animToggle.closest('.control-group');
                if (group) group.style.display = 'none';
            }
        }
        
        // hideInstructions: Versteckt die Spielbeschreibung
        if (params.has('hideInstructions') || params.get('hideInstructions') === 'true') {
            const instructions = document.querySelector('.instructions');
            if (instructions) instructions.style.display = 'none';
        }

        // hideBackBtn: Versteckt den Zurück Button
        if (params.has('hideBackBtn') || params.get('hideBackBtn') === 'true') {
            const backBtn = document.getElementById('backToMenu');
            if (backBtn) backBtn.style.display = 'none';
        }
    },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.checkUrlParams();

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
        
        // Sende gameState an Parent-Window (für Lernpfad)
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ 
                type: 'gameState',
                rotationCount: this.currentBoard.moves
            }, '*');
        }
        
        if (this.currentBoard.won) {
            document.getElementById('winMessage').classList.remove('hidden');
            // Sende Signal an Parent-Window (für Lernpfad)
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'gameWon' }, '*');
            }
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
            document.getElementById('stat-duplicates').innerText = result.duplicates || 0;
            
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
        
        // Speichere die Lösung, weil reset() sie löscht
        const savedPath = [...this.optimalPath];
        
        this.reset();
        await new Promise(r => setTimeout(r, 200));
        
        // Stelle die Lösung wieder her
        this.optimalPath = savedPath;
        
        for (const move of this.optimalPath) {
            if(this.currentBoard.won) break;
            await this.handleMove(move === 'R');
            await new Promise(r => setTimeout(r, 250));
        }
    }
};

window.RotateController = RotateController;
window.onload = () => RotateController.init();