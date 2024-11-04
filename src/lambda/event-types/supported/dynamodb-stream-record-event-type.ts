import { DynamoDBRecord } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface DynamoDBStreamRecordEventType extends IEventType {
  type: 'DynamoDBRecord';
  event: DynamoDBRecord;
}
