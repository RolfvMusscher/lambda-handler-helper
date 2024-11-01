import { SQSEvent } from 'aws-lambda';

export interface SQSEventKind {
  kind: 'SQS';
  event: SQSEvent;
}

