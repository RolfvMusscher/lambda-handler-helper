import 'reflect-metadata';
import { DefaultLogger } from '../../src/loggers/default.logger';
import { LogLevel } from '../../src/loggers/log-level.enum';

const infoMessage = 'info message';
const debugMessage = 'debug message';
const warnMessage = 'warn message';
const traceMessage = 'trace message';

describe('DefaultLogger', () => {
	let logger: DefaultLogger;
	let consoleInfoSpy: jest.SpyInstance;
	let consoleDebugSpy: jest.SpyInstance;
	let consoleWarnSpy: jest.SpyInstance;
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach(() => {
		logger = new DefaultLogger(LogLevel.INFO, 'testEventId');
		consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
		consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
		consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleInfoSpy.mockRestore();
		consoleDebugSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	it('should log message when log level is greater than or equal to the logger log level', () => {
		logger.log(LogLevel.INFO, infoMessage);

		expect(consoleInfoSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: infoMessage, logLevel: 'INFO' })
		);
	});

	it('should store message when log level is less than logger log level but greater than or equal to INFO', () => {
		logger.log(LogLevel.INFO, infoMessage);
		logger.log(LogLevel.DEBUG, debugMessage);

		expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
		expect(consoleInfoSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: infoMessage, logLevel: 'INFO' })
		);
	});

	it('should not store message when log level is less than INFO', () => {
		
		logger.log(LogLevel.TRACE, traceMessage);

		expect(consoleInfoSpy).not.toHaveBeenCalled();
	});

	it('should log stored messages when a new message with sufficient log level is logged', () => {
		logger.log(LogLevel.INFO, infoMessage);
		logger.log(LogLevel.DEBUG, debugMessage);
		logger.log(LogLevel.WARN, warnMessage);

		expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: warnMessage, logLevel: 'WARN' })
		);

		expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
		expect(consoleInfoSpy).toHaveBeenCalledWith(
			JSON.stringify({ eventId: 'testEventId', message: infoMessage, logLevel: 'INFO' })
		);
	});

	it('should clear stored messages after logging them', () => {
		const warnMessage2 = 'another warn message';
		logger.log(LogLevel.INFO, infoMessage);
		logger.log(LogLevel.DEBUG, debugMessage);
		logger.log(LogLevel.WARN, warnMessage);
		logger.log(LogLevel.WARN, warnMessage2);

		expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			JSON.stringify({
				eventId: 'testEventId',
				message: warnMessage2,
				logLevel: 'WARN',
			})
		);

		expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
	});
});
