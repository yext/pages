import fs from "fs";
import path from "path";
import { ProjectStructure } from "../common/src/project/structure.js";
import latestVersion from "latest-version";
import { execSync } from "child_process";
import { readJsonSync } from "./migrateConfig.js";
import { fileURLToPath } from "url";

const pagesSlashComponentsRegex = /"@yext\/pages\/components"/g;
const sitesComponentsRegex = /"@yext\/sites-components"/g;
const sitesComponentsReplacement = '"@yext/sites-components"';
const pagesComponentsReplacement = '"@yext/pages-components"';
const reactComponentsRegex = /"@yext\/react-components"/g;
const fetchImportRegex = /\nimport { fetch } from "@yext\/pages\/util";/g;
const markdownRegex = 'Markdown.{1,10}from "@yext\\/react-components';

/**
 * Helper function to update a package dependency in package.json
 * @param targetDirectory directory of the site
 * @param packageName name of the package to update
 * @param version version to update to, if not supplied uses @latest
 * @param devDependency whether it is a devDependency or regular dependency
 */
async function updatePackageDependency(
  targetDirectory: string,
  packageName: string,
  version: string | null,
  devDependency: boolean
) {
  const packagePath = path.resolve(targetDirectory, "package.json");
  if (!fs.existsSync(packagePath)) {
    console.error(
      `Could not find package.json, unable to update ${packageName}`
    );
    process.exit(1);
  }
  try {
    const dependencyType = devDependency ? "devDependencies" : "dependencies";
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    const toVersion = version || (await latestVersion(packageName));
    const currentVersion = packageJson[dependencyType][packageName];
    if (currentVersion === toVersion) {
      return;
    }
    if (!currentVersion) {
      console.log(`Installing ${packageName} at ${toVersion}`);
    } else {
      console.log(`Upgrading ${packageName} to ${toVersion}`);
    }
    packageJson[dependencyType][packageName] = toVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  } catch (e) {
    console.error(`Error updating ${packageName}: `, (e as Error).message);
    process.exit(1);
  }
}

/**
 * Helper function to remove a package dependency in package.json
 * @param targetDirectory directory of the site
 * @param packageName name of the package to remove
 * @param devDependency whether the dependency is a devDevdepency or not
 */
async function removePackageDependency(
  targetDirectory: string,
  packageName: string,
  devDependency: boolean = false
) {
  const packagePath = path.resolve(targetDirectory, "package.json");
  if (!fs.existsSync(packagePath)) {
    console.error(
      `Could not find package.json, unable to remove ${packageName}`
    );
    process.exit(1);
  }
  try {
    const dependencyType = devDependency ? "devDependencies" : "dependencies";
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    if (packageJson[dependencyType][packageName]) {
      console.log(`Removing ${packageName} from package.json`);
      packageJson[dependencyType][packageName] = undefined;
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    }
  } catch (e) {
    console.error(`Error removing ${packageName}: `, (e as Error).message);
    process.exit(1);
  }
}

/**
 * Helper function to recurse through a directory and perform operation on each .js, .ts, or .tsx file found.
 * Ignores node_modules and .git directories.
 * @param currentPath
 * @param operation
 */
function processDirectoryRecursively(
  currentPath: string,
  operation: (filePath: string) => void
) {
  const files = fs.readdirSync(currentPath);
  files.forEach((file) => {
    const filePath = path.join(currentPath, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const isGitDirectory = path.basename(filePath) === ".git";
    const isNodeModulesDirectory = path.basename(filePath) === "node_modules";
    const fileExtension = path.extname(filePath);

    if (isDirectory && !isGitDirectory && !isNodeModulesDirectory) {
      processDirectoryRecursively(filePath, operation);
    } else if (
      [".js", ".ts", ".tsx"].includes(fileExtension) &&
      !isNodeModulesDirectory
    ) {
      try {
        operation(filePath);
      } catch (e) {
        console.error(`Error processing ${filePath}: `, (e as Error).message);
      }
    }
  });
}

/**
 * Update pages-components to the latest version and replace sites-components imports with
 * pages-components.
 * @param targetDirectory
 */
export const updateToUsePagesComponents = async (targetDirectory: string) => {
  await updatePackageDependency(
    targetDirectory,
    "@yext/pages-components",
    null,
    true
  );
  await removePackageDependency(targetDirectory, "@yext/sites-components");
  await removePackageDependency(targetDirectory, "@yext/react-components");
  // update imports from pages/components to sites-components
  replacePagesSlashComponentsImports(targetDirectory);
  // update imports from sites-components to pages-components
  replaceSitesComponentsImports(targetDirectory);
  // update imports from react-components to pages-components
  replaceReactComponentsImports(targetDirectory);
};

/**
 * Update yext/pages to the version that is running
 * @param targetDirectory
 */
export const updatePagesJSToCurrentVersion = async (
  targetDirectory: string
) => {
  const filePath = "/dist/upgrade";
  try {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const packagePath = path.join(
      dirname.substring(0, dirname.length - filePath.length),
      "package.json"
    );
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    await updatePackageDependency(
      targetDirectory,
      "@yext/pages",
      packageJson.version,
      true
    );
  } catch (e) {
    console.error("Failed to upgrade pages version: ", (e as Error).message);
    process.exit(1);
  }
};

/**
 * Updates vitejs/plugin-react and vite to specified versions
 * @param targetDirectory
 */
export const updateDevDependencies = async (targetDirectory: string) => {
  await updatePackageDependency(
    targetDirectory,
    "@vitejs/plugin-react",
    "^4.0.4",
    true
  );
  await updatePackageDependency(targetDirectory, "vite", "4.4.9", true);
};

/**
 * Checks for legacy markdown and logs a warning if it is found
 * @param source the root, src folder
 */
export const checkLegacyMarkdown = (source: string) => {
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(markdownRegex)) {
      console.log(
        `Legacy Markdown import from react-components detected in ${filePath}.` +
          `\n Please update to use react-markdown. See https://hitchhikers.yext.com/docs/pages/rich-text-markdown`
      );
    }
  };
  processDirectoryRecursively(source, operation);
};

