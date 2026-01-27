# Minimax-Implementierung für TTT-Spiele

Dieses Dokument beschreibt die vollständige Minimax-Implementierung mit konfigurierbaren Bewertungsfunktionen für alle drei Tic-Tac-Toe Varianten.

## 🎯 Überblick

Die Minimax-Implementierung besteht aus folgenden Komponenten:

```
js/ai/
├── minimax.js                    # Kern-Engine (Minimax mit Alpha-Beta)
├── agents/
│   └── minimax-agent.js         # Agent-Klasse für das Spielsystem
├── heuristics.js                 # Bewertungsfunktionen für alle Spieltypen
└── rules/
    └── ttt-rules.js             # (Existierende Regelimplementierung)

games/tictactoe/
├── logic.js                      # Spiellogik (TTTRegularBoard, TTT3DBoard, UltimateBoard)
├── regular-controller.js         # Controller mit Minimax für 3x3
├── 3d-controller.js             # Controller mit Minimax für 3D
└── ultimate-controller.js       # Controller mit Minimax für Ultimate
```

---

## 🔧 Kernkomponenten

### 1. MinimaxEngine (`js/ai/minimax.js`)

**Klasse:** `MinimaxEngine`

Die Engine implementiert den klassischen Minimax-Algorithmus mit Alpha-Beta Pruning.

#### Konfiguration
```javascript
const engine = new MinimaxEngine({
    heuristicFn: (gameState, player) => number,  // Bewertungsfunktion
    maxDepth: number,                              // Suchtiefe (Standard: 3)
    useAlphaBeta: boolean,                        // Alpha-Beta aktivieren (Default: true)
    captureTrace: boolean                         // Visualisierung tracen (Default: false)
});
```

#### Hauptmethode
```javascript
const result = engine.findBestMove(rootState);
// Gibt zurück: { move: ..., score: number, nodesVisited: number, trace: [...] }
```

#### Besonderheiten
- **Move-Format-Flexibilität:** Unterstützt sowohl `move` (Nummer) als auch `{big, small}` (Ultimate)
- **Terminal-Zustand-Erkennung:** Prüft `winner` und `getAllValidMoves()`
- **Trace-Logging:** Optional verfügbar für Visualisierungen
- **Alpha-Beta Pruning:** Reduziert Suchbaum um ~50-90%

---

### 2. MinimaxAgent (`js/ai/agents/minimax-agent.js`)

**Klasse:** `MinimaxAgent extends Agent`

Die Agent-Schnittstelle für das TTT-Spielsystem.

#### Konfiguration
```javascript
const agent = new MinimaxAgent({
    name: string,                              // Agent-Name
    maxDepth: number,                          // Suchtiefe
    useAlphaBeta: boolean,                    // Alpha-Beta nutzen
    heuristicFn: (gameState, player) => number // Bewertungsfunktion
});
```

#### Hauptmethode
```javascript
const action = agent.getAction(gameState);
// Gibt zurück: { move: ..., reason: string } oder null
```

---

### 3. HeuristicsLibrary (`js/ai/heuristics.js`)

**Namespace:** `HeuristicsLibrary`

Sammlung von Bewertungsfunktionen für verschiedene Spieltypen.

#### Schnittstelle (alle Funktionen)
```javascript
(gameState: GameState, player: number) => score: number
```

**Bewertungsskala:**
- Positive Werte: Gut für den Spieler (maximieren)
- Negative Werte: Schlecht für den Spieler (minimieren)
- 0: Neutral/Remis

#### Verfügbare Heuristiken

##### `HeuristicsLibrary.winLoss()`
- **Für:** Einfache Endspiele
- **Scoring:**
  - +1000: Gewinn
  - -1000: Niederlage
  - 0: Remis/Offen

##### `HeuristicsLibrary.regularTTT()`
- **Für:** 3x3 Tic-Tac-Toe (Standard)
- **Bewertung:**
  - Terminale Zustände: ±1000
  - 2-er Reihen ohne Gegner: ±50
  - 1-er Steine: ±5
  - Zentrum-Feld: ±3
  - Ecken-Vorteil: ±2 pro Eck-Stein

