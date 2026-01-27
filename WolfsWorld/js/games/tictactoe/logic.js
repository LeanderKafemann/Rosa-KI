/**
 * @fileoverview Zentrale Spiellogik für die Tic-Tac-Toe Varianten.
 * Beinhaltet die Klassen für Regular (3x3), 3D (NxNxN) und Ultimate.
 * Implementiert das GameState Interface.
 */

/**
 * Abstrakte Basisklasse für Tic-Tac-Toe Spiele.
 * @abstract
 */
class TTTBase {
    constructor() {
        /** * Aktueller Spieler. 
         * 1 = Spieler 1 (Blau/Kreis), 2 = Spieler 2 (Rot/Kreuz).
         * @type {number} 
         */
        this.currentPlayer = 1;

        /**
         * Gewinner des Spiels.
         * 0 = Laufend, 1 = Spieler 1, 2 = Spieler 2, 3 = Remis.
         * @type {number}
         */
        this.winner = 0;
    }

    /**
     * Wechselt den aktiven Spieler (1 -> 2 -> 1).
     */
    switchPlayer() {
        this.currentPlayer = (this.currentPlayer === 1) ? 2 : 1;
    }
}

/**
 * Klassisches 3x3 Tic-Tac-Toe Board.
 * @extends TTTBase
 */
class TTTRegularBoard extends TTTBase {
    constructor() {
        super();
        /** * Das 3x3 Gitter als flaches Array (Indizes 0-8).
         * 0 = Leer, 1 = Spieler 1, 2 = Spieler 2.
         * @type {number[]} 
         */
        this.grid = Array(9).fill(0);
    }

    /**
     * Liefert alle Indizes von leeren Feldern.
     * Liste der möglichen Züge.
     * @returns {number[]} 
     */
    getAllValidMoves() {
        if (this.winner !== 0) return [];
        // Map erzeugt Array gleicher Länge, filter entfernt die -1er
        return this.grid.map((val, idx) => val === 0 ? idx : -1).filter(idx => idx !== -1);
    }

    /**
     * Führt einen Zug an der Position index aus.
     * - Index des Feldes (0-8).
     * @param {number} index 
     * True, wenn der Zug gültig war.
     * @returns {boolean} 
     */
    makeMove(index) {
        // Validierung: Index im Bereich, Feld leer, Spiel läuft
        if (index < 0 || index >= 9 || this.grid[index] !== 0 || this.winner !== 0) {
            return false;
        }

        // Setzen
        this.grid[index] = this.currentPlayer;

        // Status prüfen
        this.checkWin();

        // Spielerwechsel (nur wenn Spiel nicht vorbei)
        if (this.winner === 0) {
            this.switchPlayer();
        }
        return true;
    }

    /**
     * Überprüft alle 8 Gewinnlinien auf 3 Gleiche.
     * Setzt this.winner entsprechend.
     */
    checkWin() {
        const lines = [
            [0,1,2], [3,4,5], [6,7,8], // Horizontal
            [0,3,6], [1,4,7], [2,5,8], // Vertikal
            [0,4,8], [2,4,6]           // Diagonal
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (this.grid[a] !== 0 && 
                this.grid[a] === this.grid[b] && 
                this.grid[b] === this.grid[c]) {
                this.winner = this.grid[a];
                return;
            }
        }

        // Remis Check (Brett voll, kein Gewinner)
        if (!this.grid.includes(0)) {
            this.winner = 3;
        }
    }

    /**
     * Erstellt eine tiefe Kopie des Boards (für KI-Simulationen).
     * @returns {TTTRegularBoard}
     */
    clone() {
        const copy = new TTTRegularBoard();
        copy.grid = [...this.grid];
        copy.currentPlayer = this.currentPlayer;
        copy.winner = this.winner;
        return copy;
    }

    /**
     * Generiert einen eindeutigen String für diesen Zustand.
     *  Hash Key.
     * @returns {string}
     */
    getStateKey() {
        return this.grid.join('') + this.currentPlayer;
    }
}

/**
 * 3D Tic-Tac-Toe Board (Würfel).
 * Unterstützt variable Größen (z.B. 3x3x3 oder 4x4x4).
 * @extends TTTBase
 */
class TTT3DBoard extends TTTBase {
    /**
     * @param {number} [size=3] - Kantenlänge des Würfels.
     */
    constructor(size = 3) {
        super();
        this.size = size;
        this.totalCells = size * size * size;
        /** * Das 3D Gitter als flaches Array.
         * Index = z * size^2 + y * size + x
         * @type {number[]} 
         */
        this.grid = Array(this.totalCells).fill(0);
    }

