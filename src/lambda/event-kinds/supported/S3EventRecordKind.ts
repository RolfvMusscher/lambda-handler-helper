import { S3EventRecord } from 'aws-lambda';

export interface S3EventRecordKind {
  kind: 'S3Record';
  event: S3EventRecord;
}
