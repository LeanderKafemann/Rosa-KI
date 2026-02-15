/**
 * @fileoverview Zentrale Debug-Konfiguration
 *
 * Logging-Konventionen (für schrittweise Migration im gesamten Projekt):
 * 1) Kein direktes console.log/console.warn/console.error in Feature-Code.
 *    Stattdessen immer über `DebugConfig.log(domain, level, ...args)` loggen.
 * 2) Jedes Log muss einem Domain-Flag zugeordnet sein (z. B. MINIMAX, ABPRUNING).
 * 3) Kritische Logs (`warn`, `error`, `critical`) laufen zusätzlich über DEBUG_CRITICAL.
 * 4) DEBUG_ALL überschreibt alle Domain-Flags für vollständige Diagnose.
 * 5) Debug-Logs sollen strukturierte Payloads nutzen (Objekte statt String-Konkatenation).
 *
 * Hierarchie:
 * - DEBUG_ALL: überschreibt alles (maximale Verbosität)
 * - DEBUG_CRITICAL: erlaubt kritische Logs projektweit
 * - Bereichs-Flags: gezielte Debug-Ausgaben je Modul
 */

/**
 * @typedef {'debug'|'warn'|'error'|'critical'} DebugLevel
 */

const DEBUG_CONFIG = {
    DEBUG_ALL: false,
    DEBUG_CRITICAL: true,

    DEBUG_MINIMAX: false,
    DEBUG_ABPRUNING: true,
    DEBUG_MINIMAX_VIZ_UI: true,
    DEBUG_TTT_RENDERER: false,
};

const DEBUG_DOMAINS = {
    MINIMAX: 'MINIMAX',
    ABPRUNING: 'ABPRUNING',
    MINIMAX_VIZ_UI: 'MINIMAX_VIZ_UI',
    TTT_RENDERER: 'TTT_RENDERER',
};

/**
 * Entscheidet, ob ein Logeintrag geschrieben werden soll.
 * @param {string} domain
 * @param {DebugLevel} [level='debug']
 * @returns {boolean}
 */
function debugShouldLog(domain, level = 'debug') {
    if (DEBUG_CONFIG.DEBUG_ALL === true) return true;

    if (level === 'critical' || level === 'warn' || level === 'error') {
        return DEBUG_CONFIG.DEBUG_CRITICAL === true;
    }

    switch (domain) {
        case DEBUG_DOMAINS.MINIMAX:
            return DEBUG_CONFIG.DEBUG_MINIMAX === true;
        case DEBUG_DOMAINS.ABPRUNING:
            return DEBUG_CONFIG.DEBUG_ABPRUNING === true;
        case DEBUG_DOMAINS.MINIMAX_VIZ_UI:
            return DEBUG_CONFIG.DEBUG_MINIMAX_VIZ_UI === true;
        case DEBUG_DOMAINS.TTT_RENDERER:
            return DEBUG_CONFIG.DEBUG_TTT_RENDERER === true;
        default:
            return false;
    }
}

/**
 * Schreibt einen Debug-Logeintrag gemäß globaler Debug-Konfiguration.
 * @param {string} domain
 * @param {DebugLevel} level
 * @param {...any} args
 */
function debugLog(domain, level, ...args) {
    if (!debugShouldLog(domain, level)) return;

    if (level === 'warn') {
        console.warn(...args);
        return;
    }

    if (level === 'error' || level === 'critical') {
        console.error(...args);
        return;
    }

    console.log(...args);
}

if (typeof window !== 'undefined') {
    window.DEBUG_CONFIG = DEBUG_CONFIG;
    window.DEBUG_DOMAINS = DEBUG_DOMAINS;
    window.DebugConfig = {
        config: DEBUG_CONFIG,
        domains: DEBUG_DOMAINS,
        shouldLog: debugShouldLog,
        log: debugLog,
    };
}
