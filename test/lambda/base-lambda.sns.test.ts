import 'reflect-metadata';

import { Context, SNSEvent, SNSEventRecord } from 'aws-lambda';
import { LambdaHandlerHelperContainer } from '../../src/container/lambda-handler-helper-container';
import { LambdaHandlerHelper } from '../../src/lambda/lambda-handler-helper';
import { TestEvent, TestEventHandler } from './lambda-handler-helper.test';

const testEvent1 = {
	message: 'testSns1',
};

const testEvent2 = {
	message: 'testSns2',
};

const event: SNSEvent = {
	Records: [
		{
			EventSource: 'aws:sns',
			Sns: {
				Message: JSON.stringify(testEvent1),
				MessageId: '1',
			},
		} as unknown as SNSEventRecord,
		{
			EventSource: 'aws:sns',
			Sns: {
				Message: JSON.stringify(testEvent2),
				MessageId: '2',
			},
		} as unknown as SNSEventRecord,
	],
};

describe('BaseLambda TestEventHandler for SNS Records', () => {
	let container: LambdaHandlerHelperContainer<TestEventHandler>;
	let baseLambda: LambdaHandlerHelper<TestEvent>;

	beforeEach(() => {
		container = new LambdaHandlerHelperContainer<TestEventHandler>(TestEventHandler);
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
				{ type: 'SNS', event },
				{ type: 'SNSRecord', event: event.Records[0] },
				{ type: 'Direct', event: testEvent1 },
			],
			{},
			'1',
		);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledWith(
			testEvent2,
			[
				{ type: 'SNS', event },
				{ type: 'SNSRecord', event: event.Records[1] },
				{ type: 'Direct', event: testEvent2 },
			],
			{},
			'2',
		);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(2);
	});
});
