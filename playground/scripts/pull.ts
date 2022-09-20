import prompts from "prompts";
import { exec } from "child_process";

export const starters = [
  "https://github.com/yext/pages-starter-react-locations",
];

const { starter }: { starter: string } = await prompts({
  type: "select",
  name: "starter",
  message: "Select starter",
  choices: starters.map((i) => ({ value: i, title: i })),
});
if (!starter) {
  process.exit();
}

const starterFolder = starter.split("/").pop();
exec(`git clone ${starter}.git ${starterFolder}`);

const { npm } = await prompts({
  type: "select",
  name: "npm",
  message: "npm install?",
  choices: [
    { title: "Yes", value: "YES" },
    { title: "No", value: "NO" },
  ],
});
if (npm && npm == "YES") {
  exec(`cd ${starterFolder} && pnpm i`);
}
