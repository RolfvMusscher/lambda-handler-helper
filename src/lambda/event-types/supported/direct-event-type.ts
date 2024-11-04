import { IEventType } from './event-type.interface';

export interface DirectEventType<T> extends IEventType {
  type: 'Direct';
  event: T;
}
