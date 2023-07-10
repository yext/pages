import path from "path";
import { convertFunctionModuleToFunctionModuleInternal } from "./types.js";
import {
  HttpFunction,
  FunctionModule,
  HttpFunctionArgument,
  OnUrlChangeFunction,
  HttpFunctionResponse,
  OnUrlChangeArgument,
} from "../types.js";
import { mockSiteInfo } from "../../../../dev/server/middleware/serveHttpFunction.js";

const exampleReturnValue: HttpFunctionResponse = {
  body: "Hello World",
  headers: {},
  statusCode: 200,
};

const exampleApiFunction: HttpFunction = () => {
  return exampleReturnValue;
};

const exampleOnUrlChangeFunction: OnUrlChangeFunction = () => {
  return;
};

const exampleHttpFunctionArgument: HttpFunctionArgument = {
  queryParams: {},
  pathParams: {},
  site: mockSiteInfo,
};

const exampleOnUrlChangeArgument: OnUrlChangeArgument = {
  domains: ["exampledomain.com"],
  entityId: "entity12",
  feature: "feature",
  locale: "en",
  path: "slug",
  site: mockSiteInfo,
  url: "/slug",
};

const createMockFilePath = (filepath: string): path.ParsedPath => {
  return path.parse(path.resolve(path.join("src/functions/", filepath)));
};

describe("internal/types - convertFunctionModuleToFunctionModuleInternal", () => {
  it("converts a function in functions/http", async () => {
    const functionModule: FunctionModule = {
      default: exampleApiFunction,
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("http/api/example.ts"),
        functionModule
      );
    const expected = {
      config: {
        name: "example-01535",
        functionName: "default",
        event: "API",
      },
      filePath: {
        root: "/",
        dir: process.cwd() + "/src/functions/http/api",
        base: "example.ts",
        ext: ".ts",
        name: "example",
      },
      slug: {
        original: "api/example",
        dev: "api/example",
        production: "api/example",
      },
    };
    expect(JSON.stringify(functionModuleInternal)).toEqual(
      JSON.stringify(expected)
    );

    const functionReturnValue = functionModuleInternal.default
      ? (functionModuleInternal.default as HttpFunction)(
          exampleHttpFunctionArgument
        )
      : undefined;

    expect(JSON.stringify(functionReturnValue)).toEqual(
      JSON.stringify(exampleReturnValue)
    );
  });

  it("converts a function in functions/onUrlChange", async () => {
    const functionModule: FunctionModule = {
      default: exampleOnUrlChangeFunction,
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("onUrlChange/example.ts"),
        functionModule
      );
    const expected = {
      config: {
        name: "example-55662",
        functionName: "default",
        event: "ON_URL_CHANGE",
      },
      filePath: {
        root: "/",
        dir: process.cwd() + "/src/functions/onUrlChange",
        base: "example.ts",
        ext: ".ts",
        name: "example",
      },
      slug: {
        original: "example",
        dev: "example",
        production: "example",
      },
    };
    expect(JSON.stringify(functionModuleInternal)).toEqual(
      JSON.stringify(expected)
    );

    const functionReturnValue = functionModuleInternal.default
      ? (functionModuleInternal.default as OnUrlChangeFunction)(
          exampleOnUrlChangeArgument
        )
      : undefined;

    expect(JSON.stringify(functionReturnValue)).toBeFalsy();
  });

  it("converts an api function with path params", async () => {
    const functionModule: FunctionModule = {
      default: exampleApiFunction,
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("http/api/example/[testParam].ts"),
        functionModule
      );
    const expected = {
      config: {
        name: "testParam-00975",
        functionName: "default",
        event: "API",
      },
      filePath: {
        root: "/",
        dir: process.cwd() + "/src/functions/http/api/example",
        base: "[testParam].ts",
        ext: ".ts",
        name: "[testParam]",
      },
      slug: {
        original: "api/example/[testParam]",
        dev: "api/example/:testParam",
        production: "api/example/{{testParam}}",
      },
    };
    expect(JSON.stringify(functionModuleInternal)).toEqual(
      JSON.stringify(expected)
    );

    const functionReturnValue = functionModuleInternal.default
      ? (functionModuleInternal.default as HttpFunction)(
          exampleHttpFunctionArgument
        )
      : undefined;

    expect(JSON.stringify(functionReturnValue)).toEqual(
      JSON.stringify(exampleReturnValue)
    );
  });

  it("throws an error when a function is outside functions/http or functions/onUrlChange", async () => {
    const functionModule: FunctionModule = {
      default: exampleApiFunction,
    };
    expect(() =>
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("myFunctions/example.ts"),
        functionModule
      )
    ).toThrow(
      "Cannot load " +
        path.join(process.cwd(), "src/functions/myFunctions/example.ts") +
        ".\n" +
        "All Serverless Functions should live in src/functions/http" +
        " or src/functions/onUrlChange."
    );
  });
});
