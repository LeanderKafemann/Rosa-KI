/**
 * Generische Engine zur Visualisierung von Suchbäumen auf einem Canvas.
 * Unterstützt dynamische Skalierung, Drag-Scrolling und Custom-Renderer für Knoten.
 * @fileoverview
 */

const TREE_CONFIG = {
    nodeSize: 60,
    maxNodeSize: 120,       
    minNodeSize: 40,
    nodePadding: 0,
    levelHeight: 120,
    siblingGap: 30,
    colors: {
        edge: '#bdc3c7',
        text: '#34495e',
        solution: '#27ae60',
        duplicate: '#e67e22',
        forbidden: '#c0392b',
        nodeBorder: '#34495e',
        nodeBg: '#ffffff'
    },
    lineWidth: { normal: 1, highlight: 4, edge: 2 },
    font: { annotation: "bold 12px monospace", edgeLabel: "11px monospace" }
};

/**
 * Repräsentiert einen einzelnen Knoten im Visualisierungsbaum.
 */
class TreeNode {
    /**
     * @param {number} id - Eindeutige ID.
     * @param {*} data - Das Datenobjekt (z.B. RotateBoard).
     * @param {number} depth - Tiefe im Baum.
     * @param {string} [parentMove=""] - Die Aktion, die zu diesem Knoten führte.
     */
    constructor(id, data, depth, parentMove = "") {
        this.id = id;
        this.data = data;
        this.depth = depth;
        this.parentMove = parentMove;
        this.children = [];
        this.x = 0;
        this.y = 0;
        
        // Status-Flags
        this.isDuplicate = false;
        this.isSolution = false;
        this.isForbidden = false;
        this.annotation = ""; 
    }
}

/**
 * Hauptklasse zur Visualisierung.
 */
class TreeVisualizer {
    /**
     * @param {string} canvasId - ID des HTML Canvas Elements.
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
        this.config = { ...TREE_CONFIG };
    }

    /**
     * Zeichnet den kompletten Baum.
     * @param {TreeNode} root - Der Wurzelknoten.
     * @param {Object} options - Konfigurationen (z.B. drawNodeFn).
     */
    drawTree(root, options = {}) {
        if (!this.canvas || !root) return;
        
        // Config mergen
        if (options.config) this.config = { ...this.config, ...options.config };

        // 1. Metriken berechnen (Tiefe, Breite)
        const metrics = this._calculateMetrics(root);
        
        // 2. Canvas Größe und Node-Größe anpassen
        this._adjustCanvasAndScale(metrics);
        
        // 3. Koordinaten zuweisen (Reingold-Tilford ähnlich)
        this._assignCoordinates(root, this.canvas.width / 2, 50);

        // 4. Zeichnen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(0, 20); // Padding oben
        
        this._renderEdgesRecursive(root);
        this._renderNodesRecursive(root, options.drawNodeFn);
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset Transform
    }

    /**
     * Berechnet Baum-Metriken.
     * @private
     */
    _calculateMetrics(node) {
        let maxDepth = 0;
        let leafCount = 0;
        const traverse = (n) => {
            if (n.depth > maxDepth) maxDepth = n.depth;
            if (n.children.length === 0) leafCount++;
            n.children.forEach(traverse);
        };
        traverse(node);
        return { maxDepth, leafCount };
    }

    /**
     * Passt Canvas-Größe und Node-Skalierung dynamisch an.
     * @private
     */
    _adjustCanvasAndScale(metrics) {
        const container = this.canvas.parentElement;
        const viewWidth = container.clientWidth;
        const viewHeight = container.clientHeight;

        // Vertikale Anpassung: Nodes kleiner machen bei großer Tiefe
        const neededLevels = metrics.maxDepth + 1;
        const potentialNodeHeight = (viewHeight / neededLevels) * 0.8;
        
        this.config.nodeSize = Math.max(
            this.config.minNodeSize, 
            Math.min(this.config.maxNodeSize, potentialNodeHeight)
        );
        this.config.levelHeight = this.config.nodeSize * 1.5;

        // Horizontale Anpassung: Canvas verbreitern, damit gescrollt werden kann
        const treeWidth = metrics.leafCount * (this.config.nodeSize + this.config.siblingGap);
        const requiredWidth = Math.max(viewWidth - 20, treeWidth + 100); 
        const requiredHeight = (metrics.maxDepth + 1) * this.config.levelHeight + 100;

        this.canvas.width = requiredWidth;
        this.canvas.height = requiredHeight;
    }

