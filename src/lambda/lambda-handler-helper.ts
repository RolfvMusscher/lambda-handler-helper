/* eslint-disable @typescript-eslint/no-invalid-void-type */
import assert from 'assert';
import {
	Context,
	DynamoDBBatchItemFailure,
	DynamoDBBatchResponse,
	DynamoDBRecord,
	KinesisStreamBatchItemFailure,
	KinesisStreamBatchResponse,
	SQSBatchItemFailure,
	SQSBatchResponse,
} from 'aws-lambda';
import 'source-map-support/register';
import { inspect } from 'util';
import { isDefined, isNullOrUndefined } from '../checks';
import { CONTAINERTYPES } from '../container/container-types';
import { LambdaHandlerHelperContainer } from '../container/lambda-handler-helper-container';
import { ILogger } from '../loggers';
import { LogLevel } from '../loggers/log-level.enum';
import { AWSEvent } from './aws-event';
import { IEventHandler } from './event-handler.interface';
import { AwsEventKindDetector } from './event-kinds/detection/aws-event-kind-detector';
import { AWSEventKind } from './event-kinds/supported/AWSEventKind';
import { KinesisStreamRecordKind } from './event-kinds/supported/KinesisStreamRecordKind';
import { SQSRecordKind } from './event-kinds/supported/SQSRecordKind';
import { FailedMessages } from './failed-messages';

// Define the base class with a generic type for the message
export class LambdaHandlerHelper<InputMessage, OutputMessage = void> {
	protected shouldReportFailedBatches = true;
	protected readonly logger: ILogger;
	protected kindDetector: AwsEventKindDetector<InputMessage> =
		new AwsEventKindDetector<InputMessage>();

	constructor(
    readonly container: LambdaHandlerHelperContainer<
      IEventHandler<InputMessage, OutputMessage>
    >,
	) {
		this.logger = this.container.get<ILogger>(CONTAINERTYPES.ILogger);
	}

	// Method to handle generic events
	public async handler(
		event: AWSEvent | InputMessage,
		context: Context,
	): Promise<void | OutputMessage | SQSBatchResponse> {
		try {
			const failedMessages: FailedMessages<InputMessage> = [];
			if (isNullOrUndefined(event)) {
				this.logger.log(LogLevel.WARN, 'No events to process');
				return;
			}

			const events = this.extractEnvelopes(event);

			this.logger.log(LogLevel.INFO, 'Processing batch of events');
			this.logger.log(LogLevel.INFO, events);

			const result = await Promise.all(
				events.map(async (eventSet): Promise<OutputMessage | undefined> => {
					try {
						const scopedContainer = this.container.createChild();
						scopedContainer
							.bind<string>(CONTAINERTYPES.EventId)
							.toConstantValue(eventSet.eventId);
						const eventHandler = this.container.get<
              IEventHandler<InputMessage, OutputMessage>
            >(CONTAINERTYPES.IEventHandler);
						return await eventHandler.handleMessage(
							eventSet.event,
							eventSet.context,
							context,
							eventSet.eventId,
						);
					} catch (error) {
						this.logger.log(LogLevel.ERROR, {
							Error: inspect(error, { depth: null }),
							event: eventSet.event,
						});
						failedMessages.push({ kind: eventSet, error: error as Error });
					}
					return undefined;
				}),
			);

			if (failedMessages.length > 0) {
				this.logger.log(
					LogLevel.ERROR,
					`batch has failed items ${JSON.stringify(failedMessages)})`,
				);
			}

			const topLevel = events[0].context[0];
			if (this.shouldReportFailedBatches) {
				switch (topLevel.kind) {
				case 'SQS':
					return {
						batchItemFailures:
                this.convertFailedMessagesToSqsBatch(failedMessages),
					} satisfies SQSBatchResponse;
				case 'Kinesis':
					return {
						batchItemFailures:
                this.convertFailedMessagesToKinesisBatch(failedMessages),
					} satisfies KinesisStreamBatchResponse;
				case 'DynamoDB':
					return {
						// Kinesis and dynamo use the exact same format so we can reuse the function
						batchItemFailures:
                this.convertFailedMessagesToDynamoBatch(failedMessages),
					} satisfies DynamoDBBatchResponse;
				}
			}

			if (failedMessages.length > 0) {
				throw new Error('Error processing message');
			}
			return result[0];
		} catch (err) {
			this.logger.log(
				LogLevel.FATAL,
				JSON.stringify({ Error: inspect(err, { depth: null }) }),
			);
			throw err;
		}
	}

