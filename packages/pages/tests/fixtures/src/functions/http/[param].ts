import { PagesHttpResponse } from "../../../../../src";

export default function helloWorld(): PagesHttpResponse {
  return {
    body: "Hello World",
    headers: {},
    statusCode: 200,
  };
}
