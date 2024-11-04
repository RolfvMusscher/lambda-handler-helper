import { SNSEventRecord } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface SNSEventRecordEventType extends IEventType {
  type: 'SNSRecord';
  event: SNSEventRecord;
}
