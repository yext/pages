import { describe, it, expect, vi, afterEach } from "vitest";
import {
  generateTestDataForPage,
  generateTestDataForSlug,
} from "./generateTestData.js";
import { EventEmitter } from "stream";
import {
  CLI_BOILERPLATE_WITH_UPGRADE_LINES,
  CLI_BOILERPLATE_WITHOUT_UPGRADE_LINES,
  UPGRADE_LINES_OF_CLI_BOILERPLATE,
  REAL_FULL_OUTPUT,
} from "../../../../tests/fixtures/cli_boilerplate.js";
import {
  CLI_STREAM_DATA,
  CLI_STREAM_DATA_MULTIPLE_DOCS,
} from "../../../../tests/fixtures/cli_stream_data.js";
import {
  FEATURE_CONFIG,
  FEATURE_CONFIG_ALTERNATE_LANGUAGE_FIELDS,
} from "../../../../tests/fixtures/feature_config.js";
import { Socket } from "net";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import { loadTemplateModuleCollectionUsingVite } from "../../../common/src/template/loader/loader.js";
import { getTemplatesConfig } from "../../../generate/templates/createTemplatesJson.js";
import type { FeaturesConfig } from "../../../common/src/feature/features.js";
import type { TemplateModuleCollection } from "../../../common/src/template/loader/loader.js";

const mockParentProcessStdout = vi.mocked(process.stdout) as any;
mockParentProcessStdout.write = vi.fn();

const mockChildProcessEventEmitter = new EventEmitter();

let mockChildProcess = {
  stdin: new Socket(),
  stdout: new Socket(),
  stderr: new Socket(),
  on: mockChildProcessEventEmitter.on,
  emit: mockChildProcessEventEmitter.emit,
};

vi.mock("../../../common/src/template/internal/getTemplateFilepaths.js", () => ({
  getTemplateFilepathsFromProjectStructure: vi.fn(),
}));

vi.mock("../../../common/src/template/loader/loader.js", () => ({
  loadTemplateModuleCollectionUsingVite: vi.fn(),
}));

vi.mock("../../../generate/templates/createTemplatesJson.js", () => ({
  getTemplatesConfig: vi.fn(),
}));

afterEach(() => {
  // After each unit test, destroy the streams associated with the previous
  // and create fresh ones.
  mockChildProcess.stdin.destroy();
  mockChildProcess.stdout.destroy();
  mockChildProcess.stderr.destroy();

  // Stale listeners from previous runs must be removed after each test.
  mockChildProcessEventEmitter.removeAllListeners();

  // Reset the mockParentProcessStdout's write function.
  mockParentProcessStdout.write = vi.fn();
  mockGetTemplateFilepathsFromProjectStructure.mockReset();
  mockLoadTemplateModuleCollectionUsingVite.mockReset();
  mockGetTemplatesConfig.mockReset();

  mockChildProcess = {
    stdin: new Socket(),
    stdout: new Socket(),
    stderr: new Socket(),
    // The on and emit functions must be explicitly re-assigned after the stale
    // listeners have been removed after each test.
    on: mockChildProcessEventEmitter.on,
    emit: mockChildProcessEventEmitter.emit,
  };
});

vi.mock("child_process", () => ({
  // this pattern allows us to only override the method we want to mock in the
  // child_process module while leaving the rest of the module's functionality intact.
  ...vi.importActual("child_process"),
  spawn: vi.fn((): any => {
    return mockChildProcess;
  }),
}));

const mockGetTemplateFilepathsFromProjectStructure = vi.mocked(
  getTemplateFilepathsFromProjectStructure
);
const mockLoadTemplateModuleCollectionUsingVite = vi.mocked(
  loadTemplateModuleCollectionUsingVite
);
const mockGetTemplatesConfig = vi.mocked(getTemplatesConfig);

