import { AWSEventKind } from "./event-kinds/supported/AWSEventKind";

export type FailedMessages<T> = Array<{
  kind: { event: T; context: AWSEventKind[] };
  error: Error;
}>;
