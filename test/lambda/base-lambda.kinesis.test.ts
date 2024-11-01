import "reflect-metadata";

import { Context, KinesisStreamEvent, KinesisStreamRecord, KinesisStreamRecordPayload } from "aws-lambda";
import { LambdaHandlerHelperContainer } from "../../src/container/lambda-handler-helper-container";
import { LambdaHandlerHelper } from "../../src/lambda/lambda-handler-helper";
import { TestEvent, TestEventHandler } from "./lambda-handler-helper.test";

const testEvent1 = {
  message: "testKinesis1",
};

const testEvent2 = {
  message: "testKinesis2",
};


const event: KinesisStreamEvent = {
  Records: [
    {
      eventID: '1',
      eventName: 'TestEvent',
      eventSource: 'aws:kinesis',
      kinesis: {
        data: Buffer.from(JSON.stringify(testEvent1)).toString('base64')
      } as unknown as KinesisStreamRecordPayload
    } as unknown as KinesisStreamRecord,
    {
      eventID: '2',
      eventName: 'TestEvent',
      eventSource: 'aws:kinesis',
      kinesis: {
        data: Buffer.from(JSON.stringify(testEvent2)).toString('base64')
      } as unknown as KinesisStreamRecordPayload
    } as unknown as KinesisStreamRecord
  ]
};

describe("BaseLambda TestEventHandler for Kinesis Records", () => {
  let container: LambdaHandlerHelperContainer<TestEventHandler>;
  let baseLambda: LambdaHandlerHelper<TestEvent>;

  beforeEach(() => {
    container = new LambdaHandlerHelperContainer<TestEventHandler>(TestEventHandler);
    baseLambda = new LambdaHandlerHelper(container);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call the handler multiple times, handling batches", async () => {
    await baseLambda.handler(event, {} as unknown as Context);

    expect(TestEventHandler.mockedHandler).toHaveBeenCalledWith(
      testEvent1,
      [
        { kind: "Kinesis", event },
        { kind: "KinesisRecord", event: event.Records[0] },
        { kind: "Direct", event: testEvent1 },
      ],
      {},
      "1",
    );

    expect(TestEventHandler.mockedHandler).toHaveBeenCalledWith(
      testEvent2,
      [
        { kind: "Kinesis", event },
        { kind: "KinesisRecord", event: event.Records[1] },
        { kind: "Direct", event: testEvent2 },
      ],
      {},
      "2",
    );

    expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(2);
  });
});
