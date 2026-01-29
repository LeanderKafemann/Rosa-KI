/**
 * Controller für KI-gegen-KI Simulationen.
 * @class Arena
 */
class Arena {
    /**
     * @param {Object} gameFactory - Objekt mit .create() Methode für neue Spiele.
     * @param {Agent} agent1 - Agent für Spieler 1.
     * @param {Agent} agent2 - Agent für Spieler 2.
     */
    constructor(gameFactory, agent1, agent2) {
        this.gameFactory = gameFactory;
        this.agents = { 1: agent1, 2: agent2 };
        this.stats = { 1: 0, 2: 0, 0: 0 };
    }

    /**
     * Führt eine Serie von Spielen aus.
     * Asynchron, um den Browser nicht zu blockieren (Bugfix).
     * @param {number} rounds - Anzahl der Spiele.
     * @returns {Promise<Object>} Statistiken und Dauer.
     */
    async runSeries(rounds) {
        this.stats = { 1: 0, 2: 0, 0: 0 };
        const start = performance.now();

        // Wir nutzen Chunks, damit der Browser zwischendurch rendern kann
        const CHUNK_SIZE = 10; 

        for (let i = 0; i < rounds; i++) {
            this.playSingleGame();
            
            // Jeden X-ten Schritt kurz Luft holen für UI Updates
            if (i % CHUNK_SIZE === 0) {
                await new Promise(r => setTimeout(r, 0));
            }
        }

        const duration = performance.now() - start;
        return { 
            stats: this.stats, 
            duration: duration,
            avgTime: duration / rounds
        };
    }

    /**
     * Spielt ein einzelnes Spiel bis zum Ende.
     * @private
     */
    playSingleGame() {
        const game = this.gameFactory.create();
        let moves = 0;
        const maxMoves = 200; // Schutz gegen Endlosschleifen

        while (game.winner === 0 && moves < maxMoves) {
            // Remis-Check vor dem Zug
            if (game.getAllValidMoves().length === 0) {
                break;
            }

            const player = game.currentPlayer;
            const agent = this.agents[player];
            
            // Aktion holen
            const action = agent.getAction(game);

            if (action && action.move !== undefined) {
                // Zug ausführen
                const success = game.makeMove(action.move);

                if (!success) {
                    console.error(`Arena: Ungültiger Zug von Agent ${player}`, action.move);
                    break; 
                }
            } else {
                // Agent gibt auf oder Fehler
                break; 
            }
            moves++;
        }
        
        this.stats[game.winner]++;
    }
}