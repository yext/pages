import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import latestVersion from "latest-version";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import typescript from "typescript";

const pagesSlashComponentsRegex = /@yext\/pages\/components/g;
const sitesComponentsRegex = /@yext\/sites-components/g;
const reactComponentsRegex = /@yext\/react-components/g;
const markdownRegex = /Markdown.{1,10}from ["']@yext\/react-components/g;

const pagesComponentsReplacement = "@yext/pages-components";

const DEPENDENCIES = "dependencies";
const DEV_DEPENDENCIES = "devDependencies";

/**
 * Helper function to update a package dependency in package.json
 * @param packageName name of the package to update
 * @param version version to update to, if not supplied uses @latest
 * @param install whether to install the package if it does not exist
 */
export async function updatePackageDependency(
  packageName: string,
  version: string | null,
  install: boolean = false
) {
  const packagePath = path.resolve("package.json");
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
    let toVersion = version || (await latestVersion(packageName));
    if (!toVersion) {
      console.error(`Failed to get version for ${packageName}`);
      return;
    }
    // if getting the latest version, add a caret
    if (!version && toVersion.charAt(0) !== "^") {
      toVersion = "^" + toVersion;
    }
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
async function removePackageDependency(packageName: string): Promise<boolean> {
  const packagePath = path.resolve("package.json");
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
 * @param source the src folder
 */
export const updateToUsePagesComponents = async (source: string) => {
  await removePackageDependency("@yext/sites-components");
  await removePackageDependency("@yext/react-components");
  await removePackageDependency("@yext/components-tsx-maps");
  await removePackageDependency("@yext/components-tsx-geo");
  // update imports from pages/components to sites-components
  const hasPagesSlashComponentsImports =
    replacePagesSlashComponentsImports(source);
  // update imports from sites-components to pages-components
  const hasSitesComponentsImports = replaceSitesComponentsImports(source);
  // update imports from react-components to pages-components
  const hasReactComponentsImports = replaceReactComponentsImports(source);
  const movedTsxMapsImports = moveTsxMapsImportsToPagesComponents(source);

  await updatePackageDependency(
    "@yext/pages-components",
    null,
    hasPagesSlashComponentsImports ||
      hasSitesComponentsImports ||
      hasReactComponentsImports ||
      movedTsxMapsImports
  );
};

/**
 * Update yext/pages to the version that is running
 */
export const updatePagesJSToCurrentVersion = async () => {
  const filePath = "/dist/upgrade";
  try {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const packagePath = path.join(
      dirname.substring(0, dirname.length - filePath.length),
      "package.json"
    );
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    await updatePackageDependency("@yext/pages", packageJson.version);
  } catch (e) {
    console.error("Failed to upgrade pages version: ", (e as Error).message);
    process.exit(1);
  }
};

/**
 * Updates vitejs/plugin-react and vite to specified versions
 */
export const updateDevDependencies = async () => {
  await updatePackageDependency("@vitejs/plugin-react", null);
  await updatePackageDependency("vite", null);
  await updatePackageDependency("@yext/search-headless-react", null);
  await updatePackageDependency("@yext/search-ui-react", null);
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
 * Moves imports likes `import { GoogleMaps } from "@yext/components-tsx-maps";` to
 * `import { Map, GoogleMaps } from "@yext/pages-components";`.
 * Does the same for "@yext/components-tsx-geo".
 * @param source the src folder
 */
export const moveTsxMapsImportsToPagesComponents = (source: string) => {
  let updated = false;
  const project = new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
      sourceRoot: source,
    },
  });
  project.addSourceFilesAtPaths(`${source}/**/*.{ts,tsx,js,jsx}`);
  const sourceFiles = project.getSourceFiles();
  for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    const importDeclarations = sourceFile.getImportDeclarations();

    // Check if pages-components already an import
    let pagesComponentsImportDeclaration;
    for (let j = 0; j < importDeclarations.length; j++) {
      const importDeclaration = importDeclarations[j];
      if (
        importDeclaration.getModuleSpecifierValue() === "@yext/pages-components"
      ) {
        pagesComponentsImportDeclaration = importDeclaration;
        break;
      }
    }

    for (let j = 0; j < importDeclarations.length; j++) {
      const importDeclaration = importDeclarations[j];
      if (
        importDeclaration.getModuleSpecifierValue() !==
          "@yext/components-tsx-maps" &&
        importDeclaration.getModuleSpecifierValue() !==
          "@yext/components-tsx-geo"
      ) {
        continue;
      }
      const namedImports = importDeclaration.getNamedImports();

      // Add components-tsx-maps/geo imports to pages-components
      if (pagesComponentsImportDeclaration) {
        for (let k = 0; k < namedImports.length; k++) {
          const namedImport = namedImports[k];
          pagesComponentsImportDeclaration.addNamedImport(
            namedImport.getName()
          );
        }
        importDeclaration.remove();
        updated = true;
      } else {
        // Otherwise add pages-components as an import
        sourceFile.addImportDeclaration({
          namedImports: namedImports.map((namedImport) =>
            namedImport.getName()
          ),
          moduleSpecifier: "@yext/pages-components",
        });
        importDeclaration.remove();
        updated = true;
      }
    }
  }
  if (updated) {
    project.saveSync();
  }
  return updated;
};

