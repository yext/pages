import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import { ProjectStructure } from "../common/src/project/structure.js";
import latestVersion from "latest-version";
import { execSync } from "child_process";
import { readJsonSync } from "./migrateConfig.js";
import { fileURLToPath } from "url";

const pagesSlashComponentsRegex = /@yext\/pages\/components/g;
const sitesComponentsRegex = /@yext\/sites-components/g;
const reactComponentsRegex = /@yext\/react-components/g;
const markdownRegex = /Markdown.{1,10}from ["']@yext\/react-components/g;

const pagesComponentsReplacement = "@yext/pages-components";

const DEPENDENCIES = "dependencies";
const DEV_DEPENDENCIES = "devDependencies";

/**
 * Helper function to update a package dependency in package.json
 * @param root folder that contains package.json
 * @param packageName name of the package to update
 * @param version version to update to, if not supplied uses @latest
 * @param install whether to install the package if it does not exist
 */
async function updatePackageDependency(
  root: string,
  packageName: string,
  version: string | null,
  install: boolean = false
) {
  const packagePath = path.resolve(root, "package.json");
  if (!fs.existsSync(packagePath)) {
    console.error(
      `Could not find package.json, unable to update ${packageName}`
    );
    process.exit(1);
  }
  try {
    let dependencyType = DEV_DEPENDENCIES;
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    if (packageJson.dependencies[packageName]) {
      dependencyType = DEPENDENCIES;
    }
    const currentVersion = packageJson[dependencyType][packageName];
    if (!install && !currentVersion) {
      return;
    }
    const toVersion = version || (await latestVersion(packageName));
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
 * @param root folder that contains package.json
 * @param packageName name of the package to remove
 * @return hasRemoved whether the package was removed
 */
async function removePackageDependency(
  root: string,
  packageName: string
): Promise<boolean> {
  const packagePath = path.resolve(root, "package.json");
  if (!fs.existsSync(packagePath)) {
    console.error(
      `Could not find package.json, unable to remove ${packageName}`
    );
    process.exit(1);
  }
  try {
    let dependencyType = DEV_DEPENDENCIES;
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    if (packageJson.dependencies[packageName]) {
      dependencyType = DEPENDENCIES;
    }
    if (packageJson[dependencyType][packageName]) {
      console.log(`Removing ${packageName} from package.json`);
      packageJson[dependencyType][packageName] = undefined;
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      return true;
    }
  } catch (e) {
    console.error(`Error removing ${packageName}: `, (e as Error).message);
    process.exit(1);
  }
  return false;
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
 * @param root folder that contains package.json
 * @param source the src folder
 */
export const updateToUsePagesComponents = async (
  root: string,
  source: string
) => {
  await removePackageDependency(root, "@yext/sites-components");
  await removePackageDependency(root, "@yext/react-components");
  // update imports from pages/components to sites-components
  const hasPagesSlashComponentsImports =
    replacePagesSlashComponentsImports(source);
  // update imports from sites-components to pages-components
  const hasSitesComponentsImports = replaceSitesComponentsImports(source);
  // update imports from react-components to pages-components
  const hasReactComponentsImports = replaceReactComponentsImports(source);

  await updatePackageDependency(
    root,
    "@yext/pages-components",
    null,
    hasPagesSlashComponentsImports ||
      hasSitesComponentsImports ||
      hasReactComponentsImports
  );
};

/**
 * Update yext/pages to the version that is running
 * @param root folder that contains package.json
 */
export const updatePagesJSToCurrentVersion = async (root: string) => {
  const filePath = "/dist/upgrade";
  try {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const packagePath = path.join(
      dirname.substring(0, dirname.length - filePath.length),
      "package.json"
    );
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    await updatePackageDependency(root, "@yext/pages", packageJson.version);
  } catch (e) {
    console.error("Failed to upgrade pages version: ", (e as Error).message);
    process.exit(1);
  }
};

/**
 * Updates vitejs/plugin-react and vite to specified versions
 * @param root folder that contains package.json
 */
export const updateDevDependencies = async (root: string) => {
  await updatePackageDependency(root, "@vitejs/plugin-react", null);
  await updatePackageDependency(root, "vite", "^5.0.10");
};

/**
 * Checks for legacy markdown and logs a warning if it is found
 * @param source the src folder
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
 * Replaces imports for pages/components with pages-components
 * @param source the src folder
 * @return hasReplaced
 */
export const replacePagesSlashComponentsImports = (source: string): boolean => {
  let hasReplaced = false;
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(pagesSlashComponentsRegex)) {
      const modifiedContent = fileContent.replace(
        pagesSlashComponentsRegex,
        pagesComponentsReplacement
      );
      hasReplaced = true;
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      console.log(`pages/components imports replaced in: ${filePath}`);
    }
  };
  processDirectoryRecursively(source, operation);
  return hasReplaced;
};

/**
 * Replaces imports for sites-components with pages-components
 * @param source the src folder
 * @return hasReplaced
 */
export const replaceSitesComponentsImports = (source: string): boolean => {
  let hasReplaced = false;
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(sitesComponentsRegex)) {
      const modifiedContent = fileContent.replace(
        sitesComponentsRegex,
        pagesComponentsReplacement
      );
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      hasReplaced = true;
      console.log(`sites-components imports replaced in: ${filePath}`);
    }
  };
  processDirectoryRecursively(source, operation);
  return hasReplaced;
};

