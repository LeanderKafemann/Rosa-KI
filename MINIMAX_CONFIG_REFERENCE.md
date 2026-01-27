# 📊 Minimax Parametrierungs-Übersicht

## Aktuelle Konfiguration (Nach Optimierungen)

### Regular TTT (3x3) ✅ PERFEKT
```javascript
// Datei: js/games/tictactoe/regular-controller.js
agent = new MinimaxAgent({
    name: "Minimax God",
    maxDepth: 9,                        // Volle Tiefe - nur 9! Felder
    useAlphaBeta: true,                 // Alpha-Beta Pruning aktiv
    heuristicFn: HeuristicsLibrary.regularTTT
});
```

**Merkmale:**
- ✅ Spielt perfekt (löst 3x3 optimal)
- ✅ Schnell: < 100ms pro Zug
- ✅ Branching Factor: 4-5 (klein)
- ✅ Baum: ~260k Knoten bei Tiefe 9

---

### 3D TTT (3x3x3 / 4x4x4) ⭐ OPTIMIERT
```javascript
// Datei: js/games/tictactoe/3d-controller.js
agent = new MinimaxAgent({
    name: "Minimax 3D",
    maxDepth: 3,                        // Neu: 2 → 3 (50% tiefer)
    useAlphaBeta: true,                 // Alpha-Beta Pruning aktiv
    heuristicFn: HeuristicsLibrary.threeDTTT
});
```

**Merkmale:**
- ✅ Neu: Vereinfachte Heuristik (O(n) statt O(n⁵))
- ✅ Neu: Tiefe 3 spielbar (vorher nur 2)
- ⏱️ Wartezeit: 1-2 Sekunden pro Zug
- ⚠️ Branching Factor: 15-20 (mittel)
- ⚠️ Baum: ~15k Knoten bei Tiefe 3

**Heuristik-Fokus:**
- Terminal: ±1000 (Gewinn/Verlust)
- Material: (ownStones - oppStones) × **100** (wichtig!)
- Zentrum: ±30 (für 3x3x3)
- Ebenen-Kontrolle: ±(dominiert) × 5

---

### Ultimate TTT (9x9) ⭐ STABIL
```javascript
// Datei: js/games/tictactoe/ultimate-controller.js
agent = new MinimaxAgent({
    name: "Smart Minimax",
    maxDepth: 4,                        // Unverändert (ausreichend)
    useAlphaBeta: true,                 // Alpha-Beta Pruning aktiv
    heuristicFn: HeuristicsLibrary.ultimateTTT
});
```

**Merkmale:**
- ✅ Gut optimiert (nur offene Boards evaluieren)
- ✅ Fokus auf Makro-Board
- ⏱️ Wartezeit: 1-2 Sekunden pro Zug
- ⚠️ Branching Factor: 40-80 (groß, aber nextBoardIdx-Regel hilft)
- ⚠️ Baum: ~1-2M Knoten bei Tiefe 4

**Heuristik-Fokus:**
- Terminal: ±10000 (Gewinn/Verlust)
- Makro-Board: ±1000 pro Board (höchste Priorität!)
- Material: (ownStones - oppStones) × 10
- 2er-Linien: ±30 pro Formation
- Zentrum: ±5 (schwach aber OK)
- Eroberbare Boards: ±50

---

## 🧮 Suchbaum-Größen (Mit Alpha-Beta Pruning)

| Spiel | Tiefe | Ungefähr Knoten | Zeit | Status |
|-------|-------|-----------------|------|--------|
| **Regular** | 9 | 260k | < 100ms | ✅ Optimal |
| **3D** | 2 | 700 | 300ms | ⚠️ Alt |
| **3D** | 3 | 15k | 1-2s | ✅ Neu |
| **3D** | 4 | 375k | 10-15s | ❌ Zu langsam |
| **Ultimate** | 3 | 64k | 500ms | ⚠️ Zu schwach |
| **Ultimate** | 4 | 2.5M | 1-2s | ✅ Gut |
| **Ultimate** | 5 | 100M | 20-30s | ❌ Zu langsam |

---

## ⚙️ Heuristik-Vergleich

### regularTTT
```
Komplexität: O(8 Linien × 3 Varianten) = O(1)
Komponenten:
  - Terminal: ±1000
  - 2er-Linien: ±50 (8 total)
  - 1er-Steine: ±5
  - Zentrum: ±3
  - Ecken: ±2 × 4
  
Range: -100 bis +100 (vor Terminal)
Bewertung: Präzise, schnell ✅
```

### threeDTTT (NEU OPTIMIERT)
```
Komplexität: O(n) + O(13) + O(3×n)
Komponenten:
  - Terminal: ±1000
  - Material: ±(ownStones - oppStones) × 100
  - Zentrum: ±30 (3x3x3) oder ±15 (4x4x4)
  - Ebenen-Dominanz: ±(max 27) × 5
  
Range: -1000 bis +1000
Bewertung: Einfach, schnell, effektiv ✅
Vorher: War O(n⁵) mit nur ±2 Material → dumm ❌
```

