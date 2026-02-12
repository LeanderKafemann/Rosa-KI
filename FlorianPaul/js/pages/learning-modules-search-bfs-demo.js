// Page-specific scripts for learning/modules/search/bfs-demo.html
// Kleiner Inline-Controller für dieses Modul
        let viz;
        
        window.onload = () => {
            viz = new TreeVisualizer('treeCanvas');
            updateDemo();
        };

        function updateDemo() {
            const depth = parseInt(document.getElementById('depthInput').value);
            document.getElementById('depthVal').innerText = depth;

            // 1. Board erstellen (Level 1)
            const board = new RotateBoard('1');
            
            // 2. Baum generieren (BFS)
            const root = RotateBoxAdapter.generateTree(board, {
                maxDepth: depth,
                algorithm: 'BFS',
                checkDuplicates: true
            });

            // 3. Zeichnen
            viz.drawTree(root, {
                drawNodeFn: (ctx, data, size) => {
                    const mock = { width: size, height: size };
                    drawRotateBoard(data, mock, ctx);
                },
                config: { nodeSize: 50, levelHeight: 80 }
            });
        }
