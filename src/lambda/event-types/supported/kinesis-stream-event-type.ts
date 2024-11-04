import { KinesisStreamEvent } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface KinesisStreamEventType extends IEventType {
  type: 'Kinesis';
  event: KinesisStreamEvent;
}
