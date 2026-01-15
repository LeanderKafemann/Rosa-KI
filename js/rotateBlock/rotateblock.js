const COLORS = ['Red', 'Green', 'Yellow', 'Blue', 'Orange', 'Purple', 'Lime', 'Silver', 'Aqua', 'Navy'];

class Board {
    constructor(id) {
        this.initBoard(id);
        this.moves = 0;
        this.won = false;
    }

    getBoardString(id) {
        const boards = {
            '0': "5###### 0 ##10 ##10 ####x#",
            '1': '8#########     0##     0##112222##33   4##55   4##666  4####x####',
            '2': '12#############          ##     01   ##     01   ##     01   ##    222222##  34    5 ##  34    5 ## 634    5 ## 63477775 ## 63888885 #######x#####',
            '3': '10###########        ##        ##        ##    7775##   11  5##   2 888##990233  ##44066666######x####'
        };
        return boards[id];
    }

    initBoard(id) {
        const str = this.getBoardString(id);
        let offset = 0;
        while (str[offset] !== '#') offset++;
        this.rows = parseInt(str.substring(0, offset));
        const content = str.substring(offset);
        this.cols = content.length / this.rows;
        
        this.grid = [];
        for (let i = 0; i < this.rows; i++) {
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                const char = content[i * this.cols + j];
                if (char === '#') row.push(-2);      // Wand
                else if (char === ' ') row.push(-1); // Leer
                else if (char === 'x') row.push(-3); // Ausgang
                else row.push(parseInt(char));       // Block ID
            }
            this.grid.push(row);
        }
    }

    rotate(clockwise = true) {
        if (this.won) return;
        const newGrid = Array.from({ length: this.cols }, () => Array(this.rows).fill(-1));
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (clockwise) newGrid[c][this.rows - 1 - r] = this.grid[r][c];
                else newGrid[this.cols - 1 - c][r] = this.grid[r][c];
            }
        }
        this.grid = newGrid;
        [this.rows, this.cols] = [this.cols, this.rows];
        this.relaxBoard();
        this.moves++;
    }

    relaxBoard() {
        let changed = true;
        while (changed) {
            changed = false;
            for (let r = this.rows - 2; r >= 0; r--) {
                for (let c = 0; c < this.cols; c++) {
                    const id = this.grid[r][c];
                    if (id >= 0 && this.canFall(r, c, id)) {
                        this.moveDown(r, c, id);
                        changed = true;
                    }
                }
            }
        }
    }

    canFall(r, c, id) {
        const colsWithId = [];
        for (let j = 0; j < this.cols; j++) if (this.grid[r][j] === id) colsWithId.push(j);
        return colsWithId.every(j => this.grid[r+1][j] === -1 || this.grid[r+1][j] === -3);
    }

    moveDown(r, c, id) {
        for (let j = 0; j < this.cols; j++) {
            if (this.grid[r][j] === id) {
                if (this.grid[r + 1][j] === -3) this.won = true;
                this.grid[r + 1][j] = id;
                this.grid[r][j] = -1;
            }
        }
    }

    getStateKey() {
        return this.grid.map(r => r.join(',')).join('|');
    }

    clone() {
        const c = new Board('0');
        c.rows = this.rows; c.cols = this.cols; c.won = this.won;
        c.grid = this.grid.map(r => [...r]);
        return c;
    }

    draw(ctx, canvasSize) {
        const margin = 20;
        const availableSize = canvasSize - (margin * 2);
        const blockSize = availableSize / Math.max(this.rows, this.cols);
        
        const offsetX = (canvasSize - (this.cols * blockSize)) / 2;
        const offsetY = (canvasSize - (this.rows * blockSize)) / 2;

        ctx.strokeStyle = "#333";
        ctx.strokeRect(offsetX, offsetY, this.cols * blockSize, this.rows * blockSize);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const val = this.grid[r][c];
                const x = offsetX + c * blockSize;
                const y = offsetY + r * blockSize;

                if (val === -2) { // Wand
                    ctx.fillStyle = '#2c3e50';
                    ctx.fillRect(x, y, blockSize, blockSize);
                } else if (val === -3) { // Ausgang
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x, y, blockSize, blockSize);
                    ctx.strokeStyle = '#e74c3c';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x+2, y+2, blockSize-4, blockSize-4);
                } else if (val >= 0) { // Block
                    ctx.fillStyle = COLORS[val % COLORS.length];
                    ctx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
                    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                    ctx.strokeRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
                }
            }
        }
    }
}

// --- KI Logik ---
async function solve() {
    const startBoard = currentBoard.clone();
    startBoard.moves = 0;
    let queue = [{ board: startBoard, path: [] }];
    let visited = new Set([startBoard.getStateKey()]);
    
    let nodesExpanded = 0;
    let rejected = 0;

    while (queue.length > 0) {
        const { board, path } = queue.shift();
        nodesExpanded++;

        if (board.won) {
            displaySolution(path, nodesExpanded, rejected);
            return;
        }

        for (const dir of ['L', 'R']) {
            const next = board.clone();
            next.rotate(dir === 'R');
            const key = next.getStateKey();

            if (!visited.has(key)) {
                visited.add(key);
                queue.push({ board: next, path: [...path, dir] });
            } else {
                rejected++;
            }
        }
        if (nodesExpanded % 500 === 0) await new Promise(r => setTimeout(r, 0));
    }
    alert("Keine Lösung gefunden.");
}

function displaySolution(path, nodes, rejected) {
    const output = document.getElementById('aiOutput');
    output.classList.remove('hidden');
    document.getElementById('aiStats').innerText = 
        `Untersuchte Knoten: ${nodes}\nDoppelte Zustände: ${rejected}\nTiefe (Schritte): ${path.length}`;
    document.getElementById('solutionPath').innerText = path.join(' → ');
}

// --- UI Steuerung ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const boardSelect = document.getElementById('boardSelect');
let currentBoard;

function init() {
    canvas.width = 600; canvas.height = 600;
    currentBoard = new Board(boardSelect.value);
    document.getElementById('aiOutput').classList.add('hidden');
    document.getElementById('winMessage').classList.add('hidden');
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentBoard.draw(ctx, 600);
    document.getElementById('moveCount').innerText = currentBoard.moves;
    if (currentBoard.won) document.getElementById('winMessage').classList.remove('hidden');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') currentBoard.rotate(false);
    if (e.key === 'ArrowRight') currentBoard.rotate(true);
    render();
});

boardSelect.addEventListener('change', init);
document.getElementById('resetBtn').addEventListener('click', init);
document.getElementById('solveBtn').addEventListener('click', solve);

init();