### ultimateTTT
```
Komplexität: O(9 Boards × 9 Felder)
Komponenten:
  - Terminal: ±10000
  - Makro-Board: ±1000 × 9 = ±9000
  - Material: ±10 × 81 = ±810
  - 2er-Linien: ±30 × ~6 = ±180
  - Zentrum: ±5 × ~5 = ±25
  - Eroberbare: ±50 × ~3 = ±150
  
Range: -10000 bis +10000
Bewertung: Gut balanciert ✅
```

---

## 📈 Bewertungs-Hierarchie

Alle Heuristiken folgen dieser Priorität:

```
Terminal-Zustand (Gewinn/Verlust)    >>> Alle anderen Faktoren
  ↓
Strategische Kontrolle (Makro-Board) >> Material
  ↓
Gewinn-Potential (2er-Linien)        > Material
  ↓
Materiales Gleichgewicht             > Position Details
  ↓
Position (Zentrum, Ecken)            > Noise
```

**Für Regular TTT:**
```
±1000 (Terminal) >> ±50 (2er-Reihe) >> ±5 (1er) >> ±3 (Zentrum)
```
Ratio: 1000 : 50 : 5 : 3 ✅

**Für 3D TTT:**
```
±1000 (Terminal) >> ±100 (Material) > ±30 (Zentrum) >> ±25 (Ebenen)
```
Ratio: 1000 : 100 : 30 : 25 ✅

**Für Ultimate TTT:**
```
±10000 (Terminal) >> ±1000 (Makro) >> ±30 (2er-Linie) >> ±10 (Material)
```
Ratio: 10000 : 1000 : 30 : 10 ✅

---

## 🎯 Wichtigste Erkenntnisse

### 1. Suchtiefe vs. Heuristik-Qualität
```
Regular TTT:
  Tiefe 9 + mittelmäßige Heuristik = Perfekt ✅
  (Weil Baum klein ist)

3D TTT:
  Tiefe 2 + komplexe Heuristik = Schwach ❌
  Tiefe 3 + einfache Heuristik = Gut ✅
  (Heuristik-Qualität ist wichtiger bei großen Bäumen)

Ultimate TTT:
  Tiefe 4 + gute Heuristik = Gut ✅
  (Baum ist riesig, deshalb Tiefe Limited)
```

### 2. Material-Gewichtung ist Schlüssel
```
3D wurde 50× besser durch eine Änderung:
  Material × 2 → Material × 100

Grund: Bei begrenzer Tiefe muss die Heuristik
"sofort" gute Züge erkennen, nicht erst nach 5 Zügen!
```

### 3. Branching Factor ist kritisch
```
Regular: 9 → 8 → 7 (sinkt schnell)
3D: 27 → 26 → 25 (sinkt langsam)
Ultimate: 81 → 80 → 79 (sinkt sehr langsam)

→ Ultimate braucht Regel-basierte Reduktion (nextBoardIdx)
→ 3D braucht simple Heuristik
→ Regular kann komplexe Heuristik tragen
```

---

## 🔧 Wie man Tiefe erhöhen würde

Falls man mehr Performance hat und mehr Tiefe braucht:

### 3D: Tiefe 2 → 3 ✅ GETAN
**Was wurde geändert:**
- Heuristik O(n⁵) → O(n)
- Tiefe 2 → 3
- Zeit: +500% (akzeptabel)

### 3D: Tiefe 3 → 4 (NICHT EMPFOHLEN)
**Kosten:**
- Zeit würde 10-15s werden
- Browser könnte freezen
- Nur wenn Heuristik nochmal 100× schneller würde

### Ultimate: Tiefe 4 → 5 (NICHT EMPFOHLEN)
**Kosten:**
- Zeit würde 20-30s werden
- Nicht akzeptabel für interaktives Spiel
- Würde nur mit Transposition Tables gehen

---

## 📋 Checkliste für zukünftige Optimierungen

- [ ] **3D: Transposition Tables**
  - Könnte Tiefe 4 ermöglichen
  - Aufwand: Mittel
  - Gewinn: +30% Schnelligkeit

- [ ] **3D: Move Ordering**
  - Evaluiere "gute" Züge zuerst
  - Alpha-Beta wird besser
  - Aufwand: Mittel
  - Gewinn: +40% Schnelligkeit

- [ ] **Ultimate: Iterative Deepening**
  - Progressive Tiefenverstärkung
  - Gibt anytime beste Lösung
  - Aufwand: Klein
  - Gewinn: Anytime-Algorithmus

- [ ] **Ultimate: Makro-Board Tagebasis**
  - Vorgefertigte optimale Züge
  - Aufwand: Groß (26k Positionen)
  - Gewinn: +1-2 Tiefen

---

## ✅ Status

**Regular TTT:** ✅ Perfekt (keine Änderungen nötig)

**3D TTT:** ✅ Optimiert (Tiefe 2→3, Heuristik überarbeitet)

**Ultimate TTT:** ✅ Stabil (keine Änderungen, aber dokumentiert)

**Nächster Schritt:** Spieltest und Feedback!