/**
 * Removes old fetch import that is no longer used
 * @param source the src folder
 */
export const removeFetchImport = (source: string) => {
  let hasRemoved = false;
  const project = new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
      sourceRoot: source,
    },
  });
  project.addSourceFilesAtPaths(`${source}/**/*.{ts,tsx,js,jsx}`);
  const sourceFiles = project.getSourceFiles();
  for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    const importDeclarations = sourceFile.getImportDeclarations();
    for (let j = 0; j < importDeclarations.length; j++) {
      const importDeclaration = importDeclarations[j];
      if (importDeclaration.getModuleSpecifierValue() !== "@yext/pages/util") {
        continue;
      }
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
 */
export const updatePackageScripts = () => {
  const packageJsonPath = path.resolve("package.json");

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
 */
export const installDependencies = async () => {
  if (fs.existsSync(path.resolve("package-lock.json"))) {
    console.log("package-lock detected, installing npm packages");
    execSync("npm install");
    return;
  }
  if (fs.existsSync(path.resolve("pnpm-lock.json"))) {
    console.log("pnpm-lock detected, installing pnpm packages");
    execSync("pnpm install");
    return;
  }
  if (fs.existsSync(path.resolve("yarn.lock"))) {
    console.log("yarn.lock detected, installing yarn packages");
    execSync("yarn install");
    return;
  }
};

// Note that Node 20 <20.2.0 leads to build errors: `Unexpected early exit.`
const NODE_ENGINES = "^18.4.0 || >=20.2.0";
/**
 * Update package engines to latest supported node versions.
 */
export const updatePackageEngines = () => {
  const packageJsonPath = path.resolve("package.json");
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
    if (version !== 18 && version !== 20) {
      console.error(
        `You are currently using an unsupported node version ${nodeVersion}. Please install node ${NODE_ENGINES}.`
      );
    }
  } catch (e) {
    console.log(ERR_MSG);
  }
};

const serverlessFunctionTypes: { [key: string]: string } = {
  SitesHttpRequest: "PagesHttpRequest",
  SitesOnUrlChangeRequest: "PagesOnUrlChangeRequest",
  SitesHttpResponse: "PagesHttpResponse",
  "Promise<SitesHttpResponse>": "Promise<PagesHttpResponse>",
  SitesOnUrlChangeResponse: "PagesOnUrlChangeResponse",
  "Promise<SitesOnUrlChangeResponse>": "Promise<PagesOnUrlChangeResponse>",
};

/**
 * Updates the imports and usages of e.g. SitesHttpRequest to PagessHttpRequest.
 * @param serverlessFunctionsPath the path to the serverless functions folder
 */
export const updateServerlessFunctionTypeReferences = (
  serverlessFunctionsPath: string
) => {
  let updated = false;
  const project = new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
      sourceRoot: serverlessFunctionsPath,
    },
  });
  project.addSourceFilesAtPaths(
    `${serverlessFunctionsPath}/**/*.{ts,tsx,js,jsx}`
  );
  const sourceFiles = project.getSourceFiles();
  for (let i = 0; i < sourceFiles.length; i++) {
    let fileUpdated = false;
    const sourceFile = sourceFiles[i];
    const importDeclarations = sourceFile.getImportDeclarations();
    for (let j = 0; j < importDeclarations.length; j++) {
      const importDeclaration = importDeclarations[j];
      if (importDeclaration.getModuleSpecifierValue() !== "@yext/pages/*") {
        continue;
      }
      const namedImports = importDeclaration.getNamedImports();
      for (let k = 0; k < namedImports.length; k++) {
        const namedImport = namedImports[k];
        if (
          !Object.keys(serverlessFunctionTypes).includes(namedImport.getName())
        ) {
          continue;
        }

        importDeclaration.addNamedImport(
          serverlessFunctionTypes[namedImport.getName()]
        );
        namedImport.remove();

        fileUpdated = true;
      }
      if (fileUpdated) {
        updated = true;
        console.log(
          `Updated serverless function types imported in: ${sourceFile.getFilePath()}`
        );
      }
    }

    if (!updated) {
      return;
    }

    const functions = sourceFile.getFunctions();
    for (let j = 0; j < functions.length; j++) {
      // update parameter types
      functions[j].getParameters().forEach((param) => {
        const paramType = param.getType().getText();
        if (Object.keys(serverlessFunctionTypes).includes(paramType)) {
          param.removeType();
          param.setType(serverlessFunctionTypes[paramType]);

          console.log(
            `Updated serverless function type params in: ${sourceFile.getFilePath()}`
          );
        }
      });

      // update return types
      const returnType = functions[j].getReturnType().getText();
      if (Object.keys(serverlessFunctionTypes).includes(returnType)) {
        functions[j].removeReturnType();
        functions[j].setReturnType(serverlessFunctionTypes[returnType]);

        console.log(
          `Updated serverless function return type in: ${sourceFile.getFilePath()}`
        );
      }
    }
  }

  project.saveSync();
};
