import { S3Event } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface S3EventType extends IEventType {
  type: 'S3';
  event: S3Event;
}
