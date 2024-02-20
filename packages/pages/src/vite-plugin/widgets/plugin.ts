import { build, createLogger } from "vite";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs";
import { convertToPosixPath } from "../../common/src/template/paths.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import pc from "picocolors";
import { addResponseHeadersToConfigYaml } from "../../util/editConfigYaml.js";
import SourceFileParser, {
  createTsMorphProject,
} from "../../common/src/parsers/sourceFileParser.js";

const wrappedCode = (widgetName: string, containerName: string): string => {
  return `\nconst widgetContainerForBuildUseOnly = document.getElementById('${containerName}');
if (!widgetContainerForBuildUseOnly) {
  throw new Error('could not find ${containerName} element');
}

ReactDOM.render(
  <React.StrictMode>
    <${widgetName}/>
  </React.StrictMode>,
  widgetContainerForBuildUseOnly
);
  `;
};

const widgetResponseHeader = {
  pathPattern: "^widgets/.*",
  headerKey: "Access-Control-Allow-Origin",
  headerValues: ["*"],
};

export const buildWidgets = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  if (!shouldBundleWidgets(projectStructure)) {
    return;
  }

  addResponseHeadersToConfigYaml(projectStructure, widgetResponseHeader);

  const { rootFolders, subfolders, envVarConfig } = projectStructure.config;
  const outdir = path.join(rootFolders.dist, subfolders.widgets);

  const filepaths: { [s: string]: string } = {};
  glob
    .sync(
      convertToPosixPath(
        path.join(rootFolders.source, subfolders.widgets, "**/*.{jsx,tsx}")
      ),
      { nodir: true }
    )
    .forEach((f) => {
      const filepath = path.resolve(f);
      const widgetName = getWidgetName(filepath);
      filepaths[widgetName] = filepath;
    });

  const logger = createLogger();
  const loggerInfo = logger.info;

  for (const [widgetName, widgetPath] of Object.entries(filepaths)) {
    const index = addExtraWidgetCode(widgetPath, widgetName);
    logger.info = (msg, options) => {
      if (msg.includes("building for production")) {
        loggerInfo(pc.green(`\nBuilding ${widgetName} widget...`));
        return;
      }
      loggerInfo(msg, options);
    };

    await build({
      customLogger: logger,
      configFile: false,
      envDir: envVarConfig.envVarDir,
      envPrefix: envVarConfig.envVarPrefix,
      resolve: {
        conditions: ["worker", "webworker"],
      },
      publicDir: false,
      css: {
        postcss: path.join(
          rootFolders.source,
          subfolders.widgets,
          `${widgetName}/postcss.config.cjs`
        ),
      },
      build: {
        emptyOutDir: false,
        outDir: outdir,
        minify: true,
        rollupOptions: {
          input: widgetPath,
          output: {
            format: "umd",
            entryFileNames: `${widgetName}.umd.js`,
          },
        },
        reportCompressedSize: false,
      },
      define: processEnvVariables(envVarConfig.envVarPrefix),
      plugins: [
        nodePolyfills({
          globals: {
            Buffer: "build",
            global: "build",
            process: "build",
          },
        }),
      ],
    });
    removeAddedWidgetCode(widgetPath, index);
  }
};

const shouldBundleWidgets = (projectStructure: ProjectStructure) => {
  const { rootFolders, subfolders } = projectStructure.config;
  return fs.existsSync(path.join(rootFolders.source, subfolders.widgets));
};

/**
 *
 * @param widgetPath
 * @returns name of widget if set by user, else uses file name
 */
const getWidgetName = (widgetPath: string): string => {
  const sfp = new SourceFileParser(widgetPath, createTsMorphProject());
  const { name } = path.parse(widgetPath);
  return (
    sfp
      .getVariablePropertyByType("WidgetConfig", "name")
      ?.replace(/['"`]/g, "") ?? name
  );
};

/**
 * Adds custom code to widget such that it works when bundled into umd.js.
 *
 * @param widgetPath
 * @param name
 * @returns number of added index
 */
const addExtraWidgetCode = (widgetPath: string, name: string): number => {
  const sfp = new SourceFileParser(widgetPath, createTsMorphProject());
  const declaration = sfp.getVariableDeclarationByType("Widget");
  if (declaration === undefined) {
    throw new Error(`Cannot find variable Widget in ${widgetPath}`);
  }
  const widgetName = declaration.getName();
  const insertIndex = sfp.getEndPos();
  const afterInsertIndex = sfp.insertStatement(
    wrappedCode(widgetName, name),
    insertIndex
  );
  sfp.addReactImports();
  sfp.save();
  return afterInsertIndex - insertIndex;
};

/**
 * Removes the custom code we added after bundling is done.
 * @param widgetPath
 * @param index index added (such as via addExtraWidgetCode)
 */
const removeAddedWidgetCode = (widgetPath: string, index: number) => {
  const sfp = new SourceFileParser(widgetPath, createTsMorphProject());
  sfp.removeStatement(sfp.getEndPos() - index, sfp.getEndPos());
  sfp.removeUnusedImports();
  sfp.save();
};
