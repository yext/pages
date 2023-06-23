import {
  ServerlessFunction,
  FunctionModule,
  FunctionConfig,
} from "../types.js";
import {
  validateConfig,
  validateFunctionDefaultExport,
  validateFunctionModule,
} from "./validateFunctionModule.js";

const exampleFunction: ServerlessFunction = () => {
  return { body: "Hello World", headers: {}, statusCode: 200 };
};
describe("validateFunctionModule - validateFunctionDefaultExport", () => {
  it("throws an error when there is no default export", async () => {
    const functionModule: FunctionModule = {};
    expect(async () =>
      validateFunctionDefaultExport(
        "src/functions/http/api/example.ts",
        functionModule
      )
    ).rejects.toThrow(
      "src/functions/http/api/example.ts is missing a default export."
    );
  });

  it("returns successfully when there is a default export", async () => {
    const functionModule: FunctionModule = {
      default: exampleFunction,
    };
    expect(() =>
      validateFunctionDefaultExport(
        "src/functions/http/api/example.ts",
        functionModule
      )
    ).not.toThrow();
  });
});

describe("validateFunctionModule - validateConfig", () => {
  it("throws an error when there is no name", async () => {
    const functionConfig: FunctionConfig = {};
    expect(async () =>
      validateConfig("src/functions/http/api/example.ts", functionConfig)
    ).rejects.toThrow();
  });

  it("returns successfully when there is a name", async () => {
    const functionConfig: FunctionConfig = {
      name: "Function Name",
    };
    expect(() =>
      validateConfig("src/functions/http/api/example.ts", functionConfig)
    ).not.toThrow();
  });
});

describe("validateFunctionModule - validateFunctionModule", () => {
  it("throws an error when there is no getPath", async () => {
    const functionModule: FunctionModule = {
      config: { name: "my function" },
      default: exampleFunction,
    };
    expect(async () =>
      validateFunctionModule(
        "src/functions/http/api/example.ts",
        functionModule
      )
    ).rejects.toThrow();
  });

  it("throws an error when there is no config", async () => {
    const functionModule: FunctionModule = {
      getPath: () => "path",
      default: exampleFunction,
    };
    expect(async () =>
      validateFunctionModule(
        "src/functions/http/api/example.ts",
        functionModule
      )
    ).rejects.toThrow();
  });

  it("returns successfully when there is a getPath, config, and default export", async () => {
    const functionModule: FunctionModule = {
      getPath: () => "path",
      default: exampleFunction,
      config: { name: "my function" },
    };
    expect(() =>
      validateFunctionModule(
        "src/functions/http/api/example.ts",
        functionModule
      )
    ).not.toThrow();
  });
});
