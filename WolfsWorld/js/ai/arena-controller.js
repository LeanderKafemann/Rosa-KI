/**
 * @fileoverview Haupt-Controller für die Arena-UI und Simulation.
 */

class ArenaController {
    constructor() {
        this.arena = null;
        this.currentGameFactory = null;
        this.isRunning = false;
        
        this.initEventListeners();
    }

    /**
     * Initialisiert alle Event-Listener
     */
    initEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.startSimulation());
        document.getElementById('stopButton').addEventListener('click', () => this.stopSimulation());
        document.getElementById('resetButton').addEventListener('click', () => this.resetUI());
        
        // Initiale UI aktualisieren
        this.updateGameFactory();
        document.getElementById('gameSelect').addEventListener('change', () => this.updateGameFactory());
    }

    /**
     * Aktualisiert die Game-Factory basierend auf der Auswahl
     */
    updateGameFactory() {
        const gameType = document.getElementById('gameSelect').value;
        const factory = GameFactories[gameType];
        
        if (!factory) {
            this.showError(`Spiel nicht gefunden: ${gameType}`);
            return;
        }
        
        this.currentGameFactory = factory;
    }

    /**
     * Startet die Simulation
     */
    async startSimulation() {
        try {
            // UI Lock
            document.getElementById('startButton').disabled = true;
            document.getElementById('stopButton').disabled = false;
            document.getElementById('stopButton').style.display = 'inline-block';
            this.isRunning = true;
            this.hideError();

            // Agenten erstellen
            const agent1Key = document.getElementById('agent1Select').value;
            const agent2Key = document.getElementById('agent2Select').value;

            const agentBlue = createAgentFromProfile(agent1Key);
            const agentRed = createAgentFromProfile(agent2Key);

            if (!agentBlue || !agentRed) {
                throw new Error("Agenten konnten nicht erstellt werden");
            }

            // Arena vorbereiten
            const templateGame = this.currentGameFactory();
            this.arena = new ArenaSimulator(
                agentBlue,
                agentRed,
                templateGame
            );

            // Anzahl Spiele
            const numGames = parseInt(document.getElementById('numGames').value) || 100;

            // Fortschritts-Anzeige
            document.getElementById('progressSection').style.display = 'block';
            document.getElementById('resultsSection').style.display = 'none';

            // Simulation mit Progress-Callback
            const stats = await this.arena.runSeries(
                numGames,
                (current, total) => this.updateProgress(current, total)
            );

            // Erste Spiel-Visualisierung
            if (document.getElementById('showFirstGame').checked) {
                this.showFirstGameVisualization();
            }

            // Ergebnisse anzeigen
            this.displayResults(stats, agentBlue.name, agentRed.name);

        } catch (error) {
            console.error("Simulation-Fehler:", error);
            this.showError(error.message);
        } finally {
            this.isRunning = false;
            document.getElementById('startButton').disabled = false;
            document.getElementById('stopButton').disabled = true;
            document.getElementById('stopButton').style.display = 'none';
            document.getElementById('progressSection').style.display = 'none';
        }
    }

    /**
     * Stoppt die Simulation
     */
    stopSimulation() {
        this.isRunning = false;
        if (this.arena) {
            this.arena.stop();
        }
    }

    /**
     * Aktualisiert die Fortschritts-Anzeige
     */
    updateProgress(current, total) {
        const percent = (current / total) * 100;
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = `${current} / ${total} Spiele`;
    }

    /**
     * Zeigt das erste Spiel als Visualisierung
     */
    showFirstGameVisualization() {
        document.getElementById('gameSection').style.display = 'block';
        // Placeholder - kann später mit echter Spiel-Visualisierung erweitert werden
        document.getElementById('gameStatus').textContent = 
            `Erstes Spiel: ${this.arena.firstGameReplay?.toString() || 'Keine Daten'}`;
    }

    /**
     * Zeigt die Ergebnisse an
     */
    displayResults(stats, blueName, redName) {
        // Statistische Werte
        document.getElementById('statBlueWins').textContent = stats.blueWins;
        document.getElementById('statRedWins').textContent = stats.redWins;
        document.getElementById('statDraws').textContent = stats.draws;

        document.getElementById('statBluePercent').textContent = stats.winRateBlue;
        document.getElementById('statRedPercent').textContent = stats.winRateRed;
        document.getElementById('statDrawPercent').textContent = stats.drawRate;

        document.getElementById('statAvgMoves').textContent = stats.averageMoves;
        document.getElementById('statAvgTime').textContent = stats.averageGameTimeMs + ' ms';
        document.getElementById('statTotalTime').textContent = (parseInt(stats.totalTimeMs) / 1000).toFixed(1) + ' s';

        // Agent-Namen
        document.getElementById('agentBlueName').textContent = blueName;
        document.getElementById('agentRedName').textContent = redName;

        // Advanced Stats wenn aktiviert
        if (document.getElementById('showAdvancedStats').checked && this.arena.advancedStats) {
            const advanced = this.arena.advancedStats;
            document.getElementById('statBlueAvgTime').textContent = advanced.blueAvgTime;
            document.getElementById('statBlueMaxTime').textContent = advanced.blueMaxTime;
            document.getElementById('statRedAvgTime').textContent = advanced.redAvgTime;
            document.getElementById('statRedMaxTime').textContent = advanced.redMaxTime;
            document.getElementById('advancedStatsPanel').style.display = 'block';
        }

        // Ergebnis-Sektion anzeigen
        document.getElementById('resultsSection').style.display = 'block';
    }

    /**
     * Setzt die UI zurück
     */
    resetUI() {
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
        document.getElementById('startButton').disabled = false;
    }

    /**
     * Zeigt einen Fehler an
     */
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorSection').style.display = 'block';
    }

    /**
     * Versteckt den Fehler
     */
    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }
}

