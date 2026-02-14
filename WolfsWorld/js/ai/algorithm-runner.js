/**
 * Minimaler Wert für den Speed-Slider
 * @constant {number}
 */
const SPEED_SLIDER_MIN = 0;
/**
 * Maximaler Wert für den Speed-Slider
 * @constant {number}
 */
const SPEED_SLIDER_MAX = 6;
/**
 * Wert für manuellen Modus
 * @constant {number}
 */
const SPEED_SLIDER_MANUAL = 6;
/**
 * Delay-Stufen für Animationen (ms)
 * @constant {number[]}
 */
const SPEED_DELAYS = [0, 20, 100, 300, 600, 1000];
/**
 * Default-Delay (ms)
 * @constant {number}
 */
const DEFAULT_SPEED_DELAY = 100;
/**
 * Wrapper um die SearchEngine, der "Schritt-für-Schritt" Ausführung
 * und manuelle Steuerung (Play/Pause/Step) ermöglicht.
 * @fileoverview
 * @class AlgorithmRunner
 */
class AlgorithmRunner {
    /**
     * @param {SearchEngine} engine - Die konfigurierte Suchmaschine.
     * @param {Object} config - Callbacks für UI.
     * @param {function(GameState, number): Promise<void>} config.onUpdate - Wird bei jedem Schritt gerufen.
     * @param {function(Object): void} config.onComplete - Wird bei Ende gerufen.
     */
    constructor(engine, config = {}) {
        this.engine = engine;
        this.onUpdate = config.onUpdate || (() => {});
        this.onComplete = config.onComplete || (() => {});
        
        this.isRunning = false;
        this.stopRequested = false;
        this.isManual = false;
        this.speedDelay = DEFAULT_SPEED_DELAY;
        
        this.manualResolver = null;
        this.stepCount = 0;
        
        // Logik-Injection
        this.injectRunnerLogic();
    }

    /** @private */
    injectRunnerLogic() {
        // Wir überschreiben die onStep Methode der Engine
        this.engine.onStep = async (state, queueSize) => {
            if (this.stopRequested) return 'STOP';

            this.stepCount++;

            // UI Update
            await this.onUpdate(state, this.stepCount);

            // Warte-Logik
            if (this.isManual) {
                // Warten bis manualResolver durch triggerStep() gerufen wird
                await new Promise(resolve => { this.manualResolver = resolve; });
            } else if (this.speedDelay > 0) {
                await new Promise(r => setTimeout(r, this.speedDelay));
            }
        };
    }

    /**
     * Startet den Runner.
     * @param {GameState} startState 
     */
    async start(startState) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.stopRequested = false;
        this.stepCount = 0;
        
        const result = await this.engine.solve(startState);
        
        this.isRunning = false;
        this.onComplete(result);
    }

    /** Stoppt den aktuellen Lauf. */
    stop() {
        if (this.isRunning) {
            this.stopRequested = true;
            this.triggerStep(); // Falls im Manual Mode, Blockierung lösen
        }
    }

    /** Führt im manuellen Modus genau einen Schritt aus. */
    triggerStep() {
        if (this.manualResolver) {
            const resolve = this.manualResolver;
            this.manualResolver = null;
            resolve();
        }
    }

    /**
     * Setzt die Geschwindigkeit.
     * @param {number|string} val - Wert vom Slider (0-6). 6 = Manuell.
     */
    setSpeed(val) {
        const intVal = parseInt(val);
        const maxRange = SPEED_SLIDER_MAX;
        
        if (intVal >= maxRange) {
            this.isManual = true;
        } else {
            this.isManual = false;
            // Mapping: Slider -> Millisekunden
            this.speedDelay = SPEED_DELAYS[intVal] !== undefined ? SPEED_DELAYS[intVal] : DEFAULT_SPEED_DELAY;
            
            // Falls wir im manuellen Modus hingen, weitermachen
            this.triggerStep();
        }
    }
}