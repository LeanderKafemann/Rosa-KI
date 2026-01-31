/**
 * Interface für einen Spielzustand.
 * Jedes Spiel (TicTacToe, RotateBox, KnightsTour) muss dieses Interface implementieren,
 * damit die KI-Agenten und Suchalgorithmen damit arbeiten können.
 * @fileoverview
 *
 * Mindest-Interface (für Agenten/Arena/Minimax):
 * - getAllValidMoves()
 * - makeMove(move)
 * - clone()
 * - getStateKey()
 * - currentPlayer, winner, isGameOver
 *
 * Optionales Such-Interface (für SearchEngine & Lernpfade):
 * - isGoal()
 * - getNextStates()
 *
 * @interface GameState
 */
class GameState {
    constructor() {
        /**
         * Gibt an, ob das Spiel beendet ist (Sieg oder Remis).
         * @type {boolean}
         */
        this.isGameOver = false;

        /**
         * Der Gewinner des Spiels.
         * Empfohlenes Schema:
         * 0 = Läuft noch, 1 = Spieler 1, 2 = Spieler 2, 3 = Remis.
         * (Bestehende Spiele dürfen 3=Remis nutzen; 0 sollte nicht Remis bedeuten.)
         * @type {number}
         */
        this.winner = 0;

        /**
         * Der Spieler, der aktuell am Zug ist.
         * @type {number}
         */
        this.currentPlayer = 1;
    }

    /**
     * Liefert eine Liste aller gültigen Züge im aktuellen Zustand.
     * @returns {Array<number|Object>} Ein Array von Zügen (Format hängt vom Spiel ab).
     */
    getAllValidMoves() {
        throw new Error("Method 'getAllValidMoves()' must be implemented.");
    }

    /**
     * Führt einen Zug aus und aktualisiert den internen Zustand.
     * @param {number|Object} move - Der Zug, der ausgeführt werden soll.
     *  Empfehlung: komplexe Züge als Objekt (z.B. {big, small} oder {x, y}).
     * @returns {boolean} True, wenn der Zug gültig war und ausgeführt wurde.
     */
    makeMove(move) {
        throw new Error("Method 'makeMove()' must be implemented.");
    }

    /**
     * Erstellt eine tiefe Kopie des aktuellen Spielzustands.
     * Wichtig für KI-Simulationen, damit das echte Brett nicht verändert wird.
     * @returns {GameState} Eine exakte Kopie dieses Zustands.
     */
    clone() {
        throw new Error("Method 'clone()' must be implemented.");
    }

    /**
     * Generiert einen eindeutigen String für diesen Zustand.
     * Wird für Caching und Duplikaterkennung in Suchbäumen benötigt.
     * @returns {string} Der Hash/Key des Zustands.
     */
    getStateKey() {
        throw new Error("Method 'getStateKey()' must be implemented.");
    }

    /**
     * OPTIONAL (für SearchEngine): Prüft, ob ein Zielzustand erreicht ist.
     * @returns {boolean}
     */
    isGoal() {
        throw new Error("Optional method 'isGoal()' not implemented.");
    }

    /**
     * OPTIONAL (für SearchEngine): Liefert Nachfolgezustände.
     * @returns {Array<{move: (number|Object|string), state: GameState}>}
     */
    getNextStates() {
        throw new Error("Optional method 'getNextStates()' not implemented.");
    }
}