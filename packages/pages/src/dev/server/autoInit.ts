import fs from "fs";
import YAML from "yaml";
import { spawn } from "child_process";
import colors from "picocolors";
import prompts from "prompts";

export const autoYextInit = async () => {
  if (!fs.existsSync(".yextrc")) {
    await autoYextInitWithoutYextrc();
  } else {
    await autoYextInitWithYextrc();
  }
};

const autoYextInitWithYextrc = async () => {
  try {
    const { accountId, universe } = parseYextrcContents();
    await runCommand("yext", ["init", accountId, "-u", universe])
      .then((output) => console.log(output))
      .catch((error: Error) => {
        console.log(error.message);
        process.exit(1);
      });
  } catch (error) {
    logErrorAndExit(error);
  }
};

const autoYextInitWithoutYextrc = async () => {
  try {
    console.log(
      `*******************************************************
Welcome to Yext Pages!
Let's connect to your Yext Account
*******************************************************`
    );
    const accountId = await askForAccountId();
    const universe = await askForUniverse();
    await runCommand("yext", ["init", accountId, "-u", universe])
      .then((output) => console.log(output))
      .catch((error: Error) => {
        console.log(error.message);
        process.exit(1);
      });
    fs.writeFileSync(
      ".yextrc",
      `accountId: ${accountId}\nuniverse: ${universe}`
    );
    console.log(
      `*******************************************************
Congrats! You've successfully connected to your Yext Account.
You'll be automatically logged in upon running the dev server with \`npm run dev\`.
To change your account details, modify the \`.yextrc\` at the root of your project. 
*******************************************************`
    );
  } catch (error) {
    logErrorAndExit(error);
  }
};

const logErrorAndExit = (error: string | any) => {
  console.error(colors.red("ERROR: ") + error);
  process.exit(1);
};

const validUniverses = ["sandbox", "production", "sbx", "prod", "qa", "dev"];

export const parseYextrcContents = () => {
  const yextrcContents: string = fs.readFileSync(".yextrc", "utf8");
  const parsedContents = YAML.parse(yextrcContents);
  const accountId: string = parsedContents.accountId;
  const universe: string = parsedContents.universe;
  if (isNaN(Number(accountId))) {
    logErrorAndExit("Invalid Account ID format in .yextrc file.");
  }
  if (!validUniverses.includes(universe)) {
    logErrorAndExit("Invalid Universe in .yextrc file.");
  }
  return { accountId, universe };
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

const askForAccountId = async (): Promise<string> => {
  console.log(`
What is your Yext Account ID?

Your Account ID is found in the URL of your Yext Account, e.g. \`yext.com/s/<ACCOUNT_ID>/home\`
  `);
  const response = await prompts({
    type: "number",
    name: "accountId",
    message: "Yext Account ID:\n",
  });

  return response.accountId;
};

const askForUniverse = async (): Promise<string> => {
  console.log("\nWhat is the universe of your Yext Account?\n");

  const response = await prompts({
    type: "select",
    name: "universe",
    message: "Yext Universe:",
    choices: [
      {
        title: "Production (Account URL looks like: `yext.com`)",
        value: "production",
      },
      {
        title: "Sandbox (Account URL looks like: `sandbox.yext.com`)",
        value: "sandbox",
      },
    ],
    initial: 1,
  });

  return response.universe;
};
