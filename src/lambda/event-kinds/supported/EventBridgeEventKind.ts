import { EventBridgeEvent } from "aws-lambda";

export interface EventBridgeEventKind {
  kind: "EventBridge";
  event: EventBridgeEvent<string, unknown>;
}
