import { EventBridgeEvent } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface EventBridgeEventType extends IEventType {
  type: 'EventBridge';
  event: EventBridgeEvent<string, unknown>;
}
