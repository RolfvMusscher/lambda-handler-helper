# AWS Lambda Handler Helper

This repository contains utilities and helpers for AWS Lambda functions, with a focus on the `LambdaHandlerHelper` class. The `LambdaHandlerHelper` class is designed to simplify the handling of various AWS event types in a consistent and reusable manner.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Cold Start](#cold-start)
  - [Warm Start](#warm-lambda)

### Installation

To install the dependencies, run:

```sh
npm install lambda-handler-helper
```

### Usage
The LambdaHandlerHelper class is designed to handle various AWS event types such as SQS, SNS, EventBridge, API Gateway, S3, DynamoDB, and Kinesis. It provides a consistent interface for processing these events and handling errors.

#### Cold Start
For a cold start, you need to set up the IoC container and the Lambda handler:

```
import 'reflect-metadata';	
import { LambdaHandlerHelper, LambdaHandlerHelperContainer } from 'lambda-handler-helper';
import { DemoMessageEventHandler } from './demo-message-handler';

const iocContainer = new LambdaHandlerHelperContainer<DemoMessageEventHandler>(DemoMessageEventHandler);
const lambda = new LambdaHandlerHelper(iocContainer);

export const handler = lambda.handler.bind(lambda);
```

#### Warm Lambda
For the warm lambda, define your event handler and implement the handleMessage method:
```
import { inject, injectable } from 'inversify';
import { CONTAINERTYPES, IEventHandler, ILogger, LogLevel } from 'lambda-handler-helper';
import { AWSEventKind } from 'lambda-handler-helper';
import { Context } from 'aws-lambda';

export class DemoMessage {
    amount: number;
    substract: number;
}

@injectable()
export class DemoMessageEventHandler implements IEventHandler<DemoMessage, number> {
    constructor(
        @inject(CONTAINERTYPES.ILogger) readonly logger: ILogger,
    ) {}

    async handleMessage(message: DemoMessage, envelopes: AWSEventKind[], lambdaContext: Context, eventId?: string): Promise<number> {
        const result = message.amount - message.substract;
        this.logger.log(LogLevel.WARN, `Result: ${result}`);
        return result;
    }
}
```
