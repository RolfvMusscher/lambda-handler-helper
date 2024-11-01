import { SNSEvent } from 'aws-lambda';

export interface SNSEventKind {
  kind: 'SNS';
  event: SNSEvent;
}
