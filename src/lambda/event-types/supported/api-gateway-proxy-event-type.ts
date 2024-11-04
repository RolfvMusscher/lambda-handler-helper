import { APIGatewayProxyEvent } from 'aws-lambda';
import { IEventType } from './event-type.interface';

export interface APIGatewayProxyEventType extends IEventType {
  type: 'APIGateway';
  event: APIGatewayProxyEvent;
}
