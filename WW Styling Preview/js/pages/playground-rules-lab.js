// Page-specific scripts for playground/rules-lab.html
/**
         * @fileoverview Rules-Lab - Visualisiert die Regel-Evaluierung.
         * 
         * Nutzt GameAdapter für einheitliche Spiellogik.
         * Fokussiert nur auf Visualisierung des Entscheidungsbaums.
         */
        const Lab = {
            adapter: null,  // GameAdapter - die einheitliche Schnittstelle
            canvas: null,
            vizP1: null, vizP2: null,
            trees: { 1: null, 2: null },
            gameType: 'regular',
            axis3D: 'z',
            isAuto: false,
            delay: 600,

            init() {
                this.canvas = document.getElementById('gameCanvas');
                this.changeGameType();
            },

            changeGameType() {
                this.gameType = document.getElementById('gameTypeSelector').value;
                const controls = document.getElementById('controls3D');

                // Canvas-Größe anpassen
                this.canvas.width = 400;
                this.canvas.height = 400;

                if (this.gameType === '3d') {
                    controls.classList.remove('hidden');
                    this.canvas.height = 250;
                } else if (this.gameType === 'ultimate') {
                    controls.classList.add('hidden');
                    this.canvas.width = 600;
                    this.canvas.height = 600;
                } else {
                    controls.classList.add('hidden');
                }

                // Bäume laden
                this.trees[1] = createStrategyTree(this.gameType);
                this.trees[2] = createStrategyTree(this.gameType);

                this.vizP1 = new FlowchartVisualizer('treeDisplayP1', this.trees[1], (n) => this.toggleRule(1, n));
                this.vizP2 = new FlowchartVisualizer('treeDisplayP2', this.trees[2], (n) => this.toggleRule(2, n));

                this.vizP1.render();
                this.vizP2.render();

                this.reset();
            },

            reset() {
                // ✅ Nutze GameAdapter statt direkt neue Boards zu erstellen
                let gameBoard;
                if (this.gameType === 'regular') gameBoard = new TTTRegularBoard();
                else if (this.gameType === '3d') gameBoard = new TTT3DBoard(3);
                else gameBoard = new UltimateBoard();

                this.adapter = new GameAdapter(gameBoard, this.gameType);

                this.isAuto = false;
                document.getElementById('btnAuto').innerText = "⏩ Auto";
                document.getElementById('log').innerHTML = '';
                this.log("--- NEUES SPIEL ---");

                this.vizP1.clearHighlights();
                this.vizP2.clearHighlights();
                this.draw();
                this.updateStatus();
            },

            toggleRule(player, name) {
                const toggle = (n) => {
                    if (n.name === name) {
                        n.active = !n.active;
                        console.log(`✅ Toggled rule "${name}" to ${n.active}`);
                    }
                    if (n.children) n.children.forEach(toggle);
                    if (n.thenNode) toggle(n.thenNode);
                    if (n.elseNode) toggle(n.elseNode);
                };
                toggle(this.trees[player].root);
                if (player === 1) {
                    this.vizP1.render();
                } else {
                    this.vizP2.render();
                }
            },

            setAxis(axis) {
                this.axis3D = axis;
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                const idx = axis === 'z' ? 0 : axis === 'y' ? 1 : 2;
                document.querySelectorAll('.view-btn')[idx].classList.add('active');
                this.draw();
            },

            setDelay(value) {
                this.delay = 1550 - parseInt(value);
            },

            /**
             * KI-Zug mit Visualisierung.
             * ✅ WICHTIG: Nutzt den GLEICHEN Code-Pfad wie normale Spiele!
             * Agent.getAction() macht die Entscheidung
             * evaluateVisual() macht nur Visualisierung/Highlighting
             */
            async stepAI(fast = false) {
                // ✅ Prüfe winner ERST hier (nicht am Anfang der Funktion)
                if (this.adapter.isGameOver()) return;

                const stepBtn = document.querySelector('[onclick="Lab.stepAI()"]');
                stepBtn.disabled = true;
                stepBtn.style.opacity = '0.5';
                stepBtn.style.cursor = 'not-allowed';

                try {
                    const player = this.adapter.getCurrentPlayer();
                    const viz = player === 1 ? this.vizP1 : this.vizP2;
                    const tree = this.trees[player];
                    const gameBoard = this.adapter.getBoard();

                    // 🔍 DEBUG: Zeige verfügbare Züge VOR Evaluation
                    const validMovesBefore = this.adapter.getValidMoves();
                    
                    // ✅ Zähle freie Zellen - unterschiedlich je nach Spieltyp
                    let freeCells = 0;
                    if (this.gameType === 'ultimate') {
                        // Ultimate: Zähle über alle 9 boards
                        for (let b = 0; b < 9; b++) {
                            freeCells += gameBoard.boards[b].filter(c => c === 0).length;
                        }
                    } else {
                        // Regular/3D: Einfach grid zählen
                        freeCells = gameBoard.grid.filter(c => c === 0).length;
                    }
                    
                    const winnerBefore = this.adapter.getWinner();
                    
                    this.log(`🔍 DEBUG: Freie Felder=${freeCells}, ValidMoves=${validMovesBefore.length}, Winner=${winnerBefore}`);
                    if (winnerBefore !== 0) {
                        this.log(`⚠️ WARNUNG: Spiel ist schon vorbei! (Winner=${winnerBefore})`);
                        return;
                    }

                    viz.clearHighlights();
                    this.updateStatus(`KI ${player === 1 ? 'Blau' : 'Rot'} rechnet... (${freeCells} frei, ${validMovesBefore.length} valid)`);

                    // ✅ Verwende Agent.getAction() genau wie normale Spiele!
                    let action = null;
                    try {
                        const agent = new RuleBasedAgent(tree);
                        action = agent.getAction(gameBoard);
                    } catch (e) {
                        this.log(`❌ FEHLER in Agent.getAction(): ${e.message}`);
                        console.error('Agent Error:', e);
                        return;
                    }
                    
                    const move = action?.move;

                    this.log(`🔍 Agent gibt: ${JSON.stringify(move)}`);

                    // ✅ Visualisiere die Evaluation NACHDEM wir den Zug kennen
                    if (fast === false && move !== undefined && move !== null) {
                        // Nur wenn wir Zeit haben, zeige die Evaluation
                        try {
                            await this.visualizeEvaluationPath(tree.root, gameBoard, viz, move);
                        } catch (e) {
                            this.log(`⚠️ Visualisierung fehlgeschlagen: ${e.message}`);
                        }
                    }

                    // ✅ Setze den Zug mit robuster Prüfung
                    if (move !== undefined && move !== null) {
                        this.log(`🤖 KI ${player} Zug: ${JSON.stringify(move)}`);
                        const success = this.adapter.makeMove(move);  // ✅ GameAdapter API!
                        if (success) {
                            this.draw();
                            this.checkWin();
                        } else {
                            this.log(`❌ Zug war ungültig: ${JSON.stringify(move)}`);
                        }
                    } else {
                        this.log(`❌ KI ${player} findet keinen Zug!`);
                        const validMovesAfter = this.adapter.getValidMoves();
                        this.log(`Valid: ${JSON.stringify(validMovesAfter.slice(0, 10))}`);
                    }
                } catch (e) {
                    this.log(`❌ KRITISCHER FEHLER in stepAI: ${e.message}`);
                    console.error('stepAI Error:', e);
                } finally {
                    stepBtn.disabled = false;
                    stepBtn.style.opacity = '1';
                    stepBtn.style.cursor = 'pointer';
                }
            },

            /**
             * Visualisiere welche Regeln gecheckt wurden bis zum gefundenen Zug.
             * Das ist nur für Visualisierung, die echte Entscheidung ist schon gemacht!
             */
            async visualizeEvaluationPath(node, gameState, viz, targetMove) {
                if (!node || !node.active) return;

                const traverse = async (n) => {
                    if (!n || !n.active) return false;

                    // Highlight diese Regel beim Checking
                    viz.highlightCheck(n.name);
                    await new Promise(r => setTimeout(r, this.delay));

                    // Condition
                    if (n.conditionFn) {
                        const res = n.conditionFn(gameState);
                        const targetNode = res ? n.thenNode : n.elseNode;
                        const found = await traverse(targetNode);
                        if (!found) {
                            viz._removeClass(n.name, 'checking');
                        }
                        return found;
                    }

                    // Group
                    if (n.children && n.children.length > 0) {
                        for (const child of n.children) {
                            const found = await traverse(child);
                            if (found) return true;
                            viz._removeClass(child.name, 'checking');
                        }
                        viz._removeClass(n.name, 'checking');
                        return false;
                    }

                    // Atomic Rule - prüfe ob DIESE Regel den Zug liefert
                    const result = n.evaluate(gameState);
                    
                    // ✅ Vergleiche Züge korrekt (auch Objekte bei Ultimate!)
                    let moveMatches = false;
                    if (result && result.move !== undefined && result.move !== null) {
                        if (typeof result.move === 'object' && typeof targetMove === 'object') {
                            // Ultimate: Objekt-Vergleich
                            moveMatches = result.move.big === targetMove.big && 
                                         result.move.small === targetMove.small;
                        } else {
                            // Regular/3D: Primitive Vergleich
                            moveMatches = result.move === targetMove;
                        }
                    }
                    
                    if (moveMatches) {
                        // ✅ DAS ist die Regel die den Zug lieferte!
                        viz.highlightSuccess(n.name);
                        return true;
                    } else {
                        viz._removeClass(n.name, 'checking');
                        return false;
                    }
                };

                await traverse(node);
            },

            /**
             * VERALTET: evaluateVisual wird nicht mehr verwendet.
             * Behielt für Referenzen, falls nötig.
             * 
             * @deprecated Verwende stattdessen Agent.getAction() + visualizeEvaluationPath()
             */
            async evaluateVisual(node, gameState, viz, ms) {
                if (!node || !node.active) return null;

                const traverse = async (n) => {
                    if (!n || !n.active) return null;

                    if (ms > 0) {
                        viz.highlightCheck(n.name);
                        await new Promise(r => setTimeout(r, ms));
                    }

                    // Condition
                    if (n.conditionFn) {
                        const res = n.conditionFn(gameState);
                        const targetNode = res ? n.thenNode : n.elseNode;
                        const result = await traverse(targetNode);
                        if (!result && ms > 0) {
                            viz._removeClass(n.name, 'checking');
                        }
                        return result;
                    }

                    // Group
                    if (n.children && n.children.length > 0) {
                        for (const child of n.children) {
                            const result = await traverse(child);
                            if (result) return result;
                            if (ms > 0) viz._removeClass(child.name, 'checking');
                        }
                        if (ms > 0) viz._removeClass(n.name, 'checking');
                        return null;
                    }

                    // Atomic Rule
                    const result = n.evaluate(gameState);
                    if (result) {
                        if (ms > 0) viz.highlightSuccess(n.name);
                        return result.move;
                    } else {
                        if (ms > 0) viz._removeClass(n.name, 'checking');
                        return null;
                    }
                };

                return await traverse(node);
            },

            toggleAutoMatch() {
                this.isAuto = !this.isAuto;
                const btn = document.getElementById('btnAuto');
                if (this.isAuto) {
                    btn.innerHTML = "⏹ Stopp";
                    btn.style.background = "#c0392b";
                    this.loop();
                } else {
                    btn.innerHTML = "⏩ Auto";
                    btn.style.background = "#8e44ad";
                }
            },

            /**
             * Auto-Loop für durchgehendes Spielen.
             * ✅ Prüfe winner NACH jedem stepAI, nicht davor
             */
            loop() {
                if (!this.isAuto) {
                    this.isAuto = false;
                    document.getElementById('btnAuto').innerText = "⏩ Auto";
                    document.getElementById('btnAuto').style.background = "#8e44ad";
                    return;
                }

                this.stepAI(false).then(() => {
                    // ✅ NOW: Nach stepAI prüfen, ob Spiel vorbei ist
                    if (this.adapter.isGameOver()) {
                        this.isAuto = false;
                        document.getElementById('btnAuto').innerText = "⏩ Auto";
                        document.getElementById('btnAuto').style.background = "#8e44ad";
                        return;
                    }
                    if (this.isAuto) setTimeout(() => this.loop(), 200);
                });
            },

            checkWin() {
                if (this.adapter.isGameOver()) {
                    const winner = this.adapter.getWinner();
                    const msg = winner === 3 ? "Remis" : `Sieg ${winner === 1 ? 'Blau' : 'Rot'}`;
                    this.updateStatus(msg);
                    this.log(msg);
                } else {
                    const player = this.adapter.getCurrentPlayer();
                    this.updateStatus(`${player === 1 ? 'Blau' : 'Rot'} ist dran`);
                }
            },

            updateStatus(msg) {
                document.getElementById('statusText').innerText = msg || "Bereit";
            },

            log(msg) {
                const l = document.getElementById('log');
                l.innerHTML += `<div class="log-entry">${msg}</div>`;
                l.scrollTop = l.scrollHeight;
            },

            draw() {
                const gameBoard = this.adapter.getBoard();
                const c = this.canvas;

                if (this.gameType === 'regular') {
                    TTTRenderer.drawRegular(c, gameBoard);
                } else if (this.gameType === '3d') {
                    TTTRenderer.draw3DSlices(c, gameBoard, this.axis3D);
                } else if (this.gameType === 'ultimate') {
                    TTTRenderer.drawUltimate(c, gameBoard);
                }
            }
        };

        window.onload = () => Lab.init();