##### `HeuristicsLibrary.threeDTTT()`
- **Für:** 3D Tic-Tac-Toe (3x3x3 oder 4x4x4)
- **Bewertung:**
  - Terminale Zustände: ±1000
  - Materialvorteil (Steine): ±2
  - 2-Steine-Linien: ±10 (mit komplex. Line-Check)
  - Offen-Feld-Bewertung: Dynamisch

##### `HeuristicsLibrary.ultimateTTT()`
- **Für:** Ultimate Tic-Tac-Toe (9x9 Makro-Board)
- **Bewertung:**
  - Terminale Zustände: ±10000
  - Gewonnene Sub-Boards: ±1000
  - Material im Sub-Board: ±10
  - 2-er Reihen im Sub-Board: ±30
  - Zentrum-Stellung: ±5
  - "Eroberbare" Boards (2+ eigene Steine): ±50

---

## 🎮 Integration in TTT-Controller

### Regular TTT (3x3)

**Datei:** `games/tictactoe/regular-controller.js`

```javascript
agent = new MinimaxAgent({ 
    name: "Minimax God",
    maxDepth: 9,              // Volle Tiefe möglich (nur 9! Felder)
    useAlphaBeta: true,
    heuristicFn: HeuristicsLibrary.regularTTT
});
```

**Züge-Format:** Einfache Zahlen (0-8)

### 3D TTT (3x3x3 oder 4x4x4)

**Datei:** `games/tictactoe/3d-controller.js`

```javascript
agent = new MinimaxAgent({ 
    name: "Minimax 3D",
    maxDepth: 2,              // Stark begrenzt (hoher Branching-Factor)
    useAlphaBeta: true,
    heuristicFn: HeuristicsLibrary.threeDTTT
});
```

**Züge-Format:** Einfache Zahlen (Index im flachen 3D-Array)

**Performance-Hinweis:** Tiefe 2 ist das praktische Maximum ohne Browser-Freezing.

### Ultimate TTT (9x9)

**Datei:** `games/tictactoe/ultimate-controller.js`

```javascript
agent = new MinimaxAgent({
    name: "Smart Minimax",
    maxDepth: 4,              // Guter Kompromiss
    useAlphaBeta: true,
    heuristicFn: HeuristicsLibrary.ultimateTTT
});
```

**Züge-Format:** Objekte `{big: number, small: number}`

---

## 📋 HTML-Integration

Alle drei TTT-Spielseiten (`ttt-regular.html`, `ttt-3d.html`, `ttt-ultimate.html`) wurden aktualisiert:

### 1. Script-Einbindung
```html
<script src="../js/ai/minimax.js"></script>
<script src="../js/ai/agents/minimax-agent.js"></script>
<script src="../js/ai/heuristics.js"></script>
```

### 2. Menu-Optionen
```html
<select id="p1Type" class="viz-select">
    <option value="human">Mensch</option>
    <option value="random">KI: Zufall</option>
    <option value="rulebased">KI: Regeln</option>
    <option value="minimax">KI: Minimax</option>  <!-- ← Neu hinzugefügt -->
</select>
```

---

## ✅ Validierung und Testen

### Überprüfte Aspekte

1. **Minimax-Algorithmus**
   - ✅ Korrekte Maximierung/Minimierung
   - ✅ Alpha-Beta Pruning funktioniert
   - ✅ Terminal-Zustand-Erkennung

2. **Move-Format-Kompatibilität**
   - ✅ Regular/3D: Zahlen-Format
   - ✅ Ultimate: {big, small}-Format
   - ✅ Engine adaptiert automatisch

3. **Heuristik-Integration**
   - ✅ Alle drei Heuristiken implementiert
   - ✅ Bewertungsskalen sinnvoll
   - ✅ Terminal-Zustände korrekt erkannt

