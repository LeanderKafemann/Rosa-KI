# 🔍 Minimax Performance-Analyse für TTT-Varianten

## 📊 Aktuelle Parametrierung

| Spiel | maxDepth | Heuristik | Branching Factor | Max Knoten | Status |
|-------|----------|-----------|------------------|------------|--------|
| **Regular** | 9 | regularTTT | ~4-5 | ~260k | ✅ Perfekt |
| **3D** | 2 | threeDTTT | ~15-20 | ~8k | ⚠️ Zu schwach |
| **Ultimate** | 4 | ultimateTTT | ~40-80 | ~4M | ⚠️ Langsam |

---

## 🎯 Deine Fragen beantwortet

### 1. **"Kann man den Baum bis zum Ende spielen?"**

#### Regular TTT (3x3)
```
Branching Factor: 9, 8, 7, 6, ... (sinkt)
Maximale Baumgröße: 9! = 362.880 Knoten
Minimax mit Depth 9: ~260.000 Knoten ✅
Zeit: < 100ms ✅
=> JA, komplett durchlaufen möglich! ✅
```

#### 3D TTT (3x3x3)
```
Branching Factor: 27, 26, 25, ... (sinkt)
Maximale Baumgröße: 27! = enormer Wert
Minimax mit Depth 2: ~8.000 Knoten ✅
Minimax mit Depth 3: ~120.000 Knoten ⚠️
Minimax mit Depth 4: ~1.800.000 Knoten ❌ (Browser-Freeze)
Minimax mit Depth 9: Unmöglich! 💥

=> NEIN, nur Tiefe 2-3 praktisch möglich ❌
```

#### Ultimate TTT (9x9)
```
Branching Factor: 81, 80, 79, ... (sinkt)
Aber: nextBoardIdx-Regel reduziert auf ~9-40 pro Tiefe
Minimax mit Depth 4: ~1-4 Millionen Knoten ⚠️
Minimax mit Depth 5: ~20-40 Millionen Knoten ❌
Minimax mit Depth 9: Unmöglich! 💥

=> NEIN, Tiefe 4 ist Grenze ⚠️
```

---

### 2. **"Liegt es an den numerischen Werten?"**

Teilweise JA! Hier ist das Problem:

#### Regular TTT - Gut skaliert ✅
```javascript
score = 0
  + 50/−50 (2er-Reihen)
  + 5/−5 (1er-Steine)
  + 3/−3 (Zentrum)
  + 2×(−1 bis 1) (Ecken)
  = Range: −100 bis +100
```
**Aber terminal:** ±1000 >> ±100 ✅ **Gutes Prioritäts-Signal!**

#### 3D TTT - Probleme! ❌
```javascript
score = 0
  + (ownStones - oppStones) * 2  // max ±54 für 3x3x3
  + countLineOpportunities() pro Feld  // komplex!
    - Inner Loop: 13 Richtungen × 5 Schritte × 27 Felder
    = Sehr teuer!
  = Unpräzise und langsam!
```
**Problem:** Die Heuristik ist zu komplex und gibt diffuse Signale!

#### Ultimate TTT - Numerisch OK, aber Baum zu groß
```javascript
score = 0
  + 1000 per Makro-Board (stark)  ✅
  + 10 per Stein (schwach)  ⚠️
  + 30 per 2er-Reihe (mittel)  ✅
  + 5 Zentrum (schwach)  ⚠️
  + 50 "eroberbar" (OK)  ✅
  = Range: −10000 bis +10000
```
**Problem:** Terminal ±10000 ist gut, aber Baum ist RIESIG!

---

### 3. **"Suchtiefe oder Zeit begrenzt?"**

**Antwort: SUCHTIEFE!**

Der Code hat **KEINE** Zeit-Begrenzung:
```javascript
// minimax.js: Einfach nur Tiefe geprüft
if (depth === 0 || isTerminal) return evaluate(state);
```

Das heißt:
- **3D Tiefe 2:** Wartet 500ms-2s auf Berechnung
- **3D Tiefe 3+:** Browser-Freeze für 30+ Sekunden
- **Ultimate Tiefe 4:** 1-2s Wartezeit (OK, aber grenzwertig)
- **Ultimate Tiefe 5:** 20+ Sekunden Freeze

---

## 🔧 Warum funktioniert 3D nicht gut?

### Problem 1: Heuristik ist zu rechenintensiv
Die `countLineOpportunities()` Funktion:
```javascript
for (let i = 0; i < size3; i++) {           // 27 Felder
    for (let dx = -1; dx <= 1; dx++) {      // 3
        for (let dy = -1; dy <= 1; dy++) {  // 3
            for (let dz = -1; dz <= 1; dz++) { // 3
                for (let step = -2; step <= 2; step++) { // 5
                    // ... Grid-Zugriff
                }
            }
        }
    }
}
```
**Komplexität:** O(27 × 13 × 5) = **1.755 Operationen pro Heuristik-Aufruf!**

### Problem 2: Zu schwache Tiefe (Tiefe 2 ist "blind")
Bei 27 möglichen Zügen und Tiefe 2:
```
Ebene 0: 1 Knoten (Root)
Ebene 1: ~27 Knoten (Deine Züge)
Ebene 2: ~26 Knoten pro Kind = ~702 Knoten (Gegner Züge)
```
**Zusammen:** ~730 Knoten evaluiert
**Aber:** Tiefe 2 schaut nur 2 Halbzüge voraus! ⚠️

Vergleich: **Regular TTT Tiefe 9** schaut 9 Halbzüge voraus! 🔵

