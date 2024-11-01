import { DynamoDBRecord } from "aws-lambda";

export interface DynamoDBStreamRecordKind {
  kind: "DynamoDBRecord";
  event: DynamoDBRecord;
}
