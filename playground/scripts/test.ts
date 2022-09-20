import { spawn } from "child_process";

const playgrounds = ["react"];

playgrounds.forEach((playground) => {
  spawn(`cd ${playground} && pnpm i && npx playwright test`, {
    stdio: ["inherit", "inherit", "inherit"],
    shell: true,
  });
});
