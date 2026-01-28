/**
 * @fileoverview Adapter für verschiedene Spiele, damit sie mit der Arena kompatibel sind.
 * Die Arena braucht ein einheitliches Interface für verschiedene Spiele.
 */

/**
 * Factory für verschiedene TTT-Varianten.
 */
const TTTGameFactory = {
    /**
     * Erstellt eine neue TTT Regular (3x3) Instanz.
     */
    createRegular: () => {
        const board = new TTTRegularBoard();
        return new TTTGameAdapter(board, "TTT Regular");
    },

    /**
     * Erstellt eine neue TTT 3D Instanz.
     */
    create3D: () => {
        const board = new TTT3DBoard();
        return new TTTGameAdapter(board, "TTT 3D");
    },

    /**
     * Erstellt eine neue TTT Ultimate Instanz.
     */
    createUltimate: () => {
        const board = new UltimateBoard();
        return new TTTGameAdapter(board, "TTT Ultimate");
    }
};

/**
 * Adapter, der die TTT-Boards als GameState präsentiert.
 * @class TTTGameAdapter
 */
class TTTGameAdapter {
    constructor(board, variant = "TTT") {
        this.board = board;
        this.variant = variant;
    }

    // ===== GameState Interface =====

    get isGameOver() {
        return this.board.winner !== 0;
    }

    get winner() {
        return this.board.winner;
    }

    get currentPlayer() {
        return this.board.currentPlayer;
    }

    /**
     * Gibt alle möglichen Züge zurück.
     */
    getAllValidMoves() {
        return this.board.getAllValidMoves();
    }

    /**
     * Führt einen Zug aus.
     * @param {number|Object} move - Zug (Format hängt vom Spiel ab)
     * @returns {boolean}
     */
    makeMove(move) {
        // Delegate zur Board-Logik
        if (typeof move === 'object' && move.big !== undefined) {
            // Ultimate Format
            return this.board.makeMove(move.big, move.small);
        } else {
            // Regular/3D Format
            return this.board.makeMove(move);
        }
    }

    /**
     * Erstellt eine Deep-Copy des aktuellen Zustands.
     * @returns {TTTGameAdapter}
     */
    clone() {
        const newAdapter = new TTTGameAdapter(
            this._cloneBoard(this.board),
            this.variant
        );
        return newAdapter;
    }

    /**
     * Cloned das Board (private Helper).
     * @private
     */
    _cloneBoard(board) {
        const clone = Object.create(Object.getPrototypeOf(board));
        
        for (const key in board) {
            const val = board[key];
            
            if (Array.isArray(val)) {
                // Array deep-copy
                clone[key] = val.map(item => 
                    Array.isArray(item) ? [...item] : item
                );
            } else if (typeof val === 'object' && val !== null) {
                // Object shallow copy
                clone[key] = { ...val };
            } else {
                clone[key] = val;
            }
        }
        
        return clone;
    }

    /**
     * Hilfsfunktion zur Konvertierung des Board-States zu JSON.
     * Nützlich für Debugging und Replays.
     */
    toJSON() {
        return {
            variant: this.variant,
            board: this.board,
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            isGameOver: this.isGameOver
        };
    }
}

/**
 * Vorkonfigurierte Spiel-Factory-Funktionen für Arena.
 * Wird vom Arena-UI verwendet.
 */
const GameFactories = {
    "TTT Regular": () => TTTGameFactory.createRegular(),
    "TTT 3D": () => TTTGameFactory.create3D(),
    "TTT Ultimate": () => TTTGameFactory.createUltimate()
};

/**
 * Gibt alle verfügbaren Spiele als Liste zurück.
 * @returns {Array<string>}
 */
function getAvailableGames() {
    return Object.keys(GameFactories);
}

/**
 * Erstellt eine neue Spielinstanz nach Name.
 * @param {string} gameName
 * @returns {TTTGameAdapter|null}
 */
function createGame(gameName) {
    const factory = GameFactories[gameName];
    return factory ? factory() : null;
}
