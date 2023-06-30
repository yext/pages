import { FunctionArgument, HttpFunctionResponse } from "../../../../../src";

export default function helloWorld(_: FunctionArgument): HttpFunctionResponse {
  return {
    body: "Hello World",
    headers: {},
    statusCode: 200,
  };
}
