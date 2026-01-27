# 📋 Aufgabenkatalog für Schülerprojekte

**Schüler wählen eine Aufgabe, entwickeln sie extern und integrieren nach Abnahme in WolfsWorld**

---

## 🎮 SPIELE (Projekt-Typ 1)

### Aufgabe 1.1: Streichholzspiel (NIM)

**Schwierigkeit:** ⭐ Leicht (Start-Projekt)  
**Dauer:** 3-4 Wochen  
**Lernziele:**
- GameState Interface implementieren
- Spiellogik korrekt abbilden
- Canvas-Rendering
- KI-Integration

**Beschreibung:**

Implementiere das klassische Nim-Spiel ("Streichholzspiel"):
- 3 Haufen mit je 3 Streichhölzern
- Spieler darf beliebig viele Streichhölzer aus EINEM Haufen nehmen
- Wer den LETZTEN nimmt: GEWINNT (Normales Nim) oder VERLIERT (Misère-Variante)
- Spiel gegen RandomAgent und MinimaxAgent

**Anforderungen:**
1. **Spiellogik** (`logic.js`): GameState implementieren
   - `getAllValidMoves()`: {pile: 0-2, count: 1-n}
   - `makeMove()`: Entfernt Streichhölzer
   - `clone()`: Tiefe Kopie für KI-Simulation
   - `getStateKey()`: Eindeutige Zustand-ID
   - Spielende-Erkennung

2. **Visualisierung** (`renderer.js`):
   - Zeige 3 Haufen mit Canvas
   - Zeichne Streichhölzer als Rechtecke
   - Schöne Farben & Typography

3. **Spielablauf** (`controller.js`):
   - Click auf Haufen & Streichholz zum Entfernen
   - Automatischer KI-Zug nach 1 Sekunde
   - Spielende-Dialog mit Gewinner

4. **Tests** (`tests/game.test.js`):
   - Startposition korrekt
   - Züge ändern Haufen
   - Spielende wird erkannt
   - Gegen RandomAgent spielbar

**Deliverables:**
- `src/matchstick.html` - Spielbare Version
- `src/logic.js` - GameState Implementierung
- `src/renderer.js` - Visualisierung
- `src/controller.js` - Spielablauf
- `tests/game.test.js` - Unit Tests
- `docs/ENTWICKLUNGSLOG.md` - Tagebuch
- `README.md` - Dokumentation

**Bonus-Punkte:**
- [ ] 3D-Visualisierung (WebGL/Three.js)
- [ ] Mehrspieler-Netzwerk (Real-time multiplayer)
- [ ] Spiel-Analyse: Wer gewinnt bei perfektem Spiel?

---

### Aufgabe 1.2: Bauernschach (Pawns)

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 4-5 Wochen  
**Lernziele:**
- Komplexere Spiellogik
- 2D-Board Verwaltung
- Schach-ähnliche Regeln

**Beschreibung:**

Vereinfachtes Schach nur mit Bauern:
- 4×8 Brett (Schach-Standard aber nur 4 Reihen)
- Weiße Bauern starten oben, schwarze unten
- Bauer kann: 1 Feld vorwärts ODER diagonal schlagen
- Promotion: Bauer erreicht gegnerische Seite → Umwandlung (optional: in Dame)
- Spiel endet: Kein legaler Zug möglich

**Anforderungen:**
1. **Spiellogik** mit Board-Verwaltung
   - Bauer-Bewegungsregeln
   - Promotion-Handling
   - Schach-ähnliche Notation (a2-a3)
   - Spielende: Stalemate erkennen

2. **Visualisierung:**
   - Schachbrett mit Koordinaten
   - Bauern als Figuren
   - Highlight legale Züge bei Mouse-Over
   - Drag-and-Drop zum Bewegen

3. **KI:**
   - Heuristische Bewertung: Material + Position
   - Minimax mit Tiefe 4-5
   - Performance-messbar (< 1s pro Zug)

4. **Tests & Dokumentation**

**Deliverables:**
- Komplett spielbares Bauernschach
- Tests für alle Bewegungsregeln
- Performance-Benchmark
- Taktische Analyse: Beste Opening-Moves

**Schwierigkeit:**
- Bauer-Promotion korrekt handhaben
- Stalemate erkennen (Tiefe-Suche nötig)
- Performance auf 32 Feldern

---

### Aufgabe 1.3: Connect 4 (Vier gewinnt)

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 3-4 Wochen

