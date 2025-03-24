import { inject, injectable, optional } from 'inversify';
import { CONTAINERTYPES } from '../container/container-types';
import { IDisposable } from '../disposable.interface';
import { isLogLevelGreaterThanOrEqual, LogLevel } from './log-level.enum';
import { ILogger } from './logger.interface';
import { isNullOrUndefined } from '../checks';

@injectable()
export class DefaultLogger implements ILogger, IDisposable {
	private readonly storedLines = new Array<{
    eventId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any;
    logLevel: LogLevel;
  }>();

	constructor(
    @inject(CONTAINERTYPES.LogLevel)
    @optional()
    public readonly logLevel: LogLevel = isNullOrUndefined(process.env.LOG_LEVEL) ?  LogLevel.WARN : (process.env.LOG_LEVEL as LogLevel),

    @inject(CONTAINERTYPES.EventId)
    @optional()
    public readonly eventId: string = 'unspecifed'
	) {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	log(level: LogLevel, message: any): void {
		const newMessage = { eventId: this.eventId, message, logLevel: level };
		if (isLogLevelGreaterThanOrEqual(level, this.logLevel)) {
			// log the older messages first
			this.storedLines.forEach((line) => {
				this.logMessage(line);
			});
			this.logMessage(newMessage);
			this.clearMessage();
		} else if (isLogLevelGreaterThanOrEqual(level, LogLevel.INFO)) {
			// we dont want to default store trace logs
			this.storedLines.push(newMessage);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private logMessage(message: { eventId: string, message: any, logLevel: LogLevel }): void {
		const logLine = JSON.stringify(message);
		switch(message.logLevel) 
		{
		case LogLevel.INFO:
			console.info(logLine);
			break;
		case LogLevel.DEBUG:
			console.debug(logLine);
			break;
		case LogLevel.WARN:
			console.warn(logLine);
			break;
		case LogLevel.TRACE:
			console.trace(logLine);
			break;
		case LogLevel.ERROR:
		case LogLevel.FATAL:
			console.error(logLine);
			break;
		}
	}

	dispose(): void {
		this.clearMessage();
	}

	clearMessage(): void {
		this.storedLines.length = 0;
	}
}
