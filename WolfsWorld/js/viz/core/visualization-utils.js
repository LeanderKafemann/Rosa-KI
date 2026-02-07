/**
 * visualization-utils.js - Gemeinsame Utilities für alle Visualizer
 * 
 * Funktionen für:
 * - Farb-Management (Status → RGB)
 * - Geometrie-Berechnungen
 * - State Helpers
 * - Performance Optimierungen
 * 
 * @author Alexander Wolf
 * @version 1.0
 */

const VisualizationUtils = {
    /**
     * Status zu Farbe Mapping (verwendet durch alle Visualizer)
     */
    STATUS_COLORS: {
        ACTIVE: { r: 200, g: 220, b: 255 },           // Light blue
        WIN: { r: 144, g: 238, b: 144 },              // Light green
        LOSS: { r: 255, g: 160, b: 160 },             // Light red
        DEAD_END: { r: 255, g: 200, b: 200 },         // Lighter red
        DUPLICATE: { r: 220, g: 220, b: 220 },        // Light gray
        PRUNED: { r: 200, g: 200, b: 200 },           // Gray
        SOLUTION: { r: 255, g: 215, b: 0 },           // Gold
        DRAW: { r: 200, g: 200, b: 220 }              // Light purple
    },

    /**
     * Status zu Rand-Farbe Mapping
     */
    STATUS_BORDER_COLORS: {
        ACTIVE: { r: 0, g: 100, b: 255 },             // Blue
        WIN: { r: 0, g: 180, b: 0 },                  // Green
        LOSS: { r: 255, g: 0, b: 0 },                 // Red
        DEAD_END: { r: 255, g: 0, b: 0 },             // Red
        DUPLICATE: { r: 100, g: 100, b: 100 },        // Dark gray
        PRUNED: { r: 80, g: 80, b: 80 },              // Dark gray
        SOLUTION: { r: 200, g: 150, b: 0 },           // Dark gold
        DRAW: { r: 100, g: 100, b: 150 }              // Dark purple
    },

    /**
     * Status-Priorität für Rendering (höher = wird zuerst gerendert)
     */
    STATUS_PRIORITY: {
        ACTIVE: 100,
        SOLUTION: 90,
        WIN: 70,
        LOSS: 60,
        DEAD_END: 50,
        DUPLICATE: 40,
        PRUNED: 30,
        DRAW: 35
    },

    /**
     * Konvertiert RGB-Objekt zu CSS-String
     * @param {Object} rgb - { r, g, b } Objekt
     * @param {number} alpha - Optional: Alpha-Wert (0-1), default 1
     * @returns {string} "rgb(r, g, b)" oder "rgba(r, g, b, a)"
     */
    rgbToString(rgb, alpha = 1) {
        if (alpha < 1) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    },

    /**
     * Ruft Farbe basierend auf Status ab
     * @param {string} status - Node-Status (ACTIVE, WIN, LOSS, etc)
     * @param {boolean} isBorder - Rand-Farbe? default false (Fill)
     * @returns {Object} { r, g, b }
     */
    getStatusColor(status, isBorder = false) {
        const colorMap = isBorder ? this.STATUS_BORDER_COLORS : this.STATUS_COLORS;
        return colorMap[status] || colorMap.DUPLICATE;
    },

    /**
     * Berechnet Euklid-Distanz zwischen zwei Punkten
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Prüft ob Punkt im Rechteck liegt (Hit Detection)
     * @param {number} px - Punkt X
     * @param {number} py - Punkt Y
     * @param {number} rx - Rechteck oben-links X
     * @param {number} ry - Rechteck oben-links Y
     * @param {number} w - Breite
     * @param {number} h - Höhe
     * @returns {boolean}
     */
    pointInRect(px, py, rx, ry, w, h) {
        return px >= rx && px <= rx + w && py >= ry && py <= ry + h;
    },

    /**
     * Prüft ob Punkt in Kreis liegt (Hit Detection für Knoten)
     * @param {number} px - Punkt X
     * @param {number} py - Punkt Y
     * @param {number} cx - Kreis-Mittelpunkt X
     * @param {number} cy - Kreis-Mittelpunkt Y
     * @param {number} radius
     * @returns {boolean}
     */
    pointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) <= radius;
    },

    /**
     * Berechnet Bounding Box für Text
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @returns {Object} { width, height, left, top, right, bottom }
     */
    getTextBounds(ctx, text, x, y) {
        const metrics = ctx.measureText(text);
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        
        return {
            width: metrics.width,
            height: height,
            left: x,
            top: y - metrics.actualBoundingBoxAscent,
            right: x + metrics.width,
            bottom: y + metrics.actualBoundingBoxDescent
        };
    },

    /**
     * Begrenzt Wert auf Min-Max Range
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear Interpolation (für Animationen)
     * @param {number} a - Start-Wert
     * @param {number} b - End-Wert
     * @param {number} t - Progress (0-1)
     * @returns {number}
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Easing Function: Easeout (schnell → langsam)
     * @param {number} t - Progress (0-1)
     * @returns {number}
     */
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    /**
     * Easing Function: Easeoutquad
     * @param {number} t - Progress (0-1)
     * @returns {number}
     */
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    },

    /**
     * Dreht Punkt um Mittelpunkt
     * @param {number} x - Punkt X
     * @param {number} y - Punkt Y
     * @param {number} cx - Mittelpunkt X
     * @param {number} cy - Mittelpunkt Y
     * @param {number} angle - Winkel in Radians
     * @returns {Object} { x, y }
     */
    rotatePoint(x, y, cx, cy, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: cx + (x - cx) * cos - (y - cy) * sin,
            y: cy + (x - cx) * sin + (y - cy) * cos
        };
    },

    /**
     * Berechnet Winkel zwischen zwei Punkten (in Radians)
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    angleTo(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Drawt Pfeil zwischen zwei Punkten
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} fromX
     * @param {number} fromY
     * @param {number} toX
     * @param {number} toY
     * @param {number} headlen - Pfeilspitzen-Länge
     * @param {string} color
     */
    drawArrow(ctx, fromX, fromY, toX, toY, headlen = 15, color = '#000') {
        const angle = this.angleTo(fromX, fromY, toX, toY);

        // Linien-Start anpassen (kurz vor Zielknoten)
        const distance = this.distance(fromX, fromY, toX, toY);
        const adjustedTo = {
            x: toX - Math.cos(angle) * (headlen + 5),
            y: toY - Math.sin(angle) * (headlen + 5)
        };

        // Linie zeichnen
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(adjustedTo.x, adjustedTo.y);
        ctx.stroke();

        // Pfeilspitze zeichnen
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    },

    /**
     * Drawt zentrierten Text mit optional Hintergrund
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {Object} options - { font, color, bgColor, padding }
     */
    drawText(ctx, text, x, y, options = {}) {
        const defaults = {
            font: '14px Arial',
            color: '#000',
            bgColor: null,
            padding: 4,
            align: 'center',
            baseline: 'middle'
        };
        const opts = { ...defaults, ...options };

        ctx.font = opts.font;
        ctx.textAlign = opts.align;
        ctx.textBaseline = opts.baseline;

        const metrics = ctx.measureText(text);
        const height = parseInt(opts.font) * 1.2;

        // Hintergrund zeichnen falls angegeben
        if (opts.bgColor) {
            ctx.fillStyle = opts.bgColor;
            ctx.fillRect(
                x - metrics.width / 2 - opts.padding,
                y - height / 2 - opts.padding,
                metrics.width + opts.padding * 2,
                height + opts.padding * 2
            );
        }

        // Text zeichnen
        ctx.fillStyle = opts.color;
        ctx.fillText(text, x, y);
    },

    /**
     * Performance: Debounce für Rendering
     * @param {Function} func
     * @param {number} wait - ms
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Performance: RequestAnimationFrame Wrapper
     * @param {Function} callback
     * @param {number} fps - Optional: target FPS (default 60)
     * @returns {Function}
     */
    throttleAnimationFrame(callback, fps = 60) {
        let lastTime = 0;
        const interval = 1000 / fps;

        return (currentTime) => {
            if (currentTime - lastTime >= interval) {
                callback(currentTime);
                lastTime = currentTime;
            }
        };
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualizationUtils;
}
