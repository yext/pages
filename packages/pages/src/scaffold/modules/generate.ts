import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import prompts, { PromptObject } from "prompts";
import { indexCssCode, moduleCode, postcssCode, tailwindCode } from "./templates.js";
import { installDependencies, updatePackageDependency } from "../../upgrade/pagesUpdater.js";
import { logErrorAndExit } from "../../util/logError.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { addResponseHeadersToConfigYaml } from "../../util/editConfigYaml.js";

const moduleResponseHeaderProps = {
  headerKey: "Access-Control-Allow-Origin",
  headerValues: ["*"],
};

/**
 * generateModule asks questions via stdout and generates files based on
 * the responses. Also, installs necessary dependencies.
 * SIGINT is handled such that any generated files are removed.
 */
export const generateModule = async (projectStructure: ProjectStructure): Promise<void> => {
  const questions: PromptObject[] = [
    {
      type: "text",
      name: "moduleName",
      message: "What would you like to name your Module?",
      validate: (moduleName) =>
        validateModuleName(moduleName, projectStructure) ||
        "Please ensure the name provided isn't already used and is valid.",
    },
    {
      type: "confirm",
      name: "useTailwind",
      message: "Would you like to use Tailwind CSS?",
      initial: true,
    },
  ];
  const response = await prompts(questions);

  const modulePath = path.join(projectStructure.getModulePaths()[0].path, response.moduleName);

  // Handle interruption signal (Ctrl+C)
  process.on("SIGINT", () => handleCancel(response.moduleName, projectStructure));

  fs.mkdirSync(modulePath, { recursive: true });
  fs.writeFileSync(
    path.join(modulePath, `${response.moduleName}.tsx`),
    moduleCode(response.moduleName, response.useTailwind)
  );
  fs.writeFileSync(path.join(modulePath, "index.css"), indexCssCode(response.useTailwind));
  if (response.useTailwind) {
    fs.writeFileSync(
      path.join(modulePath, "tailwind.config.ts"),
      tailwindCode(projectStructure, response.moduleName)
    );
    fs.writeFileSync(path.join(modulePath, "postcss.config.js"), postcssCode());
  }

  try {
    await getDependencies();
  } catch (error) {
    logErrorAndExit(error);
  }

  // Formats src/modules/my-module to ^modules/my-module
  const configPathPattern = modulePath.replace(
    `${projectStructure.config.rootFolders.source}${path.sep}`,
    "^"
  );
  addResponseHeadersToConfigYaml(
    projectStructure,
    {
      pathPattern: `${configPathPattern}.*`,
      ...moduleResponseHeaderProps,
    },
    "# The ^modules/ header allows access to your modules from other sites\n"
  );

  process.removeListener("SIGINT", () => handleCancel);
  console.log(`\nModule "${response.moduleName}" created successfully at ${modulePath}`);
};

/**
 * Validates the following:
 *  moduleName isn't used already in a modulePath
 *  the name starts with an alphabetic character
 *  the name has no spaces
 *  the name only contains alphanumeric characters, hyphens, underscores, or dollar signs.
 */
const validateModuleName = (moduleName: string, projectStructure: ProjectStructure): boolean => {
  const modulePath = path.join(projectStructure.getModulePaths()[0].path, moduleName);
  if (fs.existsSync(modulePath)) {
    return false;
  }
  return isValidModuleName(moduleName);
};

export function isValidModuleName(moduleName: string): boolean {
  return (
    /^[a-zA-Z]+$/.test(moduleName.charAt(0)) && // moduleName starts with alphabetic character
    !/\s/.test(moduleName) && // moduleName doesn't contain spaces
    /^[0-9a-zA-Z_$-]+$/.test(moduleName) // moduleName only has alphanumeric characters, hyphens, underscores, or dollar signs
  );
}

function handleCancel(moduleName: string, projectStructure: ProjectStructure) {
  const modulePath = projectStructure.getModulePaths(moduleName)[0].path;
  if (fs.existsSync(modulePath)) {
    const moduleFiles = glob.sync("**/*", { cwd: modulePath, nodir: true });
    moduleFiles.forEach((file) => {
      const filePath = path.join(modulePath, file);
      fs.unlinkSync(filePath);
    });
    fs.rmdirSync(modulePath);
  }

  process.exit(0);
}

const getDependencies = async () => {
  await updatePackageDependency("@yext/pages-components", null, true);
  await updatePackageDependency("tailwindcss", { latestMajorVersion: "3" }, true);
  await updatePackageDependency("tailwindcss-scoped-preflight", { latestMajorVersion: "3" }, true);
  await installDependencies();
};
