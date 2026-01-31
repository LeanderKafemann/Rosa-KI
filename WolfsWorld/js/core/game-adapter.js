/**
 * @fileoverview Einheitliche Schnittstelle für alle Tic-Tac-Toe Varianten.
 * 
 * Macht alle Spiele (Regular, 3D, Ultimate) über eine standardisierte API zugänglich.
 * Verhindert Code-Duplikation und sorgt für konsistentes Verhalten.
 */

class GameAdapter {
    /**
     * Erstellt einen Adapter für eines der Spiele.
     * @param {TTTRegularBoard|TTT3DBoard|UltimateBoard} gameBoard 
     * @param {string} type - 'regular', '3d', oder 'ultimate'
     */
    constructor(gameBoard, type = 'regular') {
        this.gameBoard = gameBoard;
        this.type = type;
    }

    /**
     * Macht einen Zug mit einheitlicher Schnittstelle.
     * 
     * Für Regular/3D: makeMove(index)
     * Für Ultimate: makeMove({big, small})
     * 
     * @param {number|object} moveParam1 - Index oder Move-Objekt
     * @param {number} [moveParam2] - Optional: small-Index für Ultimate (bei zwei Parametern)
     * @returns {boolean} True wenn Zug erfolgreich
     */
    makeMove(moveParam1, moveParam2) {
        if (this.type === 'ultimate') {
            // Ultimate: Beide Parameter oder Objekt
            if (typeof moveParam1 === 'object') {
                return this.gameBoard.makeMove(moveParam1.big, moveParam1.small);
            } else {
                return this.gameBoard.makeMove(moveParam1, moveParam2);
            }
        } else {
            // Regular & 3D: Nur ein Parameter
            return this.gameBoard.makeMove(moveParam1);
        }
    }

    /**
     * Gibt gültige Züge für die nächste Entscheidung zurück.
     * Format ist spiel-spezifisch, aber vollständig nutzbar.
     * 
     * @returns {Array} Array von Zug-Objekten oder Indizes
     */
    getValidMoves() {
        return this.gameBoard.getAllValidMoves();
    }

    /**
     * Alias für getValidMoves(), um Konsistenz mit Board-Interface zu wahren.
     * @returns {Array} Array von Zug-Objekten oder Indizes
     */
    getAllValidMoves() {
        return this.gameBoard.getAllValidMoves();
    }

    /**
     * Gibt an, ob das Spiel vorbei ist.
     * @returns {boolean}
     */
    isGameOver() {
        return this.gameBoard.winner !== 0;
    }

    /**
     * Gibt die verbleibenden gültigen Züge an.
     * @returns {number}
     */
    getRemainingMoves() {
        return this.gameBoard.getAllValidMoves().length;
    }

    /**
     * Klont das aktuelle Spiel für KI-Simulationen.
     * @returns {GameAdapter}
     */
    clone() {
        const clonedBoard = this.gameBoard.clone();
        return new GameAdapter(clonedBoard, this.type);
    }

    /**
     * Direkter Zugriff auf das unterliegende Board (wenn nötig).
     * @returns {TTTRegularBoard|TTT3DBoard|UltimateBoard}
     */
    getBoard() {
        return this.gameBoard;
    }

    /**
     * Alias für getBoard() - liefert den aktuellen Game State.
     * @returns {TTTRegularBoard|TTT3DBoard|UltimateBoard}
     */
    getState() {
        return this.gameBoard;
    }

    /**
     * Gibt den aktuellen Spieler zurück.
     * @returns {number} 1 oder 2
     */
    getCurrentPlayer() {
        return this.gameBoard.currentPlayer;
    }

    /**
     * Gibt den Gewinner zurück.
     * @returns {number} 0=laufend, 1/2=Gewinner, 3=Remis
     */
    getWinner() {
        return this.gameBoard.winner;
    }
}
