/**
 * @fileoverview Datenstrukturen für das Regelsystem.
 * Definiert die Bausteine für den Entscheidungsbaum (Composite Pattern).
 */

/**
 * Abstrakte Basisklasse für alle Regel-Knoten.
 */
class RuleNode {
    /**
     * @param {string} name - Anzeigename der Regel.
     * @param {string} description - Tooltip/Beschreibung.
     */
    constructor(name, description = "") {
        this.name = name;
        this.description = description;
        this.active = true; // Kann per UI deaktiviert werden
    }

    /**
     * Muss von Unterklassen implementiert werden.
     * @param {GameState} gameState 
     * @returns {Object|null} { move, reason } oder null
     */
    evaluate(gameState) { throw new Error("Abstract method"); }
}

/**
 * Eine atomare Regel, die einen Zug vorschlägt (Blatt im Baum).
 */
class AtomicRule extends RuleNode {
    /**
     * @param {string} name 
     * @param {string} description 
     * @param {function(GameState): (number|Object|null)} logicFn - Gibt Zug oder null zurück.
     */
    constructor(name, description, logicFn) {
        super(name, description);
        this.logicFn = logicFn;
    }

    evaluate(gameState) {
        if (!this.active) return null;
        const move = this.logicFn(gameState);
        return (move !== null) ? { move, reason: this.name, node: this } : null;
    }
}

/**
 * Eine Gruppe von Regeln. Geht die Kinder der Reihe nach durch (Priorität).
 * Das erste Kind, das einen Zug liefert, gewinnt.
 */
class RuleGroup extends RuleNode {
    constructor(name, description = "", children = []) {
        super(name, description);
        this.children = children;
    }

    add(node) {
        this.children.push(node);
        return this;
    }

    evaluate(gameState) {
        if (!this.active) return null;
        for (const child of this.children) {
            const result = child.evaluate(gameState);
            if (result) return result;
        }
        return null;
    }
}

/**
 * Ein Verzweigungsknoten (If-Then-Else).
 * Ermöglicht echte Entscheidungsbäume statt nur Listen.
 */
class ConditionNode extends RuleNode {
    /**
     * @param {string} name 
     * @param {string} description 
     * @param {function(GameState): boolean} conditionFn - Prüft Bedingung.
     * @param {RuleNode} thenNode - Wird ausgeführt, wenn true.
     * @param {RuleNode} elseNode - Wird ausgeführt, wenn false.
     */
    constructor(name, description, conditionFn, thenNode, elseNode) {
        super(name, description);
        this.conditionFn = conditionFn;
        this.thenNode = thenNode;
        this.elseNode = elseNode;
    }

    evaluate(gameState) {
        if (!this.active) return null; // Ganze Verzweigung deaktivieren

        // Bedingung prüfen
        if (this.conditionFn(gameState)) {
            // JA-Zweig
            return this.thenNode ? this.thenNode.evaluate(gameState) : null;
        } else {
            // NEIN-Zweig
            return this.elseNode ? this.elseNode.evaluate(gameState) : null;
        }
    }
}

/**
 * Wrapper für den gesamten Baum.
 */
class DecisionTree {
    constructor(name, rootNode) {
        this.name = name;
        this.root = rootNode;
    }

    getDecision(gameState) {
        if (!this.root) return null;
        return this.root.evaluate(gameState);
    }
}