import path from "path";
import fs from "fs";
import * as child_process from "child_process";

// Gets the path to the packaged version of PagesJS
const latestPath = path.resolve("latest");
const packagePath = path.resolve(
  "latest",
  fs.readdirSync(latestPath.toString())[0]
);

// Iterate through sdks, install local pages package, and run playwright
const sdks = fs.readdirSync(`../../jstest/sdks`);
sdks.forEach((sdk) => {
  console.log(`Testing ${sdk}..`);
  const cwd = {
    cwd: `../../jstest/sdks/${sdk}`,
  };
  child_process.execSync(`npm install @yext/pages ${packagePath}`, cwd);
  child_process.execSync(`npm install`, cwd);
  child_process.execSync("npm run playwright", cwd);
});
