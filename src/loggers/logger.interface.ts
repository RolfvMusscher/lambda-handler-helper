import { LogLevel } from './log-level.enum';

export interface ILogger {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(level: LogLevel, message: any): void;
}
