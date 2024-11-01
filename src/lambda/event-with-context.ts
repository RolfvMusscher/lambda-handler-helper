import { AWSEventKind } from './event-kinds/supported/AWSEventKind';

export interface EventWithContext<T> {
  event: T;
  context: AWSEventKind[];
}
