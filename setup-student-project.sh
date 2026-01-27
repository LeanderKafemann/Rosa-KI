#!/bin/bash
# SchülerProjekte Setup-Skript
# Verwendung: bash setup-student-project.sh [StudentName] [ProjectType]
# Beispiel: bash setup-student-project.sh "Max Musterschüler" "game"

STUDENT_NAME="$1"
PROJECT_TYPE="$2"  # game, agent, playground, learning

if [ -z "$STUDENT_NAME" ] || [ -z "$PROJECT_TYPE" ]; then
    echo "Usage: bash setup-student-project.sh [StudentName] [game|agent|playground|learning]"
    exit 1
fi

# Erstelle Verzeichnis
PROJECT_DIR="SchülerProjekte/$STUDENT_NAME"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Git initialisieren
git init
echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore
echo "*.log" >> .gitignore

# projekt-info.json erstellen
cat > projekt-info.json << EOF
{
  "title": "KI Projekt - $STUDENT_NAME",
  "student": "$STUDENT_NAME",
  "email": "schüler@schule.de",
  "type": "$PROJECT_TYPE",
  "status": "in-development",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "dependencies": {
    "WolfsWorld": "../../../WolfsWorld"
  }
}
EOF

# Verzeichnis-Struktur erstellen
mkdir -p src
mkdir -p tests
mkdir -p docs

# README erstellen
cat > README.md << EOF
# $STUDENT_NAME's KI Projekt

**Projekt-Typ:** $PROJECT_TYPE

## Beschreibung
[Beschreibe dein Projekt hier]

## Setup

