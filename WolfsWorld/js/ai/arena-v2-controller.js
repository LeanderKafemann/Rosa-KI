/* --- FILE: js/ai/arena-v2-controller.js --- */
/**
 * KI Arena V2 - Vereinfachter Ansatz basierend auf ttt-regular.html
 */

const ArenaV2 = {
    // State
    isRunning: false,
    currentGame: null,
    stats: {
        totalGames: 0,
        blueWins: 0,
        redWins: 0,
        draws: 0,
        totalTime: 0,
        totalMoves: 0,
        blueTotalTime: 0,
        redTotalTime: 0,
        blueMoveTimes: [],
        redMoveTimes: [],
        gameTimes: []
    },
    
    // Config
    agent1Config: { type: 'minimax', depth: 9, heuristic: 'regularTTT' },
    agent2Config: { type: 'minimax', depth: 6, heuristic: 'regularTTT' },

    init() {
        console.log("ArenaV2.init() called");
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));

        // Event Listener für Dropdowns
        document.getElementById('agent1Type').onchange = () => this.updateAgent1Config();
        document.getElementById('agent2Type').onchange = () => this.updateAgent2Config();
        document.getElementById('gameSelect').onchange = () => this.resetGame();
        document.getElementById('advancedStatsCheck').onchange = () => this.toggleAdvancedStats();

        this.resetGame();
    },

    resetGame() {
        console.log("ArenaV2.resetGame()");
        const gameType = document.getElementById('gameSelect').value;
        
        switch(gameType) {
            case 'TTT Regular':
                this.currentGame = new TTTRegularBoard();
                break;
            case 'TTT 3D':
                // TODO: Implementieren
                this.currentGame = new TTTRegularBoard(); // Fallback
                break;
            case 'TTT Ultimate':
                // TODO: Implementieren
                this.currentGame = new TTTRegularBoard(); // Fallback
                break;
            default:
                this.currentGame = new TTTRegularBoard();
        }
        
        this.draw();
        this.updateStatus("Bereit");
    },

    updateAgent1Config() {
        const type = document.getElementById('agent1Type').value;
        const container = document.getElementById('agent1Config');
        
        if (type === 'minimax') {
            container.innerHTML = `
                <label class="viz-label" style="margin-top: 10px;">Suchtiefe:</label>
                <input type="range" id="agent1Depth" min="1" max="9" value="9" class="viz-select" style="padding: 0;">
                <span id="agent1DepthValue" style="font-size: 12px;">9</span>
            `;
            document.getElementById('agent1Depth').onchange = (e) => {
                this.agent1Config.depth = parseInt(e.target.value);
                document.getElementById('agent1DepthValue').textContent = e.target.value;
            };
        } else if (type === 'rulebased') {
            container.innerHTML = `
                <label class="viz-label" style="margin-top: 10px;">Strategie: Regeln (fest)</label>
            `;
        } else {
            container.innerHTML = '';
        }
        
        this.agent1Config.type = type;
    },

    updateAgent2Config() {
        const type = document.getElementById('agent2Type').value;
        const container = document.getElementById('agent2Config');
        
        if (type === 'minimax') {
            container.innerHTML = `
                <label class="viz-label" style="margin-top: 10px;">Suchtiefe:</label>
                <input type="range" id="agent2Depth" min="1" max="9" value="6" class="viz-select" style="padding: 0;">
                <span id="agent2DepthValue" style="font-size: 12px;">6</span>
            `;
            document.getElementById('agent2Depth').onchange = (e) => {
                this.agent2Config.depth = parseInt(e.target.value);
                document.getElementById('agent2DepthValue').textContent = e.target.value;
            };
        } else if (type === 'rulebased') {
            container.innerHTML = `
                <label class="viz-label" style="margin-top: 10px;">Strategie: Regeln (fest)</label>
            `;
        } else {
            container.innerHTML = '';
        }
        
        this.agent2Config.type = type;
    },

    createAgent(config, isBlue) {
        console.log(`Creating agent (${isBlue ? 'Blue' : 'Red'}):`, config);
        
        if (config.type === 'random') {
            return new RandomAgent();
        } else if (config.type === 'rulebased') {
            return new RuleBasedAgent(createStrategyTree('regular'));
        } else if (config.type === 'minimax') {
            return new MinimaxAgent({
                name: isBlue ? "Agent Blau" : "Agent Rot",
                maxDepth: config.depth || 9,
                useAlphaBeta: true,
                heuristicFn: HeuristicsLibrary.regularTTT
            });
        }
        return new RandomAgent(); // Fallback
    },

    async start() {
        console.log("ArenaV2.start()");
        
        if (this.isRunning) return;
        this.isRunning = true;
        
        // UI Update
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'block';
        
        // Reset Stats
        this.stats = {
            totalGames: 0,
            blueWins: 0,
            redWins: 0,
            draws: 0,
            totalTime: 0,
            totalMoves: 0,
            blueTotalTime: 0,
            redTotalTime: 0,
            blueMoveTimes: [],
            redMoveTimes: [],
            gameTimes: []
        };

        const gameCount = parseInt(document.getElementById('gameCount').value) || 10;
        const startTime = performance.now();

        for (let i = 0; i < gameCount && this.isRunning; i++) {
            this.updateStatus(`Spiel ${i + 1}/${gameCount}...`);
            await this.playGame();
            
            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const endTime = performance.now();
        this.stats.totalTime = endTime - startTime;

        this.displayResults();
        this.updateStatus("Fertig!");
        
        this.isRunning = false;
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('stopBtn').style.display = 'none';
    },

    stop() {
        console.log("ArenaV2.stop()");
        this.isRunning = false;
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('stopBtn').style.display = 'none';
        this.updateStatus("Gestoppt");
    },

    async playGame() {
        this.resetGame();
        
        const agent1 = this.createAgent(this.agent1Config, true);
        const agent2 = this.createAgent(this.agent2Config, false);
        
        const gameStartTime = performance.now();
        let moveCount = 0;

        while (!this.currentGame.winner && this.currentGame.getAllValidMoves().length > 0) {
            const isPlayer1 = this.currentGame.currentPlayer === 1;
            const agent = isPlayer1 ? agent1 : agent2;
            const moveStartTime = performance.now();

            const action = agent.getAction(this.currentGame);
            if (action) {
                this.currentGame.makeMove(action.move);
                moveCount++;

                const moveTime = performance.now() - moveStartTime;
                if (isPlayer1) {
                    this.stats.blueTotalTime += moveTime;
                    this.stats.blueMoveTimes.push(moveTime);
                } else {
                    this.stats.redTotalTime += moveTime;
                    this.stats.redMoveTimes.push(moveTime);
                }
            }

            this.draw();
        }

        // Record result
        this.stats.totalGames++;
        this.stats.totalMoves += moveCount;
        
        if (this.currentGame.winner) {
            if (this.currentGame.winner === 1) {
                this.stats.blueWins++;
            } else {
                this.stats.redWins++;
            }
        } else {
            this.stats.draws++;
        }

        const gameTime = performance.now() - gameStartTime;
        this.stats.gameTimes.push(gameTime);
    },

    displayResults() {
        console.log("ArenaV2.displayResults()");
        const stats = this.stats;

        document.getElementById('totalGames').textContent = stats.totalGames;
        document.getElementById('totalTime').textContent = Math.round(stats.totalTime) + 'ms';
        
        document.getElementById('blueWins').textContent = stats.blueWins;
        document.getElementById('redWins').textContent = stats.redWins;
        document.getElementById('draws').textContent = stats.draws;

        const total = stats.totalGames;
        const bluePercent = total > 0 ? Math.round(stats.blueWins / total * 100) : 0;
        const redPercent = total > 0 ? Math.round(stats.redWins / total * 100) : 0;
        const drawPercent = total > 0 ? Math.round(stats.draws / total * 100) : 0;

        document.getElementById('bluePercent').textContent = bluePercent + '%';
        document.getElementById('redPercent').textContent = redPercent + '%';
        document.getElementById('drawPercent').textContent = drawPercent + '%';

        // Advanced Stats
        if (stats.totalGames > 0) {
            const avgMoves = (stats.totalMoves / stats.totalGames).toFixed(1);
            const avgTime = (stats.totalTime / stats.totalGames).toFixed(0);
            const blueAvgTime = stats.blueMoveTimes.length > 0 
                ? (stats.blueTotalTime / stats.blueMoveTimes.length).toFixed(1)
                : 0;
            const redAvgTime = stats.redMoveTimes.length > 0 
                ? (stats.redTotalTime / stats.redMoveTimes.length).toFixed(1)
                : 0;

            document.getElementById('avgMoves').textContent = avgMoves;
            document.getElementById('avgTime').textContent = avgTime + 'ms';
            document.getElementById('blueAvgTime').textContent = blueAvgTime + 'ms';
            document.getElementById('redAvgTime').textContent = redAvgTime + 'ms';
        }
    },

    toggleAdvancedStats() {
        const isChecked = document.getElementById('advancedStatsCheck').checked;
        const advancedSection = document.getElementById('advancedStats');
        
        if (isChecked) {
            advancedSection.classList.add('show');
        } else {
            advancedSection.classList.remove('show');
        }
    },

    handleCanvasClick(e) {
        // Optional: Manuelle Züge während Arena läuft (für später)
    },

    updateStatus(text) {
        document.getElementById('statusText').textContent = text;
    },

    draw() {
        if (!this.canvas || !this.currentGame) return;
        TTTRenderer.drawRegular(this.canvas, this.currentGame);
    }
};

window.addEventListener('DOMContentLoaded', () => ArenaV2.init());
