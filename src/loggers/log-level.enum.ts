export enum LogLevel {
    TRACE = 'TRACE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
}

const logLevelOrder = [LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];

export function isLogLevelGreaterThanOrEqual(level: LogLevel, comparisonLevel: LogLevel): boolean {
	return logLevelOrder.indexOf(level) >= logLevelOrder.indexOf(comparisonLevel);
}
