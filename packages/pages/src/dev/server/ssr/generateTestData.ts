import { spawn } from "child_process";
import { FeaturesConfig } from "../../../common/src/feature/features.js";
import {
  CLI_BOILERPLATE_BETA_MESSAGE,
  STREAM_DATA_CHUNK_BEGIN,
  STREAM_DATA_CHUNK_BEGIN_MULTIPLE,
  UPGRADE_MESSAGE_LINE_BEGIN,
  UPGRADE_INSTRUCTIONS_LINE_BEGIN,
} from "./constants.js";
import path from "path";
import fs from "fs";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import { getFeaturesConfig } from "../../../generate/features/createFeaturesJson.js";
import { getTemplateFilepathsFromProjectStructure } from "../../../common/src/template/internal/getTemplateFilepaths.js";
import {
  convertTemplateModuleToTemplateModuleInternal,
  TemplateModuleInternal,
} from "../../../common/src/template/internal/types.js";
import { ViteDevServer } from "vite";
import { loadTemplateModule } from "./loadTemplateModule.js";
import { TemplateModuleCollection } from "../../../vite-plugin/build/closeBundle/moduleLoader.js";

/**
 * generateTestData will run yext pages generate-test-data and return true in
 * the event of a successful run and false in the event of a failure.
 *
 * @param hostname The hostname of the site
 * @returns a boolean on whether test data generation was successful
 */
export const generateTestData = async (hostname?: string): Promise<boolean> => {
  const command = "yext";
  let args = ["pages", "generate-test-data"];
  if (hostname) {
    args = args.concat("--hostname", hostname);
  }

  async function generate() {
    const childProcess = spawn(command, args);
    const exitCode = await new Promise((resolve) => {
      childProcess.on("close", resolve);
    });
    return !!exitCode;
  }

  return generate();
};

export const generateTestDataForSlug = async (
  stdout: NodeJS.WriteStream,
  vite: ViteDevServer,
  slug: string,
  locale: string,
  projectStructure: ProjectStructure
): Promise<any> => {
  const templateFilepaths =
    getTemplateFilepathsFromProjectStructure(projectStructure);
  const templateModuleCollection = await loadTemplateModuleCollectionUsingVite(
    vite,
    templateFilepaths
  );
  const featuresConfig = await getFeaturesConfig(templateModuleCollection);
  const featuresConfigForEntityPages: FeaturesConfig = {
    features: featuresConfig.features.filter((f) => "entityPageSet" in f),
    streams: featuresConfig.streams,
  };
  const args = getCommonArgs(featuresConfigForEntityPages, projectStructure);
  args.push("--slug", slug);

  const parsedData = await spawnTestDataCommand(stdout, "yext", args);
  return getDocumentByLocale(parsedData, locale);
};

/**
 * We cannot use the loadTemplateModules that uses esbuild in dev mode,
 * instead we have to rely on vite to import templates.
 * Otherwise, we lose loader support for things like .ico files.
 */
const loadTemplateModuleCollectionUsingVite = async (
  vite: ViteDevServer,
  templateFilepaths: string[]
): Promise<TemplateModuleCollection> => {
  const templateModules: TemplateModuleInternal<any, any>[] = [];
  for (const templateFilepath of templateFilepaths) {
    const templateModule = await loadTemplateModule(vite, templateFilepath);

    const templateModuleInternal =
      convertTemplateModuleToTemplateModuleInternal(
        templateFilepath,
        templateModule,
        false
      );
    templateModules.push(templateModuleInternal);
  }
  return templateModules.reduce((prev, module) => {
    return prev.set(module.config.name, module);
  }, new Map());
};

export const generateTestDataForPage = async (
  stdout: NodeJS.WriteStream,
  featuresConfig: FeaturesConfig,
  entityId: string,
  locale: string,
  projectStructure: ProjectStructure
): Promise<any> => {
  const featureName = featuresConfig.features[0]?.name;
  const args = getCommonArgs(featuresConfig, projectStructure);

  if (entityId) {
    args.push("--entityIds", entityId);
  }

  const isAlternateLanguageFields =
    !!featuresConfig.features[0]?.alternateLanguageFields;
  if (!isAlternateLanguageFields) {
    args.push("--locale", locale);
  }

  args.push("--featureName", `"${featureName}"`);

  const parsedData = await spawnTestDataCommand(stdout, "yext", args);
  return getDocumentByLocale(parsedData, locale);
};

