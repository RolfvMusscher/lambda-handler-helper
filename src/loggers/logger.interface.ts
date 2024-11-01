import { LogLevel } from './log-level.enum';

export interface ILogger {
    log(level: LogLevel, message: any): void;
}
