export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    FATAL = "FATAL",
}

export function isLogLevelGreaterThanOrEqual(level: LogLevel, comparisonLevel: LogLevel): boolean {
    const logLevelOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    return logLevelOrder.indexOf(level) >= logLevelOrder.indexOf(comparisonLevel);
}