/**
 * Replaces imports for react-components with pages-components
 * @param source the src folder
 * @return hasReplaced
 */
export const replaceReactComponentsImports = (source: string): boolean => {
  let hasReplaced = false;
  const operation = async (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (fileContent.match(reactComponentsRegex)) {
      const modifiedContent = fileContent.replace(
        reactComponentsRegex,
        pagesComponentsReplacement
      );
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      hasReplaced = true;
      console.log(`react-components imports replaced in: ${filePath}`);
    }
  };
  processDirectoryRecursively(source, operation);
  return hasReplaced;
};

/**
 * Removes old fetch import that is no longer used
 * @param root folder that contains package.json and tsconfig.json
 */
export const removeFetchImport = (root: string) => {
  let hasRemoved = false;
  const project = new Project({
    tsConfigFilePath: path.resolve(root, "tsconfig.json"),
  });
  const sourceFiles = project.getSourceFiles();
  for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    const importDeclarations = sourceFile.getImportDeclarations();
    for (let j = 0; j < importDeclarations.length; j++) {
      const importDeclaration = importDeclarations[j];
      const namedImports = importDeclaration.getNamedImports();
      for (let k = 0; k < namedImports.length; k++) {
        const namedImport = namedImports[k];
        if (namedImport.getName() === "fetch") {
          if (namedImports.length == 1) {
            importDeclaration.remove();
          } else {
            namedImport.remove();
          }
          hasRemoved = true;
          console.log(
            `Removed legacy fetch import in: ${sourceFile.getFilePath()}`
          );
          break;
        }
      }
    }
  }
  if (hasRemoved) {
    project.saveSync();
  }
};

/**
 * Updates package scripts to include dev, prod, and build:local commands
 * @param root folder that includes package.json
 */
export const updatePackageScripts = (root: string) => {
  const packageJsonPath = path.resolve(root, "package.json");

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
 * @param root folder that contains package.json
 * @param projectStructure
 */
export const installDependencies = async (
  root: string,
  projectStructure: ProjectStructure
) => {
  const ciJsonPath = path.resolve(
    projectStructure.getSitesConfigPath().getAbsolutePath(),
    projectStructure.config.sitesConfigFiles.ci
  );

  try {
    const ciJson = readJsonSync(ciJsonPath);
    const installDepsCmd = ciJson.dependencies.installDepsCmd;
    console.log(`Installing dependencies using '${installDepsCmd}'`);
    execSync(installDepsCmd);
  } catch (ignored) {
    // if we cant find the installation command, determine it from existence of lock files
    if (fs.existsSync(path.resolve(root, "package-lock.json"))) {
      console.log("package-lock detected, installing npm packages");
      execSync("npm install");
    }
    if (fs.existsSync(path.resolve(root, "pnpm-lock.json"))) {
      console.log("pnpm-lock detected, installing pnpm packages");
      execSync("pnpm install");
    }
    if (fs.existsSync(path.resolve(root, "yarn.lock"))) {
      console.log("yarn.lock detected, installing yarn packages");
      execSync("yarn install");
    }
  }
};

const NODE_ENGINES = "^18.0.0 || >=20.0.0";
/**
 * Update package engines to latest supported node versions.
 * @param root folder that contains package.json
 */
export const updatePackageEngines = (root: string) => {
  const packageJsonPath = path.resolve(root, "package.json");
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
