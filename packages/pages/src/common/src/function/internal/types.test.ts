import path from "path";
import { convertFunctionModuleToFunctionModuleInternal } from "./types.js";
import {
  HttpFunction,
  FunctionModule,
  SitesHttpRequest,
  OnUrlChangeFunction,
  SitesHttpResponse,
  SitesOnUrlChangeRequest,
} from "../types.js";
import { mockSiteInfo } from "../../../../dev/server/middleware/serveHttpFunction.js";
import { ProjectStructure } from "../../project/structure.js";
import { convertToOSPath } from "../../template/paths.js";

const exampleReturnValue: SitesHttpResponse = {
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

const exampleHttpFunctionArgument: SitesHttpRequest = {
  queryParams: {},
  pathParams: {},
  site: mockSiteInfo,
  method: "",
  headers: {},
  body: "",
};

const exampleOnUrlChangeArgument: SitesOnUrlChangeRequest = {
  domainMap: {
    production: "example.com",
    staging: "alpha-beta-charlie-pgsdemo.com-preview.pagescdn.com",
    deployPreview: "h2if81-pgsdemo.com-preview.pagescdn.com",
    displayUrlPrefix: "prefix",
  },
  entityId: "entity12",
  feature: "feature",
  locale: "en",
  path: "slug",
  site: mockSiteInfo,
  url: "/slug",
  previousUrl: "/slug-old",
};

const createMockFilePath = (filepath: string): path.ParsedPath => {
  return path.parse(
    path.resolve(convertToOSPath(path.join("src/functions/", filepath)))
  );
};

describe("internal/types - convertFunctionModuleToFunctionModuleInternal", () => {
  const projectStructure = new ProjectStructure();

  it("converts a function in functions/http", async () => {
    const functionModule: FunctionModule = {
      default: exampleApiFunction,
    };
    const functionModuleInternal =
      convertFunctionModuleToFunctionModuleInternal(
        createMockFilePath("http/api/example.ts"),
        functionModule,
        projectStructure
      );
    const expected = {
      config: {
        name: "example-23673",
        functionName: "default",
        event: "API",
      },
      filePath: {
        root: path.resolve("/"),
        dir: convertToOSPath(process.cwd() + "/src/functions/http/api"),
        base: "example.ts",
        ext: ".ts",
        name: "example",
      },
      slug: {
        original: convertToOSPath("api/example"),
        dev: convertToOSPath("api/example"),
        production: convertToOSPath("api/example"),
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
        functionModule,
        projectStructure
      );
    const expected = {
      config: {
        name: "example-11807",
        functionName: "default",
        event: "ON_URL_CHANGE",
      },
      filePath: {
        root: path.resolve("/"),
        dir: convertToOSPath(process.cwd() + "/src/functions/onUrlChange"),
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
        functionModule,
        projectStructure
      );
    const expected = {
      config: {
        name: "testParam-61704",
        functionName: "default",
        event: "API",
      },
      filePath: {
        root: path.resolve("/"),
        dir: convertToOSPath(process.cwd() + "/src/functions/http/api/example"),
        base: "[testParam].ts",
        ext: ".ts",
        name: "[testParam]",
      },
      slug: {
        original: convertToOSPath("api/example/[testParam]"),
        dev: convertToOSPath("api/example/:testParam"),
        production: convertToOSPath("api/example/{{testParam}}"),
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
        functionModule,
        projectStructure
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
