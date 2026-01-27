/* --- FILE: js/ai/heuristics.js --- */
/**
 * Sammlung von Heuristiken für verschiedene Spiele.
 * 
 * SCHNITTSTELLE: Alle Heuristiken haben die Signatur:
 * ```
 * (gameState: GameState, player: number) => number
 * ```
 * Rückgabewerte:
 * - Positiv = Gut für Player (maximieren)
 * - Negativ = Schlecht für Player
 * - 0 = Neutral/Offen
 * 
 * Skalierung: Terminale Zustände >> Materiale Vorteile >> Position Details
 * @namespace
 */
const HeuristicsLibrary = {

    /**
     * Standard Bewertung für Endliche Spiele (Sieg/Niederlage).
     * Nur Terminale Zustände bewerten.
     * @param {GameState} gameState - Der zu bewertende Zustand.
     * @param {number} player - Der Spieler, aus dessen Sicht bewertet wird.
     * @returns {number} Score (-1000, 0, 1000).
     */
    winLoss: (gameState, player) => {
        if (gameState.winner === player) return 1000;
        if (gameState.winner !== 0 && gameState.winner !== 3) return -1000; // Gegner gewinnt
        return 0; // Remis oder offen
    },

    // ============================================================================
    // REGULAR TTT (3x3)
    // ============================================================================

    /**
     * Heuristik für Standard 3x3 Tic-Tac-Toe.
     * Triviale Struktur: Gewinn/Verlust/Remis.
     * Auf Blattebene zählen wir offene Linien (2-er Reihen).
     * @param {TTTRegularBoard} game - Das Regular-Board.
     * @param {number} player - Der Spieler (1 oder 2).
     * @returns {number} Score.
     */
    regularTTT: (game, player) => {
        // 1. Direkte Terminalzustände
        if (game.winner === player) return 1000;
        if (game.winner !== 0 && game.winner !== 3) return -1000;
        if (game.winner === 3) return 0; // Remis

        let score = 0;
        const opponent = player === 1 ? 2 : 1;
        const grid = game.grid;

        // 2. Zähle offene Linien (Reihen, Spalten, Diagonalen mit 2 eigenen Steinen)
        // Reihen
        for (let r = 0; r < 3; r++) {
            const row = [grid[r*3], grid[r*3+1], grid[r*3+2]];
            const own = row.filter(c => c === player).length;
            const opp = row.filter(c => c === opponent).length;
            if (own === 2 && opp === 0) score += 50;  // Potential zu gewinnen
            if (opp === 2 && own === 0) score -= 50;  // Gegner könnte gewinnen
            if (own === 1 && opp === 0) score += 5;
            if (opp === 1 && own === 0) score -= 5;
        }

        // Spalten
        for (let c = 0; c < 3; c++) {
            const col = [grid[c], grid[c+3], grid[c+6]];
            const own = col.filter(x => x === player).length;
            const opp = col.filter(x => x === opponent).length;
            if (own === 2 && opp === 0) score += 50;
            if (opp === 2 && own === 0) score -= 50;
            if (own === 1 && opp === 0) score += 5;
            if (opp === 1 && own === 0) score -= 5;
        }

        // Diagonalen
        const diag1 = [grid[0], grid[4], grid[8]];
        const diag2 = [grid[2], grid[4], grid[6]];
        for (const diag of [diag1, diag2]) {
            const own = diag.filter(x => x === player).length;
            const opp = diag.filter(x => x === opponent).length;
            if (own === 2 && opp === 0) score += 50;
            if (opp === 2 && own === 0) score -= 50;
            if (own === 1 && opp === 0) score += 5;
            if (opp === 1 && own === 0) score -= 5;
        }

        // 3. Zentrumsgewichtung (Zentrum ist strategisch wichtiger)
        const center = grid[4];
        if (center === player) score += 3;
        else if (center === opponent) score -= 3;

        // 4. Eckengewichtung (Ecken sind strategisch wichtig)
        const corners = [grid[0], grid[2], grid[6], grid[8]];
        const cornerOwn = corners.filter(c => c === player).length;
        const cornerOpp = corners.filter(c => c === opponent).length;
        score += (cornerOwn - cornerOpp) * 2;

        return score;
    },

    // ============================================================================
    // 3D TTT (3x3x3 oder 4x4x4)
    // ============================================================================

    /**
     * Heuristik für 3D Tic-Tac-Toe.
     * VEREINFACHTE VERSION für bessere Performance!
     * Fokus auf Material und schnelle Bewertung.
     * @param {TTT3DBoard} game - Das 3D-Board.
     * @param {number} player - Der Spieler (1 oder 2).
     * @returns {number} Score.
     */
    threeDTTT: (game, player) => {
        // 1. Direkte Terminalzustände (höchste Priorität)
        if (game.winner === player) return 1000;
        if (game.winner !== 0 && game.winner !== 3) return -1000;
        if (game.winner === 3) return 0; // Remis

        let score = 0;
        const opponent = player === 1 ? 2 : 1;
        const grid = game.grid;
        const size = game.size; // 3 oder 4
        const size2 = size * size;
        const size3 = size2 * size;

        // 2. Materialvorteil zählen (WICHTIG!)
        // Stark gewichtet, um gute Züge zu bevorzugen
        let ownStones = 0, oppStones = 0;
        for (let i = 0; i < size3; i++) {
            if (grid[i] === player) ownStones++;
            else if (grid[i] === opponent) oppStones++;
        }
        score += (ownStones - oppStones) * 100;  // War: *2, jetzt stark gewichtet!

        // 3. ZENTRUM-GEWICHTUNG (3x3x3: Zentraler Würfel ist wertvoll)
        // Index des Zentrums: 13 (= 1 + 1*3 + 1*9)
        if (size === 3) {
            const centerIndices = [13];  // Nur echter Mittelpunkt
            for (const idx of centerIndices) {
                if (grid[idx] === player) score += 30;
                else if (grid[idx] === opponent) score -= 30;
            }
        } else if (size === 4) {
            // 4x4x4: Vier zentrale Zellen
            const centerIndices = [21, 22, 25, 26];
            for (const idx of centerIndices) {
                if (grid[idx] === player) score += 15;
                else if (grid[idx] === opponent) score -= 15;
            }
        }

        // 4. EBENEN-KONTROLLE (XY-Ebenen zählen)
        // Wenn man eine ganze Ebene kontrolliert, wertvoll!
        for (let z = 0; z < size; z++) {
            let ownInPlane = 0, oppInPlane = 0;
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const idx = x + y * size + z * size2;
                    if (grid[idx] === player) ownInPlane++;
                    else if (grid[idx] === opponent) oppInPlane++;
                }
            }
            // Vorteil pro Stein in dominanter Ebene
            if (ownInPlane > oppInPlane) score += (ownInPlane - oppInPlane) * 5;
            else if (oppInPlane > ownInPlane) score -= (oppInPlane - ownInPlane) * 5;
        }

        return score;
    },

    // ============================================================================
    // ULTIMATE TTT (9x9 mit 3x3 Makro-Board)
    // ============================================================================

    /**
     * Heuristik für Ultimate Tic-Tac-Toe.
     * Berücksichtigt: Makro-Board Siege, Mikro-Materialie, offene Linien.
     * @param {UltimateBoard} game - Das Ultimate Board.
     * @param {number} player - Der Spieler (1 oder 2).
     * @returns {number} Der berechnete Score.
     */
    ultimateTTT: (game, player) => {
        // 1. Check direkten Sieg (höchste Prio)
        if (game.winner === player) return 10000;
        if (game.winner !== 0 && game.winner !== 3) return -10000;
        if (game.winner === 3) return 0; // Remis

        let score = 0;
        const opponent = player === 1 ? 2 : 1;

        // 2. MAKRO-BOARD BEWERTUNG (HÖCHSTE PRIORITÄT)
        // Gewonnene Sub-Boards sind viel wichtiger als Material!
        for (let i = 0; i < 9; i++) {
            const macroVal = game.macroBoard[i];
            if (macroVal === player) score += 1000;
            else if (macroVal === opponent) score -= 1000;
        }

        // 3. MIKRO-BOARD BEWERTUNG (wenn Makro-Board noch offen)
        // Nur für offene Boards evaluieren (Optimierung!)
        for (let i = 0; i < 9; i++) {
            if (game.macroBoard[i] === 0) {
                const subBoard = game.boards[i];
                
                // 3a. Zähle Steine im Sub-Board (Material)
                let ownStones = 0, oppStones = 0;
                for (let j = 0; j < 9; j++) {
                    if (subBoard[j] === player) ownStones++;
                    else if (subBoard[j] === opponent) oppStones++;
                }
                score += (ownStones - oppStones) * 10;

                // 3b. Schnell: Nur 2er-Linien zählen (nicht 1er!)
                // Das reduziert Komplexität erheblich
                // Reihen
                for (let r = 0; r < 3; r++) {
                    const row = [subBoard[r*3], subBoard[r*3+1], subBoard[r*3+2]];
                    const own = row.filter(c => c === player).length;
                    const opp = row.filter(c => c === opponent).length;
                    if (own === 2 && opp === 0) score += 30;   // Wir gewinnen bald
                    if (opp === 2 && own === 0) score -= 30;   // Gegner gewinnt bald
                }

                // Spalten
                for (let c = 0; c < 3; c++) {
                    const col = [subBoard[c], subBoard[c+3], subBoard[c+6]];
                    const own = col.filter(x => x === player).length;
                    const opp = col.filter(x => x === opponent).length;
                    if (own === 2 && opp === 0) score += 30;
                    if (opp === 2 && own === 0) score -= 30;
                }

                // Diagonalen
                const diag1 = [subBoard[0], subBoard[4], subBoard[8]];
                const diag2 = [subBoard[2], subBoard[4], subBoard[6]];
                for (const diag of [diag1, diag2]) {
                    const own = diag.filter(x => x === player).length;
                    const opp = diag.filter(x => x === opponent).length;
                    if (own === 2 && opp === 0) score += 30;
                    if (opp === 2 && own === 0) score -= 30;
                }

                // 3c. Zentrum-Gewichtung (Zentrum Felder sind strategisch wichtig)
                const center = subBoard[4];
                if (center === player) score += 5;
                else if (center === opponent) score -= 5;
            }
        }

        // 4. STRATEGIE: "Eroberbare" Makro-Boards
        // Ein Board ist „eroberbar" wenn wir die nächste Runde gewinnen können
        let conquerable = 0;
        for (let i = 0; i < 9; i++) {
            if (game.macroBoard[i] === 0) {
                const subBoard = game.boards[i];
                const ownCount = subBoard.filter(c => c === player).length;
                const oppCount = subBoard.filter(c => c === opponent).length;
                // Priorität: Boards wo wir die Mehrheit haben
                if (ownCount >= 2 && oppCount === 0) {
                    conquerable++;
                }
            }
        }
        score += conquerable * 50;

        return score;
    }
};