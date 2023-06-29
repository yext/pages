import {
  FunctionConfig,
  FunctionArgument,
  HttpFunctionReturnValue,
} from "../../src";

export default function helloWorld(
  _: FunctionArgument
): HttpFunctionReturnValue {
  return {
    body: "Hello World",
    headers: {},
    statusCode: 200,
  };
}

export const config: FunctionConfig = {
  name: "Hello World Testing Function",
};

export const getPath = () => {
  return "hello/[param]";
};
