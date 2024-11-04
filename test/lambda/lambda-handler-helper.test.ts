/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from 'aws-lambda';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { LambdaHandlerHelperContainer } from '../../src/container/lambda-handler-helper-container';
import { LambdaHandlerHelper } from '../../src/lambda/lambda-handler-helper';
import { IEventHandler } from '../../src/lambda/event-handler.interface';

export interface TestEvent {
	message: string;
}

@injectable()
export class TestEventHandler implements IEventHandler<TestEvent, void> {
	static mockedHandler = jest.fn();
	async handleMessage(
		message: TestEvent,
		envelopes: any,
		lambdaContext: Context,
		eventId?: string,
	): Promise<void> {
		TestEventHandler.mockedHandler(message, envelopes, lambdaContext, eventId);
	}
}

describe('LambdaHandlerHelper TestEventHandler', () => {
	let container: LambdaHandlerHelperContainer<TestEventHandler>;
	let baseLambda: LambdaHandlerHelper<TestEvent>;

	beforeEach(() => {
		container = new LambdaHandlerHelperContainer<TestEventHandler>(TestEventHandler);
		baseLambda = new LambdaHandlerHelper(container);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call the handler when it is invoked with a direct execution', async () => {
		const event: TestEvent = {
			message: 'test',
		};

		await baseLambda.handler(event, {} as unknown as Context);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledWith(
			event,
			[{ event, type: 'Direct' }],
			{},
			'unknown',
		);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(1);
	});

	it('should not start event handlers when nothing to process', async () => {
		await baseLambda.handler(
			undefined as unknown as TestEvent,
			{} as unknown as Context,
		);

		expect(TestEventHandler.mockedHandler).not.toHaveBeenCalled();
	});
});
