import { Context } from "aws-lambda";
import { AWSEventKind } from "./event-kinds/supported";

export interface IEventHandler<InputMessage, OutputMessage = void> {
  handleMessage(
    message: InputMessage,
    envelopes: AWSEventKind[],
    lambdaContext: Context,
    eventId?: string,
  ): Promise<OutputMessage>;
}
