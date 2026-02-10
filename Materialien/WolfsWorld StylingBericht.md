# Styling-Analyse: WolfsWorld

> **Stand:** Automatisch generiert aus der Codebasis  
> **Zweck:** Überblick über die CSS-Architektur, Stylesheet-Nutzung und Inline-Styles aller Seiten

---

## 1. Übersicht CSS-Architektur

WolfsWorld nutzt eine **zweistufige Styling-Strategie**: eine zentrale CSS-Datei (`css/style.css`) für gemeinsame Komponenten und seitenspezifische Styles, die überwiegend als **Inline-`<style>`-Blöcke** direkt in den HTML-Dateien definiert sind.

```
css/style.css  (Zentrale Datei)
    ├── Alle Seiten binden sie ein
    │
css/tree-viz.css
    ├── rotatebox-viz.html
    ├── minimax-viz.html
    └── bfs-demo.html
    │
css/tictactoe.css
    ├── tictactoe-menu.html
    └── ttt-3d.html
    │
css/connect4.css
    ├── connect4-menu.html
    ├── connect4.html
    └── connect4-3d.html
    │
css/rotatebox.css
    └── rotatebox.html
    │
css/arena-playground.css
    └── Arena Playground (v2)
    │
Inline <style>-Blöcke
    └── Fast jede HTML-Seite
```

---

## 2. Zentrale CSS-Datei: `css/style.css`

Diese Datei ist das **Rückgrat** des gesamten Projekts und wird von **allen Seiten** per `<link rel="stylesheet" href="css/style.css">` (bzw. mit relativem Pfad `../css/style.css`) eingebunden.

### 2.1 Inhalt im Detail

| Bereich | Klassen / Selektoren | Beschreibung |
|---|---|---|
| **CSS Custom Properties** | `:root` | Farbvariablen: `--bg-color`, `--accent-blue`, `--accent-red`, `--accent-green`, `--accent-yellow`, `--text-main`, `--text-muted`, `--border-color`, `--sidebar-bg` |
| **Globales Body-Layout** | `body` | Flex-Layout, `height: 100vh`, `overflow: hidden`, Font-Stack |
| **Lab-Variante** | `body.lab-page` | `flex-direction: column` für Lab-Seiten |
| **Sidebar** | `.sidebar`, `.sidebar-header`, `.sidebar-content` | 320px breite Sidebar mit Flex-Column |
| **Game Area** | `.game-area` | Flex-Grow-Container, zentriert, Hintergrund `#dfe6e9` |
| **UI-Kontrollelemente** | `.control-section`, `.viz-label`, `.viz-select`, `.viz-input` | Einheitliche Formularelemente |
| **Buttons** | `.viz-btn`, `.btn-action`, `.btn-restart`, `.btn-danger`, `.btn-back` | Farbkodierte Buttons mit Hover-/Disabled-States |
| **Canvas** | `canvas` | Globale Canvas-Regeln (weißer Hintergrund, Schatten, `max-width: 95%`) |
| **Lab-Toolbar** | `.lab-toolbar` | Dunkle Toolbar (34495e), Flex mit Gap |
| **Lab-Grid** | `.lab-grid`, `.col-tree`, `.col-game` | Dreispalten-Layout für Lab-Seiten |
| **Panel-Header** | `.panel-header` | Kopfzeile für Panels |
| **Flowchart-Nodes** | `.fc-node`, `.fc-children`, `.fc-content`, `.fc-label`, `.fc-desc`, `.fc-branches`, `.fc-branch`, `.fc-branch-label` | Komplettes Regel-Baum-Styling inkl. Status-Klassen (`.checking`, `.success`, `.inactive`) |
| **Game-UI** | `.game-card`, `.view-controls`, `.view-btn`, `.log-box`, `.log-line` | Spielkarten, Ansicht-Buttons, Log-Ausgabe |
| **Stats** | `.stats-display` | Zentrierte Statistik-Anzeige |
| **Utility-Klassen** | `.flex-center`, `.flex-between`, `.flex-column`, `.text-center`, `.full-width`, `.hidden` | Allgemeine Helfer |

### 2.2 Farbpalette (CSS Custom Properties)

