/**
 * @fileoverview Vorkonfigurierte Agent-Profile für die Arena.
 * Definiert verschiedene Konfigurationen für MiniMax, RuleBased und Random Agenten.
 */

const AgentProfiles = {
    // ============ MINIMAX PROFILE ============

    minimaxCautious: {
        name: "Minimax (Vorsichtig)",
        description: "Minimax mit Suchtiefe 2 - schnell aber weniger optimal",
        type: "minimax",
        config: {
            maxDepth: 2,
            useAlphaBeta: true,
            heuristic: "winLoss"
        }
    },

    minimaxBalanced: {
        name: "Minimax (Ausgewogen)",
        description: "Minimax mit Suchtiefe 3 - gutes Gleichgewicht",
        type: "minimax",
        config: {
            maxDepth: 3,
            useAlphaBeta: true,
            heuristic: "winLoss"
        }
    },

    minimaxAggressive: {
        name: "Minimax (Aggressiv)",
        description: "Minimax mit Suchtiefe 4 - sehr stark aber langsam",
        type: "minimax",
        config: {
            maxDepth: 4,
            useAlphaBeta: true,
            heuristic: "winLoss"
        }
    },

    minimaxHeuristicCentered: {
        name: "Minimax (Zentraler Fokus)",
        description: "Minimax Tiefe 3 mit Zentralitäts-Heuristik",
        type: "minimax",
        config: {
            maxDepth: 3,
            useAlphaBeta: true,
            heuristic: "centerControl"
        }
    },

    minimaxHeuristicMobility: {
        name: "Minimax (Mobilität)",
        description: "Minimax Tiefe 3 mit Beweglichkeits-Heuristik",
        type: "minimax",
        config: {
            maxDepth: 3,
            useAlphaBeta: true,
            heuristic: "mobility"
        }
    },

    // ============ RULE-BASED PROFILE ============

    ruleBasedConservative: {
        name: "Regel-KI (Konservativ)",
        description: "Defensive Regelstruktur mit Fokus auf Blockieren",
        type: "ruleBased",
        config: {
            strategy: "defensive"
        }
    },

    ruleBasedAggressive: {
        name: "Regel-KI (Offensiv)",
        description: "Aggressive Regelstruktur mit Fokus auf Gewinnen",
        type: "ruleBased",
        config: {
            strategy: "offensive"
        }
    },

    ruleBasedBalanced: {
        name: "Regel-KI (Ausgewogen)",
        description: "Ausgewogene Regelstruktur - offensiv und defensiv",
        type: "ruleBased",
        config: {
            strategy: "balanced"
        }
    },

    // ============ RANDOM PROFILE ============

    random: {
        name: "Zufalls-KI",
        description: "Wählt komplett zufällig - Baseline für Vergleiche",
        type: "random",
        config: {}
    },

    // ============ SPEZIELLE VERGLEICHE ============

    minimaxDebugger: {
        name: "Minimax (Debugger)",
        description: "Minimax mit Trace-Ausgabe (nur für Analyze)",
        type: "minimax",
        config: {
            maxDepth: 2,
            useAlphaBeta: true,
            heuristic: "winLoss",
            captureTrace: true
        }
    }
};

/**
 * Factory-Funktion zum Erstellen von Agenten aus Profilen.
 * @param {string} profileKey - Schlüssel aus AgentProfiles
 * @param {boolean} [customConfig=false] - Ob benutzerdefinierte Konfiguration erlaubt ist
 * @returns {Agent|null} Der erstellte Agent oder null
 */
function createAgentFromProfile(profileKey, customConfig = null) {
    if (!profileKey) {
        console.error("createAgentFromProfile: profileKey ist undefined/null");
        return null;
    }

    const profile = AgentProfiles[profileKey];
    if (!profile) {
        console.error(`createAgentFromProfile: Profile nicht gefunden: ${profileKey}`);
        console.error("Verfügbare Profile:", Object.keys(AgentProfiles));
        return null;
    }

    const config = customConfig ? { ...profile.config, ...customConfig } : profile.config;

    console.log(`[createAgentFromProfile] Erstelle Agent vom Typ: ${profile.type}, Config:`, config);

    let agent = null;

    switch (profile.type) {
        case "minimax":
            agent = createMinimaxAgent(profile.name, config);
            break;

        case "ruleBased":
            agent = createRuleBasedAgent(profile.name, config);
            break;

        case "random":
            agent = new RandomAgent(profile.name);
            break;

        default:
            console.error(`createAgentFromProfile: Unbekannter Agent-Typ: ${profile.type}`);
            return null;
    }

    if (!agent) {
        console.error(`createAgentFromProfile: Agent-Erstellung fehlgeschlagen für ${profileKey}`);
        return null;
    }

    console.log(`✓ Agent erstellt: ${agent.name} (Typ: ${agent.constructor.name})`);
    return agent;
}

