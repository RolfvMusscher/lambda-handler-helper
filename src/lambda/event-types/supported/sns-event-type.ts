import { SNSEvent } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface SNSEventType extends IEventType {
  type: 'SNS';
  event: SNSEvent;
}
