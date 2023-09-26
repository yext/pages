import fs from "fs";
import path from "path";
import { ProjectStructure } from "../common/src/project/structure.js";
import latestVersion from "latest-version";

const pagesImportRegex = /"@yext\/pages\/components"/g;
const replacementText = '"@yext/sites-components"';

// Function to install npm packages
const installPackages = async (targetDirectory: string) => {
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
    const modifiedContent = fileContent.replace(
      pagesImportRegex,
      replacementText
    );
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
    packageJson.scripts = {
      dev: "pages dev",
      prod: "pages prod",
      "build:local": "pages build",
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("package.json scripts updated.");
  } catch (e) {
    console.error("Error updating package.json: ", (e as Error).message);
  }
};

/**
 * @param projectStructure the structure of the project
 * Install packages, recursively process imports (excluding .git and node_modules directories),
 * and update package.json scripts in the specified directory
 */
export const updatePages = async (projectStructure: ProjectStructure) => {
  const rootPath = path.resolve("");
  await installPackages(rootPath);
  processDirectoryRecursively(
    path.resolve(projectStructure.config.rootFolders.source)
  );
  updatePackageScripts(rootPath);
};
