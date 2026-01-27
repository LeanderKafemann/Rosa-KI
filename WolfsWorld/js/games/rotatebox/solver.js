/**
 * @fileoverview KI-Solver Wrapper für RotateBox.
 * Nutzt die generische SearchEngine, um das Level zu lösen.
 */

/**
 * Findet den kürzesten Weg mittels Breitensuche (BFS).
 * Wrapper für SearchEngine, der asynchron läuft um das UI nicht zu blockieren.
 * * @param {RotateBoard} startBoard - Der Startzustand.
 * @returns {Promise<{path: string[], nodes: number}|null>} Das Ergebnisobjekt oder null.
 */
async function solveBFS(startBoard) {
    if (!startBoard) return null;

    // SearchEngine aus shared/js/ai/search-algorithms.js nutzen
    const engine = new SearchEngine({
        strategy: 'BFS', 
        maxDepth: 100, // Sicherheitslimit
        checkDuplicates: true
    });

    // Promise Wrapper für Asynchronität
    return new Promise((resolve) => {
        // Kleiner Timeout gibt dem Browser Zeit zum Rendern
        setTimeout(async () => {
            const result = await engine.solve(startBoard);
            
            if (result.success) {
                resolve({
                    path: result.path, // Array von Zügen ['L', 'R', ...]
                    nodes: result.nodesVisited
                });
            } else {
                resolve(null);
            }
        }, 10);
    });
}