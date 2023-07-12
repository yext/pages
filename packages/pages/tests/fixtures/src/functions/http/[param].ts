import { HttpFunctionArgument, HttpFunctionResponse } from "../../../../../src";

export default function helloWorld(
  _: HttpFunctionArgument
): HttpFunctionResponse {
  return {
    body: "Hello World",
    headers: {},
    statusCode: 200,
  };
}
