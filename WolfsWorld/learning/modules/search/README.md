# 📚 Learning-Path: Suchbäume mit Rotatebox

Ein interaktiver Kurs in WolfsWorld, der zeigt wie Computer Suchräume erkunden.

## 📂 Struktur

```
WolfsWorld/learning/modules/search/
├── course.json              ← Kurs-Metadaten (6 Lektionen definiert)
├── index.html               ← Kurs-Navigation & Übersicht
├── 01-rotatebox-intro.html  ← Lektion 1: Das Puzzle (✅ Fertig)
├── 02-search-space.html     ← Lektion 2: Bäume (✅ Fertig)
├── 03-bfs.html              ← Lektion 3: Breitensuche (⏳ Template)
├── 04-dfs.html              ← Lektion 4: Tiefensuche (⏳ Template)
├── 05-duplicates.html       ← Lektion 5: Optimierung (⏳ Template)
└── 06-solver-demo.html      ← Lektion 6: Live-Demo (⏳ Template)
```

## 🎯 Warum Rotatebox?

- **Real**: Es ist ein echtes Puzzle-Spiel in WolfsWorld
- **Visual**: Die Rotatebox-Visualisierung zeigt Suchbäume live
- **Interaktiv**: Schüler können BFS/DFS Code schreiben und sofort testen
- **Skalierbar**: Vom 3×3 bis 4×4 Grid mit einstellbarer Tiefe

## 🔗 Integrationen

Dieser Kurs nutzt **bereits existierende** WolfsWorld-Ressourcen:

### Visualisierungen
- `WolfsWorld/playground/rotatebox-viz.html` - Live Baum-Visualisierung
- Integriert `js/games/rotatebox/tree-adapter.js` - Konvertiert Rotatebox zu TreeNode
- Nutzt `js/viz/tree-engine.js` - Die Baum-Engine

### Code-Beispiele
- `js/games/rotatebox/logic.js` - GameState Implementierung
- `js/core/game-state.js` - Die GameState Interface
- `js/games/rotatebox/tree-adapter.js` - Adapter für Visualisierung

## 📖 Lektionen (Status)

### ✅ Lektion 1: Das Rotatebox-Puzzle (10 Min)
- Verständnis des Spiels
- Suchraum-Größe berechnen
- Warum Brute-Force nicht funktioniert
- 2 interaktive Quiz-Fragen
- Live-Link zur Visualisierung

### ✅ Lektion 2: Suchräume und Spielbäume (15 Min)
- Knoten, Kanten, Tiefe, Blätter
- Exponentielles Wachstum
- TreeNode Klasse in Code
- Pseudocode-Übung: generateTree()
- Link zur Live-Visualisierung

### ⏳ Lektion 3: Breitensuche (BFS) (20 Min)
- **Zu schreiben:** Queue-basierte Implementierung
- Warum BFS den kürzesten Weg findet
- Speicher-Anforderungen
- Live-Visualisierung: BFS in Aktion
- Vergleich mit DFS

### ⏳ Lektion 4: Tiefensuche (DFS) (20 Min)
- **Zu schreiben:** Stack-basierte Implementierung
- Backtracking verstehen
- Weniger Speicher als BFS
- Live-Visualisierung: DFS in Aktion
- Performance-Vergleich

### ⏳ Lektion 5: Duplikate erkennen (15 Min)
- **Zu schreiben:** State-Hashing
- getStateKey() Funktion
- Visited-Set für Duplikat-Erkennung
- Performance-Gewinn messen
- Beispiele aus Rotatebox

### ⏳ Lektion 6: Solver-Demo (10 Min)
- **Zu schreiben:** Interaktive Live-Demo
- BFS vs DFS auf echtem Level
- Statistiken: Knoten, Tiefe, Zeit
- Lösungsschritte anzeigen
- Replay der Lösung

## 🚀 Schüler-Anleitung

### So startest du:
1. Öffne `WolfsWorld/learning/modules/search/index.html`
2. Wähle eine Lektion (Lektion 1 oder 2 sind fertig)
3. Folge den Erklärungen
4. Schreib Code in den Übungen
5. Klick "Live-Demo" um die Visualisierung zu sehen

### Lektionen 3-6 selbst ausfüllen:
Du kannst die Vorlagen verwenden um die fehlenden Lektionen zu schreiben:
- Kopiere Struktur von Lektion 1 oder 2
- Schreib deine BFS/DFS Implementierung
- Teste mit der rotatebox-viz Visualisierung
- Zeige dein Projekt

## 📊 Rotatebox-Visualisierung nutzen

Die Live-Visualisierung kann konfiguriert werden:

```
playground/rotatebox-viz.html?depth=4&algorithm=BFS
```

Parameter:
- `depth` - Wie tief der Baum sein soll (1-15)
- `algorithm` - BFS oder DFS
- `level` - Welches Rotatebox-Level (0-3)

## 💻 Code-Integration

Im Learning-Path nutzen wir bereits:

```javascript
// TreeNode Class
const root = new TreeNode(0, startState, 0);

// Rotatebox Adapter
const tree = RotateBoxAdapter.generateTree(board, {
  maxDepth: 4,
  algorithm: 'BFS',
  checkDuplicates: true
});

// GameState Interface
const moves = state.getAllValidMoves();
const nextState = state.clone();
nextState.makeMove(move);
```

## 🎓 Lernziele pro Lektion

| Lektion | Hauptthema | Praxis | Visualisierung |
|---------|-----------|--------|-----------------|
| 1 | Puzzle verstehen | Quiz | rotatebox-viz Link |
| 2 | Bäume & Knoten | Pseudocode | rotatebox-viz Link |
| 3 | BFS | BFS implementieren | Live BFS zeigen |
| 4 | DFS | DFS implementieren | Live DFS zeigen |
| 5 | Duplikate | Hashing üben | Duplikat-Markierung |
| 6 | Alles zusammen | Solver | Statistiken & Replay |

## 📝 Lehrer-Notizen

- Der Kurs setzt **Grundlagen JavaScript** voraus (Schleifen, Arrays, Funktionen)
- **Rekursion** sollte bekannt sein
- Mit Lektion 2 können Schüler die Visualisierung selbst erkunden
- Lektionen 3-6 sind **Coding-fokussiert** - Schüler schreiben echten Code
- Am Ende können Schüler ihren eigenen **KI-Solver** schreiben!

## 🔧 Technische Anforderungen

- Browser mit Canvas-Unterstützung
- localStorage für Fortschritts-Tracking
- WolfsWorld muss laufen (für Visualisierung zu funktionieren)

## 📚 Weitere Ressourcen

- `WolfsWorld/learning/viewer.html` - Alle Kurse
- `WolfsWorld/playground/` - Alle Visualisierungen
- `WolfsWorld/README.md` - Projektübersicht
- `SCHÜLER_SCHNELLANLEITUNG.md` - Student Quick-Start (im Root)

---

**Viel Erfolg mit dem Lernen! 🎉**
