import { AWSEventTypes } from './event-types/supported/aws-event-types';

export type FailedMessages<T> = Array<{
  kind: { event: T; context: AWSEventTypes[] };
  error: Error;
}>;