**Beschreibung:**

Klassisches Connect-4 Spiel:
- 7×6 Gitter
- Zwei Spieler
- Figuren fallen nach unten (Schwerkraft)
- Gewinnt: 4 in Reihe (horizontal, vertikal, diagonal)
- Spiel gegen KI spielbar

**Anforderungen:**
- GameState Implementation
- Gravity-Physik (Figuren fallen herunter)
- Win-Detection (4 in Reihe)
- Minimax Heuristic

**Bonus:**
- Alpha-Beta Pruning
- Transposition Table (Caching)
- Engine optimiert für Connect4

---

### Aufgabe 1.4: Gomoku (5 in Reihe)

**Schwierigkeit:** ⭐⭐⭐ Schwer  
**Dauer:** 5-6 Wochen

**Beschreibung:**

Asiatisches Spiel ähnlich Go:
- 15×15 oder 19×19 Gitter
- Spieler wechseln Steine platzieren
- Gewinnt: 5 in Reihe
- Sehr großer Suchbaum → Heuristics wichtig!

**Anforderungen:**
- Effiziente Board-Repräsentation
- Smart Heuristics (nicht jeden Zug prüfen!)
- Move-Ordering für Alpha-Beta
- Transposition Table

**Bonus:**
- Pattern Recognition (3 in Reihe = gefährlich)
- Evaluation Tuning
- Endgame vs Midgame unterschiedliche Heuristics

---

### Aufgabe 1.5: Memory-Spiel mit KI

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 2-3 Wochen

**Beschreibung:**

Memory / Paar-Matching-Spiel:
- 4×4 Grid (16 Karten, 8 Paare)
- Spieler & KI decken abwechselnd 2 Karten auf
- Paar-Match: Beide behalten die Karten
- KI-Strategie: Perfektes Gedächtnis (alle gesehenen Karten merken!)
- Gewinnt: Wer mehr Paare hat

**Anforderungen:**
- GameState mit Card-Verwaltung
- Memory-Management für KI (welche Karten liegen wo?)
- Deterministische Best-Play (KI spielt perfekt)
- Visualisierung: Aufdeckanimation

**Besonderheit:**
- Dies ist ein perfekt-informationales Spiel (KI kennt alle Positionen nach erstem Aufdecken!)
- Interessant: Win-Rate KI vs Mensch = 100% (wenn KI zuerst spielt!)

---

## 🤖 KI-AGENTEN (Projekt-Typ 2)

### Aufgabe 2.1: Biased Random Agent

**Schwierigkeit:** ⭐ Leicht  
**Dauer:** 1-2 Wochen

**Beschreibung:**

Erweitere RandomAgent mit "intelligenterer" Zug-Auswahl:
- Alle legalen Züge mit Heuristik bewerten
- Züge mit höherem Score häufiger wählen
- Ist besser als Random, aber nicht perfekt

**Algorithmus:**
```
1. Alle legalen Züge sammeln
2. Jeden Zug mit Heuristik bewerten
3. Weighted Random: Höherer Score = höhere Wahrscheinlichkeit
4. Random-Zug wählen mit Gewichtung
```

**Beispiel (TicTacToe):**
```
- Winning Move: +100 (Gewinn!)
- Blocking Move: +50 (Gegner blockieren)
- Center: +10 (strategisch gut)
- Andere: +1 (schlecht, aber möglich)

→ Weighted-Select mit diesen Scores
```

**Anforderungen:**
- Implementiere `WeightedRandomAgent extends Agent`
- Heuristik für TicTacToe schreiben
- Teste auf: TicTacToe, RotateBox, KnightsTour
- Vergleiche Win-Rate mit `RandomAgent`
- Benchmark: Zeige Verbesserung!

**Deliverables:**
- `src/weighted-random-agent.js`
- `src/test-harness.js` mit Tests auf 3+ Spielen
- `src/algorithm-documentation.md`
- `performance-benchmark.json`

**Beispiel Benchmark:**
```json
{
  "agent": "Weighted Random",
  "results": {
    "TicTacToe": { "vs_random": "55% win rate", "vs_minimax": "5% win rate" },
    "RotateBox": { "solve_rate": "45%", "avg_moves": 25 }
  }
}
```

---

### Aufgabe 2.2: Markov Chain Agent

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 3-4 Wochen

**Beschreibung:**

