# ToDo 5: Weiterentwicklung minimax-viz zu generischen Bäumen

## Teil A: Beschreibung für den Entwickler

### Hintergrund
Die aktuelle minimax-viz ist stark auf TicTacToe/AB-Pruning zugeschnitten. Für kommende Themen (z. B. Warnsdorf, weitere spielartige oder nicht-spielartige Suchbäume) braucht es ein generisches, konfigurierbares Visualisierungskonzept.

### Ziel
Entwerfe ein belastbares Fach- und Technik-Konzept für die nächste Ausbaustufe „generische Bäume“, inklusive UI-/Metaparameter-Modell und sauberer Trennung zwischen:
- domänenspezifischer Logik,
- generischer Visualisierung,
- konfigurierbaren Darstellungsmodi.

### Pflichtinhalte
1. **Kontexte/Use-Cases**
   - Welche Varianten müssen unterstützt werden (u. a. Warnsdorf mit eigenem Farbschema/Statuslogik)?
2. **Feature-Scope**
   - Welche Features sind generisch, welche domänenspezifisch?
3. **Metaparameter-Modell**
   - Wie werden Parameter gespeichert, validiert, versioniert?
   - Welche Parameter global, welche pro Visualisierung?
4. **UI-Konzept**
   - Welche Parameter sollen auf der Seite einstellbar sein?
   - Option: rechter Bereich kontextabhängig statt starrer Statistik.
5. **ABP-spezifische Anzeige entkoppeln**
   - Wenn AB nicht aktiv ist, darf nicht dieselbe AB-spezifische Erklärung angezeigt werden.
   - Definiere Modus-spezifische Panels/States.

### Verbindliche Konventionen
Bitte beachte zwingend: `/WolfsWorld/ENGINEERING_CONVENTIONS.md`.

---

## Teil B: Fertiger Prompt

**Kontext-Dateien (zwingend zuerst lesen):**
1. `/WolfsWorld/ENGINEERING_CONVENTIONS.md`
2. `/WolfsWorld/playground/minimax-viz.html`
3. `/WolfsWorld/js/viz/` (relevante Adapter/Engine/Renderer/Status)
4. `/WolfsWorld/js/config/constants.js`
5. `/WolfsWorld/js/config/debug-config.js`

**Aufgabe:**
Erarbeite ein konkretes Weiterentwicklungskonzept, um `minimax-viz` von einer spezialisierten TTT/AB-Demo zu einer **generischen Baum-Visualisierungsoberfläche** auszubauen.

### 1) Kontextanalyse
- Erstelle eine Kontextmatrix für mindestens:
  - Minimax ohne AB,
  - Minimax mit AB,
  - Warnsdorf-ähnliche Heuristik-Visualisierung mit eigenem Farbschema,
  - mindestens einen weiteren generischen Suchbaum-Kontext.
- Definiere je Kontext:
  - notwendige Daten,
  - Status-/Farbsemantik,
  - Interaktionen,
  - Metriken.

### 2) Feature-Design (generisch vs spezifisch)
- Trenne klar zwischen:
  - Kernfeatures (für alle Bäume),
  - Profil-/Modusfeatures (nur für bestimmte Algorithmen/Visualisierungen).
- Liefere eine modulare Feature-Matrix.

### 3) Metaparameter-Architektur
- Definiere, wie Metaparameter gespeichert werden:
  - zentrale Parameter,
  - view-spezifische Parameter,
  - Laufzeit-Overrides.
- Schlage ein Schema vor (inkl. Validierung und Defaults).
- Zeige, wie Persistenz (optional) und Versionierung aussehen kann.

### 4) UI/UX-Konzept
- Entwerfe die UI-Logik für den rechten Bereich:
  - dynamische Panels je Modus,
  - konfigurierbare Parameter-Controls,
  - statistik-/erklärungszentrierte Ansicht umschaltbar.
- **Pflicht:** Wenn AB nicht aktiv ist, darf kein AB-spezifischer Text angezeigt werden.
  - Definiere klare Anzeigezustände und Bedingungen.

### 5) Integrationsstrategie
- Schlage eine inkrementelle Umsetzung in Phasen vor (ohne Hard-Break):
  - Phase 1: Datenmodell + Modus-Registry,
  - Phase 2: UI-Panel-Entkopplung,
  - Phase 3: neue Kontextprofile (inkl. Warnsdorf),
  - Phase 4: Stabilisierung/Tests.
- Für jede Phase: Scope, Risiken, Regression-Checks.

### 6) Deliverables
1. Zielarchitektur + Schnittstellen-Definitionen.
2. Modus-/Kontext-Registry-Design.
3. Parameter-Schema (zentral + pro Modus).
4. UI-State-Matrix inkl. AB aus/an Verhalten.
5. Umsetzungsschritte mit Testkriterien.

### Qualitätskriterien
- Konventionen aus `/WolfsWorld/ENGINEERING_CONVENTIONS.md` strikt einhalten.
- Logging-/JSDoc-/Konstanten-Policy berücksichtigen.
- Keine Magic Numbers neu einführen.
- Vorschläge müssen mit aktuellem Code schrittweise umsetzbar sein.
