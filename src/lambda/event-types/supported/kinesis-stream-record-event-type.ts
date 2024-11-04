import { KinesisStreamRecord } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface KinesisStreamRecordEventType extends IEventType {
  type: 'KinesisRecord';
  event: KinesisStreamRecord;
}
