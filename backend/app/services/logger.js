/**
 * Minimal structured logger.
 *
 * Replaces ad-hoc `console.log`/`console.error` calls with one consistent
 * format (timestamp, level, scope, message, extra fields) and guards
 * against accidentally logging huge strings (raw OCR text, full
 * translations) — a common source of noisy terminals and slow Metro
 * consoles that make real errors harder to spot.
 *
 * Swap this out for winston/pino in production without touching call sites.
 */

const MAX_LOGGED_STRING_LENGTH = 300;

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function truncate(value) {
    if (typeof value !== 'string') return value;
    if (value.length <= MAX_LOGGED_STRING_LENGTH) return value;
    return `${value.slice(0, MAX_LOGGED_STRING_LENGTH)}… [truncated, ${value.length} chars total]`;
}

/**
 * @param {Record<string, unknown>|undefined} extra
 * @returns {Record<string, unknown>|undefined}
 */
function safeExtra(extra) {
    if (!extra || typeof extra !== 'object') return undefined;
    const safe = {};
    for (const [key, value] of Object.entries(extra)) {
        safe[key] = truncate(value);
    }
    return safe;
}

/**
 * @param {'info'|'warn'|'error'} level
 * @param {string} scope
 * @param {string} message
 * @param {Record<string, unknown>} [extra]
 */
function log(level, scope, message, extra) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${scope}]`;
    const cleanExtra = safeExtra(extra);

    if (level === 'error') {
        console.error(prefix, message, cleanExtra ?? '');
    } else if (level === 'warn') {
        console.warn(prefix, message, cleanExtra ?? '');
    } else {
        console.log(prefix, message, cleanExtra ?? '');
    }
}

/**
 * Create a logger bound to a fixed scope (e.g. a module or feature name).
 * @param {string} scope
 */
export function createLogger(scope) {
    return {
        info: (message, extra) => log('info', scope, message, extra),
        warn: (message, extra) => log('warn', scope, message, extra),
        error: (message, extra) => log('error', scope, message, extra),
    };
}