```css
:root {
    --bg-color: #f0f2f5;
    --sidebar-bg: #ffffff;
    --text-main: #2c3e50;
    --text-muted: #7f8c8d;
    --accent-blue: #3498db;
    --accent-blue-hover: #2980b9;
    --accent-red: #e74c3c;
    --accent-green: #2ecc71;
    --accent-yellow: #f1c40f;
    --border-color: #ddd;
}
```

### 2.3 Typografie

- **Font-Stack:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Wird global im `body`-Selektor gesetzt
- Teilweise lokal überschrieben (z.B. `font-family: monospace` für Log-Boxen)

### 2.4 Hinweis in der Datei

Die Datei enthält den Kommentar:

```
✅ NUTZE diese Klassen für neue Games/Playgrounds
❌ NICHT: Neue Inline-Styles schreiben
Siehe: WolfsWorld/CSS_GUIDELINES.md
```

> ⚠️ Die referenzierte Datei `CSS_GUIDELINES.md` existiert **nicht** im Projekt.

---

## 3. Spezialisierte Stylesheets

### 3.1 `css/tree-viz.css`

**Verwendet von:** `rotatebox-viz.html`, `minimax-viz.html`, `bfs-demo.html`

| Klasse | Zweck |
|---|---|
| `.viz-container` | Flex-Container mit Scroll & Drag-Cursor |
| `.viz-canvas` | Canvas-Element mit Schatten |
| `.viz-toolbar` | Dunkle Toolbar (#34495e) mit Flex-Layout |
| `.viz-control-group` | Inline-Gruppierung von Label + Input |
| `.viz-checkboxes`, `.viz-checkbox-label` | Checkbox-Styling |
| `.viz-stats` | Gelbe Stats-Anzeige, nach rechts geschoben |

### 3.2 `css/tictactoe.css`

**Verwendet von:** `tictactoe-menu.html`, `ttt-3d.html`

Enthält:
- Menü-Grid (`.ttt-grid`) für die Spielvarianten-Auswahl
- Game-Cards (`.game-card`) mit Hover-Effekt
- View-Controls und Size-Selector Buttons

### 3.3 `css/connect4.css`

**Verwendet von:** `connect4-menu.html`, `connect4.html`, `connect4-3d.html`

Enthält:
- Menü-Grid (`.c4-grid`) analog zu TTT
- Game-Cards (gleiche Struktur wie TTT)
- View-Controls für 3D-Ansicht

### 3.4 `css/rotatebox.css`

**Verwendet von:** `rotatebox.html`

Wird per `<link>` eingebunden, Details nicht direkt einsehbar — enthält vermutlich spielspezifische Styles.

### 3.5 `css/arena-playground.css`

**Verwendet von:** Arena Playground (alternative Version)

Enthält:
- Progress-Bars (`.progress-bar`, `.progress-fill`)
- Statistik-Cards (`.stat-card.blue`, `.stat-card.red`, `.stat-card.draw`)
- Modal-Dialoge (`.modal`, `.modal-content`)
- Responsive Media Queries (`@media max-width: 1024px`, `@media max-width: 768px`)
- **Einzige Datei mit Responsive Breakpoints** im ganzen Projekt

---

## 4. Seite-für-Seite-Analyse

### 4.1 Hauptseite

| Seite | Stylesheet-Links | Inline `<style>`? | Inline `style="..."`? | Umfang Inline |
|---|---|---|---|---|
| `index.html` | `style.css` | ✅ Ja | ✅ Ja | ~40 Zeilen: Hero-Section, Grid-Layout, Nav-Links |

**Details:** Definiert `.hero`, `.main-grid`, `.column`, `.column-header`, `.link-list`, `.nav-link` etc. komplett inline. Enthält auch `style="text-align: center; ..."` Attribute im HTML.

---

### 4.2 Spiele (`games/`)

| Seite | Stylesheet-Links | Inline `<style>`? | Inline `style="..."`? | Umfang Inline |
|---|---|---|---|---|
| `knights-tour.html` | `style.css` | ❌ Nein | ✅ Ja (vereinzelt) | Nur Attribute wie `style="width:100%"` |
| `rotatebox.html` | `style.css`, `rotatebox.css` | ✅ Ja | ✅ Ja | ~30 Zeilen: Container, Menü, Canvas-Begrenzung |
| `tictactoe-menu.html` | `style.css`, `tictactoe.css` | ✅ Ja | ✅ Ja | ~10 Zeilen: Body-Override, Container |
| `ttt-regular.html` | `style.css` | ❌ Nein | ❌ Nein | Nur globale Klassen |
| `ttt-3d.html` | `style.css`, `tictactoe.css` | ✅ Ja | ❌ Nein | ~15 Zeilen: Split-View (`.game-split`, `.main-view`, `.side-view`) |
| `ttt-ultimate.html` | `style.css` | ❌ Nein | ✅ Ja (vereinzelt) | Nur `style="margin-top:10px"` etc. |
| `connect4-menu.html` | `style.css`, `connect4.css` | ✅ Ja | ✅ Ja | ~10 Zeilen: Body-Override, Container |
| `connect4.html` | `style.css`, `connect4.css` | ❌ Nein | ❌ Nein | Nur globale Klassen |
| `connect4-3d.html` | `style.css`, `connect4.css` | ❌ Nein | ✅ Ja (vereinzelt) | Info-Box inline gestylt |

---

### 4.3 Playground (`playground/`)

| Seite | Stylesheet-Links | Inline `<style>`? | Inline `style="..."`? | Umfang Inline |
|---|---|---|---|---|
| `rotatebox-viz.html` | `style.css`, `tree-viz.css` | ✅ Ja | ❌ Nein | ~5 Zeilen: Body-Override |
| `minimax-viz.html` | `style.css`, `tree-viz.css` | ✅ Ja | ❌ Nein | ~10 Zeilen: Slider, Step-Display |
| `rules-lab.html` | `style.css` | ✅ Ja | ✅ Ja | **~60 Zeilen:** `.col-game` Override, `.canvas-container`, komplettes Flowchart-Styling (`.fc-node`, `.fc-content`, `.fc-children` etc.) |
| `arena.html` | `style.css` | ✅ Ja | ✅ Ja (häufig) | **~100 Zeilen:** Toolbar-Layout, Stats-Box, Minimax-Panel, Random-Mascot etc. |

> ⚠️ **`rules-lab.html`** definiert `.fc-node`-Styles, die bereits in `style.css` vorhanden sind — teilweise mit abweichenden Werten (z.B. andere `padding`, `border-radius`). Dies führt zu **Doppeldefinitionen**.

---

### 4.4 Lernpfade (`learning/`)

| Seite | Stylesheet-Links | Inline `<style>`? | Inline `style="..."`? | Umfang Inline |
|---|---|---|---|---|
| `viewer.html` | `style.css` | ✅ Ja | ❌ Nein | ~40 Zeilen: Sidebar, Content-Area, Nav-Bar |
| `modules/search/bfs-demo.html` | `style.css`, `tree-viz.css` | ✅ Ja | ❌ Nein | ~10 Zeilen: Layout, Canvas |
| `modules/search/01-interactive.html` | *(keine externen)* | ✅ Ja | ❌ Nein | **~50 Zeilen: Komplett eigenständig!** |

> ⚠️ **`01-interactive.html`** bindet **kein einziges externes Stylesheet** ein. Alle Styles (Body, Container, Canvas, Controls, Stats) sind inline definiert. Diese Seite ist vollständig vom restlichen Design-System isoliert.

---

## 5. Häufige Inline-`style`-Attribute im HTML

Trotz der Guideline in `style.css` („❌ NICHT: Neue Inline-Styles schreiben") werden HTML-Inline-Styles häufig verwendet:

| Muster | Beispiel | Vorkommen |
|---|---|---|
| Margins/Paddings | `style="margin-top:20px;"` | Sehr häufig |
| Layout-Overrides | `style="display:flex; gap:10px;"` | Häufig |
| Farben | `style="color:#888;"`, `style="border-left: 5px solid #3498db;"` | Häufig |
| Breiten | `style="width: 80px;"`, `style="width: 100%;"` | Häufig |
| Sichtbarkeit | `style="opacity: 0.5; cursor: default;"` | Vereinzelt |
| Komplexe Styles | `style="text-align: center; margin-top: 40px; color: #bdc3c7;"` | Vereinzelt |

---

## 6. Dokumentation (`docs/`)

Die JSDoc-generierte Dokumentation nutzt ein **komplett separates Styling-System** (docdash-Theme):

| Datei | Zweck |
|---|---|
| `docs/styles/jsdoc.css` | Hauptstylesheet der Doku |
| `docs/styles/jsdoc-default.css` | Fallback-Styles |
| `docs/styles/prettify.css` | Syntax-Highlighting |

Eigene Webfonts: Montserrat, Source Sans Pro, Open Sans

> Diese Styles haben **keinen Einfluss** auf die Anwendung und sind rein für die API-Dokumentation.

---

## 7. Zusammenfassung: Welche Seite nutzt welche Stylesheets?

| Seite | `style.css` | `tree-viz.css` | `tictactoe.css` | `connect4.css` | `rotatebox.css` | Eigene Inline-Styles |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `index.html` | ✅ | | | | | ✅ (~40 Z.) |
| `knights-tour.html` | ✅ | | | | | ❌ |
| `rotatebox.html` | ✅ | | | | ✅ | ✅ (~30 Z.) |
| `tictactoe-menu.html` | ✅ | | ✅ | | | ✅ (~10 Z.) |
| `ttt-regular.html` | ✅ | | | | | ❌ |
| `ttt-3d.html` | ✅ | | ✅ | | | ✅ (~15 Z.) |
| `ttt-ultimate.html` | ✅ | | | | | ❌ |
| `connect4-menu.html` | ✅ | | | ✅ | | ✅ (~10 Z.) |
| `connect4.html` | ✅ | | | ✅ | | ❌ |
| `connect4-3d.html` | ✅ | | | ✅ | | ❌ |
| `rotatebox-viz.html` | ✅ | ✅ | | | | ✅ (~5 Z.) |
| `minimax-viz.html` | ✅ | ✅ | | | | ✅ (~10 Z.) |
| `rules-lab.html` | ✅ | | | | | ✅ (~60 Z.) |
| `arena.html` | ✅ | | | | | ✅ (~100 Z.) |
| `viewer.html` | ✅ | | | | | ✅ (~40 Z.) |
| `bfs-demo.html` | ✅ | ✅ | | | | ✅ (~10 Z.) |
| `01-interactive.html` | ❌ | | | | | ✅ (~50 Z.) |

---

## 8. Bewertung

### ✅ Stärken

- **Zentrale Datei** mit CSS Custom Properties sorgt für ein konsistentes Farbschema über alle Seiten
- **Wiederverwendbare Komponenten** (`.viz-btn`, `.viz-select`, `.sidebar`, `.game-area`) reduzieren Redundanz
- Klare Trennung zwischen **Sidebar-Pages** und **Lab-Pages** über die CSS-Klasse `body.lab-page`
- Einheitliche Button-Systematik mit farbkodierten Varianten

### ⚠️ Schwächen

| Problem | Betroffene Seiten |
|---|---|
| **Inline-`<style>`-Blöcke in ~60 % der Seiten** — widerspricht den eigenen Guidelines | Fast alle |
| **Duplizierte Regeln** für `.fc-node`-Styles | `style.css` vs. `rules-lab.html` |
| **Komplett isolierte Seite** ohne externe Stylesheets | `01-interactive.html` |
| **Kein responsives Design** in der Hauptanwendung | Alle außer `arena-playground.css` |
| **Fehlende `CSS_GUIDELINES.md`** — wird referenziert, existiert aber nicht | — |
| **Häufige HTML-Inline-Attribute** (`style="..."`) trotz Anti-Pattern-Warnung | `index.html`, `arena.html`, `rotatebox.html` u.a. |

### 💡 Verbesserungsvorschläge

1. **Inline-`<style>`-Blöcke auslagern** — z.B. in `css/pages/index.css`, `css/pages/arena.css` etc.
2. **Inline-Attribute (`style="..."`) durch Klassen ersetzen** — z.B. `style="margin-top:20px"` → `.mt-20`
3. **Fehlende `CSS_GUIDELINES.md` erstellen** oder den Verweis in `style.css` entfernen
4. **Duplizierte Flowchart-Styles entfernen** — `rules-lab.html` sollte die Definitionen aus `style.css` nutzen
5. **`01-interactive.html` an das Design-System anbinden** — `style.css` einbinden
6. **Media Queries ergänzen** — mindestens Tablet- und Mobile-Breakpoints in `style.css`
7. **Utility-Klassen erweitern** — für häufig genutzte Inline-Patterns (Margins, Gaps, Widths)