State-basierter Agent mit Übergangswahrscheinlichkeiten:
- Analysiere Spiel-Historien
- Lerne Übergangsmatrix: P(state_next | state_current, action)
- Wähle Zug mit höchster Gewinn-Wahrscheinlichkeit

**Algorithmus:**
```
Phase 1: Training
1. Sammle 1000+ Spiele-Sequenzen
2. Zähle Übergänge: state → action → new_state
3. Berechne Wahrscheinlichkeiten
4. Speichere Matrix

Phase 2: Inferenz
1. Aktuellen Zustand in Matrix finden
2. Für jeden Zug: Wahrscheinlichkeit des Gewinns
3. Wähle Zug mit höchster P(win)
```

**Anforderungen:**
- Transitionsmatrix sammeln (von Spiel-Daten)
- Training vs. Inferenz getrennt
- Teste auf 3+ Spielen
- Dokumentiere Trainings-Daten (Quelle?)
- Vergleiche mit Random & Minimax

**Beispiel:**
```javascript
class MarkovAgent extends Agent {
    constructor(transitionData) {
        super("Markov Chain");
        this.matrix = transitionData;  // P(win | state, action)
    }

    getAction(gameState) {
        const key = gameState.getStateKey();
        const actions = gameState.getAllValidMoves();
        
        // Wähle Zug mit höchster Gewinn-Wahrscheinlichkeit
        let bestAction = actions[0];
        let bestProb = this.matrix[key][bestAction] || 0;
        
        for (const action of actions) {
            const prob = this.matrix[key][action] || 0;
            if (prob > bestProb) {
                bestProb = prob;
                bestAction = action;
            }
        }
        
        return { move: bestAction, reason: `Markov P(win)=${bestProb.toFixed(3)}` };
    }
}
```

**Bonus:**
- Dynamische Anpassung (Learning während Spiel)
- Confidence-Intervals
- Performance vs. Complexity

---

### Aufgabe 2.3: Monte Carlo Tree Search (MCTS)

**Schwierigkeit:** ⭐⭐⭐ Schwer  
**Dauer:** 4-6 Wochen

**Beschreibung:**

MCTS Algorithmus (wie AlphaGo!):
- Exploriere Suchbaum statistisch
- 4 Phasen: Selection, Expansion, Simulation, Backpropagation
- UCB-Formel balanciert Exploration vs. Exploitation
- Besser als Minimax für große Suchräume!

**Algorithmus:**
```
Repeat N times (N = iterations):
  1. SELECT: Von Root bis expandierbar Node (UCB-Auswahl)
  2. EXPAND: Neue Child-Node hinzufügen
  3. SIMULATE: Random Rollout bis Spielende
  4. BACKUP: Gewinn hochpropagieren
  
Return: Kind mit beste Average-Win-Rate
```

**UCB-Formel:**
```
UCB = (wins / visits) + C * sqrt(ln(parent_visits) / visits)
      ↑ Exploitation    ↑ Exploration
```

**Anforderungen:**
- Implementiere `MonteCarloAgent`
- 4-Phasen korrekt implementieren
- Tests auf 3+ Spielen
- Parameter-Tuning: iterations, C-constant
- Vergleiche mit Minimax (Speed? Quality?)

**Deliverables:**
- `src/monte-carlo-agent.js`
- `src/test-harness.js`
- `src/algorithm-documentation.md` mit Pseudocode
- Parameter-Analyse (beste Iterations-Count?)

**Bonus:**
- Rapid Action Value Estimation (RAVE)
- Transposition Table
- Parallel MCTS (Multi-threaded)

---

### Aufgabe 2.4: Reinforcement Learning Agent

**Schwierigkeit:** ⭐⭐⭐⭐ Sehr Schwer  
**Dauer:** 6-8 Wochen

**Beschreibung:**

Machine Learning Agent mit Q-Learning oder Neural Network:
- Agent trainiert durch Selbstspiel
- Keine fest-codierte Heuristik
- Lernt beste Strategie

**Option A: Q-Learning (Einfacher)**
- State-Value oder Action-Value Tabelle
- Bellman-Gleichung zur Aktualisierung
- Policy Improvement

**Option B: Neural Network (Schwieriger)**
- Input: Board State
- Output: Move Scores
- Training: Backpropagation

**Anforderungen:**
- Training-Loop implementieren
- Learning Curve plotten (Score über Zeit)
- Agent lernt progressiv besser
- Vergleich: Untrained vs. Trained
- Teste nach 100+ Spiele-Iterationen

