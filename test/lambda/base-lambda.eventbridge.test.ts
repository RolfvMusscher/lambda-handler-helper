
import 'reflect-metadata';

import {
	Context,
	EventBridgeEvent,
} from 'aws-lambda';
import { LambdaHandlerHelper, LambdaHandlerHelperContainer } from '../../src';
import { TestEvent, TestEventHandler } from './lambda-handler-helper.test';

const testEvent1 = {
	message: 'testEventBridge',
};

const event : EventBridgeEvent<string, TestEvent> = {
	id: 'eventbridge123',
	source: 'mySource',
	'detail-type': 'myDetail',
	detail: testEvent1
} as unknown as EventBridgeEvent<string, TestEvent>;

describe('BaseLambda TestEventHandler for Kinesis Records', () => {
	let container: LambdaHandlerHelperContainer<TestEventHandler>;
	let baseLambda: LambdaHandlerHelper<TestEvent>;

	beforeEach(() => {
		container = new LambdaHandlerHelperContainer<TestEventHandler>(
			TestEventHandler
		);
		baseLambda = new LambdaHandlerHelper(container);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call the handler multiple times, handling batches', async () => {
		await baseLambda.handler(event, {} as unknown as Context);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledWith(
			testEvent1,
			[
				{ type: 'EventBridge', event }
			],
			{},
			'eventbridge123'
		);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(1);
	});
});
