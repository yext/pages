import { createServer } from "./server/server.js";
import { CommandModule } from "yargs";
import open from "open";
import { ProjectFilepaths } from "../common/src/project/structure.js";
import { devServerPort } from "./server/middleware/constants.js";
import runSubProcess from "../util/runSubprocess.js";

interface DevArgs extends Pick<ProjectFilepaths, "scope"> {
  local?: boolean;
  "prod-url"?: boolean;
  "open-browser": boolean;
  scope?: string;
  allFields?: boolean;
  entityIds?: string;
  featureName?: string;
  featuresConfig?: string;
  hostname?: string;
  localData?: string;
  locale?: string;
  printDocuments?: boolean;
  root?: string;
  siteStreamConfig?: string;
  slug?: string;
  streamName?: string;
  noGenFeatures?: boolean;
  noGenTestData?: boolean;
  noStartServer?: boolean;
}

const handler = async (args: DevArgs) => {
  const {
    local,
    "prod-url": useProdURLs,
    "open-browser": openBrowser,
    scope,
  } = args;

  const genTestDataArgs = {
    allFields: args.allFields,
    entityIds: args.entityIds,
    featureName: args.featureName,
    featuresConfig: args.featuresConfig,
    hostname: args.hostname,
    localData: args.localData,
    locale: args.locale,
    printDocuments: args.printDocuments,
    root: args.root,
    siteStreamConfig: args.siteStreamConfig,
    slug: args.slug,
    streamName: args.streamName,
  };

  const formattedGenTestDataArgs = Object.entries(genTestDataArgs)
    .map((pair) => {
      if (pair[1] === undefined) return;
      if (pair[1] === true) {
        return "--" + pair[0];
      }
      return "--" + pair[0] + " " + pair[1].toString();
    })
    .filter((argument) => argument) as string[];

  if (!args.noGenFeatures)
    await runSubProcess(
      "pages generate features",
      args.scope ? ["--scope" + " " + args.scope] : []
    );

  if (!args.noGenTestData)
    await runSubProcess(
      "yext pages generate-test-data",
      formattedGenTestDataArgs
    );

  if (!args.noStartServer) {
    await createServer(!local, !!useProdURLs, scope);

    if (openBrowser) await open(`http://localhost:${devServerPort}/`);
  }
};

const devCommandDescription =
  "Creates features.json, generates test data, and runs a custom" +
  " local development server that is backed by Vite. If a streamName is provided, the command" +
  " will generate local data files using the actual content from that streamName. Otherwise," +
  " dummy data will be used based on the stream names given in the provided config file. The local" +
  " data directory will be created if it already does not exist. If featuresConfig or " +
  "siteStreamConfig is provided, the command will generate local data files using the provided " +
  "content in place of features.json or site-stream.json, respectively.";

export const devCommandModule: CommandModule<unknown, DevArgs> = {
  command: "dev",
  describe: devCommandDescription,
  builder: (yargs) => {
    return yargs
      .option("h", {
        alias: "help",
        describe: "Help for pages dev",
        type: "boolean",
        demandOption: false,
      })
      .option("local", {
        describe: "Disables dynamically generated test data",
        type: "boolean",
        demandOption: false,
      })
      .option("scope", {
        describe: "The subfolder to scope the served templates from",
        type: "string",
        demandOption: false,
      })
      .option("prod-url", {
        describe:
          "Use production URLs, instead of /[template-name]/[external-id]",
        type: "boolean",
        demandOption: false,
        default: true,
      })
      .option("open-browser", {
        describe: "Automatically opens the browser on server start-up",
        type: "boolean",
        demandOption: false,
        default: true,
      })
      .option("allFields", {
        alias: "a",
        describe:
          "When true all knowledge graph fields will be included in the" +
          " test data instead of being filtered to the fields in the stream",
        type: "boolean",
        demandOption: false,
      })
      .option("entityIds", {
        describe: "Entities to generate-test-data",
        type: "string",
        demandOption: false,
      })
      .option("featureName", {
        describe: "Feature name to generate-test-data",
        type: "string",
        demandOption: false,
      })
      .option("featuresConfig", {
        describe: "json string to use as the features.json file",
        type: "string",
        demandOption: false,
      })
      .option("hostname", {
        describe: "Hostname of site to generate-test-data",
        type: "string",
        demandOption: false,
      })
      .option("localData", {
        describe:
          "Relative path to directory to write generated data to (default localData)",
        type: "string",
        demandOption: false,
      })
      .option("locale", {
        describe: "Locale to generate-test-data",
        type: "string",
        demandOption: false,
      })
      .option("printDocuments", {
        alias: "p",
        describe:
          "When true the generated test data will be printed to the" +
          " console, not written to the localData directory",
        type: "boolean",
        demandOption: false,
      })
      .option("root", {
        alias: "r",
        describe: "Path to the repo root directory",
        type: "string",
        demandOption: false,
      })
      .option("siteStreamConfig", {
        describe: "json string to use as the site-stream.json file",
        type: "string",
        demandOption: false,
      })
      .option("slug", {
        describe: "Slug value of the entity to fetch data for",
        type: "string",
        demandOption: false,
      })
      .option("streamName", {
        describe: "streamName to fetch data from",
        type: "string",
        demandOption: false,
      })
      .option("noGenFeatures", {
        describe: "Disable feature.json generation step",
        type: "boolean",
        demandOption: false,
      })
      .option("noGenTestData", {
        describe: "Disable test data generation step",
        type: "boolean",
        demandOption: false,
      })
      .option("noStartServer", {
        describe: "Disable server step",
        type: "boolean",
        demandOption: false,
      });
  },
  handler,
};