\`\`\`bash
# 1. Dieser Ordner enthält dein Projekt
cd $PROJECT_DIR

# 2. Lokalen Server starten
python3 -m http.server 8000

# 3. Im Browser öffnen
# http://localhost:8000/src/
\`\`\`

## Struktur

\`\`\`
src/              # Dein Code
├── index.html    # Hauptdatei
├── logic.js      # Spiellogik oder Algorithmus
└── ...

tests/            # Deine Tests

docs/             # Dokumentation
└── ENTWICKLUNGSLOG.md

README.md         # Diese Datei
projekt-info.json # Metadaten
\`\`\`

## Status
- [ ] Grundstruktur
- [ ] Core Funktionalität
- [ ] Tests
- [ ] Dokumentation
- [ ] Review

EOF

# ENTWICKLUNGSLOG.md erstellen
cat > docs/ENTWICKLUNGSLOG.md << EOF
# Entwicklungslog

## [Datum] - Start
- Projekt erstellt

## [Heute]
- Schreib deine Fortschritte auf!

EOF

# Template basierend auf Projekt-Typ
case $PROJECT_TYPE in
    game)
        echo "Erstelle Game-Template..."
        
        cat > src/index.html << 'GAME_HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Mein Spiel</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Mein KI-Spiel</h1>
    
    <canvas id="gameCanvas" width="600" height="400"></canvas>
    
    <div id="controls">
        <button id="newGame">Neues Spiel</button>
        <select id="agentSelect">
            <option value="random">Zufalls-Agent</option>
            <option value="minimax">Minimax-Agent</option>
        </select>
    </div>
    
    <div id="info"></div>

    <!-- WolfsWorld Core laden -->
    <script src="../../../WolfsWorld/js/core/agent.js"></script>
    <script src="../../../WolfsWorld/js/core/game-state.js"></script>
    <script src="../../../WolfsWorld/js/ai/agents/random-agent.js"></script>
    <script src="../../../WolfsWorld/js/ai/agents/minimax-agent.js"></script>
    <script src="../../../WolfsWorld/js/ai/minimax.js"></script>

    <!-- Dein Projekt -->
    <script src="logic.js"></script>
    <script src="renderer.js"></script>
    <script src="controller.js"></script>
</body>
</html>
GAME_HTML

        cat > src/logic.js << 'GAME_LOGIC'
/**
 * Spiellogik - Implementiert GameState Interface
 */
class MyGameBoard extends GameState {
    constructor() {
        super();
        // TODO: Initialisiere dein Spiel
        this.currentPlayer = 1;
        this.isGameOver = false;
        this.winner = 0;
    }

    getAllValidMoves() {
        // TODO: Gib Array aller legalen Züge zurück
        return [];
    }

    makeMove(move) {
        // TODO: Führe einen Zug aus
        // Aktualisiere this.currentPlayer, this.winner, this.isGameOver
        return true;
    }

    clone() {
        // TODO: Erstelle eine Kopie
        const cloned = new MyGameBoard();
        // Kopiere alle Properties
        return cloned;
    }

    getStateKey() {
        // TODO: Erstelle eindeutigen String für diesen Zustand
        return JSON.stringify({ /* state */ });
    }
}
GAME_LOGIC

        cat > src/renderer.js << 'GAME_RENDERER'
/**
 * Visualisierung des Spiels
 */
class MyGameRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    draw(board) {
        // TODO: Zeichne das aktuelle Spielfeld
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Zeichne Spielelemente
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
GAME_RENDERER

        cat > src/controller.js << 'GAME_CONTROLLER'
/**
 * Spielsteuerung
 */
class GameController {
    constructor() {
        this.board = new MyGameBoard();
        this.renderer = new MyGameRenderer('gameCanvas');
        this.agents = {
            random: new RandomAgent(),
            minimax: new MinimaxAgent()
        };
        
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => {
            this.board = new MyGameBoard();
            this.render();
        });

        document.getElementById('agentSelect').addEventListener('change', (e) => {
            this.currentAgent = this.agents[e.target.value];
        });

        this.canvas = document.getElementById('gameCanvas');
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    handleCanvasClick(e) {
        // TODO: Konvertiere Click-Position zu Spielzug
        // const move = ...
        // this.makeMove(move);
    }

    makeMove(move) {
        if (this.board.makeMove(move)) {
            this.render();
            
            if (!this.board.isGameOver) {
                // KI-Zug
                setTimeout(() => this.playAIMove(), 500);
            }
        }
    }

    playAIMove() {
        const action = this.currentAgent.getAction(this.board);
        if (action) {
            this.board.makeMove(action.move);
            this.render();
        }
    }

    render() {
        this.renderer.clear();
        this.renderer.draw(this.board);
        this.updateInfo();
    }

    updateInfo() {
        const info = document.getElementById('info');
        if (this.board.isGameOver) {
            info.textContent = `Spiel vorbei! Gewinner: ${this.board.winner}`;
        } else {
            info.textContent = `Spieler ${this.board.currentPlayer} ist am Zug`;
        }
    }
}

// Starte Controller
window.addEventListener('DOMContentLoaded', () => {
    new GameController();
});
GAME_CONTROLLER

        cat > src/style.css << 'GAME_CSS'
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #f5f5f5;
}

h1 {
    color: #333;
}

canvas {
    border: 2px solid #333;
    background: white;
    display: block;
    margin: 20px 0;
    cursor: pointer;
}

#controls {
    margin: 20px 0;
}

button, select {
    padding: 10px 20px;
    margin-right: 10px;
    font-size: 16px;
    cursor: pointer;
}

#info {
    font-weight: bold;
    color: #2196F3;
}
GAME_CSS

        cat > tests/game.test.js << 'GAME_TESTS'
describe('Game Tests', () => {
    let board;

    beforeEach(() => {
        board = new MyGameBoard();
    });

    it('sollte korrekt initialisiert werden', () => {
        assert.equal(board.currentPlayer, 1);
        assert.equal(board.isGameOver, false);
        assert.equal(board.winner, 0);
    });

    it('sollte gültige Züge generieren', () => {
        const moves = board.getAllValidMoves();
        assert(Array.isArray(moves));
        assert(moves.length > 0);
    });

    it('sollte Züge korrekt ausführen', () => {
        const moves = board.getAllValidMoves();
        if (moves.length > 0) {
            const success = board.makeMove(moves[0]);
            assert(success);
        }
    });

    it('sollte clone() erstellen', () => {
        const cloned = board.clone();
        assert(cloned instanceof MyGameBoard);
        assert(cloned !== board);
    });
});
GAME_TESTS
        ;;

    agent)
        echo "Erstelle Agent-Template..."
        
        cat > src/my-agent.js << 'AGENT_JS'
/**
 * Mein KI-Agent
 * @extends Agent
 */
class MyCustomAgent extends Agent {
    constructor(options = {}) {
        super("Mein Agent");
        this.options = options;
        // TODO: Initialisiere Parameter
    }

    /**
     * Berechnet nächsten Zug
     * @param {GameState} gameState
     * @returns {Object} {move, reason}
     */
    getAction(gameState) {
        // TODO: Implementiere Algorithmus
        const moves = gameState.getAllValidMoves();
        if (!moves || moves.length === 0) return null;

        // Beispiel: Zufallswahl
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        
        return {
            move: randomMove,
            reason: "Mein Algorithmus sagt: dieser Zug ist gut!"
        };
    }
}
AGENT_JS

        cat > src/test-harness.js << 'AGENT_TESTS'
/**
 * Test-Harness für Agent
 */
class AgentTestHarness {
    constructor(agent) {
        this.agent = agent;
        this.results = [];
    }

    testOnTicTacToe(rounds = 10) {
        console.log(`Testing auf TicTacToe (${rounds} rounds)...`);
        let wins = 0;

        for (let i = 0; i < rounds; i++) {
            const board = new TTTRegularBoard();
            const opponent = new RandomAgent();
            
            while (!board.isGameOver) {
                const action = (board.currentPlayer === 1) ? 
                    this.agent.getAction(board) : 
                    opponent.getAction(board);
                
                if (!action) break;
                board.makeMove(action.move);
            }

            if (board.winner === 1) wins++;
        }

        const result = {
            game: 'TicTacToe',
            rounds,
            wins,
            winRate: (wins / rounds * 100).toFixed(1) + '%'
        };
        this.results.push(result);
        console.table([result]);
        return result;
    }

    printResults() {
        console.table(this.results);
    }
}

// Verwendung:
// const agent = new MyCustomAgent();
// const harness = new AgentTestHarness(agent);
// harness.testOnTicTacToe(20);
// harness.printResults();
AGENT_TESTS

        cat > src/algorithm-documentation.md << 'AGENT_DOCS'
# Mein KI-Agent

## Algorithmus

[Beschreibe deinen Algorithmus hier]

### Pseudocode

```
function getAction(gameState):
    1. ...
    2. ...
    3. return {move, reason}
