/**
 * @fileoverview TreeLayoutEngine - Modul für Knoten-Positionierung und Auto-Layout-Algorithmen
 * 
 * Implementiert verschiedene Layout-Strategien für Suchbäume:
 * - calculatePosition(): Berechnet Position für neue Knoten basierend auf Parent und Level
 * - getNodeLevel(): Bestimmt die Tiefe eines Knotens im Baum
 * - balanceSubtree(): Auto-Balance-Algorithmus für gleichmäßige Breite
 * - applyLayout(): Wendet Layout-Algorithmus auf alle Knoten an
 * 
 * @author Alexander Wolf
 * @version 1.0
 */
var TreeLayoutEngine = {
    /**
     * Berechnet Position eines neuen Knotens
     * @param {number} id - Node ID
     * @param {number} parentId - Parent Node ID
     * @param {Map} nodes - Alle existierenden Nodes
     * @param {Object} config - { levelHeight, canvas }
     * @returns {Object} { x, y }
     */
    calculatePosition(id, parentId, nodes, config) {
        const level = this.getNodeLevel(id, parentId, nodes);
        const y = level * config.levelHeight + 80;
        const x = config.canvas.width / 2; // Default center
        return { x, y };
    },

    /**
     * Positioniert alle Knoten neu (Auto-Layout)
     * @param {Map} nodes - Alle Knoten
     * @param {Object} config - { levelHeight, canvas }
     */
    relayoutTree(nodes, config) {
        const root = Array.from(nodes.values()).find(n => 
            !n.parentId || n.parentId === null || !nodes.has(n.parentId)
        );
        
        if (!root) return;

        // Positioniere Root
        root.x = config.canvas.width / 2;
        root.y = 80;

        // Positioniere Kinder rekursiv
        this.layoutSubtree(root.id, nodes, config);
    },

    /**
     * Layoutet einen Subtree rekursiv
     * @param {number} nodeId
     * @param {Map} nodes
     * @param {Object} config
     */
    layoutSubtree(nodeId, nodes, config) {
        const node = typeof nodeId === 'number' ? nodes.get(nodeId) : nodeId;
        if (!node) return;

        const children = Array.from(nodes.values()).filter(n => n.parentId === node.id);
        if (children.length === 0) return;

        // Berechne Subtree-Breite
        const subtreeWidth = this.calculateSubtreeWidth(node.id, nodes, config);
        let currentX = node.x - subtreeWidth / 2;

        for (const child of children) {
            const childWidth = this.calculateSubtreeWidth(child.id, nodes, config);
            child.x = currentX + childWidth / 2;
            child.y = node.y + config.levelHeight;
            currentX += childWidth;

            // Rekursiv für Kinder-Subtrees
            this.layoutSubtree(child.id, nodes, config);
        }
    },

    /**
     * Berechnet die Breite eines Subtrees
     * @param {number} nodeId
     * @param {Map} nodes
     * @param {Object} config - Must include horizontalSpacing
     * @returns {number}
     */
    calculateSubtreeWidth(nodeId, nodes, config) {
        const node = nodes.get(nodeId);
        if (!node) return config.horizontalSpacing || 100;

        const children = Array.from(nodes.values()).filter(n => n.parentId === node.id);
        if (children.length === 0) {
            // Leaf node: Use horizontalSpacing for proper bottom-level spacing
            return config.horizontalSpacing || 100;
        }

        let totalWidth = 0;
        for (const child of children) {
            totalWidth += this.calculateSubtreeWidth(child.id, nodes, config);
        }

        return totalWidth;
    },

    /**
     * Bestimmt Level (Tiefe) eines Knotens
     * @param {number} nodeId
     * @param {number} parentId
     * @param {Map} nodes
     * @returns {number}
     */
    getNodeLevel(nodeId, parentId, nodes) {
        if (!parentId) return 0;
        
        const parent = nodes.get(parentId);
        if (!parent) return 0;

        let level = 1;
        let currentParent = parent;
        while (currentParent && currentParent.parentId) {
            currentParent = nodes.get(currentParent.parentId);
            level++;
            if (level > 100) break; // Safety
        }
        return level;
    },

    /**
     * Auto-fit: Berechne optimalen Zoom um gesamten Baum zu zeigen
     * @param {Map} nodes
     * @param {Object} canvas - { width, height }
     * @param {Object} viewport - { maxScale }
     * @returns {Object} { scale, offsetX, offsetY }
     */
    calculateAutoFitZoom(nodes, canvas, viewport) {
        if (nodes.size === 0) {
            return { scale: 1.0, offsetX: 0, offsetY: 0 };
        }

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const node of nodes.values()) {
            const nodeSize = node.radius * 2;
            minX = Math.min(minX, node.x - nodeSize);
            maxX = Math.max(maxX, node.x + nodeSize);
            minY = Math.min(minY, node.y - nodeSize);
            maxY = Math.max(maxY, node.y + nodeSize);
        }

        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;

        const padding = 40;
        const scaleX = (canvas.width - padding * 2) / treeWidth;
        const scaleY = (canvas.height - padding * 2) / treeHeight;
        const scale = Math.min(scaleX, scaleY, viewport.maxScale);

        const treeCenterX = (minX + maxX) / 2;
        const treeCenterY = (minY + maxY) / 2;
        const offsetX = canvas.width / 2 - treeCenterX * scale;
        const offsetY = canvas.height / 2 - treeCenterY * scale;

        return { scale, offsetX, offsetY };
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.TreeLayoutEngine = TreeLayoutEngine;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreeLayoutEngine;
}
