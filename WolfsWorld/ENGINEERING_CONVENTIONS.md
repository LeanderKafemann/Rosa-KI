# Engineering-Konventionen für WolfsWorld

Diese Konventionen gelten für alle neuen Features, Refactorings und Bugfixes.

## 1) Logging-Konvention
- Verwende zentrale Konfiguration aus `/WolfsWorld/js/config/debug-config.js`.
- Keine direkten `console.log/warn/error` in Feature-Code, außer als expliziter Fallback in zentralen Logger-Helfern.
- Logs sind immer einer Domain zugeordnet (`DEBUG_DOMAINS.*`).
- Debug-Logs strukturiert mit Payload-Objekten statt String-Konkatenation.

## 2) JSDoc-Konvention
- Jede öffentliche Funktion/Klasse hat JSDoc mit Parametern, Rückgabewert und kurzer Zweckbeschreibung.
- Bei komplexen Datenstrukturen Typen explizit machen (z. B. `Map<number, NodeData>`).
- Bei strategischen Entscheidungen kurze `@fileoverview`-Einordnung ergänzen.

## 3) Magic-Numbers vermeiden
- Keine neuen Hardcodes für fachliche/visuelle Parameter.
- Fachliche Konstanten nach `/WolfsWorld/js/config/constants.js`.
- Debug-Schalter nach `/WolfsWorld/js/config/debug-config.js`.
- Nur lokale, kurzlebige Zahlen zulässig, wenn sie unmittelbar algorithmisch begründet sind.

## 4) Zentrale Parameterhaltung
- Wiederverwendbare Parameter zentral halten (Config/Constants), nicht pro Feature duplizieren.
- Bei Visualisierungs-spezifischen Parametern: klarer Namensraum (z. B. `MINIMAX_VIZ_CONSTANTS.*`).
- Neue Parameter immer mit Fallbacks und klarer Ownership dokumentieren.

## 5) Refactoring-Sicherheit
- Refactoring in kleinen, testbaren Schritten mit Rückfallpunkten.
- Erst Verhalten absichern (Smoke-Tests/Regression-Checks), dann Struktur ändern.
- Jede Migration dokumentiert: "alt → neu", Abhängigkeiten, Risiken, Rollback.

## 6) Architektur-Prinzipien
- Klare Trennung zwischen:
  - Spiel-/Domänenlogik,
  - Adapter-/Orchestrierungslogik,
  - Rendering/UI,
  - Shared Utilities.
- Shared Utilities nur für wirklich querschnittliche Funktionen verwenden.
- Schnittstellen stabil und minimal halten; keine impliziten Seiteneffekte.

## 7) Lieferstandard
- Jede größere Änderung liefert:
  - kurze technische Doku,
  - Validierungs-Checkliste,
  - offene Punkte/Nächste Schritte.
