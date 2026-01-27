# KI & Spiele Playground

Willkommen in der Dokumentation des KI-Lernprojekts. Dieses Projekt enthält verschiedene Spiele und KI-Agenten, um Algorithmen wie Minimax, Regelsysteme und Suchverfahren (BFS/DFS) zu demonstrieren.

## Verfügbare Spiele

### 1. Tic-Tac-Toe Universum
* **Klassik (3x3):** Standard Tic-Tac-Toe.
* **Ultimate:** Verschachteltes Tic-Tac-Toe (9 Boards in einem).
* **3D (3x3x3):** Räumliches Tic-Tac-Toe auf drei Ebenen.

### 2. RotateBox
Ein Puzzle-Spiel, bei dem die Schwerkraft durch Rotation manipuliert wird.
* Demonstriert Suchalgorithmen (BFS).
* Enthält einen Visualizer für den Suchbaum.

### 3. Springerproblem (Knight's Tour)
Finde einen Weg für den Springer über das gesamte Schachbrett.
* Demonstriert Backtracking und Heuristiken (Warnsdorf).

## KI-Labor
Im **Regel-Labor** können die Entscheidungsbäume der KIs interaktiv bearbeitet und visualisiert werden.

## Projektstruktur
* `js/core`: Basisklassen für Spiele und Agenten.
* `js/ai`: Implementierung der Agenten (Random, RuleBased) und Algorithmen.
* `js/games`: Spezifische Logik und Controller für die einzelnen Spiele.
* `js/viz`: Visualisierungstools (Bäume, Flowcharts).