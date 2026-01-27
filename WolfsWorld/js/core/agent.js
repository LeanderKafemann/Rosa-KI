/**
 * Abstrakte Basisklasse für alle KI-Agenten.
 * Ein Agent erhält einen Spielzustand und muss einen Zug zurückgeben.
 * * @abstract
 */
class Agent {
    /**
     * Erstellt einen neuen Agenten.
     * @param {string} [name="Agent"] - Der Anzeigename des Agenten.
     */
    constructor(name = "Agent") {
        this.name = name;
    }

    /**
     * Berechnet den nächsten Zug basierend auf dem Spielzustand.
     * @param {GameState} gameState - Der aktuelle Zustand des Spiels.
     * @returns {(Object|null)} Ein Objekt `{ move: mixed, reason: string }` oder null, wenn kein Zug möglich ist.
     */
    getAction(gameState) {
        throw new Error("getAction() muss von der Unterklasse implementiert werden!");
    }
}