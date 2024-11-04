import { AWSEventTypes } from './event-types/supported/aws-event-types';

export interface EventWithContext<T> {
  event: T;
  context: AWSEventTypes[];
}
