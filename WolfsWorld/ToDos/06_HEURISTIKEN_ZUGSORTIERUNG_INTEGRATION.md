# ToDo 6: Weitere Heuristiken für Zugsortierung (Viz + KI-Agenten)

## Teil A: Beschreibung für den Entwickler

### Hintergrund
Die aktuelle Move-Ordering-Logik für Alpha-Beta ist funktional, aber begrenzt. Für bessere Performance und didaktische Qualität sollen weitere Heuristiken systematisch bewertet und integriert werden – sowohl in der Visualisierung als auch in KI-Agenten.

### Ziel
Erstelle eine fundierte Empfehlung zur Umsetzung zusätzlicher Zugsortierungs-Heuristiken inkl. Integrationskonzept in:
1. `minimax-viz` (sichtbar, erklärbar, vergleichbar),
2. KI-Agenten (effizient, wartbar, konfigurierbar),
3. bestehende `/ai/heuristics`-Struktur (kohärent und erweiterbar).

### Pflichtinhalte
- Bewertungsrahmen mit Kriterien (u. a. Nutzen, Laufzeitkosten, Implementierungsrisiko, Erklärbarkeit, Generalisierbarkeit).
- Priorisierte Heuristikliste mit klarer Empfehlung.
- Integrationskonzept in Viz inkl. Ideen zur Visualisierung des Heuristik-Effekts.
- Integrationskonzept in KI-Agenten inkl. API/Config/Runtime-Switches.
- Saubere Einordnung in `/ai/heuristics` (Ordner-/Modulstruktur).

### Verbindliche Konventionen
Bitte beachte zwingend: `/WolfsWorld/ENGINEERING_CONVENTIONS.md`.

---

## Teil B: Fertiger Prompt

**Kontext-Dateien (zwingend zuerst lesen):**
1. `/WolfsWorld/ENGINEERING_CONVENTIONS.md`
2. `/WolfsWorld/js/ai/heuristics/` (komplett)
3. `/WolfsWorld/js/viz/adapters/tree-adapters/alpha-beta-tree-adapter.js`
4. `/WolfsWorld/playground/minimax-viz.html`
5. `/WolfsWorld/js/config/constants.js`
6. `/WolfsWorld/js/config/debug-config.js`

**Aufgabe:**
Erarbeite eine konkrete Empfehlung zur Integration **weiterer Move-Ordering-Heuristiken** für Alpha-Beta – sowohl für die Visualisierung als auch für produktive KI-Agenten.

### 1) Heuristik-Kandidaten & Bewertung
- Bewerte mindestens diese Kandidaten:
  - History Heuristic,
  - Killer Moves,
  - MVV-LVA/Threat-first (spielabhängig),
  - Principal Variation Ordering,
  - Iterative Deepening als Ordering-Quelle,
  - domänenspezifische Muster (z. B. Center/Corner bei TTT).
- Nutze eine Entscheidungsmatrix mit Kriterien:
  - erwarteter Pruning-Gewinn,
  - Zusatzkosten,
  - Komplexität,
  - Stabilität,
  - Erklärbarkeit im Unterricht,
  - Wiederverwendung über Spiele hinweg.

### 2) Empfehlung (Pflicht)
- Liefere eine priorisierte Roadmap (MVP → Advanced).
- Begründe, welche Heuristiken zuerst implementiert werden sollen und welche später.
- Definiere Mindestanforderungen für Messbarkeit (z. B. Nodes visited/pruned, Laufzeit, Konsistenz).

### 3) Integration in minimax-viz
- Entwerfe Visualisierungsansätze für Heuristiken, z. B.:
  - angezeigte Reihenfolge vor/nach Heuristik,
  - erklärende Badges/Tooltips,
  - Vergleichsansicht ohne vs mit Heuristik,
  - didaktische Timeline der Bewertungsreihenfolge.
- Definiere UI-Schalter/Parameter für Heuristik-Auswahl und Intensität.

### 4) Integration in KI-Agenten
- Schlage eine API vor, wie Agenten Ordering-Strategien pluggable nutzen.
- Definiere Konfigurationsmodell für Agentprofile (z. B. „teaching“, „balanced“, „max-performance“).
- Beschreibe Fallback-Verhalten, wenn eine Heuristik für ein Spiel nicht unterstützt wird.

### 5) Einbindung in `/ai/heuristics`
- Entwerfe eine konsistente Struktur:
  - Basisschnittstellen,
  - spielagnostische Module,
  - spiel-/domänenspezifische Adapter,
  - Testdaten/Benchmarks.
- Zeige, wie bestehende Heuristik-Module migriert werden können, ohne harte Brüche.

### 6) Deliverables
1. Bewertungsmatrix mit Punktbewertung.
2. Priorisierte Umsetzungsempfehlung.
3. Ziel-API für Viz + Agenten.
4. Strukturvorschlag für `/ai/heuristics` inkl. Migrationsplan.
5. Mess-/Benchmark-Plan für Wirksamkeit.

### Qualitätskriterien
- Konventionen aus `/WolfsWorld/ENGINEERING_CONVENTIONS.md` strikt einhalten.
- Logging über `debug-config`, JSDoc vollständig, Parameter zentral in `constants.js`.
- Keine Magic Numbers neu einführen.
- Vorschläge müssen schrittweise und rückbaubar umsetzbar sein.
