/**
 * Ein Agent, der Entscheidungen basierend auf einem Entscheidungsbaum trifft.
 * @class RuleBasedAgent
 * @extends Agent
 */
class RuleBasedAgent extends Agent {
    /**
     * @param {DecisionTree} tree - Der Regelbaum (siehe rule-structure.js).
     */
    constructor(tree) {
        super(tree.name || "Regel-KI");
        this.tree = tree;
    }

    /**
     * Delegiert die Entscheidung an den Baum.
     * @param {GameState} gameState 
     * @returns {Object|null} Das Ergebnis des Baums.
     */
    getAction(gameState) {
        return this.tree.getDecision(gameState);
    }
}