    /**
     * Liefert alle leeren Felder im Würfel.
     * @returns {number[]}
     */
    getAllValidMoves() {
        if (this.winner !== 0) return [];
        const moves = [];
        for (let i = 0; i < this.totalCells; i++) {
            if (this.grid[i] === 0) moves.push(i);
        }
        return moves;
    }

    /**
     * Setzt einen Stein an index.
     * - Berechneter Index im flachen Array.
     * @param {number} index 
     * @returns {boolean}
     */
    makeMove(index) {
        if (index < 0 || index >= this.totalCells || this.grid[index] !== 0 || this.winner !== 0) {
            return false;
        }

        this.grid[index] = this.currentPlayer;
        this.checkWin();

        if (this.winner === 0) {
            this.switchPlayer();
        }
        return true;
    }

    /**
     * Prüft alle möglichen Gewinnlinien im 3D Raum.
     * Es gibt 13 Richtungsvektoren (Achsen, Flächendiagonalen, Raumdiagonalen).
     */
    checkWin() {
        // Richtungsvektoren (dx, dy, dz)
        const directions = [
            [1,0,0], [0,1,0], [0,0,1],       // 3 Achsen
            [1,1,0], [1,-1,0], [1,0,1], [1,0,-1], [0,1,1], [0,1,-1], // 6 Flächendiagonalen
            [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1] // 4 Raumdiagonalen
        ];

        // Wir iterieren durch jede Zelle als potentiellen Startpunkt
        for (let z = 0; z < this.size; z++) {
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    const idx = this._getIndex(x, y, z);
                    const player = this.grid[idx];

                    if (player === 0) continue;

                    // Von hier aus in alle Richtungen prüfen
                    for (const dir of directions) {
                        if (this._checkLine(x, y, z, dir[0], dir[1], dir[2], player)) {
                            this.winner = player;
                            return;
                        }
                    }
                }
            }
        }

        // Remis
        if (!this.grid.includes(0)) {
            this.winner = 3;
        }
    }

    /**
     * Prüft eine spezifische Linie vom Startpunkt (x,y,z) in Richtung (dx,dy,dz).
     * @private
     */
    _checkLine(x, y, z, dx, dy, dz, player) {
        // 1. Prüfen, ob die Linie überhaupt lang genug sein kann (Bounds Check am Endpunkt)
        const endX = x + dx * (this.size - 1);
        const endY = y + dy * (this.size - 1);
        const endZ = z + dz * (this.size - 1);

        if (endX < 0 || endX >= this.size ||
            endY < 0 || endY >= this.size ||
            endZ < 0 || endZ >= this.size) {
            return false;
        }

        // 2. Linie ablaufen
        for (let i = 1; i < this.size; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            const nz = z + dz * i;
            if (this.grid[this._getIndex(nx, ny, nz)] !== player) {
                return false;
            }
        }
        return true;
    }

    /** * Hilfsmethode: x,y,z zu Array-Index 
     * @private 
     */
    _getIndex(x, y, z) {
        return z * (this.size * this.size) + y * this.size + x;
    }

    clone() {
        const c = new TTT3DBoard(this.size);
        c.grid = [...this.grid];
        c.currentPlayer = this.currentPlayer;
        c.winner = this.winner;
        return c;
    }
    
    getStateKey() { return this.grid.join('') + this.currentPlayer; }
}

/**
 * Ultimate Tic-Tac-Toe.
 * 9 kleine Boards (3x3) in einem großen Board.
 * @extends TTTBase
 */
class UltimateBoard extends TTTBase {
    constructor() {
        super();
        /** 
         * 9 Arrays à 9 Felder.
         * @type {number[][]} 
         */
        this.boards = Array(9).fill(null).map(() => Array(9).fill(0));
        
        /** 
         * Status der 9 großen Felder (Makro-Board). 0=Offen, 1/2=Sieg, 3=Remis. 
         * @type {number[]} 
         * */
        this.macroBoard = Array(9).fill(0);
        
        /** 
         * Index des Boards, in das der nächste Spieler setzen MUSS. -1 = Freie Wahl. 
         * @type {number} 
         * */
        this.nextBoardIdx = -1;
    }

