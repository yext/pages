import path from "node:path";
import fs from "node:fs";
import * as child_process from "node:child_process";

// Gets the path to the packaged version of PagesJS
const latestPath = path.resolve("latest");
const packagePath = path.resolve(
  "latest",
  fs.readdirSync(latestPath.toString())[0]
);

// Iterate through sdks, install local pages package, and run playwright
const sdks = fs.readdirSync(path.resolve(`../../jstest/sdks`));
sdks.forEach((sdk) => {
  console.log(`Testing ${sdk}..`);
  const cwd = {
    cwd: path.resolve(`../../jstest/sdks/${sdk}`),
  };
  console.log(`npm install @yext/pages ${packagePath}`);
  console.log(child_process.execSync("npm -v && node -v"));
  child_process.execSync(`npm ci`, cwd);
  child_process.execSync(`npm install @yext/pages ${packagePath}`, cwd);
  child_process.execSync("npm run playwright", cwd);
});
