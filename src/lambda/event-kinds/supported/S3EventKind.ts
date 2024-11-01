import { S3Event } from "aws-lambda";

export interface S3EventKind {
  kind: "S3";
  event: S3Event;
}
