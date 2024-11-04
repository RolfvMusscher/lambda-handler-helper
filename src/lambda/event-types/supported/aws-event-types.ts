import { APIGatewayProxyEventType } from './api-gateway-proxy-event-type';
import { DirectEventType } from './direct-event-type';
import { DynamoDBStreamEventType } from './dynamodb-stream-event-type';
import { DynamoDBStreamRecordEventType } from './dynamodb-stream-record-event-type';
import { EventBridgeEventType } from './event-bridge-event-type';
import { KinesisStreamEventType } from './kinesis-stream-event-type';
import { KinesisStreamRecordEventType } from './kinesis-stream-record-event-type';
import { S3EventType } from './s3-event-type';
import { S3EventRecordEventType } from './s3-event-record-event-type';
import { SNSEventType } from './sns-event-type';
import { SNSEventRecordEventType } from './sns-event-record-event-type';
import { SQSEventType } from './sqs-event-type';
import { SQSRecordKind } from './sqs-record-event-type';

export type AWSEventTypes =
  | APIGatewayProxyEventType
  | SQSEventType
  | SQSRecordKind
  | DirectEventType<unknown>
  | SNSEventType
  | SNSEventRecordEventType
  | S3EventType
  | EventBridgeEventType
  | KinesisStreamEventType
  | KinesisStreamRecordEventType
  | DynamoDBStreamEventType
  | DynamoDBStreamRecordEventType
  | S3EventRecordEventType
  | EventBridgeEventType;
