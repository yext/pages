import {
  convertFunctionModuleToFunctionModuleInternal,
  FunctionFilePath,
} from "./types.js";
import {
  HttpFunction,
  FunctionModule,
  FunctionArgument,
  OnPageGenerateFunction,
  OnPageGenerateResponse,
  OnUrlChangeFunction,
  HttpFunctionResponse,
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

const exampleOnPageGenerateFunction: OnPageGenerateFunction = () => {
  return exampleOnPageGenerateResponse;
};

const exampleOnUrlChangeFunction: OnUrlChangeFunction = () => {
  return;
};

const exampleFunctionArgument: FunctionArgument = {
  queryParams: {},
  pathParams: {},
  site: mockSiteInfo,
};

const exampleOnPageGenerateResponse: OnPageGenerateResponse = {
  path: "abc",
  content: "xyz",
  redirects: ["home"],
};

const createMockFilePath = (path: string): FunctionFilePath => {
  return {
    absolute: process.cwd() + "/src/functions/" + path,
    relative: path.split(".")[0],
    extension: "ts",
    filename: path.split("/").slice(-1)[0].split(".")[0],
  };
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
        name: "example-47566",
        functionName: "default",
        event: "API",
      },
      filePath: {
        absolute: process.cwd() + "/src/functions/http/api/example.ts",
        relative: "http/api/example",
        extension: "ts",
        filename: "example",
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
      ? functionModuleInternal.default(exampleFunctionArgument)
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
        name: "example-29339",
        functionName: "default",
        event: "ON_URL_CHANGE",
      },
      filePath: {
        absolute: process.cwd() + "/src/functions/onUrlChange/example.ts",
        relative: "onUrlChange/example",
        extension: "ts",
        filename: "example",
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
      ? functionModuleInternal.default(exampleFunctionArgument)
      : undefined;

    expect(JSON.stringify(functionReturnValue)).toBeFalsy();
  });

  it("converts a function in functions/onPageGenerate", async () => {
    const functionModule: FunctionModule = {
      default: exampleOnPageGenerateFunction,
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("onPageGenerate/example.ts"),
        functionModule
      );
    const expected = {
      config: {
        name: "example-68642",
        functionName: "default",
        event: "ON_PAGE_GENERATE",
      },
      filePath: {
        absolute: process.cwd() + "/src/functions/onPageGenerate/example.ts",
        relative: "onPageGenerate/example",
        extension: "ts",
        filename: "example",
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
      ? functionModuleInternal.default(exampleFunctionArgument)
      : undefined;
    expect(JSON.stringify(functionReturnValue)).toEqual(
      JSON.stringify(exampleOnPageGenerateResponse)
    );
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
        name: "[testParam]-54884",
        functionName: "default",
        event: "API",
      },
      filePath: {
        absolute:
          process.cwd() + "/src/functions/http/api/example/[testParam].ts",
        relative: "http/api/example/[testParam]",
        extension: "ts",
        filename: "[testParam]",
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
      ? functionModuleInternal.default(exampleFunctionArgument)
      : undefined;

    expect(JSON.stringify(functionReturnValue)).toEqual(
      JSON.stringify(exampleReturnValue)
    );
  });

  it(
    "throws an error when a function is outside functions/http, functions/onPageGenerate, or" +
      " functions/onUrlChange",
    async () => {
      const functionModule: FunctionModule = {
        default: exampleApiFunction,
      };
      expect(() =>
        convertFunctionModuleToFunctionModuleInternal(
          createMockFilePath("myFunctions/example.ts"),
          functionModule
        )
      ).toThrow(
        "Cannot load myFunctions/example.\n" +
          "All Serverless Functions should live in src/functions/http," +
          " src/functions/onPageGenerate, or src/functions/onUrlChange."
      );
    }
  );
});
