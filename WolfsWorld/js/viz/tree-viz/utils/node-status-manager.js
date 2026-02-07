/**
 * @fileoverview NodeStatusManager - Zentrale Status-Verwaltung für Tree-Adapters
 * 
 * Bietet eine einzelne Schnittstelle zur konsistenten Status-Synchronisierung:
 * - Interne Datenschicht (treeStructure.status in Adapter)
 * - Externe Visualisierungsschicht (UPDATE_NODE Commands zu TreeVizEngine)
 * 
 * Diese Klasse wird VON den Tree-Adapters verwendet, NICHT von der Visualisierung.
 * Sie stellt sicher, dass Status-Änderungen immer atomar und konsistent erfolgen.
 * 
 * WICHTIG: StatusConfig muss vor diesem Modul geladen sein!
 * 
 * @author Alexander Wolf
 * @version 1.0
 */

/**
 * NodeStatusManager - Zentrale Utility für Status-Management in Tree-Adapters
 * 
 * Verwendung in Adapters:
 * ```javascript
 * const adapter = new MinimaxTreeAdapter(iframe);
 * // Später im Adapter:
 * NodeStatusManager.setNodeStatus(nodeId, 'ACTIVE', [], myTreeStructure, adapter.commands);
 * ```
 * 
 * API:
 * - setNodeStatus(nodeId, primaryStatus, additionalStatuses, treeStructure, commands)
 *   Updates both internal model and generates UPDATE_NODE command
 */
const NodeStatusManager = {
    /**
     * Setzt einen Node-Status synchron im Modell und im Frontend
     * 
     * Dies ist die ZENTRALE Methode für alle Status-Änderungen in Adapters!
     * Sie stellt sicher, dass:
     * 1. Das interne Modell (treeStructure) aktualisiert wird
     * 2. Ein UPDATE_NODE Command generiert wird (für TreeVizEngine)
     * 3. Exklusive Status korrekt verwaltet werden
     * 
     * @param {number} nodeId - Node ID
     * @param {string} primaryStatus - Haupt-Status (WAIT, READY, ACTIVE, EVALUATED, PRUNED)
     * @param {string[]} additionalStatuses - Zusätz-Status (WIN_BLUE, WIN_RED, DRAW, etc.)
     * @param {Map} treeStructure - Referenz zu adapter.treeStructure
     * @param {Array} commands - Referenz zu adapter.commands (zum Anhängen von UPDATE_NODE)
     * 
     * @example
     * // In MinimaxTreeAdapter.evaluateNode():
     * NodeStatusManager.setNodeStatus(
     *     nodeId, 
     *     'EVALUATED', 
     *     ['WIN_BLUE'],
     *     this.treeStructure,
     *     this.commands
     * );
     */
    setNodeStatus(nodeId, primaryStatus, additionalStatuses = [], treeStructure, commands) {
        // Validierung: Muss treeStructure haben
        if (!treeStructure || !(treeStructure instanceof Map)) {
            console.warn(`NodeStatusManager.setNodeStatus: treeStructure is not a Map for nodeId ${nodeId}`);
            return;
        }

        // Validierung: Muss commands Array haben
        if (!commands || !Array.isArray(commands)) {
            console.warn(`NodeStatusManager.setNodeStatus: commands is not an array for nodeId ${nodeId}`);
            return;
        }

        // 1. Interne Datenschicht updaten
        const data = treeStructure.get(nodeId);
        if (!data) {
            console.warn(`NodeStatusManager.setNodeStatus: Node ${nodeId} not found in treeStructure`);
            return;
        }

        data.status = primaryStatus;

        // 2. Frontend-Command generieren
        // Exklusive Status: Nur einer kann aktiv sein
        const exclusiveStatuses = ['WAIT', 'READY', 'ACTIVE', 'EVALUATED', 'PRUNED'];
        const removeStatus = exclusiveStatuses.filter(s => s !== primaryStatus);

        // addStatus: Haupt-Status + Zusatz-Status
        let addStatus = [primaryStatus, ...additionalStatuses];
        if (addStatus.length === 1) addStatus = addStatus[0]; // Single status as string

        // 3. UPDATE_NODE Command an commands Array anhängen
        commands.push({
            action: 'UPDATE_NODE',
            id: nodeId,
            addStatus: addStatus,
            removeStatus: removeStatus
        });
    },

    /**
     * Utility: Gibt Zusammenfassung einer Status-Operation aus (für Debug)
     * @param {number} nodeId
     * @param {string} primaryStatus
     * @param {string[]} additionalStatuses
     * @returns {string}
     */
    getStatusSummary(nodeId, primaryStatus, additionalStatuses = []) {
        const all = [primaryStatus, ...additionalStatuses];
        return `Node ${nodeId}: ${all.join(', ')}`;
    }
};

// Make globally available if needed
if (typeof window !== 'undefined') {
    window.NodeStatusManager = NodeStatusManager;
}
