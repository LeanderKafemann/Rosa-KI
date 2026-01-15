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
        this.botEnabled = false;
        this.init();
    }

    init() {
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-btn');
        this.botToggleButton = document.getElementById('bot-toggle-btn');
        this.botStatusElement = document.getElementById('bot-status');

        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.botToggleButton.addEventListener('click', () => this.toggleBot());

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

                // If bot is enabled and it's now the bot's turn (player 'O'), make a random move
                if (this.botEnabled && this.currentPlayerIndex === 1 && !this.gameOver) {
                    setTimeout(() => this.makeRandomMove(), 500); // Delay for better UX
                }
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

    toggleBot() {
        this.botEnabled = !this.botEnabled;
        this.botToggleButton.textContent = this.botEnabled ? 'Disable Bot' : 'Enable Bot';
        this.botStatusElement.textContent = this.botEnabled ? 'Bot: Enabled' : 'Bot: Disabled';
        this.updateDisplay();
    }

    makeRandomMove() {
        const emptyCells = [];
        for (let i = 0; i < 9; i++) {
            if (this.board.grid[i] === null) {
                emptyCells.push(i);
            }
        }
        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const cell = document.querySelector(`.cell[data-index="${randomIndex}"]`);
            const currentPlayer = this.players[this.currentPlayerIndex];

            if (this.board.makeMove(randomIndex, currentPlayer.symbol)) {
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
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
