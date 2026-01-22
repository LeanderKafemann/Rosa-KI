/**
 * ROTATE BOX - Vollständige Spiellogik
 * ---------------------------------------------------------
 * Sektionen:
 * 1. Setup & Konfiguration
 * 2. Klasse Board (Physik & Datenmodell)
 * 3. KI-Engine (Breitensuche)
 * 4. Animations-System (Visueller Fall)
 * 5. UI & Event-Handling
 */

// --- 1. SETUP & KONFIGURATION ---

const COLORS = ['Red', 'Green', 'Yellow', 'Blue', 'Orange', 'Purple', 'Lime', 'Silver', 'Aqua', 'Navy'];

// Fallgeschwindigkeiten je nach Level-Komplexität
const FALL_SPEED_CONFIG = {
    "default": 0.15,
    "0": 0.10, // Langsamer für das Tutorial
    "1": 0.15,
    "2": 0.20,
    "3": 0.25
};

let currentBoard;      // Das aktive Spielobjekt
let optimalPath = [];  // Speichert die Richtungen (L/R) der KI
let isOffPath = false; // Status, ob der Spieler vom KI-Weg abgewichen ist
let isAnimating = false; // Verhindert Mehrfacheingaben während der Lösung

// --- 2. KLASSE BOARD ---

class Board {
    /**
     * @param {string|null} id - Level-ID oder null für Simulation
     */
    constructor(id) {
        this.moves = 0;
        this.won = false;
        this.isFalling = false;
        this.fallOffsets = {}; // Speichert Versatz für flüssige Animationen
        this.isSimulation = (id === null); // Wichtig für KI-Berechnungen
        if (id !== null) this.initBoard(id);
    }

    /** Gibt das Gitter-Layout als String zurück */
    getBoardString(id) {
        const boards = {
            '0': "5###### 0 ##10 ##10 ####x#",
            '1': '8#########     0##     0##112222##33   4##55   4##666  4####x####',
            '2': '12#############          ##     01   ##     01   ##     01   ##    222222##  34    5 ##  34    5 ## 634    5 ## 63477775 ## 63888885 #######x#####',
            '3': '10###########        ##        ##        ##    7775##   11  5##   2 888##990233  ##44066666######x####'
        };
        return boards[id];
    }

