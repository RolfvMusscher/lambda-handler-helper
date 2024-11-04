import { SQSEvent } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface SQSEventType extends IEventType {
  type: 'SQS';
  event: SQSEvent;
}

