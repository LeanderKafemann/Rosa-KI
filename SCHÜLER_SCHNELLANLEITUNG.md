# 🚀 Schnellanleitung für Schüler-Projekte

**Für Anfänger gedacht** - Schritt-für-Schritt Anleitung zum Starten

---

## 📦 Phase 0: Setup (5 Minuten)

### Option A: Mit Script (EMPFOHLEN)

```bash
# Im Terminal zum Rosa-Complete Ordner navigieren
cd ~/Documents/KI\ Webseite/Rosa-Complete

# Script ausführen
bash setup-student-project.sh "Max Musterschüler" "game"
# Optionen: game, agent, playground, learning
```

**Das Script erstellt automatisch:**
- ✅ Ordner mit deinem Namen
- ✅ Alle notwendigen Dateien
- ✅ README und Dokumentation
- ✅ Vorlagen zum Ausfüllen

### Option B: Manuell

1. Erstelle Ordner: `SchülerProjekte/[DeinName]`
2. Kopiere Vorlage aus `starter-templates/[project-type]/`
3. Bearbeite die Dateien

---

## 🎮 Projekt-Typ 1: Neues Spiel

### Was du brauchst
- Ein Spielkonzept (z.B. Streichholzspiel)
- Spiellogik (wer gewinnt?)
- Visuelle Darstellung (Canvas)
- Tests

### Schritt 1: Spiellogik schreiben (logic.js)

```javascript
// Schreib eine Klasse, die von GameState erbt
class MeinSpielBoard extends GameState {
    constructor() {
        super();
        // Initialisiere dein Spiel
    }

    getAllValidMoves() {
        // Gib alle möglichen Züge zurück
        return [/* Array von Zügen */];
    }

    makeMove(move) {
        // Führe einen Zug aus
        // Aktualisiere: currentPlayer, winner, isGameOver
        return true; // oder false, wenn Zug ungültig
    }

    clone() {
        // Erstelle eine Kopie (für KI-Simulation!)
        const c = new MeinSpielBoard();
        // Kopiere alle Properties
        return c;
    }

    getStateKey() {
        // Eindeutiger String für Zustand
        return JSON.stringify({/* state */});
    }
}
```

### Schritt 2: Visualisierung schreiben (renderer.js)

```javascript
class MeinSpielRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    draw(board) {
        // Zeichne die aktuelle Spielposition
        // Beispiel: Board, Figuren, etc.
    }
}
```

### Schritt 3: Controller schreiben (controller.js)

```javascript
class GameController {
    constructor() {
        this.board = new MeinSpielBoard();
        this.renderer = new MeinSpielRenderer('gameCanvas');
        
        // Agents laden
        this.agent = new RandomAgent();
        // oder: new MinimaxAgent() für intelligentere KI
    }

    // Spielablauf hier
}
```

### Schritt 4: HTML verbinden (index.html)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mein Spiel</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Mein Spiel</h1>
    <canvas id="gameCanvas" width="600" height="400"></canvas>

    <!-- WolfsWorld laden (WICHTIG!) -->
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
```

### Checkliste
- [ ] `logic.js` implementiert GameState
- [ ] `renderer.js` zeichnet Spiel
- [ ] HTML lädt alle Scripts
- [ ] Browser zeigt keine Fehler (F12)
- [ ] Spiel läuft gegen RandomAgent
- [ ] Spiel läuft gegen MinimaxAgent

---

## 🤖 Projekt-Typ 2: Neuer KI-Agent

### Was du brauchst
- Einen Algorithmus (Random, Rules, Search, ML, etc.)
- Tests auf mindestens 3 Spielen
- Dokumentation

### Schritt 1: Agent-Klasse schreiben

```javascript
class MeinAgent extends Agent {
    constructor(options = {}) {
        super("Mein Agent");
        this.options = options;
    }

