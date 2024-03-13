import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import prompts, { PromptObject } from "prompts";
import {
  indexCssCode,
  moduleCode,
  postcssCode,
  tailwindCode,
} from "./templates.js";
import {
  installDependencies,
  updatePackageDependency,
} from "../../upgrade/pagesUpdater.js";
import { logErrorAndExit } from "../../util/logError.js";

/**
 * generateModule asks questions via stdout and generates files based on
 * the responses. Also, installs necessary dependencies.
 * SIGINT is handled such that any generated files are removed.
 */
export const generateModule = async (): Promise<void> => {
  const questions: PromptObject[] = [
    {
      type: "text",
      name: "moduleName",
      message: "What would you like to name your Module?",
      validate: (moduleName) => validateModuleName(moduleName),
    },
    {
      type: "confirm",
      name: "useTailwind",
      message: "Would you like to use Tailwind CSS?",
      initial: true,
    },
  ];
  const response = await prompts(questions);

  const modulePath = path.join("src", "modules", response.moduleName);

  // Handle interruption signal (Ctrl+C)
  process.on("SIGINT", handleCancel);

  fs.mkdirSync(modulePath, { recursive: true });
  fs.writeFileSync(
    path.join(modulePath, `${response.moduleName}.tsx`),
    moduleCode(response.moduleName, response.useTailwind)
  );
  fs.writeFileSync(
    path.join(modulePath, "index.css"),
    indexCssCode(response.useTailwind)
  );
  if (response.useTailwind) {
    fs.writeFileSync(
      path.join(modulePath, "tailwind.config.ts"),
      tailwindCode()
    );
    fs.writeFileSync(path.join(modulePath, "postcss.config.js"), postcssCode());
  }

  try {
    await getDependencies();
  } catch (error) {
    logErrorAndExit(error);
  }

  process.removeListener("SIGINT", handleCancel);
  console.log(
    `\nModule "${response.moduleName}" created successfully at ${modulePath}`
  );
};

// Ensures moduleName isn't used already in a modulePath and the name starts with
// an alphabetic character
const validateModuleName = (moduleName: string): boolean => {
  const modulePath = path.join("src", "modules", moduleName);
  if (fs.existsSync(modulePath)) {
    return false;
  }
  return /^[a-zA-Z]+$/.test(moduleName.charAt(0));
};

function handleCancel(moduleName: string) {
  const modulePath = path.join("src", "modules", moduleName);
  if (fs.existsSync(modulePath)) {
    const moduleFiles = glob.sync("**/*", { cwd: modulePath, nodir: true });
    moduleFiles.forEach((file) => {
      const filePath = path.join(modulePath, file);
      fs.unlinkSync(filePath);
    });
    fs.rmdirSync(modulePath);
  }

  const modulesPath = path.join("src", "modules");
  if (fs.readdirSync(modulesPath).length === 0) {
    fs.rmdirSync(modulesPath);
  }
  process.exit(0);
}

const getDependencies = async () => {
  await updatePackageDependency("@yext/pages-components", null, true);
  await updatePackageDependency("tailwindcss", null, true);
  await installDependencies();
};
