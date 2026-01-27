/**
 * @fileoverview Visualisiert einen DecisionTree als interaktive HTML-Liste.
 * Ermöglicht das An/Abschalten von Regeln per Checkbox.
 */

class RuleVisualizer {
    /**
     * @param {string} containerId - ID des HTML Containers.
     * @param {DecisionTree} tree - Der Baum.
     * @param {function} toggleCallback - Wird gerufen, wenn Checkbox geklickt.
     */
    constructor(containerId, tree, toggleCallback) {
        this.container = document.getElementById(containerId);
        this.tree = tree;
        this.onToggle = toggleCallback; 
        this.prefix = containerId; 
    }

    render() {
        if (!this.container || !this.tree) return;
        this.container.innerHTML = `<div class="tree-root">${this._buildNodeHtml(this.tree.root)}</div>`;
        this.bindEvents();
    }

    _buildNodeHtml(node) {
        const id = `${this.prefix}-${node.name.replace(/\s+/g, '-')}`;
        const isChecked = node.active ? 'checked' : '';
        
        let html = `<div class="tree-node">`;
        html += `<div class="tree-content" id="${id}">`;
        
        // Icon Logik
        if (node.conditionFn) {
            // CONDITION
            html += `<span class="tree-condition-label">◇ ${node.name} ?</span>`;
        } else if (node.children && node.children.length > 0) {
            // GROUP
            html += `<span class="tree-group-label">📂 ${node.name}</span>`;
        } else {
            // RULE
            html += `<span class="tree-rule-label">📝 ${node.name}</span>`;
        }
        
        html += `<input type="checkbox" ${isChecked} data-name="${node.name}" class="rule-toggle">`;
        html += `</div>`; // Close Content

        // Kinder rendern
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                if(child) html += this._buildNodeHtml(child);
            }
        }
        html += `</div>`; // Close Node
        return html;
    }

    bindEvents() {
        this.container.querySelectorAll('.rule-toggle').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const name = e.target.getAttribute('data-name');
                if (this.onToggle) this.onToggle(name);
            });
        });
    }

    highlightCheck(name) { this._addClass(name, 'checking'); }
    highlightSuccess(name) { this._addClass(name, 'success'); }
    
    clearHighlights() {
        this.container.querySelectorAll('.checking, .success').forEach(el => {
            el.classList.remove('checking', 'success');
        });
    }
    
    _addClass(name, cls) {
        const id = `${this.prefix}-${name.replace(/\s+/g, '-')}`;
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('checking', 'success');
            el.classList.add(cls);
            if (cls === 'checking') el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }
}