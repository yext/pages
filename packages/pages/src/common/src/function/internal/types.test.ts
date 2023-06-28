import {
  convertFunctionModuleToFunctionModuleInternal,
  FunctionFilePath,
} from "./types.js";
import {
  ServerlessFunction,
  FunctionModule,
  FunctionArgument,
} from "../types.js";
import { mockSiteInfo } from "../../../../dev/server/middleware/serverlessFunctions.js";

const exampleReturnValue = {
  body: "Hello World",
  headers: {},
  statusCode: 200,
};

const exampleFunction: ServerlessFunction = () => {
  return exampleReturnValue;
};

const exampleFunctionArgument: FunctionArgument = {
  queryParams: {},
  pathParams: {},
  site: mockSiteInfo,
};

const createMockFilePath = (path: string): FunctionFilePath => {
  return {
    absolute: process.cwd() + "/src/functions/" + path,
    relative: "/" + path.split(".")[0],
    extension: "ts",
  };
};

describe("internal/types - convertFunctionModuleToFunctionModuleInternal", () => {
  it("converts a function in function/http using the default getPath and config", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("http/api/example.ts"),
        functionModule
      );
    const expected = {
      config: {
        name: "api/example",
        functionName: "default",
        event: "API",
      },
      filePath: {
        absolute: process.cwd() + "/src/functions/http/api/example.ts",
        relative: "/http/api/example",
        extension: "ts",
      },
      slug: "api/example",
    };
    expect(JSON.stringify(functionModuleInternal)).toEqual(
      JSON.stringify(expected)
    );

    const functionReturnValue = functionModuleInternal.default
      ? functionModuleInternal.default(exampleFunctionArgument)
      : undefined;
    const functionGetPath = functionModuleInternal.getPath
      ? functionModuleInternal.getPath()
      : undefined;

    expect(JSON.stringify(functionReturnValue)).toEqual(
      JSON.stringify(exampleReturnValue)
    );
    expect(functionGetPath).toEqual("api/example");
  });

  it("throws an error when a function outside functions/http is missing a config", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      getPath: () => "path",
    };
    expect(() =>
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("example.ts"),
        functionModule
      )
    ).toThrow(
      "src/functions/example.ts is missing an exported config function."
    );
  });

  it("throws an error when a function outside functions/http is missing a getPath", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      config: {
        name: "Test Name",
      },
    };
    expect(() =>
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("example.ts"),
        functionModule
      )
    ).toThrow(
      "src/functions/example.ts is missing an exported getPath function."
    );
  });

  it("converts a function outside function/http", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      config: {
        name: "Test Function",
      },
      getPath: () => "myFunction",
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("example.ts"),
        functionModule
      );
    const expected = {
      config: {
        name: "Test Function",
        functionName: "default",
        event: "API",
      },
      filePath: {
        absolute: process.cwd() + "/src/functions/example.ts",
        relative: "/example",
        extension: "ts",
      },
      slug: "myFunction",
    };

    expect(JSON.stringify(functionModuleInternal)).toEqual(
      JSON.stringify(expected)
    );

    const functionReturnValue = functionModuleInternal.default
      ? functionModuleInternal.default(exampleFunctionArgument)
      : undefined;
    const functionGetPath = functionModuleInternal.getPath
      ? functionModuleInternal.getPath()
      : undefined;
    expect(JSON.stringify(functionReturnValue)).toEqual(
      JSON.stringify(exampleReturnValue)
    );
    expect(functionGetPath).toEqual("myFunction");
  });

  it("converts a function in function/http, overriding the default name and slug", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      config: {
        name: "Test Function",
      },
      getPath: () => "myFunction",
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("http/api/example.ts"),
        functionModule
      );
    const expected = {
      config: {
        name: "Test Function",
        functionName: "default",
        event: "API",
      },
      filePath: {
        absolute: process.cwd() + "/src/functions/http/api/example.ts",
        relative: "/http/api/example",
        extension: "ts",
      },
      slug: "myFunction",
    };

    expect(JSON.stringify(functionModuleInternal)).toEqual(
      JSON.stringify(expected)
    );

    const functionReturnValue = functionModuleInternal.default
      ? functionModuleInternal.default(exampleFunctionArgument)
      : undefined;
    const functionGetPath = functionModuleInternal.getPath
      ? functionModuleInternal.getPath()
      : undefined;
    expect(JSON.stringify(functionReturnValue)).toEqual(
      JSON.stringify(exampleReturnValue)
    );
    expect(functionGetPath).toEqual("myFunction");
  });
});
