/**
 * Adapter, der einen Regel-Baum (RuleStructure) in einen
 * visualisierbaren Baum (TreeNode) für die Tree-Engine umwandelt.
 * Ermöglicht Interaktion (Klick zum Deaktivieren).
 * @fileoverview
 */

const RuleTreeAdapter = {
    /**
     * Konvertiert einen RuleNode (Wurzel) in einen TreeNode.
     * @param {RuleNode} ruleNode - Der Wurzelknoten der Regelstrategie.
     * @returns {TreeNode} Der Wurzelknoten für die Visualisierung.
     */
    convert(ruleNode) {
        let idCounter = 0;

        // Rekursive Hilfsfunktion
        function traverse(rNode) {
            // TreeNode erstellen (id, data, depth placeholder)
            // Depth wird später von der Engine berechnet oder hier mitgeführt
            // Wir nutzen hier dummy depth 0, die Engine fixiert das.
            const tNode = new TreeNode(idCounter++, rNode, 0);
            
            // Visuelle Eigenschaften basierend auf Typ setzen
            tNode.annotation = rNode.name;
            
            // Status: Wenn Regel inaktiv, markieren wir das visuell
            if (!rNode.active) {
                tNode.isForbidden = true; // Nutzt die rote Farbe der Engine für "Deaktiviert"
                tNode.annotation += " (OFF)";
            }

            // Typ-Unterscheidung für Darstellung
            if (rNode.conditionFn) {
                // Bedingung (Raute in UML, hier Text)
                tNode.annotation = "? " + rNode.name;
                
                // Kinder (Ja/Nein Zweige)
                if (rNode.thenNode) {
                    const child = traverse(rNode.thenNode);
                    child.parentMove = "Ja"; // Beschriftung an der Kante
                    tNode.children.push(child);
                }
                if (rNode.elseNode) {
                    const child = traverse(rNode.elseNode);
                    child.parentMove = "Nein";
                    tNode.children.push(child);
                }
            } 
            else if (rNode.children && rNode.children.length > 0) {
                // Gruppe (Ordner)
                rNode.children.forEach(childRule => {
                    if (childRule) {
                        const childTNode = traverse(childRule);
                        tNode.children.push(childTNode);
                    }
                });
            }
            
            return tNode;
        }

        return traverse(ruleNode);
    },

    /**
     * Zeichnet den Inhalt eines Knotens in den Canvas.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {RuleNode} data 
     * @param {number} size 
     */
    drawNode(ctx, data, size) {
        // Farben und Symbole je nach Typ
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "20px sans-serif";

        if (data.conditionFn) {
            ctx.fillStyle = "#e67e22"; // Orange für Bedingungen
            ctx.fillText("◇", size/2, size/2);
        } else if (data.children) {
            ctx.fillStyle = "#3498db"; // Blau für Gruppen
            ctx.fillText("📂", size/2, size/2);
        } else {
            ctx.fillStyle = "#2ecc71"; // Grün für Aktionen
            ctx.fillText("⚡", size/2, size/2);
        }
    }
};