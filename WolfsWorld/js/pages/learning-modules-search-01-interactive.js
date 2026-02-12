// Page-specific scripts for learning/modules/search/01-interactive.html
const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        let game = null;
        let moves = 0;
        let cellSize = 0;
        
        function init() {
            const seed = document.getElementById('level').value === 'easy' ? 3 : 
                        document.getElementById('level').value === 'medium' ? 5 : 8;
            
            game = new RotateBoard(3, 3);
            for (let i = 0; i < seed; i++) {
                const allMoves = game.getAllValidMoves();
                game.makeMove(allMoves[Math.floor(Math.random() * allMoves.length)]);
            }
            
            moves = 0;
            cellSize = canvas.width / 3;
            draw();
            
            document.getElementById('moves').textContent = '0';
            document.getElementById('nodes').textContent = '0';
            document.getElementById('dups').textContent = '0';
            document.getElementById('time').textContent = '-';
            document.getElementById('status').textContent = '🎮 Spielend';
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const x = c * cellSize;
                    const y = r * cellSize;
                    const val = game.grid[r][c];
                    
                    ctx.fillStyle = val === 1 ? '#4CAF50' : '#ff6b6b';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, cellSize, cellSize);
                }
            }
        }
        
        canvas.addEventListener('click', (e) => {
            if (!game) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const c = Math.floor(x / cellSize);
            const r = Math.floor(y / cellSize);
            
            const move = r * 3 + c;
            const validMoves = game.getAllValidMoves();
            if (validMoves.includes(move)) {
                game.makeMove(move);
                moves++;
                document.getElementById('moves').textContent = moves;
                draw();
                
                if (game.won) {
                    document.getElementById('status').textContent = '✅ GELÖST!';
                }
            }
        });
        
        function solveBFS() {
            const start = performance.now();
            let queue = [{ state: game.clone(), depth: 0 }];
            let visited = new Set();
            let nodes = 0, dups = 0;
            let found = false;
            
            visited.add(game.getStateKey());
            
            while (queue.length > 0 && !found) {
                const { state, depth } = queue.shift();
                nodes++;
                
                if (state.won) {
                    found = true;
                    break;
                }
                
                const moves = state.getAllValidMoves();
                for (let move of moves) {
                    const next = state.clone();
                    next.makeMove(move);
                    const key = next.getStateKey();
                    
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({ state: next, depth: depth + 1 });
                    } else {
                        dups++;
                    }
                }
            }
            
            const time = Math.round(performance.now() - start);
            document.getElementById('nodes').textContent = nodes;
            document.getElementById('dups').textContent = dups;
            document.getElementById('time').textContent = time + 'ms';
            document.getElementById('status').textContent = found ? '✅ BFS gelöst!' : '❌ Keine Lösung';
        }
        
        function solveDFS() {
            const start = performance.now();
            let visited = new Set();
            let nodes = 0, dups = 0;
            let found = false;
            
            function search(state, depth) {
                if (depth > 20) return false;
                const key = state.getStateKey();
                
                if (visited.has(key)) {
                    dups++;
                    return false;
                }
                
                visited.add(key);
                nodes++;
                
                if (state.won) return true;
                
                const moves = state.getAllValidMoves();
                for (let move of moves) {
                    const next = state.clone();
                    next.makeMove(move);
                    if (search(next, depth + 1)) return true;
                }
                
                return false;
            }
            
            found = search(game.clone(), 0);
            const time = Math.round(performance.now() - start);
            
            document.getElementById('nodes').textContent = nodes;
            document.getElementById('dups').textContent = dups;
            document.getElementById('time').textContent = time + 'ms';
            document.getElementById('status').textContent = found ? '✅ DFS gelöst!' : '❌ Keine Lösung';
        }
        
        init();
