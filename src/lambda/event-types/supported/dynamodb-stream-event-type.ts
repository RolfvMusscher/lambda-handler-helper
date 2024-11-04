import { DynamoDBStreamEvent } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface DynamoDBStreamEventType extends IEventType { 
  type: 'DynamoDB';
  event: DynamoDBStreamEvent;
}
