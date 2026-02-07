/**
 * BaseVisualizer - Abstrakte Basis-Klasse für alle Visualizer
 * Definiert gemeinsames Interface für postMessage-Kommunikation, Rendering und State-Management
 * 
 * Alle Visualizer (TreeViz, Flowchart, RuleViz, NeuralNet, RL, MonteCarlo) erben von dieser Klasse.
 * 
 * @author GitHub Copilot
 * @version 1.0
 */
class BaseVisualizer {
    /**
     * Erstellt einen neuen Visualizer
     * @param {HTMLCanvasElement} canvas - Canvas-Element für Rendering
     * @param {Object} options - Konfigurationsoptions
     */
    constructor(canvas, options = {}) {
        if (new.target === BaseVisualizer) {
            throw new TypeError('Cannot instantiate abstract class BaseVisualizer');
        }

        /**
         * Das Canvas-Element
         * @type {HTMLCanvasElement}
         */
        this.canvas = canvas;

        /**
         * 2D Rendering Context
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = canvas.getContext('2d');

        /**
         * Konfiguration
         * @type {Object}
         */
        this.config = {
            showOverlay: options.showOverlay !== undefined ? options.showOverlay : true,
            enableInteraction: options.enableInteraction !== undefined ? options.enableInteraction : true,
            ...options
        };

        /**
         * Viewport-State (für Zoom/Pan)
         * @type {Object}
         */
        this.viewport = {
            scale: 1.0,
            offsetX: 0,
            offsetY: 0,
            minScale: 0.1,
            maxScale: 3.0
        };

        /**
         * Interaction-State
         * @type {Object}
         */
        this.interaction = {
            isDragging: false,
            dragStart: { x: 0, y: 0 },
            lastMousePos: { x: 0, y: 0 }
        };

        /**
         * postMessage Communication State
         * @type {boolean}
         */
        this.ready = false;

        // Setup & Initialize
        this._setupCanvas();
        this._setupPostMessage();
        if (this.config.enableInteraction) {
            this._setupInteraction();
        }
    }

    /**
     * Konfiguriert das Canvas (Größe, Resize-Handler)
     * @private
     */
    _setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // Resize handler
        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            if (this.nodes || this.data) {
                this.render();
            }
        });
    }

    /**
     * Konfiguriert postMessage Listener für externe Commands
     * Subklassen können diese erweitern
     * @private
     */
    _setupPostMessage() {
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'VIZ_COMMAND') {
                this.executeCommand(event.data.command);
            }
        });

        // Signal readiness to parent
        console.log(`${this.constructor.name}: Sending READY signal`);
        window.parent.postMessage({ type: 'VIZ_READY', visualizer: this.constructor.name }, '*');
        this.ready = true;
    }

    /**
     * Konfiguriert Zoom/Pan/Touch Interaktion
     * Implementiert Standard-Zoom und Pan für alle Visualizer
     * @private
     */
    _setupInteraction() {
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(
                this.viewport.minScale,
                Math.min(this.viewport.maxScale, this.viewport.scale * zoomFactor)
            );

            const scaleRatio = newScale / this.viewport.scale;
            this.viewport.offsetX = mouseX - (mouseX - this.viewport.offsetX) * scaleRatio;
            this.viewport.offsetY = mouseY - (mouseY - this.viewport.offsetY) * scaleRatio;
            this.viewport.scale = newScale;

            this.render();
        });

        // Mouse drag pan
        this.canvas.addEventListener('mousedown', (e) => {
            this.interaction.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            this.interaction.dragStart.x = e.clientX - rect.left - this.viewport.offsetX;
            this.interaction.dragStart.y = e.clientY - rect.top - this.viewport.offsetY;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (this.interaction.isDragging) {
                this.viewport.offsetX = mouseX - this.interaction.dragStart.x;
                this.viewport.offsetY = mouseY - this.interaction.dragStart.y;
                this.render();
            }

            this.interaction.lastMousePos = { x: mouseX, y: mouseY };
        });

        this.canvas.addEventListener('mouseup', () => {
            this.interaction.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.interaction.isDragging = false;
            this.canvas.style.cursor = 'default';
        });

        this.canvas.style.cursor = 'grab';
    }

    /**
     * ABSTRACT: Führt ein empfangenes Command aus
     * Muss von Subklassen überschrieben werden
     * @param {Object} command - Das Command-Objekt
     */
    executeCommand(command) {
        throw new Error(`${this.constructor.name} must implement executeCommand()`);
    }

    /**
     * ABSTRACT: Rendert die Visualisierung
     * Muss von Subklassen überschrieben werden
     */
    render() {
        throw new Error(`${this.constructor.name} must implement render()`);
    }

    /**
     * Hilfsmethode: Zeichne Overlay (Zoom, Anleitung, etc)
     * Kann von Subklassen aufgerufen oder erweitert werden
     * @protected
     */
    drawOverlay() {
        if (!this.config.showOverlay) return;

        // Zoom indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(10, 10, 120, 30);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Zoom: ${(this.viewport.scale * 100).toFixed(0)}%`, 20, 18);
    }

    /**
     * Setzt Zoom und Pan auf Standard-Werte
     */
    resetView() {
        this.viewport.scale = 1.0;
        this.viewport.offsetX = 0;
        this.viewport.offsetY = 0;
        this.render();
    }

    /**
     * Sendet ein Command an Parent-Window
     * @protected
     * @param {Object} message - Die Message
     */
    sendToParent(message) {
        if (window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
    }

    /**
     * Utility: Transformiere Canvas-Koordinaten zu World-Koordinaten
     * Beachtet Viewport-Transformation
     * @protected
     * @param {number} canvasX
     * @param {number} canvasY
     * @returns {Object} { x, y } in World-Koordinaten
     */
    canvasToWorld(canvasX, canvasY) {
        return {
            x: (canvasX - this.viewport.offsetX) / this.viewport.scale,
            y: (canvasY - this.viewport.offsetY) / this.viewport.scale
        };
    }

    /**
     * Utility: Transformiere World-Koordinaten zu Canvas-Koordinaten
     * @protected
     * @param {number} worldX
     * @param {number} worldY
     * @returns {Object} { x, y } in Canvas-Koordinaten
     */
    worldToCanvas(worldX, worldY) {
        return {
            x: worldX * this.viewport.scale + this.viewport.offsetX,
            y: worldY * this.viewport.scale + this.viewport.offsetY
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseVisualizer;
}
