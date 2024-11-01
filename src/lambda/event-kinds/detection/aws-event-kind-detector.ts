import {
	APIGatewayProxyEvent,
	DynamoDBRecord,
	DynamoDBStreamEvent,
	EventBridgeEvent,
	KinesisStreamEvent,
	KinesisStreamRecord,
	S3Event,
	S3EventRecord,
	SNSEvent,
	SNSEventRecord,
	SQSEvent,
	SQSRecord,
} from 'aws-lambda';
import { AWSEvent } from '../../aws-event';
import { AWSEventKind } from '../supported';

// TODO: can we simplify the parsting using https://docs.powertools.aws.dev/lambda/typescript/latest/utilities/parser/#manual-parsing
export class AwsEventKindDetector<MessageDetail> {
	public detectAWSEventKind(event: AWSEvent | MessageDetail): AWSEventKind {
		if (this.isAPIGatewayProxyEvent(event))
			return { kind: 'APIGateway', event };

		if (this.containsRecords(event)) {
			if (this.isSQSEvent(event)) return { kind: 'SQS', event };
			if (this.isSNSEvent(event)) return { kind: 'SNS', event };
			if (this.isKinesisEvent(event)) return { kind: 'Kinesis', event };
			if (this.isDynamoDBStreamEvent(event)) return { kind: 'DynamoDB', event };
			if (this.isS3Event(event)) return { kind: 'S3', event };
		}

		if (this.isEventBridgeEvent(event)) return { kind: 'EventBridge', event };

		return { kind: 'Direct', event };
	}

	// Type guard for SQSEvent
	public isSQSEvent(
		event: S3Event | DynamoDBStreamEvent | SNSEvent | SQSEvent,
	): event is SQSEvent {
		const firstRecord = event.Records[0] as SQSRecord;
		return (
			this.hasProperty(firstRecord, 'eventSource') &&
      firstRecord.eventSource === 'aws:sqs'
		);
	}

	// Type guard for KinesisEvent
	public isKinesisEvent(
		event:
      | S3Event
      | DynamoDBStreamEvent
      | SNSEvent
      | SQSEvent
      | KinesisStreamEvent,
	): event is KinesisStreamEvent {
		const firstRecord = event.Records[0] as KinesisStreamRecord;
		return (
			this.hasProperty(firstRecord, 'eventSource') &&
      firstRecord.eventSource === 'aws:kinesis'
		);
	}

	// Type guard for S3Event
	public isS3Event(
		event: S3Event | DynamoDBStreamEvent | SNSEvent | SQSEvent,
	): event is S3Event {
		const firstRecord = event.Records[0] as S3EventRecord;
		return (
			this.hasProperty(firstRecord, 'eventSource') &&
      firstRecord.eventSource === 'aws:s3'
		);
	}

	// Type guard for SNSEvent
	public isSNSEvent(
		event: S3Event | DynamoDBStreamEvent | SNSEvent | SQSEvent,
	): event is SNSEvent {
		const firstRecord = event.Records[0] as SNSEventRecord;
		return (
			this.hasProperty(firstRecord, 'EventSource') &&
      firstRecord.EventSource === 'aws:sns'
		);
	}

	// Type guard for DynamoDBStreamEvent
	public isDynamoDBStreamEvent(
		event: S3Event | DynamoDBStreamEvent | SNSEvent | SQSEvent,
	): event is DynamoDBStreamEvent {
		const firstRecord = event.Records[0] as DynamoDBRecord;
		return (
			this.hasProperty(firstRecord, 'eventSource') &&
      firstRecord.eventSource === 'aws:dynamodb'
		);
	}

	// Type guard for EventBridgeEvent
	public isEventBridgeEvent<InputMessage>(
		event: AWSEvent | InputMessage,
	): event is EventBridgeEvent<string, InputMessage> {
		return (
			this.hasProperty(event, 'source') &&
      this.hasProperty(event, 'detail-type')
		);
	}

	// Type guard for APIGatewayProxyEvent
	protected isAPIGatewayProxyEvent<InputMessage>(
		event: AWSEvent | InputMessage,
	): event is APIGatewayProxyEvent {
		return (
			this.hasProperty(event, 'httpMethod') &&
      this.hasProperty(event, 'headers') &&
      this.hasProperty(event, 'path')
		);
	}

	private hasProperty(event: unknown, property: string): boolean {
		return Object.prototype.hasOwnProperty.call(event, property);
	}

	protected containsRecords(
		event: AWSEvent | MessageDetail,
	): event is S3Event | DynamoDBStreamEvent | SNSEvent | SQSEvent {
		return (
			this.hasRecords(event) &&
      Array.isArray(event.Records) &&
      event.Records.length > 0
		);
	}

	private hasRecords(
		event: AWSEvent | MessageDetail,
	): event is S3Event | DynamoDBStreamEvent | SNSEvent | SQSEvent {
		return this.hasProperty(event, 'Records');
	}
}
