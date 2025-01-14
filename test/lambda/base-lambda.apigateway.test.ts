import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { LambdaHandlerHelperContainer, LambdaHandlerHelper } from "../../src";
import { TestEvent, TestEventHandler } from "./lambda-handler-helper.test";

const myBodyEvent = {
	message: 'testEventBridge',
};


const apiGatewayProxyEvent: APIGatewayProxyEvent = {
    httpMethod: 'GET',
    headers: [],
    path: 'myPath',
    body: JSON.stringify(myBodyEvent),
    requestContext: {
        requestId: 'requestId123'
    }
  } as unknown as APIGatewayProxyEvent;

const badApiGatewayProxyEvent: APIGatewayProxyEvent = {
    ...apiGatewayProxyEvent,
    body: JSON.stringify({ badBody: 'message is missing'})
}

const invalidJsonRequest: APIGatewayProxyEvent = {
    ...apiGatewayProxyEvent,
    body: 'this is no json'
}


  describe('BaseLambda TestEventHandler for ApiGateway requests', () => {
    let container: LambdaHandlerHelperContainer<TestEventHandler>;
    let baseLambda: LambdaHandlerHelper<TestEvent>;
  
    beforeEach(() => {
        container = new LambdaHandlerHelperContainer<TestEventHandler>(
            TestEventHandler
        );
        baseLambda = new LambdaHandlerHelper(container);
    });
  
    afterEach(() => {
        jest.clearAllMocks();
    });
  
    it('should call the handler on a gateway event', async () => {
        await baseLambda.handler(apiGatewayProxyEvent, {} as unknown as Context);
  
        expect(TestEventHandler.mockedHandler).toHaveBeenCalledWith(
            myBodyEvent,
            [
                { type: 'APIGateway', event : apiGatewayProxyEvent }
            ],
            {},
            'requestId123'
        );
  
        expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(1);
    });

    it('should return a 400 when an incorrect json was send', async () => {
        const response = await baseLambda.handler(badApiGatewayProxyEvent, {} as unknown as Context) as APIGatewayProxyResult;
  
        expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toStrictEqual({ message: 'There were 2 error(s) on field(s): [\"badBody\",\"message\"]'});
    });

    it('should return a 400 when an invalid json was send', async () => {
        const response = await baseLambda.handler(invalidJsonRequest, {} as unknown as Context) as APIGatewayProxyResult;
  
        expect(TestEventHandler.mockedHandler).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toStrictEqual({ message: 'There were 1 error(s) on field(s): [\"message\"]'});
    });

    it('should return a 500 when the handler throws an error', async () => {
        TestEventHandler.mockedHandler.mockImplementation(() => {
            throw new Error('Test Error');
        });

        const response = await baseLambda.handler(apiGatewayProxyEvent, {} as unknown as Context) as APIGatewayProxyResult;
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toStrictEqual({ message: 'Internal Server Error'});
    });
  });