import {
  FunctionConfig,
  FunctionArgument,
  FunctionReturnValue,
} from "../../src";

export default function helloWorld(_: FunctionArgument): FunctionReturnValue {
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
  return "hello";
};
