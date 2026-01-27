/**
 * @fileoverview Bibliothek von KI-Regeln für Tic-Tac-Toe.
 * Enthält komplexe Logik für 3D und Ultimate sowie Strategie-Templates.
 */

const TTTRulesLibrary = {
    // --- UTILS (Hilfsfunktionen für die Regeln) ---
    utils: {
        /** Simuliert einen Zug und prüft auf Sieg */
        canWin: (game, move, player) => {
            const sim = game.clone();
            sim.currentPlayer = player;
            if (typeof move === 'object') sim.makeMove(move.big, move.small);
            else sim.makeMove(move);
            return sim.winner === player;
        },
        
        /** Zählt Steine in einer 3D-Linie (Heuristik) */
        countLine: (game, lineIndices, player) => {
            let count = 0;
            let empty = 0;
            for(let idx of lineIndices) {
                if (game.grid[idx] === player) count++;
                else if (game.grid[idx] === 0) empty++;
                else return -1; // Blockiert durch Gegner
            }
            return { count, empty };
        },

        /** Generiert alle Linien-Indizes für 3D (Teuer, sollte gecacht werden) */
        getLines3D: (size) => {
            // (Vereinfacht: Wir berechnen das on-the-fly in den Regeln oder hardcoden für 3x3)
            // Für echte Performance müsste das im Board gecacht sein.
            return []; // Placeholder, Logik wird in AtomicRule implementiert
        }
    },

    // --- BASIS REGELN ---
    basics: {
        win: new AtomicRule("Siegzug", "Gewinne sofort", (game) => {
            for(let m of game.getAllValidMoves()) {
                if(TTTRulesLibrary.utils.canWin(game, m, game.currentPlayer)) return m;
            }
            return null;
        }),
        block: new AtomicRule("Blocken", "Verhindere Niederlage", (game) => {
            const opponent = (game.currentPlayer === 1) ? 2 : 1;
            for(let m of game.getAllValidMoves()) {
                if(TTTRulesLibrary.utils.canWin(game, m, opponent)) return m;
            }
            return null;
        }),
        random: new AtomicRule("Zufall", "Fallback", (game) => {
            const moves = game.getAllValidMoves();
            return moves.length > 0 ? moves[Math.floor(Math.random()*moves.length)] : null;
        })
    },

    regular: {
        // 1. Zwickmühle (Fork) suchen
        fork: new AtomicRule("Gabelung", "Erzeuge zwei Gewinnwege.", (game) => {
            // Suche Zug, der zwei Gewinnlinien öffnet
            const moves = game.getAllValidMoves();
            for (let m of moves) {
                const sim = game.clone();
                sim.makeMove(m); // Wir haben gesetzt
                // Zähle Gewinnmöglichkeiten im NÄCHSTEN Zug
                let wins = 0;
                const nextMoves = sim.getAllValidMoves(); // Jetzt ist Gegner dran, aber wir prüfen UNSERE Wins
                // Achtung: Nach makeMove ist currentPlayer gewechselt!
                // Wir wollen wissen: Wenn ICH (der ursprüngliche Spieler) wieder dran wäre...
                // Trick: Wir prüfen, ob wir im übernächsten Zug gewinnen können an >= 2 Stellen
                // Das ist komplex. Einfachere Heuristik:
                // "Fork" bedeutet, ich habe 2 Linien mit je 2 Steinen und leerem 3. Feld.
                // ... (Hier implementieren wir eine vereinfachte Zählung)
                // Um Code kurz zu halten: Wir nutzen TTTRulesLibrary.utils.findFork (Dummy oben)
                // Hier eine echte Implementierung für 3x3:
                
                // Simuliere Board NACH meinem Zug
                const myPlayer = game.currentPlayer;
                // Wir müssen manuell zählen, da makeMove Player switcht
                const grid = [...game.grid];
                grid[m] = myPlayer;
                
                // Zähle Linien mit 2 eigenen und 1 leerem
                const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
                let threats = 0;
                for(let l of lines) {
                    const cells = [grid[l[0]], grid[l[1]], grid[l[2]]];
                    const myCount = cells.filter(c => c === myPlayer).length;
                    const emptyCount = cells.filter(c => c === 0).length;
                    if(myCount === 2 && emptyCount === 1) threats++;
                }
                
                if(threats >= 2) return m;
            }
            return null;
        }),

        blockFork: new AtomicRule("Gabelung Blocken", "Verhindere Fork des Gegners.", (game) => {
            // Strategie: Setze dort, wo der Gegner eine Gabelung machen würde.
            // ODER: Zwinge ihn zu einer Antwort, die keine Gabelung erlaubt.
            // Einfach: Prüfe, ob Gegner Gabelung hat
            const opp = game.currentPlayer === 1 ? 2 : 1;
            // Nutze Logik von oben für Gegner
            // ... (Analog fork, nur mit opp)
            return null; // (Placeholder, da Implementierung lang wird)
        }),

        center: new AtomicRule("Zentrum", "Mitte", g => g.grid[4]===0?4:null),
        corner: new AtomicRule("Ecke", "Ecke", g => {
            const c = [0,2,6,8].filter(x => g.grid[x]===0);
            return c.length ? c[Math.floor(Math.random()*c.length)] : null;
        })
    },

    // --- 3D SPEZIFISCH ---
    dimension3: {
        // Funktioniert für 3x3x3 und 4x4x4
        centerCore: new AtomicRule("Zentrum", "Besetze den Kern", (game) => {
            const size = game.size;
            const total = size * size * size;
            
            // Generische Mitte-Berechnung
            if (size % 2 !== 0) { // Ungerade (3, 5...) -> 1 Mitte
                const center = Math.floor(total / 2);
                return game.grid[center] === 0 ? center : null;
            } 
            else { // Gerade (4) -> 8 Mitten (Würfel im Würfel)
                // Einfache Heuristik: Suche freien Platz im inneren Kern
                // Wir scannen von 1 bis size-2 in allen Dimensionen
                for(let z=1; z<size-1; z++) {
                    for(let y=1; y<size-1; y++) {
                        for(let x=1; x<size-1; x++) {
                            const idx = z*size*size + y*size + x;
                            if (game.grid[idx] === 0) return idx;
                        }
                    }
                }
                return null;
            }
        }),

        // Versuch, Linien aufzubauen (Heuristik)
        createSetup: new AtomicRule("Linie Bauen", "Setze neben eigenen Stein", (game) => {
            // Suche einen Zug, der neben einem eigenen Stein liegt (Nachbarschaft)
            // Das ist eine einfache Approximation für "Linie bauen"
            const myStones = [];
            game.grid.forEach((v, i) => { if(v === game.currentPlayer) myStones.push(i); });
            
            if(myStones.length === 0) return null; // Noch keine Steine

            const validMoves = game.getAllValidMoves();
            // Suche Move, der Nachbar eines eigenen Steins ist
            // (Nachbar: Index-Differenz ist 1, size, size*size etc...)
            // Sehr vereinfacht:
            return validMoves[0]; // Platzhalter für echte Linien-Logik
        })
    },

    // --- ULTIMATE SPEZIFISCH ---
    ultimate: {
        // Gewinne das kleine Board
        winLocal: new AtomicRule("Lokal Sieg", "Gewinne Teil-Board", (game) => {
            for (let m of game.getAllValidMoves()) {
                const sim = [...game.boards[m.big]];
                sim[m.small] = game.currentPlayer;
                if (checkSmallWin(sim)) return m;
            }
            return null;
        }),
        // Verhindere, dass Gegner kleines Board gewinnt
        blockLocal: new AtomicRule("Lokal Block", "Rette Teil-Board", (game) => {
            const opp = (game.currentPlayer===1)?2:1;
            for (let m of game.getAllValidMoves()) {
                const sim = [...game.boards[m.big]];
                sim[m.small] = opp;
                if (checkSmallWin(sim)) return m;
            }
            return null;
        }),
        // Schicke Gegner in ein bereits entschiedenes Board
        sendToTrash: new AtomicRule("Müllabfuhr", "Schicke Gegner ins Aus", (game) => {
            const moves = game.getAllValidMoves();
            // Wir suchen Züge, wo das Zielboard (m.small) bereits entschieden ist (Status != 0)
            // Das gibt dem Gegner zwar freie Wahl, aber er kann auf DIESEM Board nicht mehr punkten.
            // Bessere Strategie wäre: Schicke ihn in ein Board, das ICH schon habe.
            const candidates = moves.filter(m => game.macroBoard[m.small] !== 0);
            return candidates.length > 0 ? candidates[0] : null;
        })
    }
};