    /**
     * Liefert alle gültigen Züge als Objekte {big, small}.
     * @returns {Array<{big:number, small:number}>}
     */
    getAllValidMoves() {
        if (this.winner !== 0) return [];
        const moves = [];
        
        let targetBoards = [];
        
        // Regel: Wenn man in ein Board geschickt wird, das nicht voll/gewonnen ist, MUSS man dort spielen.
        if (this.nextBoardIdx !== -1 && !this._isBoardFullOrWon(this.nextBoardIdx)) {
            targetBoards = [this.nextBoardIdx];
        } else {
            // Sonst: Freie Wahl auf allen nicht vollen/gewonnenen Boards
            for (let i = 0; i < 9; i++) {
                if (!this._isBoardFullOrWon(i)) targetBoards.push(i);
            }
        }

        // Alle freien Felder in den Ziel-Boards sammeln
        for (const bIdx of targetBoards) {
            for (let sIdx = 0; sIdx < 9; sIdx++) {
                if (this.boards[bIdx][sIdx] === 0) {
                    moves.push({ big: bIdx, small: sIdx });
                }
            }
        }
        return moves;
    }

    /**
     * Führt einen Zug aus.
     * - Index des großen Boards (0-8).
     * @param {number} big 
     * - Index des kleinen Feldes (0-8).
     * @param {number} small
     * True bei Erfolg. 
     * @returns {boolean} 
     */
    makeMove(big, small) {
        // 1. Basis-Checks
        if (this.winner !== 0) return false;
        
        // 2. Regel-Check: Darf ich in dieses 'big' Board setzen?
        // Wenn nextBoardIdx aktiv (-1) ist und das Zielboard noch offen ist,
        // muss 'big' gleich 'nextBoardIdx' sein.
        if (this.nextBoardIdx !== -1 && !this._isBoardFullOrWon(this.nextBoardIdx)) {
            if (big !== this.nextBoardIdx) return false; // Ungültiges Board gewählt!
        }
        // Zusatz: Auch bei freier Wahl darf man nicht in ein volles Board setzen
        if (this._isBoardFullOrWon(big)) return false;

        // 3. Feld belegt?
        if (this.boards[big][small] !== 0) return false;

        // --- ZUG AUSFÜHREN ---
        this.boards[big][small] = this.currentPlayer;

        // 4. Prüfen, ob das kleine Board gewonnen wurde
        // (Nur wenn es noch nicht entschieden war)
        if (this.macroBoard[big] === 0) {
            const w = this._checkSmallWin(this.boards[big]);
            if (w !== 0) {
                this.macroBoard[big] = w; // Board gewonnen
            } else if (!this.boards[big].includes(0)) {
                this.macroBoard[big] = 3; // Board voll (Remis)
            }
        }

        // 5. Prüfen, ob das große Board (Spiel) gewonnen wurde
        const gameWin = this._checkSmallWin(this.macroBoard);
        if (gameWin !== 0) {
            this.winner = gameWin;
        } else if (!this.macroBoard.includes(0)) {
            // Alle großen Felder entschieden, aber keine Reihe -> Remis
            this.winner = 3; 
        }

        if (this.winner === 0) {
            this.switchPlayer();
        }

        // 6. Nächstes Board bestimmen
        // Der Spieler wird in das Board geschickt, das dem 'small' Index entspricht.
        this.nextBoardIdx = small;
        
        // Wenn das Zielboard aber schon voll/gewonnen ist, hat der nächste Spieler freie Wahl.
        if (this._isBoardFullOrWon(this.nextBoardIdx)) {
            this.nextBoardIdx = -1;
        }

        return true;
    }

    /** Prüft, ob ein kleines Board nicht mehr bespielbar ist. */
    _isBoardFullOrWon(idx) {
        // Makroboard nicht 0 (=Sieg/Remis) ODER keine Nullen im Grid (=Voll)
        return this.macroBoard[idx] !== 0 || !this.boards[idx].includes(0);
    }

    /** Hilfsfunktion: 3-in-einer-Reihe auf einem 9er Array. */
    _checkSmallWin(grid) {
        const wins = [[0,1,2],[3,4,5],[6,7,8], [0,3,6],[1,4,7],[2,5,8], [0,4,8],[2,4,6]];
        for (const w of wins) {
            // Ignoriere 0 (leer) und 3 (Remis-Marker) bei der Gewinnprüfung
            if (grid[w[0]] !== 0 && grid[w[0]] !== 3 &&
                grid[w[0]] === grid[w[1]] && 
                grid[w[1]] === grid[w[2]]) {
                return grid[w[0]];
            }
        }
        return 0;
    }

    clone() {
        const c = new UltimateBoard();
        // Arrays kopieren
        c.boards = this.boards.map(r => [...r]);
        c.macroBoard = [...this.macroBoard];
        c.currentPlayer = this.currentPlayer;
        c.nextBoardIdx = this.nextBoardIdx;
        c.winner = this.winner;
        return c;
    }
    
    getStateKey() { 
        return JSON.stringify(this.boards) + this.currentPlayer; 
    }
}