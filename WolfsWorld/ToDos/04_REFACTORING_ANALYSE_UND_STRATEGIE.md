# ToDo 4: Refactoring-Analyse Viz-Architektur & sichere Migrationsstrategie

## Teil A: Beschreibung für den Entwickler

### Hintergrund
In der letzten Entwicklungsphase sind viele neue Bausteine für Minimax-/AB-Visualisierung entstanden (u. a. `tree-analysis-utils.js`, neue Status-/Adapter-Logik, zusätzliche UI- und Statistikpfade). Das System funktioniert, wirkt aber in Teilen nicht sauber abgegrenzt.

### Ziel
Führe eine gründliche Refactoring-Analyse für den gesamten Viz-Bereich durch und entwickle eine mehrstufige, testbare Strategie für eine sichere Migration ohne Funktionsverlust.

### Kernfragen
1. **Redundanzen und Verantwortlichkeiten**
   - Welche Funktionen/Blöcke sind doppelt oder zu ähnlich?
   - Welche Logik ist an der falschen Schicht (Adapter, Engine, Renderer, Shared Utils, UI)?
2. **`tree-analysis-utils.js` Einordnung**
   - Soll die Datei erweitert werden (zentrale Analyse-/Statistik-Utilities)?
   - Oder sollen die zwei Funktionen in ein bestehendes Modul verschoben werden?
   - Welche API ist langfristig stabil für mehrere Visualisierungen?
3. **Ordnerstruktur & Hierarchie**
   - Prüfe, ob Adapter unter `/tree-viz` besser aufgehoben sind.
   - Definiere eine klare Zielstruktur für kommende Visualisierungen.
4. **Schnittstellen für Zukunft**
   - Welche stabilen Interfaces braucht es für neue Spiele/Heuristiken/Visualisierungen?
   - Wie lassen sich gemeinsame Teile generisch wiederverwenden?
5. **Zentrale Statistik-Util**
   - Bewerte, ob eine allgemeine Statistik-Utility für mehrere Viz-Einheiten sinnvoll ist.
   - Definiere Kriterien (Kohäsion, Kopplung, Performance, Erweiterbarkeit, Testbarkeit).

### Ergebnisanforderung
- Architekturbericht mit Ist-Analyse, Zielbild, Trade-offs.
- Konkreter Migrationsplan in testbaren Schritten inkl. Rollback-Strategie.
- Risiko-Matrix mit Priorisierung.
- Vorschläge für minimale, sichere erste Refactoring-Welle.

### Verbindliche Konventionen
Bitte beachte zwingend: `/WolfsWorld/ENGINEERING_CONVENTIONS.md`.

---

## Teil B: Fertiger Prompt

**Kontext-Dateien (zwingend zuerst lesen):**
1. `/WolfsWorld/ENGINEERING_CONVENTIONS.md`
2. `/WolfsWorld/playground/minimax-viz.html`
3. `/WolfsWorld/js/viz/` (komplett, inkl. Adapter/Engines/Features/Config/Shared)
4. `/WolfsWorld/js/config/constants.js`
5. `/WolfsWorld/js/config/debug-config.js`

**Aufgabe:**
Erstelle eine tiefgehende **Refactoring-Analyse** für den Viz-Stack und liefere eine **mehrschrittige, testbare Migrationsstrategie**, die Funktionsabbrüche minimiert.

### 1) Ist-Analyse (verpflichtend)
- Mappe die aktuelle Verantwortungsverteilung zwischen:
  - Adaptern,
  - Tree Engine/Features/Renderer,
  - UI (`minimax-viz.html`),
  - Shared Utilities (`tree-analysis-utils.js`),
  - Konfigurationsquellen (`constants.js`, `debug-config.js`).
- Identifiziere Redundanzen und Schichtverletzungen.
- Kennzeichne Stellen mit impliziten Verträgen und fragiler Kopplung.

### 2) Zielarchitektur
- Entwerfe ein klares Zielbild mit sauberer Schichtung.
- Bewerte explizit, ob Adapter in `/tree-viz` integriert werden sollen (mit Vor-/Nachteilen, Migrationskosten, Breaking-Risiken).
- Definiere stabile Interfaces für:
  - Knoten-/Baumdaten,
  - Status-/Styling,
  - Statistiken,
  - Eventing (UI ↔ Adapter ↔ Tree Engine).

### 3) Entscheidungsanalyse `tree-analysis-utils.js`
- Beurteile:
  - Erweiterung zur zentralen Statistik-/Analyse-Utility **oder**
  - Aufteilung/Verlagerung in bestehende Module.
- Liefere eine konkrete Empfehlung mit Begründung (Kohäsion/Kopplung/Wiederverwendung/Testbarkeit).
- Schlage eine API vor, die für andere Viz-Einheiten wiederverwendbar ist.

### 4) Testbare Migrationsstrategie (Pflicht)
Erstelle einen Plan in kleinen Schritten mit:
- Ziel je Schritt,
- konkrete Code-Änderungen,
- Regression-Checks pro Schritt,
- Rollback-Option.

Plan muss enthalten:
- Baseline-Absicherung (Smoke-Tests/Verhaltenschecklisten),
- Strangler-Pattern oder Adapter-Fassade für Übergangsphase,
- schrittweises Umhängen von Utilities und Schnittstellen,
- Abschlusskriterien pro Phase.

### 5) Deliverables
1. Architekturbericht (Ist/Ziel/Trade-offs).
2. Priorisierte Refactoring-Roadmap (3 Wellen: kurzfristig/mittelfristig/langfristig).
3. Konkrete PR-Slicing-Empfehlungen (kleine, reviewbare Pakete).
4. Test-/Validierungsmatrix.
5. Entscheidungsvorlage zur zentralen Statistik-Utility.

### Qualitätskriterien
- Konventionen aus `/WolfsWorld/ENGINEERING_CONVENTIONS.md` strikt einhalten.
- Keine Magic Numbers neu einführen.
- Logging über `debug-config`-Domains denken.
- JSDoc und zentrale Parameterhaltung berücksichtigen.
- Ergebnis so formulieren, dass direkt implementierbar.
