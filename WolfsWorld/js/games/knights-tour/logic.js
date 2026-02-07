/**
 * @fileoverview Kernlogik für das Springerproblem.
 * Definiert das Brett, die Züge und die Validierung.
 */

/**
 * Repräsentiert das Schachbrett für den Springer.
 */
class KnightBoard {
    /**
     * @param {number|string} size - Die Kantenlänge des Brettes (z.B. 5 oder 8).
     */
    constructor(size) {
        this.size = parseInt(size);
        /**
         * Das Gitter: 0=leer, N=Zugnummer
         * @type {number[][]}
         */
        this.grid = [];
        /**
         * Historie der Züge
         * @type {Array<{r:number, c:number}>}
         */
        this.history = [];
        this.moveCount = 0;
        /**
         * Aktuelle Position
         * @type {{r:number, c:number}|null}
         */
        this.currentPos = null;
        this.won = false;

        this.initGrid();
    }

    /** Initialisiert das leere Grid. */
    initGrid() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    }

    /**
     * Prüft, ob Koordinaten auf dem Brett liegen.
     * @param {number} r - Zeile
     * @param {number} c - Spalte
     * @returns {boolean}
     */
    isInside(r, c) {
        return r >= 0 && r < this.size && c >= 0 && c < this.size;
    }

    /**
     * Prüft, ob ein Zug gültig ist (innerhalb und Feld leer).
     * @param {number} r 
     * @param {number} c 
     * @returns {boolean}
     */
    isValidMove(r, c) {
        if (!this.isInside(r, c)) return false;
        return this.grid[r][c] === 0; 
    }

    /**
     * Prüft, ob ein Zug den vorherigen rückgängig machen würde.
     * @param {number} r 
     * @param {number} c 
     * @returns {boolean}
     */
    isUndoMove(r, c) {
        if (this.history.length < 2) return false;
        const prev = this.history[this.history.length - 2];
        return prev.r === r && prev.c === c;
    }

    /**
     * Führt einen Zug aus (oder setzt Startfigur).
     * @param {number} r 
     * @param {number} c 
     * @returns {boolean} True bei Erfolg.
     */
    move(r, c) {
        // Wenn schon eine Figur steht, muss der Zug valide (L-Form) sein
        if (this.currentPos) {
            const dr = Math.abs(r - this.currentPos.r);
            const dc = Math.abs(c - this.currentPos.c);
            // Springerzug: 2+1 oder 1+2
            if (!((dr === 2 && dc === 1) || (dr === 1 && dc === 2))) return false;
        }

        // Ziel muss frei sein
        if (!this.isValidMove(r, c)) return false;

        this.moveCount++;
        this.grid[r][c] = this.moveCount;
        this.currentPos = { r, c };
        this.history.push({ r, c });

        // Siegprüfung: Brett voll?
        if (this.moveCount === this.size * this.size) this.won = true;
        return true;
    }

    /** Macht den letzten Zug rückgängig. */
    undo() {
        if (this.history.length === 0) return;
        const last = this.history.pop();
        this.grid[last.r][last.c] = 0;
        this.moveCount--;
        
        if (this.history.length > 0) {
            this.currentPos = this.history[this.history.length - 1];
        } else {
            this.currentPos = null;
        }
        this.won = false;
    }

    /**
     * Liefert alle möglichen Züge von der aktuellen Position.
     * @returns {Array<{r:number, c:number}>}
     */
    getPossibleMoves() {
        if (!this.currentPos) return [];
        return this._getMovesFrom(this.currentPos.r, this.currentPos.c);
    }

    /**
     * Warnsdorf-Logik: Zählt freie Nachbarn von einer Koordinate aus.
     * @param {number} r 
     * @param {number} c 
     * @returns {number} Grad (Anzahl möglicher Weiterzüge)
     */
    getDegree(r, c) {
        const moves = this._getMovesFrom(r, c);
        return moves.length;
    }
    
    /** KI-Interface: Ist das Ziel erreicht? */
    isGoal() {
        return this.moveCount === this.size * this.size;
    }

    /** KI-Interface: Eindeutiger State-String */
    getStateKey() {
        return this.grid.map(row => row.join(',')).join('|') + `:${this.currentPos.r},${this.currentPos.c}`;
    }

    /** KI-Interface: Nachfolgezustände generieren */
    getNextStates() {
        const moves = this.getPossibleMoves();
        const successors = [];

        for (const m of moves) {
            const nextBoard = this.clone();
            nextBoard.move(m.r, m.c);
            
            successors.push({
                move: m, 
                state: nextBoard
            });
        }
        return successors;
    }

    /**
     * Erstellt eine tiefe Kopie des Boards.
     * @returns {KnightBoard}
     */
    clone() {
        const newBoard = new KnightBoard(this.size);
        // Grid kopieren
        newBoard.grid = this.grid.map(row => [...row]);
        newBoard.moveCount = this.moveCount;
        if (this.currentPos) newBoard.currentPos = { ...this.currentPos };
        // History kopieren
        newBoard.history = this.history.map(h => ({...h}));
        return newBoard;
    }

    /** Interne Hilfsfunktion für Züge */
    _getMovesFrom(r, c) {
        const moves = [];
        const offsets = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        offsets.forEach(([dr, dc]) => {
            const nr = r + dr;
            const nc = c + dc;
            if (this.isValidMove(nr, nc)) {
                moves.push({ r: nr, c: nc });
            }
        });
        return moves;
    }
}