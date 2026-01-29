/**
 * NIM Spiel - Konkrete Implementierung des GameState-Interfaces.
 * 
 * Dies ist ein VOLLSTÄNDIGES Beispiel für eine neue Spielimplementierung.
 * Schüler können dies als Vorlage für ihre eigenen Spiele verwenden.
 * 
 * Spielregeln:
 * - 3 Haufen mit je 3 Streichhölzern
 * - Spieler nimmt beliebig viele Streichhölzer aus EINEM Haufen
 * - Wer den LETZTEN nimmt, gewinnt (Normales Nim)
 * 
 * @fileoverview NIM Game - Implementierungsbeispiel
 */

class NIMGameLogic extends GameState {
    /**
     * Initialisiert ein neues NIM-Spiel.
     * 
     * @param {Array<number>} [piles] - Optional: Startkonfiguration
     */
    constructor(piles = [3, 3, 3]) {
        super();
        
        // === Basis-Eigenschaften (geerbt) ===
        this.currentPlayer = 1;  // Spieler 1 startet
        this.winner = 0;         // 0 = noch nicht entschieden
        this.isGameOver = false; // Spiel läuft noch
        
        // === NIM-spezifische Daten ===
        this.piles = [...piles]; // Kopie der Haufen-Konfiguration
        
        // Move-Historie für Debugging (optional)
        this.moveHistory = [];
    }

    /**
     * ✅ ERFORDERLICH: getAllValidMoves()
     * 
     * Im NIM gibt es gültige Züge, wenn noch Streichhölzer vorhanden sind.
     * Ein Zug: {pile: 0-2, count: 1-n} wobei n die Größe des Haufens
     * 
     * @returns {Array<Object>} Array von {pile, count} Objekten
     */
    getAllValidMoves() {
        if (this.isGameOver) return [];
        
        const moves = [];
        
        // Iteriere über alle Haufen
        for (let pileIdx = 0; pileIdx < this.piles.length; pileIdx++) {
            // Für jeden Haufen: kann 1 bis piles[pileIdx] Streichhölzer nehmen
            for (let count = 1; count <= this.piles[pileIdx]; count++) {
                moves.push({ pile: pileIdx, count });
            }
        }
        
        return moves;
    }

    /**
     * ✅ ERFORDERLICH: makeMove(move)
     * 
     * Führt einen NIM-Zug aus:
     * 1. Validierung
     * 2. Piles aktualisieren
     * 3. Spielende prüfen
     * 4. Spieler wechseln
     * 
     * @param {Object} move - {pile: number, count: number}
     * @returns {boolean}
     */
    makeMove(move) {
        // Typ-Check: NIM akzeptiert Objekte
        if (typeof move !== 'object' || move.pile === undefined || move.count === undefined) {
            console.warn("NIM: Ungültiges Move-Format. Erwartet {pile, count}");
            return false;
        }
        
        const { pile, count } = move;
        
        // === Validierung ===
        if (this.isGameOver) {
            console.warn("NIM: Spiel ist bereits vorbei");
            return false;
        }
        
        if (pile < 0 || pile >= this.piles.length) {
            console.warn(`NIM: Ungültiger Haufen ${pile}`);
            return false;
        }
        
        if (count < 1 || count > this.piles[pile]) {
            console.warn(`NIM: Kann nicht ${count} Streichhölzer aus Haufen ${pile} nehmen (hat nur ${this.piles[pile]})`);
            return false;
        }
        
        // === Zug ausführen ===
        this.piles[pile] -= count;
        this.moveHistory.push({ pile, count, player: this.currentPlayer, pilesBefore: [...this.piles] });
        
        // === Spielende prüfen ===
        this._checkGameEnd();
        
        // === Spieler wechseln ===
        if (!this.isGameOver) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }
        
        return true;
    }

    /**
     * ✅ ERFORDERLICH: clone()
     * 
     * Erstellt eine exakte Kopie für KI-Simulationen.
     * 
     * @returns {NIMGameLogic}
     */
    clone() {
        const copy = new NIMGameLogic(this.piles);
        copy.currentPlayer = this.currentPlayer;
        copy.winner = this.winner;
        copy.isGameOver = this.isGameOver;
        copy.moveHistory = [...this.moveHistory]; // Flache Kopie reicht
        return copy;
    }

    /**
     * ✅ ERFORDERLICH: getStateKey()
     * 
     * Zwei Zustände sind gleich, wenn:
     * - Die Haufen identisch sind
     * - Der aktuelle Spieler gleich ist
     * 
     * @returns {string}
     */
    getStateKey() {
        return JSON.stringify({
            piles: this.piles,
            player: this.currentPlayer
        });
    }

    /**
     * Hilfsfunktion: Prüft auf Spielende
     * 
     * Spielende ist erreicht, wenn keine Streichhölzer mehr vorhanden sind.
     * Der aktuelle Spieler (der gerade gezogen hat) gewinnt.
     */
    _checkGameEnd() {
        // Sind alle Haufen leer?
        if (this.piles.every(pile => pile === 0)) {
            // Der Spieler, der gerade gezogen hat (currentPlayer), gewinnt
            this.winner = this.currentPlayer;
            this.isGameOver = true;
        }
    }

    /**
     * OPTIONAL: Gibt einen lesbar formatierten String des Zustands zurück.
     * Nützlich zum Debuggen.
     * 
     * @returns {string}
     */
    toString() {
        return `NIM [P${this.currentPlayer}]: [${this.piles.join(', ')}] Winner: ${this.winner}`;
    }
}

// ============== EXPORT ==============
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NIMGameLogic;
}