/**
 * Replaces imports for pages/components with sites-components
 * @param source
 */
export const replacePagesSlashComponentsImports = (source: string) => {
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(pagesSlashComponentsRegex)) {
      const modifiedContent = fileContent.replace(
        pagesSlashComponentsRegex,
        sitesComponentsReplacement
      );
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      console.log(`pages/components imports replaced in: ${filePath}`);
    }
  };
  processDirectoryRecursively(source, operation);
};

/**
 * Replaces imports for sites-components with pages-components
 * @param source
 */
export const replaceSitesComponentsImports = (source: string) => {
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(sitesComponentsRegex)) {
      const modifiedContent = fileContent.replace(
        sitesComponentsRegex,
        pagesComponentsReplacement
      );
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      console.log(`sites-components imports replaced in: ${filePath}`);
    }
  };
  processDirectoryRecursively(source, operation);
};

/**
 * Replaces imports for react-components with pages-components
 * @param source
 */
export const replaceReactComponentsImports = (source: string) => {
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(reactComponentsRegex)) {
      const modifiedContent = fileContent.replace(
        reactComponentsRegex,
        pagesComponentsReplacement
      );
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      console.log(`react-components imports replaced in: ${filePath}`);
    }
  };
  processDirectoryRecursively(source, operation);
};

/**
 * Removes old fetch import that is no longer used
 * @param source
 */
export const removeFetchImport = (source: string) => {
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(fetchImportRegex)) {
      const modifiedContent = fileContent.replace(fetchImportRegex, "");
      fs.writeFileSync(filePath, modifiedContent, "utf8"); // Update the file content
      console.log(`Removed legacy fetch import in: ${filePath}`);
    }
  };
  processDirectoryRecursively(source, operation);
};

/**
 * Updates package scripts to include dev, prod, and build:local commands
 * @param targetDirectory
 */
export const updatePackageScripts = (targetDirectory: string) => {
  const packageJsonPath = path.resolve(targetDirectory, "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const scripts = packageJson.scripts;
    scripts.dev = "pages dev";
    scripts.prod = "pages prod";
    scripts["build"] = "pages build";
    scripts["build:local"] = undefined;
    packageJson.scripts = scripts;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("package.json scripts updated.");
  } catch (e) {
    console.error("Error updating package.json: ", (e as Error).message);
  }
};

/**
 * Install dependencies using install command or npm, pnpm, or yarn install.
 * @param targetDirectory
 * @param projectStructure
 */
export const installDependencies = async (
  targetDirectory: string,
  projectStructure: ProjectStructure
) => {
  const ciJsonPath = path.resolve(
    projectStructure.getSitesConfigPath().getAbsolutePath(),
    projectStructure.config.sitesConfigFiles.ci
  );

  try {
    const ciJson = readJsonSync(ciJsonPath);
    const installDepsCmd = ciJson.dependencies.installDepsCmd;
    console.log(`installing dependencies using '${installDepsCmd}'`);
    execSync(installDepsCmd);
  } catch (ignored) {
    // if we cant find the installation command, determine it from existence of lock files
    if (fs.existsSync(path.resolve(targetDirectory, "package-lock.json"))) {
      console.log("package-lock detected, installing npm packages");
      execSync("npm install");
    }
    if (fs.existsSync(path.resolve(targetDirectory, "pnpm-lock.json"))) {
      console.log("pnpm-lock detected, installing pnpm packages");
      execSync("pnpm install");
    }
    if (fs.existsSync(path.resolve(targetDirectory, "yarn.lock"))) {
      console.log("yarn.lock detected, installing yarn packages");
      execSync("yarn install");
    }
  }
};

const NODE_ENGINES = "^18.0.0 || >=20.0.0";
/**
 * Update package engines to latest supported node versions.
 * @param targetDirectory
 */
export const updatePackageEngines = (targetDirectory: string) => {
  const packageJsonPath = path.resolve(targetDirectory, "package.json");
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    let engines = packageJson.engines;
    if (engines) {
      engines.node = NODE_ENGINES;
    } else {
      engines = { node: NODE_ENGINES };
    }
    packageJson.engines = engines;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("package.json engines updated.");
  } catch (e) {
    console.error("Error updating package engines: ", (e as Error).message);
  }
};

/**
 * Checks the version of node that is currently installed and logs an error if it is unsupported.
 */
export const checkNodeVersion = () => {
  const ERR_MSG =
    "Could not determine node version. " +
    `Please install node ${NODE_ENGINES}.`;
  try {
    const nodeVersion = execSync("node -v");
    if (!nodeVersion || nodeVersion.length < 4) {
      console.log(ERR_MSG);
      return;
    }
    const version = parseInt(nodeVersion.toString().split(".")[0].substring(1));
    if (version != 18 && version != 20) {
      console.error(
        `You are currently using an unsupported node version ${nodeVersion}. Please install node ${NODE_ENGINES}.`
      );
    }
  } catch (e) {
    console.log(ERR_MSG);
  }
};