**Deliverables:**
- Agent-Implementierung
- Training-Script
- Learning Curve Graph
- Finale Performance-Benchmarks
- Analyse: Wie viele Spiele zum Konvergieren?

**Sehr schwierig weil:**
- Viel Debugging & Tuning nötig
- Konvergenz ist nicht garantiert
- Hyperparameter-Sensitivität
- Rechenzeit erheblich

---

### Aufgabe 2.5: Hybrid Agent

**Schwierigkeit:** ⭐⭐⭐ Schwer  
**Dauer:** 4-5 Wochen

**Beschreibung:**

Kombiniere mehrere Strategien intelligent:
- Früh-Spiel: Heuristics/Rules
- Mid-Spiel: Minimax
- End-Spiel: TableBase/Memorized
- Oder: MCTS + Neural Network

**Beispiel:**
```javascript
class HybridAgent extends Agent {
    getAction(gameState) {
        if (this.isEndgame(gameState)) {
            return this.tablebaseMove(gameState);
        } else if (this.isMidgame(gameState)) {
            return this.minimaxMove(gameState);
        } else {
            return this.heuristicMove(gameState);
        }
    }
}
```

---

## 🎨 PLAYGROUNDS (Projekt-Typ 3)

### Aufgabe 3.1: Minimax Visualizer

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 3-4 Wochen

**Beschreibung:**

Interaktive Visualisierung des Minimax-Algorithmus:
- Zeige Suchbaum grafisch
- Nodes mit Scores
- Animation der Expansion
- Highlight beste Moves
- Live-Parameter ändern

**Features:**
1. **Suchbaum-Visualisierung:**
   - Knoten als Kreise/Rechtecke
   - Werte in Knoten schreiben
   - Kanten für Züge
   - Farbcodierung: Max (🟢) / Min (🔴) Ebenen

2. **Parameter:**
   - Slider: Suchtiefe (1-8)
   - Slider: Board-Größe (TicTacToe 3x3, Ultimate 3x3x3)
   - Toggle: Alpha-Beta Pruning an/aus
   - Dropdown: Spiel wählen

3. **Statistiken:**
   - Knoten besucht: mit/ohne Pruning
   - Zeit zum Berechnen
   - Best Move Score

4. **Animation:**
   - Knoten expandieren sich nacheinander
   - Score-Propagation animieren
   - Pruned Nodes rot hervorheben

**Anforderungen:**
- Visualizer mit Canvas/SVG
- UI-Controls (Slider, Dropdown, Button)
- Live-Recompute bei Parameter-Änderung
- 2+ Spiele
- Performance: Depth 6 sollte < 2 sec sein

**Deliverables:**
- `src/playground.html`
- `src/visualizer.js`
- `src/ui-controls.js`
- `src/app.js`
- Doku: "Was lernt man damit?"

**Bonus:**
- 3D-Baum-Visualisierung
- Trace-Aufzeichnung abspielen
- Einzelne Knoten inspizieren

---

### Aufgabe 3.2: Markov Chain Visualizer

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 2-3 Wochen

**Beschreibung:**

Visualisiere Zustandsübergänge in Spielen:
- Zustand als Knoten
- Übergänge als Pfeile
- Wahrscheinlichkeiten beschriften
- Interaktiv Paths erkunden

**Features:**
1. **Zustandsgraph:**
   - Zustandsraum als Graph
   - Pfeile = mögliche Übergänge
   - Übergangswahrscheinlichkeit beschriftet

2. **Parameter:**
   - Start-Zustand wählen
   - Iterations-Count (wie viele Schritte?)
   - Spiel wählen

3. **Animation:**
   - Zeige einen Zufalls-Pfad durch Zustandsraum
   - Highlight aktuellen Zustand
   - Statistiken: Häufigkeit pro Zustand

4. **Analyse:**
   - Steady-State-Verteilung
   - Absorbierende Zustände (Spielende)
   - Misch-Zeit (wie schnell konvergiert?)

**Deliverables:**
- Graph-Visualisierung
- Interaktive Steuerung
- Pfad-Animation
- Doku mit Markov-Theorie-Erklärung

---

### Aufgabe 3.3: Heuristic Explorer

**Schwierigkeit:** ⭐⭐⭐ Schwer  
**Dauer:** 4-5 Wochen

