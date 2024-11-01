import { SNSEventRecord } from 'aws-lambda';

export interface SNSEventRecordKind {
  kind: 'SNSRecord';
  event: SNSEventRecord;
}