/**
 * Vereinfachte Arena für Simulationen (basierend auf bestehender Arena-Klasse).
 * Diese Klasse kapselt die Spiel-Loop.
 */
class ArenaSimulator {
    constructor(agentBlue, agentRed, gameTemplate) {
        this.agentBlue = agentBlue;
        this.agentRed = agentRed;
        this.gameTemplate = gameTemplate;
        
        this.stats = { blueWins: 0, redWins: 0, draws: 0 };
        this.totalMoves = 0;
        this.gameCount = 0;
        this.isStopped = false;
        
        this.blueTimes = [];
        this.redTimes = [];
        
        this.firstGameReplay = null;
    }

    /**
     * Spielt ein einzelnes Spiel
     */
    playSingleGame(captureReplay = false) {
        const game = this._cloneGame(this.gameTemplate);
        const replay = captureReplay ? [] : null;
        
        let moveCount = 0;
        const maxMoves = 1000;

        while (!game.isGameOver && moveCount < maxMoves) {
            const validMoves = game.getAllValidMoves();
            if (validMoves.length === 0) break;

            const agent = game.currentPlayer === 1 ? this.agentBlue : this.agentRed;
            const startTime = performance.now();
            const action = agent.getAction(game);
            const moveTime = performance.now() - startTime;

            // Zeit erfassen
            if (game.currentPlayer === 1) {
                this.blueTimes.push(moveTime);
            } else {
                this.redTimes.push(moveTime);
            }

            if (!action || !game.makeMove(action.move)) {
                // Ungültiger Zug
                game.winner = game.currentPlayer === 1 ? 2 : 1;
                game.isGameOver = true;
                break;
            }

            if (captureReplay && replay) {
                replay.push({
                    player: game.currentPlayer === 1 ? 2 : 1,
                    move: action.move,
                    time: moveTime
                });
            }

            moveCount++;
        }

        // Ergebnis speichern
        const result = game.winner || 0;
        if (result === 1) this.stats.blueWins++;
        else if (result === 2) this.stats.redWins++;
        else if (result === 0) this.stats.draws++;

        this.totalMoves += moveCount;
        this.gameCount++;

        return { result, moveCount, replay };
    }

    /**
     * Führt eine Serie von Spielen aus
     */
    async runSeries(numGames, progressCallback = null) {
        this.stats = { blueWins: 0, redWins: 0, draws: 0 };
        this.totalMoves = 0;
        this.gameCount = 0;
        this.blueTimes = [];
        this.redTimes = [];
        this.isStopped = false;

        const startTime = performance.now();

        for (let i = 0; i < numGames && !this.isStopped; i++) {
            // Erstes Spiel als Replay erfassen
            const shouldCapture = i === 0;
            const result = this.playSingleGame(shouldCapture);
            
            if (shouldCapture) {
                this.firstGameReplay = {
                    ...result,
                    blueName: this.agentBlue.name,
                    redName: this.agentRed.name
                };
            }

            if (progressCallback) {
                progressCallback(i + 1, numGames);
            }

            // Kleine Pause alle 50 Spiele
            if (i % 50 === 0 && i > 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        const totalTime = performance.now() - startTime;

        // Durchschnitte berechnen
        const avgBlueTime = this.blueTimes.length > 0 
            ? this.blueTimes.reduce((a, b) => a + b, 0) / this.blueTimes.length
            : 0;
        const avgRedTime = this.redTimes.length > 0 
            ? this.redTimes.reduce((a, b) => a + b, 0) / this.redTimes.length
            : 0;

        this.advancedStats = {
            blueAvgTime: avgBlueTime.toFixed(2) + ' ms',
            blueMaxTime: (Math.max(...this.blueTimes, 0)).toFixed(2) + ' ms',
            redAvgTime: avgRedTime.toFixed(2) + ' ms',
            redMaxTime: (Math.max(...this.redTimes, 0)).toFixed(2) + ' ms'
        };

        return {
            blueWins: this.stats.blueWins,
            redWins: this.stats.redWins,
            draws: this.stats.draws,
            winRateBlue: ((this.stats.blueWins / numGames) * 100).toFixed(1) + '%',
            winRateRed: ((this.stats.redWins / numGames) * 100).toFixed(1) + '%',
            drawRate: ((this.stats.draws / numGames) * 100).toFixed(1) + '%',
            averageMoves: (this.totalMoves / numGames).toFixed(1),
            averageGameTimeMs: (totalTime / numGames).toFixed(1),
            totalTimeMs: totalTime.toFixed(0)
        };
    }

    /**
     * Stoppt die Simulation
     */
    stop() {
        this.isStopped = true;
    }

    /**
     * Cloned das Spiel
     */
    _cloneGame(game) {
        if (game.clone && typeof game.clone === 'function') {
            return game.clone();
        }

        // Fallback: Manuelles Cloning
        const clone = Object.create(Object.getPrototypeOf(game));
        for (const key in game) {
            const val = game[key];
            if (Array.isArray(val)) {
                clone[key] = val.map(item => 
                    Array.isArray(item) ? [...item] : item
                );
            } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                clone[key] = { ...val };
            } else {
                clone[key] = val;
            }
        }
        return clone;
    }
}

// Initialisiere die Arena bei Seitenlade
document.addEventListener('DOMContentLoaded', () => {
    new ArenaController();
});