**Beschreibung:**

Vergleiche verschiedene Heuristiken/Bewertungsfunktionen:
- Material-basiert
- Positions-basiert
- Symmetrie-basiert
- ML-basiert

**Features:**
1. **Heuristik-Auswahl:**
   - 3-4 verschiedene Heuristiken
   - Dropdown zum Wechseln
   - Live-Heuristic-Wert für aktuellen Zustand

2. **Analyse:**
   - Agent mit H1 vs. Agent mit H2
   - Turnier: Wer gewinnt häufiger?
   - Performance: Welche ist schneller?

3. **Visualisierung:**
   - Heatmap: Wie bewertet H1 jedes Feld?
   - Vergleich: H1 vs H2 für gleichen Board

4. **Tuning:**
   - Parameter für jede Heuristik
   - Gewichte anpassen
   - Performance-Curve plotten

**Deliverables:**
- Mehrere Heuristik-Implementierungen
- Tournament-System
- Visualisierung & Analyse
- "Beste Heuristik für XYZ" Bericht

---

## 📚 LERNPFADE (Projekt-Typ 4)

### Aufgabe 4.1: "Minimax für Anfänger"

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 3-4 Wochen (+ Inhalt-Schreiben)

**Beschreibung:**

5-Lektionen Kurs über Minimax-Algorithmus für Anfänger:

**Lektion 1: Motivation (15 min)**
- Warum brauchen wir KI in Spielen?
- Wie spielen Menschen vs. Computer?
- Überblick: Was ist Minimax?

**Lektion 2: Spielbäume verstehen (20 min)**
- Was ist ein Suchbaum?
- Knoten = Board-Position
- Blätter = Spiel-Ende
- Interaktive Aufgabe: Baum zeichnen

**Lektion 3: Min- und Max-Schichten (25 min)**
- Max-Spieler maximiert seinen Score
- Min-Spieler minimiert Score des Gegners
- Alternating Layers
- Aufgabe: Scores propagieren (interaktiv)

**Lektion 4: Der Algorithmus (20 min)**
- Pseudocode schreiben
- Rekursion verstehen
- Base Case: Spielende
- Aufgabe: Code-Lücken füllen

**Lektion 5: Optimierung: Alpha-Beta Pruning (20 min)**
- Warum ist Minimax langsam?
- Wie funktioniert Pruning?
- Performance-Vergleich
- Quiz: Verstanden?

**Anforderungen pro Lektion:**
- HTML mit gutem Layout
- Visuelle Elemente (Diagramme!)
- 2-3 Aufgaben mit Auto-Check
- Clear Learning Outcomes
- Progressiv schwieriger

**Aufgaben-Beispiele:**
1. MC-Quiz: "Welcher Score bei Minimax?"
2. Interaktiv: Werte in Baum ausfüllen
3. Coding: Minimax für TicTacToe implementieren
4. Essay: "Erklär Pruning mit eigenen Worten"

**Deliverables:**
- 5 HTML-Seiten
- course.json mit Metadaten
- 10+ Aufgaben mit Auto-Check
- Fortschritts-Tracking
- Quizzes & Tests

**Bonus:**
- Video-Erklärungen
- Printable Handouts
- Animierte Erklärungen

---

### Aufgabe 4.2: "Game State Design - Wie designt man Spiele?"

**Schwierigkeit:** ⭐⭐⭐ Schwer  
**Dauer:** 4-5 Wochen

**Beschreibung:**

Tiefer Lernpfad über Spiel-Architektur:

**Lektion 1: Anforderungen (20 min)**
- Was braucht JEDES Spiel? (State, Moves, Rules)
- Beispiele: TicTacToe, Schach, Go
- Interface-Thinking

**Lektion 2: Das GameState Interface (25 min)**
- Methoden: getAllValidMoves, makeMove, clone, getStateKey
- Warum clone()? (KI braucht Kopien!)
- Warum getStateKey()? (Caching!)

**Lektion 3: Implementierung (30 min)**
- TicTacToe vs. RotateBox
- Unterschiedliche Datenstrukturen
- Performance-Überlegungen
- Coding-Aufgabe: Neues Spiel starten

**Lektion 4: Optimierungen (20 min)**
- Effiziente Repräsentation (Bitboards)
- Move-Ordering
- Transposition Tables
- Aufgabe: Performance messen

