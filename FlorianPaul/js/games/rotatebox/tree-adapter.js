/**
 * @fileoverview Adapter, der RotateBox-Zustände in einen Visualisierungs-Baum wandelt.
 */

const RotateBoxAdapter = {
    
    /**
     * Generiert den Suchbaum.
     * @param {RotateBoard} startBoard - Der Startzustand.
     * @param {Object} options - Parameter (Tiefe, Algo, Duplikate).
     * @returns {TreeNode} Der Wurzelknoten.
     */
    generateTree(startBoard, options = {}) {
        const {
            maxDepth = 3,
            checkDuplicates = true,
            algorithm = 'BFS', // 'BFS' oder 'DFS'
            continueAfterSolution = false
        } = options;

        let nodeId = 0;
        // TreeNode Klasse muss global verfügbar sein (durch tree-engine.js)
        const root = new TreeNode(nodeId++, startBoard.clone(), 0);
        
        // Speicher für besuchte Zustände: Map<StateHash, Depth>
        const visitedStates = new Map();
        visitedStates.set(startBoard.getStateKey(), 0);

        // Queue/Stack für die Traversierung
        let toVisit = [root];

        while (toVisit.length > 0) {
            // Strategie wählen: BFS (Queue/Shift) oder DFS (Stack/Pop)
            const currentNode = (algorithm === 'DFS') ? toVisit.pop() : toVisit.shift();

            // 1. Abbruchbedingungen
            if (currentNode.depth >= maxDepth) continue;
            
            // Wenn Knoten als Duplikat markiert wurde, hier stoppen (keine Kinder)
            if (currentNode.isDuplicate) continue; 
            
            // Wenn Lösung gefunden und wir nicht weitermachen sollen -> Stopp
            if (currentNode.isSolution && !continueAfterSolution) continue;

            // 2. Nachfolger generieren
            // RotateBox hat immer Züge: 'L' und 'R'
            // Für DFS drehen wir die Reihenfolge um, damit die Abarbeitung natürlich wirkt
            const moves = (algorithm === 'DFS') ? ['R', 'L'] : ['L', 'R'];

            moves.forEach(move => {
                // Neuen Zustand berechnen
                const nextBoard = currentNode.data.clone();
                nextBoard.rotate(move === 'R');
                nextBoard.relaxBoardSync(); // Physik anwenden
                
                const child = new TreeNode(nodeId++, nextBoard, currentNode.depth + 1, move);
                const stateKey = nextBoard.getStateKey();

                // Zielprüfung
                if (nextBoard.won) {
                    child.isSolution = true;
                    child.annotation = "ZIEL";
                }

                // Duplikatsprüfung
                let isDup = false;
                if (checkDuplicates) {
                    if (visitedStates.has(stateKey)) {
                        const previousDepth = visitedStates.get(stateKey);
                        
                        // Wenn wir diesen Zustand schon mal auf gleicher oder besserer Ebene hatten
                        if (child.depth >= previousDepth) {
                            isDup = true;
                            child.isDuplicate = true;
                            child.annotation = "Duplikat";
                        } else {
                            // Besserer Weg gefunden (passiert bei DFS oft) -> Update
                            visitedStates.set(stateKey, child.depth);
                        }
                    } else {
                        // Neu entdeckt
                        visitedStates.set(stateKey, child.depth);
                    }
                }

                currentNode.children.push(child);

                // Zur Liste hinzufügen, wenn kein Duplikat (oder wir weitersuchen)
                if (!isDup) {
                    // Wenn es eine Lösung ist und wir stoppen sollen -> nicht in Queue
                    if (!child.isSolution || continueAfterSolution) {
                        toVisit.push(child);
                    }
                }
            });
        }

        return root;
    }
};