describe("generateTestDataForPage", () => {
  const projectStructure = new ProjectStructure();

  const getGenerateTestDataForPageRunner = () =>
    generateTestDataForPage(
      mockParentProcessStdout,
      FEATURE_CONFIG,
      "loc3",
      "en",
      projectStructure
    );

  const getGenerateTestDataForPageWithAlternateLanguageFieldsRunner = () =>
    generateTestDataForPage(
      mockParentProcessStdout,
      FEATURE_CONFIG_ALTERNATE_LANGUAGE_FIELDS,
      "4092",
      "es-US",
      projectStructure
    );

  it("properly reads stream data from stdout and returns it as parsed JSON", async () => {
    const testRunnerPromise = getGenerateTestDataForPageRunner();

    mockChildProcess.stdout.emit("data", `${JSON.stringify(CLI_STREAM_DATA, null, "  ")}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA);
    // There is no output from the CLI other than the stream data, so nothing should be
    // written back to the parent process.
    expect(mockParentProcessStdout.write).toBeCalledTimes(0);
  });

  it("properly reads stream data with multiple documents from stdout and returns it as parsed JSON", async () => {
    const testRunnerPromise = getGenerateTestDataForPageWithAlternateLanguageFieldsRunner();

    mockChildProcess.stdout.emit(
      "data",
      `${JSON.stringify(CLI_STREAM_DATA_MULTIPLE_DOCS, null, "  ")}`
    );
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA_MULTIPLE_DOCS[1]);
    // There is no output from the CLI other than the stream data, so nothing should be
    // written back to the parent process.
    expect(mockParentProcessStdout.write).toBeCalledTimes(0);
  });

  it("properly reads multi-chunk stream data from stdout and returns it as parsed JSON", async () => {
    const testRunnerPromise = getGenerateTestDataForPageRunner();

    const streamDataAsString = `${JSON.stringify(CLI_STREAM_DATA, null, "  ")}`;
    mockChildProcess.stdout.emit(
      "data",
      `${streamDataAsString.slice(0, streamDataAsString.length / 2)}`
    );
    mockChildProcess.stdout.emit(
      "data",
      `${streamDataAsString.slice(streamDataAsString.length / 2)}`
    );
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA);
    // There is no output from the CLI other than the stream data, so nothing should be
    // written back to the parent process.
    expect(mockParentProcessStdout.write).toBeCalledTimes(0);
  });

  it("properly redirects other output to the parent process' stdout", async () => {
    const testRunnerPromise = getGenerateTestDataForPageRunner();

    const unrecognizedData = "I am unrecognized data";

    mockChildProcess.stdout.emit("data", `${CLI_BOILERPLATE_WITHOUT_UPGRADE_LINES}`);
    mockChildProcess.stdout.emit("data", `${unrecognizedData}`);
    mockChildProcess.stdout.emit("data", `${CLI_BOILERPLATE_WITHOUT_UPGRADE_LINES}`);
    mockChildProcess.stdout.emit("data", `${JSON.stringify(CLI_STREAM_DATA, null, "  ")}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA);
    // Make sure we write back the expected messages to the parent process.
    expect(mockParentProcessStdout.write).toHaveBeenCalledTimes(1);
    expect(mockParentProcessStdout.write).toHaveBeenCalledWith(unrecognizedData + "\n");
  });

  it("properly filters CLI Boilerplate and writes back the correct lines", async () => {
    const testRunnerPromise = getGenerateTestDataForPageRunner();

    const unrecognizedData = "I am unrecognized data";

    mockChildProcess.stdout.emit("data", `${CLI_BOILERPLATE_WITH_UPGRADE_LINES}`);
    mockChildProcess.stdout.emit("data", `${unrecognizedData}`);
    mockChildProcess.stdout.emit("data", `${JSON.stringify(CLI_STREAM_DATA, null, "  ")}`);
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(CLI_STREAM_DATA);
    // Make sure we write back the expected messages to the parent process.
    expect(mockParentProcessStdout.write).toHaveBeenCalledTimes(2);
    expect(mockParentProcessStdout.write).toHaveBeenCalledWith(UPGRADE_LINES_OF_CLI_BOILERPLATE);
    expect(mockParentProcessStdout.write).toHaveBeenCalledWith(unrecognizedData + "\n");
  });

  it("properly handles test data with arbitrary input when called in multiple chunks", async () => {
    const testRunnerPromise = getGenerateTestDataForPageRunner();

    REAL_FULL_OUTPUT.split("\n").forEach((chunk) => {
      mockChildProcess.stdout.emit("data", chunk);
    });
    mockChildProcess.emit("close");

    const datadoc = await testRunnerPromise;

    expect(datadoc).toEqual(
      JSON.parse(`{
        "__": {
          "entityPageSet": {
            "plugin": {}
          },
          "name": "index",
          "streamId": "my-stream-id-1",
          "templateType": "JS"
        },
        "address": {
          "city": "Manchester",
          "countryCode": "US",
          "line1": "786 New Bushy Branch Road",
          "postalCode": "37355",
          "region": "TN"
        },
        "businessId": 0,
        "geocodedCoordinate": {
          "latitude": 35.480399,
          "longitude": -86.060931
        },
        "id": "4092",
        "key": "0:index:knowledgeGraph:45138271:en",
        "locale": "en",
        "meta": {
          "entityType": {
            "id": "location",
            "uid": 0
          },
          "locale": "en",
          "updateTimestamp": "2022-06-21T01:50:05Z"
        },
        "name": "Manchester Farm",
        "siteId": 0,
        "uid": 45138271
      }`)
    );
    // Make sure we write back the expected messages to the parent process.
    expect(mockParentProcessStdout.write).toHaveBeenCalledTimes(2);
    expect(mockParentProcessStdout.write).toHaveBeenCalledWith(
      `Generated 1 files for stream "my-stream-id-1"\n`
    );
  });
});

