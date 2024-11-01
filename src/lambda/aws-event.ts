import {
	APIGatewayProxyEvent,
	DynamoDBStreamEvent,
	EventBridgeEvent,
	KinesisStreamEvent,
	S3Event,
	SNSEvent,
	SQSEvent,
} from 'aws-lambda';

export type AWSEvent =
  | SQSEvent
  | EventBridgeEvent<string, unknown>
  | S3Event
  | DynamoDBStreamEvent
  | SNSEvent
  | APIGatewayProxyEvent
  | KinesisStreamEvent;
