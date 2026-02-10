// Page-specific scripts for playground/minimax-viz.html
/**
         * Controller für die Minimax Visualisierung.
         * Verwaltet die Timeline und das Zeichnen.
         */
        const MinimaxViz = {
            viz: null,
            vizData: null,
            currentStep: 0,
            isPlaying: false,
            timer: null,

            // Vordefinierte Szenarien für TTT
            scenarios: {
                'win_in_1': {
                    grid: [1, 1, 0,  2, 2, 0,  0, 0, 0], // Blau kann gewinnen
                    player: 1,
                    depth: 2
                },
                'block_needed': {
                    grid: [2, 0, 0,  0, 1, 0,  2, 0, 0], // Rot droht Diagonale? Nein, das ist leer.
                    // Besser: Rot hat 2 in einer Reihe.
                    grid: [2, 2, 0,  1, 0, 0,  1, 0, 0], 
                    player: 1, // Blau ist dran und muss blocken
                    depth: 2
                },
                'fork_opp': {
                    // Klassische Gabelungssituation vorbereiten
                    grid: [1, 0, 0,  0, 2, 0,  0, 0, 1],
                    player: 2, // Rot muss reagieren
                    depth: 3
                },
                'early_game': {
                    grid: [1, 0, 0,  0, 0, 0,  0, 0, 0],
                    player: 2,
                    depth: 2
                }
            },

            init() {
                this.viz = new TreeVisualizer('treeCanvas');
                
                // Event Listener für UI
                document.getElementById('chkAlphaBeta').onchange = () => this.initScenario();
                document.getElementById('scenarioSelect').onchange = () => this.initScenario();
                
                this.initScenario();
            },

            initScenario() {
                this.stop();
                const key = document.getElementById('scenarioSelect').value;
                const scen = this.scenarios[key];
                
                // 1. GameState bauen
                const board = new TTTRegularBoard();
                board.grid = [...scen.grid];
                board.currentPlayer = scen.player;
                
                // 2. Minimax Daten generieren
                const usePruning = document.getElementById('chkAlphaBeta').checked;
                this.vizData = MinimaxAdapter.generateVizData(board, {
                    maxDepth: scen.depth,
                    useAlphaBeta: usePruning,
                    heuristicFn: HeuristicsLibrary.winLoss
                });
                
                // 3. UI Reset
                this.currentStep = 0;
                const maxSteps = this.vizData.timeline.length;
                
                const slider = document.getElementById('timelineSlider');
                slider.max = maxSteps;
                slider.value = 0;
                
                this.updateDisplay();
            },

            updateDisplay() {
                if (!this.vizData) return;
                
                document.getElementById('stepDisplay').innerText = 
                    `${this.currentStep} / ${this.vizData.timeline.length}`;
                
                document.getElementById('timelineSlider').value = this.currentStep;

                // --- ZEITREISE LOGIK ---
                // Wir wenden die Timeline Events bis zum aktuellen Schritt an.
                
                // 1. Alle Nodes resetten (auf "Unbekannt")
                this.vizData.idToNodeMap.forEach(node => {
                    node.currentScore = undefined; 
                    node.isPruned = false;
                    node.isCurrent = false;
                });
                
                // 2. Events abspielen
                for (let i = 0; i < this.currentStep; i++) {
                    const event = this.vizData.timeline[i];
                    const node = this.vizData.idToNodeMap.get(event.id);
                    
                    if (!node) continue;

                    if (event.type === 'LEAF') {
                        node.currentScore = event.score;
                    } 
                    else if (event.type === 'UPDATE_VAL') {
                        node.currentScore = event.score;
                    }
                    else if (event.type === 'NODE_OPEN') {
                         node.isCurrent = (i === this.currentStep - 1);
                    }
                    else if (event.type === 'PRUNE') {
                        // Markiere alle Kinder/Nachfolger als pruned?
                        // Visuell schwierig im Nachhinein, wir zeigen es als Status am Knoten
                        node.annotation = "PRUNED";
                    }
                }
                
                // Stats
                const lastEvt = (this.currentStep > 0) ? this.vizData.timeline[this.currentStep-1] : null;
                const info = lastEvt ? `${lastEvt.type} (ID: ${lastEvt.id})` : "Start";
                document.getElementById('stats').innerText = info;

                // 3. Zeichnen
                this.viz.drawTree(this.vizData.root, {
                    drawNodeFn: (ctx, data, size) => {
                        // Wir nutzen den aktuellen Zustand aus dem Node-Objekt, nicht aus data
                        // Dazu müssen wir den Node im Adapter finden oder an drawNodeFn übergeben.
                        // TreeEngine übergibt node.data. Wir haben node aber modifiziert.
                        // HACK: TreeEngine drawNodesRecursive callt drawNodeFn(ctx, node.data, ...)
                        // Wir brauchen Zugriff auf das `node` Objekt selbst.
                        // SAUBERER WEG: MinimaxAdapter.drawNode braucht Zugriff auf den dynamischen State.
                        
                        // Da die Engine generic ist, haben wir keinen direkten Zugriff auf 'node' in dieser Fn, 
                        // nur auf 'data'.
                        // TRICK: Wir speichern den dynamischen State in 'data' vor dem Draw Call?
                        // Nein, data ist shared reference im Tree.
                        
                        // LÖSUNG: Wir erweitern TreeVisualizer leicht oder nutzen den Scope hier.
                        // Da wir hier im updateDisplay sind, können wir die Map nutzen? Nein, draw ist callback.
                        
                        // ALTERNATIV: Wir nutzen `MinimaxAdapter.drawNode` als Basis, aber wir müssen
                        // wissen, welchen Score wir malen sollen.
                        // Die TreeEngine übergibt "node.data". Wir können im Schritt "Events abspielen"
                        // den `currentScore` direkt in `node.data` schreiben!
                    },
                    // Da die Engine drawNodeFn nur mit data aufruft, müssen wir tricksen.
                    // Wir überschreiben die draw Methode im Adapter leicht für diesen Zweck.
                });
                
                // FIX: Wir aktualisieren die draw-Logik manuell hier im Controller,
                // da wir den Zustand "currentScore" brauchen, der sich ändert.
                
                this.viz.drawTree(this.vizData.root, {
                    drawNodeFn: (ctx, nodeData, size) => {
                         // Um den Knoten zu identifizieren, bräuchten wir die ID in nodeData.
                         // MinimaxAdapter hat die ID nicht in data gepackt.
                         // Wir verlassen uns darauf, dass `generateVizData` Referenzen nutzt.
                         // Wir iterieren oben über `idToNodeMap`. Die Values dort sind TreeNodes.
                         // TreeNode.data ist das Objekt, das hier ankommt.
                         
                         // Wir finden den zugehörigen TreeNode über referenzvergleich oder ID?
                         // Einfacher: Wir schreiben currentScore direkt in nodeData während des Loops oben.
                         MinimaxAdapter.drawNode(ctx, nodeData, size, nodeData._visualState);
                    }
                });
            },
            
            // Override updateDisplay Loop um nodeData zu patchen
            updateDisplay() {
                if (!this.vizData) return;
                document.getElementById('stepDisplay').innerText = 
                    `${this.currentStep} / ${this.vizData.timeline.length}`;
                document.getElementById('timelineSlider').value = this.currentStep;

                // 1. Reset Data States
                this.vizData.idToNodeMap.forEach(node => {
                    // Wir speichern den visuellen State im data-Objekt des Nodes
                    // damit der Renderer darauf zugreifen kann.
                    node.data._visualState = {
                        score: undefined, // "Unbekannt"
                        isMax: node.isMax,
                        isCurrent: false,
                        pruned: false
                    };
                });
                
                // 2. Apply Events
                 for (let i = 0; i < this.currentStep; i++) {
                    const event = this.vizData.timeline[i];
                    const node = this.vizData.idToNodeMap.get(event.id);
                    if (!node) continue;
                    
                    const state = node.data._visualState;

                    if (event.type === 'LEAF' || event.type === 'UPDATE_VAL') {
                        state.score = event.score;
                    }
                    else if (event.type === 'NODE_OPEN') {
                        state.isCurrent = (i === this.currentStep - 1);
                    }
                }
                
                // 3. Draw
                this.viz.drawTree(this.vizData.root, {
                    drawNodeFn: (ctx, data, size) => {
                        MinimaxAdapter.drawNode(ctx, data._visualState, size);
                    }
                });
            },

            step(delta) {
                const newVal = this.currentStep + delta;
                if (newVal >= 0 && newVal <= this.vizData.timeline.length) {
                    this.currentStep = newVal;
                    this.updateDisplay();
                } else {
                    this.stop(); // Auto-Stop am Ende
                }
            },

            seek(val) {
                this.currentStep = parseInt(val);
                this.updateDisplay();
            },

            togglePlay() {
                if (this.isPlaying) this.stop();
                else this.play();
            },

            play() {
                this.isPlaying = true;
                document.getElementById('btnPlay').innerText = "⏹ Stopp";
                this.timer = setInterval(() => {
                    this.step(1);
                }, 500); // 500ms pro Schritt
            },

            stop() {
                this.isPlaying = false;
                document.getElementById('btnPlay').innerText = "▶ Abspielen";
                clearInterval(this.timer);
            }
        };

        window.onload = () => MinimaxViz.init();
