# Projektstrategie für Schülerentwicklung - KI Lernplattform

**Version:** 1.0 | **Datum:** 27. Januar 2026  
**Ziel:** Strukturierte Entwicklung von Schülerprojekten in einer modularen, erweiterbaren Architektur

---

## 📋 Inhaltsverzeichnis
1. [Modularity-Analyse](#modularity-analyse)
2. [Architektur für Schülerprojekte](#architektur-für-schülerprojekte)
3. [Vier Projekttypen mit Anleitungen](#vier-projekttypen-mit-anleitungen)
4. [Externe Entwicklungsumgebung](#externe-entwicklungsumgebung)
5. [Aufgabenstellungen für Schüler](#aufgabenstellungen-für-schüler)
6. [Migrations- & Integrationsprozess](#migrations--integrationsprozess)

---

## 🔍 Modularity-Analyse

### ✅ Bestehende Modularität

Dein Code ist bereits **gut strukturiert** für externe Erweiterungen:

#### **Kerninterfaces (Schnittstellen)**
```
js/core/
├── agent.js          → Basisklasse für alle KI-Agenten
└── game-state.js     → Interface für Spielzustände
```

**Vorteile:**
- ✅ Alle KI-Agenten erben von `Agent` mit `getAction(gameState)` 
- ✅ Alle Spiele implementieren `GameState`-Interface
- ✅ Klare Separation of Concerns
- ✅ JSDoc-Dokumentation vorhanden
- ✅ Bestehende Implementierungen als Vorbilder

#### **Agenten-Architektur**
```
js/ai/agents/
├── random-agent.js        → Einfachste Implementierung (Vorbild!)
├── rule-based-agent.js    → Mittelmäßige Komplexität
└── minimax-agent.js       → Fortgeschrittene Implementierung
```

#### **Spielimplementierungen**
```
js/games/
├── tictactoe/
│   ├── logic.js           → GameState-Implementierung
│   ├── regular-controller.js
│   ├── 3d-controller.js
│   └── ultimate-controller.js
├── rotatebox/
│   ├── logic.js
│   ├── controller.js
│   └── renderer.js
└── knights-tour/
    ├── logic.js
    ├── controller.js
    └── renderer.js
```

### ⚠️ Verbesserungspotenzial

**1. Template-Struktur für neue Spiele fehlt**
- Schüler brauchen ein Skeleton für neue Spiele
- HTML, CSS, JavaScript sollten vorstructuriert sein

**2. Learning-Paths (Lernpfade) haben keine Schnittstelle**
- Keine standardisierte Struktur für interaktive Tutorials
- Keine Datenstruktur für Lernfortschritt

**3. Playground-Konzept nicht dokumentiert**
- Wie werden Algorithmen isoliert untersucht?
- Welche Schnittstelle nutzen UI-Komponenten?

**4. Fehlende Validierung für neue Projekte**
- Keine Checkliste, ob neue Module die Interface-Verträge erfüllen

---

## 🏗️ Architektur für Schülerprojekte

### Neuer Ordner-Struktur für externe Entwicklung

```
/Rosa-Complete
├── WolfsWorld/
│   ├── js/core/           [CORE - für Schüler unveränderlich]
│   ├── js/ai/             [KI-ALGORITHMEN - erweiterbar]
│   ├── js/games/          [SPIELE - erweiterbar]
│   ├── playground/        [PLAYGROUNDS - erweiterbar]
│   └── learning/          [LERNPFADE - erweiterbar]
│
└── SchülerProjekte/       ← NEUE STRUKTUR FÜR EXTERNE ENTWICKLUNG
    ├── starter-templates/ [Vorlagen für schnellen Start]
    │   ├── game-template/
    │   ├── agent-template/
    │   ├── playground-template/
    │   └── learning-template/
    │
    ├── [StudentName]/     [Ein Ordner pro Schüler]
    │   ├── projekt-info.json
    │   ├── project-config.js
    │   ├── docs/
    │   │   └── ENTWICKLUNGSLOG.md
    │   ├── src/           [Schüler-Code, NICHT in WolfsWorld]
    │   ├── tests/         [Unit-Tests vor Integration]
    │   └── build-output/  [Für Integration vorbereitet]
    │
    └── review-checklist.md [Kriterien für Abnahme]
```

### Integration in WolfsWorld

Nach erfolgreicher Prüfung wird Code **migriert** zu:

```
WolfsWorld/
├── js/ai/agents/custom/        [Neue KI-Agenten]
├── js/ai/playgrounds/          [Neue Playgrounds]
├── js/games/[game-name]/       [Neues Spiel]
└── learning/courses/[course]/  [Neuer Lernpfad]
```

---

## 📚 Vier Projekttypen mit Anleitungen

### **PROJEKT-TYP 1: Neues Spiel/Rätsel**

#### 🎯 Anforderungen

Ein neues Spiel mit:
- Spiellogik (GameState-Interface)
- Grafik-Rendering
- Mindestens 2 KI-Agenten
- HTML/CSS/JavaScript Controller

#### 📦 Struktur im StudentenProjekt

```
SchülerProjekte/[Name]/src/
├── logic.js                    [GameState implementiert]
├── renderer.js                 [Canvas/DOM-Rendering]
├── controller.js               [UI-Interaktion]
├── [game-name].html            [Standalone-Version]
└── ai-integration-config.js    [Agenten verbinden]
```

#### 📖 Schritt-für-Schritt Anleitung

**Phase 1: GameState implementieren**

```javascript
// src/logic.js
class MatchstickBoard extends GameState {
    constructor() {
        super();
        this.piles = [3, 3, 3];      // Drei Haufen mit je 3 Streichhölzern
        this.currentPlayer = 1;      // 1 = Spieler, 2 = KI
        this.isGameOver = false;
        this.winner = 0;             // 0 = lauft, 1 = Spieler gewinnt, 2 = KI gewinnt
    }

    getAllValidMoves() {
        // Gibt alle legalen Züge zurück
        // Format: Array von Objekten { pile: 0-2, count: 1-n }
        // z.B. [{pile: 0, count: 1}, {pile: 0, count: 2}, {pile: 1, count: 1}, ...]
        const moves = [];
        for (let pile = 0; pile < 3; pile++) {
            for (let count = 1; count <= this.piles[pile]; count++) {
                moves.push({ pile, count });
            }
        }
        return moves;
    }

    makeMove(move) {
        if (!move || move.count > this.piles[move.pile]) return false;
        
        this.piles[move.pile] -= move.count;
        
        // Spielende prüfen: Wenn nur noch 1 Streichholz übrig
        const totalLeft = this.piles.reduce((a, b) => a + b);
        if (totalLeft === 0) {
            this.isGameOver = true;
            this.winner = this.currentPlayer === 1 ? 2 : 1; // Wer den letzten nimmt, gewinnt (oder verliert!)
        }
        
        this.switchPlayer();
        return true;
    }

    clone() {
        const cloned = new MatchstickBoard();
        cloned.piles = [...this.piles];
        cloned.currentPlayer = this.currentPlayer;
        cloned.isGameOver = this.isGameOver;
        cloned.winner = this.winner;
        return cloned;
    }

    getStateKey() {
        return `${this.piles.join(',')}-${this.currentPlayer}`;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }
}
```

**Phase 2: Renderer implementieren**

```javascript
// src/renderer.js
class MatchstickRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    draw(board) {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Zeichne drei Haufen
        const pileWidth = 100;
        const startX = 50;
        
        for (let pile = 0; pile < 3; pile++) {
            const x = startX + pile * 150;
            this.drawPile(x, 100, board.piles[pile]);
        }
    }

    drawPile(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.ctx.fillStyle = '#d32f2f';
            this.ctx.fillRect(x, y + i * 12, 20, 10);
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y + i * 12, 20, 10);
        }
    }
}
```

**Phase 3: Integration mit bestehenden KI-Agenten**

```javascript
// src/ai-integration-config.js
// Schüler nutzen RandomAgent und MinimaxAgent aus WolfsWorld!

const agents = [
    new RandomAgent(),
    new MinimaxAgent({
        heuristicFn: (board, player) => {
            // Heuristik: Wer die meisten Streichhölzer nimmt, gewinnt
            const totalLeft = board.piles.reduce((a, b) => a + b);
            return player === 1 ? totalLeft : -totalLeft;
        },
        maxDepth: 5
    })
];
```

**Phase 4: Controller & HTML**

```html
<!-- src/matchstick.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Streichholzspiel</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Streichholzspiel</h1>
    <canvas id="gameCanvas" width="500" height="300"></canvas>
    <div id="controls">
        <button id="newGame">Neues Spiel</button>
    </div>

    <!-- WolfsWorld Core & KI laden -->
    <script src="../../../WolfsWorld/js/core/agent.js"></script>
    <script src="../../../WolfsWorld/js/core/game-state.js"></script>
    <script src="../../../WolfsWorld/js/ai/agents/random-agent.js"></script>
    <script src="../../../WolfsWorld/js/ai/agents/minimax-agent.js"></script>
    <script src="../../../WolfsWorld/js/ai/minimax.js"></script>

    <!-- Schülerprojekt -->
    <script src="logic.js"></script>
    <script src="renderer.js"></script>
    <script src="controller.js"></script>
</body>
</html>
```

#### 📋 Checkliste für Schüler

- [ ] GameState-Klasse implementiert alle Methoden
- [ ] `getAllValidMoves()` gibt alle legalen Züge zurück
- [ ] `makeMove()` aktualisiert korrekt den Zustand
- [ ] `clone()` erstellt tiefe Kopie (nicht Referenz!)
- [ ] `getStateKey()` ist eindeutig für jeden Zustand
- [ ] Renderer zeichnet aktuelle Spielposition korrekt
- [ ] Zwei verschiedene Agenten gegen einander spielbar
- [ ] HTML-Datei lädt alle Scripts korrekt
- [ ] Keine Fehler in Browser-Konsole

#### ✅ Abnahmekriterium

Spiel funktioniert **standalone** in `matchstick.html` UND zwei KI-Agenten können gegeneinander spielen.

---

### **PROJEKT-TYP 2: Neuer KI-Agent**

#### 🎯 Anforderungen

Ein neuer Agent, der:
- Von `Agent` erbt
- `getAction(gameState)` implementiert
- Auf **mindestens 3 verschiedenen Spielen** getestet ist
- Eine Dokumentation hat (Algorithmus-Erklärung)

#### 📦 Struktur im StudentenProjekt

```
SchülerProjekte/[Name]/src/
├── [agent-name].js              [Agent-Implementierung]
├── test-harness.js              [Test-Script]
├── algorithm-documentation.md   [Wie funktioniert es?]
└── performance-benchmark.json   [Performance auf verschiedenen Spielen]
```

#### 📖 Schritt-für-Schritt Anleitung

**Phase 1: Agent-Grundstruktur**

```javascript
// src/monte-carlo-agent.js

/**
 * Monte Carlo Tree Search Agent
 * Erkundet den Spielbaum zufällig und iteriert, um beste Zugstrategie zu finden.
 * 
 * Algorithmus:
 * 1. Simulation: Spieltree zufällig erkunden
 * 2. Backpropagation: Ergebnisse hochpropagieren
 * 3. UCB-Auswahl: Best Upper Confidence Bound als bester Zug
 */
class MonteCarloAgent extends Agent {
    constructor(options = {}) {
        super("Monte Carlo");
        this.iterations = options.iterations || 1000;
        this.explorationConstant = options.explorationConstant || Math.sqrt(2);
    }

    getAction(gameState) {
        const rootNode = this.createNode(gameState);
        
        // Phase 1: Simulationen durchführen
        for (let i = 0; i < this.iterations; i++) {
            this.simulate(rootNode);
        }
        
        // Phase 2: Besten Knoten (Zug) wählen
        const bestChild = this.selectBestChild(rootNode);
        
        if (!bestChild) return null;
        
        return {
            move: bestChild.move,
            reason: `Monte Carlo (${this.iterations} Sim.) - Win-Rate: ${(bestChild.wins / bestChild.visits * 100).toFixed(1)}%`
        };
    }

    createNode(gameState) {
        return {
            state: gameState.clone(),
            move: null,
            parent: null,
            children: [],
            visits: 0,
            wins: 0
        };
    }

    simulate(node) {
        // TODO: Implementierung
        // 1. Traverse: Von root zur expandierbaren Node
        // 2. Expand: Neue Child-Node hinzufügen
        // 3. Rollout: Zufällig spielen bis Spielende
        // 4. Backpropagate: Ergebnis hochfahren
    }

    selectBestChild(node) {
        // Wähle Kind mit höchstem UCB-Wert
        return node.children.reduce((best, child) => {
            const ucbValue = this.calculateUCB(child, node);
            return (!best || ucbValue > this.calculateUCB(best, node)) ? child : best;
        }, null);
    }

    calculateUCB(node, parent) {
        if (node.visits === 0) return Infinity;
        
        const exploitation = node.wins / node.visits;
        const exploration = this.explorationConstant * Math.sqrt(Math.log(parent.visits) / node.visits);
        
        return exploitation + exploration;
    }
}
```

**Phase 2: Testen auf verschiedenen Spielen**

```javascript
// src/test-harness.js

class AgentTestHarness {
    constructor(agent) {
        this.agent = agent;
        this.results = [];
    }

    // Teste Agent auf TicTacToe
    testTicTacToe(rounds = 10) {
        console.log(`Testing ${this.agent.name} on TicTacToe (${rounds} rounds)...`);
        let wins = 0;
        
        for (let i = 0; i < rounds; i++) {
            const board = new TTTRegularBoard();
            const testAgent = new RandomAgent(); // Gegner
            
            const winner = this.playGame(board, this.agent, testAgent);
            if (winner === 1) wins++;
        }
        
        this.results.push({
            game: "TicTacToe",
            rounds,
            wins,
            winRate: (wins / rounds * 100).toFixed(1) + '%'
        });
        
        return this.results[this.results.length - 1];
    }

    // Teste Agent auf RotateBox
    testRotateBox(rounds = 10) {
        console.log(`Testing ${this.agent.name} on RotateBox (${rounds} rounds)...`);
        let solvedCount = 0;
        let moveList = [];
        
        for (let i = 0; i < rounds; i++) {
            const board = new RotateBoard();
            const moves = this.playGame(board, this.agent, null); // Puzzle: Kein Gegner
            
            if (board.isGameOver && board.winner === 1) {
                solvedCount++;
                moveList.push(board.getMoveHistory().length);
            }
        }
        
        this.results.push({
            game: "RotateBox",
            rounds,
            solved: solvedCount,
            solveRate: (solvedCount / rounds * 100).toFixed(1) + '%',
            avgMoves: (moveList.reduce((a, b) => a + b) / moveList.length).toFixed(1)
        });
        
        return this.results[this.results.length - 1];
    }

    playGame(gameState, agent1, agent2) {
        while (!gameState.isGameOver) {
            const currentAgent = gameState.currentPlayer === 1 ? agent1 : agent2;
            if (!currentAgent) break; // Puzzle-Spiel ohne Gegner
            
            const action = currentAgent.getAction(gameState);
            if (!action) break;
            
            gameState.makeMove(action.move);
        }
        
        return gameState.winner;
    }

    printResults() {
        console.table(this.results);
    }

    exportJSON(filename = 'test-results.json') {
        return JSON.stringify(this.results, null, 2);
    }
}

// Verwendung:
// const agent = new MonteCarloAgent({ iterations: 100 });
// const harness = new AgentTestHarness(agent);
// harness.testTicTacToe(10);
// harness.testRotateBox(5);
// harness.printResults();
```

**Phase 3: Performance-Benchmark**

```json
// performance-benchmark.json
{
  "agent": "Monte Carlo Tree Search",
  "author": "Max Musterschüler",
  "timestamp": "2026-01-27",
  "parameters": {
    "iterations": 1000,
    "explorationConstant": 1.414
  },
  "results": {
    "TicTacToe": {
      "rounds": 20,
      "wins": 18,
      "winRate": "90%",
      "avgTimePerMove": "245ms"
    },
    "RotateBox": {
      "rounds": 10,
      "solved": 8,
      "solveRate": "80%",
      "avgMovesPerSolution": 12.5
    },
    "KnightsTour": {
      "rounds": 5,
      "solved": 3,
      "solveRate": "60%"
    }
  },
  "conclusion": "Monte Carlo ist schneller als Minimax, aber weniger präzise in Zero-Sum-Spielen."
}
```

#### 📋 Checkliste für Schüler

- [ ] Agent erbt von `Agent`-Klasse
- [ ] `getAction()` gibt `{move, reason}` zurück
- [ ] Agent funktioniert auf TicTacToe
- [ ] Agent funktioniert auf RotateBox
- [ ] Agent funktioniert auf KnightsTour (oder drittes Spiel)
- [ ] Test-Harness führt automatisierte Tests durch
- [ ] Performance-Benchmark dokumentiert
- [ ] Algorithmus-Erklärung ist verständlich
- [ ] Code ist kommentiert

#### ✅ Abnahmekriterium

Agent wird getestet auf **3+ verschiedenen Spielen** mit messbaren Ergebnissen (Win-Rate, Lösezeit, etc.).

---

### **PROJEKT-TYP 3: Neuer Playground**

#### 🎯 Anforderungen

Ein interaktiver Playground, in dem:
- Ein **spezifischer KI-Algorithmus** visualisiert wird
- Schüler Parameter **live ändern** können
- Der **Suchbaum oder Entscheidungsprozess** sichtbar wird
- Mit **mehreren Spielen** funktioniert

#### 📦 Struktur im StudentenProjekt

```
SchülerProjekte/[Name]/src/
├── playground.html                    [Hauptseite]
├── visualizer.js                      [Visualisierungs-Logik]
├── algorithm-debugger.js              [Interaktive Debug-Tools]
├── ui-controls.js                     [Slider, Dropdown, etc.]
└── playground-documentation.md        [Was kann man damit lernen?]
```

#### 📖 Schritt-für-Schritt Anleitung

**Phase 1: Visualisierungs-Framework**

```javascript
// src/visualizer.js

class AlgorithmVisualizer {
    constructor(containerId, gameState) {
        this.container = document.getElementById(containerId);
        this.gameState = gameState.clone();
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.traceData = [];
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        this.container.appendChild(canvas);
        return canvas;
    }

    /**
     * Visualisiere Minimax-Suchbaum
     * @param {Object} traceData - Trace-Daten von MinimaxEngine
     * @param {Object} options - Visualisierungs-Optionen
     */
    visualizeMinimaxTree(traceData, options = {}) {
        const {
            showScore: true,
            colorizeAlphaBeta: true,
            animateExpansion: false
        } = options;

        // Konvertiere Trace-Daten zu Baum-Struktur
        const tree = this.buildTreeFromTrace(traceData);
        
        // Zeichne Knoten und Kanten
        this.drawTree(tree);
        
        // Highlight beste Moves
        this.highlightBestPath(tree);
    }

    /**
     * Visualisiere Markov-Chain Übergänge
     */
    visualizeMarkovChain(transitionMatrix, startState) {
        const states = Object.keys(transitionMatrix);
        const radius = 50;
        
        // Arrange Knoten in Kreis
        states.forEach((state, i) => {
            const angle = (i / states.length) * 2 * Math.PI;
            const x = 400 + 150 * Math.cos(angle);
            const y = 300 + 150 * Math.sin(angle);
            
            this.drawStateNode(x, y, state, state === startState);
        });
        
        // Zeichne Transitions-Pfeile mit Wahrscheinlichkeiten
        states.forEach((from, i) => {
            states.forEach((to, j) => {
                const prob = transitionMatrix[from][to];
                if (prob > 0) {
                    this.drawTransition(from, to, prob);
                }
            });
        });
    }

    drawStateNode(x, y, label, highlight = false) {
        this.ctx.fillStyle = highlight ? '#4CAF50' : '#2196F3';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x, y);
    }

    clear() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
```

**Phase 2: Interaktive Steuerung**

```javascript
// src/ui-controls.js

class PlaygroundControls {
    constructor(game, visualizer, agent) {
        this.game = game;
        this.visualizer = visualizer;
        this.agent = agent;
        this.createControlPanel();
    }

    createControlPanel() {
        const panel = document.getElementById('controlPanel');
        
        // Slider für Suchtiefe
        if (this.agent.constructor.name === 'MinimaxAgent') {
            panel.appendChild(this.createSlider(
                'Suchtiefe',
                'maxDepth',
                1, 8, 3,
                (value) => {
                    this.agent.engine.maxDepth = value;
                    document.getElementById('depthValue').textContent = value;
                }
            ));
        }
        
        // Dropdown für Spiel-Auswahl
        panel.appendChild(this.createDropdown(
            'Spiel',
            ['TicTacToe 3x3', 'TicTacToe Ultimate', 'RotateBox'],
            (game) => this.switchGame(game)
        ));
        
        // Button: Einzelnen Zug ausführen
        panel.appendChild(this.createButton(
            'Nächster Zug',
            () => this.executeNextMove()
        ));
        
        // Button: Auto-Play mit Verzögerung
        panel.appendChild(this.createButton(
            'Auto-Play',
            () => this.startAutoPlay(500)
        ));
        
        // Checkbox: Trace-Daten anzeigen
        panel.appendChild(this.createCheckbox(
            'Suchbaum anzeigen',
            (enabled) => {
                this.visualizer.showTrace = enabled;
                this.refresh();
            }
        ));
    }

    createSlider(label, paramName, min, max, defaultValue, onChange) {
        const div = document.createElement('div');
        div.className = 'control-group';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = defaultValue;
        slider.addEventListener('input', (e) => onChange(Number(e.target.value)));
        
        const value = document.createElement('span');
        value.id = paramName + 'Value';
        value.textContent = defaultValue;
        
        div.appendChild(labelEl);
        div.appendChild(slider);
        div.appendChild(value);
        
        return div;
    }

    executeNextMove() {
        const action = this.agent.getAction(this.game);
        if (action) {
            this.game.makeMove(action.move);
            this.visualizer.update(this.game);
        }
    }

    startAutoPlay(delayMs) {
        const interval = setInterval(() => {
            if (this.game.isGameOver) {
                clearInterval(interval);
                return;
            }
            this.executeNextMove();
        }, delayMs);
    }

    // ... weitere Hilfsmethoden
}
```

**Phase 3: HTML & Dokumentation**

```html
<!-- src/playground.html -->
<!DOCTYPE html>
<html>
<head>
    <title>KI-Algorithmen Playground - Minimax Visualizer</title>
    <style>
        body { font-family: Arial; display: flex; }
        #canvas-container { flex: 2; }
        #control-panel { flex: 1; padding: 20px; background: #f5f5f5; }
        .control-group { margin: 15px 0; }
        label { display: block; font-weight: bold; margin-bottom: 5px; }
        input[type="range"] { width: 100%; }
        button { width: 100%; padding: 8px; margin: 5px 0; }
        #stats { background: white; padding: 10px; margin-top: 20px; border-radius: 4px; }
    </style>
</head>
<body>
    <div id="canvas-container"></div>
    
    <div id="control-panel">
        <h3>Playground-Steuerung</h3>
        <div id="controls"></div>
        
        <div id="stats">
            <h4>Statistiken</h4>
            <p>Knoten besucht: <strong id="nodesVisited">0</strong></p>
            <p>Suchtiefe: <strong id="searchDepth">0</strong></p>
            <p>Zeit: <strong id="searchTime">0ms</strong></p>
        </div>
        
        <h4>Legende</h4>
        <p>🟢 = Gewinn für KI</p>
        <p>🔴 = Gewinn für Gegner</p>
        <p>🟡 = Remis</p>
    </div>

    <script src="../../../WolfsWorld/js/core/agent.js"></script>
    <script src="../../../WolfsWorld/js/core/game-state.js"></script>
    <script src="../../../WolfsWorld/js/ai/minimax.js"></script>
    <script src="../../../WolfsWorld/js/games/tictactoe/logic.js"></script>
    
    <script src="visualizer.js"></script>
    <script src="ui-controls.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

#### 📋 Checkliste für Schüler

- [ ] Playground startet ohne Fehler
- [ ] Mindestens 3 Parameter sind konfigurierbar
- [ ] Visualisierung zeigt Suchbaum oder Algorithmus-Schritte
- [ ] Mit 2+ verschiedenen Spielen funktionsfähig
- [ ] Auto-Play funktioniert
- [ ] Dokumentation erklärt, was der Benutzer lernt
- [ ] Performance-Metriken angezeigt (Zeit, Knoten, etc.)

#### ✅ Abnahmekriterium

Playground erlaubt es, einen Algorithmus **live zu untersuchen** mit veränderlichen Parametern.

---

### **PROJEKT-TYP 4: Neuer Lernpfad**

#### 🎯 Anforderungen

Ein strukturiertes Lernmodul mit:
- **5-8 Lektionen** zu einem KI/Spiel-Thema
- Interaktiven **Aufgaben mit Überprüfung**
- **Progressiven Schwierigkeitsstufen**
- Automatische **Überprüfung der Schüler-Lösungen**

#### 📦 Struktur im StudentenProjekt

```
SchülerProjekte/[Name]/src/
├── course.json                        [Metadaten & Lektionen]
├── lessons/
│   ├── 01-einführung.html
│   ├── 02-grundkonzepte.html
│   ├── 03-erste-implementierung.html
│   ├── 04-optimierungen.html
│   └── 05-erweiterte-konzepte.html
├── exercises/
│   ├── exercise-01.js                [Auto-Check Code]
│   ├── exercise-02.js
│   └── ...
├── progress.js                        [Fortschritt tracken]
└── lernpfad-dokumentation.md         [Pädagogisches Konzept]
```

#### 📖 Schritt-für-Schritt Anleitung

**Phase 1: Kursstruktur definieren**

```json
{
  "title": "Minimax-Algorithmus verstehen",
  "description": "Lerne, wie der Minimax-Algorithmus Computerspiele optimal spielt",
  "author": "Max Musterschüler",
  "duration": "90 Minuten",
  "difficulty": "Mittel",
  "prerequisites": ["Tic-Tac-Toe Grundlagen", "Rekursion"],
  "learningOutcomes": [
    "Verstehe, wie Minimax funktioniert",
    "Implementiere Minimax für ein einfaches Spiel",
    "Erkenne, warum Alpha-Beta Pruning wichtig ist"
  ],
  "lessons": [
    {
      "id": 1,
      "title": "Was ist Minimax?",
      "duration": 15,
      "type": "lecture",
      "file": "lessons/01-einführung.html",
      "learning_points": [
        "Minimax ist ein Spiel-Theorie-Algorithmus",
        "Zwei Spieler mit gegensätzlichen Zielen",
        "Max maximiert seinen Score, Min minimiert"
      ]
    },
    {
      "id": 2,
      "title": "Minimax Schritt-für-Schritt",
      "duration": 20,
      "type": "interactive",
      "file": "lessons/02-grundkonzepte.html",
      "exercise_id": 1,
      "hints": [
        "Denke recursiv: Was sind die Basis-Fälle?",
        "Wer gewinnt im Zustand [X, -, O]?"
      ]
    },
    {
      "id": 3,
      "title": "Implementierung",
      "duration": 30,
      "type": "coding",
      "file": "lessons/03-erste-implementierung.html",
      "exercise_id": 2,
      "starter_code": "...",
      "test_cases": [...]
    },
    {
      "id": 4,
      "title": "Optimierungen: Alpha-Beta Pruning",
      "duration": 20,
      "type": "lecture+quiz",
      "file": "lessons/04-optimierungen.html",
      "exercise_id": 3
    }
  ]
}
```

**Phase 2: Lektion mit Aufgabe**

```html
<!-- lessons/02-grundkonzepte.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Minimax verstehen</title>
    <link rel="stylesheet" href="course.css">
</head>
<body>
    <div class="lesson">
        <h1>Minimax Schritt-für-Schritt</h1>
        
        <section class="content">
            <h2>Konzept</h2>
            <p>Minimax funktioniert so:</p>
            <ol>
                <li>Erstelle einen Baum aller möglichen Spielzüge</li>
                <li>Bewerte die Blattknoten (Spielende)</li>
                <li>Propagiere Werte nach oben...</li>
            </ol>
            
            <h3>Max-Schicht</h3>
            <p>Wählt den HÖCHSTEN Score</p>
            
            <h3>Min-Schicht</h3>
            <p>Wählt den NIEDRIGSTEN Score (aus Sicht des Gegners)</p>
        </section>
        
        <section class="exercise">
            <h2>Aufgabe 1: Werte propagieren</h2>
            <p>Gegeben ist dieser Baum. Berechne die Scores nach oben!</p>
            
            <div id="game-tree">
                <!-- Interaktiver Baum zum Ausfüllen -->
            </div>
            
            <button id="checkButton" onclick="checkExercise()">Überprüfen</button>
            <div id="feedback"></div>
        </section>
    </div>
    
    <script src="exercise-01.js"></script>
</body>
</html>
```

**Phase 3: Automatische Überprüfung**

```javascript
// exercises/exercise-01.js

class MinimaxExercise {
    constructor() {
        this.lessonId = 1;
    }

    /**
     * Überprüfe, ob Schüler Baum-Werte korrekt propagiert hat
     */
    checkTreePropagation(studentTree) {
        const correctTree = this.generateCorrectTree();
        
        // Vergleiche Bottom-Up
        const errors = [];
        
        for (let nodeId in studentTree) {
            const studentNode = studentTree[nodeId];
            const correctNode = correctTree[nodeId];
            
            if (studentNode.score !== correctNode.score) {
                errors.push({
                    nodeId,
                    studentAnswer: studentNode.score,
                    correctAnswer: correctNode.score,
                    feedback: `Node ${nodeId}: Du hast ${studentNode.score} geschrieben, korrekt ist ${correctNode.score}`
                });
            }
        }
        
        return {
            passed: errors.length === 0,
            score: ((Object.keys(studentTree).length - errors.length) / Object.keys(studentTree).length * 100).toFixed(0) + '%',
            errors
        };
    }

    generateCorrectTree() {
        return {
            // Blätter (Bewertungen)
            '3.1': { score: 10, level: 3 },
            '3.2': { score: 5, level: 3 },
            '3.3': { score: 2, level: 3 },
            '3.4': { score: 15, level: 3 },
            '3.5': { score: 8, level: 3 },
            '3.6': { score: 12, level: 3 },
            
            // Min-Schicht (level 2): Wähle MINIMUM
            '2.1': { score: 5, level: 2 },   // min(10, 5, 2) = 2? NEIN, min ist 2 wenn wir alle sehen
            '2.2': { score: 8, level: 2 },   // min(15, 8, 12) = 8
            
            // Max-Schicht (level 1): Wähle MAXIMUM
            '1.1': { score: 8, level: 1 }    // max(2, 8) = 8
        };
    }
}

// Verwendung:
// const exercise = new MinimaxExercise();
// const result = exercise.checkTreePropagation(studentInput);
// console.log(result);
```

**Phase 4: Fortschritts-Tracking**

```javascript
// progress.js

class LearningProgress {
    constructor(courseId, studentId) {
        this.courseId = courseId;
        this.studentId = studentId;
        this.progress = this.loadFromLocalStorage() || {};
    }

    completLesson(lessonId, score) {
        if (!this.progress[lessonId]) {
            this.progress[lessonId] = {};
        }
        
        this.progress[lessonId].completed = true;
        this.progress[lessonId].score = score;
        this.progress[lessonId].completedAt = new Date().toISOString();
        
        this.saveToLocalStorage();
    }

    getOverallProgress() {
        const totalLessons = 5; // Aus course.json
        const completedLessons = Object.values(this.progress).filter(p => p.completed).length;
        
        return {
            percentage: (completedLessons / totalLessons * 100).toFixed(0),
            completedLessons,
            totalLessons
        };
    }

    saveToLocalStorage() {
        localStorage.setItem(
            `course_${this.courseId}_${this.studentId}`,
            JSON.stringify(this.progress)
        );
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem(`course_${this.courseId}_${this.studentId}`);
        return data ? JSON.parse(data) : null;
    }
}
```

#### 📋 Checkliste für Schüler

- [ ] `course.json` definiert 4-8 Lektionen
- [ ] Jede Lektion hat klare Learning Outcomes
- [ ] Mindestens 3 Aufgaben mit automatischer Überprüfung
- [ ] Schwierigkeit steigt progressiv
- [ ] Fortschritt wird gespeichert (localStorage)
- [ ] Dokumentation erklärt pädagogisches Konzept
- [ ] Quiz/Tests überprüfen Verständnis

#### ✅ Abnahmekriterium

Schüler können den Lernpfad **selbstständig absolvieren**, mit automatischer Überprüfung der Aufgaben.

---

## 🔒 Externe Entwicklungsumgebung

### Setup für Schüler

```bash
# 1. Projekt-Template klonen
cd SchülerProjekte
git clone [template-repository] [StudentName]
cd [StudentName]

# 2. Abhängigkeiten prüfen (falls nötig)
# Die Schüler-Projekte referenzieren nur das bestehende WolfsWorld!
# Nichts muss installiert werden.

# 3. Lokalen Server starten für Tests
python3 -m http.server 8000
# oder: npx http-server

# 4. Tests ausführen
open http://localhost:8000/src/[game/agent/playground].html
```

### Verzeichnis-Struktur mit ABSOLUTEN PFAD-REFERENZEN

```javascript
// Schüler-Projekt referenziert WolfsWorld über relative Pfade
// SchülerProjekte/[Name]/src/logic.js

// ✅ RICHTIG: Relative Pfade funktionieren überall
<script src="../../../WolfsWorld/js/core/game-state.js"></script>

// ❌ FALSCH: Absolute Pfade funktionieren nur lokal
<script src="/Users/.../WolfsWorld/js/core/game-state.js"></script>
```

### Git-Workflow für Versionierung

```
SchülerProjekte/
├── .gitignore                 [node_modules/, build/]
├── [StudentName]/
│   ├── .git/                 [Eigenständiges Git-Repo]
│   ├── projekt-info.json     [Metadaten]
│   ├── ENTWICKLUNGSLOG.md    [Fortschritt dokumentieren]
│   ├── src/
│   ├── docs/
│   └── README.md
```

**projekt-info.json Beispiel:**

```json
{
  "title": "Streichholzspiel mit KI",
  "student": "Max Musterschüler",
  "email": "max@schule.de",
  "type": "game",
  "status": "in-development",
  "dependencies": {
    "WolfsWorld": "../../../WolfsWorld"
  },
  "entry_points": {
    "game": "src/matchstick.html",
    "logic": "src/logic.js",
    "tests": "tests/game.test.js"
  },
  "last_updated": "2026-01-27"
}
```

### Code Review & Testing

```javascript
// Schüler-Projekt: tests/game.test.js

/**
 * Einfache Test-Suite für Schüler-Spiel
 */
describe('MatchstickGame Tests', () => {
    let board;
    
    beforeEach(() => {
        board = new MatchstickBoard();
    });
    
    it('sollte korrekt mit 3,3,3 starten', () => {
        assert.deepEqual(board.piles, [3, 3, 3]);
        assert.equal(board.currentPlayer, 1);
        assert.equal(board.isGameOver, false);
    });
    
    it('sollte gültige Züge generieren', () => {
        const moves = board.getAllValidMoves();
        assert.equal(moves.length, 9); // 3 Haufen * 3 Streichhölzer
    });
    
    it('sollte Züge korrekt ausführen', () => {
        const before = JSON.stringify(board.piles);
        board.makeMove({ pile: 0, count: 1 });
        assert.deepEqual(board.piles, [2, 3, 3]);
        assert.equal(board.currentPlayer, 2);
    });
    
    it('sollte Spielende erkennen', () => {
        board.piles = [0, 0, 0];
        board.makeMove({ pile: 0, count: 0 }); // Pseudo-Zug
        assert.equal(board.isGameOver, true);
    });
});
```

---

## 📝 Aufgabenstellungen für Schüler

### **1. Spiel-Aufgaben**

#### Aufgabe 1a: Streichholzspiel (Leicht)
**Ziel:** Klassisches Nim-Spiel (Streichholzer) implementieren

- Spiellogik: 3 Haufen mit je 3 Streichhölzern
- Spieler darf beliebig viele Streichhölzer aus EINEM Haufen nehmen
- Wer den letzten Streichholz nimmt: GEWINNT oder VERLIERT (variierbar)
- Zwei KI-Agenten testen (Random + Minimax)

**Hinweis:** Dies ist eines der ältesten Spiele der Welt!

**Deliverables:**
- [x] `logic.js` mit `GameState` Interface
- [x] `renderer.js` mit Canvas-Zeichnung
- [x] `controller.js` mit Spielablauf
- [x] HTML-Datei mit 2+ spielbaren KI-Agenten

---

#### Aufgabe 1b: Bauernschach (Mittel)
**Ziel:** Vereinfachte Schach-Variante mit nur Bauern

- Spielfeld: 4x8 Brett
- Weiße Bauern starten unten, schwarze oben
- Züge: Bauer kann 1 Feld vorwärts oder diagonal schlagen
- Spiel endet: Bauer erreicht gegnerische Seite (Gewinn)
- Mit Minimax & RandomAgent spielbar

**Hinweis:** Good opportunity for heuristics!

---

#### Aufgabe 1c: MemoryGame mit KI (Mittel-Schwer)
**Ziel:** Paar-matching-Spiel gegen KI

- 4x4 Grid mit 16 Karten (8 Paare)
- Spieler & KI decken abwechselnd 2 Karten auf
- Wer mehr Paare findet, gewinnt
- KI-Strategie: Perfektes Gedächtnis!

---

### **2. KI-Agent-Aufgaben**

#### Aufgabe 2a: Zufallsagent mit Biasing (Leicht)
**Ziel:** RandomAgent erweitern mit Heuristic-Biasing

```javascript
class BiasedRandomAgent extends Agent {
    // Statt rein zufällig:
    // 1. Alle gültigen Züge generieren
    // 2. Mit Heuristik bewerten (z.B. "winning move" = höhere Wahrscheinlichkeit)
    // 3. Weighted random auswählen
}
```

- RandomAgent funktioniert, aber dumm
- BiasedRandomAgent bevorzugt "gute" Züge (aber ist nicht perfekt)
- Teste auf TicTacToe, RotateBox, KnightsTour
- Vergleiche Win-Rate mit RandomAgent

---

#### Aufgabe 2b: Markov Chain Agent (Mittel)
**Ziel:** State-Übergangswahrscheinlichkeiten nutzen

- Analyse: Welche Spielzüge führen zu welchen Zuständen?
- Probabilistische Wahl: Wähle Zug mit höchster Gewinn-Wahrscheinlichkeit
- Train auf historischen Spiel-Daten
- Teste auf 3+ Spielen

**Hinweis:** Ähnlich wie Schachcomputer der 1980er Jahre!

---

#### Aufgabe 2c: Monte Carlo Tree Search (Schwer)
**Ziel:** MCTS-Algorithmus implementieren (wie AlphaGo!)

- 4 Phasen: Selection, Expansion, Simulation, Backpropagation
- UCB-Formel für Balancing Exploration/Exploitation
- Teste mit verschiedenen Iterations-Parametern
- Vergleiche mit Minimax

**Hinweis:** Dies ist die Basis für moderne KI-Systeme!

---

#### Aufgabe 2d: Reinforcement Learning Agent (Sehr Schwer)
**Ziel:** Q-Learning oder ähnlich implementieren

- Einfaches neuronales Netz oder Tabular Q-Learning
- Training durch Selbstspiel
- Nach Training: Agent spielt besser?
- Visualisiere Learning Curve

**Hinweis:** Nur für fortgeschrittene Schüler!

---

### **3. Playground-Aufgaben**

#### Aufgabe 3a: Minimax Visualizer (Mittel)
**Ziel:** Interaktive Minimax-Visualisierung

- Parameter: Suchtiefe, Heuristik-Funktion
- Visualisierung: Suchbaum mit Scores
- Highlight: Bester Zug in grün, Pruned Nodes in grau
- Vergleich: Minimax vs. Alpha-Beta

---

#### Aufgabe 3b: Markov Chain Simulator (Mittel)
**Ziel:** Visualisiere Zustandsübergänge

- Zeige Übergangsmatrix
- Interaktive Parameter: Start-Zustand, Iterations
- Animiere Zustands-Pfade
- Visualisiere Steady-State-Verteilung

---

#### Aufgabe 3c: Heuristic Explorer (Schwer)
**Ziel:** Verschiedene Bewertungsfunktionen vergleichen

- Heuristik 1: Einfache Punkt-Zählung
- Heuristik 2: Strategie-Basiert
- Heuristik 3: Machine Learning
- Vergleich: Welche ist am schnellsten? Am genauesten?

---

### **4. Lernpfad-Aufgaben**

#### Aufgabe 4a: "Minimax für Anfänger" (Mittel)
**Ziel:** 5-Lektionen-Kurs über Minimax

1. **Lektion 1:** Was ist Minimax? (Theorie)
2. **Lektion 2:** Min- & Max-Schichten (Interaktiv)
3. **Lektion 3:** Implement Minimax für TicTacToe (Coding)
4. **Lektion 4:** Alpha-Beta Pruning (Theorie + Quiz)
5. **Lektion 5:** Performance-Optimierungen (Projekt)

**Aufgaben pro Lektion:**
- 2-3 MC-Quizzes
- 1 Coding-Aufgabe
- 1 "Explain" Aufgabe (Text schreiben)

---

#### Aufgabe 4b: "Game State Design" (Schwer)
**Ziel:** Lernpfad zum Entwerfen von Game-States

1. Anforderungen: Was braucht ein GameState?
2. Interface-Design: Methoden & Properties
3. Implementierung: TicTacToe vs. RotateBox
4. Performance: Wie optimiert man `clone()` und `getStateKey()`?
5. Testing: Wie verifiziert man Korrektheit?

---

#### Aufgabe 4c: "KI-Agenten Design" (Schwer)
**Ziel:** Verstehe Agent-Architektur

1. Agent-Interface: `getAction()`
2. Verschiedene Agent-Typen: Random, Rule-Based, Search-Based
3. Implementiere 2 Agenten-Typen
4. Test & Vergleich auf mehreren Spielen
5. Erweitere vorhandene Agents

---

## ✅ Migrations- & Integrationsprozess

### Checkliste vor Integration

**Code-Qualität:**
- [ ] Code ist kommentiert
- [ ] JSDoc-Format verwendet
- [ ] Keine `console.log()`-Statements (außer Debug-Mode)
- [ ] Keine globalen Variablen
- [ ] ES6+ Standards

**Funktionalität:**
- [ ] Alle Tests bestanden
- [ ] Keine Fehler in Browser-Konsole
- [ ] Performance acceptable (< 1s pro KI-Zug)
- [ ] Responsive Design (mobil-freundlich)

**Integration:**
- [ ] Nutzt nur WolfsWorld Core-Interfaces
- [ ] Keine direkten Imports aus anderen Projekten
- [ ] Relative Pfade funktionieren

**Dokumentation:**
- [ ] README mit Setup-Anleitung
- [ ] Verwendungsbeispiele
- [ ] API-Dokumentation

### Migration in WolfsWorld

```bash
# Schritt 1: Code Review durchführen
git review SchülerProjekte/[Name]

# Schritt 2: Tests ausführen
npm test

# Schritt 3: Code kopieren & integrieren
cp SchülerProjekte/[Name]/src/logic.js WolfsWorld/js/games/[gamename]/
cp SchülerProjekte/[Name]/src/[agent].js WolfsWorld/js/ai/agents/

# Schritt 4: Integration testen
# - Neue Agenten mit bestehenden Spielen testen
# - Neue Spiele mit bestehenden Agenten testen

# Schritt 5: Dokumentation aktualisieren
# - README
# - Hauptindex
# - Doxygen

# Schritt 6: Mergen in Main
git add WolfsWorld/...
git commit -m "feat: add [StudentName]'s [ProjectType]"
git push origin main
```

### Versionierung

```json
{
  "contribution": {
    "author": "Max Musterschüler",
    "type": "game|agent|playground|learning-path",
    "version": "1.0.0",
    "integration_date": "2026-02-15",
    "status": "stable|beta|experimental"
  }
}
```

---

## 📊 Zusammenfassung: Modularität ✅

| Aspekt | Status | Maßnahmen |
|--------|--------|----------|
| **Core Interfaces** | ✅ Gut | Keine Änderungen nötig |
| **Agent System** | ✅ Gut | Template für neue Agenten erstellen |
| **Game States** | ✅ Gut | Dokumentation erweitern |
| **Playgrounds** | ⚠️ Fehlend | Framework definieren (dieses Dokument) |
| **Learning Paths** | ⚠️ Fehlend | Interface definieren (dieses Dokument) |
| **External Projects** | ⚠️ Fehlend | SchülerProjekte-Struktur einrichten |
| **Documentation** | ⚠️ Lückenhaft | Ausführliche Guides erstellen |
| **Testing** | ⚠️ Minimal | Test-Templates für Schüler |

---

## 🚀 Nächste Schritte

1. **SchülerProjekte-Ordner erstellen** mit Vorlagen
2. **Review-Checkliste** in WolfsWorld dokumentieren
3. **Erste Schüler-Projekte** (1-2) als Pilot durchziehen
4. **Feedback** sammeln & iterieren
5. **Automation** für Tests & Deployment

---

**Erstellt:** 27. Januar 2026  
**Version:** 1.0 - Initiale Projektstrategie
