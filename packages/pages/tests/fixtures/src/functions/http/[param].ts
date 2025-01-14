import { PagesHttpRequest, PagesHttpResponse } from "../../../../../src";

export default function helloWorld(_: PagesHttpRequest): PagesHttpResponse {
  return {
    body: "Hello World",
    headers: {},
    statusCode: 200,
  };
}