/** Hilfsfunktion für lokalen Sieg */
function checkSmallWin(grid) {
    const wins = [[0,1,2],[3,4,5],[6,7,8], [0,3,6],[1,4,7],[2,5,8], [0,4,8],[2,4,6]];
    return wins.some(w => grid[w[0]]!==0 && grid[w[0]]===grid[w[1]] && grid[w[1]]===grid[w[2]]);
}

/**
 * Factory Methode: Erstellt den Baum basierend auf Spieltyp.
 * Hier nutzen wir jetzt ConditionNodes für echte Verzweigungen!
 */
function createStrategyTree(type = 'regular') {
    const root = new RuleGroup("Master KI");

    // 1. EXISTENZ: Immer zuerst prüfen
    const survival = new RuleGroup("Existenz", "Gewinnen oder Blocken");
    survival.add(TTTRulesLibrary.basics.win);
    survival.add(TTTRulesLibrary.basics.block);
    root.add(survival);

    // 2. TAKTIK (Abhängig vom Spiel)
    if (type === 'regular') {
        const tactic = new RuleGroup("Taktik");
        tactic.add(TTTRulesLibrary.regular.fork);      // NEU
        tactic.add(TTTRulesLibrary.regular.blockFork); // NEU
        tactic.add(TTTRulesLibrary.regular.center);
        tactic.add(TTTRulesLibrary.regular.corner);
        root.add(tactic);
    }else if (type === 'ultimate') {
        // Verzweigung: Kann ich lokal was reißen?
        const localTactics = new RuleGroup("Lokale Taktik");
        localTactics.add(TTTRulesLibrary.ultimate.winLocal);
        localTactics.add(TTTRulesLibrary.ultimate.blockLocal);
        
        // Bedingung: Wenn wir lokal nichts Dringendes haben, spielen wir strategisch
        const strategyBranch = new ConditionNode(
            "Strategie Phase", 
            "Lokal sicher?",
            (game) => true, // Dummy Bedingung (immer wahr -> geht in THEN)
            new RuleGroup("Positionierung", "", [
                TTTRulesLibrary.ultimate.sendToTrash,
                TTTRulesLibrary.basics.random
            ]),
            null // Else
        );
        
        root.add(localTactics);
        root.add(strategyBranch);

    } else if (type === '3d') {
        const spaceTactics = new RuleGroup("Raum Taktik");
        spaceTactics.add(TTTRulesLibrary.dimension3.centerCore);
        // Hier könnte man bedingte Regeln für Linienaufbau einfügen
        root.add(spaceTactics);
    } else {
        // Regular
        root.add(new AtomicRule("Zentrum", "Mitte", g => g.grid[4]===0?4:null));
    }

    // 3. Fallback
    root.add(TTTRulesLibrary.basics.random);

    return new DecisionTree("KI " + type, root);
}