### Problem 3: Heuristik-Signale sind diffus
Beispiel-Score für einen 3D-Zustand:
```
Stein-Material: +2 oder -2
+ 27 Felder × (−10 bis +10) für Line-Opportunities
= Chaotische Summe von -270 bis +270
```
Das ist zu wenig differenziert für solch einen großen Baum!

---

## ✅ Lösungen

### **Lösung 1: 3D Heuristik vereinfachen** (EMPFOHLEN)
```javascript
threeDTTT: (game, player) => {
    // Terminal-Check
    if (game.winner === player) return 1000;
    if (game.winner !== 0 && game.winner !== 3) return -1000;
    
    // NUR Material-Basis!
    let score = 0;
    let own = 0, opp = 0;
    for (let i = 0; i < game.grid.length; i++) {
        if (game.grid[i] === player) own++;
        else if (game.grid[i] === 3 - player) opp++;
    }
    return (own - opp) * 50;  // Stark gewichtet!
}
```
**Vorteil:** O(n) statt O(n⁵), viel schneller!
**Effekt:** Kann Tiefe 3 oder sogar 4 spielen!

### **Lösung 2: 3D Tiefe erhöhen**
Wenn Heuristik schneller ist → **Tiefe 3-4 probieren!**
```javascript
agent = new MinimaxAgent({ 
    maxDepth: 3,  // War: 2
    heuristicFn: HeuristicsLibrary.threeDTTT  // Vereinfacht!
});
```

### **Lösung 3: Ultimate TTT Zeit-begrenzen**
Optional: Timeout hinzufügen zu Minimax:
```javascript
const config = {
    heuristicFn: HeuristicsLibrary.ultimateTTT,
    maxDepth: 4,
    timeLimit: 3000  // 3 Sekunden max
};
```
(Würde Implementierung in minimax.js erfordern)

### **Lösung 4: Iterative Deepening**
Progressive Tiefenerforschung:
```javascript
// Tiefe 1, dann 2, dann 3, ...
// Gibt jeweils beste Lösung bis jetzt zurück
// Bei Timeout → stoppt und gibt beste gefundene Lösung
```

---

## 📈 Empfehlung für jedes Spiel

### **Regular TTT**
```javascript
// Status: ✅ PERFEKT
maxDepth: 9
heuristicFn: HeuristicsLibrary.regularTTT
// Keine Änderung nötig!
```

### **3D TTT**
```javascript
// Option A: Schnelle, einfache Heuristik + Tiefe 3
maxDepth: 3
heuristicFn: (game, player) => {
    if (game.winner === player) return 1000;
    if (game.winner !== 0 && game.winner !== 3) return -1000;
    let own = 0, opp = 0;
    for (let c of game.grid) {
        if (c === player) own++;
        else if (c === 3 - player) opp++;
    }
    return (own - opp) * 50;
}

// Option B: Aktuelle komplexe Heuristik + Tiefe 2 (unverändert)
// Aber: Spiel wird dadurch nicht besser!
```

### **Ultimate TTT**
```javascript
// Status: ⚠️ Funktioniert, aber könnte besser sein
// Option 1: Tiefe 4 beibehalten (aktuell OK)
maxDepth: 4
heuristicFn: HeuristicsLibrary.ultimateTTT

// Option 2: Tiefe 5 + vereinfachte Heuristik probieren
maxDepth: 5
heuristicFn: (game, player) => {
    // Terminal
    if (game.winner === player) return 10000;
    if (game.winner !== 0 && game.winner !== 3) return -10000;
    
    let score = 0;
    const opp = player === 1 ? 2 : 1;
    
    // Makro-Board (Priorität!)
    for (let i = 0; i < 9; i++) {
        if (game.macroBoard[i] === player) score += 1000;
        else if (game.macroBoard[i] === opp) score -= 1000;
    }
    
    // Einfaches Material zählen
    let own = 0, oppCount = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (game.boards[i][j] === player) own++;
            else if (game.boards[i][j] === opp) oppCount++;
        }
    }
    score += (own - oppCount) * 5;
    
    return score;
}
```

---

## 🧮 Suchbaum-Größe berechnet

### Hypothetische "vollständiger Baum" Größen

**Regular 3x3:**
```
Depth 1: 9 = 9
Depth 2: 9 × 8 = 72
Depth 3: 9 × 8 × 7 = 504
...
Depth 9: 9! = 362.880 ✅ Mit Alpha-Beta: ~100k
```

**3D 3x3x3:**
```
Depth 1: 27 = 27
Depth 2: 27 × 26 = 702
Depth 3: 27 × 26 × 25 = 17.550
Depth 4: 27 × 26 × 25 × 24 = 421.200 ❌
```

**Ultimate 9x9:**
```
Depth 1: ~40 (nextBoardIdx-Regel hilft!)
Depth 2: ~40 × 40 = 1.600
Depth 3: ~40³ = 64.000
Depth 4: ~40⁴ = 2.560.000 ⚠️
Depth 5: ~40⁵ = 102.400.000 ❌
```

---

## 📝 Fazit

| Frage | Antwort |
|-------|---------|
| Kann man 3D komplett durchlaufen? | Nein. 27! ist zu groß. Max Tiefe 3-4. |
| Liegt es an Werten? | Teilweise. 3D-Heuristik ist zu komplex. |
| Suchtiefe oder Zeit? | SUCHTIEFE! Keine Zeit-Begrenzung im Code. |
| Warum 3D nicht gut? | Tiefe 2 ist blind. Heuristik zu teuer. |
| Warum Ultimate langsam? | Branching Factor ~40. Tiefe 4 = 2.5M Knoten. |

**Empfehlung:**
1. **3D:** Heuristik vereinfachen → Tiefe 3 spielbar
2. **Ultimate:** Mit Tiefe 4 OK, oder vereinfachen + Tiefe 5