async function spawnTestDataCommand(
  stdout: NodeJS.WriteStream,
  command: string,
  args: string[]
): Promise<undefined | any> {
  return new Promise((resolve) => {
    const childProcess = spawn(command, args, {
      stdio: ["inherit", "pipe", "inherit"],
      shell: true,
    });

    // Assume that all CLI chunks will come before any stream data. Once stream data is found
    // assume the rest is relevant.
    let testData = "";
    let foundTestData = false;
    childProcess.stdout.on("data", (chunkBuff: Buffer) => {
      const chunk = chunkBuff.toString("utf-8");

      // If we've found test data at all then we assume the rest of the output is test data.
      if (foundTestData) {
        testData += chunk;
        return;
      }

      // Remove the Yext boilerplate
      let lines = chunk
        .split("\n")
        .filter((l) => !l.startsWith(CLI_BOILERPLATE_BETA_MESSAGE));

      // Check to see if the test data has begun to be printed in this chunk.
      const dataStartIndex = Math.max(
        lines.indexOf(STREAM_DATA_CHUNK_BEGIN),
        lines.indexOf(STREAM_DATA_CHUNK_BEGIN_MULTIPLE)
      );
      if (dataStartIndex !== -1) {
        foundTestData = true;
        testData = lines.slice(dataStartIndex).join("\n");
        lines = lines.slice(0, dataStartIndex);
      }

      // If the CLI Boilerplate indicates that the user's version of the YextCLI is
      // out of date, write back the relevant lines to the parent process so they can
      // see their current version relative to the most recent and upgrade instructions.
      const upgradeLines = lines
        .filter(
          (boilerplateLine) =>
            boilerplateLine.startsWith(UPGRADE_MESSAGE_LINE_BEGIN) ||
            boilerplateLine.startsWith(UPGRADE_INSTRUCTIONS_LINE_BEGIN)
        )
        .join("\n");

      if (upgradeLines) {
        stdout.write(upgradeLines);
      } else {
        // This will act as a catch-all to write back any prompts to the the parent process
        // so the user can see it. Its main usage is to allow the user to go through the
        // authentication flow from the parent process.
        const out = lines.join("\n").trim();
        out && stdout.write(out + "\n");
      }
    });

    childProcess.on("close", () => {
      let parsedData: any;
      if (testData) {
        try {
          parsedData = JSON.parse(testData.trim());
        } catch (e) {
          stdout.write(
            `\nUnable to parse test data from command: \`${command} ${args.join(
              " "
            )}\``
          );
          resolve(null);
        }
      } else {
        stdout.write(
          `\nUnable to generate test data from command: \`${command} ${args.join(
            " "
          )}\``
        );
      }

      // note: Yext CLI v0.299^ can return multiple documents as an array
      resolve(parsedData);
    });
  });
}

const getCommonArgs = (
  featuresConfig: FeaturesConfig,
  projectStructure: ProjectStructure
) => {
  const args = ["pages", "generate-test-data", "--printDocuments"];

  args.push("--featuresConfig", prepareJsonForCmd(featuresConfig));

  const sitesConfigPath =
    projectStructure.scopedSitesConfigPath?.getAbsolutePath() ??
    projectStructure.sitesConfigRoot.getAbsolutePath();
  const siteStreamPath = path.resolve(
    process.cwd(),
    path.join(sitesConfigPath, projectStructure.siteStreamConfig)
  );
  if (fs.existsSync(siteStreamPath)) {
    const siteStream = prepareJsonForCmd(
      JSON.parse(fs.readFileSync(siteStreamPath).toString())
    );
    args.push("--siteStreamConfig", siteStream);
  }

  return args;
};

// We need to specially handle JSON arguemnts when running on windows due to an existing bug/behavior in Powershell where inner quotes are
// stripped from strings when passed to a third-party program. Read more: https://stackoverflow.com/questions/52822984/powershell-best-way-to-escape-double-quotes-in-string-passed-to-an-external-pro.
const prepareJsonForCmd = (json: any) => {
  let jsonString;
  if (process.platform == "win32") {
    jsonString = `${JSON.stringify(json).replace(/([\\]*)"/g, `$1$1\\"`)}`;
  } else {
    jsonString = `'${JSON.stringify(json)}'`;
  }
  return jsonString;
};

const getDocumentByLocale = (parsedData: any, locale: string): any => {
  if (Array.isArray(parsedData)) {
    const documentsForLocale = parsedData.filter((d) => d.locale === locale);
    if (documentsForLocale.length === 0) {
      throw new Error(`Could not find document for locale: "${locale}"`);
    } else if (documentsForLocale.length > 1) {
      throw new Error(`Multiple documents found for locale: "${locale}"`);
    }
    return documentsForLocale[0];
  }
  return parsedData;
};