	private convertFailedMessagesToSqsBatch(
		failedMessages: Array<{
      kind: { event: InputMessage; context: AWSEventKind[] };
      error: Error;
    }>,
	): SQSBatchItemFailure[] {
		return failedMessages.map((failed): SQSBatchItemFailure => {
			const record: SQSRecordKind = failed.kind.context[1] as SQSRecordKind;
			return { itemIdentifier: record.event.messageId };
		});
	}

	private convertFailedMessagesToDynamoBatch(
		failedMessages: Array<{
      kind: { event: InputMessage; context: AWSEventKind[] };
      error: Error;
    }>,
	): KinesisStreamBatchItemFailure[] {
		return failedMessages.map((failed): DynamoDBBatchItemFailure => {
			const record: DynamoDBRecord = failed.kind.event as DynamoDBRecord;
			assert(
				isDefined(record.eventID),
				'EventId not defined in batchItemfailure for dynamo',
			);
			return { itemIdentifier: record.eventID };
		});
	}

	private convertFailedMessagesToKinesisBatch(
		failedMessages: Array<{
      kind: { event: InputMessage; context: AWSEventKind[] };
      error: Error;
    }>,
	): KinesisStreamBatchItemFailure[] {
		return failedMessages.map((failed): KinesisStreamBatchItemFailure => {
			const record: KinesisStreamRecordKind = failed.kind
				.context[1] as KinesisStreamRecordKind;
			return { itemIdentifier: record.event.eventID };
		});
	}

	private extractEnvelopes(
		event: AWSEvent | InputMessage,
		context: AWSEventKind[] = [],
		eventId = 'unknown',
	): Array<{ event: InputMessage; context: AWSEventKind[]; eventId: string }> {
		const eventKind = this.kindDetector.detectAWSEventKind(event);

		let result: Array<{
      event: InputMessage;
      context: AWSEventKind[];
      eventId: string;
    }> = [];
		context.push(eventKind);
		switch (eventKind.kind) {
		case 'SQS':
			result = eventKind.event.Records.flatMap((record) => {
				const newEvent: AWSEvent | InputMessage = JSON.parse(record.body);
				return this.extractEnvelopes(
					newEvent,
					[...context, { kind: 'SQSRecord', event: record }],
					record.messageId,
				);
			});
			break;
		case 'SNS':
			result = eventKind.event.Records.flatMap((record) => {
				const newEvent: AWSEvent | InputMessage = JSON.parse(
					record.Sns.Message,
				);
				return this.extractEnvelopes(
					newEvent,
					[...context, { kind: 'SNSRecord', event: record }],
					record.Sns.MessageId,
				);
			});
			break;
		case 'EventBridge':
			result.push({
				event: eventKind.event.detail as InputMessage,
				context,
				eventId: eventKind.event.id,
			});
			break;
		case 'Direct':
			result.push({
				event: eventKind.event as InputMessage,
				context,
				eventId,
			});
			break;
		case 'APIGateway':
			result.push({
				event: JSON.parse(eventKind.event.body ?? '{}'),
				context,
				eventId,
			});
			break;
		case 'S3':
			result = eventKind.event.Records.flatMap((record) => {
				const newEvent: AWSEvent | InputMessage = record.s3 as InputMessage;
				return this.extractEnvelopes(
					newEvent,
					[...context, { kind: 'S3Record', event: record }],
					eventId,
				);
			});
			break;
		case 'DynamoDB':
			result = eventKind.event.Records.map((record) => {
				const event: AWSEvent | InputMessage = record as InputMessage;
				return { event, context, eventId };
			});
			break;
		case 'Kinesis':
			result = eventKind.event.Records.flatMap((record) => {
				const newEvent: AWSEvent | InputMessage = JSON.parse(
					Buffer.from(record.kinesis.data, 'base64').toString('utf8'),
				);
				return this.extractEnvelopes(
					newEvent,
					[...context, { kind: 'KinesisRecord', event: record }],
					record.eventID,
				);
			});
			break;
		}

		return result;
	}
}
