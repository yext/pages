import fs from "fs";
import { spawn } from "child_process";
import prompts from "prompts";
import chalk from "chalk";
import { parseYextrcContents } from "../../util/yextrcContents.js";
import { logErrorAndExit } from "../../util/logError.js";
import checkInstalled from "../../util/checkInstalled.js";

export const autoYextInit = async (scope: string | undefined) => {
  if (!fs.existsSync(".yextrc")) {
    fs.writeFileSync(".yextrc", "");
  }
  await autoYextInitWithYextrc(scope);
};

const autoYextInitWithYextrc = async (scope: string | undefined) => {
  const { accountId, universe } = parseYextrcContents(scope);
  if (accountId === undefined || universe === undefined) {
    await autoYextInitUpdateYextrc(scope);
  } else {
    await runCommand("yext", ["init", accountId, "-u", universe])
      .then((output) => console.log(output))
      .catch((error: Error) => {
        console.log(error.message);
        process.exit(1);
      });
  }
};

// Add new yext account to .yextrc
const autoYextInitUpdateYextrc = async (scope: string | undefined) => {
  try {
    console.log(
      `\n\n*******************************************************
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
    if (scope) {
      fs.appendFileSync(
        ".yextrc",
        `"${scope}":\n` +
          `  accountId: ${accountId}\n` +
          `  universe: ${universe}\n\n`
      );
    } else {
      fs.appendFileSync(
        ".yextrc",
        `accountId: ${accountId}\n` + `universe: ${universe}\n\n`
      );
    }
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

const runCommand = (command: string, args: string[]) => {
  checkInstalled(command);
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
  console.log(
    `
What is your Yext Account ID?
(e.g. \`yext.com/s/` +
      chalk.bold(`<ACCOUNT_ID>`) +
      `/home\`)
  `
  );
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
