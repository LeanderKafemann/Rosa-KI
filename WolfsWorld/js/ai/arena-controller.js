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
        
        const resetBtn = document.getElementById('resetButton');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetUI());
        }
        
        // Agent Config Buttons
        const configAgent1Btn = document.getElementById('configAgent1Btn');
        const configAgent2Btn = document.getElementById('configAgent2Btn');
        
        if (configAgent1Btn) {
            configAgent1Btn.addEventListener('click', () => openAgentConfig(1));
        }
        if (configAgent2Btn) {
            configAgent2Btn.addEventListener('click', () => openAgentConfig(2));
        }
        
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
            // Debug: Log vor Start
            console.log("🚀 Simulation Start:", {
                agent1: document.getElementById('agent1Select').value,
                agent2: document.getElementById('agent2Select').value,
                numGames: document.getElementById('numGames').value,
                gameType: document.getElementById('gameSelect').value
            });

            // UI Lock
            document.getElementById('startButton').disabled = true;
            document.getElementById('stopButton').disabled = false;
            document.getElementById('stopButton').style.display = 'inline-block';
            this.isRunning = true;
            this.hideError();

            // Agenten erstellen
            const agent1Key = document.getElementById('agent1Select').value;
            const agent2Key = document.getElementById('agent2Select').value;

            console.log(`👤 Erstelle Agenten: ${agent1Key}, ${agent2Key}`);

            const agentBlue = createAgentFromProfile(agent1Key);
            const agentRed = createAgentFromProfile(agent2Key);

            console.log(`✓ Agent1: ${agentBlue ? agentBlue.name : 'NULL'}`);
            console.log(`✓ Agent2: ${agentRed ? agentRed.name : 'NULL'}`);
            console.log(`Agent1 Type:`, agentBlue ? agentBlue.constructor.name : 'N/A');
            console.log(`Agent2 Type:`, agentRed ? agentRed.constructor.name : 'N/A');

            if (!agentBlue || !agentRed) {
                throw new Error("Agenten konnten nicht erstellt werden");
            }

            // Arena vorbereiten
            const gameType = document.getElementById('gameSelect').value;
            console.log(`🎮 Erstelle Game-Template für: ${gameType}`);
            
            const templateGame = this.currentGameFactory();
            console.log(`🎮 Spiel-Template erstellt:`, {
                exists: templateGame !== null,
                type: templateGame ? templateGame.constructor.name : 'N/A',
                hasBoard: templateGame && templateGame.board ? 'YES' : 'NO',
                isGameOver: templateGame ? templateGame.isGameOver : 'N/A'
            });

            if (!templateGame) {
                throw new Error("Spiel-Template konnte nicht erstellt werden");
            }

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
            console.log(`⏱️ Starte Simulation mit ${numGames} Spielen...`);
            const stats = await this.arena.runSeries(
                numGames,
                (current, total) => {
                    this.updateProgress(current, total);
                    if (current === 1) {
                        console.log(`✓ Erstes Spiel beendet. Ergebnis: ${this.arena.stats.blueWins + this.arena.stats.redWins + this.arena.stats.draws}/${total}`);
                    }
                }
            );

            console.log("✓ Simulation beendet. Ergebnisse:", stats);

            // Ergebnisse anzeigen
            this.displayResults(stats, agentBlue.name, agentRed.name);

        } catch (error) {
            console.error("❌ Simulation-Fehler:", error);
            console.error("Stack:", error.stack);
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
        // Placeholder - kann später mit echter Spiel-Visualisierung erweitert werden
        if (this.arena.firstGameReplay) {
            console.log('Erstes Spiel Replay:', this.arena.firstGameReplay);
        }
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

        // Spielfeld Visualisierung (wenn Replay vorhanden)
        if (this.arena.firstGameReplay && this.arena.firstGameReplay.replay) {
            this.showGameboardVisualization(this.arena.firstGameReplay);
        }

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
     * Zeigt das Spielfeld des ersten Spiels an
     */
    showGameboardVisualization(replay) {
        const container = document.getElementById('gameboardVisualization');
        const boardDiv = document.getElementById('gameboard');
        
        if (!replay || !replay.replay || replay.replay.length === 0) {
            container.style.display = 'none';
            return;
        }

        // Vereinfachte Darstellung: Zeige die Züge als Liste
        let html = '<div style="font-family: monospace; font-size: 0.9em;">';
        html += `<p><strong>Gewinner:</strong> ${replay.result === 1 ? '🔵 Blau' : replay.result === 2 ? '🔴 Rot' : '🤝 Unentschieden'}</p>`;
        html += `<p><strong>Gesamt Züge:</strong> ${replay.moveCount}</p>`;
        html += '<p><strong>Zugfolge:</strong></p>';
        html += '<ol style="padding-left: 20px;">';
        
        replay.replay.forEach((move, i) => {
            const icon = move.player === 1 ? '🔵' : '🔴';
            const moveStr = typeof move.move === 'object' ? 
                `[${move.move.big},${move.move.small}]` : 
                move.move;
            html += `<li>${icon} Zug ${i+1}: Feld ${moveStr} (${move.time.toFixed(1)}ms)</li>`;
        });
        
        html += '</ol></div>';
        
        boardDiv.innerHTML = html;
        container.style.display = 'block';
    }

    /**
     * Setzt die UI zurück
     */
    resetUI() {
        document.getElementById('resultsSection').style.display = 'none';
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
        
        // Debug erstes Spiel
        const isFirstGame = this.gameCount === 0 && captureReplay;
        if (isFirstGame) {
            console.log(`🎮 [Spiel 1] Start:`, {
                currentPlayer: game.currentPlayer,
                isGameOver: game.isGameOver,
                validMoves: game.getAllValidMoves().length
            });
        }

        while (!game.isGameOver && moveCount < maxMoves) {
            const validMoves = game.getAllValidMoves();
            if (validMoves.length === 0) {
                if (isFirstGame) console.log(`🎮 [Spiel 1] Keine gültigen Züge mehr`);
                break;
            }

            const currentPlayer = game.currentPlayer;
            const agent = currentPlayer === 1 ? this.agentBlue : this.agentRed;
            const startTime = performance.now();
            const action = agent.getAction(game);
            const moveTime = performance.now() - startTime;

            // Zeit erfassen
            if (currentPlayer === 1) {
                this.blueTimes.push(moveTime);
            } else {
                this.redTimes.push(moveTime);
            }

            if (!action) {
                if (isFirstGame) console.log(`🎮 [Spiel 1] Agent ${currentPlayer} gab null zurück`);
                game.board.winner = currentPlayer === 1 ? 2 : 1;
                break;
            }

            const moveSuccessful = game.makeMove(action.move);
            if (!moveSuccessful) {
                if (isFirstGame) console.log(`🎮 [Spiel 1] Agent ${currentPlayer} machte ungültigen Zug:`, action.move);
                game.board.winner = currentPlayer === 1 ? 2 : 1;
                break;
            }

            if (captureReplay && replay) {
                replay.push({
                    player: currentPlayer,
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
        
        if (isFirstGame) {
            console.log(`🎮 [Spiel 1] Ende:`, {
                winner: result,
                moves: moveCount,
                stats: this.stats
            });
        }

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

/**
 * Agent-Konfiguration Funktionen (globale Scope)
 */

// Speichert die aktuelle Agent-Konfiguration
window.agentConfigs = {
    agent1: { depth: 4, heuristics: 'balanced', rules: 'balanced' },
    agent2: { depth: 4, heuristics: 'balanced', rules: 'balanced' }
};

/**
 * Aktualisiert die Parameter für Agent 1
 */
function updateAgent1Params() {
    updateAgentParams(1);
}

/**
 * Aktualisiert die Parameter für Agent 2
 */
function updateAgent2Params() {
    updateAgentParams(2);
}

/**
 * Aktualisiert die Parametern-Anzeige für einen Agent
 */
function updateAgentParams(agentNumber) {
    const agentSelect = document.getElementById(`agent${agentNumber}Select`);
    const paramGroup = document.getElementById(`agent${agentNumber}ParamGroup`);
    const agentType = agentSelect.value;
    
    // Bestimme ob Minimax, Rule-based oder Random
    let html = '';
    
    if (agentType.includes('minimax')) {
        // Suchtiefe auswählen basierend auf Profil-Name
        const depthMap = {
            'minimaxCautious': 2,
            'minimaxBalanced': 3,
            'minimaxAggressive': 4,
            'minimaxHeuristicCentered': 3,
            'minimaxHeuristicMobility': 3
        };
        const defaultDepth = depthMap[agentType] || 3;
        
        html = `
            <label class="viz-label">Suchtiefe:</label>
            <input type="range" id="agent${agentNumber}Depth" min="2" max="8" value="${defaultDepth}" 
                   onchange="updateDepthLabel(${agentNumber})">
            <span id="agent${agentNumber}DepthLabel" style="color: white; font-size: 0.85em;">${defaultDepth}</span>
        `;
        window.agentConfigs[`agent${agentNumber}`].depth = defaultDepth;
    } else if (agentType.includes('ruleBased') || agentType.includes('ruleBasedConservative') || agentType.includes('ruleBasedBalanced') || agentType.includes('ruleBasedAggressive')) {
        // Strategie auswählen
        const strategyMap = {
            'ruleBasedConservative': 'defensive',
            'ruleBasedBalanced': 'balanced',
            'ruleBasedAggressive': 'aggressive'
        };
        const defaultStrategy = strategyMap[agentType] || 'balanced';
        
        html = `
            <label class="viz-label">Strategie:</label>
            <select id="agent${agentNumber}Strategy" onchange="updateStrategyConfig(${agentNumber})">
                <option value="aggressive" ${defaultStrategy === 'aggressive' ? 'selected' : ''}>Offensiv</option>
                <option value="defensive" ${defaultStrategy === 'defensive' ? 'selected' : ''}>Defensiv</option>
                <option value="balanced" ${defaultStrategy === 'balanced' ? 'selected' : ''}>Ausgewogen</option>
            </select>
        `;
        window.agentConfigs[`agent${agentNumber}`].rules = defaultStrategy;
    } else if (agentType === 'random') {
        html = `<span style="color: #bbb; font-size: 0.85em;">Keine Parameter</span>`;
    }
    
    paramGroup.innerHTML = html;
    paramGroup.style.display = html ? 'flex' : 'none';
}

/**
 * Aktualisiert die Suchtiefe-Anzeige
 */
function updateDepthLabel(agentNumber) {
    const depthInput = document.getElementById(`agent${agentNumber}Depth`);
    const depthLabel = document.getElementById(`agent${agentNumber}DepthLabel`);
    depthLabel.textContent = depthInput.value;
    window.agentConfigs[`agent${agentNumber}`].depth = parseInt(depthInput.value);
}

/**
 * Aktualisiert die Strategie-Konfiguration
 */
function updateStrategyConfig(agentNumber) {
    const strategySelect = document.getElementById(`agent${agentNumber}Strategy`);
    window.agentConfigs[`agent${agentNumber}`].rules = strategySelect.value;
}

/**
 * Öffnet das Agent-Konfigurationsmodal (veraltet - wird durch Toolbar ersetzt)
 */
function openAgentConfig(agentNumber) {
    const agentName = `agent${agentNumber}`;
    const modal = document.getElementById('agentConfigModal');
    const title = document.getElementById('agentConfigTitle');
    const content = document.getElementById('agentConfigContent');
    
    const agentType = document.getElementById(`agent${agentNumber}Select`)?.value || 'minimax-depth-4';
    const config = window.agentConfigs[agentName] || {};
    
    title.textContent = `Agent ${agentNumber} Konfiguration`;
    
    // Generiere Form basierend auf Agent-Typ
    let formHTML = `<input type="hidden" id="configAgentNumber" value="${agentNumber}">`;
    
    if (agentType.includes('minimax')) {
        formHTML += `
            <div class="config-item">
                <label for="configDepth">Suchtiefe:</label>
                <input type="range" id="configDepth" min="2" max="8" value="${config.depth || 4}" 
                       oninput="document.getElementById('depthValue').textContent = this.value">
                <div class="range-value">Wert: <span id="depthValue">${config.depth || 4}</span></div>
            </div>
        `;
    } else if (agentType.includes('rule-based')) {
        formHTML += `
            <div class="config-item">
                <label for="configRules">Strategie:</label>
                <select id="configRules">
                    <option value="aggressive" ${config.rules === 'aggressive' ? 'selected' : ''}>Offensiv (Gewinnen)</option>
                    <option value="defensive" ${config.rules === 'defensive' ? 'selected' : ''}>Defensiv (Blocken)</option>
                    <option value="balanced" ${config.rules === 'balanced' ? 'selected' : ''}>Ausgewogen</option>
                </select>
            </div>
        `;
    } else if (agentType.includes('random')) {
        formHTML += `
            <div class="config-item">
                <p style="color: #7f8c8d; font-size: 0.9em;">Random-Agent hat keine konfigurierbaren Parameter.</p>
            </div>
        `;
    }
    
    formHTML += `
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="viz-btn" style="flex: 1; background: #3498db;" onclick="saveAgentConfig()">✓ Speichern</button>
            <button class="viz-btn" style="flex: 1; background: #95a5a6;" onclick="closeAgentConfig()">✗ Abbrechen</button>
        </div>
    `;
    
    content.innerHTML = formHTML;
    modal.style.display = 'flex';
}

/**
 * Speichert die Agent-Konfiguration (veraltet)
 */
function saveAgentConfig() {
    const agentNumber = document.getElementById('configAgentNumber').value;
    const agentName = `agent${agentNumber}`;
    const agentType = document.getElementById(`agent${agentNumber}Select`)?.value || 'minimax-depth-4';
    
    let config = {};
    
    if (agentType.includes('minimax')) {
        config.depth = parseInt(document.getElementById('configDepth')?.value || 4);
        config.heuristics = 'balanced';
    } else if (agentType.includes('rule-based')) {
        config.rules = document.getElementById('configRules')?.value || 'balanced';
        config.depth = 4; // dummy
    } else if (agentType.includes('random')) {
        config.depth = 0;
    }
    
    window.agentConfigs[agentName] = config;
    
    console.log(`Agent ${agentNumber} konfiguriert:`, config);
    closeAgentConfig();
}

/**
 * Schließt das Agent-Konfigurationsmodal
 */
function closeAgentConfig() {
    const modal = document.getElementById('agentConfigModal');
    modal.style.display = 'none';
}

// Initialisiere die Arena bei Seitenlade
document.addEventListener('DOMContentLoaded', () => {
    console.log("🎮 KI Arena wird initialisiert...");
    
    // Debug-Checks
    console.log("✓ AgentProfiles vorhanden:", typeof AgentProfiles !== 'undefined');
    console.log("✓ GameFactories vorhanden:", typeof GameFactories !== 'undefined');
    console.log("✓ createAgentFromProfile vorhanden:", typeof createAgentFromProfile === 'function');
    console.log("✓ MinimaxAgent vorhanden:", typeof MinimaxAgent !== 'undefined');
    console.log("✓ RandomAgent vorhanden:", typeof RandomAgent !== 'undefined');
    
    // Verfügbare Profile auflisten
    if (typeof AgentProfiles !== 'undefined') {
        console.log("📋 Verfügbare Agenten:", Object.keys(AgentProfiles));
    }
    
    // Verfügbare Spiele auflisten  
    if (typeof GameFactories !== 'undefined') {
        console.log("🎯 Verfügbare Spiele:", Object.keys(GameFactories));
    }
    
    new ArenaController();
    
    // Initiale Parameter-Anzeige
    updateAgent1Params();
    updateAgent2Params();
    
    console.log("✓ Arena-Controller initialisiert");
});
