/**
 * Kernlogik für das RotateBox Spiel.
 * @fileoverview 
 * Definiert den Spielzustand, das Parsen der Level und die Physik.
 */

/**
 * Repräsentiert das Spielbrett und dessen Zustand.
 * Implementiert das GameState Interface für die KI.
 * @implements {GameState}
 */
class RotateBoard {
    /**
     * Erstellt eine neue Board-Instanz.
     * @param {string|null} idOrData - Die Level-ID ('0'-'3') oder null (für leeres Board/Klonen).
     */
    constructor(idOrData) {
        /**
         * Anzahl der getätigten Züge.
         * @type {number}
         */
        this.moves = 0;
        /**
         * Gibt an, ob das Ziel erreicht wurde.
         * @type {boolean}
         */
        this.won = false;
        /**
         * Flag für laufende Fall-Animationen.
         * @type {boolean}
         */
        this.isFalling = false;
        /**
         * Speichert visuelle Offsets für fallende Boxen.
         * @type {Object.<number, number>}
         */
        this.fallOffsets = {};
        
        // Grid Dimensionen
        this.rows = 0;
        this.cols = 0;
        /**
         * Das Spielfeld als 2D-Array (-2=Wand, -1=Leer, -3=Ziel, >=0 BoxID).
         * @type {number[][]}
         */
        this.grid = [];

        // Bei null (z.B. beim Klonen) keine Initialisierung durchführen
        if (idOrData === null) return;
        
        // Level laden (Default zu '0' falls ungültig)
        const id = (typeof idOrData === 'string') ? idOrData : '0';
        this.initFromId(id);
    }

    /**
     * Lädt die Leveldaten aus den Strings.
     * WICHTIG: Die Strings enthalten Leerzeichen, die für das Layout essenziell sind.
     * @param {string} id 
     */
    initFromId(id) {
        const levels = {
            '0': "5###### 0 ##10 ##10 ####x#",
            '1': "8#########     0##     0##112222##33   4##55   4##666  4####x####",
            '2': "12#############          ##     01   ##     01   ##     01   ##    222222##  34    5 ##  34    5 ## 634    5 ## 63477775 ## 63888885 #######x#####",
            '3': "10###########        ##        ##        ##    7775##   11  5##   2 888##990233  ##44066666######x####"
        };
        
        const str = levels[id] || levels['0'];
        
        // Dimensionen parsen: Zahl am Anfang = Zeilen
        let offset = 0; 
        while (offset < str.length && str[offset] !== '#') offset++;
        
        this.rows = parseInt(str.substring(0, offset));
        const content = str.substring(offset);
        this.cols = Math.floor(content.length / this.rows);
        
        // Grid befüllen
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                const idx = r * this.cols + c;
                if (idx < content.length) {
                    const char = content[idx];
                    let val = -1; // Standard: Leer
                    
                    if (char === '#') val = -2;      // Wand
                    else if (char === 'x') val = -3; // Ziel
                    else if (char !== ' ') {         // Box (Zahl)
                        const p = parseInt(char);
                        if (!isNaN(p)) val = p;
                    }
                    row.push(val);
                } else {
                    row.push(-1);
                }
            }
            this.grid.push(row);
        }
    }

    /**
     * Rotiert das Spielfeld um 90 Grad.
     * - True für Rechtsdrehung, False für Links.
     * @param {boolean} [clockwise=true] 
     */
    rotate(clockwise = true) {
        const newGrid = Array.from({ length: this.cols }, () => Array(this.rows).fill(-1));
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (clockwise) newGrid[c][this.rows - 1 - r] = this.grid[r][c];
                else newGrid[this.cols - 1 - c][r] = this.grid[r][c];
            }
        }
        this.grid = newGrid;
        // Dimensionen tauschen
        [this.rows, this.cols] = [this.cols, this.rows];
        this.moves++;
    }

    /**
     * Prüft, ob eine Box physikalisch fallen kann.
     *  Die ID der Box.
     * @param {number} id
     * True, wenn der Weg nach unten frei ist.
     * @returns {boolean} 
     */
    canFall(id) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === id) {
                    // Boden erreicht?
                    if (r + 1 >= this.rows) return false;
                    
                    const target = this.grid[r + 1][c];
                    // Blockiert, wenn darunter NICHT (Leer ODER Ziel ODER Selbst) ist
                    if (target !== -1 && target !== -3 && target !== id) return false;
                }
            }
        }
        return true;
    }

    /**
     * Bewegt eine Box logisch um ein Feld nach unten.
     * Die ID der Box.
     * @param {number} id 
     */
    moveDown(id) {
        let reachedExit = false;
        // Wichtig: Iteration von unten nach oben, um Überschreiben zu vermeiden
        for (let r = this.rows - 1; r >= 0; r--) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === id) {
                    // Prüfen ob Ziel erreicht (-3)
                    if (this.grid[r + 1][c] === -3) {
                        reachedExit = true;
                        // Block bleibt sichtbar auf der Öffnung stehen
                        this.grid[r + 1][c] = id;
                    } else {
                        // Box an neue Position setzen
                        this.grid[r + 1][c] = id;
                    }
                    
                    // Alte Position leeren
                    this.grid[r][c] = -1;
                }
            }
        }
        if (reachedExit) this.won = true;
    }

    /**
     * Lässt alle Boxen fallen, bis sie stabil liegen.
     * Wird synchron ausgeführt (ohne Animation), z.B. für KI-Vorberechnung.
     * Wenn das Spiel bereits gewonnen ist, werden keine Blöcke mehr bewegt.
     */
    relaxBoardSync() {
        // Wenn das Spiel bereits gewonnen ist, nicht weiter fallen lassen
        if (this.won) return;
        
        let changed = true;
        while (changed) {
            changed = false;
            let seen = new Set();
            // Scan von unten nach oben
            for (let r = this.rows - 2; r >= 0; r--) {
                for (let c = 0; c < this.cols; c++) {
                    const id = this.grid[r][c];
                    // Wenn es eine Box ist (>=0), wir sie noch nicht bewegt haben und sie fallen kann
                    if (id >= 0 && !seen.has(id) && this.canFall(id)) {
                        this.moveDown(id); 
                        seen.add(id); 
                        changed = true;
                    }
                }
            }
        }
    }

    /**
     * Erstellt eine tiefe Kopie des aktuellen Boards.
     * Die Kopie.
     * @returns {RotateBoard} 
     */
    clone() {
        const c = new RotateBoard(null);
        c.rows = this.rows; 
        c.cols = this.cols; 
        c.won = this.won;
        c.grid = this.grid.map(row => [...row]);
        c.moves = this.moves;
        return c;
    }

    // --- KI Interface Methoden ---

    /**
     * Generiert einen eindeutigen Schlüssel für den Zustand (für HashMaps).
     * String-Repräsentation des Grids.
     * @returns {string} 
     */
    getStateKey() { 
        return this.grid.map(r => r.join(',')).join('|'); 
    }

    /**
     * Prüft, ob das Spiel gewonnen ist.
     * @returns {boolean}
     */
    isGoal() { 
        return this.won; 
    }
    
    /**
     * Liefert alle möglichen Nachfolgezustände.
     * @returns {Array<{move: string, state: RotateBoard}>}
     */
    getNextStates() {
        if (this.won) return [];
        // RotateBox hat immer zwei mögliche Züge: Links (L) und Rechts (R)
        return ['L', 'R'].map(dir => {
            const next = this.clone();
            next.rotate(dir === 'R'); // Rotation ausführen
            next.relaxBoardSync();    // Physik anwenden (Fallen)
            return { move: dir, state: next };
        });
    }
}