/**
 * Erstellt einen Minimax-Agenten mit gegebener Konfiguration.
 * @private
 */
function createMinimaxAgent(name, config) {
    try {
        let heuristicFn = HeuristicsLibrary.winLoss; // Default

        // Heuristik-Funktion auswählen
        if (config.heuristic && HeuristicsLibrary[config.heuristic]) {
            heuristicFn = HeuristicsLibrary[config.heuristic];
        }

        const agent = new MinimaxAgent({
            name: name,
            maxDepth: config.maxDepth || 3,
            useAlphaBeta: config.useAlphaBeta !== false,
            heuristicFn: heuristicFn,
            captureTrace: config.captureTrace || false
        });

        if (!agent) {
            console.error("createMinimaxAgent: MinimaxAgent-Konstruktor returned null");
            return null;
        }

        console.log(`  ✓ MinimaxAgent erstellt: ${agent.name}, Depth=${config.maxDepth}, Heuristic=${config.heuristic}`);
        return agent;
    } catch (error) {
        console.error("createMinimaxAgent: Fehler:", error.message);
        console.error("Stack:", error.stack);
        return null;
    }
}

/**
 * Erstellt einen Regel-Agenten mit gegebener Konfiguration.
 * @private
 */
function createRuleBasedAgent(name, config) {
    try {
        // Verschiedene Regelstrukturen bauen - basierend auf existierender TTTRulesLibrary
        let tree;

        switch (config.strategy) {
            case "offensive":
                // Offensive: Priorität auf Gewinnen
                tree = new RuleGroup(name || "Regel-KI (Offensiv)");
                tree.add(TTTRulesLibrary.basics.win);
                if (TTTRulesLibrary.regular) {
                    tree.add(TTTRulesLibrary.regular.fork);
                    tree.add(TTTRulesLibrary.regular.blockFork);
                    tree.add(TTTRulesLibrary.regular.center);
                }
                tree.add(TTTRulesLibrary.basics.block);
                tree.add(TTTRulesLibrary.basics.random);
                break;

            case "defensive":
                // Defensive: Priorität auf Blocken
                tree = new RuleGroup(name || "Regel-KI (Konservativ)");
                tree.add(TTTRulesLibrary.basics.block);
                tree.add(TTTRulesLibrary.basics.win);
                if (TTTRulesLibrary.regular) {
                    tree.add(TTTRulesLibrary.regular.blockFork);
                    tree.add(TTTRulesLibrary.regular.corner);
                }
                tree.add(TTTRulesLibrary.basics.random);
                break;

            case "balanced":
            default:
                // Balanced: Gemischte Strategien
                tree = new RuleGroup(name || "Regel-KI (Ausgewogen)");
                tree.add(TTTRulesLibrary.basics.win);
                tree.add(TTTRulesLibrary.basics.block);
                if (TTTRulesLibrary.regular) {
                    tree.add(TTTRulesLibrary.regular.fork);
                    tree.add(TTTRulesLibrary.regular.blockFork);
                    tree.add(TTTRulesLibrary.regular.center);
                    tree.add(TTTRulesLibrary.regular.corner);
                }
                tree.add(TTTRulesLibrary.basics.random);
                break;
        }

        const agent = new RuleBasedAgent(tree);
        if (!agent) {
            console.error("createRuleBasedAgent: RuleBasedAgent-Konstruktor returned null");
            return null;
        }

        console.log(`  ✓ RuleBasedAgent erstellt: ${agent.name}, Strategy=${config.strategy}`);
        return agent;
    } catch (error) {
        console.error("createRuleBasedAgent: Fehler:", error.message);
        console.error("Stack:", error.stack);
        return null;
    }
}

/**
 * Gibt alle verfügbaren Profile als Array zurück.
 * @returns {Array<Object>}
 */
function getAvailableProfiles() {
    return Object.entries(AgentProfiles).map(([key, profile]) => ({
        key,
        name: profile.name,
        description: profile.description,
        type: profile.type
    }));
}

/**
 * Filtert Profile nach Typ.
 * @param {string} type - "minimax", "ruleBased", "random"
 * @returns {Array<Object>}
 */
function getProfilesByType(type) {
    return getAvailableProfiles().filter(p => p.type === type);
}