4. **Fehlerbehandlung**
   - ✅ `winner` !== 0 wird erkannt
   - ✅ Remis (winner === 3) wird erkannt
   - ✅ Keine gültigen Züge → Terminal

### Zu beachten

- **3D-Performance:** Bei Tiefe >2 kann der Browser hängen
- **Ultimate-Performance:** Tiefe 4 ist optimiert; 5+ ist langsam
- **Heuristic-Genauigkeit:** Die Heuristiken sind heuristisch, nicht perfekt
- **Trace-Overhead:** Bei `captureTrace: true` wird es deutlich langsamer

---

## 📊 Algorithmus-Details

### Minimax Standard
```
minimax(node, depth, isMax):
  if depth == 0 or isTerminal(node):
    return evaluate(node)
  
  if isMax:
    maxScore = -∞
    for child in children(node):
      score = minimax(child, depth-1, false)
      maxScore = max(maxScore, score)
    return maxScore
  else:
    minScore = +∞
    for child in children(node):
      score = minimax(child, depth-1, true)
      minScore = min(minScore, score)
    return minScore
```

### Alpha-Beta Pruning
```
minimax(node, depth, α, β, isMax):
  ... (wie oben)
  if isMax:
    for child in children(node):
      score = minimax(child, depth-1, α, β, false)
      α = max(α, score)
      if β ≤ α: break    # ← PRUNING
  else:
    for child in children(node):
      score = minimax(child, depth-1, α, β, true)
      β = min(β, score)
      if β ≤ α: break    # ← PRUNING
```

**Effekt:** Durchschnittlich 50-90% weniger Knoten zu evaluieren.

---

## 🚀 Verwendungsbeispiele

### Direkte Engine-Nutzung
```javascript
const engine = new MinimaxEngine({
    heuristicFn: HeuristicsLibrary.regularTTT,
    maxDepth: 5,
    useAlphaBeta: true
});

const result = engine.findBestMove(gameState);
console.log(`Bester Zug: ${result.move}, Score: ${result.score}`);
```

### Agent-Nutzung im Spiel
```javascript
const agent = new MinimaxAgent({
    maxDepth: 9,
    heuristicFn: HeuristicsLibrary.regularTTT
});

const action = agent.getAction(gameState);
if (action) {
    gameState.makeMove(action.move);
}
```

### Eigene Heuristik
```javascript
const customHeuristic = (gameState, player) => {
    // Eigene Bewertungslogik
    if (gameState.winner === player) return 1000;
    if (gameState.winner === (3 - player)) return -1000;
    // ... weitere Logik
    return score;
};

const agent = new MinimaxAgent({
    maxDepth: 4,
    heuristicFn: customHeuristic
});
```

---

## 🔍 Zusammenfassung der Änderungen

| Datei | Änderung | Typ |
|-------|---------|------|
| `js/ai/heuristics.js` | Erweitert: 3 neue Heuristiken, bessere Dokumentation | Implementierung |
| `js/ai/minimax.js` | Verbessert: Bessere Terminal-Prüfung, robust Move-Format | Bugfix |
| `js/ai/agents/minimax-agent.js` | Unverändert (bereits korrekt) | - |
| `games/ttt-regular.html` | + Scripts, + Minimax-Option | HTML |
| `games/ttt-3d.html` | + Scripts, + Minimax-Option | HTML |
| `games/ttt-ultimate.html` | + Scripts, + Minimax-Option | HTML |
| `*/regular-controller.js` | Heuristik angepasst | JS |
| `*/3d-controller.js` | Heuristik angepasst | JS |
| `*/ultimate-controller.js` | Heuristik angepasst | JS |

---

## 📚 Weitere Ressourcen

- Minimax-Visualisierung: `WolfsWorld/playground/minimax-viz.html`
- Minimax-Adapter: `WolfsWorld/js/viz/minimax-adapter.js`
- TTT-Logik: `WolfsWorld/js/games/tictactoe/logic.js`

---

**Version:** 1.0  
**Datum:** Januar 2026  
**Status:** ✅ Fertig und getestet
