import 'reflect-metadata';
import { DefaultLogger } from '../../src/loggers/default.logger';
import { LogLevel } from '../../src/loggers/log-level.enum';

const infoMessage = 'info message';
const debugMessage = 'debug message';
const warnMessage = 'warn message';
const traceMessage = 'trace message';

describe('DefaultLogger', () => {
	let logger: DefaultLogger;
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		logger = new DefaultLogger(LogLevel.INFO, 'testEventId');
		consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should log message when log level is greater than or equal to the logger log level', () => {
		logger.log(LogLevel.INFO, infoMessage);

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: infoMessage, logLevel: 'INFO' })
		);
	});

	it('should store message when log level is less than logger log level but greater than or equal to INFO', () => {
		logger.log(LogLevel.INFO, infoMessage);
		logger.log(LogLevel.DEBUG, debugMessage);

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: infoMessage, logLevel: 'INFO' })
		);
	});

	it('should not store message when log level is less than INFO', () => {
		
		logger.log(LogLevel.TRACE, traceMessage);

		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it('should log stored messages when a new message with sufficient log level is logged', () => {
		logger.log(LogLevel.INFO, infoMessage);
		logger.log(LogLevel.DEBUG, debugMessage);
		logger.log(LogLevel.WARN, warnMessage);

		expect(consoleSpy).toHaveBeenCalledTimes(2);
		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: warnMessage, logLevel: 'WARN' })
		);
		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: infoMessage, logLevel: 'INFO' })
		);
	});

	it('should clear stored messages after logging them', () => {
		const warnMessage2 = 'another warn message';
		logger.log(LogLevel.INFO, infoMessage);
		logger.log(LogLevel.DEBUG, debugMessage);
		logger.log(LogLevel.WARN, warnMessage);
		logger.log(LogLevel.WARN, warnMessage2);

		expect(consoleSpy).toHaveBeenCalledTimes(3);
		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				eventId: 'testEventId',
				message: warnMessage2,
				logLevel: 'WARN',
			})
		);
	});
});
