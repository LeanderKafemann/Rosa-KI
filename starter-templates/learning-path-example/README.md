# 📚 Lernpfad Template: Minimax-Algorithmus

Ein komplettes Lernpfad-Beispiel, das Schüler direkt kopieren und anpassen können.

## 📋 Struktur

```
learning-path-example/
├── course.json          ← Kurs-Metadaten
├── lessons/
│   ├── 01-einführung.html          ← Interaktive Lektion mit Quiz
│   ├── 02-spielbäume.html          ← (Vorlage bereitgestellt)
│   ├── 03-min-max.html
│   ├── 04-algorithmus.html
│   ├── 05-optimierung.html
│   └── 06-projekt.html
├── exercises/
│   ├── 01-baum-visualisierung.js   ← Auto-graded exercise
│   ├── 02-minimax-einfach.js
│   ├── 03-pruning-optimization.js
│   ├── 04-alpha-beta.js
│   └── 05-tictactoe-ai.js
├── tests/
│   └── minimax.test.js             ← Jest Tests
├── README.md                        ← Deine Dokumentation
└── index.html                       ← Kurs-Navigation
```

## 🎯 Für Schüler: So verwendest du dieses Template

### 1️⃣ Kopiere den Ordner
```bash
cp -r starter-templates/learning-path-example SchülerProjekte/[DeinName]-minimax
cd SchülerProjekte/[DeinName]-minimax
```

### 2️⃣ Passe course.json an
```json
{
  "title": "Dein Thema",
  "author": "Dein Name",
  "lessons": [...]
}
```

### 3️⃣ Schreibe deine Lektionen
- **lessons/01-topic.html** - Neue interaktive Lektion
- Nutze das HTML-Template von Lektion 1 als Vorlage

### 4️⃣ Erstelle Übungen
- **exercises/01-task.js** - JavaScript-Aufgabe
- Mit Test-Funktionen zum Überprüfen

### 5️⃣ Tests schreiben
```bash
npm test
```

### 6️⃣ index.html als Hub
```html
<a href="lessons/01-einführung.html">📚 Lektion 1 starten</a>
<a href="exercises/01-task.html">✏️ Übung 1</a>
```

## 📖 Was ist in diesem Beispiel enthalten?

✅ **Lektion 1 - Vollständig:**
- Interaktive Erklärung mit Diagrammen
- 2 Quiz-Fragen mit Auto-Grading
- Lernziele und Key Insights
- Fortschritts-Tracker (localStorage)

⏳ **Lektionen 2-6 - Struktur vorgegeben:**
- Timing für jede Lektion
- Lernziele definiert
- Exercise IDs verlinkt
- Bereit zum Ausfüllen

⏳ **Exercises - Struktur im course.json:**
- 5 Übungen definiert
- Auto-Grading vorbereitet
- Tests-Vorlage bereitgestellt

## 🛠️ Deine Aufgaben als Schüler

1. **Lektion 1 durcharbeiten** ✅ (schon fertig!)
2. **HTML-Lektionen 2-6 ausfüllen:**
   - Kopiere Template von 01-einführung.html
   - Schreibe deine Erklärungen
   - Füge 2-3 Quiz-Fragen hinzu
3. **Übungen programmieren:**
   - Schreibe JavaScript-Code für jede Übung
   - Schreibe Tests
   - Selbst prüfen lassen
4. **Projekt implementieren:**
   - Minimax in JavaScript
   - Spielen gegen deine AI
   - Performance optimieren

## 📊 Bewertungs-Checkliste (für Lehrer)

- [ ] Alle 6 Lektionen vorhanden
- [ ] Jede Lektion hat 2-3 Fragen
- [ ] 5 Übungen implementiert
- [ ] Tests schreiben und bestanden
- [ ] index.html als Navigation funktioniert
- [ ] course.json korrekt formatiert
- [ ] README dokumentiert alle Inhalte
- [ ] Project funktioniert (Minimax-AI spielbar)

## 🚀 Nächste Schritte

1. Öffne lessons/01-einführung.html im Browser
2. Beantworte die Quiz-Fragen
3. Schreibe lessons/02-spielbäume.html
4. Schreibe exercises/01-baum-visualisierung.js
5. Teste deine Lösung mit tests/minimax.test.js

## 💡 Tipps

- **Kleine Schritte:** Pro Lektion 15-30 Minuten
- **Üben:** Jede Lektion sollte 1-2 Übungen haben
- **Testen:** Schreib Tests BEVOR du den Code schreibst (TDD)
- **Zeigen:** Wenn fertig, zeige dein Projekt (Demo + Code-Review)

---

**Viel Erfolg! 🎉**
