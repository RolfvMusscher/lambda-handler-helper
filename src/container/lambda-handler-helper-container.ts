import { Container, interfaces } from "inversify";
import { ILogger } from "../loggers";
import { CONTAINERTYPES } from "./container-types";
import { DefaultLogger } from "../loggers/default.logger";
import { IEventHandler } from "../lambda/event-handler.interface";

export class LambdaHandlerHelperContainer<EventHandler extends IEventHandler<any,any>> extends Container {
    constructor(handler : interfaces.Newable<EventHandler>) {
        super();

        this.bind<ILogger>(CONTAINERTYPES.ILogger).to(DefaultLogger);
        this.bind<IEventHandler<any, any>>(CONTAINERTYPES.IEventHandler).to(handler);
    }
}
