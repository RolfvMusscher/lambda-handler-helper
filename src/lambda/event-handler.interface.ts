import { Context } from 'aws-lambda';
import { AWSEventKind } from './event-types/supported';
import { ClassConstructor } from 'class-transformer';

export interface IEventHandler<InputMessage, OutputMessage = void> {
  inputValidationClass?: ClassConstructor<InputMessage>

  handleMessage(
    message: InputMessage,
    envelopes: AWSEventKind[],
    lambdaContext: Context,
    eventId?: string,
  ): Promise<OutputMessage>;
}