    /** Erzeugt das 2D-Array aus dem Level-String */
    initBoard(id) {
        const str = this.getBoardString(id);
        let offset = 0;
        while (str[offset] !== '#') offset++;
        this.rows = parseInt(str.substring(0, offset));
        const content = str.substring(offset);
        this.cols = content.length / this.rows;
        
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                const char = content[r * this.cols + c];
                if (char === '#') row.push(-2);      // Wand
                else if (char === ' ') row.push(-1); // Luft
                else if (char === 'x') row.push(-3); // Ausgang
                else row.push(parseInt(char));       // Block
            }
            this.grid.push(row);
        }
    }

    /** Dreht das Gitter um 90 Grad */
    rotate(clockwise = true) {
        if (this.won || (this.isFalling && !this.isSimulation)) return;

        const newGrid = Array.from({ length: this.cols }, () => Array(this.rows).fill(-1));
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (clockwise) newGrid[c][this.rows - 1 - r] = this.grid[r][c];
                else newGrid[this.cols - 1 - c][r] = this.grid[r][c];
            }
        }
        this.grid = newGrid;
        [this.rows, this.cols] = [this.cols, this.rows];
        
        // Entscheide: Animation (Spieler) oder Sofort-Fall (KI)
        if (!this.isSimulation && document.getElementById('animateToggle').checked && !isAnimating) {
            relaxWithAnimation();
        } else {
            this.relaxBoard();
        }
        this.moves++;
    }

    /** Prüft, ob ein ganzer Block nach unten rücken kann */
    canFall(id) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === id) {
                    if (r + 1 >= this.rows) return false;
                    const target = this.grid[r + 1][c];
                    // Erlaubt: Luft, Ausgang oder das eigene Block-Teil
                    if (target !== -1 && target !== -3 && target !== id) return false;
                }
            }
        }
        return true;
    }

    /** Bewegt alle Teile eines Blocks logisch eine Zeile tiefer */
    moveDown(id) {
        let reachedExit = false;
        for (let r = this.rows - 1; r >= 0; r--) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === id) {
                    if (this.grid[r + 1][c] === -3) reachedExit = true;
                    this.grid[r + 1][c] = id;
                    this.grid[r][c] = -1;
                }
            }
        }
        if (reachedExit) this.won = true;
    }

    /** Lässt alle Blöcke sofort bis zum Anschlag fallen (für KI) */
    relaxBoard() {
        let changed = true;
        while (changed) {
            changed = false;
            let seen = new Set();
            for (let r = this.rows - 2; r >= 0; r--) {
                for (let c = 0; c < this.cols; c++) {
                    const id = this.grid[r][c];
                    if (id >= 0 && !seen.has(id) && this.canFall(id)) {
                        this.moveDown(id);
                        seen.add(id);
                        changed = true;
                    }
                }
            }
        }
    }

    getStateKey() { return this.grid.map(r => r.join(',')).join('|'); }

    clone() {
        const c = new Board(null);
        c.rows = this.rows; c.cols = this.cols; c.won = this.won;
        c.grid = this.grid.map(row => [...row]);
        return c;
    }

    /** Zeichnet das Board unter Berücksichtigung von Animations-Offsets */
    draw(ctx, sz) {
        const m = 20, bs = (sz - m * 2) / Math.max(this.rows, this.cols);
        const ox = (sz - (this.cols * bs)) / 2, oy = (sz - (this.rows * bs)) / 2;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const v = this.grid[r][c], x = ox + c * bs, y = oy + r * bs;
                if (v === -2) { // Wand
                    ctx.fillStyle = '#2c3e50'; ctx.fillRect(x, y, bs, bs);
                } else if (v === -3) { // Ausgang
                    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, bs, bs);
                    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 4; ctx.strokeRect(x+2, y+2, bs-4, bs-4);
                } else if (v >= 0) { // Farbiger Block
                    const off = this.fallOffsets[v] || 0;
                    const vY = y - (off * bs);
                    ctx.fillStyle = COLORS[v % COLORS.length];
                    ctx.fillRect(x + 1, vY + 1, bs - 2, bs - 2);
                    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.strokeRect(x + 1, vY + 1, bs - 2, bs - 2);
                }
            }
        }
    }
}

// --- 3. KI-ENGINE ---

/** Berechnet den kürzesten Weg zum Ziel mittels Breitensuche */
async function solve() {
    const btn = document.getElementById('solveBtn');
    btn.disabled = true; btn.innerText = "Suche...";

    const start = currentBoard.clone();
    let queue = [{ board: start, path: [] }];
    let visited = new Set([start.getStateKey()]);
    let nodes = 0;

    while (queue.length > 0) {
        const { board, path } = queue.shift();
        nodes++;

        if (board.won) {
            displaySolution(path, nodes);
            btn.disabled = false; btn.innerText = "KI Lösung suchen";
            return;
        }

        for (const dir of ['L', 'R']) {
            const next = board.clone();
            next.rotate(dir === 'R');
            const key = next.getStateKey();
            if (!visited.has(key)) {
                visited.add(key);
                queue.push({ board: next, path: [...path, dir] });
            }
        }
        // Verhindert Einfrieren des Browsers bei langen Suchen
        if (nodes % 800 === 0) await new Promise(r => setTimeout(r, 0));
    }
    alert("Keine Lösung gefunden!");
    btn.disabled = false;
}

function displaySolution(path, nodes) {
    optimalPath = path; isOffPath = false;
    document.getElementById('aiOutput').classList.remove('hidden');
    document.getElementById('pathWarning').classList.add('hidden');
    document.getElementById('stat-depth').innerText = path.length;
    document.getElementById('stat-nodes').innerText = nodes;

    const pathDiv = document.getElementById('solutionPath');
    pathDiv.innerHTML = '';
    path.forEach((d, i) => {
        const s = document.createElement('span'); s.className = 'step'; 
        s.id = `step-${i+1}`; s.innerText = d; pathDiv.appendChild(s);
    });
}

