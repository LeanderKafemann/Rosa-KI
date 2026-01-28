# 🤖 KI Arena Playground

Eine interaktive Wettkampf-Plattform, auf der verschiedene KI-Agenten gegeneinander antreten und ihre Strategien in Tic-Tac-Toe Varianten testen.

## Features

### 🎮 Unterstützte Spiele
- **Tic-Tac-Toe Regular** (3×3 klassisches Spiel)
- **Tic-Tac-Toe 3D** (4×4×4 Würfel-Variante)
- **Tic-Tac-Toe Ultimate** (9×9 Meta-Spiel)

### 🤖 Agent-Typen

#### Minimax-Agenten
- **Minimax (Vorsichtig)**: Suchtiefe 2 - schnell, gutes Tempo
- **Minimax (Ausgewogen)**: Suchtiefe 3 - Standard-Stärke
- **Minimax (Aggressiv)**: Suchtiefe 4 - sehr stark, lange Rechnung
- **Minimax (Zentraler Fokus)**: Mit Zentralitäts-Heuristik
- **Minimax (Mobilität)**: Mit Beweglichkeits-Heuristik

#### Regel-basierte Agenten
- **Regel-KI (Konservativ)**: Defensive Strategie, fokussiert auf Blocken
- **Regel-KI (Ausgewogen)**: Gemischte Strategie
- **Regel-KI (Offensiv)**: Aggressive Strategie, fokussiert auf Gewinnen

#### Andere
- **Zufalls-KI**: Wählt zufällig - nützliche Baseline für Vergleiche

### 📊 Statistik-Funktionen

**Standard-Statistiken:**
- Anzahl Siege für jeden Agent
- Draw/Unentschieden-Rate
- Gewinn-Prozentsätze
- Durchschnittliche Züge pro Spiel
- Durchschnittliche und Gesamtdauer der Simulation

**Advanced Stats (optional):**
- Durchschnittliche Zugzeit pro Agent
- Maximum Zugzeit pro Agent
- Detaillierte Performance-Metriken

### 🎯 Konfigurierbare Parameter

Vor jeder Simulation kannst du folgende Parameter einstellen:
1. **Spiel-Typ**: Welche Tic-Tac-Toe-Variante spielen?
2. **Agent 1 (Blau)**: Welcher Agent spielt als Spieler 1?
3. **Agent 2 (Rot)**: Welcher Agent spielt als Spieler 2?
4. **Anzahl Spiele**: Wie viele Matches sollen simuliert werden? (1-10000)
5. **Erstes Spiel visualisieren**: Optional - zeigt das erste Match in Echtzeit
6. **Advanced Stats**: Optional - detaillierte Performance-Metriken anzeigen

## Nutzung

1. Öffne `/WolfsWorld/playground/arena.html` im Browser
2. Konfiguriere die Parameter
3. Klicke **"Arena starten"**
4. Warte auf die Simulation (mit Fortschritts-Anzeige)
5. Schau dir die Ergebnisse an

## Architektur

### Dateien

```
WolfsWorld/
├── playground/
│   └── arena.html                    # Haupt-UI Seite
├── js/ai/
│   ├── agent-profiles.js             # Vorkonfigurierte Agent-Profile
│   ├── arena-controller.js            # Haupt-Controller und Simulation-Engine
│   ├── game-adapter.js                # Spiel-Integrations-Adapter
│   ├── arena.js                       # Basis Arena-Klasse (erweitert)
│   ├── agents/                        # Agent-Implementierungen
│   │   ├── minimax-agent.js
│   │   ├── rule-based-agent.js
│   │   └── random-agent.js
│   └── ...
└── css/
    └── arena-playground.css           # Styling für Arena UI
```

### Kern-Klassen

#### `AgentProfiles`
- Definiert alle vorkonfigurierten Agent-Profilebasis
- `createAgentFromProfile(key)` - Factory zum Erstellen von Agenten

#### `ArenaSimulator`
- Führt Serien von Spielen durch
- Erfasst Statistiken und Time-Daten
- Unterstützt Replays des ersten Spiels

#### `TTTGameAdapter`
- Adapter-Pattern zwischen TTT-Boards und Arena
- Unified Interface für alle Spiel-Varianten
- Deep-Cloning für Game-States

#### `ArenaController`
- Orchestriert die UI
- Verwaltet Event-Listener
- Formatted Ergebnisse

## Technische Details

### Simulation-Flow

1. **Initialisierung**
   - Agenten aus Profilen erstellen
   - Game-Template klonen für jedes Spiel

2. **Spiel-Loop** (für jedes der N Spiele)
   - Spielzustand klonen
   - Solange Spiel läuft:
     - Agent fragen → Zugzeit messen
     - Zug ausführen
     - Spielerwechsel
   - Ergebnis speichern

3. **Statistik-Erfassung**
   - Win/Draw/Loss Counts
   - Move-Times für Performance-Analyse
   - Average Game Duration

4. **Ergebnis-Display**
   - Prozentuale Gewinn-Raten
   - Visual Cards für Übersicht
   - Optionale Advanced Stats

### Daten-Struktur: Game States

Alle Spiele implementieren ein gemeinsames Interface:

```javascript
{
  isGameOver: boolean,
  winner: 0|1|2|3,           // 0=laufend, 1=P1, 2=P2, 3=remis
  currentPlayer: 1|2,
  getAllValidMoves(): Array,
  makeMove(move): boolean,
  clone(): GameState
}
```

## Erweiterungsmöglichkeiten

### Neue Agent-Profile hinzufügen
Einfach ein neues Profil in `agent-profiles.js` hinzufügen:

```javascript
AgentProfiles.myCustomAgent = {
    name: "Mein Custom Agent",
    description: "Beschreibung",
    type: "minimax", // oder "ruleBased", "random"
    config: {
        // Typ-spezifische Config
    }
};
```

### Neue Spiele integrieren
1. Game-Adapter hinzufügen in `game-adapter.js`
2. Factory in `GameFactories` registrieren
3. HTML-Select aktualisieren

### Neue Agent-Typen
Siehe `/js/core/agent.js` - implementiere Interface und erstelle Factory-Funktion.

## Performance-Tipps

- **Suchtiefe reduzieren** für schnellere Tests (Minimax mit Tiefe 2)
- **Weniger Spiele** für schnelle Iterationen (z.B. 50 statt 1000)
- **Ultimate TTT** ist rechenintensiver als Regular
- Browser kann während Simulation nicht blockiert werden

## Known Limitations

- Visualisierung des Spielbretts ist Placeholder
- Ultimate TTT und 3D sind CPU-intensiv
- Sehr große Spielzahlen (>5000) können zu langsam sein

## Zukünftige Enhancements

- [ ] Echtzeit-Spiel-Visualisierung während Simulation
- [ ] Export Ergebnisse als CSV/JSON
- [ ] Tournament-Modus (Round-Robin)
- [ ] Elo-Rating System
- [ ] KI-Training auf Basis von Arena-Ergebnissen
- [ ] Replay-Visualizer für detaillierte Spielanalyse
- [ ] Custom Heuristics Editor

---

**Viel Spaß beim Trainieren deiner KI-Agenten!** 🚀
