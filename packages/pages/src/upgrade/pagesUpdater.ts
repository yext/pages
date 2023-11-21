import fs from "fs";
import path from "path";
import { ProjectStructure } from "../common/src/project/structure.js";
import latestVersion from "latest-version";
import { execSync } from "child_process";
import { readJsonSync } from "./migrateConfig.js";

const pagesImportRegex = /"@yext\/pages\/components"/g;
const fetchImportRegex = /\nimport { fetch } from "@yext\/pages\/util";/g;
const replacementText = '"@yext/sites-components"';
const markdownRegex = 'Markdown.{1,10}from "@yext\\/react-components';

// Function to add packages to package.json
const updatePackageDependencies = async (targetDirectory: string) => {
  const packagePath = path.resolve(targetDirectory, "package.json");
  if (!fs.existsSync(packagePath)) {
    console.error("Could not find package.json, unable to upgrade packages");
    process.exit(1);
  }
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    packageJson.dependencies["@yext/sites-components"] = await latestVersion(
      "@yext/sites-components"
    );
    packageJson.devDependencies["@vitejs/plugin-react"] = "^4.0.4";
    packageJson.devDependencies["vite"] = "4.4.9";
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  } catch (e) {
    console.error("Error updating package.json: ", (e as Error).message);
    process.exit(1);
  }
};

// Function to recursively process and replace imports in files
const processDirectoryRecursively = (currentPath: string) => {
  const files = fs.readdirSync(currentPath);

  files.forEach((file) => {
    const filePath = path.join(currentPath, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const isGitDirectory = path.basename(filePath) === ".git";
    const isNodeModulesDirectory = path.basename(filePath) === "node_modules";
    const fileExtension = path.extname(filePath);

    if (isDirectory && !isGitDirectory && !isNodeModulesDirectory) {
      processDirectoryRecursively(filePath);
    } else if (
      [".js", ".ts", ".tsx"].includes(fileExtension) &&
      !isNodeModulesDirectory
    ) {
      replaceImports(filePath);
    }
  });
};

// Function to replace imports in a file
const replaceImports = (filePath: string) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedContent = fileContent
      .replace(pagesImportRegex, replacementText)
      .replace(fetchImportRegex, "");
    if (fileContent.match(markdownRegex)) {
      console.log(
        `Legacy Markdown import from react-components detected in ${filePath}.` +
          `\n Please update to use react-markdown. See https://hitchhikers.yext.com/docs/pages/rich-text-markdown`
      );
    }
    fs.writeFileSync(filePath, modifiedContent, "utf8"); // Update the file content
    console.log(`Imports replaced in: ${filePath}`);
  } catch (e) {
    console.error("Error processing file: ", (e as Error).message);
  }
};

// Function to update package.json scripts
const updatePackageScripts = (targetDirectory: string) => {
  const packageJsonPath = path.resolve(targetDirectory, "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const scripts = packageJson.scripts;
    scripts.dev = "pages dev";
    scripts.prod = "pages prod";
    scripts["build:local"] = "pages build";
    packageJson.scripts = scripts;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("package.json scripts updated.");
  } catch (e) {
    console.error("Error updating package.json: ", (e as Error).message);
  }
};

// Function to install dependencies
const installDependencies = async (
  targetDirectory: string,
  ciJsonPath: string
) => {
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

// Function to update package.json engines
const NODE_ENGINES = "^18.0.0 || >=20.0.0";
const updatePackageEngines = (targetDirectory: string) => {
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
    console.error("Error updating package.json: ", (e as Error).message);
  }
};

/**
 * Install packages, recursively process imports (excluding .git and node_modules directories),
 * and update package.json scripts in the specified directory
 * @param projectStructure
 */
export const updatePages = async (projectStructure: ProjectStructure) => {
  const rootPath = path.resolve("");
  await updatePackageDependencies(rootPath);
  processDirectoryRecursively(
    path.resolve(projectStructure.config.rootFolders.source)
  );
  updatePackageScripts(rootPath);
  updatePackageEngines(rootPath);
  await installDependencies(
    rootPath,
    path.resolve(
      projectStructure.getSitesConfigPath().getAbsolutePath(),
      projectStructure.config.sitesConfigFiles.ci
    )
  );
};
