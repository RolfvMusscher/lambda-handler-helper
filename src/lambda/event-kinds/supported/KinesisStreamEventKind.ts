import { KinesisStreamEvent } from "aws-lambda";

export interface KinesisStreamEventKind {
  kind: "Kinesis";
  event: KinesisStreamEvent;
}
