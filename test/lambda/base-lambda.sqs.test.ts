import { Context, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda';
import 'reflect-metadata';

import { LambdaHandlerHelperContainer } from '../../src/container/lambda-handler-helper-container';
import { LambdaHandlerHelper } from '../../src/lambda/lambda-handler-helper';
import { TestEvent, TestEventHandler } from './lambda-handler-helper.test';

const testEvent1 = {
	message: 'testSqs1',
};

const testEvent2 = {
	message: 'testSqs2',
};

const event: SQSEvent = {
	Records: [
    {
    	messageId: '1',
    	eventSource: 'aws:sqs',
    	body: JSON.stringify(testEvent1),
    } as unknown as SQSRecord,
    {
    	messageId: '2',
    	eventSource: 'aws:sqs',
    	body: JSON.stringify(testEvent2),
    } as unknown as SQSRecord,
	],
};

describe('BaseLambda TestEventHandler for SQS Records', () => {
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
				{ kind: 'SQS', event },
				{ kind: 'SQSRecord', event: event.Records[0] },
				{ kind: 'Direct', event: testEvent1 },
			],
			{},
			'1'
		);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledWith(
			testEvent2,
			[
				{ kind: 'SQS', event },
				{ kind: 'SQSRecord', event: event.Records[1] },
				{ kind: 'Direct', event: testEvent2 },
			],
			{},
			'2'
		);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(2);
	});

	it('should return a single failed item, when 1 handleEvent fails', async () => {
		TestEventHandler.mockedHandler
			.mockImplementationOnce(() => {
				throw new Error('Test error');
			})
			.mockImplementationOnce(() => {});

		const result = await baseLambda.handler(event, {} as unknown as Context);

		expect(result).toStrictEqual({
			batchItemFailures: [{ itemIdentifier: '1' }],
		} satisfies SQSBatchResponse);

		expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(2);
	});
});
