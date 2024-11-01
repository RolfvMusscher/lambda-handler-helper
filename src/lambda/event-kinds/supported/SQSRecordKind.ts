import { SQSRecord } from "aws-lambda";

export interface SQSRecordKind {
  kind: "SQSRecord";
  event: SQSRecord;
}
