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
      await runCommand("yext", ["init", businessId, "-u", universe]).then(
        (output) => console.log(output)
      );
      fs.writeFileSync(
        ".yextrc",
        `businessId: ${businessId}\nuniverse: ${universe}`
      );
    } catch (error) {
      console.error(
        "Incorrect credentials. Please enter a valid businessId and universe option"
      );
      process.exit(1);
    }
  } else {
    try {
      const yextrcContents: string = fs.readFileSync(".yextrc", "utf8");
      const parsedContents = YAML.parse(yextrcContents);
      const businessId: string = parsedContents.businessId;
      const universe: string = parsedContents.universe;
      await runCommand("yext", ["init", businessId, "-u", universe]).then(
        (output) => console.log(output)
      );
    } catch (error) {
      console.error(
        "Could not parse .yextrc file properly. Please make sure it is formatted correctly with a valid businessId and universe."
      );
      process.exit(1);
    }
  }
};

const runCommand = (command: string, args: string[]) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args);

    let output = "";

    childProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    childProcess.on("close", (code) => {
      code === 0 ? resolve(output) : reject();
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
        if (userInput !== "sandbox" && userInput !== "production") {
          console.log(colors.red("Invalid universe choice"));
          readline.close();
          resolve(askForUniverse());
        }
        readline.close();
        resolve(userInput);
      }
    );
  });
};
