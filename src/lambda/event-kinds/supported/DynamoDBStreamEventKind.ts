import { DynamoDBStreamEvent } from 'aws-lambda';

export interface DynamoDBStreamEventKind {
  kind: 'DynamoDB';
  event: DynamoDBStreamEvent;
}
