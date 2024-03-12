import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
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
  // Ensure user input starts with a letter
  let moduleName = await query(
    "\n? What would you like to name your Module? ",
    (input: string) => /^[a-zA-Z]/.test(input)
  );
  while (moduleExists(moduleName)) {
    console.error(
      `Error: Module "${moduleName}" already exists or is invalid.`
    );
    moduleName = await query("Please enter a different name for your Module: ");
  }

  // Ensure user input is yes, no, y, or n (ignores capitalization)
  const useTailwind: string = await query(
    "\n? Would you like to use Tailwind CSS? (Yes / No) ",
    (input: string) => /^(yes|no|y|n)$/.test(input)
  );
  const isUsingTailwind: boolean = useTailwind === "yes" || useTailwind === "y";

  const modulePath = path.join("src", "modules", moduleName);

  // Handle interruption signal (Ctrl+C)
  process.on("SIGINT", handleCancel);

  fs.mkdirSync(modulePath, { recursive: true });
  fs.writeFileSync(
    path.join(modulePath, `${moduleName}.tsx`),
    moduleCode(moduleName, isUsingTailwind)
  );
  fs.writeFileSync(
    path.join(modulePath, "index.css"),
    indexCssCode(isUsingTailwind)
  );
  if (isUsingTailwind) {
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
  console.log(`\nModule "${moduleName}" created successfully at ${modulePath}`);
};

const query = (question: string, validateInput: any = null): any => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    stdin.once("data", (data) => {
      const input = data.toString().trim().toLowerCase();
      if (validateInput && !validateInput(input)) {
        stdout.write("Please enter a valid input.\n");
        resolve(query(question, validateInput));
      } else {
        resolve(input);
      }
    });
  });
};

const moduleExists = (moduleName: string) => {
  const modulePath = path.join("src", "modules", moduleName);
  return fs.existsSync(modulePath);
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