**Lektion 5: Testing & Validierung (20 min)**
- Wie testet man Game-States?
- Property-based Testing
- Invarianten prüfen
- Aufgabe: Test-Suite schreiben

**Deliverables:**
- 5 Lektionen mit Code-Beispielen
- Mindestens 8-10 praktische Aufgaben
- Schüler implementiert neues Spiel (am Ende)
- Tiefer technisches Verständnis

---

### Aufgabe 4.3: "KI-Agenten Design - Verschiedene Strategien"

**Schwierigkeit:** ⭐⭐⭐ Schwer  
**Dauer:** 4-5 Wochen

**Beschreibung:**

Vergleiche verschiedene Agent-Arten:

**Lektion 1: Agent Interface (15 min)**
- Was alle Agenten gemeinsam haben
- getAction() Methode
- {move, reason} Return-Format

**Lektion 2: Random Agents (15 min)**
- Einfachste Implementation
- Als Baseline nutzen
- Aufgabe: RandomAgent erweitern

**Lektion 3: Rule-Based Agents (25 min)**
- Hand-gemachte Regeln
- Decision Trees
- Aufgabe: Regeln für TicTacToe schreiben

**Lektion 4: Search-Based Agents (25 min)**
- Minimax, MCTS, Alpha-Beta
- Trade-off: Speed vs. Quality
- Aufgabe: Verschiedene Tiefen vergleichen

**Lektion 5: Learning Agents (20 min)**
- Reinforcement Learning Überblick
- Q-Learning kurz erklärt
- Aufgabe: Trainings-Loop verstehen

**Deliverables:**
- 5 Lektionen
- Code-Beispiele für jeden Agent-Typ
- Benchmark-Tools
- Schüler implementiert 2 Agenten

---

## 🎁 BONUS-AUFGABEN

### Aufgabe B1: "Schach-Engine Grundlagen"

**Schwierigkeit:** ⭐⭐⭐⭐ Sehr Schwer  
**Dauer:** 8-10 Wochen

Implementiere Schach mit:
- Alle Figuren
- Spezial-Züge (En Passant, Castling)
- Minimax + Alpha-Beta
- Opening Book (Memorized positions)
- Endgame Tablebases (optional)

---

### Aufgabe B2: "Neural Network Evaluator"

**Schwierigkeit:** ⭐⭐⭐⭐ Sehr Schwer  
**Dauer:** 6-8 Wochen

Trainiere neuronales Netz für Positionsbewertung:
- Input: Board State
- Hidden Layers: 2-3 Schichten
- Output: Position Score (-1 bis +1)
- Training: Mit Spiel-Daten oder Self-Play

---

### Aufgabe B3: "Multiplayer Arena"

**Schwierigkeit:** ⭐⭐ Mittel  
**Dauer:** 3-4 Wochen

Tournament-System:
- Viele Agenten spielen gegeneinander
- Ranking & Leaderboard
- Best-of-3 Matches
- Statistiken & Analysen

---

## ✅ Auswahl-Hilfe

| Projekt-Typ | Einfach | Mittel | Schwer |
|-------------|---------|--------|--------|
| **Spiele** | Nim (1.1) | Bauernschach (1.2), C4 (1.3) | Gomoku (1.4) |
| **Agenten** | Biased Random (2.1) | Markov (2.2), MCTS (2.3) | RL (2.4) |
| **Playgrounds** | - | Minimax Viz (3.1), Markov Viz (3.2) | Heuristic Explorer (3.3) |
| **Lernpfade** | - | Minimax für Anfänger (4.1) | Game Design (4.2), Agenten (4.3) |

**Für erste Projekte:** Wähle aus "Einfach" oder "Mittel"  
**Fortgeschrittene:** Versuchen sich an "Schwer"

---

## 📝 Bewerbungsformular

Wenn du eine Aufgabe wählen möchtest, schreib an deinen Lehrer:

```
Betreff: KI-Projekt Anmeldung

Ich möchte folgendes Projekt machen:
- Aufgabe: [1.1, 2.3, etc.]
- Titel: [Name des Projekts]
- Geplante Dauer: [Wochen]
- Team oder Einzeln?: [Solo/Partner]
- Voraussetzungen vorhanden?: [JavaScript, Canvas, ...]

Begründung:
[Warum interessiert dich dieses Projekt?]
```

**Genehmigung:** Lehrer gibt OK und du kannst starten!

---

**Aufgabenkatalog v1.0 - 27. Januar 2026**
