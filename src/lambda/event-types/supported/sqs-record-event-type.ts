import { SQSRecord } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface SQSRecordKind extends IEventType {
  type: 'SQSRecord';
  event: SQSRecord;
}
