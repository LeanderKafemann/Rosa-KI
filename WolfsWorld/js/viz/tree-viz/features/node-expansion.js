/**
 * @fileoverview Node Expansion Engine - Kollabierbare Baumknoten
 * 
 * Ermöglicht schrittweises Explorieren des Suchbaums:
 * - Nodes können collapsed/expanded sein
 * - Nur expanded Nodes zeigen ihre Kinder
 * - Click auf collapsed Node expandiert ihn
 * 
 * @author Alexander Wolf
 * @version 1.0
 */

var NodeExpansionEngine = {
    /**
     * Initialisiert Expansion-State für einen Knoten.
     * @param {Object} node - Knoten-Objekt.
     * @param {boolean} collapsed - Ob Knoten initial kollabiert ist.
     */
    initNode(node, collapsed = false) {
        node.collapsed = collapsed;
        node.hasUnexploredChildren = false; // Wird später gesetzt
    },

    /**
     * Markiert einen Knoten als "hat unentdeckte Kinder".
     * @param {Object} node - Knoten-Objekt.
     */
    markAsExpandable(node) {
        node.hasUnexploredChildren = true;
        node.collapsed = true;
    },

    /**
     * Expandiert einen kollabierten Knoten.
     * @param {Object} node - Knoten-Objekt.
     */
    expand(node) {
        node.collapsed = false;
    },

    /**
     * Kollabiert einen expandierten Knoten.
     * @param {Object} node - Knoten-Objekt.
     */
    collapse(node) {
        node.collapsed = true;
    },

    /**
     * Toggle Expansion-State.
     * @param {Object} node - Knoten-Objekt.
     */
    toggle(node) {
        node.collapsed = !node.collapsed;
    },

    /**
     * Prüft, ob ein Knoten kollabiert ist.
     * @param {Object} node - Knoten-Objekt.
     * @returns {boolean}
     */
    isCollapsed(node) {
        return node.collapsed === true;
    },

    /**
     * Prüft, ob ein Knoten expandierbar ist (hat unentdeckte Kinder oder existierende Kinder).
     * @param {Object} node - Knoten-Objekt.
     * @returns {boolean}
     */
    isExpandable(node) {
        return node.hasUnexploredChildren === true || (node.children && node.children.length > 0);
    },

    /**
     * Filtert sichtbare Nodes (nur expanded Nodes zeigen Kinder).
     * @param {Map} allNodes - Alle Nodes.
     * @param {number} rootId - Root-Knoten ID.
     * @returns {Set<number>} - IDs der sichtbaren Nodes.
     */
    getVisibleNodes(allNodes, rootId) {
        const visible = new Set();
        const queue = [rootId];
        
        while (queue.length > 0) {
            const nodeId = queue.shift();
            visible.add(nodeId);
            
            const node = allNodes.get(nodeId);
            if (!node) continue;
            
            // Wenn Node expanded ist, Kinder auch sichtbar machen
            if (!this.isCollapsed(node)) {
                node.children.forEach(childId => queue.push(childId));
            }
        }
        
        return visible;
    },

    /**
     * Zeichnet Expansion-Indikator (+ oder - Symbol) auf Nodes.
     * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
     * @param {Object} node - Knoten-Objekt.
     * @param {number} scale - Viewport-Skalierung.
     */
    drawExpansionIndicator(ctx, node, scale) {
        if (!this.isExpandable(node)) return;
        
        const indicatorSize = 12;
        const x = node.x + node.radius + 5;
        const y = node.y - node.radius - 5;
        
        // Store indicator position for click detection
        node._expansionIndicatorPos = { x, y, radius: indicatorSize };
        
        ctx.save();
        
        // Background circle
        ctx.fillStyle = this.isCollapsed(node) ? '#2ecc71' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(x, y, indicatorSize, 0, Math.PI * 2);
        ctx.fill();
        
        // + or - Symbol
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        
        const lineLen = indicatorSize * 0.6;
        
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(x - lineLen, y);
        ctx.lineTo(x + lineLen, y);
        ctx.stroke();
        
        // Vertical (only for +, not for -)
        if (this.isCollapsed(node)) {
            ctx.beginPath();
            ctx.moveTo(x, y - lineLen);
            ctx.lineTo(x, y + lineLen);
            ctx.stroke();
        }
        
        ctx.restore();
    },

    /**
     * Prüft, ob ein Click auf dem Expansion-Symbol liegt.
     * @param {Object} node - Knoten-Objekt.
     * @param {number} clickX - Click X-Koordinate (in tree space).
     * @param {number} clickY - Click Y-Koordinate (in tree space).
     * @returns {boolean}
     */
    isClickOnExpansionIndicator(node, clickX, clickY) {
        if (!node._expansionIndicatorPos) return false;
        
        const pos = node._expansionIndicatorPos;
        const dist = Math.sqrt(
            (clickX - pos.x) ** 2 + 
            (clickY - pos.y) ** 2
        );
        
        return dist <= pos.radius * 1.5; // Hit area slightly larger
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.NodeExpansionEngine = NodeExpansionEngine;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeExpansionEngine;
}
