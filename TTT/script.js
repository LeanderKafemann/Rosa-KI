class Player {
    constructor(symbol) {
        this.symbol = symbol;
    }
}

class Board {
    constructor() {
        this.grid = Array(9).fill(null);
    }

    makeMove(index, symbol) {
        if (this.grid[index] === null) {
            this.grid[index] = symbol;
            return true;
        }
        return false;
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.grid[a] && this.grid[a] === this.grid[b] && this.grid[a] === this.grid[c]) {
                return this.grid[a];
            }
        }
        return null;
    }

    isFull() {
        return this.grid.every(cell => cell !== null);
    }

    reset() {
        this.grid = Array(9).fill(null);
    }
}

class Game {
    constructor() {
        this.board = new Board();
        this.players = [new Player('X'), new Player('O')];
        this.currentPlayerIndex = 0;
        this.gameOver = false;
        this.init();
    }

    init() {
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-btn');

        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        this.resetButton.addEventListener('click', () => this.resetGame());

        this.updateDisplay();
    }

    handleCellClick(event) {
        if (this.gameOver) return;

        const cell = event.target;
        if (!cell.classList.contains('cell')) return;

        const index = parseInt(cell.dataset.index);
        const currentPlayer = this.players[this.currentPlayerIndex];

        if (this.board.makeMove(index, currentPlayer.symbol)) {
            cell.textContent = currentPlayer.symbol;
            cell.classList.add(currentPlayer.symbol.toLowerCase());

            const winner = this.board.checkWinner();
            if (winner) {
                this.gameOver = true;
                this.statusElement.textContent = `Player ${winner} wins!`;
            } else if (this.board.isFull()) {
                this.gameOver = true;
                this.statusElement.textContent = "It's a draw!";
            } else {
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
                this.updateDisplay();
            }
        }
    }

    updateDisplay() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        this.statusElement.textContent = `Player ${currentPlayer.symbol}'s turn`;
    }

    resetGame() {
        this.board.reset();
        this.currentPlayerIndex = 0;
        this.gameOver = false;

        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });

        this.updateDisplay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
