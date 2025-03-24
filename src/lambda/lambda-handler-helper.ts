/* eslint-disable @typescript-eslint/no-invalid-void-type */
import assert from 'assert';
import {
	APIGatewayProxyResult,
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
import { AwsEventKindDetector } from './event-types/detection/aws-event-kind-detector';
import { AWSEventTypes } from './event-types/supported/aws-event-types';
import { KinesisStreamRecordEventType } from './event-types/supported/kinesis-stream-record-event-type';
import { SQSRecordKind } from './event-types/supported/sqs-record-event-type';
import { FailedMessages } from './failed-messages';
import { isDisposable } from '../disposable.interface';
import { validateAndConvertDTO } from '../validation/validation';
import { ValidationException } from '../validation/validation-exception';
import { Container } from 'inversify';

// Define the base class with a generic type for the message
export class LambdaHandlerHelper<InputMessage, OutputMessage = void> {
	protected shouldReportFailedBatches = true;
	protected readonly logger: ILogger;
	protected kindDetector: AwsEventKindDetector<InputMessage> =
		new AwsEventKindDetector<InputMessage>();

	constructor(
    readonly container: LambdaHandlerHelperContainer<
      IEventHandler<InputMessage, OutputMessage>
    >
	) {
		this.logger = this.container.get<ILogger>(CONTAINERTYPES.ILogger);
	}

	// Method to handle generic events
	public async handler(
		event: AWSEvent | InputMessage,
		context: Context
	): Promise<void | OutputMessage | SQSBatchResponse | APIGatewayProxyResult> {
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
					let logger : ILogger = this.logger;
					let scopedContainer : Container | undefined = undefined;
					try {
						scopedContainer = new Container({ parent: this.container});
						logger = scopedContainer.get<ILogger>(CONTAINERTYPES.ILogger);
						scopedContainer
							.bind<string>(CONTAINERTYPES.EventId)
							.toConstantValue(eventSet.eventId);
						const eventHandler = scopedContainer.get<IEventHandler<InputMessage, OutputMessage>>(CONTAINERTYPES.IEventHandler);
						let dto = eventSet.event;
						if (eventHandler.inputValidationClass) {
							this.logger.log(LogLevel.INFO, 'Validating and converting DTO');
							dto = await validateAndConvertDTO(eventSet.event as object, eventHandler.inputValidationClass) as InputMessage;
						}

						return await eventHandler.handleMessage(
							dto,
							eventSet.context,
							context,
							eventSet.eventId
						);
					} catch (error) {
						logger.log(LogLevel.ERROR, {
							Error: inspect(error, { depth: null }),
							event: eventSet.event,
						});
						failedMessages.push({ kind: eventSet, error: error as Error });						
					} finally {
						if (scopedContainer !== undefined) {
							// should move this disposing
							const logger = this.container.get<ILogger>(CONTAINERTYPES.ILogger);
							if (isDisposable(logger)) {
								logger.dispose();
							}
						}
					}
					return undefined;
				})
			);

			if (failedMessages.length > 0) {
				this.logger.log(
					LogLevel.ERROR,
					`batch has failed items ${JSON.stringify(failedMessages)})`
				);
			}

			const topLevel = events[0].context[0];
			if (this.shouldReportFailedBatches) {
				switch (topLevel.type) {
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

			switch (topLevel.type) {
				case 'APIGateway':
					const validationError = failedMessages.find((failed) => ValidationException.isValidationException(failed.error));
					if (isDefined(validationError)) {
						return {
							statusCode: 400,
							body: JSON.stringify({ message: validationError.error.message }),
						}
					} else {
						return {
							statusCode: 500,
							body: JSON.stringify({ message: 'Internal Server Error' }),
						}
					}
				}
			}

			if (failedMessages.length > 0) {
				throw new Error('Error processing message');
			}
			return result[0];
		} catch (err) {
			this.logger.log(
				LogLevel.FATAL,
				JSON.stringify({ Error: inspect(err, { depth: null }) })
			);
			throw err;
		}
	}

	private convertFailedMessagesToSqsBatch(
		failedMessages: Array<{
      kind: { event: InputMessage; context: AWSEventTypes[] };
      error: Error;
    }>
	): SQSBatchItemFailure[] {
		return failedMessages.map((failed): SQSBatchItemFailure => {
			const record: SQSRecordKind = failed.kind.context[1] as SQSRecordKind;
			return { itemIdentifier: record.event.messageId };
		});
	}

	private convertFailedMessagesToDynamoBatch(
		failedMessages: Array<{
      kind: { event: InputMessage; context: AWSEventTypes[] };
      error: Error;
    }>
	): KinesisStreamBatchItemFailure[] {
		return failedMessages.map((failed): DynamoDBBatchItemFailure => {
			const record: DynamoDBRecord = failed.kind.event as DynamoDBRecord;
			assert(
				isDefined(record.eventID),
				'EventId not defined in batchItemfailure for dynamo'
			);
			return { itemIdentifier: record.eventID };
		});
	}

	private convertFailedMessagesToKinesisBatch(
		failedMessages: Array<{
      kind: { event: InputMessage; context: AWSEventTypes[] };
      error: Error;
    }>
	): KinesisStreamBatchItemFailure[] {
		return failedMessages.map((failed): KinesisStreamBatchItemFailure => {
			const record: KinesisStreamRecordEventType = failed.kind
				.context[1] as KinesisStreamRecordEventType;
			return { itemIdentifier: record.event.eventID };
		});
	}

	private extractEnvelopes(
		event: AWSEvent | InputMessage,
		context: AWSEventTypes[] = [],
		eventId = 'unknown'
	): Array<{ event: InputMessage; context: AWSEventTypes[]; eventId: string }> {
		const eventKind = this.kindDetector.detectAWSEventKind(event);

		let result: Array<{
      event: InputMessage;
      context: AWSEventTypes[];
      eventId: string;
    }> = [];
		context.push(eventKind);
		switch (eventKind.type) {
		case 'SQS':
			result = eventKind.event.Records.flatMap((record) => {
				const newEvent: AWSEvent | InputMessage = JSON.parse(record.body);
				return this.extractEnvelopes(
					newEvent,
					[...context, { type: 'SQSRecord', event: record }],
					record.messageId
				);
			});
			break;
		case 'SNS':
			result = eventKind.event.Records.flatMap((record) => {
				const newEvent: AWSEvent | InputMessage = JSON.parse(
					record.Sns.Message
				);
				return this.extractEnvelopes(
					newEvent,
					[...context, { type: 'SNSRecord', event: record }],
					record.Sns.MessageId
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
				event: this.parseEventBody(eventKind.event.body),
				context,
				eventId : eventKind.event.requestContext.requestId,
			});
			break;
		case 'S3':
			result = eventKind.event.Records.flatMap((record) => {
				const newEvent: AWSEvent | InputMessage = record.s3 as InputMessage;
				return this.extractEnvelopes(
					newEvent,
					[...context, { type: 'S3Record', event: record }],
					eventId
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
					Buffer.from(record.kinesis.data, 'base64').toString('utf8')
				);
				return this.extractEnvelopes(
					newEvent,
					[...context, { type: 'KinesisRecord', event: record }],
					record.eventID
				);
			});
			break;
		}

		return result;
	}

	private parseEventBody(body: string | null): any {
		if (isNullOrUndefined(body)) {
		  return {};
		}
		try {
		  return JSON.parse(body);
		} catch (error) {
			this.logger.log(LogLevel.ERROR, 
				JSON.stringify({ Error: inspect(error, { depth: null }) }));
		  return {};
		}
	  }
}
