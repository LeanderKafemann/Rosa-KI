/**
 * Template für die Implementierung eines neuen Spiels.
 * Kopiere diese Datei und passe die Klassennamen + Logik an.
 * 
 * Dieses Template zeigt, wie man das GameState-Interface richtig implementiert.
 * Es enthält alle erforderlichen Methoden mit ausführlichem Kommentar.
 * 
 * @fileoverview GameState Template für Schülerprojekte
 * @example
 * class MyGameLogic extends GameState {
 *     constructor() {
 *         super();
 *         // Initialisiere dein Spiel hier
 *     }
 * }
 */

/**
 * Beispiel-Template für ein einfaches Spiel (z.B. NIM oder Bauernschach).
 * 
 * WICHTIG: 
 * 1. Ersetze "TemplateGame" mit deinem Spiel-Namen (z.B. "NIMGame", "BauernschachLogic")
 * 2. Implementiere ALLE Methoden mit ✅
 * 3. Optionale Methoden mit ⭐ sind nur nötig, wenn SearchEngine verwendet wird
 * 4. Testes gründlich mit Arena und Minimax!
 */
class TemplateGameLogic extends GameState {
    /**
     * ✅ ERFORDERLICH: Konstruktor
     * Initialisiert das Spiel in den Startzustand.
     */
    constructor() {
        super();
        
        // === Basis-Eigenschaften ===
        this.currentPlayer = 1;  // Spieler 1 startet
        this.winner = 0;         // 0 = noch nicht entschieden
        this.isGameOver = false; // Spiel läuft noch
        
        // === Spiel-spezifische Daten ===
        // BEISPIEL für NIM:
        // this.piles = [3, 3, 3];  // Drei Haufen mit je 3 Streichhölzern
        //
        // BEISPIEL für Bauernschach:
        // this.board = Array(4*8).fill(0); // 4x8 Brett
        // this.board[0] = 1; // Weiße Bauern Startposition
        // this.board[28] = 2; // Schwarze Bauern Startposition
    }

    /**
     * ✅ ERFORDERLICH: getAllValidMoves()
     * 
     * Liefert ALLE legalen Züge für den aktuellen Spieler.
     * Diese Methode ist kritisch für die KI - sie muss korrekt und vollständig sein.
     * 
     * @returns {Array<number|Object>} Array von möglichen Zügen
     * 
     * @example
     * // Einfaches Format: nur Zahlen
     * return [0, 1, 2, 3];  // Für RotateBox oder TTT
     * 
     * @example
     * // Komplexes Format: Objekte
     * return [
     *     {pile: 0, count: 1},
     *     {pile: 0, count: 2},
     *     {pile: 1, count: 1},
     *     // ... mehr Züge
     * ];
     */
    getAllValidMoves() {
        if (this.isGameOver) return [];
        
        const moves = [];
        
        // TODO: Implementiere deine Logik
        // Beispiel für NIM:
        // for (let pileIdx = 0; pileIdx < this.piles.length; pileIdx++) {
        //     for (let count = 1; count <= this.piles[pileIdx]; count++) {
        //         moves.push({ pile: pileIdx, count });
        //     }
        // }
        
        return moves;
    }

    /**
     * ✅ ERFORDERLICH: makeMove(move)
     * 
     * Führt einen Zug AUS und aktualisiert den Zustand.
     * Dies ist die "Mutation-Funktion" des Spiels.
     * 
     * WICHTIG:
     * - Ändere den INTERNEN Zustand
     * - Aktualisiere this.winner, this.isGameOver
     * - Wechsle this.currentPlayer
     * - Gib TRUE zurück, wenn gültig; FALSE wenn ungültig
     * 
     * @param {number|Object} move - Der Zug (Format wie in getAllValidMoves)
     * @returns {boolean} true wenn erfolgreich, false wenn ungültig
     */
    makeMove(move) {
        // Basis-Checks
        if (this.isGameOver) {
            console.warn("Spiel ist bereits vorbei");
            return false;
        }
        
        const validMoves = this.getAllValidMoves();
        if (!this._isMoveInList(move, validMoves)) {
            console.warn("Ungültiger Zug:", move);
            return false;
        }
        
        // TODO: Implementiere deine Zug-Logik
        // Beispiel für NIM:
        // const { pile, count } = move;
        // this.piles[pile] -= count;
        
        // NACH dem Zug:
        // 1. Prüfe auf Spielende
        this._checkGameEnd();
        
        // 2. Spieler wechseln (wenn Spiel nicht vorbei)
        if (!this.isGameOver) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }
        
