/**
 * @fileoverview Visualisiert Regelbäume als interaktives Flowchart.
 * Nutzt DOM-Elemente für Styling (Karten, Farbbalken).
 */

class FlowchartVisualizer {
    /**
     * @param {string} containerId - DOM ID des Containers.
     * @param {DecisionTree} tree - Der Regelbaum.
     * @param {function} toggleCallback - Callback(ruleName).
     */
    constructor(containerId, tree, toggleCallback) {
        this.container = document.getElementById(containerId);
        this.tree = tree;
        this.onToggle = toggleCallback;
        this.prefix = containerId;
    }

    render() {
        if (!this.container || !this.tree) return;
        this.container.innerHTML = '';
        this._renderNode(this.tree.root, this.container);
    }

    _renderNode(node, parentEl) {
        if (!node) return;

        // Haupt-Karte erstellen
        const card = document.createElement('div');
        card.className = 'fc-node';
        // ID für Highlighting: containerId-Regelname
        card.id = `${this.prefix}-${node.name.replace(/\s+/g, '-')}`;

        // Typen-Klassen
        if (!node.active) card.classList.add('inactive');
        if (node.children) card.classList.add('fc-type-group');
        if (node.conditionFn) card.classList.add('fc-type-cond');

        // Inhalt (Checkbox + Titel)
        const content = document.createElement('div');
        content.className = 'fc-content';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = node.active;
        checkbox.onclick = (e) => {
            e.stopPropagation(); 
            if (this.onToggle) this.onToggle(node.name);
        };

        const label = document.createElement('span');
        label.className = 'fc-label';
        // Icons
        let icon = '⚡'; // Atomic
        if (node.children) icon = '📂';
        if (node.conditionFn) icon = '◇';
        
        label.innerHTML = `${icon} ${node.name}`;

        content.appendChild(checkbox);
        content.appendChild(label);
        card.appendChild(content);

        // Beschreibung
        if (node.description) {
            const desc = document.createElement('div');
            desc.className = 'fc-desc';
            desc.innerText = node.description;
            card.appendChild(desc);
        }

        parentEl.appendChild(card);

        // --- REKURSION FÜR KINDER ---

        // Fall 1: Verzweigung (Condition) -> Nebeneinander
        if (node.conditionFn) {
            const branchContainer = document.createElement('div');
            branchContainer.className = 'fc-branches';

            // Ja-Zweig
            if (node.thenNode) {
                const branchYes = document.createElement('div');
                branchYes.className = 'fc-branch';
                branchYes.innerHTML = '<div class="fc-branch-label">JA</div>';
                this._renderNode(node.thenNode, branchYes);
                branchContainer.appendChild(branchYes);
            }

            // Nein-Zweig
            if (node.elseNode) {
                const branchNo = document.createElement('div');
                branchNo.className = 'fc-branch';
                branchNo.innerHTML = '<div class="fc-branch-label">NEIN</div>';
                this._renderNode(node.elseNode, branchNo);
                branchContainer.appendChild(branchNo);
            }
            parentEl.appendChild(branchContainer);
        }
        // Fall 2: Gruppe -> Untereinander (eingerückt)
        else if (node.children && node.children.length > 0) {
            const childContainer = document.createElement('div');
            childContainer.className = 'fc-children';
            node.children.forEach(child => {
                this._renderNode(child, childContainer);
            });
            parentEl.appendChild(childContainer);
        }
    }

    // --- HIGHLIGHTING API ---

    highlightCheck(name) {
        this._setClass(name, 'checking');
    }

    highlightSuccess(name) {
        this._setClass(name, 'success');
    }

    clearHighlights() {
        this.container.querySelectorAll('.checking, .success').forEach(el => {
            el.classList.remove('checking', 'success');
        });
    }

    _setClass(name, cls) {
        const id = `${this.prefix}-${name.replace(/\s+/g, '-')}`;
        const el = document.getElementById(id);
        if (el) {
            // Alte Klassen entfernen, um Konflikte zu vermeiden
            el.classList.remove('checking', 'success');
            el.classList.add(cls);
            // Auto-Scroll, damit man sieht, wo die KI ist
            if (cls === 'checking') {
                el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }
    }
}