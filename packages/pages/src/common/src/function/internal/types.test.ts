import { convertFunctionModuleToFunctionModuleInternal } from "./types.js";
import { ServerlessFunction, FunctionModule } from "../types.js";

const exampleFunction: ServerlessFunction = () => {
  return { body: "Hello World", headers: {}, statusCode: 200 };
};

// JSON.stringify does not include functions in the output string
// This function adds the function's name in place of the function
const stringifyIncludeFunctionNames = (key: string, value: any) => {
  if (typeof value === "function") {
    return value.name;
  } else {
    return value;
  }
};

describe("internal/types - convertFunctionModuleToFunctionModuleInternal", () => {
  it("converts a function in /function/http using the default getPath and config", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        "src/functions/http/api/example.ts",
        functionModule,
        false
      );
    const expected = {
      default: "exampleFunction",
      config: {
        name: "api/example",
        functionName: "exampleFunction",
        event: "API",
      },
      path: "src/functions/http/api/example.ts",
      filename: "example.ts",
      slug: "api/example",
      getPath: "getPath",
    };
    expect(
      JSON.stringify(functionModuleInternal, stringifyIncludeFunctionNames)
    ).toEqual(JSON.stringify(expected));
  });

  it("throws an error when a function outside /functions/http is missing a config", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      getPath: () => "path",
    };
    expect(() =>
      convertFunctionModuleToFunctionModuleInternal(
        "src/functions/example.ts",
        functionModule,
        false
      )
    ).toThrow(
      "src/functions/example.ts is missing an exported config function."
    );
  });

  it("throws an error when a function outside /functions/http is missing a getPath", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      config: {
        name: "Test Name",
      },
    };
    expect(() =>
      convertFunctionModuleToFunctionModuleInternal(
        "src/functions/example.ts",
        functionModule,
        false
      )
    ).toThrow(
      "src/functions/example.ts is missing an exported getPath function."
    );
  });

  it("converts a function outside /function/http", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      config: {
        name: "Test Function",
      },
      getPath: () => "myFunction",
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        "src/functions/example.ts",
        functionModule,
        false
      );
    const expected = {
      default: "exampleFunction",
      config: {
        name: "Test Function",
        functionName: "exampleFunction",
        event: "API",
      },
      getPath: "getPath",
      path: "src/functions/example.ts",
      filename: "example.ts",
      slug: "myFunction",
    };
    expect(
      JSON.stringify(functionModuleInternal, stringifyIncludeFunctionNames)
    ).toEqual(JSON.stringify(expected));
  });

  it("converts a function in /function/http, overriding the default name and slug", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
      config: {
        name: "Test Function",
      },
      getPath: () => "myFunction",
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        "src/functions/http/api/example.ts",
        functionModule,
        false
      );
    const expected = {
      default: "exampleFunction",
      config: {
        name: "Test Function",
        functionName: "exampleFunction",
        event: "API",
      },
      getPath: "getPath",
      path: "src/functions/http/api/example.ts",
      filename: "example.ts",
      slug: "myFunction",
    };
    expect(
      JSON.stringify(functionModuleInternal, stringifyIncludeFunctionNames)
    ).toEqual(JSON.stringify(expected));
  });
});
