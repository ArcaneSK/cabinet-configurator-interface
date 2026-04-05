// logger.js
class Logger {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
    }

    setDebugMode(isDebug) {
        this.debugMode = isDebug;
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[LOG]', ...args);
        }
    }

    info(...args) {
        if (this.debugMode) {
            console.info('[INFO]', ...args);
        }
    }

    warn(...args) {
        if (this.debugMode) {
            console.warn('[WARN]', ...args);
        }
    }

    error(...args) {
        console.error('[ERROR]', ...args); // Always log errors
    }
}

// Export a singleton instance for global use
export const logger = new Logger(false);
