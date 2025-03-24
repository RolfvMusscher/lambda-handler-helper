import { Container, Newable } from 'inversify';
import { ILogger } from '../loggers';
import { CONTAINERTYPES } from './container-types';
import { DefaultLogger } from '../loggers/default.logger';
import { IEventHandler } from '../lambda/event-handler.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class LambdaHandlerHelperContainer<EventHandler extends IEventHandler<any,any>> extends Container {
	constructor(handler : Newable<EventHandler>) {
		super();

		this.bind<ILogger>(CONTAINERTYPES.ILogger).to(DefaultLogger);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.bind<IEventHandler<any, any>>(CONTAINERTYPES.IEventHandler).to(handler);
	}
}
