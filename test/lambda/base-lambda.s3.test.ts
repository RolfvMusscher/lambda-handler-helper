import 'reflect-metadata';

import { IEventHandler, LambdaHandlerHelper, LambdaHandlerHelperContainer } from '../../src';
import { Context, S3Event } from 'aws-lambda';
import { injectable } from 'inversify';

const testBucketName = 'testBucketName';
const testBucketObjectName = 'testBucketObjectName';
const testBucketName2 = 'testBucketName2';
const testBucketObjectName2 = 'testBucketObjectName2';

const event: S3Event = {
	Records: [
		{
			eventSource: 'aws:s3',
			s3: {
				bucket: {
					name: testBucketName,
				},
				object: {
					key: testBucketObjectName,
				},
			},
		},
		{
			eventSource: 'aws:s3',
			s3: {
				bucket: {
					name: testBucketName2,
				},
				object: {
					key: testBucketObjectName2,
				},
			},
		},
	],
} as unknown as S3Event;

interface S3ObjectCreated {
	bucket : {
		name: string;
	},
	object: {
		key: string;
	}	
}

@injectable()
class TestEventS3Handler implements IEventHandler<S3ObjectCreated, void> {
	static mockedHandler = jest.fn();
	async handleMessage(
		message: S3ObjectCreated,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		envelopes: any,
		lambdaContext: Context,
		eventId?: string,
	): Promise<void> {
		TestEventS3Handler.mockedHandler(message, envelopes, lambdaContext, eventId);
	}
}


describe('BaseLambda TestEventHandler for Kinesis Records', () => {
	let container: LambdaHandlerHelperContainer<TestEventS3Handler>;
	let baseLambda: LambdaHandlerHelper<S3ObjectCreated>;

	beforeEach(() => {
		container = new LambdaHandlerHelperContainer<TestEventS3Handler>(
			TestEventS3Handler
		);
		baseLambda = new LambdaHandlerHelper(container);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('handle a s3 batch', async () => {
		await baseLambda.handler(event, {} as unknown as Context);
		
		expect(TestEventS3Handler.mockedHandler).toHaveBeenCalledWith(
			{
				bucket: {
					name: testBucketName,
				},
				object: {
					key: testBucketObjectName,
				},
			},
			[
				{ type: 'S3', event },
				{ type: 'S3Record', event: event.Records[0] },
				{ type: 'Direct', event: event.Records[0].s3 }
			],
			{},
			'unknown'
		);
		expect(TestEventS3Handler.mockedHandler).toHaveBeenCalledWith(
			{
				bucket: {
					name: testBucketName2,
				},
				object: {
					key: testBucketObjectName2,
				},
			},
			[
				{ type: 'S3', event },
				{ type: 'S3Record', event: event.Records[1] },
				{ type: 'Direct', event: event.Records[1].s3 }
			],
			{},
			'unknown'
		);

		expect(TestEventS3Handler.mockedHandler).toHaveBeenCalledTimes(2);
	});

	
});