        return true;
    }

    /**
     * ✅ ERFORDERLICH: clone()
     * 
     * Erstellt eine TIEFE KOPIE des aktuellen Zustands.
     * Dies ist essentiell für die KI (Minimax, Suchbäume):
     * Die KI simuliert Züge, ohne das echte Spiel zu beeinflussen.
     * 
     * WICHTIG: Kopiere ALLE Eigenschaften, nicht nur primitive Daten!
     * 
     * @returns {TemplateGameLogic} Exakte Kopie dieses Zustands
     */
    clone() {
        const copy = new TemplateGameLogic();
        
        // Kopiere Basis-Eigenschaften
        copy.currentPlayer = this.currentPlayer;
        copy.winner = this.winner;
        copy.isGameOver = this.isGameOver;
        
        // Kopiere spiel-spezifische Daten
        // TODO: Passe an dein Spiel an
        // Beispiel für NIM:
        // copy.piles = [...this.piles];  // Flache Kopie des Arrays
        //
        // Beispiel für Bauernschach (2D Array):
        // copy.board = this.board.map(row => [...row]);  // Tiefe Kopie
        
        return copy;
    }

    /**
     * ✅ ERFORDERLICH: getStateKey()
     * 
     * Generiert einen EINDEUTIGEN String für diesen Spielzustand.
     * Wird verwendet für:
     * - Duplikaterkennung im Suchbaum
     * - Transposition Tables (Caching in Minimax)
     * - Zustands-Hashing
     * 
     * WICHTIG: 
     * - Gleiche Zustände → gleiche Keys
     * - Unterschiedliche Zustände → unterschiedliche Keys
     * - JSON.stringify() ist oft die einfachste Lösung
     * 
     * @returns {string} Eindeutiger Hash für diesen Zustand
     */
    getStateKey() {
        // TODO: Passe an dein Spiel an
        // Beispiel für NIM:
        // return JSON.stringify({
        //     piles: this.piles,
        //     player: this.currentPlayer
        // });
        
        // Allgemeines Fallback:
        return JSON.stringify({
            state: this,
            player: this.currentPlayer
        });
    }

    // ============== OPTIONAL (für SearchEngine) ==============

    /**
     * ⭐ OPTIONAL: isGoal()
     * 
     * Wird nur benötigt, wenn du SearchEngine für Puzzle-Spiele nutzt.
     * Prüft, ob ein ZIELZUSTAND erreicht ist (z.B. für RotateBox).
     * 
     * NICHT benötigt für:
     * - Normale Spiele mit zwei Spielern (nutze stattdessen winner)
     * - Wenn du diese Methode nicht brauchst, lass einfach die Fehler-Exception
     * 
     * @returns {boolean} true wenn Ziel erreicht
     */
    isGoal() {
        // Für Zwei-Spieler-Spiele: nutze stattdessen winner prüfung
        throw new Error("Optional method 'isGoal()' not implemented for " + this.constructor.name);
    }

    /**
     * ⭐ OPTIONAL: getNextStates()
     * 
     * Wird nur benötigt, wenn du SearchEngine nutzt.
     * Liefert ALLE möglichen Nachfolgezustände.
     * 
     * @returns {Array<{move: (number|Object), state: GameState}>}
     */
    getNextStates() {
        const nextStates = [];
        const moves = this.getAllValidMoves();
        
        for (const move of moves) {
            const nextState = this.clone();
            if (nextState.makeMove(move)) {
                nextStates.push({
                    move: move,
                    state: nextState
                });
            }
        }
        
        return nextStates;
    }

    // ============== HILFS-METHODEN (spiel-spezifisch) ==============

    /**
     * Hilfsfunktion: Prüft, ob ein Zug in der Züge-Liste enthalten ist.
     * Wird für Validierung benötigt.
     * 
     * @param {number|Object} move 
     * @param {Array} validMoves 
     * @returns {boolean}
     */
    _isMoveInList(move, validMoves) {
        if (typeof move === 'number') {
            return validMoves.includes(move);
        }
        
        // Für Objekt-Züge
        return validMoves.some(m => 
            typeof m === 'object' && 
            JSON.stringify(m) === JSON.stringify(move)
        );
    }

    /**
     * Hilfsfunktion: Prüfe auf Spielende.
     * Wird nach jedem Zug aufgerufen.
     * Setzt: this.winner, this.isGameOver
     */
    _checkGameEnd() {
        // TODO: Implementiere deine Gewinn-Bedingungen
        
        // Beispiel für NIM (normal):
        // if (this.piles.every(p => p === 0)) {
        //     this.winner = this.currentPlayer;  // Wer den letzten nimmt gewinnt
        //     this.isGameOver = true;
        // }
        
        // Beispiel für Stalemate (keine Züge möglich):
        // if (this.getAllValidMoves().length === 0) {
        //     if (some_winning_condition) {
        //         this.winner = this.currentPlayer;
        //     } else {
        //         this.winner = 3;  // Remis
        //     }
        //     this.isGameOver = true;
        // }
    }
}

// ============== EXPORT ==============
// Für Node.js (Tests):
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateGameLogic;
}