    getAction(gameState) {
        // Dein Algorithmus hier!
        
        const moves = gameState.getAllValidMoves();
        if (!moves) return null;

        // Beispiel: Evaluiere jeden Zug
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (const move of moves) {
            const clone = gameState.clone();
            clone.makeMove(move);
            const score = this.evaluatePosition(clone);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return {
            move: bestMove,
            reason: `Score: ${bestScore}`
        };
    }

    evaluatePosition(gameState) {
        // TODO: Bewerte eine Position
        return Math.random();
    }
}
```

### Schritt 2: Tests schreiben

```javascript
// Teste deinen Agent gegen bekannte Spiele
const agent = new MeinAgent();
const harness = new AgentTestHarness(agent);

harness.testOnGame(TTTRegularBoard, 20);  // 20 Spiele
harness.testOnGame(RotateBoard, 10);
harness.testOnGame(KnightsTour, 5);

harness.printResults();  // Zeige Ergebnisse
```

### Schritt 3: Dokumentation schreiben

- Wie funktioniert dein Algorithmus?
- Pseudocode
- Komplexität (Zeit, Speicher)
- Performance-Messungen

### Checkliste
- [ ] Agent erbt von `Agent`
- [ ] `getAction()` gibt `{move, reason}` zurück
- [ ] Funktioniert auf TicTacToe
- [ ] Funktioniert auf RotateBox
- [ ] Funktioniert auf KnightsTour
- [ ] Tests dokumentiert
- [ ] Dokumentation fertig

---

## 🎨 Projekt-Typ 3: Neuer Playground

### Was du brauchst
- Visualisierung eines Algorithmus
- Interaktive Parameter (Slider, Dropdown)
- Mehrere Spiele zum Testen

### Struktur

```
src/
├── playground.html     # Hauptseite
├── visualizer.js       # Zeichen-Code
├── ui-controls.js      # Slider, Button, etc.
└── app.js             # Hauptlogik
```

### Beispiel: Minimax Visualizer

```javascript
// visualizer.js
class MinimaxVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    visualizeTree(gameState, depth) {
        // Zeichne den Minimax-Suchbaum
        // Zeige Score für jeden Knoten
        // Highlight besten Zug
    }
}

// ui-controls.js
class UIControls {
    setupSlider(name, min, max, onChange) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.addEventListener('input', (e) => {
            onChange(e.target.value);
        });
        // ... weitere Setup
    }
}

// app.js
window.addEventListener('DOMContentLoaded', () => {
    const visualizer = new MinimaxVisualizer('canvas');
    const controls = new UIControls();
    
    controls.setupSlider('Suchtiefe', 1, 8, (depth) => {
        // Redraw mit neuer Tiefe
        visualizer.visualizeTree(gameState, depth);
    });
});
```

### Checkliste
- [ ] Startet ohne Fehler
- [ ] 3+ Parameter änderbar
- [ ] Visualisierung aktualisiert sich
- [ ] Funktioniert mit 2+ Spielen
- [ ] Dokumentation erklärt was passiert

---

## 📚 Projekt-Typ 4: Neuer Lernpfad

### Was du brauchst
- 5-8 Lektionen
- Aufgaben mit automatischer Überprüfung
- Fortschritts-Tracking

### Struktur

```
src/
├── course.json          # Metadaten
├── lessons/
│   ├── 01-intro.html
│   ├── 02-concepts.html
│   └── ...
├── exercises/
│   ├── exercise-01.js
│   └── ...
└── progress.js         # Fortschritt speichern
```

### course.json Beispiel

```json
{
  "title": "Minimax verstehen",
  "description": "Lerne den Minimax-Algorithmus",
  "author": "Max",
  "duration": 90,
  "difficulty": "Mittel",
  "lessons": [
    {
      "id": 1,
      "title": "Was ist Minimax?",
      "duration": 15,
      "type": "lecture",
      "file": "lessons/01-intro.html"
    },
    {
      "id": 2,
      "title": "Aufgabe 1",
      "duration": 30,
      "type": "coding",
      "file": "lessons/02-task.html",
      "exercise_id": 1
    }
  ]
}
```

### Exercise mit Auto-Check

```javascript
class Exercise1 {
    static check(studentAnswer) {
        // Überprüfe Antwort
        const correct = "Minimax ist...";
        
        if (studentAnswer.includes("two players")) {
            return {
                passed: true,
                message: "✅ Richtig!"
            };
        } else {
            return {
                passed: false,
                message: "❌ Nicht ganz. Denk an 2 Spieler..."
            };
        }
    }
}
```

### Checkliste
- [ ] course.json hat 4-8 Lektionen
- [ ] Jede Lektion hat HTML
- [ ] 3+ Aufgaben mit Auto-Check
- [ ] Fortschritt wird gespeichert
- [ ] Dokumentation fertig

---

## 🧪 Tests schreiben & ausführen

### Einfache Assertion-Bibliothek

```javascript
// assert.js (verwende von CDN)
// https://github.com/browserify/assert