describe("generateTestDataForSlug", () => {
  const projectStructure = new ProjectStructure();
  const featuresConfig: FeaturesConfig = {
    features: [
      {
        name: "location",
        streamId: "location-stream",
        templateType: "JS",
        entityPageSet: {},
      },
      {
        name: "faq",
        streamId: "faq-stream",
        templateType: "JS",
        entityPageSet: {},
      },
    ],
    streams: [],
  };

  it("ignores templates without matching documents when multiple templates share a slug field", async () => {
    const templateModules = new Map([
      [
        "location",
        {
          config: {
            name: "location",
            templateType: "entity",
            slugField: "slug",
          },
        },
      ],
      [
        "faq",
        {
          config: {
            name: "faq",
            templateType: "entity",
            slugField: "slug",
          },
        },
      ],
    ]) as TemplateModuleCollection;

    const generatedDocuments = [
      {
        __: {
          name: "location",
          entityPageSet: {},
        },
        slug: "target-slug",
      },
      {
        __: {
          name: "location",
          entityPageSet: {},
        },
        slug: "different-slug",
      },
    ];

    mockGetTemplateFilepathsFromProjectStructure.mockReturnValue([
      "src/templates/location.tsx",
      "src/templates/faq.tsx",
    ]);
    mockLoadTemplateModuleCollectionUsingVite.mockResolvedValue(templateModules);
    mockGetTemplatesConfig.mockReturnValue(featuresConfig);

    const testRunnerPromise = generateTestDataForSlug(
      mockParentProcessStdout,
      {} as any,
      "target-slug",
      projectStructure
    );

    await Promise.resolve();

    mockChildProcess.stdout.emit(
      "data",
      JSON.stringify(generatedDocuments, null, "  ")
    );
    mockChildProcess.emit("close");

    await expect(testRunnerPromise).resolves.toEqual(generatedDocuments[0]);
    expect(mockParentProcessStdout.write).toBeCalledTimes(0);
  });
});
