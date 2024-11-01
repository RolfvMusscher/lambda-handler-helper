import { inject, injectable, optional } from 'inversify';
import { CONTAINERTYPES } from '../container/container-types';
import { IDisposable } from '../disposable.interface';
import { isLogLevelGreaterThanOrEqual, LogLevel } from './log-level.enum';
import { ILogger } from './logger.interface';

@injectable()
export class DefaultLogger implements ILogger, IDisposable {
	private readonly storedLines = new Array<{ eventId: string; message: any }>();

	constructor(
    @inject(CONTAINERTYPES.LogLevel)
    @optional()
    public readonly logLevel: LogLevel = LogLevel.WARN,
    @inject(CONTAINERTYPES.EventId)
    @optional()
    public readonly eventId: string = 'unspecifed',
	) {}

	log(level: LogLevel, message: any): void {
		const newMessage = { eventId: this.eventId, message };
		if (isLogLevelGreaterThanOrEqual(level, this.logLevel)) {
			console.log(JSON.stringify(newMessage));
			// log the rest as well
			this.storedLines.forEach((line) => {
				console.log(JSON.stringify(line));
			});
			this.clearMessage();
		} else if (isLogLevelGreaterThanOrEqual(level, LogLevel.INFO)) {
			// we dont want to default store trace logs
			this.storedLines.push(newMessage);
		}
	}

	dispose(): void {
		this.clearMessage();
	}

	clearMessage(): void {
		this.storedLines.length = 0;
	}
}
