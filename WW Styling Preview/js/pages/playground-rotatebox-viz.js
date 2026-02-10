// Page-specific scripts for playground/rotatebox-viz.html
// Visualisierer initialisieren
        const viz = new TreeVisualizer('treeCanvas');

        /**
         * Hilfsfunktion: Zeichnet das Board kompakt in den Node.
         * Zeichnet einfache Rechtecke statt der aufwändigen Grafik des Hauptspiels,
         * um Performance zu sparen und bei kleinen Nodes lesbar zu bleiben.
         */
        function drawCompactBoard(ctx, board, size) {
            const COLORS = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#e67e22'];
            
            const maxDim = Math.max(board.rows, board.cols);
            if (maxDim === 0) return;
            
            // Blockgröße berechnen
            const bs = size / maxDim; 
            const ox = (size - (board.cols * bs)) / 2;
            const oy = (size - (board.rows * bs)) / 2;

            for (let r = 0; r < board.rows; r++) {
                for (let c = 0; c < board.cols; c++) {
                    const v = board.grid[r][c];
                    const x = ox + c * bs;
                    const y = oy + r * bs;
                    
                    if (v === -2) { // Wand
                        ctx.fillStyle = '#2c3e50'; 
                        ctx.fillRect(x, y, bs, bs); 
                    } else if (v === -3) { // Ziel
                        ctx.fillStyle = '#ecf0f1';
                        ctx.fillRect(x, y, bs, bs);
                        ctx.strokeStyle = '#e74c3c'; 
                        ctx.lineWidth = 2; 
                        ctx.strokeRect(x+1, y+1, bs-2, bs-2);
                    } else if (v >= 0) { // Box
                        ctx.fillStyle = COLORS[v % COLORS.length];
                        ctx.fillRect(x+1, y+1, bs-2, bs-2);
                    }
                }
            }
        }

        /**
         * Wird beim Klick auf "Generieren" aufgerufen.
         */
        function updateTree() {
            // 1. UI Werte lesen
            const levelId = document.getElementById('levelSelect').value;
            const options = {
                maxDepth: parseInt(document.getElementById('depthInput').value),
                algorithm: document.getElementById('algoSelect').value,
                checkDuplicates: document.getElementById('chkDuplicates').checked,
                continueAfterSolution: document.getElementById('chkContinueSol').checked
            };

            // 2. Startzustand laden
            const startBoard = new RotateBoard(levelId); // Nutzt logic.js
            
            // 3. Baum generieren (Adapter)
            const root = RotateBoxAdapter.generateTree(startBoard, options);

            // 4. Statistik (Nodes zählen)
            let count = 0;
            const countNodes = (n) => { count++; n.children.forEach(countNodes); };
            countNodes(root);
            document.getElementById('stats').innerText = `Nodes: ${count}`;

            // 5. Zeichnen (Engine)
            viz.drawTree(root, { 
                drawNodeFn: drawCompactBoard,
                config: { nodePadding: 2 } 
            });
        }

        // Starten beim Laden
        window.onload = updateTree;
