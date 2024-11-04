import { S3EventRecord } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface S3EventRecordEventType extends IEventType {
  type: 'S3Record';
  event: S3EventRecord;
}