// In deinen Tests:
assert.equal(board.currentPlayer, 1);
assert(board.isGameOver === false);
assert.deepEqual(board.piles, [3, 3, 3]);
```

### Test-HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Tests</title>
    <script src="https://cdn.jsdelivr.net/npm/assert"></script>
</head>
<body>
    <h1>Test Results</h1>
    <div id="results"></div>

    <script src="logic.js"></script>
    <script src="game.test.js"></script>
    <script>
        // Tests hier ausführen
    </script>
</body>
</html>
```

---

## 🚀 Entwicklungs-Workflow

### 1. Lokaler Server starten

```bash
# Im project folder
python3 -m http.server 8000

# Dann im Browser öffnen:
# http://localhost:8000/src/index.html
```

### 2. Änderungen testen

- Code ändern
- Browser refreshen (F5)
- Developer Tools öffnen (F12)
- Fehler im Console Tab prüfen

### 3. Fortschritt dokumentieren

Bearbeite `docs/ENTWICKLUNGSLOG.md`:

```markdown
## [Datum]
- [Was habe ich heute gemacht?]
- [Was funktioniert?]
- [Was muss ich noch machen?]
```

### 4. Vor Review einreichen

- [ ] Alle Tests bestanden
- [ ] Keine Fehler in Konsole
- [ ] README aktuell
- [ ] Code kommentiert
- [ ] projekt-info.json aktuell

---

## 🆘 Häufige Probleme

### Problem: "Cannot read property 'x' of undefined"

**Lösung:** Überprüfe, dass `GameState` korrekt erbt:
```javascript
class MyBoard extends GameState {  // ← extends!
    constructor() {
        super();  // ← super() aufrufen!
    }
}
```

### Problem: Scripts laden nicht

**Lösung:** Überprüfe Pfade in HTML:
```html
<!-- ✅ Richtig: Relative Pfade -->
<script src="../../../WolfsWorld/js/core/game-state.js"></script>

<!-- ❌ Falsch: Absolute Pfade -->
<script src="/Users/alexander/Documents/.../game-state.js"></script>
```

### Problem: Agent lädt nicht

**Lösung:** Scripts in richtiger Reihenfolge laden:
```html
<!-- 1. Core -->
<script src="../../../WolfsWorld/js/core/agent.js"></script>
<script src="../../../WolfsWorld/js/core/game-state.js"></script>

<!-- 2. KI-Algorithmen -->
<script src="../../../WolfsWorld/js/ai/minimax.js"></script>

<!-- 3. Agenten -->
<script src="../../../WolfsWorld/js/ai/agents/random-agent.js"></script>

<!-- 4. Dein Code -->
<script src="logic.js"></script>
<script src="controller.js"></script>
```

---

## 📚 Nützliche Links

- **GameState Interface:** [WolfsWorld/js/core/game-state.js](../WolfsWorld/js/core/game-state.js)
- **Agent Interface:** [WolfsWorld/js/core/agent.js](../WolfsWorld/js/core/agent.js)
- **Minimax:** [WolfsWorld/js/ai/minimax.js](../WolfsWorld/js/ai/minimax.js)
- **Beispiel Game:** [WolfsWorld/js/games/tictactoe/logic.js](../WolfsWorld/js/games/tictactoe/logic.js)

---

## ✅ Review Process

Wenn du fertig bist:

1. **Self-Check:** Mache die Checkliste für deinen Projekt-Typ
2. **Selbstprüfung:** Sind alle Tests bestanden?
3. **Einreichen:** Schreibe Email an Lehrer mit Link zu Projekt
4. **Review:** Lehrer reviewed mit Review-Checkliste
5. **Feedback:** Du bekommst Feedback
6. **Integration:** Nach Bestehen wird dein Projekt in WolfsWorld integriert!

---

**Viel Spaß beim Programmieren! 🎉**

Falls Fragen: Frag deinen Lehrer oder schau in SCHÜLER_PROJEKTSTRATEGIE.md