// --- 4. ANIMATIONS-SYSTEM ---

/** Lässt Blöcke schrittweise fallen und rendert jeden Frame */
async function relaxWithAnimation() {
    currentBoard.isFalling = true;
    let changed = true;
    const speed = FALL_SPEED_CONFIG[document.getElementById('boardSelect').value] || 0.15;

    while (changed) {
        changed = false;
        let toFall = new Set();

        for (let r = 0; r < currentBoard.rows; r++) {
            for (let c = 0; c < currentBoard.cols; c++) {
                const id = currentBoard.grid[r][c];
                if (id >= 0 && !toFall.has(id) && currentBoard.canFall(id)) toFall.add(id);
            }
        }

        if (toFall.size > 0) {
            changed = true;
            toFall.forEach(id => currentBoard.moveDown(id));
            // Die eigentliche Gleit-Animation
            await new Promise(res => {
                let off = 1.0;
                function step() {
                    off -= speed;
                    toFall.forEach(id => currentBoard.fallOffsets[id] = off);
                    render();
                    if (off > 0) requestAnimationFrame(step);
                    else { toFall.forEach(id => delete currentBoard.fallOffsets[id]); res(); }
                }
                step();
            });
        }
    }
    currentBoard.isFalling = false;
}

/** Spielt die KI-Lösung automatisch ab */
async function animateSolution() {
    if (isAnimating) return;
    init();
    const steps = document.querySelectorAll('.step');
    if (steps.length === 0) return;
    
    isAnimating = true;
    document.getElementById('animateBtn').disabled = true;

    for (let i = 0; i < steps.length; i++) {
        if (!isAnimating) break;
        currentBoard.rotate(steps[i].innerText === 'R');
        render();
        const delay = 2100 - document.getElementById('speedSlider').value;
        await new Promise(r => setTimeout(r, delay));
        // Warten, bis alle Blöcke ausgeglitten sind
        while(currentBoard.isFalling) await new Promise(r => setTimeout(r, 50));
    }
    isAnimating = false;
    document.getElementById('animateBtn').disabled = false;
}

// --- 5. UI & EVENT-HANDLING ---

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

/** Setzt das Spiel zurück */
function init() {
    canvas.width = 600; canvas.height = 600;
    currentBoard = new Board(document.getElementById('boardSelect').value);
    optimalPath = []; isOffPath = false;
    document.getElementById('aiOutput').classList.add('hidden');
    document.getElementById('winMessage').classList.add('hidden');
    render();
}

/** Aktualisiert die Anzeige */
function render() {
    if (!currentBoard) return;
    ctx.clearRect(0, 0, 600, 600);
    currentBoard.draw(ctx, 600);
    document.getElementById('moveCount').innerText = currentBoard.moves;

    // Aktiven Schritt in der KI-Leiste markieren
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    if (!isOffPath) {
        const s = document.getElementById(`step-${currentBoard.moves}`);
        if (s) {
            s.classList.add('active');
            s.scrollIntoView({behavior:'smooth', block:'nearest'});
        }
    }
    if (currentBoard.won) document.getElementById('winMessage').classList.remove('hidden');
}

// Tastatursteuerung
window.addEventListener('keydown', (e) => {
    if (!currentBoard || currentBoard.isFalling || isAnimating || currentBoard.won) return;
    let d = e.key === 'ArrowLeft' ? 'L' : e.key === 'ArrowRight' ? 'R' : null;
    if (d) {
        // Prüfen, ob der Spieler noch auf dem KI-Weg ist
        if (optimalPath.length > 0 && !isOffPath) {
            if (d !== optimalPath[currentBoard.moves]) {
                isOffPath = true;
                document.getElementById('pathWarning').classList.remove('hidden');
            }
        }
        currentBoard.rotate(d === 'R');
        render();
    }
});

// Event-Listener für Buttons
document.getElementById('boardSelect').addEventListener('change', init);
document.getElementById('resetBtn').addEventListener('click', init);
document.getElementById('solveBtn').addEventListener('click', solve);
document.getElementById('animateBtn').addEventListener('click', animateSolution);

// Spiel starten
init();