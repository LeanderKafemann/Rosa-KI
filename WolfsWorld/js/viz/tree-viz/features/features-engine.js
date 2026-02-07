/**
 * @fileoverview TreeFeaturesEngine - Feature-Modul für Node-Styling, Status-Management und Dead-End-Erkennung
 * 
 * WICHTIG: Status-Definitionen und -Designs sind nun zentral in status-config.js definiert.
 * Diese Datei nutzt:
 * - StatusConfig.getStatusTypes() für Priority-basierte Status
 * - StatusConfig.getStyleConfig() für Visual-Styles
 * - STYLE_CONFIG_GLOBAL für Master-Rendering-Effekte
 * 
 * Zentrale Verwaltung aller visuellen Effekte und Node-Eigenschaften:
 * - checkAndMarkDeadEnd(): Erkennung von Sackgassen im Baum
 * - getNodeStyle(): Konsistentes Styling basierend auf Node-Status
 * - updateActiveNodeTracking(): Fokus-Management für aktive Knoten
 * 
 * @author Alexander Wolf
 * @version 1.0
 */
// Make TreeFeaturesEngine global (not const, so it's accessible without window.)
var TreeFeaturesEngine = window.TreeFeaturesEngine || {
    // Safe getters for global STYLE_CONFIG and STYLE_CONFIG_GLOBAL
    // These are defined in status-config.js and must be loaded first
    getStyleConfig() {
        if (typeof window !== 'undefined' && window.STYLE_CONFIG) {
            return window.STYLE_CONFIG;
        }
        if (typeof StatusConfig !== 'undefined' && StatusConfig.getStyleConfig) {
            return StatusConfig.getStyleConfig();
        }
        return {};
    },

    getStyleConfigGlobal() {
        if (typeof window !== 'undefined' && window.STYLE_CONFIG_GLOBAL) {
            return window.STYLE_CONFIG_GLOBAL;
        }
        if (typeof StatusConfig !== 'undefined' && StatusConfig.STYLE_CONFIG_GLOBAL) {
            return StatusConfig.STYLE_CONFIG_GLOBAL;
        }
        return {};
    },

    /**
     * Identifies whether a node is a dead end and applies the corresponding status.
     * @param {string} nodeId - The ID of the node to check
     * @param {Object} nodes - Map of all nodes in the tree
     */
    checkAndMarkDeadEnd(nodeId, nodes) {
        const node = nodes.get(nodeId);
        
        if (!node) {
            return;
        }
        
        if (!node.children || node.children.length === 0) {
            return;
        }

        // REKURSIV: Prüfe und markiere alle Kinder zuerst!
        for (const childId of node.children) {
            TreeFeaturesEngine.checkAndMarkDeadEnd(childId, nodes);
        }

        // JETZT: Prüfe, ob alle Kinder DEAD_END sind (nachdem sie rekursiv geprüft wurden)
        let allChildrenAreDead = true;
        for (const childId of node.children) {
            const child = nodes.get(childId);
            const hasDeadEnd = child && child.status && child.status.has('DEAD_END');
            
            if (!hasDeadEnd) {
                allChildrenAreDead = false;
                break;
            }
        }

        // Wenn alle Kinder DEAD_END sind, markiere diesen Knoten auch
        if (allChildrenAreDead) {
            if (!node.status) node.status = new Set();
            node.status.add('DEAD_END');
        }
    },

    /**
     * Aktualisiert Active Node Tracking
     * Zentriert View auf aktiven Node mit optionaler Animation
     * (Pausiert während Pan/Zoom-Interaktionen)
     * 
     * @param {Object} activeNodeTracking - { nodeId, paused, targetX, targetY, animating, ... }
     * @param {Map} nodes
     * @param {Object} viewport - { offsetX, offsetY, scale }
     * @param {Object} canvas - { width, height }
     * @param {Object} config - { activeNodeTrackingSmooth, activeNodeTrackingDuration }
     */
    updateActiveNodePosition(activeNodeTracking, nodes, viewport, canvas, config) {
        if (!activeNodeTracking.nodeId) return;
        
        // Skip if tracking is paused (during pan/zoom)
        if (activeNodeTracking.paused) return;

        const node = nodes.get(activeNodeTracking.nodeId);
        if (!node) return;

        const targetX = canvas.width * config.activeNodeTargetX;
        const targetY = canvas.height * config.activeNodeTargetY;

        if (config.activeNodeTrackingSmooth && !activeNodeTracking.animating) {
            // Start animation
            activeNodeTracking.animating = true;
            activeNodeTracking.animationStart = performance.now();
            activeNodeTracking.animationDuration = config.activeNodeTrackingDuration || 300;
            activeNodeTracking.lastOffsetX = viewport.offsetX;
            activeNodeTracking.lastOffsetY = viewport.offsetY;
        }

        if (activeNodeTracking.animating) {
            const now = performance.now();
            const elapsed = now - activeNodeTracking.animationStart;
            const duration = activeNodeTracking.animationDuration;

            if (elapsed >= duration) {
                // Animation finished
                activeNodeTracking.animating = false;
            }

            const progress = Math.min(1, elapsed / duration);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const startX = activeNodeTracking.lastOffsetX;
            const startY = activeNodeTracking.lastOffsetY;
            const endOffsetX = targetX - node.x * viewport.scale;
            const endOffsetY = targetY - node.y * viewport.scale;

            viewport.offsetX = startX + (endOffsetX - startX) * easeProgress;
            viewport.offsetY = startY + (endOffsetY - startY) * easeProgress;
        } else {
            // Instant centering
            viewport.offsetX = targetX - node.x * viewport.scale;
            viewport.offsetY = targetY - node.y * viewport.scale;
        }
    },

    /**
     * Setzt den Active Node (exclusive - entfernt ACTIVE von allen anderen)
     * @param {number} nodeId
     * @param {Map} nodes
     * @param {Object} activeNodeTracking
     */
    setActiveNode(nodeId, nodes, activeNodeTracking) {
        if (activeNodeTracking.nodeId === nodeId) return; // Already active

        // REMOVE ACTIVE from all other nodes (exclusive lock)
        nodes.forEach(node => {
            if (node.status && node.status.has('ACTIVE') && node.id !== nodeId) {
                node.status.delete('ACTIVE');
            }
        });

        activeNodeTracking.nodeId = nodeId;
        activeNodeTracking.animating = false;

        const node = nodes.get(nodeId);
        if (!node) return;

        // Markiere als ACTIVE (nicht nur Status, sondern auch Tracking-Info)
        if (!node.status) node.status = new Set();
        node.status.add('ACTIVE');
    },

    /**
     * Gibt Style-Objekt für einen Knoten basierend auf Status
     * Kombiniert Status (z.B. ACTIVE + DEAD_END) zu konsistentem Styling
     * 
     * @param {Object} node
     * @param {Object} statusTypes - Status-Definitionen
     * @param {Object} config - Engine config with enableStatusGlow
     * @returns {Object} { glowColor, borderColor, borderWidth, borderDash, fillColor }
     */
    getNodeStyle(node, statusTypes, config = {}) {
        const STYLE_CONFIG = this.getStyleConfig();
        // CUSTOM COLOR SUPPORT: If node has a custom color property (e.g., for Warnsdorf preview nodes)
        if (node.color && !node.status?.size) {
            const previewStyle = { ...STYLE_CONFIG.PREVIEW_NODE };
            previewStyle.color = node.color;  // Override with custom color
            return this._convertStyleToRenderFormat(previewStyle, config);
        }

        if (!node.status || node.status.size === 0) {
            return this._convertStyleToRenderFormat(STYLE_CONFIG.DEFAULT, config);
        }

        // Combo-Status prüfen (höchste Priorität)
        const hasActive = node.status.has('ACTIVE');
        const hasDeadEnd = node.status.has('DEAD_END');
        const hasWin = node.status.has('WIN');
        const hasDuplicate = node.status.has('DUPLICATE');

        // DUPLICATE: Always takes precedence
        if (hasDuplicate) {
            return this._convertStyleToRenderFormat(STYLE_CONFIG.DUPLICATE, config);
        }

        // Combo-Status
        if (hasActive && hasDeadEnd) {
            return this._convertStyleToRenderFormat(STYLE_CONFIG.ACTIVE_DEAD_END, config);
        }

        if (hasActive && hasWin) {
            return this._convertStyleToRenderFormat(STYLE_CONFIG.ACTIVE_WIN, config);
        }

        // Single status (pick first by priority order)
        // EXPLICITLY ADD INTERACTIVE STATUSES (READY, WAIT, EVALUATED)
        // Single status (pick first by priority order)
        // EXPLICITLY ADD INTERACTIVE STATUSES (READY, WAIT, EVALUATED, WIN_BLUE, WIN_RED)
        const priorityOrder = ['ACTIVE', 'READY', 'WIN_BLUE', 'WIN_RED', 'WIN', 'LOSS', 'SOLUTION', 'DEAD_END', 'DRAW', 'PRUNED', 'EVALUATED', 'WAIT', 'NONE'];
        let selectedStyle = STYLE_CONFIG.DEFAULT;
        
        for (const statusName of priorityOrder) {
            if (node.status.has(statusName) && STYLE_CONFIG[statusName]) {
                selectedStyle = STYLE_CONFIG[statusName];
                break;
            }
        }

        return this._convertStyleToRenderFormat(selectedStyle, config);
    },

    /**
     * Konvertiert STYLE_CONFIG Format zu Renderer-Format
     * Mit Unterstützung für enableGlow und enableDash Schalter
     * Nutzt zentrale STYLE_CONFIG_GLOBAL Effekt-Schalter
     * @param {Object} style - STYLE_CONFIG object
     * @param {Object} config - Renderer config (kompatibilität, wird nicht mehr genutzt)
     * @returns {Object} - Renderer-kompatibles Format
     */
    _convertStyleToRenderFormat(style, config = {}) {
        const STYLE_CONFIG_GLOBAL = this.getStyleConfigGlobal();
        // Nutze zentrale STYLE_CONFIG_GLOBAL Schalter statt einzelner config Optionen
        const enableGlowEffects = STYLE_CONFIG_GLOBAL.enableGlowEffects;
        const enableDashEffects = STYLE_CONFIG_GLOBAL.enableDashEffects;
        
        return {
            fillColor: style.color || null,
            borderColor: style.border || '#333',
            borderWidth: style.width || 2,
            // Glow: Kombiniere globalen Schalter mit lokalem Schalter und Glow-Farbe
            glowColor: (enableGlowEffects && style.enableGlow && style.glow) ? style.glow : null,
            // Dash: Kombiniere globalen Schalter mit lokalem Schalter und Dash-Pattern
            borderDash: (enableDashEffects && style.enableDash && style.dash) ? style.dash : []
        };

    },

    /**
     * Aktualisiert Node-Status (addStatus, removeStatus, setStatus)
     * @param {Object} node
     * @param {string} status
     * @param {boolean} active - true = add, false = remove
     */
    updateNodeStatus(node, status, active = true) {
        if (!node.status) {
            node.status = new Set();
        }

        if (active) {
            node.status.add(status);
        } else {
            node.status.delete(status);
        }
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.TreeFeaturesEngine = TreeFeaturesEngine;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TreeFeaturesEngine;
}
