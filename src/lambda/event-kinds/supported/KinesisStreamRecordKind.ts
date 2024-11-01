import { KinesisStreamRecord } from 'aws-lambda';

export interface KinesisStreamRecordKind {
  kind: 'KinesisRecord';
  event: KinesisStreamRecord;
}
