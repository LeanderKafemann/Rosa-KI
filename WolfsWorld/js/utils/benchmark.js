/**
 * Utility-Klasse zur Messung von Laufzeiten.
 * @fileoverview
 * @class Benchmark
 */
class Benchmark {
    constructor() {
        /** @private */
        this.startTime = 0;
        /** @private */
        this.endTime = 0;
        /** * Gespeicherte Messdaten.
         * @type {Array<{x: (number|string), y: number}>} 
         */
        this.history = []; 
    }

    /** Startet die Zeitmessung. */
    start() {
        this.startTime = performance.now();
    }

    /** * Stoppt die Zeitmessung.
     * @returns {number} Dauer in ms.
     */
    stop() {
        this.endTime = performance.now();
        return this.getDuration();
    }

    /** @returns {number} Aktuelle Dauer in ms. */
    getDuration() {
        return this.endTime - this.startTime;
    }

    /**
     * Speichert einen Datenpunkt.
     * @param {number|string} label - Label für X-Achse.
     * @param {number} [time=null] - Dauer (optional).
     */
    record(label, time = null) {
        const val = time !== null ? time : this.getDuration();
        this.history.push({ x: label, y: val });
    }

    /** @returns {number} Durchschnitt aller Messungen. */
    getAverage() {
        if (this.history.length === 0) return 0;
        const sum = this.history.reduce((a, b) => a + b.y, 0);
        return sum / this.history.length;
    }

    /** Setzt alles zurück. */
    reset() {
        this.history = [];
        this.startTime = 0;
        this.endTime = 0;
    }
}