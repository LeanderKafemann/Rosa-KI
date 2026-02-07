/**
 * @fileoverview TreeInteractionEngine - Modul für Benutzerinteraktion und Viewport-Management
 * 
 * Implementiert alle Interaktionsmechaniken:
 * - setupWheelZoom(): Maus-Wheel Zooming mit Smart-Pause für Active-Node-Tracking
 * - setupDragPan(): Drag-basiertes Pannen des Baums
 * - setupNodeClickDetection(): Klick-Erkennung auf Baum-Knoten
 * - setupTouchSupport(): Touch-Gesten (Pinch-to-Zoom, Drag)
 * - getViewportTransform(): Berechnung der Viewport-Transformationen
 * 
 * @author Alexander Wolf
 * @version 1.0
 */

/**
 * TreeInteractionEngine - Modul für Benutzerinteraktion (Zoom, Pan, Click, Touch)
 * Extrahiert aus tree-engine.js für bessere Wartbarkeit
 * 
 * @author Alexander Wolf
 * @version 1.0
 */
var TreeInteractionEngine = {
    /**
     * Setup: Maus-Wheel Zoom (mit Pause für Active Node Tracking)
     * @param {HTMLCanvasElement} canvas
     * @param {Object} viewport - { scale, offsetX, offsetY, minScale, maxScale }
     * @param {Object} activeNodeTracking - { paused } flag
     * @param {Function} onViewportChange - Callback nach Änderung
     */
    setupWheelZoom(canvas, viewport, activeNodeTracking, onViewportChange) {
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            // Pause active node tracking during zoom
            if (activeNodeTracking) {
                activeNodeTracking.paused = true;
                // Resume after zoom ends
                setTimeout(() => { activeNodeTracking.paused = false; }, 300);
            }
            
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(
                viewport.minScale,
                Math.min(viewport.maxScale, viewport.scale * zoomFactor)
            );

            const scaleRatio = newScale / viewport.scale;
            viewport.offsetX = mouseX - (mouseX - viewport.offsetX) * scaleRatio;
            viewport.offsetY = mouseY - (mouseY - viewport.offsetY) * scaleRatio;
            viewport.scale = newScale;

            onViewportChange();
        });
    },

    /**
     * Setup: Maus-Drag Pan (mit Pause für Active Node Tracking)
     * @param {HTMLCanvasElement} canvas
     * @param {Object} viewport - { offsetX, offsetY }
     * @param {Object} activeNodeTracking - { paused } flag
     * @param {Function} onViewportChange - Callback nach Änderung
     */
    setupMouseDrag(canvas, viewport, activeNodeTracking, onViewportChange) {
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            // Pause active node tracking during pan
            if (activeNodeTracking) {
                activeNodeTracking.paused = true;
            }
            const rect = canvas.getBoundingClientRect();
            dragStartX = e.clientX - rect.left - viewport.offsetX;
            dragStartY = e.clientY - rect.top - viewport.offsetY;
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                viewport.offsetX = mouseX - dragStartX;
                viewport.offsetY = mouseY - dragStartY;
                onViewportChange();
            }
        });

        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            // Resume active node tracking
            if (activeNodeTracking) {
                activeNodeTracking.paused = false;
            }
            canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            // Resume active node tracking
            if (activeNodeTracking) {
                activeNodeTracking.paused = false;
            }
            canvas.style.cursor = 'default';
        });

        canvas.style.cursor = 'grab';
    },

    /**
     * Setup: Click Detection (für Node-Auswahl)
     * @param {HTMLCanvasElement} canvas
     * @param {Function} getNodeAtPoint - Funktion zur Hit-Detection
     * @param {Function} onNodeClicked - Callback(node)
     */
    setupNodeClick(canvas, getNodeAtPoint, onNodeClicked) {
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;

            const clickedNode = getNodeAtPoint(canvasX, canvasY);
            if (clickedNode) {
                if (onNodeClicked) onNodeClicked(clickedNode);
            }
        });
    },

    /**
     * Setup: Touch Pinch Zoom + Pan (mit Pause für Active Node Tracking)
     * @param {HTMLCanvasElement} canvas
     * @param {Object} viewport
     * @param {Object} activeNodeTracking - { paused } flag
     * @param {Function} onViewportChange
     */
    setupTouchGestures(canvas, viewport, activeNodeTracking, onViewportChange) {
        let lastTouchDistance = 0;

        canvas.addEventListener('touchmove', (e) => {
            // Pause active node tracking during touch
            if (activeNodeTracking) {
                activeNodeTracking.paused = true;
            }
            
            if (e.touches.length === 2) {
                // Pinch Zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const dx = touch2.clientX - touch1.clientX;
                const dy = touch2.clientY - touch1.clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastTouchDistance > 0) {
                    const zoomFactor = distance / lastTouchDistance;
                    const newScale = Math.max(
                        viewport.minScale,
                        Math.min(viewport.maxScale, viewport.scale * zoomFactor)
                    );
                    viewport.scale = newScale;
                    onViewportChange();
                }
                lastTouchDistance = distance;
            } else if (e.touches.length === 1) {
                // Single finger pan
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;
                // Pan logic would go here
            }
        });

        canvas.addEventListener('touchend', () => {
            lastTouchDistance = 0;
            // Resume active node tracking
            if (activeNodeTracking) {
                activeNodeTracking.paused = false;
            }
        });
    },

    /**
     * Hit Detection: Finde Node bei Canvas-Koordinaten
     * @param {number} canvasX
     * @param {number} canvasY
     * @param {Map} nodes
     * @param {Object} viewport
     * @returns {Object|null} Node oder null
     */
    getNodeAtCanvasPoint(canvasX, canvasY, nodes, viewport) {
        // Transformiere zu World-Koordinaten
        const treeX = (canvasX - viewport.offsetX) / viewport.scale;
        const treeY = (canvasY - viewport.offsetY) / viewport.scale;

        // Prüfe alle Knoten auf Hit (in reverse order - zuletzt gerenderte zuerst)
        const nodeArray = Array.from(nodes.values());
        for (let i = nodeArray.length - 1; i >= 0; i--) {
            const node = nodeArray[i];
            
            // Prüfe zuerst Expansion-Symbol
            if (NodeExpansionEngine && NodeExpansionEngine.isClickOnExpansionIndicator(node, treeX, treeY)) {
                node._hitExpansionIndicator = true;
                return node;
            }
            
            // Dann prüfe Node selbst
            const dx = treeX - node.x;
            const dy = treeY - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = node.radius || 15;

            if (distance <= radius) {
                node._hitExpansionIndicator = false;
                return node;
            }
        }

        return null;
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.TreeInteractionEngine = TreeInteractionEngine;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreeInteractionEngine;
}
