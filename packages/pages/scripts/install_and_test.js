import path from "path";
import fs from "fs";

const latestPath = path.resolve("latest");
const packagePath = path.resolve(
  latestPath,
  fs.readdirSync(latestPath.toString())[0]
);

console.log(packagePath);
