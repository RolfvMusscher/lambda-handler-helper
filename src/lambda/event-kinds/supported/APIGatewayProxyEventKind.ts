import { APIGatewayProxyEvent } from "aws-lambda";

export interface APIGatewayProxyEventKind {
  kind: "APIGateway";
  event: APIGatewayProxyEvent;
}