```

## Performance

### Komplexität
- **Zeitkomplexität:** O(?)
- **Speicherkomplexität:** O(?)

### Benchmark
- TicTacToe: ? Züge/Sekunde
- RotateBox: ? % Lösungsrate

## Besonderheiten
- ...
- ...

AGENT_DOCS
        ;;

    playground)
        echo "Erstelle Playground-Template..."
        
        cat > src/playground.html << 'PLAYGROUND_HTML'
<!DOCTYPE html>
<html>
<head>
    <title>KI-Algorithmen Playground</title>
    <style>
        body { font-family: Arial; display: flex; margin: 0; }
        #canvas-container { flex: 2; padding: 20px; background: white; }
        #controls { flex: 1; padding: 20px; background: #f5f5f5; overflow-y: auto; }
        canvas { border: 2px solid #333; max-width: 100%; }
        .control-group { margin: 15px 0; }
        label { display: block; font-weight: bold; margin-bottom: 5px; }
        input, select { width: 100%; padding: 5px; }
        button { width: 100%; padding: 10px; margin: 5px 0; cursor: pointer; }
        #stats { background: white; padding: 10px; border-radius: 4px; margin-top: 20px; }
    </style>
</head>
<body>
    <div id="canvas-container">
        <h1>Playground</h1>
        <canvas id="canvas" width="600" height="500"></canvas>
    </div>
    
    <div id="controls">
        <h2>Steuerung</h2>
        <div id="controlPanel"></div>
        
        <div id="stats">
            <h3>Statistiken</h3>
            <p>Knoten: <strong id="nodes">0</strong></p>
            <p>Zeit: <strong id="time">0ms</strong></p>
        </div>
    </div>

    <script src="../../../WolfsWorld/js/core/agent.js"></script>
    <script src="../../../WolfsWorld/js/core/game-state.js"></script>
    <script src="../../../WolfsWorld/js/games/tictactoe/logic.js"></script>
    
    <script src="visualizer.js"></script>
    <script src="controls.js"></script>
    <script src="app.js"></script>
</body>
</html>
PLAYGROUND_HTML

        cat > src/visualizer.js << 'PLAYGROUND_VIZ'
/**
 * Visualisierung
 */
class Visualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    draw(data) {
        // TODO: Visualisiere Algorithmus-Schritte
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Zeichne deine Visualisierung
    }
}
PLAYGROUND_VIZ

        cat > src/app.js << 'PLAYGROUND_APP'
// Playground App
window.addEventListener('DOMContentLoaded', () => {
    // TODO: Initialisiere Playground
    console.log('Playground started');
});
PLAYGROUND_APP
        ;;

    learning)
        echo "Erstelle Learning-Path Template..."
        
        cat > src/course.json << 'LEARNING_JSON'
{
  "title": "Mein Lernpfad",
  "description": "Lerne über KI-Algorithmen",
  "author": "$STUDENT_NAME",
  "duration": 120,
  "difficulty": "Anfänger",
  "prerequisites": [],
  "learningOutcomes": [
    "Verstehe Konzept X",
    "Implementiere Y",
    "Löse Aufgabe Z"
  ],
  "lessons": [
    {
      "id": 1,
      "title": "Einführung",
      "duration": 20,
      "type": "lecture",
      "file": "lessons/01-intro.html"
    },
    {
      "id": 2,
      "title": "Praxis",
      "duration": 30,
      "type": "coding",
      "file": "lessons/02-practice.html",
      "exercise_id": 1
    }
  ]
}
LEARNING_JSON

        mkdir -p src/lessons src/exercises
        
        cat > src/lessons/01-intro.html << 'LEARNING_LESSON'
<!DOCTYPE html>
<html>
<head>
    <title>Lektion 1</title>
    <link rel="stylesheet" href="course.css">
</head>
<body>
    <div class="lesson">
        <h1>Lektion 1: Einführung</h1>
        
        <section class="content">
            <h2>TODO</h2>
            <p>Schreibe deine Lektion hier...</p>
        </section>
    </div>

    <script src="../../progress.js"></script>
</body>
</html>
LEARNING_LESSON

        cat > src/progress.js << 'LEARNING_PROGRESS'
/**
 * Progress Tracking
 */
class LearningProgress {
    constructor(courseId) {
        this.courseId = courseId;
        this.progress = this.load();
    }

    completeLesson(lessonId, score) {
        this.progress[lessonId] = {
            completed: true,
            score,
            date: new Date().toISOString()
        };
        this.save();
    }

    getProgress() {
        return Object.keys(this.progress).filter(k => this.progress[k].completed).length;
    }

    save() {
        localStorage.setItem(`course_${this.courseId}`, JSON.stringify(this.progress));
    }

    load() {
        return JSON.parse(localStorage.getItem(`course_${this.courseId}`) || '{}');
    }
}
LEARNING_PROGRESS
        ;;
esac

echo "✅ Projekt-Template erstellt in: $PROJECT_DIR"
echo ""
echo "Nächste Schritte:"
echo "1. cd $PROJECT_DIR"
echo "2. python3 -m http.server 8000"
echo "3. Öffne http://localhost:8000/src/"
echo "4. Bearbeite die Dateien in src/"
