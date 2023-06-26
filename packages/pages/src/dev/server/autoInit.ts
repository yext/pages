import fs from "fs";
import YAML from "yaml";
import { spawn } from "child_process";
import { createInterface } from "readline";
import colors from "picocolors";

export const autoYextInit = async () => {
  if (!fs.existsSync(".yextrc")) {
    try {
      const businessId = await askForBusinessId();
      const universe = await askForUniverse();
      await runCommand("yext", ["init", businessId, "-u", universe])
        .then((output) => console.log(output))
        .catch((error: Error) => {
          console.log(error.message);
          process.exit(1);
        });
      fs.writeFileSync(
        ".yextrc",
        `businessId: ${businessId}\nuniverse: ${universe}`
      );
    } catch (error) {
      logErrorAndExit(error);
    }
  } else {
    try {
      const { businessId, universe } = parseYextrcContents();
      await runCommand("yext", ["init", businessId, "-u", universe])
        .then((output) => console.log(output))
        .catch((error: Error) => {
          console.log(error.message);
          process.exit(1);
        });
    } catch (error) {
      logErrorAndExit(error);
    }
  }
};

const logErrorAndExit = (error: string | any) => {
  console.error(colors.red("ERROR: ") + error);
  process.exit(1);
};

const parseYextrcContents = () => {
  const yextrcContents: string = fs.readFileSync(".yextrc", "utf8");
  const parsedContents = YAML.parse(yextrcContents);
  const businessId: string = parsedContents.businessId;
  const universe: string = parsedContents.universe;
  if (isNaN(Number(businessId)))
    logErrorAndExit(
      "Invalid businessId format in .yextrc file. Please enter a valid businessId"
    );
  if (universe != "sandbox" && universe != "production")
    logErrorAndExit(
      "Invalide universe in .yextrc file. Please enter a valid universe (sandbox or production)"
    );
  return { businessId, universe };
};

const runCommand = (command: string, args: string[]) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args);

    let output = "";

    childProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    childProcess.on("close", (code) => {
      code === 0 ? resolve(output) : reject(new Error(output));
    });
  });
};

const askForBusinessId = async (): Promise<string> => {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    readline.question(`Enter your BusinessId: `, (userInput: string) => {
      if (isNaN(Number(userInput))) {
        console.error(colors.red("BusinessId must be a number"));
        readline.close();
        resolve(askForBusinessId());
      }
      readline.close();
      resolve(userInput);
    });
  });
};

const askForUniverse = async (): Promise<string> => {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    readline.question(
      `Enter a universe (sandbox or production): `,
      (userInput: string) => {
        userInput = userInput.toLowerCase();
        const validUniverses = ["sandbox", "production", "sbx", "prod"];
        if (!validUniverses.includes(userInput)) {
          console.error(colors.red("Invalid universe choice"));
          readline.close();
          resolve(askForUniverse());
        }
        readline.close();
        if (userInput == "sbx") userInput = "sandbox";
        if (userInput == "prod") userInput = "production";
        resolve(userInput);
      }
    );
  });
};