    /**
     * Rekursive Zuweisung der X/Y Koordinaten.
     * @private
     */
    _assignCoordinates(node, x, y) {
        node.x = x;
        node.y = y;
        
        if (node.children.length > 0) {
            const subtreeWidth = this._calculateSubtreeWidth(node);
            let currentX = x - (subtreeWidth / 2);
            
            node.children.forEach(child => {
                const childWidth = this._calculateSubtreeWidth(child);
                // Kind in der Mitte seines zugewiesenen Platzes positionieren
                this._assignCoordinates(child, currentX + childWidth/2, y + this.config.levelHeight);
                currentX += childWidth;
            });
        }
    }

    /** @private */
    _calculateSubtreeWidth(node) {
        if (node.children.length === 0) return this.config.nodeSize + this.config.siblingGap;
        return node.children.reduce((sum, c) => sum + this._calculateSubtreeWidth(c), 0);
    }

    /** @private */
    _renderEdgesRecursive(node) {
        node.children.forEach(child => {
            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y + this.config.nodeSize/2);
            this.ctx.lineTo(child.x, child.y - this.config.nodeSize/2);
            this.ctx.strokeStyle = this.config.colors.edge;
            this.ctx.lineWidth = this.config.lineWidth.edge;
            this.ctx.stroke();

            // Label am Pfad (L/R)
            if (child.parentMove) {
                const mx = (node.x + child.x) / 2;
                const my = (node.y + child.y) / 2;
                this.ctx.fillStyle = this.config.colors.nodeBg;
                this.ctx.fillRect(mx - 8, my - 8, 16, 16);
                this.ctx.fillStyle = this.config.colors.text;
                this.ctx.font = this.config.font.edgeLabel;
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(child.parentMove, mx, my);
            }
            this._renderEdgesRecursive(child);
        });
    }

    /** @private */
    _renderNodesRecursive(node, drawContentFn) {
        const size = this.config.nodeSize;
        const half = size / 2;
        
        this.ctx.save();
        this.ctx.translate(node.x - half, node.y - half);

        // Hintergrund & Rahmen
        this.ctx.fillStyle = this.config.colors.nodeBg;
        this.ctx.fillRect(0, 0, size, size);
        this.ctx.lineWidth = this.config.lineWidth.normal;
        this.ctx.strokeStyle = this.config.colors.nodeBorder;

        // Status-Farben
        if (node.isSolution) {
            this.ctx.lineWidth = this.config.lineWidth.highlight;
            this.ctx.strokeStyle = this.config.colors.solution;
        } else if (node.isDuplicate) {
            this.ctx.lineWidth = this.config.lineWidth.highlight;
            this.ctx.strokeStyle = this.config.colors.duplicate;
        }

        this.ctx.strokeRect(0, 0, size, size);

        // Inhalt (das Mini-Board) zeichnen
        if (drawContentFn) {
            const pad = this.config.nodePadding || 2;
            const contentSize = size - (pad * 2);
            this.ctx.beginPath();
            this.ctx.rect(pad, pad, contentSize, contentSize);
            this.ctx.clip();
            this.ctx.translate(pad, pad);
            try {
                drawContentFn(this.ctx, node.data, contentSize);
            } catch(e) { console.error(e); }
        }
        this.ctx.restore();

        // Annotationen (Text unter dem Knoten)
        if (node.isDuplicate) {
            this.ctx.fillStyle = this.config.colors.duplicate;
            this.ctx.font = "bold 14px sans-serif";
            this.ctx.fillText("↺", node.x + half + 2, node.y - half + 5);
        }
        if (node.annotation) {
            this.ctx.fillStyle = this.config.colors.text;
            this.ctx.font = this.config.font.annotation;
            this.ctx.textAlign = "center";
            this.ctx.fillText(node.annotation, node.x, node.y + half + 12);
        }

        node.children.forEach(child => this._renderNodesRecursive(child, drawContentFn));
    }
}

// --- DRAG TO SCROLL LOGIK ---
// Ermöglicht das Verschieben des Canvas mit der Maus
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.viz-container');
    
    containers.forEach(ele => {
        let pos = { top: 0, left: 0, x: 0, y: 0 };
        let isDown = false;

        const mouseDownHandler = function (e) {
            isDown = true;
            ele.style.cursor = 'grabbing';
            pos = {
                left: ele.scrollLeft,
                top: ele.scrollTop,
                x: e.clientX,
                y: e.clientY,
            };
            ele.style.userSelect = 'none';
        };

        const mouseMoveHandler = function (e) {
            if (!isDown) return;
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;
            ele.scrollTop = pos.top - dy;
            ele.scrollLeft = pos.left - dx;
        };

        const mouseUpHandler = function () {
            isDown = false;
            ele.style.cursor = 'grab';
            ele.style.removeProperty('user-select');
        };

        ele.addEventListener('mousedown', mouseDownHandler);
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });
});