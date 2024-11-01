import { APIGatewayProxyEventKind } from "./APIGatewayProxyEventKind";
import { DirectKind } from "./DirectKind";
import { DynamoDBStreamEventKind } from "./DynamoDBStreamEventKind";
import { DynamoDBStreamRecordKind } from "./DynamoDBStreamRecordKind";
import { EventBridgeEventKind } from "./EventBridgeEventKind";
import { KinesisStreamEventKind } from "./KinesisStreamEventKind";
import { KinesisStreamRecordKind } from "./KinesisStreamRecordKind";
import { S3EventKind } from "./S3EventKind";
import { S3EventRecordKind } from "./S3EventRecordKind";
import { SNSEventKind } from "./SNSEventKind";
import { SNSEventRecordKind } from "./SNSEventRecordKind";
import { SQSEventKind } from "./SQSEventKind";
import { SQSRecordKind } from "./SQSRecordKind";

export type AWSEventKind =
  | APIGatewayProxyEventKind
  | SQSEventKind
  | SQSRecordKind
  | DirectKind<unknown>
  | SNSEventKind
  | SNSEventRecordKind
  | S3EventKind
  | EventBridgeEventKind
  | KinesisStreamEventKind
  | KinesisStreamRecordKind
  | DynamoDBStreamEventKind
  | DynamoDBStreamRecordKind
  | S3EventRecordKind
  | EventBridgeEventKind;
