/**
 * @typedef {Object} LearningStep
 * @property {string} file - Der Pfad zur Modul-Datei (relativ zu learning/modules/).
 * @property {string} title - Der Titel des Schritts für die Anzeige.
 */

/**
 * @typedef {Object} LearningPath
 * @property {string} title - Der Gesamttitel des Kurses.
 * @property {LearningStep[]} steps - Die Schritte des Kurses.
 */

/**
 * Definition aller verfügbaren Lernpfade.
 * Wird vom viewer.html geladen.
 * * @type {Object.<string, LearningPath>}
 */
const LEARNING_PATHS = {
    "search-algo": {
        "title": "Grundlagen der Suche",
        "steps": [
            { 
                "file": "intro/what-is-state.html", 
                "title": "1. Was ist ein Zustand?" 
            },
            { 
                "file": "search/bfs-demo.html", 
                "title": "2. Interaktiv: Breitensuche (BFS)" 
            }
        ]
    },
    "minimax": {
        "title": "Unschlagbare KI (Minimax)",
        "steps": [
            { 
                "file": "intro/what-is-state.html", 
                "title": "1. Wiederholung: Zustände" 
            },
            { 
                "file": "adversarial/intro-minimax.html", 
                "title": "2. Das Minimax Prinzip" 
            }
        ]
    }
};